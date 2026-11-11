# Open Prices radius expansion check

Retrieved 2026-11-10 for the Hayward center (37.6688, -122.0808). The 30-day query includes records dated 2026-10-11 through the API's latest observed date, 2026-11-07. This is a live snapshot, not a promise of current shelf price or inventory.

## Coverage by radius

| Search radius | All-time API observations | USD product observations in past 30 days | Distinct products in past 30 days | Store/city pairs |
|---|---:|---:|---:|---:|
| 50 miles | 42,342 | 3,904 | 3,655 | 8 |
| 200 miles | 42,539 | 3,907 | 3,657 | 10 |
| 300 miles | 42,541 | 3,907 | 3,657 | 10 |

The 300-mile search adds 199 all-time observations and only 3 recent observations versus 50 miles. Going from 200 to 300 miles adds 2 all-time observations and no recent observations. On this snapshot, a larger radius does not materially improve fresh coverage.

## Meat, seafood, and produce signal

Broad product-name and category-tag matching in the 300-mile 30-day records found:

| Broad match | Price observations | Distinct products |
|---|---:|---:|
| Meat-related terms | 422 | 401 |
| Seafood/fish-related terms | 99 | 94 |
| Produce/fruit/vegetable-related terms | 686 | 650 |

These are candidate counts, not verified fresh-ingredient counts. The source data does not consistently distinguish raw ingredients from prepared meals, pet food, juice, preserves, or other processed products. For example, text matching can include a chicken bowl or salmon pet food as well as a plain ingredient. Category tags also miss many fresh items. The produce number in particular overstates directly useful whole-produce prices. A curated filter and manual review are needed before treating these as clean food coverage.

## Project implication

The main limitation is sparse and inconsistently classified contributions, not the current 50-mile boundary. Keep the app at 50 miles for now; a broader radius adds little recent evidence while making the geographic meaning of a result less useful. Consider collecting a small set of user-contributed, proof-backed fresh-ingredient observations or testing a retailer-specific source separately.

## Method

- Queried the Open Prices production API around the existing Hayward center at 50, 200, and 300 miles.
- Downloaded the 30-day result pages in stable descending price-ID order and verified each result had a unique price ID.
- Counted USD `PRODUCT` rows with a positive numeric price and no `duplicate_of` value. Distinct products are counted by product ID.
- Category candidates use broad product-name and Open Food Facts category-tag keywords; they are intentionally labeled estimates due to metadata quality.
- Raw JSON snapshots were saved temporarily under `/private/tmp/open-prices-hayward-{50,200,300}mi-30d-2026-11-10.json`; they are not committed to the repository.

Open Prices data is community contributed. Cite Open Prices as the source and follow its ODbL obligations when redistributing a database or derived database. See the [Open Prices API documentation](https://prices.openfoodfacts.org/api/docs) and [API license guidance](https://github.com/openfoodfacts/open-prices/blob/main/API.md).
