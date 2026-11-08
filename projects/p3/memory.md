# Basket Buddy — Project Memory

Last updated: 2026-11-08

## Confirmed decisions

- Project name: **Basket Buddy**.
- This is a small p5.js MVP for a class project, planned for about six hours across three weeks.
- MVP supports one simple personalized meal request capped at 10 unique grocery products. Meal preferences are provided in the current prompt; no profile is saved.
- Search within 100 miles of Hayward, California (37.6688, -122.0808; approximately 161 km). Results may be outside the Bay Area. Do not restrict results to a fixed store-ID list or verify them against nine-county boundaries.
- AI call budget: one call for a meal request to generate its product list. No AI call analyzes price results.
- Meal-generation prompt should favor familiar, commonly stocked Bay Area grocery items. This is a heuristic, not a guarantee of Open Prices records or actual store inventory; check products against Open Prices.
- Missing products show “Price unavailable.” Substitute suggestions and their follow-up AI call are outside the first MVP and belong in the future-feature backlog.
- Display no more than three returned price records per product, sorted from lowest to highest within the same currency. The displayed records do not claim to represent the lowest prices across every store.
- Show the price unit and product size when the source provides them.
- Label the total “Estimated total” and calculate it from the lowest available returned price per product. Show the note “Based on the lowest returned price for each available item. Items without prices are not included.” Do not combine currencies; if no prices are available, mark the total unavailable.
- Do not add a serving-count feature to the MVP.
- Include a one-line Open Prices attribution/disclaimer in the app footer, linked to Open Prices and ODbL 1.0.
- `sketch.js` remains the primary p5.js entry point; focused components belong in separate JS files.
- Use text input for the MVP. Voice and microphone input are future features.
- Do not request browser location in the MVP. Clearly show the recorded store location and label results as within 100 miles of Hayward, not nearby to the user.
- Do not infer location from IP in this MVP.
- Removed travel-time estimates and routing from scope.
- Visual direction: friendly, playful, eye-friendly, mobile-first, and no chart gridlines or game framing.
- Footer follows P2's one-line convention: last update timestamp, link to checked/pretty-printed API JSON, and session token usage if the AI provider reports it.
- Secrets are not stored in the repository or local files. The user will set Cloudflare secrets themselves.
- Use Cloudflare Workers AI for the one meal-list request; the current model is `@cf/meta/llama-3.3-70b-instruct-fp8-fast` through the Worker `AI` binding.
- Open Prices is the selected grocery-price source after comparing retailer feeds, Flipp, MealMe, Algolia, Google Shopping access, SerpApi, and OpenWeb Ninja. Use its bounded public read endpoints and ODbL reuse path; present price records as community-reported observations with dates and sources, since coverage can be sparse or old.

## Data and response constraints

- Open Prices price and store records are community-contributed; show the observation date and source, and do not describe them as verified live shelf prices.
- Price searches use the fixed Hayward center and radius. Records may be far from the user and may use another currency; show currency and do not combine totals across currencies.
- Keep at most three price records per product (up to 30 records at the 10-product cap).
- Enforce API page/result limits and never download the full dataset during a user request.
- Keep AI output compact and structured; AI must not invent prices, dates, currencies, or store locations.

## Decisions still open

- Whether to calculate normalized prices for value comparisons, and how to handle prices with different or missing units. Inspect unit and product-size fields in Week 1, then make the decision with the user in Week 2; no conversion approach has been approved.
- Final AI-generated example meal request and the one personalization detail to support. The API feasibility sample is a peanut butter sandwich with white bread and a bowl of strawberries; it is not the final AI prompt.
- Final demo phone/browser. Chrome is confirmed as the target browser for the API feasibility sample.
- If multiple currencies are returned, decide how to present separate same-currency totals without mixing currencies.
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
