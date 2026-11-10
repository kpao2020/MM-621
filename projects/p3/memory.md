# Basket Buddy — Project Memory

Last updated: 2026-11-09

## Product direction

Basket Buddy is a mobile-first p5.js prototype that plans one simple meal and searches a saved Open Prices catalog within 50 miles of Hayward, California (37.6688, -122.0808).

## Confirmed behavior

- Workers AI drafts ingredients and close search phrases; D1 searches the saved catalog; a second Workers AI call selects only returned candidate IDs.
- Worker code validates each candidate. Substitutes are permitted only for replaceable ingredients; otherwise an unmatched ingredient remains “Price unavailable.”
- Keep lists concise: aim for 12 or fewer items and enforce a hard limit of 16.
- Prefer the lowest valid USD price observed in the past 30 days. If there is no recent observation, show the newest older observation and its age.
- Price facts, location, package information, and dates come from the catalog, never from model output.
- Daily refresh checks one newest regional record ID. It downloads and imports the region only after a change, an unready state, or for the weekly reconciliation.
- Catalog data is community-reported; it does not confirm current inventory.
- Keep Open Prices attribution and ODbL terms visible.

## Privacy and repository

- Keep the search radius fixed. Do not infer location from IP or request browser location.
- Do not save shopper requests or place them in logs.
- Keep Cloudflare API credentials in GitHub Actions secrets and the Turnstile secret in the Worker secret store.
- The public Worker URL and Turnstile site key are intended for browser use. D1 and rate-limit IDs are resource identifiers, not secret credentials.
- Ignore local JSON/GZIP snapshots and Python cache files. The production catalog is in D1.
- Instacart was researched as a possible shopper handoff, not selected as a price feed or integrated.

## Current verification

- D1 import completed with 24,757 indexed products and 38,568 observations.
- A live meal response returned catalogSnapshot.ready=true and selected product price evidence from the saved catalog.
- The sample contained only prices older than 30 days; the Worker labeled those records older as designed.
- The mobile shell and documentation are being updated locally for the next Pages publish.
