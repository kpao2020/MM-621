# Basket Buddy — Project 3 Proposal

- **Student Designer**: Ken Pao
- **Class**: MM-621 (Interaction Design Studio II)
- **Date**: Nov 8, 2026

- **Project type**: Individual
- **Project concept**: 
    Basket Buddy is a mobile-friendly p5.js web app that helps shoppers plan a simple meal. A user can type a meal request, and AI will suggest a shopping list with up to 10 grocery products. The app will use the Open Prices API to look up available prices and store locations, then display the results in a friendly, easy-to-read format.

    For the meal suggestions, I want the AI to favor familiar grocery items commonly found in the Bay Area. This preference may make the list more practical, but it cannot guarantee that a product is in stock or has a matching price in Open Prices. Because Open Prices is a community-contributed dataset, I will show the observation date and source with each price. If no matching record is found, the app will display “Price unavailable.” [Open Prices data guide](https://openfoodfacts.github.io/open-prices/guides/data/)

    My goal is to complete a working MVP (minimum viable product) in three weeks. The plan is subject to change based on Week 1 progress.
- **JavaScript libraries**: 
    - P5js: [https://p5js.org/](https://p5js.org/)
- **Tools and technologies**:
    - Cloudflare Workers AI: generates the meal product list.
    - Cloudflare Workers: hosts the backend API endpoint.
    - Open Prices API: provides available product, price, and store data.
    - GitHub and GitHub Pages: source control and project hosting.
    - HTML, CSS, and JavaScript: structure, styling, and application logic.
    - Google Chrome: target browser for development and use.
- **Research and resources**: 
    - I compared Open Prices with retailer feeds, Flipp, MealMe, Algolia, and Google Shopping results offered through SerpApi and OpenWeb Ninja.
    - Retailer feeds may provide current prices, but each retailer has a separate data source. Flipp shows local flyer offers, but I did not find a self-service free API, and its terms restrict scraping and republishing its content. MealMe combines grocery data with ordering, and its published terms restrict reuse in ways that do not fit this public student project.
    - Algolia is a search service that requires a product catalog to be supplied and indexed; it does not provide grocery products or prices. Google does not offer a general public API to search all Google Shopping products and offers; its Merchant API is for businesses to manage their own Merchant Center products and inventory.
    - SerpApi and OpenWeb Ninja are third-party services that return Google Shopping results, not Google APIs. Their free plans have limited request caps (250 searches and 100 API requests per month, respectively). SerpApi's free plan excludes its U.S. Legal Shield, while OpenWeb Ninja's reuse license applies only to rights it holds and leaves users responsible for rights and terms from original sources. A city-level search can help localize results, but does not verify a nearby store's inventory or shelf price.
    - I selected Open Prices because it has public read endpoints that do not require an API key, supports product and price lookups with store locations and observation dates, and allows a bounded search around Hayward. Its Open Database License (ODbL) gives me a clear reuse path with the required attribution and license terms. In my feasibility check, I found records for all three sample ingredients, but some observations were old and one looked questionable. I will show each observation date and source, describe the data as community-reported, and show “Price unavailable” when no matching record is found rather than presenting these results as guaranteed current shelf prices.
    - [p5.js reference](https://p5js.org/reference/)
    - [Open Prices data guide](https://openfoodfacts.github.io/open-prices/guides/data/)
    - [Open Prices API documentation](https://prices.openfoodfacts.org/api/docs)
    - [Open Database License (ODbL) v1.0](https://opendatacommons.org/licenses/odbl/1-0/)
    - [Flipp FAQ](https://corp.flipp.com/faq/) and [terms of use](https://corp.flipp.com/terms-of-use/)
    - [MealMe API and SDK terms](https://www.mealme.ai/privacy)
    - [Algolia pricing](https://www.algolia.com/pricing)
    - [Google Merchant API overview](https://developers.google.com/merchant/api/overview)
    - [SerpApi Google Shopping results](https://serpapi.com/shopping-results), [pricing](https://serpapi.com/pricing), and [legal terms](https://serpapi.com/legal)
    - [OpenWeb Ninja product search](https://www.openwebninja.com/api/real-time-product-search) and [terms of use](https://www.openwebninja.com/terms)

- *Disclaimer*: This project idea originated with and is owned by Ken Pao. AI assisted with the research and writing of this proposal.

## Three-Week Plan

### Week 1 — Check the Data and Prepare the Project

**Work**

- Choose an example meal request and a phone/browser for the final demo.
- Check a limited Open Prices response for an ingredient in the example meal within 50 miles of Hayward. Inspect the available records for product, price, currency, store, and observation date, and confirm which price-unit and product-size fields are available or missing.
- Choose an AI provider after reviewing its free-tier limits and token reporting. Prepare Cloudflare settings and enter any required secret directly.
- Sketch a simple mobile layout.

**Deliverables**

- A documented example request, target browser, and selected AI provider.
- At least one inspected Open Prices record that matches an ingredient in the example meal, is within 50 miles of Hayward, and has usable price, store, and date information. If the data is not available, document the blocker before Week 2; the price feature will remain incomplete until it is resolved.
- A note showing which price-unit and product-size fields are available in the inspected data.
- A mobile layout sketch.

### Week 2 — Connect the Main Flow

**Work**

- Build the Cloudflare Worker and connect one AI call for the meal list.
- Add targeted Open Prices lookups for the generated products within 50 miles of Hayward.
- Connect the text input to a basic p5.js results view.
- Review the Week 1 unit and size data and decide whether unit conversion or unit-price comparisons fit the MVP, including how to handle different or missing units.
- Sort returned prices and calculate the estimated total from the lowest available returned price for each product.
- Handle missing prices, invalid responses, and service errors. Keep AI-generated text separate from price and store data.

**Deliverables**

- A typed meal request that runs through the Worker and displays no more than 10 products.
- Up to three real Open Prices records for each matched product, or “Price unavailable” when no record is found.
- An estimated total that includes only available prices, with a clear note about missing prices.
- A decision on unit conversion and price comparisons based on the Week 1 data.
- Clear AI and API error messages, with no secrets exposed in the browser or repository.

### Week 3 — Finish and Deliver

**Work**

- Finish the mobile layout, footer, formatted JSON view, and Open Prices credit.
- Publish the page on GitHub Pages and deploy the Worker.
- Check the example request, a missing-price case, a service-error case, and the layout on the selected phone/browser.
- Check that the estimated total excludes products with unavailable prices.
- Fix the most important issues and prepare a short limitations note for the final presentation.

**Deliverables**

- A hosted page and Worker that complete the typed meal request.
- A readable results view with no more than 10 products and three price records per product.
- An estimated total with the note “Based on the lowest returned price for each available item. Items without prices are not included.”
- A footer with the timestamp, checked JSON link, and token usage when reported, plus the separate Open Prices credit and disclaimer.
- A final demo using a real example and a short note about data coverage and unresolved limitations.

---

## Interaction Design

1. The user types and submits a request for one simple meal.
2. The app makes one AI call to generate a short shopping list with no more than 10 unique products.
3. The app checks Open Prices for those products. It will not download the full dataset or make another AI call to analyze prices.
4. The results show each product with up to three matching price records, sorted from lowest to highest among the returned records in the same currency. Each record includes the price, currency, store location, observation date, and source. The price unit and product size will also be shown when available. How to compare different or missing units will be decided in Week 2 after reviewing the Week 1 data.
5. The app adds the lowest available returned price for each product to calculate an **Estimated total**. A note will say “Based on the lowest returned price for each available item. Items without prices are not included.” Prices in different currencies will not be combined. If no prices are available, the total will be marked unavailable.
6. If a price is missing, the app displays “Price unavailable.” If the AI or data service fails, it displays a clear error message.
7. p5.js will present the results with a playful, eye-friendly design that fits a phone screen. I plan to avoid gridlines and dense tables.
8. Similar to Project 2, a footer will show the latest data request or update timestamp and a link to the checked data in formatted JSON. It will also show session input and output token usage when the AI provider reports it; otherwise, usage will be marked unavailable.

Note: I want to track and monitor AI token usage during each session.

The app will also display a separate one-line credit and disclaimer:

> Contains information from [Open Prices (Open Food Facts)](https://prices.openfoodfacts.org/), made available under the [Open Database License (ODbL) v1.0](https://opendatacommons.org/licenses/odbl/1-0/); prices are community-reported and may be incomplete or outdated.

## Store Location

I will use Hayward, California, as the center point for finding stores. Project 2 already uses Hayward's coordinates (37.6688, -122.0808). The app will search within a 50-mile radius, approximately 80.47 km; Open Prices accepts coordinates and a radius in kilometers for location and price searches. [Nearby locations API](https://openfoodfacts.github.io/documentation/docs/Open-prices/locations/locations_nearby_list/), [prices API](https://openfoodfacts.github.io/documentation/docs/Open-prices/prices/prices_list/)

A 50-mile circle around Hayward can include stores outside the Bay Area. The app will label the search area as within 50 miles of Hayward and show each store's recorded location. Results are not based on the user's location and may be far from the user. The app will use a limited set of API results, so the estimated total is based on returned records and does not claim to find the lowest prices across every store.

## Technical Plan

- `index.html` and `style.css` will provide the page and responsive controls.
- `sketch.js` will remain the main p5.js file for the page, application state, and interactions.
- Separate component files will handle the Worker request, data handling, and results display. I will keep the files focused and use the clear headers and explanatory comments in each JavaScript file.
- A Cloudflare Worker will handle the AI request and targeted Open Prices lookups. I selected Cloudflare Workers AI after reviewing its free-tier limits and token reporting.
- Cloudflare Turnstile and a request limit will help reduce automated abuse without requiring a user account.
- I will enter any required secrets directly in Cloudflare settings. Secret values must not be placed in the public repository, local files, browser code, logs, or Git history.

### Privacy and data handling

Basket Buddy will not require a user profile or save meal requests for later. The meal request is sent to Cloudflare Workers AI for processing. Cloudflare states that Workers AI does not retain request content after processing or use it to train AI models. The app sends the generated product names to Open Prices to look up price records. The interface will include this short note: “Meal requests aren't saved or used to train AI.” [Cloudflare Workers AI data usage](https://developers.cloudflare.com/workers-ai/platform/data-usage/)


## Risks and Delivery

Open Prices may not have a price record for every product or store, and an older record may differ from the current shelf price. AI-generated product names may also need to be matched to records in the API. Prices may come from different stores or package sizes, so the total is an estimate based on the returned records.

The goal is to have the basic flow working in Week 2 and finish by the end of Week 3. Provider setup, free-tier limits, service availability, and data coverage still need to be checked. If any of these blocks the main flow, I will record the issue and review it before changing the plan. 

## Future Features

- Voice input and microphone speech recognition.
- Search for a single product.
- Use browser location to prioritize nearby stores.
- AI-generated substitutes when a user requests them.
- Retailer ordering and home delivery with the shopper's approval.
- Price-drop monitoring and alerts.
- Additional regions and stores.

### Developer notes
- I will use the p5.js setup and responsive canvas from Project 2 - Spooky weather as a reference. As in my other projects, `sketch.js` will remain the main entry point, with focused helper files and comments to make the code easier to maintain and troubleshoot.
