-- FTS5's inverted index narrows ingredient searches before product scoring.
-- Product content remains in the products table; only searchable terms are indexed.
CREATE VIRTUAL TABLE IF NOT EXISTS products_fts USING fts5(
  search_text,
  content='products',
  content_rowid='product_id',
  tokenize='unicode61 remove_diacritics 2'
);

CREATE TABLE IF NOT EXISTS catalog_search_meta (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  index_version INTEGER NOT NULL DEFAULT 0
);

INSERT OR IGNORE INTO catalog_search_meta (id, index_version) VALUES (1, 0);
