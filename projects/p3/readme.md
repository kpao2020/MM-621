# Basket Buddy

Basket Buddy is a mobile-first p5.js prototype for planning one simple meal and checking its ingredients against a saved Open Prices catalog for a fixed 50-mile radius around Hayward, California.

## Current status

The D1-backed flow is deployed and has returned a live meal response. The saved snapshot reported 24,757 indexed products and 38,568 price observations, retrieved at 2026-11-10 03:24 UTC. A sample request confirmed that D1 candidates and recorded prices are returned. Its selected prices were 100–289 days old, so the Worker correctly marked them as older.

The FTS5 search-index optimization is implemented in the repository but is not yet live. Run the D1 refresh workflow to create/backfill the index, then deploy the updated Worker.

## How it works

1. Workers AI turns a request into one concise grocery list, aiming for 12 or fewer items with a hard limit of 16.
2. Workers AI adds up to four close catalog phrases for each ingredient.
3. The Worker searches D1's FTS5 index and passes up to eight saved candidates per ingredient to Workers AI.
4. The model can select only returned candidate IDs. It can choose a practical substitute only for an ingredient marked replaceable.
5. The Worker validates each selection and reads its price, store, and date from D1. Meal requests do not make product-by-product Open Prices requests.

For each product, the Worker chooses the lowest valid USD observation from the past 30 days. If there are no recent observations, it returns the newest older observation and labels its age. A recorded price is not proof of current shelf price or stock.

## Data refresh

GitHub Actions checks one regional latest-record ID every 24 hours. If it has not changed and D1 is ready, the full catalog is not downloaded. A changed ID, an unready catalog, or the weekly Sunday reconciliation triggers a regional download and D1 refresh. The workflow stores its download in temporary runner storage; the persistent catalog is D1.

See [DATA-PIPELINE.md](DATA-PIPELINE.md) for setup, refresh, and verification steps. The local JSON/GZIP analysis downloads are ignored by Git and are not required to run the app.

## Privacy and secrets

Meal requests are sent to Workers AI for planning and candidate selection; they are not saved as user history by Basket Buddy. The app uses a fixed search area and does not request browser location or infer a location from IP.

This repository is public. API credentials and the Turnstile secret must stay in Cloudflare or GitHub Actions secret settings. The Worker URL and Turnstile site key in config.js are public client configuration. The D1 database ID and rate-limit namespace ID are resource identifiers, not credentials.

## Limitations

Open Prices is community-contributed and is not food-only. Product names, package sizes, stores, and dates can be missing or inconsistent. The catalog can return old records; the freshness label describes the observation date and does not verify availability. Package sizes are shown as reported and are not normalized for value comparisons.

## Run locally

1. Serve the repository root on port 5500 with VS Code Live Server or python3 -m http.server 5500.
2. Open http://localhost:5500/projects/p3/. The production Turnstile configuration accepts the published GitHub Pages hostname, so a live meal submission should be tested on the published app.
3. For local Worker development, run npx wrangler dev --port 8787 from projects/p3/worker and temporarily point workerUrl in config.js at the local Worker. Restore the production URL before publishing.

Deploy the Worker with npx wrangler deploy from projects/p3/worker after Wrangler authentication. Never add credentials to the repository.

## Files

- index.html, style.css, sketch.js: mobile app shell, visual style, p5.js illustration, and interactions.
- api.js, results.js: Worker request handling and result rendering.
- config.js: public Worker URL and Turnstile site key.
- worker/src: D1 search, meal planning, candidate validation, and price selection.
- worker/migrations: D1 schema and FTS5 search index.
- tools/refresh_open_prices.py: regional check, conditional bulk download, and D1 import.
- ../../.github/workflows/p3-open-prices-refresh.yml: scheduled and manual refresh.
- DATA-PIPELINE.md: operational setup and refresh instructions.
- requirements.md: behavior and completion criteria.
- PROPOSAL.md: project rationale, research, and plan.
- tracking.md and memory.md: current status and decisions.
- agents.md: project-specific collaboration rules.
- open-prices-hayward-50mi-analysis.md: static analysis of the original regional snapshot.
- open-prices-radius-expansion-analysis-2026-11-10.md: live comparison of recent 50-, 200-, and 300-mile coverage.
