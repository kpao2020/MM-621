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

Forecast Meal is a proposed redesign of the earlier Basket Buddy prototype. The existing Basket Buddy backend has not yet been adapted to this proposal. Forecast Meal development and cleanup of the earlier price-search code await approval of the plan. The features below describe the planned experience.

The repository still contains Basket Buddy's Open Prices catalog, D1 search, meal-request flow, and refresh tooling. Those files document the earlier experiment and do not define Forecast Meal's scope. Where older implementation documents differ from the proposal, follow the proposal.


## Planned experience

1. Choose Hayward, Oakland, San Francisco, San Jose, San Mateo, or Dublin, California, or explicitly select “Use my location.” Only the device-location choice triggers a browser permission request. City selection remains available if permission is denied or the forecast fails.
2. View today's local National Weather Service forecast.
3. Choose a dietary pattern: no preference, vegetarian, vegan, or pescatarian. Select ingredients to exclude and choose one to four servings. There is no open-ended meal prompt.
4. Complete Turnstile verification and request one recipe. With no dietary selection or exclusions, the default is a generally balanced meal containing vegetables, a protein, and a grain or starch.
5. View ingredient quantities and simple preparation steps. Request one AI-suggested ingredient substitute at a time; applying it updates the relevant quantities, instructions, and nutrition estimates.
6. View estimated calories, protein, carbohydrates, total fat, fiber, and sodium per serving, with a reusable p5.js icon for each category.

Nutrition values are AI-generated estimates informed by USDA FoodData Central reference data and may be inaccurate; use for reference only. The prototype does not calculate nutrients ingredient by ingredient from the USDA API. Its “healthy” default is a class-project guideline, not an assessment of a person's medical or nutritional needs. Dietary labels and exclusions do not verify allergies or provide medical nutrition advice.


## Scope

The project tests one contextual meal suggestion, dietary and ingredient-exclusion controls, one-at-a-time substitutions, serving adjustments, and a visual nutrition summary. The result visual is a nutrition table with category icons.

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
- Cloudflare Turnstile for bot checks, with server-side token validation.
- GitHub Pages for the public class prototype.
- USDA FoodData Central as the reference source for AI-estimated nutrient values.

The server will accept only supported meal controls and reject unsupported request fields and malformed or unsupported model output. Turnstile verifies requests; meal-topic restrictions are enforced separately through the supported inputs, meal-specific instructions, and response validation. After successful verification, the challenge will collapse and a visible “Verified” status will remain; expired or invalid verification will restore the challenge.


## Privacy and service limits

Device location is optional and requires an explicit user action and browser permission. The proposed implementation uses a one-time reading only to retrieve the local forecast. The weather service receives the location needed for that request; the meal-generation service receives the forecast summary and supported meal controls, without device coordinates or unrestricted user text.

Coordinates must stay out of AI prompts, meal history, and application logs. The proposed app does not persist location or save meal history. Provider handling and Worker logs must be checked before publishing the location notice.

The free-use goal depends on the selected model and account's verified free allocations. The implementation must enforce request limits and pause generation when the free allocation is unavailable. Credentials and the Turnstile secret belong in Cloudflare or GitHub secret settings and must stay out of the public repository.


## Proposed three-week plan

| Week | Focus |
|---|---|
| 1 | Retrieve today's forecast for the six cities; add optional device location, city fallback, and visible location and forecast information. |
| 2 | Add dietary, ingredient-exclusion, and serving controls; generate and validate one recipe; implement substitutions that update quantities and affected instructions. |
| 3 | Display per-serving nutrition estimates and p5.js category icons; complete verification states, the location notice, error handling, review, and class demonstration. |

The proposal's Success Criteria section defines the complete acceptance criteria.


## Run the existing prototype locally

These steps open the current Basket Buddy implementation. Forecast Meal's planned controls and forecast-to-recipe flow are not yet implemented.

1. Serve the repository root with VS Code Live Server or `python3 -m http.server 5500`.
2. Open `http://localhost:5500/projects/p3/`. The production Turnstile configuration accepts the published GitHub Pages hostname; local page loading alone does not verify live meal submissions.
3. For local Worker development, run `npx wrangler dev --port 8787` from `projects/p3/worker` and temporarily point `workerUrl` in `config.js` at the local Worker. Restore the production URL before publishing.

The earlier catalog's operating instructions remain in [DATA-PIPELINE.md](DATA-PIPELINE.md). Adapting the app and retiring the old price-search behavior are future implementation work under the proposal.


## Project files

- [PROPOSAL.md](PROPOSAL.md): source of truth for Forecast Meal's rationale, research, scope, flow, privacy requirements, and plan.
- `index.html`, `style.css`, `sketch.js`, `api.js`, `results.js`, and `config.js`: existing prototype interface, interactions, request handling, result rendering, and public client configuration.
- `worker/src` and `worker/migrations`: existing Basket Buddy backend, catalog schema, and search index.
- `tools/refresh_open_prices.py` and `../../.github/workflows/p3-open-prices-refresh.yml`: earlier catalog-refresh tooling.
- [DATA-PIPELINE.md](DATA-PIPELINE.md): earlier Open Prices setup and operations.
- [requirements.md](requirements.md): implementation requirements document; consult the proposal for the current direction when they differ.
- [tracking.md](tracking.md) and [memory.md](memory.md): work status and confirmed decisions, including historical implementation notes.
- [agents.md](agents.md): project collaboration instructions; legacy product rules are superseded by the current proposal and confirmed user decisions.


## Credits and references

The [proposal's reference list](PROPOSAL.md#resources-references) contains the technology documentation and competitive research.

Product and price observations for the original Basket Buddy prototype came from [Open Prices (Open Food Facts)](https://prices.openfoodfacts.org/) under the [Open Database License (ODbL) v1.0](https://opendatacommons.org/licenses/odbl/1-0/). Its original basket illustration was created in p5.js without an external image. Forecast Meal's nutrition table and category icons are planned original p5.js and HTML/CSS work; implementation has not started.
