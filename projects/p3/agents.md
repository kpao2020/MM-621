# Forecast Meal — Agent Notes

## Working rules

- Work inside projects/p3; the repository-level P3 GitHub Actions workflow and root .gitignore entries for P3 downloads are in scope.
- Work one task at a time. State the current step, complete it, and save progress before moving on.
- Follow review-queue.md and obtain the user's confirmation before moving to each next item.
- During active work, send a concise progress/status update at least every two minutes.
- Record confirmed decisions in memory.md and status changes in tracking.md. Ask only when a missing decision blocks implementation.
- For PROPOSAL.md, preserve the user's exact section titles and wording, section order, required sections, and deliberate blank-line/separator formatting. Edit body context only when asked; never rename, rewrite, reorder, or normalize headings. Leave the Developer note for the user to type manually.
- Keep credentials out of source, docs, logs, screenshots, and Git history. The user enters secrets directly in Cloudflare/GitHub settings.
- Follow PROPOSAL.md and confirmed user decisions for Forecast Meal. Six preset cities and explicit, one-time device location are authorized; never request permission automatically or infer location from IP.
- Forecasts use NWS points -> properties.forecast, not station observations. Respect the forecast time zone and remaining periods today. Keep device coordinates out of persistence, application logs, and AI inputs.
- The active page is forecast-only. The existing Basket Buddy backend and refresh tooling are legacy; do not reconnect the old free-text meal request or price search to the forecast interface.
- Keep sketch.js as the main p5.js file; use focused JS components loaded before it.
- Design Forecast Meal as a mobile app shell: narrow centered viewport, centered main prompt, thumb-friendly full-width actions, and concise status. Keep the location and forecast easy to scan.
- Keep the interaction playful, compact, and clear. Use explicit loading/error states; avoid chart gridlines.
- The planned meal interface uses fixed dietary, exclusion, and serving choices. No unrestricted meal prompt; voice and microphone input remain outside scope.
- Legacy Basket Buddy only (the price/search rules below do not define Forecast Meal): aim for 12 or fewer grocery ingredients, with a hard cap of 16. Simplify elaborate requests to one simple meal.
- Legacy Basket Buddy only: Workers AI drafts product searches; D1 returns candidates; AI selects returned IDs; code returns exact stored price evidence.
- Legacy Basket Buddy only: a catalog substitute may be selected only for a replaceable item; price records do not confirm current stock.
- Legacy Basket Buddy only: do not issue product-by-product Open Prices requests; the scheduled catalog refresh does conditional bulk downloads.
- Legacy Basket Buddy only: prefer the lowest recent valid USD price, otherwise show the newest older observation; never use AI for price facts.
- Legacy Basket Buddy only: keep package sizes and units visible; do not combine currencies.
- Preserve Open Prices attribution and ODbL obligations.
- Keep ordering, grocery prices, store inventory, and meal history outside Forecast Meal scope. Avoid duplicate documents.
- Do not run tests unless the user asks for testing or verification.

## Continuity files

- PROPOSAL.md: project rationale, research, and delivery plan.
- requirements.md: product behavior and completion criteria.
- DATA-PIPELINE.md: D1 storage, daily update behavior, and operating steps.
- tracking.md: current implementation status and remaining user review.
- memory.md: durable decisions.
- p3.log: dated progress notes.
- readme.md: project overview and handoff.
