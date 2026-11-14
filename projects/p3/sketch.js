/* Forecast Meal — main p5.js entry point and accessible forecast controls.
   HTML handles interaction and data; p5 draws a small weather-and-bowl illustration.
   No coordinate persistence, location logging, or legacy meal/price requests. */
let illustrationWeather = null;
let illustrationReady = false;
const EXCLUSION_CHOICES = [
  ["dairy", "Dairy"], ["eggs", "Eggs"], ["soy", "Soy"], ["tree_nuts", "Tree nuts"],
  ["peanuts", "Peanuts"], ["gluten", "Wheat / gluten"], ["mushrooms", "Mushrooms"],
  ["tomatoes", "Tomatoes"], ["onions", "Onions"], ["garlic", "Garlic"],
  ["bell_peppers", "Bell peppers"], ["cilantro", "Cilantro"], ["beans", "Beans and lentils"],
  ["fish", "Fish"], ["shellfish", "Shellfish"], ["beef", "Beef"], ["pork", "Pork"], ["poultry", "Chicken and turkey"],
];

function setup() {
  const canvas = createCanvas(208, 154);
  canvas.parent("forecast-art");
  pixelDensity(1);
  noLoop();
  illustrationReady = true;
}

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

// Initialize independently of p5, so a missing illustration cannot block forecasts.
initializeForecastApp();

function initializeForecastApp() {
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
  const generateButton = document.getElementById("generate-recipe");
  const verificationWidgetContainer = document.getElementById("verification-widget");
  const verificationArea = document.getElementById("verification-area");
  const verificationStatus = document.getElementById("verification-status");
  const verificationPrompt = document.getElementById("verification-prompt");
  let recipeControls = [...recipeForm.querySelectorAll("select, input")];
  const servingsSelect = document.getElementById("recipe-servings");
  const resultServings = document.getElementById("result-servings");
  let operation = 0;
  let controller = null;
  let activeArea = null; // Forecast grid metadata only; never raw coordinates.
  let activeForecast = null;
  let busy = false;
  let locating = false;
  let locationDeadline = null;
  let recipeBusy = false;
  let verificationToken = "";
  let verificationWidget = null;
  let renderedRecipe = null;
  let recipeRequestId = 0;

  function setVerificationStatus(message, kind) {
    verificationStatus.textContent = message;
    verificationStatus.className = `verification-status status-${kind}`;
    verificationArea.classList.toggle("is-verified", kind === "success");
    verificationPrompt.hidden = kind === "success";
  }

  function updateGenerateButton() {
    let hasFreshForecast = false;
    try { hasFreshForecast = Boolean(activeForecast && service.mealContext(activeForecast)); }
    catch { hasFreshForecast = false; }
    generateButton.disabled = recipeBusy || !hasFreshForecast || !verificationToken;
    generateButton.textContent = recipeBusy ? "Making your recipe…" : "Get one recipe →";
    for (const control of recipeControls) control.disabled = recipeBusy;
  }

  function startVerification(attempt = 0) {
    const siteKey = String(window.FORECAST_MEAL_CONFIG?.turnstileSiteKey || "").trim();
    if (!siteKey) {
      verificationWidgetContainer.hidden = true;
      setVerificationStatus("Human verification is not configured yet.", "error");
      updateGenerateButton();
      return;
    }
    if (!window.turnstile?.render) {
      if (attempt < 60) window.setTimeout(() => startVerification(attempt + 1), 250);
      else {
        setVerificationStatus("Could not load verification. Refresh the page and try again.", "error");
        updateGenerateButton();
      }
      return;
    }
    try {
      verificationWidget = window.turnstile.render("#verification-widget", {
        sitekey: siteKey,
        action: "forecast_recipe",
        size: "flexible",
        appearance: "always",
        callback: (token) => {
          verificationToken = token;
          verificationWidgetContainer.hidden = true;
          setVerificationStatus("✓ Verified: human", "success");
          updateGenerateButton();
        },
        "expired-callback": () => {
          verificationToken = "";
          verificationWidgetContainer.hidden = false;
          setVerificationStatus("Verification expired. Complete the check to continue.", "error");
          updateGenerateButton();
        },
        "error-callback": () => {
          verificationToken = "";
          verificationWidgetContainer.hidden = false;
          setVerificationStatus("Verification could not complete. Please try again.", "error");
          updateGenerateButton();
        },
      });
    } catch {
      setVerificationStatus("Could not start the security check. Refresh the page and try again.", "error");
    }
    updateGenerateButton();
  }

  function restartVerification() {
    verificationToken = "";
    verificationWidgetContainer.hidden = false;
    updateGenerateButton();
    if (verificationWidget !== null && window.turnstile?.reset) {
      try {
        window.turnstile.reset(verificationWidget);
        setVerificationStatus("Verify again to request another recipe.", "loading");
      } catch {
        setVerificationStatus("Could not restart the check. Refresh the page and try again.", "error");
      }
    }
  }

  function clearRecipe() {
    ++recipeRequestId;
    renderedRecipe = null;
    recipeResult.hidden = true;
    recipeStatus.hidden = true;
  }

  function showStatus(element, text, kind) {
    element.textContent = text;
    element.className = `status-message status-${kind}`;
    element.hidden = false;
  }

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

  function begin(message) {
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
    clearRecipe();
    updateGenerateButton();
    updateIllustration(null);
    showStatus(weatherStatus, message, "loading");
    return { id, signal: controller.signal, controller };
  }

  function finish(id) {
    if (id !== operation) return;
    busy = false;
    locating = false;
    locationButton.disabled = false;
    locationButton.textContent = "◎ Use my location";
    refreshButton.disabled = false;
    section.setAttribute("aria-busy", "false");
  }

  function render({ area, forecast }) {
    activeArea = area;
    activeForecast = forecast;
    document.getElementById("forecast-location").textContent = area.label;
    document.getElementById("location-type").textContent = area.source === "device" ? "Your location" : "Selected city";
    const dateFormat = new Intl.DateTimeFormat("en-US", { timeZone: area.timeZone, weekday: "long", month: "long", day: "numeric", year: "numeric" });
    document.getElementById("forecast-date").textContent = `${dateFormat.format(new Date(forecast.fetchedAt))} · ${area.timeZone}`;
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
      hint.textContent = "Details";
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
    const timestamp = (value) => new Intl.DateTimeFormat("en-US", {
      timeZone: area.timeZone, month: "short", day: "numeric", hour: "numeric", minute: "2-digit", timeZoneName: "short",
    }).format(new Date(value));
    document.getElementById("forecast-updated").textContent = `NWS updated: ${forecast.updatedAt ? timestamp(forecast.updatedAt) : "unavailable"} · Retrieved: ${timestamp(forecast.fetchedAt)}`;
    document.getElementById("forecast-source").href = area.forecastUrl;
    const warning = document.getElementById("forecast-warning");
    warning.hidden = forecast.updatedAt !== null && Date.now() - Date.parse(forecast.updatedAt) < 6 * 60 * 60_000;
    warning.textContent = forecast.updatedAt ? "NWS last updated this forecast over six hours ago. Forecast details may change; use Refresh to check again." : "NWS did not provide an update time for this forecast.";
    showStatus(weatherStatus, `Forecast loaded for ${area.label}.`, "success");
    result.hidden = false;
    updateIllustration(forecast.periods[0]);
    updateGenerateButton();
  }

  async function fetchForecast(request, location, area = null) {
    // A single deadline covers the point lookup, forecast fetch, and response body.
    const timeout = setTimeout(() => request.controller.abort(), 20_000);
    try {
      const response = area
        ? await service.refreshForecast(area, { signal: request.signal })
        : await service.loadForecast(location, { signal: request.signal });
      if (request.id !== operation) return;
      render(response);
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

  function selectCity() {
    const location = service.locations.find((city) => city.id === citySelect.value);
    if (!location) return;
    locationStatus.hidden = true;
    activeArea = null;
    const request = begin(`Loading ${location.city}'s forecast…`);
    fetchForecast(request, location);
  }

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
  startVerification();
  recipeForm.addEventListener("submit", requestRecipe);
  for (const control of recipeControls) control.addEventListener("change", () => {
    const count = recipeForm.querySelectorAll('input[name="excludedIngredients"]:checked').length;
    document.getElementById("exclusion-summary").textContent = count ? `${count} selected` : "Optional · Select";
    updateGenerateButton();
  });
  resultServings.addEventListener("change", renderRecipeIngredients);
  document.getElementById("new-recipe").addEventListener("click", () => {
    clearRecipe();
    document.getElementById("meal-heading").scrollIntoView({ behavior: "smooth", block: "start" });
  });
  locationButton.addEventListener("click", useDeviceLocation);
  refreshButton.addEventListener("click", () => {
    if (activeArea) {
      const area = activeArea;
      fetchForecast(begin(`Refreshing ${area.label}'s forecast…`), null, area);
    } else if (citySelect.value === "device") {
      showStatus(locationStatus, "Tap “Use my location” for a new device reading, or choose a city.", "error");
    } else selectCity();
  });

  function refreshWhenDue() {
    if (document.hidden || busy || locating || !activeForecast || !activeArea) return;
    const now = Date.now();
    if (service.localDate(now, activeArea.timeZone) !== activeForecast.date ||
        now - Date.parse(activeForecast.fetchedAt) >= 20 * 60_000 ||
        Date.parse(activeForecast.periods[0].endTime) <= now) {
      const area = activeArea;
      fetchForecast(begin(`Refreshing ${area.label}'s forecast…`), null, area);
    }
  }

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
      wrapper.append(input, text);
      container.append(wrapper);
    }
  }

  function formatAmount(amount) {
    return new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 }).format(amount);
  }

  function displayUnit(unit, amount) {
    if (unit === "to taste" || unit === "tsp" || unit === "tbsp") return unit;
    if (amount === 1) return unit;
    const plurals = {
      cup: "cups", ounce: "ounces", pound: "pounds", gram: "grams",
      milliliter: "milliliters", liter: "liters", piece: "pieces", clove: "cloves",
      can: "cans", package: "packages", pinch: "pinches",
    };
    return plurals[unit] || unit;
  }

  function renderRecipeIngredients() {
    if (!renderedRecipe) return;
    const targetServings = Number(resultServings.value);
    const list = document.getElementById("recipe-ingredients");
    list.replaceChildren();
    for (const ingredient of renderedRecipe.ingredients) {
      const item = document.createElement("li");
      const amount = ingredient.unit === "to taste"
        ? ingredient.amount
        : ingredient.amount * targetServings / renderedRecipe.servings;
      const quantity = document.createElement("span");
      quantity.className = "ingredient-quantity";
      quantity.textContent = `${formatAmount(amount)} ${displayUnit(ingredient.unit, amount)}`;
      const name = document.createElement("span");
      name.textContent = ingredient.name;
      item.append(quantity, name);
      list.append(item);
    }
  }

  function renderRecipe(recipe, forecast) {
    renderedRecipe = recipe;
    document.getElementById("recipe-title").textContent = recipe.name;
    document.getElementById("recipe-summary").textContent = recipe.summary;
    const firstPeriod = forecast.periods.find((period) => Date.parse(period.endTime) > Date.now()) || forecast.periods[0];
    document.getElementById("recipe-weather").textContent = `Suggested for ${firstPeriod.shortForecast.toLowerCase()} · ${forecast.date}`;
    const stepList = document.getElementById("recipe-steps");
    stepList.replaceChildren();
    for (const step of recipe.steps) {
      const item = document.createElement("li");
      item.textContent = step;
      stepList.append(item);
    }
    resultServings.value = String(recipe.servings);
    renderRecipeIngredients();
    recipeResult.hidden = false;
    showStatus(recipeStatus, "Your recipe is ready. Ingredient quantities scale with the serving choice below.", "success");
  }

  function collectRecipeRequest() {
    const forecast = service.mealContext(activeForecast);
    return {
      dietaryPattern: document.getElementById("dietary-pattern").value,
      cuisine: document.getElementById("preferred-cuisine").value,
      excludedIngredients: [...recipeForm.querySelectorAll('input[name="excludedIngredients"]:checked')].map((input) => input.value),
      servings: Number(servingsSelect.value),
      forecast,
    };
  }

  async function requestRecipe(event) {
    event.preventDefault();
    if (!verificationToken) {
      showStatus(recipeStatus, "Complete human verification first.", "error");
      verificationWidgetContainer.hidden = false;
      verificationWidgetContainer.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    let input;
    try { input = collectRecipeRequest(); }
    catch {
      showStatus(recipeStatus, "Today's forecast needs to refresh before you request a recipe.", "error");
      return;
    }

    const token = verificationToken;
    verificationToken = "";
    const requestId = ++recipeRequestId;
    const requestForecast = activeForecast;
    recipeBusy = true;
    generateButton.disabled = true;
    recipeForm.setAttribute("aria-busy", "true");
    recipeResult.hidden = true;
    showStatus(recipeStatus, "Pairing one simple recipe with today's forecast…", "loading");
    updateGenerateButton();
    try {
      const data = await window.ForecastMealAPI.createRecipe(input, token);
      if (requestId !== recipeRequestId || requestForecast !== activeForecast) return;
      renderRecipe(data.recipe, requestForecast);
      recipeResult.scrollIntoView({ behavior: "smooth", block: "start" });
    } catch (error) {
      if (requestId === recipeRequestId) showStatus(recipeStatus, error.message || "The recipe could not be generated. Please try again.", "error");
    } finally {
      recipeBusy = false;
      recipeForm.removeAttribute("aria-busy");
      restartVerification();
      updateGenerateButton();
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
    if (activeArea) fetchForecast(begin("Refreshing your forecast…"), null, activeArea);
    else {
      if (citySelect.value === "device") citySelect.value = "hayward";
      selectCity();
    }
  });
  selectCity();
}
