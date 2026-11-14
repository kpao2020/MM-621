---
layout: default
title: Project 3 Readme
---


# Forecast Meal


## Project Goal

I am building a lightweight app to help busy college students choose a healthy meal based on their local weather forecast.


## Target Audience

My target audience is college students who prefer cooking at home and want simple, healthy recipes.
 

## Mood Board

![Forecast Meal app moodboard](../../assets/images/p3_moodboard.png)
Note: AI-generated image


## Overview

Forecast Meal is a lightweight, mobile-first class experiment by Ken Pao for MM-621, Interaction Design Studio II. The proposed app uses today's local weather forecast to suggest one healthy meal, with ingredient quantities, simple cooking steps, adjustable servings, and a per-serving nutrition table with p5.js category icons. It is intended to be free for classmates to try.

The [Project 3 proposal](PROPOSAL.md), dated November 11, 2026, is the source of truth for the project direction, scope, and delivery plan. Read the [published proposal](https://kpao2020.github.io/MM-621/projects/p3/PROPOSAL.html) on GitHub Pages; the local proposal may contain updates that have not yet been published.


## Current status

Turnstile remains off by the user's choice. The current Worker has no token check and allows up to five requests per IP per minute; this limits bursts but does not stop distributed or scripted use. The Cloudflare dashboard was not inspected, so the old widget's account status is unknown.

The local Worker source uses the user-approved Workers AI model `@cf/meta/llama-3.1-8b-instruct-fp8-fast`. This model is locked by the user's strict rule: do not change or test another model unless the user reviews and explicitly approves that exact change. It has not been deployed.

The local app now includes the NWS forecast/location flow, recipe generation, batch ingredient swaps, and a per-serving nutrition table with six p5.js icons. It offers six Bay Area cities or an explicit one-time device location. Once a forecast loads, choose no preference, balanced, meat eater, vegetarian, vegan, or pescatarian; select a preferred cuisine and exclusions from fixed lists; choose one to four servings; and request a single recipe. Select any ingredients you want to change, then request replacements together. One successful batch is allowed per recipe; a new recipe starts another. The page contains no free-text meal prompt.

The local Worker validates recipe and batch-swap requests, including the six per-serving nutrition estimates, and checks structured results against the controls. It does not save requests or recipes. A swap request includes the existing recipe and selected ingredient indexes; the Worker merges only validated replacements and revised steps and returns updated nutrition estimates. It applies the existing per-IP burst limit and does not use a database or shared daily recipe counter. The deployed Worker has not been updated with the current swap and nutrition response formats, so the local frontend and Worker must be released together before the public recipe flow will work.

The user reviewed the local app and reports that it works. Nutrition values are rough AI estimates informed by USDA FoodData Central reference data; the app does not calculate nutrients ingredient by ingredient through the USDA API. The table and icons are implemented locally.

The user disabled the `forecast-meal-api` production and preview domains in the Cloudflare dashboard on November 14, 2026. The published page's configured Worker address is therefore paused; recipe and ingredient-swap requests there are unavailable. The local Wrangler Worker is separate and remains available for development. The user will push the local `ken` changes, open and merge a PR to `main`. No push, PR, merge, or production code deployment has happened yet. A future Wrangler deployment can re-enable the `workers.dev` route unless the production config explicitly keeps it disabled.

The two Open Prices analysis documents preserve research from the earlier Basket Buddy experiment. The Forecast Meal app does not use the old price catalog or D1.


## Planned experience

1. Choose Hayward, Oakland, San Francisco, San Jose, San Mateo, or Dublin, California, or explicitly select “Use my location.” Only the device-location choice triggers a browser permission request. City selection remains available if permission is denied or the forecast fails.
2. View today's local National Weather Service forecast.
3. Choose a dietary pattern: no preference, balanced, meat eater, vegetarian, vegan, or pescatarian. Select a preferred cuisine, ingredients to exclude, and one to four servings. There is no open-ended meal prompt.
4. Request one recipe. With no dietary selection or exclusions, the default is a generally balanced meal containing vegetables, a protein, and a grain or starch.
5. View ingredient quantities and simple preparation steps. Select any ingredients you want to change, then request replacements together. One follow-up AI call updates those ingredients and relevant steps.
6. View estimated calories, protein, carbohydrates, total fat, fiber, and sodium per serving, with a reusable p5.js icon for each category.

Nutrition values are AI-generated estimates informed by USDA FoodData Central reference data and may be inaccurate; use for reference only. The prototype does not calculate nutrients ingredient by ingredient from the USDA API. Its “healthy” default is a class-project guideline, not an assessment of a person's medical or nutritional needs. Dietary labels and exclusions do not verify allergies or provide medical nutrition advice.


## Scope

The project tests one contextual meal suggestion, dietary and ingredient-exclusion controls, batch substitutions, serving adjustments, and a visual nutrition summary. The result visual is a nutrition table with category icons.

Nutrition tracking, weekly meal planning, grocery prices, store inventory, ordering, accounts, and saved meal history are outside the proposed scope.


## Why the direction changed

Basket Buddy explored whether community-reported Open Prices records could support a useful local grocery basket. The research documented in the proposal found:

- The 50-mile Hayward snapshot contained 42,342 observations, but only 3,904 (9.2%) were from the previous 30 days. The median observation was 288 days old.
- Expanding the radius to 300 miles added only three recent observations.
- Ingredient and package matching could produce impractical shopping suggestions, such as buying a full bottle of soy sauce for one recipe. Recorded prices did not confirm current availability.

Instructor feedback also raised questions about shopping convenience, cuisine and dietary preferences, and substitutions. Forecast Meal shifts the interaction toward cooking one meal using the local forecast and selected preferences.

The proposal compares Eat AI and Mealime and acknowledges that weather-based meal suggestions already exist. Forecast Meal's contribution is a small class experiment connecting the earlier weather-data project to one meal and a visual nutrition summary.

See the [50-mile analysis](open-prices-hayward-50mi-analysis.md), [radius comparison](open-prices-radius-expansion-analysis-2026-11-10.md), and the proposal's Research section for details.


## Planned technology

- p5.js 2.3.3, HTML, CSS, and JavaScript for the mobile interface, recipe controls, nutrition table, and category icons. The local p5.js copy is at `../../lib/p5.min.js`.
- National Weather Service API for today's forecast at supported U.S. coordinates.
- Browser Geolocation API for optional, user-authorized location, with manual city selection as an alternative.
- Cloudflare Workers and Workers AI for the meal-only service, structured generation, and server-side validation.
- GitHub Pages for the public class prototype.
- USDA FoodData Central as the reference source for AI-estimated nutrient values.

The Worker accepts only the fixed dietary pattern, preferred cuisine, allowlisted exclusions, serving count, and normalized forecast. It makes one bounded structured-generation request and rejects malformed or preference-conflicting output. These checks do not guarantee that model output is medically or allergen safe.


## Privacy and service limits

Device location is optional and requires an explicit user action and browser permission. The proposed implementation uses a one-time reading only to retrieve the local forecast. The weather service receives the location needed for that request; the meal-generation service receives the forecast summary and supported meal controls, without device coordinates or unrestricted user text.

Coordinates must stay out of AI prompts, meal history, and application logs. The proposed app does not persist location or save meal history. Provider handling and Worker logs must be checked before publishing the location notice.

The Worker retains a per-IP burst limit; it does not impose a shared daily recipe limit. Workers AI can still reject a request if the account allocation or billing configuration is unavailable; verify Cloudflare account limits before presenting generation as free. The Worker URL is public browser configuration. Without a bot challenge, the per-IP limit does not prevent distributed automated requests.


## Proposed three-week plan

| Week | Focus |
|---|---|
| 1 | Retrieve today's forecast for the six cities; add optional device location, city fallback, and visible location and forecast information. |
| 2 | Add dietary, ingredient-exclusion, and serving controls; generate and validate one recipe; implement substitutions that update quantities and affected instructions. |
| 3 | Display per-serving nutrition estimates and p5.js category icons; complete loading states, the location notice, error handling, review, and class demonstration. |

The proposal's Success Criteria section defines the complete acceptance criteria.


## Run the forecast prototype locally

The weather section works independently. Recipe generation requires the recipe Worker.

1. In one terminal, go to `projects/p3/worker` and run `npx wrangler dev --config wrangler.local.toml --port 8787`.
2. In a second terminal, serve the repository root with VS Code Live Server or `python3 -m http.server 5500`.
3. Open `http://127.0.0.1:5500/projects/p3/` or `http://localhost:5500/projects/p3/`. Local pages use the local Worker on port 8787; the local Worker calls Cloudflare Workers AI, which can use your Cloudflare allocation.
4. The local Worker configuration allows only the two local preview origins and does not change production CORS. The production page continues to use the deployed Worker, which accepts `https://kpao2020.github.io` only.
5. Device location needs HTTPS or localhost and browser permission. Browser and operating-system location settings both affect availability. A phone opening a plain HTTP LAN address may use the city selector, but device location requires HTTPS.

`config.js` routes localhost and 127.0.0.1 previews to the local Worker on port 8787. Other hosts use the deployed Worker. The local Wrangler config allows the two local preview origins; the production config allows `https://kpao2020.github.io`. These origin checks are browser access controls, not authentication. Review the local page first; publish the matching Worker and frontend together before testing the recipe flow on GitHub Pages.

The app reads location once per explicit device-button click. Refresh uses the already resolved NWS grid without reading device location again. Forecasts refresh after 20 minutes, when the first displayed period ends, or after local midnight while the page is visible. Returning to a backgrounded page also checks whether a refresh is due. NWS outages, missing data, unsupported locations, permission denial, and timeouts leave city selection available. A future forecast is never silently substituted for today's missing data.

The location notice describes this app's behavior; NWS receives the request and applies its own provider policies. This app does not persist coordinates or log them, and requests use no-store, omit credentials, and suppress the referring page. The browser, operating system, network, and NWS still handle the location request.

For the swap and nutrition flows to work on GitHub Pages, deploy the Worker and publish the matching frontend together. The user disabled the production and preview domains and plans to keep the Worker paused until Turnstile work resumes. The Worker currently has no Turnstile check; its five-per-IP-per-minute limit only slows bursts and is not bot protection.

For production activation, from `projects/p3/worker`, deploy the Worker:

```sh
npx wrangler deploy
```

Check the Worker URL and allowed production origin before publishing the updated frontend. The deployed recipe route does not use the earlier price catalog.


## Project files

- [PROPOSAL.md](PROPOSAL.md): source of truth for Forecast Meal's rationale, research, scope, flow, privacy requirements, and plan.
- `index.html`, `style.css`, `sketch.js`, `weather-api.js`, `recipe-api.js`, and `config.js`: active forecast/recipe interface, p5.js illustration, NWS client, supported meal controls, and public service configuration.
- `worker/src/index.js`: recipe-only Worker route, structured response validation, and request limits.
- [open-prices-hayward-50mi-analysis.md](open-prices-hayward-50mi-analysis.md) and [open-prices-radius-expansion-analysis-2026-11-10.md](open-prices-radius-expansion-analysis-2026-11-10.md): historical research cited in the proposal.
- [requirements.md](requirements.md): current forecast requirements and remaining meal-service work.
- [tracking.md](tracking.md) and [memory.md](memory.md): work status and confirmed decisions, including historical implementation notes.
- [agents.md](agents.md): project collaboration instructions; legacy product rules are superseded by the current proposal and confirmed user decisions.


## Credits and references

The [proposal's reference list](PROPOSAL.md#resources-references) contains the technology documentation and competitive research.

Product and price observations for the original Basket Buddy prototype came from [Open Prices (Open Food Facts)](https://prices.openfoodfacts.org/) under the [Open Database License (ODbL) v1.0](https://opendatacommons.org/licenses/odbl/1-0/). Its original basket illustration was created in p5.js without an external image. The current weather-and-bowl illustration and reusable nutrition icons are original p5.js work with AI-assisted revisions; HTML and CSS present the nutrition table.
