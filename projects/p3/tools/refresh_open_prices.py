#!/usr/bin/env python3
"""Check one regional marker; bulk-refresh Open Prices into the project's D1 database."""

import concurrent.futures
import gzip
import json
import math
import os
import sys
import time
import tomllib
from collections import defaultdict
from datetime import datetime, timezone
from pathlib import Path
from urllib.error import HTTPError, URLError
from urllib.parse import urlencode
from urllib.request import Request, urlopen


API = "https://prices.openfoodfacts.org/api/v1/prices"
CLOUDFLARE_API = "https://api.cloudflare.com/client/v4"
CENTER = {"lat": 37.6688, "lon": -122.0808}
RADIUS_KM = 80.4672
PAGE_SIZE = 100
INSERT_ROWS = 20
SQL_BATCH_SIZE = 20
USER_AGENT = "BasketBuddy-P3/0.1 (Open Prices student prototype)"
WORKER_DIR = Path(__file__).resolve().parents[1] / "worker"


def request_json(url, headers, body=None):
    for attempt in range(4):
        try:
            request = Request(url, headers=headers, data=body)
            with urlopen(request, timeout=60) as response:
                return json.loads(response.read())
        except (HTTPError, URLError, TimeoutError) as error:
            if attempt == 3:
                raise RuntimeError(f"Request failed: {error}") from error
            time.sleep(2 ** attempt)


def open_prices(params):
    return request_json(
        f"{API}?{urlencode(params)}",
        {"Accept": "application/json", "User-Agent": USER_AGENT},
    )


def common_params():
    return {**CENTER, "radius_km": RADIUS_KM}


def latest_marker():
    response = open_prices({**common_params(), "size": 1, "order_by": "-id"})
    items = response.get("items", [])
    if not items:
        raise RuntimeError("Open Prices returned no regional records; refusing to replace the saved database.")
    return {"latestPriceId": max(int(item["id"]) for item in items), "total": response.get("total")}


def get_page(page):
    response = open_prices({**common_params(), "size": PAGE_SIZE, "page": page})
    return response.get("items", [])


def download_snapshot(first_page, expected_latest_id):
    pages = int(first_page.get("pages") or 1)
    items = list(first_page.get("items", []))
    if pages > 1:
        with concurrent.futures.ThreadPoolExecutor(max_workers=4) as executor:
            futures = [executor.submit(get_page, page) for page in range(2, pages + 1)]
            for future in concurrent.futures.as_completed(futures):
                items.extend(future.result())
    expected = int(first_page.get("total") or len(items))
    ids = {int(item["id"]) for item in items if item.get("id") is not None}
    if len(items) != expected or len(ids) != expected:
        raise RuntimeError(f"Regional download was incomplete or duplicated ({len(ids)} unique IDs; expected {expected}).")
    if latest_marker()["latestPriceId"] != expected_latest_id:
        raise RuntimeError("Open Prices changed during the regional download; refusing to import a mixed snapshot.")
    return {
        "query": {
            "center": CENTER,
            "radius_km": RADIUS_KM,
            "radius_miles": 50,
            "retrieved_at": datetime.now(timezone.utc).isoformat().replace("+00:00", "Z"),
        },
        "items": items,
    }


def get_database_config():
    required = ["CLOUDFLARE_ACCOUNT_ID", "CLOUDFLARE_API_TOKEN"]
    missing = [key for key in required if not os.environ.get(key)]
    if missing:
        raise RuntimeError("Missing required environment variables: " + ", ".join(missing))
    config_path = WORKER_DIR / "wrangler.toml"
    with config_path.open("rb") as source:
        config = tomllib.load(source)
    databases = config.get("d1_databases", [])
    if not databases or not databases[0].get("database_id"):
        raise RuntimeError("wrangler.toml must define the PRODUCT_DB D1 database binding.")
    return os.environ["CLOUDFLARE_ACCOUNT_ID"], databases[0]["database_id"], os.environ["CLOUDFLARE_API_TOKEN"]


def d1_query(sql, account_id, database_id, token):
    url = f"{CLOUDFLARE_API}/accounts/{account_id}/d1/database/{database_id}/query"
    payload = json.dumps({"sql": sql}).encode("utf-8")
    response = request_json(url, {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json",
        "Accept": "application/json",
    }, payload)
    if response.get("success") is not True:
        detail = "; ".join(error.get("message", "D1 request failed") for error in response.get("errors", []))
        raise RuntimeError(f"D1 query failed: {detail or 'Cloudflare returned an unsuccessful response.'}")
    results = response.get("result", [])
    for result in results:
        if result.get("success") is False:
            detail = "; ".join(error.get("message", "D1 statement failed") for error in result.get("errors", []))
            raise RuntimeError(f"D1 statement failed: {detail or 'Cloudflare returned an unsuccessful statement.'}")
    return results


def load_schema(account_id, database_id, token):
    migration_dir = WORKER_DIR / "migrations"
    for schema_path in sorted(migration_dir.glob("*.sql")):
        d1_query(schema_path.read_text(encoding="utf-8"), account_id, database_id, token)

    results = d1_query(
        "SELECT index_version FROM catalog_search_meta WHERE id = 1",
        account_id, database_id, token,
    )
    rows = results[0].get("results", []) if results else []
    index_version = int(rows[0].get("index_version", 0)) if rows else 0
    if index_version < 1:
        d1_query(
            "INSERT INTO products_fts(products_fts) VALUES ('rebuild'); "
            "UPDATE catalog_search_meta SET index_version = 1 WHERE id = 1",
            account_id, database_id, token,
        )


def read_state(account_id, database_id, token):
    results = d1_query(
        "SELECT latest_price_id, is_ready, "
        "COALESCE((SELECT index_version FROM catalog_search_meta WHERE id = 1), 0) AS search_index_version "
        "FROM catalog_meta WHERE id = 1",
        account_id, database_id, token,
    )
    rows = results[0].get("results", []) if results else []
    return rows[0] if rows else None


def clean(value):
    return " ".join(str(value or "").replace("\n", " ").split())


def sql_value(value):
    if value is None:
        return "NULL"
    if isinstance(value, bool):
        return "1" if value else "0"
    if isinstance(value, (int, float)):
        if not math.isfinite(value):
            return "NULL"
        return repr(value)
    return "'" + str(value).replace("'", "''") + "'"


def snapshot_rows(snapshot):
    products = {}
    observations_by_product = defaultdict(list)
    stores_by_product = defaultdict(set)
    for row in snapshot.get("items", []):
        product_id = row.get("product_id")
        source_product = row.get("product")
        product = source_product if isinstance(source_product, dict) else {}
        if row.get("type") != "PRODUCT" or not product_id:
            continue
        name = clean(product.get("product_name") or row.get("product_name"))
        if not name:
            continue
        key = int(product_id)
        previous_product = products.get(key)
        if not previous_product or (not clean(previous_product.get("product_name")) and name):
            products[key] = {**product, "_basket_name": name}
        if row.get("duplicate_of") is not None or not isinstance(row.get("price"), (int, float)):
            continue
        location = row.get("location") or {}
        proof = row.get("proof") or {}
        store = clean(location.get("osm_name")) or "Store name unavailable"
        stores_by_product[key].add(store)
        observations_by_product[key].append({
            "priceId": int(row["id"]),
            "price": row.get("price"),
            "currency": row.get("currency") or "",
            "date": row.get("date") or "",
            "pricePer": row.get("price_per"),
            "discounted": row.get("price_is_discounted"),
            "regularPrice": row.get("price_without_discount"),
            "productCode": row.get("product_code") or product.get("code"),
            "store": store,
            "city": clean(location.get("osm_address_city")) or None,
            "address": clean(location.get("osm_display_name")) or None,
            "proofType": proof.get("type") if isinstance(proof, dict) else None,
            "source": clean(row.get("source") or (proof.get("source") if isinstance(proof, dict) else "")) or None,
        })

    product_rows = []
    price_count = 0
    for product_id, product in products.items():
        observations = observations_by_product[product_id]
        if not observations:
            continue
        observations.sort(key=lambda item: (item.get("date") or "", item.get("priceId") or 0), reverse=True)
        price_count += len(observations)
        categories = [clean(tag.removeprefix("en:").replace("-", " ")) for tag in product.get("categories_tags", [])]
        stores = sorted(stores_by_product[product_id])
        quantity = clean(product.get("quantity"))
        if not quantity and product.get("product_quantity"):
            quantity = clean(f"{product['product_quantity']} {product.get('product_quantity_unit') or ''}")
        name = clean(product.get("product_name") or product.get("_basket_name"))
        brand = clean(product.get("brands"))
        search_text = clean(" ".join([name, brand, quantity, *categories, *stores])).lower()
        product_rows.append((
            product_id,
            name,
            brand or None,
            quantity or None,
            clean(product.get("code")) or None,
            json.dumps(categories, ensure_ascii=False, separators=(",", ":")),
            json.dumps(stores, ensure_ascii=False, separators=(",", ":")),
            json.dumps(observations, ensure_ascii=False, separators=(",", ":")),
            search_text,
        ))
    return product_rows, price_count


def insert_statements(table, columns, rows):
    statements = []
    prefix = f"INSERT OR REPLACE INTO {table} ({', '.join(columns)}) VALUES "
    values = []
    for row in rows:
        value = "(" + ", ".join(sql_value(item) for item in row) + ")"
        candidate = prefix + ", ".join([*values, value])
        if values and (len(values) >= INSERT_ROWS or len(candidate.encode("utf-8")) > 80_000):
            statements.append(prefix + ", ".join(values))
            values = [value]
        else:
            values.append(value)
    if values:
        statements.append(prefix + ", ".join(values))
    return statements


def import_snapshot(snapshot, marker, account_id, database_id, token):
    product_rows, price_count = snapshot_rows(snapshot)
    d1_query(
        "INSERT OR REPLACE INTO catalog_meta (id, latest_price_id, retrieved_at, price_rows, product_count, is_ready) "
        "VALUES (1, 0, 'loading', 0, 0, 0); DELETE FROM products",
        account_id, database_id, token,
    )

    products = insert_statements(
        "products",
        ["product_id", "product_name", "brands", "quantity", "code", "categories_json", "stores_json",
         "observations_json", "search_text"],
        product_rows,
    )
    statements = products
    total_batches = (len(statements) + SQL_BATCH_SIZE - 1) // SQL_BATCH_SIZE
    for batch_index, start in enumerate(range(0, len(statements), SQL_BATCH_SIZE), start=1):
        d1_query(";\n".join(statements[start:start + SQL_BATCH_SIZE]), account_id, database_id, token)
        print(json.dumps({"status": "importing", "batch": batch_index, "batches": total_batches}))

    d1_query(
        "INSERT INTO products_fts(products_fts) VALUES ('rebuild'); "
        "UPDATE catalog_search_meta SET index_version = 1 WHERE id = 1",
        account_id, database_id, token,
    )

    retrieved_at = snapshot["query"]["retrieved_at"]
    d1_query(
        "INSERT OR REPLACE INTO catalog_meta (id, latest_price_id, retrieved_at, price_rows, product_count, is_ready) "
        f"VALUES (1, {int(marker['latestPriceId'])}, {sql_value(retrieved_at)}, {price_count}, {len(product_rows)}, 1)",
        account_id, database_id, token,
    )
    return len(product_rows), price_count


def run(output_dir):
    output_dir = Path(output_dir)
    output_dir.mkdir(parents=True, exist_ok=True)
    account_id, database_id, token = get_database_config()
    load_schema(account_id, database_id, token)
    marker = latest_marker()
    previous = read_state(account_id, database_id, token)
    weekly_audit = datetime.now(timezone.utc).weekday() == 6
    force = os.environ.get("P3_FORCE_REFRESH") == "1" or weekly_audit
    if (
        previous
        and int(previous.get("latest_price_id", 0)) == marker["latestPriceId"]
        and previous.get("is_ready") == 1
        and int(previous.get("search_index_version", 0)) >= 1
        and not force
    ):
        print(json.dumps({"status": "unchanged", **marker, "checkedAt": datetime.now(timezone.utc).isoformat()}))
        return

    first_page = open_prices({**common_params(), "size": PAGE_SIZE, "page": 1})
    snapshot = download_snapshot(first_page, marker["latestPriceId"])
    products, prices = import_snapshot(snapshot, marker, account_id, database_id, token)
    (output_dir / "snapshot.json.gz").write_bytes(gzip.compress(json.dumps(snapshot, ensure_ascii=False, separators=(",", ":")).encode("utf-8")))
    print(json.dumps({
        "status": "refreshed",
        "latestPriceId": marker["latestPriceId"],
        "priceRowsImported": prices,
        "productsImported": products,
        "retrievedAt": snapshot["query"]["retrieved_at"],
    }))


if __name__ == "__main__":
    if len(sys.argv) != 2:
        raise SystemExit("Usage: refresh_open_prices.py OUTPUT_DIR")
    run(sys.argv[1])
