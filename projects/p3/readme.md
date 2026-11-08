# Basket Buddy

Basket Buddy is a planned mobile-first p5.js MVP for one simple personalized meal with up to 10 unique grocery products. The shopper's current prompt supplies personalization; the app does not save profiles or ask for a serving count. Results use available Open Prices data from within 100 miles of Hayward, California.

## Current state

Planning only. The existing P3 starter files are present, but the recommendation flow, API calls, Cloudflare Worker, and visual result experience have not been implemented.

## Planned interaction

1. Type and edit a simple meal request. Meal recommendations favor familiar Bay Area grocery items; the AI does not verify local inventory.
2. See matching Open Prices records within 100 miles of Hayward, with price, currency, observation date, source, recorded store location, and price unit and product size when available. Each product shows at most three returned prices.
3. If an item has no suitable match, show “Price unavailable.” Show an “Estimated total” using the lowest available returned price for each product, with the note “Based on the lowest returned price for each available item. Items without prices are not included.”
4. Use the footer to check the update time, inspect checked/pretty JSON, see token use when available, and read the Open Prices / ODbL credit.

## Data and limitations

Open Prices is community-contributed. A record is a reported price with a date, not a guaranteed current shelf price. Coverage may be sparse. The fixed Hayward radius can include stores outside the Bay Area or far from the shopper. Basket Buddy shows the recorded location and currency and does not combine currencies in a total.

Planned visible credit line: “Contains information from [Open Prices (Open Food Facts)](https://prices.openfoodfacts.org/), made available under the [Open Database License (ODbL) v1.0](https://opendatacommons.org/licenses/odbl/1-0/); prices are community-reported and may be incomplete or outdated.”

The current MVP excludes travel-time estimates, IP-based location inference, retailer scraping, accounts, and saved history. See `requirements.md` for the acceptance criteria and scope.

## Future ideas

- Add voice input and microphone speech recognition.
- Add single-product search and browser location for nearby-store prioritization.
- Let the shopper approve AI-assisted retailer ordering and home delivery.
- Offer an optional AI-generated substitute for an item with no price record, then check the suggestion against Open Prices.
- Watch selected products for price drops and send alerts.
- Add search centers beyond the Hayward radius after checking data coverage.

## File guide

- `index.html`, `style.css`, `sketch.js`: current P3 starter files; `sketch.js` remains the primary p5.js entry point.
- `PROPOSAL.md`: project rationale, weekly work plan, deliverables, and metrics.
- `requirements.md`: behavior and completion criteria.
- `tracking.md`: week-by-week status and open decisions.
- `memory.md`: durable project decisions and secret-handling boundary.
- `agents.md`: collaboration and coding instructions for future work.
- `p3.log`: dated, append-only progress notes.

## Secrets

This repository is public. Do not put API keys or secret values in HTML, JavaScript, Markdown, `.env` files, or Git history. The user will create any required Cloudflare secrets directly in Cloudflare settings. No secret values belong in project documentation.

## Next planned step

Confirm one example meal request and recommendation goal, then inspect an Open Prices record that matches one ingredient within 100 miles of Hayward before implementation.
