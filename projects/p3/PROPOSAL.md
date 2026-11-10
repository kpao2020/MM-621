# Basket Buddy — Project 3 Proposal

- Student designer: Ken Pao
- Course: MM-621, Interaction Design Studio II
- Proposal date: November 9, 2026

---

## Project type

- Individual class experiment

## Project Concept

Basket Buddy is an AI-powered, mobile-first p5.js prototype that turns a short meal request into one manageable grocery list. It searches community-reported product and price observations saved from Open Prices within a fixed 50-mile radius of Hayward, California.

The goal is to reduce products marked unavailable by searching a saved catalog before the model finalizes matches. The app asks the model to keep a list to 12 or fewer items and enforces a limit of 16. It displays actual catalog products and recorded prices, not guaranteed store inventory.

## JavaScript libraries
- p5.js 2.3.3 (local copy at lib/p5.min.js): used for the basket illustration and p5 sketch.
- Cloudflare Turnstile JavaScript API: loaded from Cloudflare to verify meal requests; its served version is managed by Cloudflare.


## Research

Open Prices is the selected source because its public API supplies location-linked community observations that can be searched around Hayward. The initial 50-mile import populated D1 with 24,757 indexed products and 38,568 price observations. Coverage is uneven: product names and package information can be missing, and many records are old. The interface therefore shows each observation date and labels older prices. An observation means a price was reported; it does not establish a current shelf price or inventory.

Instacart’s Developer Platform was researched as a possible future shopping handoff. Its shopping-list endpoint can create a page where a shopper selects a store, reviews matched products, and checks out. It is not the local pre-handoff price feed needed for Basket Buddy’s own matching and comparison. Instacart’s Catalog APIs are aimed at retailers managing their own storefront catalogs and location inventory. Instacart is documented as research only; this project does not use or integrate it as a price source.

Other explored options include retailer weekly ads and APIs, Flipp, MealMe, Algolia, Google Shopping results through third-party services, Kroger, and Walmart Marketplace. These either cover separate retailers, promotional offers, seller catalogs, or search results that do not provide the project with one reusable local grocery-price catalog. Algolia is a search/indexing service and would still require a product dataset. The source comparison informed this prototype; the cited service details reflect the research conducted for this class project and are not a claim that those services are interchangeable.

## Resources References

- [p5.js reference](https://p5js.org/reference/)
- [Open Prices API documentation](https://prices.openfoodfacts.org/api/docs)
- [Open Prices data guide](https://openfoodfacts.github.io/open-prices/guides/data/)
- [Open Database License v1.0](https://opendatacommons.org/licenses/odbl/1-0/)
- [Instacart shopping-list API](https://docs.instacart.com/developer_platform_api/api/products/create_shopping_list_page)
- [Instacart Catalog API overview](https://docs.instacart.com/catalog/catalog_api/overview/)
- [Kroger public APIs](https://www.postman.com/kroger/the-kroger-co-s-public-workspace/collection/ki6utqb/kroger-public-apis)
- [Kroger partner APIs](https://www.postman.com/kroger/the-kroger-co-s-public-workspace/documentation/nryx3kn/kroger-partner-apis)
- [Walmart Marketplace item search](https://developer.walmart.com/global-marketplace/reference/getsearchresult)
- [Flipp FAQ](https://corp.flipp.com/faq/) and [terms](https://corp.flipp.com/terms-of-use/)
- [MealMe terms and privacy](https://www.mealme.ai/privacy)
- [Algolia pricing](https://www.algolia.com/pricing)
- [Google Merchant API overview](https://developers.google.com/merchant/api/overview)
- [SerpApi Shopping results](https://serpapi.com/shopping-results) and [terms](https://serpapi.com/legal)
- [OpenWeb Ninja product search](https://www.openwebninja.com/api/real-time-product-search) and [terms](https://www.openwebninja.com/terms)


## Three-week plan and status

### Week 1 — Data feasibility and project setup — complete

- Inspected bounded Open Prices results around Hayward.
- Compared the available product, store, price, unit, and date fields.
- Reviewed alternative price sources and selected Open Prices for the prototype.
- Established the mobile interaction and privacy boundaries.

### Week 2 — Saved catalog and matching flow — complete

- Created the D1 schema and imported the 50-mile regional catalog.
- Built a conditional daily refresh and weekly reconciliation.
- Connected AI ingredient planning, D1 candidate retrieval, candidate validation, and deterministic price selection.
- Enforced the ingredient cap and replaceable-only substitution rule.
- Deployed the Worker and confirmed a live meal response with D1 catalog metadata and price evidence.

### Week 3 — Mobile polish and demonstration — in progress

- Refine the interface into a narrow, centered mobile app shell.
- Review the published page after the visual update is synced to the GitHub Pages branch.
- Demonstrate a normal match and an older-price fallback, and describe the catalog’s coverage limits.

## Success criteria

- A simple meal request produces a concise list capped at 16 ingredients.
- Every displayed product is a candidate returned from D1 and every price fact comes from its saved observation.
- A substitute is used only for a replaceable ingredient; otherwise the app shows “Price unavailable.”
- Recent prices are selected by the 30-day rule, and older prices are visibly labeled.
- The UI states that reported prices do not confirm current inventory and provides Open Prices attribution.
- The app is usable on a phone-width screen.

---

## Technology

- p5.js, HTML, CSS, and JavaScript for a compact, mobile app-style interface.
- Cloudflare Workers for the API and Cloudflare Workers AI for meal planning and candidate selection.
- Cloudflare D1 for the saved regional product catalog and price evidence.
- Open Prices API for source observations.
- GitHub Actions for a daily update check and weekly reconciliation.
- GitHub Pages for the public prototype.


## Interaction and system flow

1. The shopper types a request for one simple meal.
2. Workers AI drafts ingredients and up to four close catalog phrases per ingredient.
3. The Worker searches product text in D1 and retrieves up to eight candidates per ingredient.
4. Workers AI selects only an ID from that ingredient’s candidates. It may choose a practical substitute only when the ingredient is marked replaceable.
5. Worker code validates each selected ID and reads price evidence from D1.
6. The app shows one selected price per matched ingredient. It prefers the lowest USD observation from the past 30 days; if none are recent, it shows the newest older observation with its age. Missing matches remain “Price unavailable.”

The model does not create product IDs, prices, stores, or dates. A meal request does not call the Open Prices API product by product. The daily refresh checks one regional latest-record ID and downloads all pages only when needed; a weekly full reconciliation catches edits to older records.

## Privacy, licensing, and limits

Basket Buddy does not create shopper accounts or save meal requests as history. The search location is fixed to Hayward; the app does not request browser location or infer a location from IP. Turnstile and a per-IP request limit reduce automated abuse.

The public repository must contain no API credentials or Turnstile secret. Those values belong in Cloudflare or GitHub Actions secret settings. The Worker URL, Turnstile site key, and D1 resource identifiers are public configuration or identifiers, not secret values.

Open Prices is community-contributed. The app preserves source and date information and includes attribution to Open Prices and the Open Database License (ODbL) v1.0. Product matching can only find records in the saved catalog; it cannot create missing prices or verify current availability. Package sizes and units are shown as reported, not normalized for value comparisons. These limitations make the project an experiment in search and interaction design, not a commercial ordering or inventory service.

## Developer note
- This project concept is original and owned by Ken Pao. AI assisted with research and drafting proposal.
- As an experiment, even for a simple task, I found many limitation and how generally available data to users are not available for developers use.
- Using AI to develop an AI-powered app with p5js is both fun and frustrated experience. The fun part is about speed and ability to build more complex features with less headache. The frustrated part is AI-generated bugs that cause extra time and effort to debug, and then find out this is completely not needed and end up deleting that block of code.

## Credits

- Product and price observations: [Open Prices (Open Food Facts)](https://prices.openfoodfacts.org/), used with attribution under the [Open Database License (ODbL) v1.0](https://opendatacommons.org/licenses/odbl/1-0/).
- Basket illustration: original drawing created in sketch.js with p5.js; no external illustration asset is used.
