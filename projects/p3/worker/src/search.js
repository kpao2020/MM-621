// Match AI-provided grocery phrases against the saved D1 catalog and select source prices.

const MAX_CANDIDATES = 8;
const MAX_SEARCH_ROWS = 40;
const MAX_CONCURRENT_SEARCHES = 4;
const FRESH_DAYS = 30;
const STOP_WORDS = new Set(["a", "an", "and", "for", "of", "the", "to", "with"]);

function normalizedPhrase(value) {
  return String(value || "")
    .toLocaleLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .replace(/\s+/g, " ");
}

function makeSearchTerms(ingredient) {
  const phrases = [ingredient.name, ...(Array.isArray(ingredient.searchTerms) ? ingredient.searchTerms : [])];
  const terms = new Map();
  for (const [index, value] of phrases.entries()) {
    const phrase = normalizedPhrase(value).slice(0, 80);
    if (!phrase) continue;
    const phraseWeight = index === 0 ? 6 : 4;
    terms.set(phrase, Math.max(terms.get(phrase) || 0, phraseWeight));
    for (const word of phrase.split(" ")) {
      if (word.length < 2 || STOP_WORDS.has(word)) continue;
      terms.set(word, Math.max(terms.get(word) || 0, 1));
      if (word.length > 4 && word.endsWith("ies")) {
        const singular = `${word.slice(0, -3)}y`;
        terms.set(singular, Math.max(terms.get(singular) || 0, 1));
      } else if (word.length > 3 && word.endsWith("s") && !/(ss|us|is)$/.test(word)) {
        const singular = word.slice(0, -1);
        terms.set(singular, Math.max(terms.get(singular) || 0, 1));
      }
    }
  }
  return [...terms].map(([term, weight]) => ({ term, weight })).slice(0, 24);
}

function observationAgeDays(date, now) {
  const timestamp = Date.parse(`${date}T00:00:00Z`);
  if (!Number.isFinite(timestamp)) return null;
  return Math.max(0, Math.floor((now - timestamp) / 86_400_000));
}

function selectPrice(observations, now = Date.now()) {
  const rows = observations
    .filter((row) => Number.isFinite(row.price) && row.price > 0 && row.currency === "USD")
    .map((row) => ({ ...row, ageDays: observationAgeDays(row.date, now) }))
    .filter((row) => row.ageDays !== null);
  const recent = rows.filter((row) => row.ageDays <= FRESH_DAYS);
  if (recent.length) {
    recent.sort((a, b) => a.price - b.price || b.date.localeCompare(a.date) || a.priceId - b.priceId);
    return { row: recent[0], freshness: "recent", recentOptions: recent.length };
  }
  rows.sort((a, b) => b.date.localeCompare(a.date) || a.price - b.price || a.priceId - b.priceId);
  return rows.length ? { row: rows[0], freshness: "older", recentOptions: 0 } : null;
}

function parseJsonArray(value) {
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function candidateQuery(terms) {
  const score = terms.map(() => "CASE WHEN instr(products.search_text, ?) > 0 THEN ? ELSE 0 END").join(" + ");
  const matchExpression = terms
    .map(({ term }) => `"${term.replace(/"/g, '""')}"`)
    .join(" OR ");
  return {
    sql: `SELECT products.product_id, products.product_name, products.brands, products.quantity,
                 products.categories_json, products.observations_json, products.search_text,
                 (${score}) AS score
          FROM products_fts
          JOIN products ON products.product_id = products_fts.rowid
          WHERE products_fts MATCH ?
          ORDER BY score DESC, products.product_name ASC
          LIMIT ${MAX_SEARCH_ROWS}`,
    matchExpression,
  };
}

function toPrice(product, selected) {
  const row = selected.row;
  return {
    id: Number(row.priceId),
    productId: Number(product.product_id),
    productName: product.product_name,
    brand: product.brands || null,
    quantity: product.quantity || null,
    price: row.price,
    currency: row.currency,
    pricePer: row.pricePer || null,
    date: row.date,
    ageDays: row.ageDays,
    freshness: selected.freshness,
    recentPriceOptions: selected.recentOptions,
    source: row.source || null,
    store: row.store || "Store name unavailable",
    address: row.address || null,
    city: row.city || null,
    proofType: row.proofType || null,
  };
}

async function retrieveForIngredient(ingredient, env) {
  const terms = makeSearchTerms(ingredient);
  if (!terms.length) return { candidates: [], error: false };

  const query = candidateQuery(terms);
  const bindings = terms.flatMap(({ term, weight }) => [term, weight]);
  const response = await env.PRODUCT_DB.prepare(query.sql).bind(...bindings, query.matchExpression).all();
  const now = Date.now();
  const candidates = [];
  for (const product of response.results || []) {
    if (!(Number(product.score) > 0)) continue;
    const observations = parseJsonArray(product.observations_json);
    const selected = selectPrice(observations, now);
    if (!selected) continue;
    candidates.push({
      productId: Number(product.product_id),
      name: product.product_name,
      brand: product.brands || null,
      quantity: product.quantity || null,
      categories: parseJsonArray(product.categories_json),
      score: Number(product.score) || 0,
      price: toPrice(product, selected),
    });
    if (candidates.length === MAX_CANDIDATES) break;
  }
  return { candidates, error: false };
}

export async function findCandidatesForIngredients(ingredients, env) {
  if (!env.PRODUCT_DB) throw new Error("The product D1 database is not configured.");
  const results = new Array(ingredients.length);
  let next = 0;
  await Promise.all(Array.from({ length: Math.min(MAX_CONCURRENT_SEARCHES, ingredients.length) }, async () => {
    while (next < ingredients.length) {
      const index = next++;
      try {
        results[index] = await retrieveForIngredient(ingredients[index], env);
      } catch (error) {
        console.warn("D1 catalog retrieval failed for one ingredient.", error);
        results[index] = { candidates: [], error: true };
      }
    }
  }));
  return results;
}
