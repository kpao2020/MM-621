# Basket Buddy — Project Tracker

Last updated: 2026-11-07

## Overall status

**Planning.** The MVP scope and three-week proposal have been updated. No implementation or API integration has started.

## Decisions recorded

- [x] Project name: Basket Buddy.
- [x] Use text input for the MVP; move voice and microphone input to future features.
- [x] No travel-time feature.
- [x] Use a fixed 100-mile radius centered on Hayward; results can include stores outside the Bay Area. No browser location or fixed store-ID list in the MVP.
- [x] Display at most three returned price records per product, sorted from lowest to highest within the same currency.
- [x] Calculate an estimated total using the lowest available returned price per product; omit unavailable items and label the total accordingly.
- [x] Use one AI call for meal-list generation; exclude direct product search, substitution suggestions, and follow-up AI calls from the MVP.
- [x] Ask meal-generation AI to favor familiar Bay Area grocery items; verify products and prices through Open Prices.
- [x] Include a one-line Open Prices / ODbL attribution and data-quality disclaimer.
- [x] Do not infer location from IP.
- [x] Use a friendly, mobile-first p5.js display with no gridlines.
- [x] Keep `sketch.js` as primary main JS; split components into their own JS files.
- [x] Keep secrets only in Cloudflare, entered by the user.
- [x] Create proposal, requirements, README, agent notes, memory, tracker, and progress log.

## Week 1 — Data and interaction feasibility (planned, not started)

- [ ] Confirm example request, recommendation objective, item count, and target browser.
- [x] Limit MVP to one simple meal request capped at 10 unique grocery products; no serving-count control.
- [ ] Check an Open Prices record matching an ingredient from the example meal within 100 miles of Hayward, including price, unit, product size, currency, store, and date fields; record which unit and size fields are available.
- [ ] Verify the Hayward-centered 100-mile radius and bounded price query against a live API response.
- [ ] Decide how to present separate same-currency totals if mixed currencies are returned.
- [ ] Choose an AI provider and confirm current free-tier/token reporting limits.

## Week 2 — Worker and API path (planned, not started)

- [ ] Review Week 1 unit and size data with the user, then decide whether unit conversions or unit-price comparisons fit the MVP and how to handle missing or different units.
- [ ] Build a Cloudflare Worker endpoint without secret values in source.
- [ ] User adds any required secrets directly in Cloudflare settings.
- [ ] Return a schema-limited AI recommendation with a strict item/output cap.
- [ ] Implement one-call meal list generation and show a no-match state without substitute suggestions.
- [ ] Sort returned prices and calculate the lowest-available-price estimate, excluding unavailable items and keeping currencies separate.
- [ ] Fetch only bounded Open Prices location/price records.
- [ ] Validate compact response and preserve source fields separately from AI text.
- [ ] Provide a checked, pretty JSON view of the bounded data used.

## Week 3 — p5.js visual and troubleshooting (planned, not started)

- [ ] Build component files and keep `sketch.js` as main entry point.
- [ ] Render friendly item/price cards or tags without chart gridlines.
- [ ] Add one-line timestamp + API JSON link + reported session token use footer.
- [ ] Handle no matches, API errors, and small-screen layout.
- [ ] Record limitations for final presentation.

## Open choices

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
