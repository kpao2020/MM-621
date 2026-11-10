# Basket Buddy — Prototype Requirements

Status: D1-backed meal search is deployed and confirmed by a live response. A mobile-first visual refresh is being prepared for the next Pages publish.

## Meal flow

1. Accept one text request for one simple meal. Do not save a profile or meal history.
2. Ask Workers AI to draft a concise grocery list, preferring 12 or fewer ingredients and enforcing a hard limit of 16.
3. Ask Workers AI for up to four close catalog phrases per ingredient.
4. Search the saved D1 catalog and return up to eight candidates for each ingredient.
5. Ask Workers AI to select only candidate IDs returned for that ingredient. A substitute is allowed only when the ingredient is marked replaceable.
6. Validate the selected IDs in code. If there is no suitable candidate, show “Price unavailable.”
7. Read all price, store, date, unit, and source facts from D1. Never accept these facts from model output.

## Price display

- Use valid, positive USD observations with a parseable date.
- When observations within 30 days exist, choose the lowest among them.
- Otherwise choose the newest older observation and show “Older price · last seen N days ago.”
- Show product name, package size when available, amount, store/location, observation date, and source record.
- Do not compare different package sizes as unit value; do not combine currencies.
- Exclude unavailable items from the estimated total. If a selected price is by weight or volume and the requested amount is unknown, show the total as unavailable.
- State that prices are community-reported and do not confirm live stock.

## Catalog and refresh

- Search a fixed 50-mile radius around Hayward (37.6688, -122.0808; 80.4672 km).
- The scheduled workflow checks one latest regional price ID every 24 hours.
- Skip the full download when the latest ID is unchanged, D1 is ready, and the weekly audit is not due.
- Import the full regional result when the ID changes, the catalog is unready, or the weekly reconciliation is due.
- Keep the catalog marked unready until a full import finishes successfully.
- Store named product records, their price observations, searchable text, and catalog metadata in D1.
- Preserve Open Prices attribution and ODbL obligations.

## Privacy and safety

- Do not request or infer shopper location. Use the fixed Hayward search area.
- Do not persist meal requests or include request content in logs.
- Require valid Turnstile verification and retain the per-IP rate limit.
- Keep API credentials and the Turnstile secret outside source files and Git history. Public configuration may contain the Worker URL and Turnstile site key.
- Keep raw local Open Prices snapshots out of Git.

## Verified behavior

- The initial D1 import completed with 24,757 indexed products and 38,568 price observations.
- The deployed Worker returned catalogSnapshot.ready=true, plus product candidates and exact recorded price evidence in a live meal response.
- The sample returned older prices because none of its selected products had an observation within 30 days.

## Remaining review

- Review the centered mobile app shell on the published GitHub Pages page after the current CSS and documentation changes are pushed.
- Keep the catalog’s coverage, price age, and missing package data visible as prototype limitations.
