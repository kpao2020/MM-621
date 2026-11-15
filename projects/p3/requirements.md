# Forecast Meal — Implementation Requirements

Status: forecast, recipe, batch ingredient swaps, per-serving nutrition estimates, and p5.js nutrient icons are implemented. The approved Workers AI model is deployed. The user permanently rejected Turnstile; its integration has been removed locally and the matching frontend must be published. The Worker retains its per-IP limiter and AI Gateway routing. See tracking.md for deployment status. The proposal remains unchanged.

## Strict AI model approval rule

- Use only `@cf/meta/llama-3.1-8b-instruct-fp8-fast` for Forecast Meal.
- Do not change, replace, test, or deploy another model unless the user first reviews and explicitly approves that exact model change. Never choose a model on the user's behalf.
- The earlier 70B model choice was not approved and is superseded. Do not use `@cf/meta/llama-3.3-70b-instruct-fp8-fast` again.

## Forecast and location — implemented

- Offer Hayward, Oakland, San Francisco, San Jose, San Mateo, and Dublin, California. Start with Hayward without requesting device location.
- Retrieve NWS /points metadata and follow properties.forecast. Do not substitute current station observations for a forecast.
- Show the selected city or approximate NWS place near the device, location source, local date/time zone, forecast-period name and validity times, temperature in Fahrenheit, summary, details, wind, precipitation probability, source link, and the latest NWS publication time when provided.
- Show only unexpired forecast periods overlapping today in the NWS time zone. Handle overnight periods, tonight, midnight, and devices in another time zone. Reject missing/incomplete periods and forecasts more than a day old; show when the NWS publication time is unavailable.
- Treat missing precipitation values as unavailable, not zero. Convert Celsius when returned by NWS.
- Request browser/device location only after the explicit button click. Use getCurrentPosition once, without high-accuracy tracking or a cached device reading. Browser and OS permission/service availability determine whether a location can be returned.
- Keep manual city selection available during all operations. Explain permission denial, unsupported/insecure browsers, unsupported NWS locations, missing data, network errors, rate limits, and timeouts; allow another city or retry.
- Abort obsolete weather requests, ignore late geolocation callbacks, and clear the previous forecast during a change. Bound a weather operation to 20 seconds and the permission wait to 30 seconds.
- Refresh after 20 minutes, when the first displayed period ends, or after local midnight while visible; check on returning to the page. Device refresh reuses the resolved forecast grid rather than obtaining another reading.
- Use semantic HTML for controls and weather content, keyboard focus, live status, touch targets, responsive layout, and reduced-motion support. p5.js draws the decorative weather-and-bowl artwork independently of data loading.

## Location handling — implemented application behavior

- Round coordinates to four decimal places for direct NWS requests. Do not use IP-based inference.
- Do not write coordinates to local/session storage, cookies, IndexedDB, application logs, a meal Worker, or AI input. No meal history or profile is saved.
- Send weather fetches with credentials omitted, no referrer, and no-store. Do not cache device point lookups in the application's city cache.
- Retain only resolved forecast-grid metadata and normalized weather in memory for refresh. It still describes an approximate forecast area, so never send it as an AI location field.
- Render external text with textContent and validate NWS forecast links against the expected HTTPS origin and path.
- Keep the notice next to the opt-in control. It describes app behavior; the browser, operating system, network, and NWS process the location request under their own policies. Review the deployed request path before publishing any broader provider/privacy claim.
- ForecastWeather.mealContext provides only a date and allowlisted weather fields for the later meal integration; server validation remains required.

## Forecast to one recipe — implemented in local source

- Offer fixed dietary choices (no preference, balanced, meat eater, vegetarian, vegan, pescatarian), a fixed preferred-cuisine list, allowlisted ingredient exclusions, and one to four servings. There is no open-ended meal prompt.
- Send a fresh, normalized weather summary and the selected dietary pattern, cuisine, exclusions, and serving count in clear labeled fields; never send coordinates, city labels, or arbitrary text to the Worker. Reject unexpected request fields. Display renderable recipe responses even when a preference check flags a possible mismatch; mark the affected ingredient or estimate in a soft orange tone and explain the check so the user can decide. Explain clearly when the AI service returns no displayable recipe.
- Keep the per-IP limiter and AI Gateway routing, with no database or shared daily recipe limit. Do not reintroduce Turnstile. The per-IP limiter does not prevent distributed automated requests.
- Generate a recipe with numeric ingredient amounts and simple preparation steps. Require a vegetable, protein, and grain or starch only when the user explicitly selects Balanced; no preference does not impose those ingredient roles. Keep structured output checks, but present preference mismatches as review warnings instead of discarding the recipe. Do not reconnect grocery-price search.
- Let users select any number of listed ingredients and request replacements together with one button. Allow one successful replacement batch per recipe; after success, remove the selection controls and direct users to start a new recipe for another change. A failed request may be retried. One follow-up AI call returns all replacements and revised steps; apply the complete validated update to the recipe. Preserve unselected ingredients, servings, dietary choices, exclusions, and balanced meal roles. Show ingredient quantities and names together, with trailing parenthetical examples on a separate second line. Refresh the nutrition estimates after a successful batch.
- Show estimated calories, protein, carbohydrates, total fat, fiber, and sodium per serving, each with a reusable p5.js category icon. The Worker validates bounded numeric values and refreshes them after the ingredient batch. Explain that estimates may be inaccurate and are not medical or allergy advice.

## Release plan

- User reports that local app review passed. The assistant did not run tests or independently inspect the user's browser.
- Publish the frontend removal to GitHub Pages and review the recipe and swap flow there. The Worker uses the GitHub Pages origin, the per-IP limiter, and the AI Gateway. Preview URLs are disabled in the production configuration.
