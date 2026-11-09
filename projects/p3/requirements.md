# Basket Buddy — MVP Requirements

Status: implementation in progress; local API flow checked, Chrome/mobile visual verification and public deployment remain open.

## User-facing behavior

1. A shopper can submit one request for a simple personalized meal using editable text. Voice input is a future feature.
2. A meal request returns no more than 10 unique grocery products. Personalization comes from the current request; the MVP has no saved profile or serving-count control. Simplify an overlarge meal request rather than silently omitting products.
3. Use one AI call to generate the ingredient list, then query only those products in Open Prices. Prompt the AI to favor familiar, commonly stocked Bay Area items. Treat this as a preference, not a guarantee of inventory or price-data coverage.
4. If an ingredient has no suitable record, show “Price unavailable.” Do not suggest substitutes in the MVP.
5. Search within 50 miles of Hayward, California (37.6688, -122.0808; approximately 80.47 km). Results may include stores outside the Bay Area; display each store's recorded location and label the search area clearly.
6. Do not request browser location or infer location from IP. Do not filter through a preverified store-ID list or nine-county boundary.
7. Show one lowest returned USD amount per ingredient in a compact expandable row. Explain that units and package sizes may differ; do not claim it is the lowest price across all stores or the best value.
8. Show only prices supported by Open Prices records. Include currency, observation date, source, recorded store location, and the price unit and product size when available. Do not let the model create or alter factual fields.
9. Calculate an “Estimated total” using one returned package/unit amount per available ingredient; note that missing items are excluded and sizes vary. If a selected price is per weight or volume, show the total unavailable because the needed amount is unknown. Do not combine currencies.
10. Present results with friendly, playful mobile-first visuals. Do not use chart gridlines or a dense spreadsheet table.
11. Keep loading, no-match, and API-error states understandable.
12. Display a compact P2-style data/token footer plus a visible one-line Open Prices credit/disclaimer linked to the source and ODbL 1.0.
13. Require a valid, single-use Cloudflare Turnstile verification for meal requests and apply an approximate per-IP request limit without requiring user sign-in. These controls reduce abuse and do not authenticate users.

## Data and response bounds

- Never download the full Open Prices export for an interactive request.
- Use the fixed Hayward center and radius with bounded product, category, and page-size filters for price lookups.
- Request cap: up to 10 unique products; price display cap: one record per ingredient (up to 10 records maximum).
- Keep the pretty JSON view limited to the bounded response used by the UI. Exclude secrets and the shopper's precise coordinates.
- Preserve the source observation date; do not imply that an old community report is a current shelf price.
- Display each store's recorded location and currency, including records outside the Bay Area when they are within the radius.

## Privacy and secrets

- No IP-based location inference in this MVP.
- Do not save precise coordinates or include them in prompts, logs, or the JSON view.
- Never store provider credentials in repository files, browser code, Git history, or these project documents. The user enters secrets directly in Cloudflare settings.

## Explicitly out of scope

- Travel-time or route estimates.
- More than 10 unique products per request in the MVP.
- More than one meal per request in the MVP.
- Retailer ordering, checkout, and home delivery.
- Price-drop monitoring, saved watchlists, and alerts.

## Future ideas (not MVP commitments)

- Voice input and microphone speech recognition.
- Direct single-product search and browser location / nearby-store prioritization.
- AI-assisted retailer ordering and home delivery after explicit shopper approval.
- Price-drop watchlists and alerts.
- Expand to search centers beyond the Hayward radius after checking local Open Prices coverage and currency handling.
- Retailer scraping, checkout, accounts, saved shopping history, continuous listening, or paid provider usage beyond an agreed free tier.
- Optional shopper-triggered AI substitute suggestions for products without price records, followed by a targeted Open Prices lookup.
- A manual city/ZIP geocoding flow unless the user later approves it.

## Completion criteria

- One request can produce a compact AI list, attach matching Open Prices data, and render results in p5.js.
- A meal request uses one AI call. No AI call analyzes prices or suggests substitutes in the MVP.
- A request is capped at 10 unique products, and no ingredient displays more than one price record.
- Results are bounded to the 50-mile Hayward radius and are not described as nearby to the user.
- The estimate excludes missing items and is unavailable when a selected price is per weight or volume; the note explains the limitation.
- The app shows an Open Prices / ODbL attribution line.
- No secret is exposed in browser code or public repository content.
- The interface remains readable on the agreed phone-sized viewport and follows the no-grid visual direction.
