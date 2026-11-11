# Basket Buddy — Project Tracker

Last updated: 2026-11-09

## Status

The D1-backed flow is operational. The user reports that the implementation commits have been merged into main. The refresh workflow has seeded D1, the Worker is deployed, and a live meal request returned the saved catalog metadata and price evidence. This wrap-up updates the mobile layout and project documentation; those local edits still need to be pushed and published through the Pages branch.

## Completed

- [x] Created and bound the D1 catalog database.
- [x] Added the product and catalog metadata schema.
- [x] Imported the 50-mile Open Prices region: 24,757 indexed products and 38,568 observations.
- [x] Built daily one-ID change detection, conditional regional refresh, and weekly full reconciliation.
- [x] Stored product observations in D1; meal requests no longer query Open Prices product by product.
- [x] Connected Workers AI meal planning, AI phrase expansion, D1 candidate retrieval, and candidate-ID validation.
- [x] Enforced the 12-item preference, 16-item hard limit, replaceable-only substitutes, and 30-day freshness-first price selection.
- [x] Deployed the Worker and confirmed a live response with catalogSnapshot.ready=true.
- [x] Kept credentials out of repository files; API credentials are configured in service secret settings.
- [x] Added Open Prices attribution and age/inventory caveats.
- [x] Ignored local regional JSON/GZIP downloads and Python cache files.
- [x] Replaced the per-ingredient full catalog scan with an FTS5-backed D1 search; added an idempotent index migration and refresh rebuild logic.

## This wrap-up

- [ ] Review the centered mobile app shell on the published page after pushing the CSS update.
- [ ] Push the documentation, ignore-rule, and mobile-layout changes from the current branch.
- [ ] Verify the Pages publish after the user syncs the merged branch.
- [ ] Apply the FTS5 index migration/rebuild with the D1 refresh workflow, then deploy the updated Worker.

## Standing proposal-format requirement

- Preserve the user's exact proposal section titles and wording, required section order, and intentional blank lines/separators. Modify body content only when requested. Do not rewrite, rename, or reorder headings. Leave the Developer note for the user to type manually.

See DATA-PIPELINE.md for operations and open-prices-hayward-50mi-analysis.md for the historical snapshot analysis.
