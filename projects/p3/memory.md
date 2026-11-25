# Forecast Meal — Project Memory

## 2026-11-24 — Current approved model and interface updates

- Current approved Workers AI model: `@cf/google/gemma-4-26b-a4b-it`. The user approved switching from the prior Llama model after recipe output and validation problems, for the user's own testing. The first temporary Gemma test did not return a usable recipe; do not claim it succeeded.
- Added a Sugar avoid choice with Worker validation and warning matching. Custom p5 ingredient icons distinguish soy sauce from oils; sugar is drawn as cubes. The recipe result also uses a decorative p5 dish illustration.
- The notes below record earlier decisions and may be superseded by this current entry and later dated updates.

## 2026-11-15 — Security decision

- User permanently rejected Turnstile for this project; do not propose or reintroduce it. User also decided against CAPTCHA. Preserve the per-IP limiter and `forecast-meal` AI Gateway routing. Deleted the widget and Worker secret in Cloudflare; no Turnstile widgets or Worker secrets remain according to Wrangler.
- The user does not want real secrets saved locally. Historical entries below describe earlier states and do not override this decision.

## 2026-11-15 — No-preference recipe behavior

- User approved removing the vegetable/protein/grain-or-starch hard validation for no-preference recipes. Keep that requirement only for an explicit Balanced selection. Align the generation prompt with this rule; retain output-schema, diet, exclusion, and nutrition validation.
- A prompt can reduce model mismatches but cannot guarantee every generated response passes. Do not add automatic AI retries without approval because they can increase inference usage and latency.

## 2026-11-15 — Display recipe responses with review warnings

- User directs the app to display a parseable recipe even when a selected-choice check flags it. Keep the user-selected values explicit in the AI prompt, show affected ingredients or estimates with a soft light-orange highlight and a short explanation, and leave the decision to the user. Do not turn semantic preference mismatches into a failed request.
- Keep clear explanations for cases where the AI service returns no renderable response. The user chose a warm light-orange review tone instead of red.

## 2026-11-15 — User-reported production deploy and closeout

- User reports publishing the updated frontend to GitHub Pages and deploying the Worker; they say the app seems to be working. No independent end-to-end test or Worker version ID was recorded for this deploy. Treat the live status as user-reported.
- Do not run additional tests or make more changes for today's closeout. Turnstile and CAPTCHA remain removed; the approved model and existing rate limiting/Gateway setup remain in place.


## 2026-11-14 — Finish remaining groups while user is away

- **Strict AI model lock:** use `@cf/meta/llama-3.1-8b-instruct-fp8-fast` only. Never change, test, substitute, or deploy another model unless the user first reviews and explicitly approves that exact change. The earlier 70B choice was not approved; never use it again.
- User confirmed group 1 and authorized completing the remaining groups while away; they will test and review when they return. Continue without pausing between local tasks.
- Do not add Turnstile yet. Current local code contains the refresh-preservation change and a 45-second recipe/swap timeout. User reports the local app works after their review; a deliberately stalled-request test was not separately reported.
- User disabled the production and preview domains for `forecast-meal-api` in Cloudflare. The configured public address is paused; local Wrangler remains separate. User will push `ken` and open/merge a PR to `main`; those GitHub actions are still pending. Keep Turnstile off until requested. The Worker source remains token-free and has only a five-per-IP-per-minute burst limit.
- A future Wrangler deploy may re-enable the `workers.dev` route unless `workers_dev = false` is included in production config; confirm the user's intent before any later deploy.
- Do not run tests unless the user asks; the user completed their own local review.


## 2026-11-14 — Ingredient swap interaction

- The user replaced the one-at-a-time swap UI with batch selection: select any ingredients, click one button, then apply all valid replacements and revised steps together in one follow-up AI call.
- Allow one successful batch per recipe. Hide selection controls after success; users can start a new recipe for another change. Keep retry controls available after a failed request. Ingredient quantity and core name share a line where space allows; parenthetical examples go on a second line.
- Turnstile stays removed while finishing the project. Do not deploy, publish, commit, or push without authorization; no tests were requested.
- Weather UI preference: show only the NWS-published forecast timestamp; remove the page retrieval timestamp and confusing stale-warning box. Keep forecast explanations simple enough for a fifth grader, with a little playfulness.
- For local app previews, use VS Code Live Server on port 5500 and a separate local Wrangler Worker on port 8787. Keep production CORS restricted to GitHub Pages; the local Worker may connect to remote Workers AI and use account allocation.


## 2026-11-13 — User review queue

- During Turnstile removal, the deployment tool displayed the previous secret in its output; treat that key as exposed. The transitional Worker has no listed Turnstile secret and does not verify tokens. Delete the old widget after the new frontend is published, then deploy the final Worker without compatibility handling.
- User requested removal of Turnstile from the app and Worker and explicitly confirmed deletion of the existing Cloudflare widget. Rebuild a fresh Turnstile setup only when requested later. The per-IP limiter remains; the user wants to observe behavior without the widget.
- Turnstile troubleshooting: use Cloudflare's compact widget below a 300px container width; this fixes a mobile sizing concern but has not been shown to resolve Cloudflare-frame console messages. Simulated checks used fake tokens; real browser review is pending.
- The user requested no immediate repeat verification while reading a recipe. The local change defers a fresh Turnstile check until another recipe or a retry is requested; each request still uses a single-use token.
- User requested renaming the Worker. Deployed `forecast-meal-api` separately and updated local configuration to its URL. The new Worker requires the matching Turnstile secret before the frontend is published and tested. Do not delete `basket-buddy-api` until the new path is confirmed.
- User requested removal of obsolete Basket Buddy files. Removed the old client, D1 search and migrations, refresh script, pipeline guide, and tracked generated Wrangler state; kept the research analyses cited by the proposal and the historical record. Existing Worker name and public URL remain in use for Forecast Meal.
- The user reported a stuck published page and supplied a p5 canvas-parent error. The forecast artwork container existed when inspected after load. Startup now waits for the document and tolerates a missing illustration; a real browser check is still required after publication.
- User requested GitHub Pages deployment only. Removed local-address support and deployed Worker version d7c13fba-b9ea-4e47-8a68-86c841591ff4 with only https://kpao2020.github.io allowed and its hostname checked. Frontend publication and a real production recipe request remain pending. Do not commit, push, open or merge a PR without user confirmation.

- Earlier deployment 81b517bb-36be-4448-8b57-f51cc097eff3 temporarily supported local origins; it was superseded and local support removed at the user’s request. User uses 127.0.0.1:5500. Awaiting a real browser recipe request; no browser was available to the agent. Production still requires the configured GitHub Pages hostname and Turnstile action.

- Item 6 wording proposed in the local page: “Ingredients to exclude.” Await user review.
- Item 5: added a preferred cuisine selector and allowlisted Worker input for the six requested cuisines plus Filipino, French, Greek, Indian, Mexican, Middle Eastern, Spanish, and Thai. Await user review before item 6.

- Item 4 adds Balanced (vegetable, protein, and grain or starch) and Meat eater (meat or poultry), respecting exclusions. Await review before item 5.

- User prefers the human verification badge in the footer to preserve space for meal controls. Verification area moved there; await review.
- Item 3: use “Verify you're human” and collapse successful verification to a compact badge; await user review before proceeding to item 4.
- User requires one item at a time and confirmation before proceeding. Removed the Forecast Meal D1 binding and shared daily counter; retained the per-IP burst limit. The closed review queue is archived in p3.log. Obsolete Basket Buddy implementation files were later removed.

Last updated: 2026-11-14

## Forecast-to-recipe implementation — November 13

- The user acknowledged that location works and asked to continue. Implemented fixed eating-style choices (none, vegetarian, vegan, pescatarian), an allowlist of ingredient exclusions, servings 1–4, and one recipe generated from normalized today's forecast. The result has scaled ingredient amounts, short steps, and a control for changing servings.
- Added one Worker route (`POST /api/recipe`) with exact request-field validation, current-date/time-zone and 20-minute forecast checks, an allowlisted forecast classification, fixed server prompt, structured output, ingredient/exclusion/diet checks, and an explicit balanced default check. No location, arbitrary text, user identifier, saved recipe, or meal history enters the AI request or storage.
- Turnstile uses the separate `forecast_recipe` action and must match the configured hostname. The existing per-IP burst limit remains. The previously added D1 daily cap and migration 0003 were removed at the user's request.
- Historical model note, superseded: the assistant selected `@cf/meta/llama-3.3-70b-instruct-fp8-fast` without the user's approval. The user later explicitly selected `@cf/meta/llama-3.1-8b-instruct-fp8-fast`; the strict model approval rule at the top of this file now governs. Do not use or restore the 70B model.
- The updated Worker and frontend are not deployed. Recipe generation remains unavailable at the current legacy production Worker until the new Worker route is deployed. Follow the user's active one-item-at-a-time review/troubleshooting instruction; the closed review queue is archived in p3.log. Proposal and presentation remain unchanged.

## Forecast and location implementation — November 13

- The user authorized resuming Project 3 and updating the copied weather-api.js to meet the forecast requirements, including all six cities and optional browser/device location. This authorizes the forecast implementation phase under PROPOSAL.md; no further plan approval is pending for this phase.
- Replaced the copied observation/station/sunrise flow with NWS points -> forecast, supporting Hayward, Oakland, San Francisco, San Jose, San Mateo, and Dublin. The active index/sketch/style are now Forecast Meal's forecast-only interface; old API/results/config and backend remain in the repository but are not loaded or contacted by it.
- Hayward loads by default. Explicit device-button click is the only location permission entry point; a one-time reading goes directly to NWS, rounded to four decimals. No coordinate persistence, application logging, meal Worker request, or AI request. Refresh retains the resolved grid in memory without obtaining device location again.
- Filter unexpired periods by the NWS location's local day, including overnight and tonight. Display place/source, date/time zone, period validity, Fahrenheit, summary/details, wind, precipitation probability, NWS update/retrieval times, and source. Refresh after 20 minutes, period expiry, or midnight while visible, including on returning to the page.
- Added abort/request guards and timeouts, permission/coverage/network/data errors, city fallback, semantic HTML, and a p5 weather/bowl illustration. ForecastWeather.mealContext prepares a weather-only allowlist for later Worker integration.
- That forecast/location phase was completed locally. The user then asked to continue with the recipe phase, documented above. The legacy catalog refresh remains in the repository; neither phase changed the proposal or presentation.

## Presentation updated from latest proposal — November 12

- The user requested an update to the existing presentation PDF using the latest PROPOSAL.md. Retained the established playful, colorful style, minimal text, and five-minute presentation intent.
- Forecast-Meal-Proposal-Deck.pdf now has nine slides: added a combined Project Goal/Target Audience slide and a full Mood Board slide after the cover. Preserved the existing seven slides' content, sequence, vector artwork, and closing proposal hyperlink; updated section and page numbering.
- The mood board is embedded in the PDF, so the presentation does not depend on the image's public URL. The proposal text was not edited during this task.
- Final PDF pages were rendered and individually inspected; verified nine pages, selectable text, embedded mood board, correct numbering, and the closing proposal hyperlink. Build sources, original PDF backup, and previews are under /private/tmp/forecast-meal-proposal.

## Authorized proposal proofreading — November 12

- The user added Project Goal, Target Audience, and Mood Board and explicitly requested applied grammar, spelling, and tone edits. Preserve the user's straightforward student voice, exact headings, section order, and deliberate spacing. This request authorizes body edits for this pass; the standing Developer Note preference remains unchanged.
- The mood board reference, ../../assets/images/p3_moodboard.png, resolves correctly from PROPOSAL.md, and the local image opens. The published image URL returned HTTP 404 on November 12. The PNG is untracked and must be included in a future publish with the proposal; no commit, push, or deployment was requested.

## Proposal authority and presentation request — November 11

- The user designated PROPOSAL.md as the source of truth and requested that readme.md be updated from it. Forecast Meal's proposed scope includes six cities (Hayward, Oakland, San Francisco, San Jose, San Mateo, Dublin), optional device location, dietary and ingredient-exclusion controls, one to four servings, and one-at-a-time substitutions that update recipe quantities, instructions, and nutrition estimates.
- The planned visual is now a per-serving nutrition table with p5.js category icons, superseding the earlier meal-illustration direction. Nutrient values are AI estimates informed by USDA reference data, with an accuracy disclaimer; the proposal does not specify ingredient-by-ingredient USDA API nutrient calculation.
- The user declined the final suggested rewrite of the Developer Note's "As an experiment" opening. Keep the user's chosen wording and leave PROPOSAL.md unchanged.
- The user requested a five-minute proposal presentation and confirmed preferences for one PDF, a playful colorful style, and minimal text. They had no further questions. The seven-slide PDF is saved as projects/p3/Forecast-Meal-Proposal-Deck.pdf; its final slide links to the published proposal at https://kpao2020.github.io/MM-621/projects/p3/PROPOSAL.html (HTTP 200 confirmed).

## Weather-based direction — November 11

- The user wants Project 3 to reuse Project 2's weather/location work and generate one healthy meal suggestion from a local forecast, with quantities, simple cooking steps, and the previously discussed stylized p5.js meal drawing.
- Project 2 currently retrieves NWS station observations, not forecasts. Its four city choices are Hayward, Oakland, San Francisco, and San Jose. The revised app needs a forecast request and a clearly identified forecast period.
- The user explicitly authorized an optional current-location button using browser/device permission, with city selection as an alternative. This supersedes the earlier fixed-Hayward/no-geolocation product restriction. Do not request device location automatically or infer it from IP. Unsupported locations and permission failures need a city-selection fallback.
- Location is to be used only for obtaining the relevant forecast and supporting the meal suggestion. Explain this beside the opt-in control. Recommended design: keep coordinates out of the model prompt and app history/logs, send the AI only normalized forecast data and validated meal choices, and accurately disclose provider processing.
- Reject unrelated AI topics. Recommended initial interaction: structured choices instead of an open chat box; validate allowed inputs on the server, use a fixed meal-only prompt and constrained response structure, and reject invalid responses. Prompt instructions alone do not guarantee rejection of arbitrary free text.
- Price estimates, store search, Open Prices, and separate pantry/buy lists remain outside the revised scope. Ingredient substitution was requested earlier; its inclusion in the initial weather-based version is still to be scoped.
- Turnstile display cleanup is implemented locally: interaction-only appearance, collapse the container after successful client verification, restore it on expiry/error and before reset. Existing server-side verification and single-use token handling remain in place. This has not been deployed or verified in a live browser.
- Current work assesses feasibility and implementation scope. The weather-to-meal flow is not yet implemented; do not describe the revised app or privacy notice as live.

## Direction discussion — November 10

- The user explicitly removed price estimates, shopping locations, and separate pantry/already-have/buy lists from the revised concept. Open Prices is no longer part of the intended product direction.
- The revised concept uses common, easy-to-find ingredients with quantities in one complete list, simple preparation steps, and a final stylized p5.js meal drawing using reusable dish/ingredient components.
- Ingredient substitutions are desired for dislikes and unavailable ingredients. The interaction is still being designed; the user requested advice about its value and whether this project is worth pursuing given existing recipe tools.
- Time/effort estimates were discussed previously but are not confirmed requirements of this narrower version.
- Current work is concept evaluation and substitution interaction advice; the replacement app has not been implemented or deployed.
- The implementation facts below describe the existing Open Prices version, not requirements for the revised concept.

## Product direction

Basket Buddy's revised concept uses local weather forecasts to suggest one simple, generally balanced meal, with quantities, short cooking steps, and a stylized p5.js meal illustration. Users can select a supported city or explicitly opt in to a one-time device-location reading. AI interaction is limited to the meal-planning task.

## Existing implementation behavior — Open Prices version

- Workers AI drafts ingredients and close search phrases; D1 searches the saved catalog; a second Workers AI call selects only returned candidate IDs.
- Worker code validates each candidate. Substitutes are permitted only for replaceable ingredients; otherwise an unmatched ingredient remains “Price unavailable.”
- Keep lists concise: aim for 12 or fewer items and enforce a hard limit of 16.
- Prefer the lowest valid USD price observed in the past 30 days. If there is no recent observation, show the newest older observation and its age.
- Price facts, location, package information, and dates come from the catalog, never from model output.
- Daily refresh checks one newest regional record ID. It downloads and imports the region only after a change, an unready state, or for the weekly reconciliation.
- Ingredient candidate retrieval uses a D1 FTS5 inverted index over product search text; catalog refreshes rebuild the index before marking the catalog ready. After the index migration is applied, searches should inspect matches instead of scanning every product row.
- Catalog data is community-reported; it does not confirm current inventory.
- Keep Open Prices attribution and ODbL terms visible.

## Privacy and repository

- For the revised weather-based app, device location is optional and requires an explicit user action and browser permission; city selection remains available. Do not infer location from IP. The earlier fixed-radius restriction belongs to the legacy Open Prices version.
- Do not save shopper requests or place them in logs.
- Keep Cloudflare API credentials in GitHub Actions secrets and the Turnstile secret in the Worker secret store.
- The public Worker URL and Turnstile site key are intended for browser use. D1 and rate-limit IDs are resource identifiers, not secret credentials.
- Ignore local JSON/GZIP snapshots and Python cache files. The production catalog is in D1.
- Instacart was researched as a possible shopper handoff, not selected as a price feed or integrated.

## Proposal editing preference

- The user owns the proposal structure. Preserve every section title and its wording, required section order, and intentional spacing/separators exactly. Only edit or add body text when requested. Never rewrite headings. Leave the Developer note for the user to enter manually.
- When the user manually updates the proposal and requests proofreading, check grammar and spelling and report issues with suggested corrections. Preserve the user's wording and meaning; do not apply proposal edits unless requested. Suggestions may include the Developer Note, which remains for the user to edit manually.

## Current verification

- D1 import completed with 24,757 indexed products and 38,568 observations.
- A live meal response returned catalogSnapshot.ready=true and selected product price evidence from the saved catalog.
- The sample contained only prices older than 30 days; the Worker labeled those records older as designed.
- The mobile shell and documentation are being updated locally for the next Pages publish.


2026-11-17: User approved a guided screen flow, a single main-ingredient selector with specific vegetables, ingredient avoidance controls, and a flexible 30/60-minute AI preference with estimated total time.


2026-11-17: User requested separate location and forecast screens and a less scroll-heavy recipe. City selection uses an explicit continue button; successful device location advances automatically. Recipe uses Ingredients, Steps, and Nutrition tabs.


2026-11-17: User preferred removing the cooking time dropdown; keep a soft 30-minute AI prompt and show estimated total prep plus cooking time in the Steps tab. Explain balanced meal roles and highlight possibly missing roles.


2026-11-17: User requested required AI-estimated total prep and cooking time. Require a valid estimate on structured generated recipes and updated swaps; never invent a value when AI omits it.


2026-11-17: User clarified that missing AI cooking time must not cause a retry. Keep requesting a structured estimate; show time unavailable if missing or invalid, including after swaps. This supersedes the earlier strict time-validation decision.


2026-11-17: User approved a consistent top-left Back control and labeled gradient progress line, with a separate Change my choices action on the meal screen.


2026-11-17: User disliked the meal-screen Change my choices layout; removed the redundant bottom action. The top Back control returns to preferences, and Make another recipe remains at the bottom.


2026-11-17: Move the weather-and-bowl illustration to the first location screen; retain the shared brand header and compact forecast screen spacing.


2026-11-17: User approved moving the welcome line to the location screen and replacing the forecast hero with a compact Today’s forecast / A look outside heading.


2026-11-17: User clarified that the full “Today’s forecast. Tonight’s inspiration.” headline should move to the first screen together with the welcome line, rather than be removed.

- 2026-11-25: The user directed that PROPOSAL.md is reference-only and must never be edited. Update the final paper Markdown and PDF separately.

- 2026-11-25: User clarified Special Thanks and endnotes do not count toward the 2–4 reflection pages; a little over four reflection pages is acceptable. Turnstile troubleshooting took many hours over days; the Chrome challenge remained unresolved and appeared vendor-specific, without a confirmed cause.
