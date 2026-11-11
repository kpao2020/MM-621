# Basket Buddy data pipeline

## Current status

The first regional import completed and the deployed Worker has read the D1 catalog in a live meal request. The last reported snapshot retrieval was 2026-11-10 03:24 UTC (2026-11-09 Pacific): 24,757 indexed products and 38,568 price observations.

The FTS5 search-index migration and query are implemented locally. To activate them, run the D1 refresh workflow first so it creates/backfills the index, then deploy the updated Worker. Until both steps are complete, production still uses the previous search query.

## Meal request flow

1. Workers AI drafts one simple meal, aims for 12 or fewer grocery ingredients, and never returns more than 16.
2. The meal plan includes up to four close catalog phrases for each ingredient.
3. The Worker queries D1's FTS5 inverted index with these phrases, scores only matching products, and retrieves up to eight candidates per ingredient.
4. Workers AI selects only IDs from the candidates for the corresponding ingredient. It may select a practical substitute only when that ingredient is marked replaceable.
5. The Worker validates each ID and returns price evidence saved in D1. Meal requests make no product-by-product Open Prices requests.

The model never supplies price, store, currency, date, or inventory facts. Open Prices observations are community reports and do not confirm current stock.

## Price selection

- Accept valid, positive USD observations with dates.
- If observations within 30 days exist, return the lowest price among those recent records.
- If none are recent, return the newest older observation and its age.
- Preserve package size and price unit as reported; no unit conversion or value comparison is made.

## Daily refresh

The scheduled GitHub Actions workflow runs at 09:17 UTC. It checks the newest price record ID in the fixed 50-mile Hayward area and compares it with the D1 marker.

- If the ID is unchanged, D1 is ready, and the weekly audit is not due, the run ends without downloading the regional snapshot.
- If the ID changed, D1 is not ready, or the Sunday audit is due, the workflow downloads all pages and imports the snapshot in batches.
- D1 remains unavailable while an import is in progress. The ready marker is written only after every batch completes.
- The weekly reconciliation catches corrections to older records that the newest-ID marker cannot reveal.

The latest import recorded 24,757 products and 38,568 price observations. Raw downloads are temporary in Actions and local JSON/GZIP copies are ignored by Git.

## D1 data shape

The products table stores one named catalog product per row, including searchable product text, category/store summaries, and its saved price observations. The products_fts FTS5 virtual table indexes search_text so ingredient searches do not scan every product row. catalog_search_meta tracks the index version. A refresh rebuilds the index after importing products and before marking the catalog ready; the importer also builds it once for an existing catalog when this migration is first applied.

## Credentials

- GitHub Actions uses CLOUDFLARE_ACCOUNT_ID and CLOUDFLARE_API_TOKEN from repository Actions secrets. The token is scoped to the Cloudflare account and D1 read/edit access.
- The Worker uses TURNSTILE_SECRET_KEY from Cloudflare Worker secrets.
- Never put secret values in this repository, commits, examples, screenshots, browser code, or logs.
- The Worker URL and Turnstile site key in config.js are public client configuration. D1 and rate-limit IDs in Wrangler config are not credentials.

## Operations

- First-time schema creation and import: run “Basket Buddy D1 Open Prices refresh” in GitHub Actions. The first run automatically seeds D1; select the “Download and reconcile the full 50-mile snapshot” option for an intentional forced reconciliation.
- Daily runs skip bulk downloads when unchanged. The scheduled Sunday run reconciles all regional records.
- After an import, submit a meal on the published app and expand “View the data used.” A ready catalog response includes catalogSnapshot.ready=true, indexedProducts, priceRows, and retrievedAt.
- To deploy Worker changes, run npx wrangler deploy from projects/p3/worker after Wrangler authentication.
