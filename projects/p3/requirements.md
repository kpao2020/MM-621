# Forecast Meal — Implementation Requirements

Status: the forecast/location and first recipe phase are implemented in local source as of November 13, 2026. The Worker is deployed; publishing the frontend and checking a full recipe request remain pending. Ingredient substitutions and nutrition are future work. PROPOSAL.md remains the source of truth; its headings and body have not been edited.

## Forecast and location — implemented

- Offer Hayward, Oakland, San Francisco, San Jose, San Mateo, and Dublin, California. Start with Hayward without requesting device location.
- Retrieve NWS /points metadata and follow properties.forecast. Do not substitute current station observations for a forecast.
- Show the selected city or approximate NWS place near the device, location source, local date/time zone, forecast-period name and validity times, temperature in Fahrenheit, summary, details, wind, precipitation probability, source link, NWS update time, and retrieval time.
- Show only unexpired forecast periods overlapping today in the NWS time zone. Handle overnight periods, tonight, midnight, and devices in another time zone. Reject missing/incomplete periods and forecasts more than a day old; disclose updates older than six hours or an absent update timestamp.
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
- Send a fresh, normalized weather summary and supported controls only; never send coordinates, location labels, or arbitrary text to the Worker. Reject unexpected request fields and malformed or preference-conflicting model output.
- Require server-side Turnstile validation for the expected action and hostname, with visible verified/expired/error UI states, and the existing per-IP limiter, with no database or shared daily recipe limit.
- Generate one generally balanced recipe with numeric ingredient amounts and simple preparation steps. Do not reconnect grocery-price search.
- Future: offer one-at-a-time ingredient swaps that update affected quantities, instructions, and per-serving nutrition estimates.
- Future: show estimated calories, protein, carbohydrates, total fat, fiber, and sodium per serving, each with a reusable p5.js category icon. Explain that estimates may be inaccurate and are not medical or allergy advice.

## Deploy and review before publication

- Manually review each city and device-location success, denial, unavailable, and timeout states on a phone and desktop. Include switching to a city during an outstanding permission/weather request, NWS errors, overnight/midnight behavior, and a device configured to a different time zone.
- Review mobile width, keyboard operation, status announcements, reduced motion, source links, and loading/error recovery.
- Confirm that only NWS receives weather coordinates and the recipe request sends no coordinates or legacy Open Prices requests.
- Changes are local; no Cloudflare migration/deployment or GitHub Pages publish has happened. Legacy catalog refresh files remain in the repository but the new recipe route does not call them.
