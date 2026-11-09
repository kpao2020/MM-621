// Open Prices searches for Basket Buddy.
// Products with barcodes and prices for loose foods use different API paths.

const API = "https://prices.openfoodfacts.org/api/v1";
const PAGE_SIZE = 100;
const MAX_CANDIDATES = 8;
const MAX_CONCURRENT_ITEMS = 4;

// Keep this list small and explicit: a broad food name must not become a meal or snack.
const PRODUCE = [
  { pattern: /\bstrawberr(?:y|ies)\b/, term: "strawberry", tags: ["en:strawberries"] },
  { pattern: /\bpotato(?:es)?\b/, term: "potato", tags: ["en:potatoes"] },
  { pattern: /\bcarrots?\b/, term: "carrot", tags: ["en:carrots"] },
  { pattern: /\bonions?\b/, term: "onion", tags: ["en:onions"] },
  { pattern: /\bcelery\b/, term: "celery", tags: ["en:celery-stalk"] },
  { pattern: /\bgarlic\b/, term: "garlic", tags: ["en:garlic"] },
  { pattern: /\btomato(?:es)?\b/, term: "tomato", tags: ["en:tomatoes"] },
];

const PROCESSED = /\b(jerky|dried meat|sausage|franks?|hot dogs?|patt(?:y|ies)|burgers?|meatballs?|chorizo|deli|canned|soup|broth|stock|bouillon|seasoning|sauce|gravy|meals?|prepared|fully cooked|cooked|rotisserie|breaded|nuggets?|plant based|vegan|vegetarian|liver|heart|kidney|ground|minced|homestyle|calories)\b/;
const PRODUCE_PROCESSED = /\b(jam|jelly|preserves?|yogurt|yoghurt|ice cream|flavou?r(?:ed)?|cereal|snacks?|candy|drink|smoothie|juice|bars?|sauce|paste|soup|chips?|powder)\b/;

function normalize(value) {
  return String(value || "").normalize("NFKD").replace(/[\u0300-\u036f]/g, "")
    .toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

function searchPlan(name) {
  const text = normalize(name);
  const isPrepared = /\b(broth|stock|bouillon|soup|sauce|gravy|seasoning|ground|minced|jerky|sausage|bacon|canned|cooked)\b/.test(text);
  if (!isPrepared && /\b(beef|steak|chuck|brisket|ribeye|rib eye|tri tip|sirloin)\b/.test(text)) {
    return { term: "beef", tags: ["en:beef-steaks"], kind: "beef", text };
  }
  if (!isPrepared && /\b(chicken|poultry)\b/.test(text)) {
    let tags = ["en:whole-chickens", "en:chicken-thighs", "en:chicken-drumsticks"];
    if (/\b(breast|breasts|tenderloin|tenderloins)\b/.test(text)) tags = ["en:chicken-breasts"];
    else if (/\b(thigh|thighs)\b/.test(text)) tags = ["en:chicken-thighs"];
    else if (/\b(drumstick|drumsticks|leg|legs)\b/.test(text)) tags = ["en:chicken-drumsticks"];
    else if (/\bwhole\b/.test(text)) tags = ["en:whole-chickens"];
    return { term: "chicken", tags, kind: "chicken", text };
  }
  if (/\bwhite rice\b/.test(text) && !/\b(fried|cooked|seasoned|pudding|flour)\b/.test(text.replace(/\buncooked\b/g, ""))) {
    return { term: "white rice", tags: ["en:white-rice"], kind: "rice", text };
  }
  if (text === "pepper" || text === "black pepper") return { term: "black pepper", tags: [], kind: "spice", text };
  const produce = PRODUCE.find((entry) => entry.pattern.test(text));
  if (produce && !PRODUCE_PROCESSED.test(text)) return { ...produce, kind: "produce", text };
  const words = text.split(" ").filter((word) => word && !["fresh", "raw", "ripe", "chopped"].includes(word));
  if (words.length) {
    const last = words.length - 1;
    if (words[last].endsWith("ies") && words[last].length > 5) words[last] = `${words[last].slice(0, -3)}y`;
    else if (words[last].endsWith("s") && words[last].length > 3 && !words[last].endsWith("ss")) words[last] = words[last].slice(0, -1);
  }
  return { term: words.join(" ").slice(0, 80), tags: [], kind: "other", text };
}

function productScore(plan, item) {
  const title = normalize(item.product_name);
  const categories = normalize((item.categories_tags || []).join(" "));
  if (!title) return 0;
  if (plan.kind === "beef" || plan.kind === "chicken") {
    const description = `${title} ${categories} ${normalize(item.brands)} ${normalize(item.quantity)}`;
    if (PROCESSED.test(description) || Number(item.nova_group) >= 3) return 0;
  }
  if (plan.kind === "beef" && /\bstew\b/.test(title) && !/\b(stew meat|stewing beef|beef cubes|diced beef)\b/.test(title)) return 0;
  if (plan.kind === "chicken") {
    if (/\b(breast|breasts|tenderloin|tenderloins)\b/.test(plan.text) && !/\b(breast|breasts|tenderloin|tenderloins)\b/.test(title)) return 0;
    if (/\b(thigh|thighs)\b/.test(plan.text) && !/\b(thigh|thighs)\b/.test(title)) return 0;
    if (/\b(drumstick|drumsticks|leg|legs)\b/.test(plan.text) && !/\b(drumstick|drumsticks|leg|legs)\b/.test(title)) return 0;
    if (/\bwhole\b/.test(plan.text) && !/\bwhole\b/.test(title)) return 0;
  }
  if (plan.kind === "produce" && PRODUCE_PROCESSED.test(title)) return 0;
  if (plan.kind === "rice" && /\b(cooked|fried|seasoned|seasoning|flour|pudding|cakes?|crackers?|curry|garnish|steamed|portable|sticky|beef|chicken|meals?)\b/.test(title)) return 0;
  if (plan.text === "salt" && (!/\bsalt\b/.test(title) || /\b(no salt|salt free|salt added|seasoned|garlic|onion|celery|flavoured|flavored|sauce|soup|chips|snack)\b/.test(title))) return 0;
  if (plan.kind === "spice" && /\b(sauce|seasoned|soup|chips|snack|salt)\b/.test(title)) return 0;
  if (!title.includes(plan.term)) return 0;
  const words = plan.text.split(" ").filter((word) => word.length > 2);
  return (title === plan.text ? 100 : 25) + words.filter((word) => title.includes(word)).length * 10;
}

async function getJSON(url) {
  const response = await fetch(url, { headers: { Accept: "application/json" }, signal: AbortSignal.timeout(12_000) });
  if (!response.ok) throw new Error(`Open Prices returned ${response.status}.`);
  const text = await response.text();
  if (text.length > 1_500_000) throw new Error("Open Prices response exceeded the size limit.");
  return JSON.parse(text);
}

function priceURL(center) {
  const url = new URL(`${API}/prices`);
  url.searchParams.set("lat", String(center.lat));
  url.searchParams.set("lon", String(center.lon));
  url.searchParams.set("radius_km", String(center.radiusKm));
  url.searchParams.set("currency", "USD");
  url.searchParams.set("size", String(PAGE_SIZE));
  url.searchParams.set("page", "1");
  return url;
}

async function productPrices(plan, center) {
  if (!plan.term) return { candidates: [], rows: [] };
  const url = new URL(`${API}/products`);
  url.searchParams.set("product_name__like", plan.term);
  url.searchParams.set("price_count__gte", "1");
  url.searchParams.set("size", String(PAGE_SIZE));
  url.searchParams.set("page", "1");
  const data = await getJSON(url);
  const candidates = (Array.isArray(data.items) ? data.items : [])
    .filter((item) => Number.isInteger(item?.id))
    .map((item) => ({ ...item, score: productScore(plan, item) }))
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score || (b.price_count || 0) - (a.price_count || 0))
    .slice(0, plan.kind === "rice" ? 30 : MAX_CANDIDATES);
  // An empty ID filter would search unrelated prices, so never send one.
  if (!candidates.length) return { candidates, rows: [] };
  const prices = priceURL(center);
  prices.searchParams.set("type", "PRODUCT");
  prices.searchParams.set("product_id__in", candidates.map((item) => item.id).join(","));
  const found = await getJSON(prices);
  const ids = new Set(candidates.map((item) => item.id));
  return { candidates, rows: (found.items || []).filter((row) => ids.has(row.product_id)) };
}

async function categoryPrices(tag, center) {
  const url = priceURL(center);
  url.searchParams.set("type", "CATEGORY");
  url.searchParams.set("category_tag", tag);
  const data = await getJSON(url);
  return (data.items || []).filter((row) => row.type === "CATEGORY" && row.category_tag === tag);
}

// Search locally tagged poultry as well: a globally ranked catalog page can miss local chicken.
async function nearbyPoultryPrices(plan, center) {
  const url = priceURL(center);
  url.searchParams.set("type", "PRODUCT");
  url.searchParams.set("product__categories_tags__contains", "en:poultries");
  const first = await getJSON(url);
  const rows = Array.isArray(first.items) ? first.items : [];
  if (Number(first.pages) > 1) {
    url.searchParams.set("page", "2");
    const second = await getJSON(url);
    if (Array.isArray(second.items)) rows.push(...second.items);
  }
  return rows.filter((row) => row.product && productScore(plan, row.product) > 0);
}

function makePrice(row, plan) {
  if (!Number.isFinite(row?.price) || row.price <= 0 || row.currency !== "USD" || row.duplicate_of != null) return null;
  const product = row.product || {};
  const location = row.location || {};
  const categoryName = String(row.category_tag || "").replace(/^en:/, "").replace(/-/g, " ");
  return {
    id: row.id, productId: row.product_id || null,
    productName: row.type === "CATEGORY" ? (row.product_name || categoryName) : (product.product_name || row.product_name || "Product name unavailable"),
    brand: product.brands || null, quantity: product.quantity || null,
    price: row.price, currency: row.currency, pricePer: row.price_per || null,
    date: row.date || null, source: row.source || row.proof?.source || null,
    store: location.osm_name || "Store name unavailable", address: location.osm_display_name || null,
    city: location.osm_address_city || null, proofType: row.proof?.type || null,
    matchType: row.type === "CATEGORY" && plan.kind === "beef" ? "broader beef category" : null,
  };
}

async function lookup(name, center) {
  const plan = searchPlan(name);
  const attempts = await Promise.allSettled([productPrices(plan, center), ...plan.tags.map((tag) => categoryPrices(tag, center)), ...(plan.kind === "chicken" ? [nearbyPoultryPrices(plan, center)] : [])]);
  const productResult = attempts[0].status === "fulfilled" ? attempts[0].value : { candidates: [], rows: [] };
  const categoryRows = attempts.slice(1).flatMap((entry) => entry.status === "fulfilled" ? entry.value : []);
  const rows = [...productResult.rows, ...categoryRows].map((row) => makePrice(row, plan)).filter(Boolean);
  // Compare the returned amounts, but keep the unit/size visible: a package and a kg are not equivalent.
  rows.sort((a, b) => a.price - b.price || String(b.date || "").localeCompare(String(a.date || "")));
  const failed = attempts.some((entry) => entry.status === "rejected");
  if (failed) {
    // Report only the failure type, never the shopper's ingredient or request.
    const failures = attempts.filter((entry) => entry.status === "rejected").map((entry) => {
      const error = entry.reason;
      const httpStatus = /^Open Prices returned (\d{3})\.$/.exec(String(error?.message || ""));
      if (httpStatus) return `HTTP ${httpStatus[1]}`;
      if (error?.name === "TimeoutError" || error?.name === "AbortError") return "timeout";
      if (error instanceof SyntaxError) return "invalid JSON";
      if (error?.message === "Open Prices response exceeded the size limit.") return "response too large";
      return "other error";
    });
    console.warn("Open Prices lookup errors:", failures.join(", "));
  }
  return {
    requestedName: name,
    prices: rows.slice(0, 1),
    status: rows.length ? "ok" : failed ? "error" : "unmatched",
    partial: failed && rows.length > 0,
  };
}

export async function findPricesForProducts(products, center) {
  const results = new Array(products.length);
  let next = 0;
  await Promise.all(Array.from({ length: Math.min(MAX_CONCURRENT_ITEMS, products.length) }, async () => {
    while (next < products.length) {
      const index = next++;
      try { results[index] = await lookup(products[index], center); }
      catch (error) {
        console.warn("Open Prices lookup failed for an ingredient.", error);
        results[index] = { requestedName: products[index], prices: [], status: "error" };
      }
    }
  }));
  return results;
}
