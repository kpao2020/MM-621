CREATE TABLE IF NOT EXISTS products (
  product_id INTEGER PRIMARY KEY,
  product_name TEXT NOT NULL,
  brands TEXT,
  quantity TEXT,
  code TEXT,
  categories_json TEXT NOT NULL,
  stores_json TEXT NOT NULL,
  observations_json TEXT NOT NULL,
  search_text TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS catalog_meta (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  latest_price_id INTEGER NOT NULL,
  retrieved_at TEXT NOT NULL,
  price_rows INTEGER NOT NULL,
  product_count INTEGER NOT NULL,
  is_ready INTEGER NOT NULL DEFAULT 0
);
