# Forecast Meal: user review queue

Work one item at a time. Stop after each item and get the user's confirmation before proceeding. Items may change during review.

1. **Reviewed** — Remove D1 from Forecast Meal. User reported no Worker D1 binding, disabled the GitHub workflow, deleted the D1 database, and committed and pushed the workflow-file removal; PR deferred until remaining items are complete.
2. **Reviewed** — The shared five-per-day limit and D1 counter are absent. The separate existing per-IP burst limit of five requests per minute remains.
3. **Reviewed** — Changed the wording to “Verify you're human” and moved verification to the footer. The verified widget collapses to a “✓ Verified: human” badge and returns when verification expires or resets.
4. **Reviewed** — Added Balanced (vegetable, protein, grain or starch) and Meat eater (meat or poultry) choices, with corresponding Worker validation.
5. **Reviewed** — Added preferred cuisines: American, Chinese, Filipino, French, Greek, Indian, Italian, Japanese, Korean, Mexican, Middle Eastern, Spanish, Thai, and Vietnamese, plus no preference. Eating style and preferred cuisine each have an inline label and dropdown, with spacing between rows.
6. **Reviewed** — Changed “Leave out” to “Ingredients to exclude.”
7. **Reviewed** — Removed “there is no open-ended meal prompt” from the ingredient section.
8. **Reviewed** — Removed “Class prototype” from the top.
9. **Reviewed** — Centered Forecast Meal in the top bar.
10. **Reviewed** — Replaced the FM initials with a sun and meal-bowl mark.
11. **Reviewed** — Kept “Use my location,” changed the result label to “Your location,” and simplified the notice to consistently say “location.”
12. **Reviewed for now** — Made forecast periods compact with an icon, temperature, short condition and expandable details. Forecast data remains available for AI. Discuss a mobile-first screen-based p5.js experience during week 3.
13. **Reviewed** — Set the default recipe serving to one.
14. **Reviewed** — Centered selected text in all dropdowns. Servings matches the eating style and cuisine rows and appears below cuisine, before ingredient exclusions.
15. **Reviewed** — Ingredient exclusions start as a compact expandable row; selected checkboxes remain selected when closed.
16. **Reviewed** — Moved the diet and ingredient note below the recipe button.

17. **Awaiting publication and end-to-end review** — Deployed the recipe Worker with GitHub Pages as its only allowed browser origin and Turnstile hostname. User requested removal of local-address support. Publish the updated frontend through the user’s PR, then confirm a recipe request on GitHub Pages.
18. **Done locally; awaiting review** — Rename the recipe instructions heading to “Simple Cooking Steps.”
19. **Done locally; awaiting review** — After a recipe request, stop the Turnstile widget and defer a new verification until the user requests another recipe or chooses to verify for a retry.
