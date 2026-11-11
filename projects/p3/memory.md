# Basket Buddy — Project Memory

Last updated: 2026-11-11

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

## Current verification

- D1 import completed with 24,757 indexed products and 38,568 observations.
- A live meal response returned catalogSnapshot.ready=true and selected product price evidence from the saved catalog.
- The sample contained only prices older than 30 days; the Worker labeled those records older as designed.
- The mobile shell and documentation are being updated locally for the next Pages publish.
