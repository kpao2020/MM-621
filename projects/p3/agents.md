# Basket Buddy — Agent Notes

## Working rules

- Work only inside `projects/p3` unless the user explicitly authorizes another path.
- Respect the user's preference to do one task at a time. State the current step, complete it, and save progress before moving to another step.
- Do not guess at project decisions. Mark unknowns in `memory.md` and `tracking.md`, and ask when a decision blocks implementation.
- Keep all credentials and secret values out of this public repository, local files, examples, logs, screenshots, and Git history. The user will create secrets in Cloudflare; never request that they paste a secret into chat.
- Use the fixed Hayward center and 50-mile radius for MVP price searches. Do not request browser location or infer location from IP.
- Keep `sketch.js` as the main p5.js file. Put focused behaviors in separate JS component files, loaded before `sketch.js` from `index.html`.
- Match the P1/P2 style: descriptive file headers, section comments, explanatory inline comments, clear constants, and explicit loading/error states.
- Keep the design mobile-first, friendly, playful, and eye-friendly. Do not use chart gridlines or game-like framing.
- Use text input for the MVP. Voice and microphone input are future features.
- Keep model responses schema-limited and short. Prices, store locations, dates, and currencies must come from API data, never model invention.
- Show the price unit and product size when available in the source. Unit conversion and normalized value comparison have not been approved; discuss the approach with the user before implementing it.
- Support one simple personalized meal request capped at 10 unique grocery products. Make one AI call for the list, then call Open Prices for those products.
- In the meal-generation prompt, favor familiar, commonly stocked Bay Area grocery items. Treat AI familiarity as a heuristic, not verified inventory or price coverage.
- If a product has no suitable price record, show “Price unavailable.” Do not add substitute suggestions or a follow-up AI call to the MVP; substitutions are a future feature.
- Do not fetch whole Open Prices exports for a user request. Apply strict query/page/result caps and display no more than three price records per product, sorted by price within the same currency. Label the search area as within 50 miles of Hayward; results may be outside the Bay Area.
- Label the total “Estimated total” and calculate it using the lowest available returned price per product. Show the note “Based on the lowest returned price for each available item. Items without prices are not included.” Do not combine currencies or show zero when every price is unavailable.
- Keep a visible one-line Open Prices attribution/disclaimer linked to the source and ODbL 1.0 license. Do not claim the disclaimer alone settles every ODbL obligation; preserve the source/license requirements in the project docs.
- Do not add a formal PRD or duplicate documents without a clear need. `requirements.md` is the acceptance checklist; `PROPOSAL.md` is the project plan.
- Keep future ideas (retailer checkout/home delivery, price-drop alerts, browser location, and single-product search) in the roadmap only; do not implement them as part of the MVP. In the proposal, mention future features only in its Future Features section.
- Do not run tests unless the user asks for testing or verification.

## Continuity files

- `PROPOSAL.md`: project direction and weekly plan.
- `requirements.md`: behavior and acceptance criteria.
- `tracking.md`: task status and weekly progress.
- `memory.md`: current decisions and unresolved choices.
- `p3.log`: append-only dated progress notes.
- `readme.md`: project overview and handoff entry point.

Update the relevant continuity files when a user confirms a decision or when work is completed. Never log secrets.
