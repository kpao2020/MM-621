# Project 3 Proposal


## Forecast Meal

- Student designer: Ken Pao
- Course: MM-621, Interaction Design Studio II
- Proposal date: November 11, 2026

---


## Project Type

- Individual class experiment
- Lightweight prototype, free to use


## Project Concept

Forecast Meal is a lightweight, mobile-first class experiment that uses today's local weather forecast to generate one healthy meal suggestion. A user chooses one of six Bay Area cities — Hayward, Oakland, San Francisco, San Jose, San Mateo, or Dublin — or explicitly allows the browser to use their current location. The result is one recipe with quantities, simple cooking steps, adjustable servings from one to four, and a per-serving nutrition table with an icon for each category.

Users can choose a dietary preference (vegetarian, vegan, or pescatarian) and can exclude ingredients from the generated recipe. With no exclusions or dietary selection, the app asks for a generally balanced meal containing vegetables, a protein, and a grain or starch. Users can request an AI-suggested substitute for one listed ingredient at a time. Applying a substitute updates its quantity, affected instructions, and nutrition estimates.

The table shows AI-estimated calories, protein, carbohydrates, total fat, fiber, and sodium per serving, informed by USDA FoodData Central reference data. Nutrition values are AI-generated estimates informed by USDA reference data and may be inaccurate; use for reference only.

There are apps that already offer weather-based meal suggestions. This project is a small, no-charge experiment in joining an existing weather-data project to a meal-planning interaction and presenting one recipe with a visual nutrition summary. It does not provide nutrition tracking, a weekly plan, grocery prices, store inventory, or ordering. Its “healthy” default is a simple class-project guideline, not an assessment of a person's medical or nutritional needs.

Forecast Meal is meant to be free for classmates to try. It uses public weather data and free service plans, without paid grocery or price integrations. I hope that classmates will enjoy using this free app.


## JavaScript Libraries

- p5.js 2.3.3 (local copy at lib/p5.min.js) is the JavaScript library; it draws a small, reusable icon for each nutrition category.


## Technology

- p5.js, HTML, CSS, and JavaScript for the mobile interface, nutrition-category icons, nutrition table, and recipe controls.
- The National Weather Service API for today's forecast for supported U.S. coordinates.
- The browser Geolocation API for optional, user-authorized location; manual city selection remains available.
- Cloudflare Workers and Workers AI for the meal-only service, structured generation, and server-side validation.
- Cloudflare Turnstile for request verification, with server-side token validation.
- GitHub Pages for the public class prototype.
- USDA FoodData Central as the reference source for AI-estimated nutrition values; the prototype does not calculate nutrients ingredient by ingredient from the USDA API.


## Research

The first prototype, Basket Buddy, tested whether community-reported Open Prices records could support a useful local grocery basket. The 50-mile Hayward snapshot included 42,342 price observations; 3,904 (9.2%) were dated within the previous 30 days, and the median observation was 288 days old. Too many outdated prices and missing product prices undermine one of the project's core values. In a live sample, the selected records were 100, 271, and 289 days old. These are reported-price dates, not current availability.

A radius check showed that widening the search did little to improve recent results: the 50-mile sample had 3,904 observations in the previous 30 days, while the 300-mile sample had 3,907—only three more. Keyword and category matches also did not reliably mean usable fresh ingredients; some matches referred to prepared food, sauces, or other products. In the prototype, ingredient and package matching could produce impractical shopping suggestions, such as buying a full bottle of soy sauce for one recipe. The results explain why a larger search area would not solve the main problem. [The saved analysis](open-prices-hayward-50mi-analysis.md) and [radius comparison](open-prices-radius-expansion-analysis-2026-11-10.md) contain the methods and snapshot details.

Instructor Tyler and Associate Professor Ian also asked how the original concept would help someone gather ingredients conveniently and make the recipe fit their cuisine, preferences, and available substitutes. That feedback made the gap in the original shopping-list interaction clearer. This proposal moves the central question to one contextual meal suggestion using the local forecast and user-selected meal preferences.

**Competitive Analysis.** This quick comparison uses current public product descriptions.

| App | What its public product information describes | What Forecast Meal tests |
|---|---|---|
| [Eat AI: Weather Meal Planner](https://apps.apple.com/us/app/eat-ai-weather-meal-planner/id6767874649) | The closest match: weather-adaptive meal plans, personalized recipes, dietary restrictions, step-by-step cooking instructions, AI food scanning, and calorie and macro tracking. The U.S. App Store lists the app as free with in-app purchases and publishes paid premium options. | A much smaller weather-to-one-meal flow, dietary controls and one-at-a-time substitutions, with an AI-estimated per-serving nutrition table and category icons. This is a class experiment, not an attempt to match Eat AI's nutrition tools. |
| [Mealime](https://www.mealime.com/) | Weekly meal planning, recipes, personalization, serving choices, organized grocery lists, and guided cooking. Mealime describes its core app as free and offers optional Pro features, including expanded nutrition information. | A single meal selected from today's forecast, with no weekly plan, shopping integration, or nutrition dashboard. Its purpose is to test the weather-informed interaction, not to replace a mature meal-planning service. |

Eat AI already offers a close weather-to-meal feature set. Forecast Meal's course contribution is a narrow prototype that connects Project 2's forecast data to one meal and presents a per-serving nutrition summary with p5.js category icons. The full products are feature-rich services; Forecast Meal is a no-charge class experiment with intentionally limited scope.

Basket Buddy research also examined Instacart's shopping-list and Catalog APIs, retailer APIs and weekly ads, Flipp, MealMe, Algolia, Google Shopping results through third-party services, and product-search providers. Those options focused on separate retailers, promotions, seller catalogs, or search results; they did not supply a reusable local grocery-price catalog that solved the prototype's freshness and ingredient-matching problems. Instacart remained a possible future shopping handoff, rather than a source for the original price comparison.


## Resources References

- [p5.js reference](https://p5js.org/reference/)
- [USDA FoodData Central API guide](https://fdc.nal.usda.gov/api-guide/)
- [USDA FoodData Central data documentation](https://fdc.nal.usda.gov/data-documentation/)
- [National Weather Service API](https://www.weather.gov/documentation/services-web-api)
- [Browser Geolocation API](https://developer.mozilla.org/en-US/docs/Web/API/Geolocation/getCurrentPosition)
- [Cloudflare Turnstile widget configuration](https://developers.cloudflare.com/turnstile/get-started/client-side-rendering/widget-configurations/)
- [Cloudflare Turnstile server-side validation](https://developers.cloudflare.com/turnstile/get-started/server-side-validation/)
- [Cloudflare Workers AI JSON Mode](https://developers.cloudflare.com/workers-ai/features/json-mode/)
- [Cloudflare Workers AI pricing and free allocation](https://developers.cloudflare.com/workers-ai/platform/pricing/)
- [Cloudflare Turnstile plans and pricing](https://developers.cloudflare.com/turnstile/plans/)
- [Eat AI App Store listing](https://apps.apple.com/us/app/eat-ai-weather-meal-planner/id6767874649)
- [Mealime product site](https://www.mealime.com/)
- [Mealime Pro feature comparison](https://support.mealime.com/article/79-mealime-pro)
- [Instacart shopping-list API](https://docs.instacart.com/developer_platform_api/api/products/create_shopping_list_page) (historical Basket Buddy research)
- [Instacart Catalog API overview](https://docs.instacart.com/catalog/catalog_api/overview/) (historical Basket Buddy research)
- [Kroger public APIs](https://www.postman.com/kroger/the-kroger-co-s-public-workspace/collection/ki6utqb/kroger-public-apis) and [partner APIs](https://www.postman.com/kroger/the-kroger-co-s-public-workspace/documentation/nryx3kn/kroger-partner-apis) (historical Basket Buddy research)
- [Walmart Marketplace item search](https://developer.walmart.com/global-marketplace/reference/getsearchresult) (historical Basket Buddy research)
- [Flipp FAQ](https://corp.flipp.com/faq/) and [terms](https://corp.flipp.com/terms-of-use/) (historical Basket Buddy research)
- [MealMe terms and privacy](https://www.mealme.ai/privacy) (historical Basket Buddy research)
- [Algolia pricing](https://www.algolia.com/pricing) (historical Basket Buddy research)
- [Google Merchant API overview](https://developers.google.com/merchant/api/overview) (historical Basket Buddy research)
- [SerpApi Shopping results](https://serpapi.com/shopping-results) and [terms](https://serpapi.com/legal) (historical Basket Buddy research)
- [OpenWeb Ninja product search](https://www.openwebninja.com/api/real-time-product-search) and [terms](https://www.openwebninja.com/terms) (historical Basket Buddy research)
- [Open Prices API documentation](https://prices.openfoodfacts.org/api/docs) (historical research for Basket Buddy)
- [Open Database License v1.0](https://opendatacommons.org/licenses/odbl/1-0/) (historical research for Basket Buddy)

---


**Forecast Meal — Proposed Three-Week Plan:**


### Week 1:

- Adapt the weather request flow to retrieve today's National Weather Service forecast for the six selected cities. Add the user-triggered location option with city fallback, and show the chosen city and forecast.


### Week 2:

- Replace open-ended meal requests with the confirmed dietary, ingredient-exclusion, and serving controls. Generate and validate one recipe, then add one-at-a-time substitutions that update quantities and affected steps.


### Week 3:

- Display the AI-estimated per-serving nutrition table with p5.js category icons; complete the Turnstile verified state, location notice, error handling, review, and class demonstration.

The existing Basket Buddy backend has not yet been adapted to this proposal. Forecast Meal development and cleanup of the earlier price-search code await approval of the plan.


## Success Criteria

- The user can choose one of the six cities or explicitly enable device location, and the app identifies the location and today's forecast.
- The meal flow has no open-ended text box; it accepts only its supported meal controls and rejects unsupported request fields.
- With no preference selections, the app suggests one balanced meal with vegetables, a protein, and a grain or starch.
- Dietary pattern and ingredient exclusions are reflected in the recipe; serving choices from 1–4 update quantities.
- A user can request and apply one ingredient substitution at a time. The result respects the chosen preferences and updates the relevant quantities, instructions, and nutrition estimates.
- The nutrition table shows calories, protein, carbohydrates, total fat, fiber, and sodium per serving, with an icon for each category and the accuracy disclaimer.
- The server validates the structured response and rejects malformed or unsupported model output.
- Turnstile's challenge remains visible when required, disappears after success, and leaves a visible verified status; invalid or expired verification returns the challenge.
- p5.js displays a distinct, reusable icon for each nutrient category alongside the nutrition table.
- The app is free for its intended class users, and the deployment avoids paid services and stops gracefully at verified free-tier limits.
- The location notice accurately states how the location and forecast information are sent and used.

---


## Interaction and System Flow

1. The user chooses Hayward, Oakland, San Francisco, San Jose, San Mateo, or Dublin, California, or taps “Use my location.” Only explicitly choosing device location triggers the browser's permission request. If location is denied or the forecast fails, the user can choose a city.
2. The app retrieves and displays today's local forecast. It sends the weather summary and supported meal controls—not the device coordinates or unrestricted user text—to the meal-generation service.
3. The user selects one dietary pattern (no preference, vegetarian, vegan, or pescatarian), chooses ingredients to exclude from the generated recipe, and chooses 1–4 servings. A blank/no-preference selection gives one balanced default meal.
4. After Turnstile verification, the meal endpoint accepts only supported controls, gets one recipe in the selected model's structured format, and checks the result before returning the recipe, quantities, steps, and per-serving estimates for the six nutrient categories. Other topics cannot be entered through the interface; unsupported direct API inputs and invalid results are rejected.
5. The recipe shows one “Swap” control per ingredient. The model suggests one replacement at a time using the same forecast and preferences. The user can apply the suggestion; the app then updates affected quantities, steps, and per-serving nutrition estimates.
6. The p5.js sketch draws a small, reusable icon for each nutrient category beside the per-serving nutrition table. The values are AI-generated estimates informed by USDA reference data, not values calculated by querying USDA for every recipe ingredient.


## Privacy, Licensing, and Limits

“Use my location” is optional and starts only after the user taps it and grants browser permission. The proposed notice is: “Your location is optional. If you choose ‘Use my location,’ we use a one-time location reading to retrieve your local weather forecast for your meal suggestion. Your location is used for this purpose only. You can select a city instead.”

The implementation must match that notice: use the coordinates only for the forecast request, do not put them in the AI prompt, meal history, or application logs, and let the user choose a city instead. The weather service necessarily receives the location used to retrieve its forecast; the AI receives the resulting forecast summary and the selected meal controls. Confirm provider handling and Worker logs before publishing this claim.

The meal endpoint is not a general-purpose assistant. The page has no free-text prompt, the server accepts only supported fields and values, the model uses a meal-specific instruction, and the server checks the generated response. Structured model output alone is not guaranteed to follow its schema. Dietary labels and ingredient exclusions support recipe preferences; they do not verify allergies or provide medical nutrition advice.

Turnstile is a bot check, not the meal-topic safeguard. Show the challenge whenever verification is needed; once the check succeeds, hide it and display “Verified.” The Worker validates each short-lived, single-use token server-side before calling the model and restores verification when the token expires or validation fails.

Forecast Meal does not create accounts, persist location, or save meal history. Keep secrets out of the repository. The current Cloudflare AI free allocation is limited and model-specific eligibility can change; the no-cost goal requires checking the selected model and active account, enforcing a request limit, and pausing generation when the free allocation is unavailable. A published “free” promise must not rely on a paid tier or unverified billing setting.


## Developer Note

- This project concept is original and owned by Ken Pao. AI assisted with research and drafting the proposal.
- As an experiment, even for a simple task, I found many limitations and learned that pricing data generally available to users is not available for developers to use.
- Using AI to develop an AI-powered app with p5.js is both a fun and frustrating experience. The fun part is the speed and ability to build more complex features with fewer headaches. The frustrating part is spending extra time and effort debugging AI-generated bugs, only to discover that the code is unnecessary and end up deleting it.
- Based on initial user feedback and Instructor Tyler's feedback, I might have to pivot a bit, using AI to do more of the heavy lifting and reducing the emphasis on pricing or using it only as a reference point.
- November 11, 2026 — I tested Basket Buddy's Open Prices approach and built a 50-mile product catalog. The snapshot had 42,342 observations, but only 3,904 were from the previous 30 days; a sample returned prices 100, 271, and 289 days old. Expanding to 300 miles added only three recent observations. I also found uneven ingredient/package matching. For example, a full bottle of soy sauce for one meal is not a practical shopping suggestion. These results made a larger search radius an ineffective fix. ([50-mile snapshot analysis](open-prices-hayward-50mi-analysis.md); [radius comparison](open-prices-radius-expansion-analysis-2026-11-10.md))
- Instructor Tyler and Associate Professor Ian also asked why the project searched a 50-mile area, why a user could not substitute an ingredient, why the list could require shopping at multiple places instead of one convenient shop, and why there were no cuisine or dietary choices. I took that feedback as evidence that the original project focused on product-price matching before it had a practical cooking interaction.
- I looked at two existing products before changing direction. Eat AI already advertises meals adapted to local weather; Mealime offers established meal planning, personalization, recipes, servings, grocery lists, and guided cooking. Forecast Meal is not a new commercial idea and does not try to compete feature-for-feature. I am keeping it as a small, no-charge class experiment that combines Project 2's local forecast data with one meal, preference and substitution controls, and a p5.js nutrition table with category icons. ([Eat AI](https://apps.apple.com/us/app/eat-ai-weather-meal-planner/id6767874649); [Mealime](https://www.mealime.com/))

- November 11, 2026 — I changed the planned result visual from a p5.js meal illustration to a per-serving nutrition table with category icons. The AI will estimate common nutrient values informed by USDA FoodData Central references, with a one-line disclaimer that the values may be inaccurate and are for reference only.


## Credits

- Product and price observations for the original prototype: [Open Prices (Open Food Facts)](https://prices.openfoodfacts.org/), historically used with attribution under the [Open Database License (ODbL) v1.0](https://opendatacommons.org/licenses/odbl/1-0/).
- Original Basket Buddy basket illustration: created in sketch.js with p5.js; no external image was used.
- Forecast Meal nutrition table and category icons: planned original p5.js and HTML/CSS presentation; implementation has not started.
