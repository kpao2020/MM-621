# Basket Buddy — Agent Notes

## Working rules

- Work inside projects/p3; the repository-level P3 GitHub Actions workflow and root .gitignore entries for P3 downloads are in scope.
- Work one task at a time. State the current step, complete it, and save progress before moving on.
- During active work, send a concise progress/status update at least every two minutes.
- Record confirmed decisions in memory.md and status changes in tracking.md. Ask only when a missing decision blocks implementation.
- Keep credentials out of source, docs, logs, screenshots, and Git history. The user enters secrets directly in Cloudflare/GitHub settings.
- Use the fixed Hayward center and 50-mile radius. Do not request browser location or infer location from IP.
- Keep sketch.js as the main p5.js file; use focused JS components loaded before it.
- Design Basket Buddy as a mobile app shell: narrow centered viewport, centered brand and main prompt, thumb-friendly full-width actions, and concise status. Keep product names and price facts easy to scan.
- Keep the interaction playful, compact, and clear. Use explicit loading/error states; avoid chart gridlines.
- Use text input. Voice and microphone input remain future features.
- Aim for 12 or fewer grocery ingredients, with a hard cap of 16. Simplify elaborate requests to one simple meal.
- Flow: Workers AI drafts ingredients and close catalog search phrases; D1 returns candidates; Workers AI selects only returned IDs; code validates selections and returns exact D1 evidence.
- A substitute may be selected only for an ingredient marked replaceable. If no suitable candidate exists, show “Price unavailable.” Do not claim a price record confirms current stock.
- Never issue product-by-product Open Prices API requests during a meal request. The scheduled refresh checks one newest regional ID, downloads bulk data only when needed, and reconciles weekly.
- Choose the lowest valid USD price in the past 30 days; if none exist, show the newest older record with its age. Never use AI for price facts.
- Keep package sizes and units visible; do not normalize them without an approved approach. Do not combine currencies.
- Preserve Open Prices attribution and ODbL obligations.
- Keep future ideas (ordering, alerts, location, single-product search) in the roadmap. Avoid duplicate documents.
- Do not run tests unless the user asks for testing or verification.

## Continuity files

- PROPOSAL.md: project rationale, research, and delivery plan.
- requirements.md: product behavior and completion criteria.
- DATA-PIPELINE.md: D1 storage, daily update behavior, and operating steps.
- tracking.md: current implementation status and remaining user review.
- memory.md: durable decisions.
- p3.log: dated progress notes.
- readme.md: project overview and handoff.
