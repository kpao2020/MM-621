# Basket Buddy — Project Memory

Last updated: 2026-11-08

## Confirmed decisions

- Project name: **Basket Buddy**.
- This is a small p5.js MVP for a class project, planned for about six hours across three weeks.
- MVP supports one simple personalized meal request capped at 10 unique grocery products. Meal preferences are provided in the current prompt; no profile is saved.
- Search within 50 miles of Hayward, California (37.6688, -122.0808; approximately 80.47 km). Results may be outside the Bay Area. Do not restrict results to a fixed store-ID list or verify them against nine-county boundaries.
- AI call budget: one call for a meal request to generate its product list. No AI call analyzes price results.
- Meal-generation prompt should favor familiar, commonly stocked Bay Area grocery items. This is a heuristic, not a guarantee of Open Prices records or actual store inventory; check products against Open Prices.
- Missing products show “Price unavailable.” Substitute suggestions and their follow-up AI call are outside the first MVP and belong in the future-feature backlog.
- Show each AI-returned ingredient in a compact row, with one lowest returned USD amount and expandable store, date, size, and record details. Returned prices may have different units or package sizes and do not establish the best value or lowest price across all stores.
- Show the price unit and product size when the source provides them.
- Label the total “Estimated total” and add one returned amount per available item only when the recorded amounts are per package or unit. Mark the total unavailable when any selected amount is per weight or volume because the needed quantity is unknown. Missing items are excluded; note that sizes vary.
- Current price searches request USD only; never add amounts across currencies if this changes.
- Do not add a serving-count feature to the MVP.
- Include a one-line Open Prices attribution/disclaimer in the app footer, linked to Open Prices and ODbL 1.0.
- `sketch.js` remains the primary p5.js entry point; focused components belong in separate JS files.
- Use text input for the MVP. Voice and microphone input are future features.
- Do not request browser location in the MVP. Clearly show the recorded store location and label results as within 50 miles of Hayward, not nearby to the user.
- Do not infer location from IP in this MVP.
- Removed travel-time estimates and routing from scope.
- Visual direction: friendly, playful, eye-friendly, mobile-first, and no chart gridlines or game framing.
- Footer follows P2's one-line convention: last update timestamp, link to checked/pretty-printed API JSON, and session token usage if the AI provider reports it.
- Secrets are not stored in the repository or local files. The user will set Cloudflare secrets themselves.
- For local frontend preview, use VS Code Live Server; user has it running on port 5500. Avoid suggesting Python's static server unless asked.
- Use Cloudflare Workers AI for the one meal-list request; the current model is `@cf/meta/llama-3.3-70b-instruct-fp8-fast` through the Worker `AI` binding.
- Cloudflare's current Workers AI allowance is 10,000 Neurons per day on Workers Free. On Free, requests stop after the allowance; on Workers Paid, usage above it is billed. Local Wrangler development still sends AI inference to Cloudflare and uses account quota. Recheck pricing before launch because it can change.
- Open Prices is the selected grocery-price source after comparing retailer feeds, Flipp, MealMe, Algolia, Google Shopping access, SerpApi, and OpenWeb Ninja. Use its bounded public read endpoints and ODbL reuse path; present price records as community-reported observations with dates and sources, since coverage can be sparse or old.
- Keep Open Prices as the current source choice. SerpApi can return geographically targeted Google Shopping results, but it is a paid search-scraping service after its limited free tier and does not establish exact store inventory. Kroger's public product API can return location-specific prices but only for Kroger-family stores; its Acceptable Use rules appear to rule out comparing its prices with other retailers, which conflicts with Basket Buddy's comparison goal. Do not switch providers without a user decision.

## Data and response constraints

- Open Prices price and store records are community-contributed; show the observation date and source, and do not describe them as verified live shelf prices.
- Price searches use the fixed Hayward center and radius. Records may be far from the user and may use another currency; show currency and do not combine totals across currencies.
- Keep at most one displayed price record per ingredient (up to 10 records at the 10-product cap).
- Enforce API page/result limits and never download the full dataset during a user request.
- Keep AI output compact and structured; AI must not invent prices, dates, currencies, or store locations.

## Decisions still open

- Whether to calculate normalized prices for value comparisons, and how to handle prices with different or missing units. Inspect unit and product-size fields in Week 1, then make the decision with the user in Week 2; no conversion approach has been approved.
- Final AI-generated example meal request and the one personalization detail to support. The API feasibility sample is a peanut butter sandwich with white bread and a bowl of strawberries; it is not the final AI prompt.
- Final demo phone/browser. Chrome is confirmed as the target browser for the API feasibility sample.
- Confirm the final API page-size cap after checking real data coverage.

## Future ideas (not MVP commitments)

- Voice input and microphone speech recognition.
- Direct single-product search and browser location / nearby-store prioritization.
- Optional shopper-triggered AI substitute suggestions for products without price records, followed by a targeted Open Prices lookup.
- Shopper-approved retailer ordering and home delivery.
- Price-drop watchlists and alerts.
- Additional search centers and regions beyond the Hayward radius after checking data coverage.
- Whether to add a manual city/ZIP fallback later; it is not in the current MVP.

## Secret handling

Never place secret values here. Keep only non-sensitive setup notes, such as the Cloudflare dashboard location where the user will add a secret.

## 2026-11-08 — Raw beef data check

- User means raw beef suitable for stew, never ground beef or canned stew.
- A clean Open Prices check found one local category-price observation for `en:beef-steaks` at Trader Joe's in Mountain View: $46.28/kg dated 2025-10-11, within 25 and 50 miles of Hayward; none at 5 miles. This is not a verified stew cut.
- Exact tested category tags for beef steaks/roasts/cuts/stew meat and local product-linked beef filters produced no confirmed raw stew-cut price at 5/25/50 miles. Wider product filters surface ground, processed, or packaged items. Global catalog results show beef-related prices exist, but this doesn't establish local raw-cut coverage.
- The Worker now searches barcode-linked product prices and selected category-price tags. It recognizes broad beef and chicken names, excludes several processed-meat matches, and labels the beef-steak category as a broader beef match rather than a verified stew cut. Matching is heuristic and needs continued review.
- The full query results and caveats are saved in `p3.log` under “Raw beef / stew-cut Open Prices verification.”

### Broader raw meat search

- User clarified that ordinary raw beef or steak that can be cut at home is a useful broader candidate for a stew ingredient. Preserve the source's actual product/category name and do not claim that an unspecified steak is a verified stew cut.
- On 2026-11-08 the five-mile Open Prices query returned 283 observations from two Castro Valley locations; scanning all three pages did not identify raw beef or raw chicken by name/category. A further scan for chuck, diced beef, ribeye, tri-tip, sirloin, brisket, and other cut names also found none. Every record had a price-level name, catalog name, or category tag, although names may be abbreviated or incomplete.
- At 25 miles category-price results included the beef-steak observation above, plus chicken drumsticks, thighs, and whole chickens at Costco, Trader Joe's, Whole Foods, and Walmart. Safeway had chicken breast and thigh product-price records with unspecified package quantity. These are historical observations and not live inventory. Detailed prices, IDs, and dates are in `p3.log` under “Broader beef and chicken checks at 5 and 25 miles.”
- Search all stores with matching Open Prices observations; do not use a store allowlist. Consider a short list of raw-meat synonyms and category tags while rejecting processed food. These checks did not change the configured 100-mile app radius.

## 2026-11-08 — Search/display changes and Pepesto review

- Implemented bounded product discovery and selected category-price lookups in `worker/src/search.js`, including beef/chicken matching guards and a labeled broader beef-steak result. Searches remain fixed at 100 miles, restricted to USD and bounded to one page; the lowest numeric returned amount can have a different unit or size than other records and is not a verified lowest price across stores.
- The page now displays one record per ingredient in expandable compact rows, offers New meal, labels model tokens, and avoids an estimated total whenever a selected observation is priced per weight or volume. A local Worker request returned ten beef-stew ingredients and the $46.28/kg broader beef-steak observation; matching and rendering fixtures passed. Chrome/mobile visual review remains open because the Browser plugin could not connect to Chrome.
- Pepesto's API documentation lists European supermarkets only, not Hayward or US stores. It has no free tier; the Starter pack is €29.90, and its API reference lists manual-shopping-list `/products` calls at €0.32. Its API terms permit displayed product data inside an app but make the customer responsible for retailer terms and downstream rights. Open Prices remains selected for Hayward; no Pepesto call or purchase was made.
- User decided not to pursue Pepesto. Continue with Open Prices. User subsequently authorized deployment; current deployment status is recorded below.

## 2026-11-08 — 50-mile search and deployment

- User authorized deployment and changed the Hayward radius to 50 miles (80.4672 km). Improved local chicken-breast discovery using bounded locally tagged poultry prices and normalized `uncooked white rice` to a white-rice product search; exclude cooked/seasoned/rice flour and obvious salt/pepper mismatches.
- Cloudflare Worker deployed at `https://basket-buddy-api.xoakuma.workers.dev`; `config.js` uses that public URL. A production chicken-and-rice request returned HTTP 200, radius 50 miles, chicken tenderloins and white rice observations from 2025. GitHub Pages publishes from `main`; Basket Buddy is on `ken` and needs a pull request merged to `main`. Automatic pull-request creation was rejected by the user; do not retry or bypass it. Do not include `worker/.wrangler/` in Git.

## AI Search idea and deployment clarification

- User asked about building a local 50-mile Open Prices index for Cloudflare AI Search, as a possible way to match product-name variants. This is a research idea, not an approved implementation. Current product search is bounded to one catalog page and a limited candidate set, so a locally indexed candidate search could improve recall; semantic similarity is not a guarantee of a correct match and cannot create missing or current prices.
- On 2026-11-08 the 50-mile API count was 42,342 price observations, not unique products or current live stock. Open Prices publishes separate daily gzipped JSONL exports, and its paginated API can also extract geographically filtered observations. Cloudflare AI Search accepts `.json` files up to 10 MiB, while `.jsonl.gz` is not listed as a supported JSON format; conversion/chunking needs validation. Preserve record IDs, dates, units, location and attribution, and refresh the snapshot.
- AI Search pricing page says billing begins 2026-12-01 with monthly included usage of 5M ingestion tokens, 10 GB-month storage, 1,000 semantic queries and 1,000 full-text queries; generation/query rewriting can be billed separately. An official release-note page lists 2026-11-01 instead, so verify billing in the user's dashboard before setup. This is distinct from the Workers AI 10,000 Neurons/day allowance.
- Worker security: HTTPS and CORS are present, but `validateOrigin` permits missing Origin headers, which means scripts can call the deployed public endpoint without authentication or per-user rate limiting. Calls consume the user's Workers AI quota. No app database stores meals; standard Workers AI processing is subject to Cloudflare's data policy, while operational metadata/errors may be retained or logged. Browser access to the public Worker URL does not grant Cloudflare account access.
- User asked how to stop services; no stop request was authorized. Cloudflare dashboard can disable the Worker `workers.dev` route; preview/version URLs are separate. Stopping local Wrangler is not enough. Unpublishing GitHub Pages affects the whole MM-621 Pages site, including other projects.

## 2026-11-08 — Public Worker protection and snapshot storage

- User wants the current Worker protected from abuse without sign-in and selected Turnstile plus request-rate limiting. The existing widget's secret was securely validated and stored in Cloudflare, and the protected Worker was deployed. A live request without a verification token returned 403. The matching frontend still needs to be published and then tested with a real token. Turnstile and the limiter reduce abuse; they do not authenticate visitors or provide a strict global spending cap.
- A 50-mile Open Prices snapshot could be prepared from the geographic API results or by joining and filtering the daily exports. On 2026-11-08 HEAD requests showed global compressed price and product exports of roughly 22.8 MB and 20.3 MB, respectively; those figures are global, compressed, and time-varying, not the size of the filtered local data. No export, storage service, AI Search instance, or paid service has been created.
- A small sample can live in GitHub, but a large frequently refreshed snapshot is better in object storage or an AI Search instance's built-in storage; preserve source IDs, observation dates, prices/units, location, ODbL attribution, and a refresh method. AI Search can retrieve product candidates; use structured data or Open Prices records to enforce location, category, unit, and accurate source facts. Semantic similarity can mismatch and cannot make sparse or old source data current.
- Cloudflare's user-supplied existing-widget flow required explicit approval before secret retrieval or writing. User approved the executable, manifest, and guarded retrieval/storage. Widget hostname and secret were validated; secret `TURNSTILE_SECRET_KEY` exists only in the Worker's Cloudflare secret store. Never print the secret or write it into the project or a temporary file.
