// Compact results and estimates. All API and model text is escaped before rendering.
window.BasketBuddyResults = {
  render(data) {
    const items = Array.isArray(data.products) ? data.products : [];
    document.getElementById("meal-title").textContent = data.mealName || "Your meal";
    document.getElementById("result-area").textContent = `${data.searchArea?.radiusMiles || 50} miles from Hayward`;
    document.getElementById("product-results").innerHTML = items.map(renderProduct).join("");
    const total = renderTotals(items);
    document.getElementById("estimated-total").innerHTML = total.value;
    document.getElementById("total-note").textContent = total.note;
    document.getElementById("api-json").textContent = JSON.stringify(data, null, 2);
    document.getElementById("updated-at").textContent = `Data checked ${formatDateTime(data.generatedAt)}`;
    document.getElementById("token-usage").textContent = `Model tokens: ${formatUsage(data.usage)}`;
    document.getElementById("results-section").hidden = false;
  },

  clear() {
    document.getElementById("results-section").hidden = true;
  },
};

function renderProduct(item) {
  const price = Array.isArray(item.prices) ? item.prices[0] : null;
  const icon = ingredientIcon(item.requestedName);
  const name = escapeHTML(item.requestedName);
  if (!price) {
    const note = item.status === "error" ? "Price lookup unavailable" : "Price unavailable";
    return `<article class="product-card unavailable-card"><span class="ingredient-icon" aria-hidden="true">${icon}</span><span class="ingredient-name">${name}</span><span class="compact-unavailable">${note}</span></article>`;
  }

  const place = price.address || [price.store, price.city].filter(Boolean).join(", ");
  const facts = [price.brand, price.quantity].filter(Boolean).map(escapeHTML).join(" · ");
  const matchNote = price.matchType ? `<p class="match-note">Broader beef match; check the cut.</p>` : "";
  const partialNote = item.partial ? `<p class="match-note">Some price searches could not be completed.</p>` : "";
  const recordLink = Number.isInteger(price.id)
    ? `<a href="https://prices.openfoodfacts.org/api/v1/prices/${price.id}" target="_blank" rel="noreferrer">View price record ↗</a>` : "";

  return `<details class="product-card">
    <summary class="product-summary">
      <span class="ingredient-icon" aria-hidden="true">${icon}</span>
      <span class="ingredient-copy"><strong>${name}</strong><span>${escapeHTML(price.productName)}</span></span>
      <span class="compact-price">${formatMoney(price.price, price.currency)}<small>${escapeHTML(formatUnit(price.pricePer))}</small></span>
      <span class="expand-arrow" aria-hidden="true">⌄</span>
    </summary>
    <div class="product-details">
      ${facts ? `<p>${facts}</p>` : ""}
      <p>${escapeHTML(place || "Store location unavailable")}</p>
      <p>Recorded ${escapeHTML(formatDate(price.date))}</p>
      ${matchNote}${partialNote}${recordLink}
    </div>
  </details>`;
}

function ingredientIcon(name) {
  const text = String(name || "").toLowerCase();
  if (/chicken|poultry/.test(text)) return "🍗";
  if (/fish|salmon|tuna/.test(text)) return "🐟";
  if (/beef|steak|pork|meat/.test(text)) return "🥩";
  if (/carrot/.test(text)) return "🥕";
  if (/potato/.test(text)) return "🥔";
  if (/onion|garlic/.test(text)) return "🧅";
  if (/strawberr|berr/.test(text)) return "🍓";
  if (/tomato/.test(text)) return "🍅";
  if (/bread/.test(text)) return "🍞";
  if (/milk|cheese|butter/.test(text)) return "🥛";
  return "🛒";
}

function renderTotals(items) {
  const prices = items.map((item) => Array.isArray(item.prices) ? item.prices[0] : null).filter(Boolean);
  if (!prices.length) return { value: '<span class="total-unavailable">Unavailable</span>', note: "No prices were returned." };
  if (prices.some((price) => price.pricePer && price.pricePer !== "UNIT")) {
    return { value: '<span class="total-unavailable">Unavailable</span>', note: "Some prices are per weight; the amount needed is unknown." };
  }
  const totals = new Map();
  for (const price of prices) {
    if (!Number.isFinite(price.price)) continue;
    const currency = price.currency || "Unknown currency";
    totals.set(currency, (totals.get(currency) || 0) + price.price);
  }
  return {
    value: [...totals.entries()].map(([currency, amount]) => `<span class="total-amount">${escapeHTML(formatMoney(amount, currency))}</span>`).join('<span class="total-separator">·</span>'),
    note: "One returned amount per available item; missing items are excluded. Sizes vary.",
  };
}

function formatUnit(unit) {
  if (unit === "KILOGRAM") return "/ kg";
  if (unit === "UNIT") return "/ each";
  if (unit === "LITER") return "/ L";
  return unit ? `/ ${String(unit).toLowerCase()}` : "";
}

function formatMoney(amount, currency) {
  if (!Number.isFinite(amount)) return "Price unavailable";
  try { return new Intl.NumberFormat("en-US", { style: "currency", currency: currency || "USD" }).format(amount); }
  catch { return `${amount.toFixed(2)} ${currency || ""}`; }
}

function formatDate(value) {
  if (!value) return "date unavailable";
  const parsed = new Date(`${value}T00:00:00`);
  return Number.isNaN(parsed.getTime()) ? value : new Intl.DateTimeFormat("en-US", { dateStyle: "medium" }).format(parsed);
}

function formatDateTime(value) {
  if (!value) return "time unavailable";
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? "time unavailable" : new Intl.DateTimeFormat("en-US", { dateStyle: "medium", timeStyle: "short" }).format(parsed);
}

function formatUsage(usage) {
  const input = Number.isFinite(usage?.promptTokens) ? usage.promptTokens : null;
  const output = Number.isFinite(usage?.completionTokens) ? usage.completionTokens : null;
  return input === null && output === null ? "unavailable" : `${input ?? "—"} in / ${output ?? "—"} out`;
}

function escapeHTML(value) {
  return String(value ?? "").replace(/[&<>"']/g, (character) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  })[character]);
}
