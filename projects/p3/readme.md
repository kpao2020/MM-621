# Basket Buddy

Basket Buddy is a mobile-first p5.js MVP for one simple personalized meal with up to 10 unique grocery products. The shopper's current prompt supplies personalization; the app does not save profiles or ask for a serving count. Results use available Open Prices data from within 50 miles of Hayward, California.

## Current state

The app and deployed Cloudflare Worker use one AI meal-list call, bounded product searches, and selected category-price searches within 50 miles of Hayward. The Worker requires a Turnstile verification token and applies an approximate per-IP rate limit. A production Worker check returned recorded chicken and rice matches before protection was enabled. GitHub Pages publication and real-browser verification remain open.

## Planned interaction

1. Type and edit a simple meal request. Meal recommendations favor familiar Bay Area grocery items; the AI does not verify local inventory.
2. See every ingredient in a compact row with one lowest returned USD amount. Expand it to see the recorded product, store, date, size when available, and source record. Different units and sizes are not equivalent value comparisons.
3. If an item has no suitable match, show “Price unavailable.” The estimated total excludes unavailable items and becomes unavailable when a selected price is per weight or volume, because the needed quantity is unknown. Use New meal to clear the results.
4. Use the footer to check the update time, inspect checked/pretty JSON, see token use when available, and read the Open Prices / ODbL credit.

## Data and limitations

Open Prices is community-contributed. A record is a reported price with a date, not a guaranteed current shelf price. Coverage may be sparse. The fixed Hayward radius can include stores outside the Bay Area or far from the shopper. Searches are limited to USD and bounded pages and may miss other records. Ingredient matching is heuristic and broad beef-steak results are labeled accordingly.

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

- `index.html`, `style.css`, `sketch.js`: page structure, visual style, and p5.js app behavior.
- `config.js`: public Worker URL setting; it contains no secret.
- `api.js`, `results.js`: Worker request helper and safe results rendering.
- `worker/src/index.js`, `worker/src/search.js`: one-call AI generation, bounded product/category price searches, and response shaping.
- `PROPOSAL.md`: project rationale, weekly work plan, deliverables, and metrics.
- `requirements.md`: behavior and completion criteria.
- `tracking.md`: week-by-week status and open decisions.
- `memory.md`: durable project decisions and secret-handling boundary.
- `agents.md`: collaboration and coding instructions for future work.
- `p3.log`: dated, append-only progress notes.

## Secrets

This repository is public. Do not put API keys or secret values in HTML, JavaScript, Markdown, `.env` files, or Git history. The Turnstile secret is stored in the Worker's Cloudflare secret store as `TURNSTILE_SECRET_KEY`; the site key in `config.js` is public. No secret values belong in project documentation.

## Run locally

1. Serve the repository root on port 5500 using VS Code Live Server, or run `python3 -m http.server 5500` from the repository root. The page needs the shared `lib/p5.min.js` file.
2. Open `http://localhost:5500/projects/p3/` in Chrome. The page uses the deployed Worker URL in `config.js`, but the production Turnstile widget and Worker only accept the GitHub Pages hostname. Test a real submission on the published GitHub page; local development requires a separately configured test widget and test Worker environment.
3. To develop the Worker locally, run `npx wrangler dev --port 8787` from `projects/p3/worker` and temporarily set `workerUrl` in `config.js` to `http://127.0.0.1:8787`. Workers AI requests in local development still use the Cloudflare account's AI resources. Restore the public Worker URL before publishing; do not use test secrets in production.

To update the deployed Worker, run `npx wrangler deploy` from `projects/p3/worker` after logging in. The public Worker origin is set in `projects/p3/config.js`; confirm the CORS allowlist before publishing the frontend.

## Next planned step

Publish the frontend to GitHub Pages and review it in Chrome at desktop and phone sizes. The Worker uses Cloudflare Workers AI through the `AI` binding and does not need a separate model API key. A production Worker request and focused matching/rendering checks passed; Chrome/mobile visual verification remains open. See [Cloudflare's local development docs](https://developers.cloudflare.com/workers/local-development/) for the AI binding requirements and usage notes.
