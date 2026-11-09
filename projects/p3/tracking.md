# Basket Buddy — Project Tracker

Last updated: 2026-11-08

## Overall status

**Deployment in progress.** The production Worker is deployed and a chicken-and-rice request returned matches within 50 miles. The frontend was pushed to `ken`; GitHub Pages publishes from `main`. The user declined automatic pull-request creation, so a manual pull request and merge remain open, as does Chrome/phone visual verification.

## Decisions recorded

- [x] Project name: Basket Buddy.
- [x] Use text input for the MVP; move voice and microphone input to future features.
- [x] No travel-time feature.
- [x] Use a fixed 50-mile radius centered on Hayward; results can include stores outside the Bay Area. No browser location or fixed store-ID list in the MVP.
- [x] Display one lowest returned USD amount per ingredient with compact expandable details, noting that sizes and units can differ.
- [x] Calculate a partial estimated total for returned package/unit amounts; show it unavailable when a selected price is per weight or volume and the required amount is unknown.
- [x] Use one AI call for meal-list generation; exclude direct product search, substitution suggestions, and follow-up AI calls from the MVP.
- [x] Ask meal-generation AI to favor familiar Bay Area grocery items; verify products and prices through Open Prices.
- [x] Include a one-line Open Prices / ODbL attribution and data-quality disclaimer.
- [x] Do not infer location from IP.
- [x] Use a friendly, mobile-first p5.js display with no gridlines.
- [x] Keep `sketch.js` as primary main JS; split components into their own JS files.
- [x] Keep secrets only in Cloudflare, entered by the user.
- [x] Create proposal, requirements, README, agent notes, memory, tracker, and progress log.
- [x] Select Cloudflare Workers AI for the meal-list call.
- [x] Add a local Cloudflare Worker endpoint with request validation, JSON schema output, a 10-product cap, token-usage fields, and configured-origin CORS.
- [x] Keep Open Prices as the selected data source and apply the two-stage product-discovery then radius-bounded price-search approach.

## Week 1 — Data and interaction feasibility

- [x] Confirm an API feasibility sample: peanut butter sandwich with white bread and a bowl of strawberries; target browser: Chrome. This is a manual sample, not an AI-generated meal request.
- [x] Limit MVP to one simple meal request capped at 10 unique grocery products; no serving-count control.
- [x] Check Open Prices records for matching peanut butter, white bread, and strawberries within 100 miles of Hayward, including price, unit, product size, currency, store, date, and source fields; record which unit and size fields are available.
- [x] Verify the Hayward-centered 100-mile radius and bounded price query against live API responses.
- [x] Compare singular vs. plural strawberry product searches and try a Hayward city lookup without a radius; record the coverage and matching tradeoffs in `p3.log`.
- [ ] Confirm the AI-generated example request and recommendation goal for the final demo.
- [x] Restrict the current Hayward price searches to USD; never combine currencies in totals.
- [x] Choose Cloudflare Workers AI and review current model and token reporting documentation.
- [x] Compare grocery price/search data options and document why Open Prices fits the MVP and its data freshness limitations in the proposal.
- [x] Add a concise tools and technologies list to the proposal, separate from JavaScript libraries.

Provider research and provider selection are complete. The Worker uses `@cf/meta/llama-3.3-70b-instruct-fp8-fast`; deployment and verification remain open.

## Week 2 — Worker and API path (in progress)

- [ ] Review Week 1 unit and size data with the user, then decide whether unit conversions or unit-price comparisons fit the MVP and how to handle missing or different units.
- [x] Build a local Cloudflare Worker endpoint without secret values in source; deployment and verification remain open.
- [x] No separate model API key is needed; the Worker uses Cloudflare's `AI` binding. Cloudflare account setup and deployment remain open.
- [x] Return a schema-limited AI recommendation with a strict item/output cap.
- [x] Implement one-call meal list generation and a no-match state without substitute suggestions.
- [x] Sort returned prices and calculate lowest-price estimates, with totals kept separate by currency.
- [x] Fetch only bounded Open Prices product and price records around Hayward.
- [x] Add category-price records, selected ingredient names and filters, broader beef labeling, and no-match/error handling. Search coverage and matches remain limited by the source data and heuristics.
- [x] Return compact price, product, store, date, and source fields separately from AI text.
- [x] Provide a pretty JSON view of the bounded response.

## Week 3 — p5.js visual and troubleshooting (local UI implemented; verification open)

- [x] Build component files and keep `sketch.js` as main entry point.
- [x] Render friendly item/price cards without chart gridlines.
- [x] Add timestamp, bounded JSON view, and reported session token use footer.
- [x] Handle no matches, API errors, and small-screen layout in code.
- [x] Implement compact result rows, expandable details, and a New meal button. Manual Chrome and mobile visual verification remain open.
- [ ] Deploy Worker, connect GitHub Pages, and verify behavior in Chrome and a phone-sized viewport.
- [ ] Record limitations for final presentation.

## Open choices

The API sample and target browser are confirmed for feasibility work. The final AI-generated demo request remains open but does not block implementation. Unit normalization is outside the implementation so far.

See `memory.md`. Do not resolve open choices by assumption when they affect API behavior, cost, privacy, or the project scope.

## Future backlog (not MVP)

- Voice input and microphone speech recognition.
- Direct single-product search and browser location / nearby-store prioritization.
- Optional shopper-triggered AI substitute suggestions for missing products, followed by targeted Open Prices lookups.
- Retailer ordering and home delivery, with explicit shopper approval.
- Price-drop watchlists and alerts.
- Expand supported search centers beyond the Hayward radius.

## Progress log

Append a dated, concise entry to `p3.log` whenever a meaningful project step is completed.
