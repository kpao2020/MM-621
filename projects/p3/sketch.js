/*
  Name: Ken Pao
  Class: MM-621
  Project 3: Forecast Meal

  Description:
    - Main p5.js sketch and controls for the weather and recipe experience.
    - Draws the forecast illustration and custom ingredient icons.
    - Manages location selection, forecast display, recipe choices, and swaps.

  Note:
    - HTML controls provide the interactive form and accessible status messages.
    - Device coordinates are not saved or sent to the recipe service.

  References:
    - p5.js: https://p5js.org/reference/
    - National Weather Service API: https://www.weather.gov/documentation/services-web-api
    - Browser Geolocation API: https://developer.mozilla.org/en-US/docs/Web/API/Geolocation

  Credits:
    - p5.js for the forecast illustration and ingredient drawings.
    - National Weather Service API for forecast data.
    - OpenAI ChatGPT (Codex) for code assistance and optimization suggestions.

  Code Origin:
    - [ORIGINAL SKETCH + AI-ASSISTED REVISIONS]
*/

let illustrationWeather = null;
let illustrationReady = false;

// ============================================================
// INGREDIENT AVOID CHOICES
// These options are shared with the recipe request and its controls.
// ============================================================
const EXCLUSION_CHOICES = [
  ["dairy", "Dairy"], ["eggs", "Eggs"], ["soy", "Soy"], ["tree_nuts", "Tree nuts"],
  ["peanuts", "Peanuts"], ["gluten", "Wheat / gluten"], ["mushrooms", "Mushrooms"],
  ["tomatoes", "Tomatoes"], ["onions", "Onions"], ["garlic", "Garlic"],
  ["bell_peppers", "Bell peppers"], ["sugar", "Sugar"], ["cilantro", "Cilantro"], ["beans", "Beans and lentils"],
  ["fish", "Fish"], ["shellfish", "Shellfish"], ["beef", "Beef"], ["pork", "Pork"], ["poultry", "Chicken and turkey"],
];
const EXCLUSION_ICONS = {
  dairy: "🥛", eggs: "🥚", soy: "🫘", tree_nuts: "🌰", peanuts: "🥜", gluten: "🌾",
  mushrooms: "🍄", tomatoes: "🍅", onions: "🧅", garlic: "🧄", bell_peppers: "🫑", sugar: "sugar",
  cilantro: "🌿", beans: "🫘", fish: "🐟", shellfish: "🦐", beef: "🥩", pork: "🥩", poultry: "🍗",
};

// ============================================================
// CHOOSE INGREDIENT ICON
// Match common ingredient names to an emoji or a custom p5 drawing.
// ============================================================
function ingredientIcon(name) {
  const icons = [
    [/\b(broth|stock|bouillon)\b/i, "🍲"], [/\b(noodles?|pasta|spaghetti|linguine|ramen)\b/i, "🍜"],
    [/\bwater\b/i, "💧"], [/\b(soy sauce|tamari)\b/i, "sauce"], [/\b(sugar|sweetener)\b/i, "sugar"],
    [/\b(black pepper|white pepper|peppercorns?|ground pepper)\b/i, "pepper"],
    [/\b(salt)\b/i, "🧂"], [/\boil\b/i, "oil"], [/\bvinegar\b/i, "sauce"],
    [/\b(onions?|shallots?)\b/i, "🧅"], [/\bgarlic\b/i, "🧄"], [/\b(tomatoes|tomato)\b/i, "🍅"],
    [/\b(mushrooms?|shiitake)\b/i, "🍄"], [/\b(bell peppers?|capsicum)\b/i, "🫑"],
    [/\b(chicken|turkey|poultry)\b/i, "🍗"], [/\b(beef|pork|steak)\b/i, "🥩"],
    [/\b(shrimp|prawns?)\b/i, "🦐"], [/\b(fish|salmon|tuna|cod)\b/i, "🐟"],
    [/\beggs?\b/i, "🥚"], [/\b(milk|cream|yogurt)\b/i, "🥛"], [/\bcheese\b/i, "🧀"],
    [/\b(beans?|lentils?|chickpeas?)\b/i, "🫘"], [/\b(peanuts?)\b/i, "🥜"],
    [/\brice\b/i, "🍚"], [/\b(wheat|flour)\b/i, "🌾"], [/\b(carrots?)\b/i, "🥕"],
    [/\b(potatoes|potato)\b/i, "🥔"], [/\b(broccoli)\b/i, "🥦"], [/\b(lemon|lime)\b/i, "🍋"],
    [/\b(spinach|lettuce|cabbage|kale)\b/i, "🥬"], [/\b(cilantro|parsley|basil|herbs?)\b/i, "🌿"],
  ];
  return icons.find(([pattern]) => pattern.test(name))?.[1] || "🫙";
}

// ============================================================
// P5 INGREDIENT ICON CACHE
// Draw each custom icon once and reuse it when the ingredient list changes.
// ============================================================
const ingredientIconGraphics = new Map();

// ============================================================
// CREATE INGREDIENT ICON
// Use a p5 drawing when available and an emoji fallback otherwise.
// ============================================================
function makeIngredientIcon(symbol) {
  const icon = document.createElement("span");
  icon.className = "ingredient-icon";
  icon.setAttribute("aria-hidden", "true");
  const fallback = { sauce: "🫙", oil: "🫙", sugar: "🍚", pepper: "🧂" };
  if (fallback[symbol]) icon.dataset.p5Icon = symbol;
  if (fallback[symbol] && illustrationReady) {
    try {
      if (!ingredientIconGraphics.has(symbol)) {
        const art = createGraphics(20, 20);
        art.pixelDensity(2);
        art.scale(20 / 24);
        drawIngredientIcon(art, symbol);
        ingredientIconGraphics.set(symbol, art);
      }
      const canvas = document.createElement("canvas");
      // Copy the cached p5 drawing at its full resolution into each visible icon.
      const source = ingredientIconGraphics.get(symbol).canvas;
      canvas.width = source.width;
      canvas.height = source.height;
      canvas.style.width = "20px";
      canvas.style.height = "20px";
      canvas.getContext("2d").drawImage(source, 0, 0);
      icon.append(canvas);
    } catch {
      icon.textContent = fallback[symbol];
    }
  } else {
    icon.textContent = fallback[symbol] || symbol;
  }
  return icon;
}

// ============================================================
// DRAW CUSTOM INGREDIENT ICONS
// Draw sauce, oil, sugar, and black pepper with p5 shapes.
// ============================================================
function drawIngredientIcon(p, symbol) {
  p.strokeJoin(p.ROUND);
  if (symbol === "sauce") {
    p.noStroke(); p.fill("#784b33");
    p.beginShape(); p.vertex(9, 2); p.vertex(15, 2); p.vertex(15, 5);
    p.vertex(17, 8); p.vertex(17, 20); p.vertex(15, 22); p.vertex(9, 22);
    p.vertex(7, 20); p.vertex(7, 8); p.vertex(9, 5); p.endShape(p.CLOSE);
    p.fill("#f4e5bb"); p.rect(8, 11, 8, 6);
    p.fill("#4f3529"); p.rect(9, 2, 6, 2);
  } else if (symbol === "oil") {
    p.stroke("#9a6d25"); p.strokeWeight(1); p.fill("#e8b953");
    p.beginShape(); p.vertex(9, 3); p.vertex(15, 3); p.vertex(15, 6);
    p.vertex(17, 9); p.vertex(17, 20); p.vertex(15, 22); p.vertex(9, 22);
    p.vertex(7, 20); p.vertex(7, 9); p.vertex(9, 6); p.endShape(p.CLOSE);
    p.noStroke(); p.fill("#fff0ba"); p.rect(8, 12, 8, 5);
    p.fill("#86602b"); p.rect(9, 2, 6, 3, 1);
  } else if (symbol === "sugar") {
    p.stroke("#8f806b"); p.strokeWeight(1.3);
    p.fill("#fffdf6"); p.rect(4, 10, 9, 9, 1.5);
    p.fill("#f0e5d3"); p.rect(11, 12, 9, 9, 1.5);
    p.fill("#fffdf6"); p.rect(8, 4, 9, 9, 1.5);
  } else if (symbol === "pepper") {
    p.noStroke(); p.fill("#72543c");
    p.beginShape(); p.vertex(9, 2); p.vertex(15, 2); p.vertex(16, 5);
    p.vertex(14, 7); p.vertex(17, 11); p.vertex(16, 20); p.vertex(14, 22);
    p.vertex(10, 22); p.vertex(8, 20); p.vertex(7, 11); p.vertex(10, 7);
    p.vertex(8, 5); p.endShape(p.CLOSE);
    p.fill("#d6bc92"); p.rect(8, 11, 8, 3);
    p.fill("#493527"); p.circle(12, 12.5, 2);
  }
}

// ============================================================
// P5 SETUP
// Attach the forecast illustration and refresh icons created before p5 was ready.
// ============================================================
async function setup() {
  if (document.readyState === "loading") {
    await new Promise((resolve) => document.addEventListener("DOMContentLoaded", resolve, { once: true }));
  }
  const artContainer = document.getElementById("forecast-art");
  if (!artContainer) {
    noCanvas();
    noLoop();
    return;
  }
  const canvas = createCanvas(208, 154);
  canvas.parent(artContainer);
  pixelDensity(1);
  noLoop();
  illustrationReady = true;
  // Replace fallback icons if the form was built before p5 setup finished.
  document.querySelectorAll(".ingredient-icon[data-p5-icon]").forEach((icon) => {
    icon.replaceWith(makeIngredientIcon(icon.dataset.p5Icon));
  });
}

// ============================================================
// DRAW FORECAST ILLUSTRATION
// Change the weather artwork to reflect the current forecast.
// ============================================================
function draw() {
  clear();
  noStroke();
  const rainy = /rain|shower|drizzle|storm/i.test(illustrationWeather?.shortForecast || "");
  const cloudy = /cloud|fog|haze|overcast/i.test(illustrationWeather?.shortForecast || "");
  fill("#f2c766");
  if (illustrationWeather && !illustrationWeather.isDaytime) {
    circle(125, 39, 39);
    fill("#fbf7ef"); circle(136, 31, 35);
  } else {
    circle(125, 38, 38);
    stroke("#e4b54f"); strokeWeight(3);
    for (let i = 0; i < 8; i++) {
      const a = i * TWO_PI / 8;
      line(125 + cos(a) * 25, 38 + sin(a) * 25, 125 + cos(a) * 30, 38 + sin(a) * 30);
    }
    noStroke();
  }
  if (rainy || cloudy) {
    fill("#cddedc"); ellipse(96, 56, 79, 27); circle(82, 44, 30); circle(107, 44, 37);
  }
  if (rainy) {
    stroke("#709ba0"); strokeWeight(3);
    for (let i = 0; i < 3; i++) line(78 + i * 17, 77, 74 + i * 17, 85);
    noStroke();
  }
  fill("#e3e9d8"); ellipse(104, 142, 148, 12);
  fill("#8db779"); ellipse(70, 100, 47, 28); ellipse(139, 100, 39, 29);
  fill("#d76e57"); circle(99, 98, 28); circle(124, 103, 22);
  fill("#466d50"); arc(104, 108, 141, 72, 0, PI, CHORD);
  fill("#36573f"); ellipse(104, 108, 142, 12);
  fill("#f2c766"); ellipse(97, 107, 29, 7);
}

// Initialize independently of p5, after the page controls are available.
function startForecastApp() {
  try {
    initializeForecastApp();
  } catch {
    const status = document.getElementById("weather-status");
    if (status) {
      status.textContent = "The forecast could not start. Refresh the page and try again.";
      status.className = "status-message status-error";
      status.hidden = false;
    }
    document.getElementById("weather-section")?.setAttribute("aria-busy", "false");
  }
}
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", startForecastApp, { once: true });
} else {
  startForecastApp();
}

// ============================================================
// FORECAST AND RECIPE CONTROLS
// Connect the page controls and keep the current app state together.
// ============================================================
function initializeForecastApp() {
  window.ForecastMealNutrientIcons?.mount();
  const service = window.ForecastWeather;
  const citySelect = document.getElementById("city-select");
  const locationButton = document.getElementById("use-location");
  const refreshButton = document.getElementById("refresh-weather");
  const locationStatus = document.getElementById("location-status");
  const weatherStatus = document.getElementById("weather-status");
  const result = document.getElementById("weather-result");
  const section = document.getElementById("weather-section");
  const recipeForm = document.getElementById("recipe-form");
  const recipeStatus = document.getElementById("recipe-status");
  const recipeResult = document.getElementById("recipe-result");
  const swapIntro = document.getElementById("swap-intro");
  const swapButton = document.getElementById("swap-selected");
  const swapStatus = document.getElementById("swap-status");
  const recipeReview = document.getElementById("recipe-review");
  const recipeReviewList = document.getElementById("recipe-review-list");
  const generateButton = document.getElementById("generate-recipe");
  let recipeControls = [...recipeForm.querySelectorAll("select, input")];
  const servingsSelect = document.getElementById("recipe-servings");
  const resultServings = document.getElementById("result-servings");

  // ============================================================
  // APP STATE
  // Track active requests, the forecast, the current recipe, and selected swaps.
  // ============================================================
  let operation = 0;
  let controller = null;
  let activeArea = null; // Forecast grid metadata only; never raw coordinates.
  let activeForecast = null;
  let busy = false;
  let locating = false;
  let locationDeadline = null;
  let recipeBusy = false;
  let renderedRecipe = null;
  let recipeRequestId = 0;
  const recentDishNames = [];
  let swapBusy = false;
  let swapCount = 0;
  let swapRequestId = 0;
  const selectedSwapIndexes = new Set();

  // ============================================================
  // RECIPE CONTROL STATE
  // Enable recipe generation only when the forecast and controls are ready.
  // ============================================================
  function updateGenerateButton() {
    let hasFreshForecast = false;
    try { hasFreshForecast = Boolean(activeForecast && service.mealContext(activeForecast)); }
    catch { hasFreshForecast = false; }
    generateButton.disabled = busy || recipeBusy || !hasFreshForecast;
    generateButton.textContent = recipeBusy ? "Making your recipe…" : "Find my meal →";
    for (const control of recipeControls) control.disabled = busy || recipeBusy;
  }

  // ============================================================
  // CLEAR RECIPE
  // Reset the recipe display and ignore responses from older requests.
  // ============================================================
  function clearRecipe() {
    ++recipeRequestId;
    ++swapRequestId;
    recipeBusy = false;
    swapBusy = false;
    swapCount = 0;
    selectedSwapIndexes.clear();
    renderedRecipe = null;
    recipeForm.removeAttribute("aria-busy");
    recipeResult.hidden = true;
    recipeStatus.hidden = true;
    swapStatus.hidden = true;
  }

  // ============================================================
  // STATUS MESSAGES
  // Show loading, success, and error information in the page.
  // ============================================================
  function showStatus(element, text, kind) {
    element.textContent = text;
    element.className = `status-message status-${kind}`;
    element.hidden = false;
  }

  // ============================================================
  // FORECAST ART AND ICONS
  // Update the p5 drawing and choose an emoji for each forecast period.
  // ============================================================
  function updateIllustration(period) {
    illustrationWeather = period;
    if (illustrationReady) redraw();
  }

  function forecastIcon(period) {
    const text = period.shortForecast.toLowerCase();
    if (/thunder|lightning|storm/.test(text)) return "⛈️";
    if (/snow|sleet|ice|freezing/.test(text)) return "🌨️";
    if (/rain|shower|drizzle/.test(text)) return "🌧️";
    if (/fog|mist|haze/.test(text)) return "🌫️";
    if (/wind|breez/.test(text)) return "💨";
    if (/partly|mostly (sunny|clear)/.test(text)) return period.isDaytime ? "🌤️" : "☁️";
    if (/cloud|overcast/.test(text)) return "☁️";
    if (/sun|clear|fair/.test(text)) return period.isDaytime ? "☀️" : "🌙";
    return "🌡️";
  }

  // ============================================================
  // WEATHER REQUEST STATE
  // Cancel the previous request and prepare the page for the new forecast.
  // ============================================================
  function begin(message, { preserveRecipe = false } = {}) {
    // A new operation ID makes earlier asynchronous responses obsolete.
    const id = ++operation;
    clearTimeout(locationDeadline);
    controller?.abort();
    controller = new AbortController();
    busy = true;
    locating = false;
    locationButton.disabled = false;
    locationButton.textContent = "◎ Use my location";
    refreshButton.disabled = true;
    section.setAttribute("aria-busy", "true");
    result.hidden = true; // Never leave the last city's forecast under the new selection.
    activeForecast = null;
    if (preserveRecipe) {
      ++recipeRequestId;
      if (recipeBusy) {
        recipeBusy = false;
        recipeForm.removeAttribute("aria-busy");
        if (renderedRecipe) recipeResult.hidden = false;
        showStatus(recipeStatus, "Recipe request stopped while the forecast refreshes. Try again when it’s ready.", "hint");
      }
      if (swapBusy) {
        ++swapRequestId;
        swapBusy = false;
        showStatus(swapStatus, "Ingredient update stopped while the forecast refreshes. Try again when it’s ready.", "hint");
      }
    } else {
      clearRecipe();
    }
    updateGenerateButton();
    updateSwapControls();
    updateIllustration(null);
    showStatus(weatherStatus, message, "loading");
    return { id, signal: controller.signal, controller, preserveRecipe };
  }

  // ============================================================
  // FINISH WEATHER REQUEST
  // Restore controls only when the response belongs to the current request.
  // ============================================================
  function finish(id) {
    if (id !== operation) return;
    busy = false;
    locating = false;
    locationButton.disabled = false;
    locationButton.textContent = "◎ Use my location";
    refreshButton.disabled = false;
    section.setAttribute("aria-busy", "false");
    updateGenerateButton();
    updateSwapControls();
  }

  // ============================================================
  // DISPLAY FORECAST
  // Build forecast cards and update the selected location and source link.
  // ============================================================
  function render({ area, forecast }) {
    activeArea = area;
    activeForecast = forecast;
    document.getElementById("forecast-location").textContent = area.label;
    document.getElementById("location-type").textContent = area.source === "device" ? "Your location" : "Selected city";
    const publishedFormat = new Intl.DateTimeFormat("en-US", {
      timeZone: area.timeZone, weekday: "short", month: "short", day: "numeric", year: "numeric",
      hour: "numeric", minute: "2-digit", timeZoneName: "short",
    });
    const publishedLabel = forecast.updatedAt ? publishedFormat.format(new Date(forecast.updatedAt)) : "time unavailable";
    document.getElementById("forecast-date").textContent = `Latest NWS forecast published: ${publishedLabel}`;
    const periods = document.getElementById("forecast-periods");
    periods.replaceChildren();
    const timeFormat = new Intl.DateTimeFormat("en-US", { timeZone: area.timeZone, weekday: "short", hour: "numeric", minute: "2-digit" });
    for (const period of forecast.periods) {
      const card = document.createElement("details");
      card.className = "forecast-card";
      const summary = document.createElement("summary");
      summary.className = "forecast-quick-view";
      const icon = document.createElement("span");
      icon.className = "forecast-icon";
      icon.setAttribute("aria-hidden", "true");
      icon.textContent = forecastIcon(period);
      const heading = document.createElement("span");
      heading.className = "forecast-quick-heading";
      const title = document.createElement("h4");
      title.textContent = period.name;
      const temperature = document.createElement("p");
      temperature.className = "forecast-temperature";
      temperature.textContent = `${period.temperatureF}°F`;
      const short = document.createElement("p");
      short.className = "forecast-summary";
      short.textContent = period.shortForecast;
      heading.append(title, short);
      const hint = document.createElement("span");
      hint.className = "forecast-expand-hint";
      const showDetails = document.createElement("span");
      showDetails.className = "show-details-label";
      showDetails.textContent = "More details";
      const hideDetails = document.createElement("span");
      hideDetails.className = "hide-details-label";
      hideDetails.textContent = "Less details";
      hint.append(showDetails, hideDetails);
      summary.append(icon, heading, temperature, hint);
      const valid = document.createElement("p");
      valid.className = "forecast-meta";
      valid.textContent = `${period.isDaytime ? "Day" : "Night"} period · ${timeFormat.format(new Date(period.startTime))} – ${timeFormat.format(new Date(period.endTime))}`;
      const metrics = document.createElement("dl");
      metrics.className = "weather-metrics";
      const values = [
        ["Wind", `${period.windDirection} ${period.windSpeed}`.trim()],
        ["Precipitation", period.precipitationChance === null ? "Unavailable" : `${period.precipitationChance}% chance`],
      ];
      for (const [name, value] of values) {
        const group = document.createElement("div");
        const term = document.createElement("dt"); term.textContent = name;
        const description = document.createElement("dd"); description.textContent = value;
        group.append(term, description); metrics.append(group);
      }
      const detail = document.createElement("p");
      detail.className = "forecast-detail";
      detail.textContent = period.detailedForecast;
      const expanded = document.createElement("div");
      expanded.className = "forecast-expanded";
      expanded.append(valid, metrics, detail);
      card.append(summary, expanded);
      periods.append(card);
    }
    document.getElementById("forecast-source").href = area.forecastUrl;
    weatherStatus.textContent = "Forecast loaded.";
    weatherStatus.className = "sr-only";
    weatherStatus.hidden = false;
    result.hidden = false;
    updateIllustration(forecast.periods[0]);
    updateGenerateButton();
  }

  // ============================================================
  // FETCH FORECAST
  // Load or refresh the NWS forecast and handle cancellation and errors.
  // ============================================================
  async function fetchForecast(request, location, area = null) {
    // A single deadline covers the point lookup, forecast fetch, and response body.
    const timeout = setTimeout(() => request.controller.abort(), 20_000);
    try {
      const response = area
        ? await service.refreshForecast(area, { signal: request.signal })
        : await service.loadForecast(location, { signal: request.signal });
      // Ignore a response if a newer location or refresh request has started.
      if (request.id !== operation) return;
      render(response);
      if (location && response.area.source === "device" && !document.querySelector('[data-screen="0"]').hidden) showScreen(1);
    } catch (error) {
      if (request.id !== operation) return;
      // Never log the exception: browser fetch errors can contain coordinate URLs.
      showStatus(weatherStatus, request.signal.aborted
        ? "The forecast request timed out. Refresh, try your location again, or choose a city."
        : error.message || "Could not load today's forecast. Choose a city or try again.", "error");
      updateGenerateButton();
    } finally {
      clearTimeout(timeout);
      finish(request.id);
    }
  }

  // ============================================================
  // SELECT LOCATION
  // Load a preset city or request a one-time device location when selected.
  // ============================================================
  function selectCity() {
    const location = service.locations.find((city) => city.id === citySelect.value);
    if (!location) return;
    locationStatus.hidden = true;
    activeArea = null;
    const request = begin(`Loading ${location.city}'s forecast…`);
    fetchForecast(request, location);
  }

  // ============================================================
  // DEVICE LOCATION
  // Ask the browser for a location only after the user selects the button.
  // ============================================================
  function useDeviceLocation() {
    activeArea = null;
    const request = begin("Waiting for device location… You can choose a city at any time.");
    locationStatus.hidden = true;
    function failure(message) {
      if (request.id !== operation) return;
      clearTimeout(locationDeadline);
      showStatus(locationStatus, `${message} Choose a city above, or tap “Use my location” to try again.`, "error");
      showStatus(weatherStatus, "Choose a city to load its forecast.", "error");
      finish(request.id);
    }
    // Some browsers leave a permission prompt pending beyond getCurrentPosition's timeout.
    locationDeadline = setTimeout(() => {
      if (request.id !== operation) return;
      failure("The location request timed out.");
      ++operation; // Ignore a late permission success after the app's deadline.
    }, 30_000);
    if (!window.isSecureContext) {
      failure("Device location requires HTTPS or localhost."); return;
    }
    if (!navigator.geolocation) {
      failure("This browser does not support device location."); return;
    }
    locating = true;
    locationButton.disabled = true;
    locationButton.textContent = "Finding your location…";
    // Sole permission entry point: called only from the user's button click.
    navigator.geolocation.getCurrentPosition((position) => {
      if (request.id !== operation) return;
      clearTimeout(locationDeadline);
      locating = false;
      locationButton.textContent = "Loading your forecast…";
      // A disabled placeholder identifies device mode without silently selecting a city.
      citySelect.value = "device";
      showStatus(locationStatus, "Using a one-time device reading. Choose a city anytime to switch back.", "success");
      showStatus(weatherStatus, "Loading your local NWS forecast…", "loading");
      fetchForecast(request, { latitude: position.coords.latitude, longitude: position.coords.longitude });
    }, (error) => {
      const messages = {
        1: "Location permission was denied or blocked. You can change it in your browser's site settings.",
        2: "Your device could not determine its location.",
        3: "The device location request timed out.",
      };
      failure(messages[error.code] || "Device location is unavailable.");
    }, { enableHighAccuracy: false, timeout: 12_000, maximumAge: 0 });
  }

  const deviceOption = document.createElement("option");
  deviceOption.value = "device";
  deviceOption.textContent = "Using device location";
  deviceOption.disabled = true;
  deviceOption.hidden = true;
  citySelect.append(deviceOption);
  citySelect.addEventListener("change", selectCity);
  buildExclusionOptions();
  recipeControls = [...recipeForm.querySelectorAll("select, input")];
  const mainIngredient = document.getElementById("main-ingredient");
  const conflict = document.getElementById("choice-conflict");

  // ============================================================
  // SCREEN NAVIGATION
  // Show one step at a time and update progress and focus.
  // ============================================================
  function showScreen(index) {
    document.querySelectorAll("[data-screen]").forEach((screen) => { screen.hidden = Number(screen.dataset.screen) !== index; });
    document.querySelectorAll("[data-progress]").forEach((item) => {
      const active = Number(item.dataset.progress) === index;
      item.classList.toggle("active", active);
      if (active) item.setAttribute("aria-current", "step");
      else item.removeAttribute("aria-current");
    });
    document.querySelector(".flow-progress").style.setProperty("--progress", `${(index + 1) * 20}%`);
    const heading = document.querySelector(`[data-screen="${index}"] h2, [data-screen="${index}"] h1`);
    window.scrollTo({ top: 0, behavior: "auto" });
    heading?.focus({ preventScroll: true });
  }

  // ============================================================
  // CHECK CHOICE CONFLICTS
  // Warn when the main ingredient conflicts with an eating style or exclusion.
  // ============================================================
  function updateConflict() {
    const diet = document.getElementById("dietary-pattern").value;
    const ingredient = mainIngredient.value;
    const animal = ["chicken", "beef", "pork", "fish", "eggs"];
    const incompatible = (diet === "vegan" && animal.includes(ingredient)) || (diet === "vegetarian" && animal.slice(0, 4).includes(ingredient)) || (diet === "pescatarian" && animal.slice(0, 3).includes(ingredient));
    const excluded = [...recipeForm.querySelectorAll('input[name="excludedIngredients"]:checked')].some((input) => input.value === ingredient);
    conflict.hidden = !(incompatible || excluded);
    conflict.textContent = incompatible ? "Your ingredient and eating style don't match. Change either choice to continue." : excluded ? "Your main ingredient is also in your ingredients to avoid. Change either choice to continue." : "";
    return incompatible || excluded;
  }
  document.querySelectorAll("[data-go]").forEach((button) => button.addEventListener("click", () => showScreen(Number(button.dataset.go))));
  mainIngredient.addEventListener("change", updateConflict);
  showScreen(0);

  // ============================================================
  // RECIPE TABS
  // Support clicking and keyboard navigation between recipe sections.
  // ============================================================
  const recipeTabs = [...document.querySelectorAll('[role="tab"]')];
  function selectRecipeTab(tab, focus = false) {
    recipeTabs.forEach((button) => {
      const selected = button === tab;
      button.setAttribute("aria-selected", String(selected));
      button.tabIndex = selected ? 0 : -1;
      document.getElementById(button.getAttribute("aria-controls")).hidden = !selected;
    });
    if (focus) tab.focus();
  }
  recipeTabs.forEach((tab, index) => {
    tab.addEventListener("click", () => selectRecipeTab(tab));
    tab.addEventListener("keydown", (event) => {
      let next = index;
      if (event.key === "ArrowRight") next = (index + 1) % recipeTabs.length;
      else if (event.key === "ArrowLeft") next = (index + recipeTabs.length - 1) % recipeTabs.length;
      else if (event.key === "Home") next = 0;
      else if (event.key === "End") next = recipeTabs.length - 1;
      else return;
      event.preventDefault(); selectRecipeTab(recipeTabs[next], true);
    });
  });
  recipeForm.addEventListener("submit", requestRecipe);
  for (const control of recipeControls) control.addEventListener("change", () => {
    const count = recipeForm.querySelectorAll('input[name="excludedIngredients"]:checked').length;
    document.getElementById("exclusion-summary").textContent = count ? `${count} selected` : "Optional · Select";
    const chips = document.getElementById("selected-exclusions");
    chips.replaceChildren();
    recipeForm.querySelectorAll('input[name="excludedIngredients"]:checked').forEach((input) => {
      const chip = document.createElement("button");
      chip.type = "button"; chip.className = "exclusion-chip";
      chip.textContent = `${input.parentElement.textContent.trim()} ×`;
      chip.setAttribute("aria-label", `Remove ${input.parentElement.textContent.trim()} from ingredients to avoid`);
      chip.addEventListener("click", () => { input.checked = false; input.dispatchEvent(new Event("change", { bubbles: true })); });
      chips.append(chip);
    });
    updateConflict();
    updateGenerateButton();
  });
  resultServings.addEventListener("change", () => {
    renderRecipeIngredients();
    window.setDishServings?.(resultServings.value);
  });
  swapButton.addEventListener("click", requestSwaps);
  document.getElementById("new-recipe").addEventListener("click", () => {
    clearRecipe();
    showScreen(3);
  });
  locationButton.addEventListener("click", useDeviceLocation);
  refreshButton.addEventListener("click", () => {
    if (activeArea) {
      const area = activeArea;
      fetchForecast(begin(`Refreshing ${area.label}'s forecast…`, { preserveRecipe: true }), null, area);
    } else if (citySelect.value === "device") {
      showStatus(locationStatus, "Tap “Use my location” for a new device reading, or choose a city.", "error");
    } else selectCity();
  });

  // ============================================================
  // FORECAST REFRESH
  // Refresh a forecast when it is stale or its current period has ended.
  // ============================================================
  function refreshWhenDue() {
    if (document.hidden || busy || locating || !activeForecast || !activeArea) return;
    const now = Date.now();
    if (service.localDate(now, activeArea.timeZone) !== activeForecast.date ||
        now - Date.parse(activeForecast.fetchedAt) >= 20 * 60_000 ||
        Date.parse(activeForecast.periods[0].endTime) <= now) {
      const area = activeArea;
      fetchForecast(begin(`Refreshing ${area.label}'s forecast…`, { preserveRecipe: true }), null, area);
    }
  }

  // ============================================================
  // BUILD AVOID OPTIONS
  // Create the ingredient checkboxes and their icons from the choice list.
  // ============================================================
  function buildExclusionOptions() {
    const container = document.getElementById("exclusion-options");
    for (const [value, label] of EXCLUSION_CHOICES) {
      const wrapper = document.createElement("label");
      wrapper.className = "exclusion-option";
      const input = document.createElement("input");
      input.type = "checkbox";
      input.name = "excludedIngredients";
      input.value = value;
      const text = document.createElement("span");
      text.textContent = label;
      wrapper.append(input, makeIngredientIcon(EXCLUSION_ICONS[value]), text);
      container.append(wrapper);
    }
  }

  // ============================================================
  // FORMAT INGREDIENT AMOUNTS
  // Display familiar fractions and readable units in the recipe.
  // ============================================================
  function formatAmount(amount) {
    const whole = Math.floor(amount);
    const fraction = amount - whole;
    const commonFractions = [[1 / 8, "⅛"], [1 / 4, "¼"], [1 / 3, "⅓"], [1 / 2, "½"], [2 / 3, "⅔"], [3 / 4, "¾"], [7 / 8, "⅞"]];
    const match = commonFractions.find(([value]) => Math.abs(fraction - value) < 0.001);
    if (match) return `${whole || ""}${match[1]}`;
    return new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 }).format(amount);
  }

  function displayUnit(unit, amount) {
    if (unit === "to taste" || unit === "tsp" || unit === "tbsp") return unit;
    if (unit === "cup") return amount === 1 ? "cup" : "cups";
    const abbreviations = { ounce: "oz", pound: "lb", gram: "g", milliliter: "mL", liter: "L" };
    if (abbreviations[unit]) return abbreviations[unit];
    if (amount === 1) return unit;
    const plurals = {
      cup: "cups", ounce: "ounces", pound: "pounds", gram: "grams",
      milliliter: "milliliters", liter: "liters", piece: "pieces", clove: "cloves",
      can: "cans", package: "packages", pinch: "pinches",
    };
    return plurals[unit] || unit;
  }

  // ============================================================
  // DISPLAY INGREDIENTS
  // Scale quantities for the serving count and prepare swap selections.
  // ============================================================
  function renderRecipeIngredients() {
    if (!renderedRecipe) return;
    const targetServings = Number(resultServings.value);
    const list = document.getElementById("recipe-ingredients");
    list.replaceChildren();
    for (const [index, ingredient] of renderedRecipe.ingredients.entries()) {
      const item = document.createElement("li");
      item.className = swapCount >= 2 ? "recipe-ingredient-row" : "recipe-ingredient-row swap-available";
      if (ingredient.warnings?.length) item.classList.add("ingredient-needs-review");
      const row = swapCount >= 2 ? item : document.createElement("label");
      if (swapCount < 2) item.append(row);
      if (swapCount < 2) {
        const select = document.createElement("input");
        select.type = "checkbox";
        select.className = "swap-checkbox";
        select.checked = selectedSwapIndexes.has(index);
        select.disabled = recipeBusy || swapBusy;
        select.setAttribute("aria-label", `Select ${ingredient.name} to replace`);
        select.addEventListener("change", () => {
          if (select.checked) selectedSwapIndexes.add(index);
          else selectedSwapIndexes.delete(index);
          swapStatus.hidden = true;
          updateSwapControls();
        });
        row.append(select);
      }
      // Scale numeric amounts by servings; leave "to taste" amounts unchanged.
      const amount = ingredient.unit === "to taste"
        ? ingredient.amount
        : ingredient.amount * targetServings / renderedRecipe.servings;
      const quantity = document.createElement("span");
      quantity.className = "ingredient-quantity";
      const onionCount = ingredient.unit === "piece" && /\bonions?\b/i.test(ingredient.name);
      quantity.textContent = onionCount ? formatAmount(amount) : `${formatAmount(amount)} ${displayUnit(ingredient.unit, amount)}`;
      if (ingredient.unit === "cup") quantity.textContent += ` (${formatAmount(amount * 8)} fl oz)`;
      const name = document.createElement("span");
      name.className = "ingredient-name";
      const noteMatch = ingredient.name.match(/^(.*?)\s*(\([^()]*\))\s*$/);
      name.textContent = noteMatch ? noteMatch[1] : ingredient.name;
      const details = document.createElement("div");
      details.className = "ingredient-details";
      details.append(makeIngredientIcon(ingredientIcon(ingredient.name)), quantity, name);
      if (noteMatch) {
        const note = document.createElement("span");
        note.className = "ingredient-note";
        note.textContent = noteMatch[2];
        details.append(note);
      }
      if (ingredient.warnings?.length) {
        const warning = document.createElement("span");
        warning.className = "ingredient-review-note";
        warning.textContent = ingredient.warnings.join(" ");
        details.append(warning);
      }
      row.append(details);
      list.append(item);
    }
    updateSwapControls();
  }

  // ============================================================
  // SWAP CONTROL STATE
  // Show the available swap action and its remaining changes.
  // ============================================================
  function updateSwapControls() {
    swapIntro.hidden = swapCount >= 2;
    swapButton.hidden = swapCount >= 2;
    if (swapCount >= 2) return;
    swapIntro.textContent = swapCount === 0
      ? "Choose the ingredients you’d like to change. We’ll update them all at once. You can make two changes per recipe."
      : "Choose ingredients for your second and final change.";
    const selectedCount = selectedSwapIndexes.size;
    swapButton.disabled = busy || recipeBusy || swapBusy || !activeForecast;
    swapButton.textContent = swapBusy
      ? "Updating selected ingredients…"
      : selectedCount > 0
        ? `Replace ${selectedCount} selected ingredient${selectedCount === 1 ? "" : "s"}`
        : "Choose ingredients above";
    for (const checkbox of recipeResult.querySelectorAll(".swap-checkbox")) {
      checkbox.disabled = busy || recipeBusy || swapBusy || !activeForecast;
    }
  }

  // ============================================================
  // DISPLAY RECIPE STEPS
  // Build the cooking instructions from the current recipe.
  // ============================================================
  function renderRecipeSteps() {
    if (!renderedRecipe) return;
    const stepList = document.getElementById("recipe-steps");
    stepList.replaceChildren();
    for (const step of renderedRecipe.steps) {
      const item = document.createElement("li");
      item.textContent = step;
      stepList.append(item);
    }
  }

  // ============================================================
  // DISPLAY NUTRITION
  // Show the estimated nutrients and highlight values needing review.
  // ============================================================
  function renderNutrition(nutrition) {
    const whole = new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 });
    const decimal = new Intl.NumberFormat("en-US", { maximumFractionDigits: 1 });
    const fields = [
      ["calories", "calories", whole], ["proteinG", "protein", decimal],
      ["carbohydratesG", "carbohydrates", decimal], ["fatG", "fat", decimal],
      ["fiberG", "fiber", decimal], ["sodiumMg", "sodium", whole],
    ];
    for (const [key, id, formatter] of fields) {
      const cell = document.getElementById(`nutrition-${id}`);
      const value = nutrition[key];
      cell.textContent = Number.isFinite(value) ? formatter.format(value) : "Unavailable";
      cell.classList.toggle("nutrition-value-review", renderedRecipe?.nutritionWarnings?.includes(key) || !Number.isFinite(value));
    }
  }

  // ============================================================
  // DISPLAY REVIEW NOTES
  // Explain any preference or nutrition checks returned with the recipe.
  // ============================================================
  function renderRecipeReview(recipe) {
    recipeReviewList.replaceChildren();
    const warnings = recipe.validationWarnings || [];
    document.getElementById("recipe-review-intro").hidden = !warnings.some((warning) => warning.code !== "balanced-roles");
    for (const warning of warnings) {
      const item = document.createElement("li");
      if (warning.code === "balanced-roles") {
        const missing = warning.message.split(": ").at(-1).replace(/\.$/, "");
        item.append("A balanced meal includes a vegetable, a protein, and a grain or starch. ");
        const highlight = document.createElement("strong");
        highlight.textContent = `May be missing: ${missing}.`;
        item.append(highlight);
      } else item.textContent = warning.message;
      recipeReviewList.append(item);
    }
    recipeReview.hidden = recipeReviewList.childElementCount === 0;
  }

  // ============================================================
  // REQUEST INGREDIENT SWAPS
  // Send selected ingredients and update the recipe after a successful response.
  // ============================================================
  async function requestSwaps() {
    if (!renderedRecipe || swapCount >= 2 || recipeBusy || swapBusy || busy || !activeForecast) return;
    if (selectedSwapIndexes.size === 0) {
      showStatus(swapStatus, "Choose one or more ingredients above first.", "hint");
      recipeResult.querySelector(".swap-checkbox")?.focus();
      return;
    }
    const recipeBeingUpdated = renderedRecipe;
    const ingredientIndexes = [...selectedSwapIndexes].sort((a, b) => a - b);
    const requestId = ++swapRequestId;
    swapBusy = true;
    showStatus(swapStatus, `Finding replacements for ${ingredientIndexes.length} ingredient${ingredientIndexes.length === 1 ? "" : "s"}…`, "loading");
    updateSwapControls();
    try {
      const data = await window.ForecastMealAPI.suggestSwaps({
        ...collectRecipeRequest(),
        servings: renderedRecipe.servings,
        recipe: {
          name: renderedRecipe.name,
          summary: renderedRecipe.summary,
          ...(Number.isInteger(renderedRecipe.estimatedMinutes) ? { estimatedMinutes: renderedRecipe.estimatedMinutes } : {}),
          servings: renderedRecipe.servings,
          ingredients: renderedRecipe.ingredients.map(({ name, amount, unit }) => ({ name, amount, unit })),
          steps: [...renderedRecipe.steps],
          nutrition: { ...renderedRecipe.nutrition },
        },
        ingredientIndexes,
      });
      if (requestId !== swapRequestId || renderedRecipe !== recipeBeingUpdated) return;
      renderedRecipe = data.recipe;
      window.refreshDishIllustration?.(renderedRecipe);
      window.setDishServings?.(resultServings.value);
      swapCount += 1;
      selectedSwapIndexes.clear();
      renderRecipeIngredients();
      renderRecipeSteps();
      renderNutrition(renderedRecipe.nutrition);
      renderRecipeReview(renderedRecipe);
      const updatedTime = document.getElementById("recipe-time");
      updatedTime.hidden = false;
      updatedTime.textContent = Number.isInteger(renderedRecipe.estimatedMinutes) ? `◷ About ${renderedRecipe.estimatedMinutes} min total · prep + cooking` : "◷ Estimated total time unavailable";
      document.getElementById("recipe-on-hand").hidden = true;
      showStatus(swapStatus, renderedRecipe.validationWarnings?.length
        ? "Ingredient update generated. Review the highlighted details against your choices."
        : swapCount < 2 ? "Ingredient swap complete! You can make one more change." : "Ingredient swap complete! Start a new recipe for another change.", renderedRecipe.validationWarnings?.length ? "review" : "success");
    } catch (error) {
      if (requestId === swapRequestId) showStatus(swapStatus, error.message || "Could not update those ingredients. Please try again.", "error");
    } finally {
      if (requestId === swapRequestId) {
        swapBusy = false;
        updateSwapControls();
      }
    }
  }

  // ============================================================
  // DISPLAY RECIPE
  // Update the title, ingredients, steps, nutrition, and decorative dish.
  // ============================================================
  function renderRecipe(recipe, forecast) {
    renderedRecipe = recipe;
    window.refreshDishIllustration?.(recipe);
    const rawOutput = document.getElementById("recipe-raw-output");
    const hasRawOutput = typeof recipe.rawResponse === "string";
    document.querySelector(".recipe-tabs").hidden = hasRawOutput;
    selectRecipeTab(recipeTabs[0]);
    rawOutput.textContent = hasRawOutput ? recipe.rawResponse : "";
    rawOutput.hidden = !hasRawOutput;
    for (const id of ["recipe-serving-adjuster", "recipe-ingredients-section", "recipe-steps-section", "recipe-nutrition-section"]) {
      document.getElementById(id).hidden = hasRawOutput;
    }
    document.getElementById("recipe-title").textContent = recipe.name;
    document.getElementById("recipe-summary").textContent = recipe.summary;
    const time = document.getElementById("recipe-time");
    time.hidden = false;
    time.textContent = Number.isInteger(recipe.estimatedMinutes) ? `◷ About ${recipe.estimatedMinutes} min total · prep + cooking` : "◷ Estimated total time unavailable";
    const onHand = document.getElementById("recipe-on-hand");
    const selected = mainIngredient.value;
    const label = mainIngredient.selectedOptions[0].textContent;
    const matches = selected !== "none" && recipe.ingredients.some((item) => item.name.toLowerCase().includes(selected.replaceAll("_", " ").replace(/s$/, "")));
    onHand.hidden = selected === "none";
    onHand.textContent = matches ? `Selected to use up: ${label}` : `You selected ${label} to use up; check the ingredient list for a match.`;
    const firstPeriod = forecast.periods.find((period) => Date.parse(period.endTime) > Date.now()) || forecast.periods[0];
    document.getElementById("recipe-weather").textContent = `Suggested for ${firstPeriod.shortForecast.toLowerCase()} · ${forecast.date}`;
    resultServings.value = String(recipe.servings);
    renderRecipeIngredients();
    renderRecipeSteps();
    renderNutrition(recipe.nutrition);
    renderRecipeReview(recipe);
    recipeResult.hidden = false;
    showStatus(recipeStatus, recipe.validationWarnings?.length
      ? "Your recipe is ready. Review the highlighted details against your choices."
      : "Your recipe is ready. Ingredient quantities scale with the serving choice below.", recipe.validationWarnings?.length ? "review" : "success");
  }

  // ============================================================
  // COLLECT RECIPE CHOICES
  // Build the request from the selected controls and current forecast.
  // ============================================================
  function collectRecipeRequest() {
    const forecast = service.mealContext(activeForecast);
    return {
      mainIngredient: mainIngredient.value,
      cookingTime: 30,
      dietaryPattern: document.getElementById("dietary-pattern").value,
      cuisine: document.getElementById("preferred-cuisine").value,
      excludedIngredients: [...recipeForm.querySelectorAll('input[name="excludedIngredients"]:checked')].map((input) => input.value),
      customExclusions: [...new Set(document.getElementById("custom-exclusion").value.split(",").map((value) => value.trim().toLowerCase()).filter(Boolean))],
      servings: Number(servingsSelect.value),
      forecast,
    };
  }

  // ============================================================
  // REQUEST RECIPE
  // Validate the choices, show progress, and display the returned recipe.
  // ============================================================
  async function requestRecipe(event) {
    event.preventDefault();
    if (busy || recipeBusy) return;
    if (updateConflict()) { conflict.focus(); return; }
    const customExclusions = document.getElementById("custom-exclusion").value.split(",").map((value) => value.trim()).filter(Boolean);
    if (customExclusions.length > 10 || customExclusions.some((value) => value.length > 40 || !/^[\p{L}\p{N} '\-]+$/u.test(value))) {
      showStatus(recipeStatus, "Enter up to 10 ingredient names, separated by commas. Use letters, numbers, spaces, apostrophes or hyphens.", "error");
      document.getElementById("custom-exclusion").focus();
      return;
    }
    let input;
    try {
      input = collectRecipeRequest();
      input.previousDishes = [...recentDishNames];
    }
    catch {
      showStatus(recipeStatus, "Today's forecast needs to refresh before you request a recipe.", "error");
      return;
    }

    // Use a request ID so an older recipe response cannot replace a newer one.
    const requestId = ++recipeRequestId;
    ++swapRequestId;
    swapBusy = false;
    swapCount = 0;
    selectedSwapIndexes.clear();
    swapStatus.hidden = true;
    const requestForecast = activeForecast;
    recipeBusy = true;
    generateButton.disabled = true;
    recipeForm.setAttribute("aria-busy", "true");
    recipeResult.hidden = true;
    const loadingMessages = [
      "Finding a meal for today’s forecast…",
      "Gathering some meal inspiration…",
      "Cooking up an idea for you…",
      "A little more time in the kitchen…",
      "Your meal idea is still on its way…",
      "Thanks for waiting—we’re still working on it…",
      "This is taking longer than usual. Please hang tight…",
    ];
    let loadingMessageIndex = 0;
    showStatus(recipeStatus, loadingMessages[loadingMessageIndex], "loading");
    const loadingTimer = setInterval(() => {
      if (requestId !== recipeRequestId || loadingMessageIndex >= loadingMessages.length - 1) {
        clearInterval(loadingTimer);
        return;
      }
      showStatus(recipeStatus, loadingMessages[++loadingMessageIndex], "loading");
    }, 5_000);
    updateGenerateButton();
    try {
      const data = await window.ForecastMealAPI.createRecipe(input);
      if (requestId !== recipeRequestId || requestForecast !== activeForecast) return;
      if (!data.recipe.rawResponse && typeof data.recipe.name === "string" && data.recipe.name.trim()) {
        const dish = data.recipe.name.trim().slice(0, 100);
        const existing = recentDishNames.findIndex((name) => name.toLowerCase() === dish.toLowerCase());
        if (existing !== -1) recentDishNames.splice(existing, 1);
        recentDishNames.push(dish);
        if (recentDishNames.length > 5) recentDishNames.shift();
      }
      renderRecipe(data.recipe, requestForecast);
      showScreen(4);
    } catch (error) {
      if (requestId === recipeRequestId) showStatus(recipeStatus, error.message || "The recipe could not be generated. Please try again.", "error");
    } finally {
      clearInterval(loadingTimer);
      if (requestId === recipeRequestId) {
        recipeBusy = false;
        recipeForm.removeAttribute("aria-busy");
        updateGenerateButton();
        updateSwapControls();
      }
    }
  }
  // Refresh a resolved grid, without making another device location request.
  setInterval(refreshWhenDue, 60_000);
  document.addEventListener("visibilitychange", refreshWhenDue);
  window.addEventListener("pagehide", () => {
    ++operation;
    ++recipeRequestId;
    clearTimeout(locationDeadline);
    controller?.abort();
  });
  window.addEventListener("pageshow", (event) => {
    if (!event.persisted) return;
    finish(operation);
    if (activeArea) fetchForecast(begin("Refreshing your forecast…", { preserveRecipe: true }), null, activeArea);
    else {
      if (citySelect.value === "device") citySelect.value = "hayward";
      selectCity();
    }
  });
  selectCity();
}
