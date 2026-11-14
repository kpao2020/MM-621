/*
  Project 3: Forecast Meal — National Weather Service forecast client.
  Adapted from Project 2's weather requests with AI-assisted revisions.
  References: https://www.weather.gov/documentation/services-web-api
              https://developer.mozilla.org/en-US/docs/Web/API/Geolocation

  Flow: coordinates -> NWS /points -> properties.forecast -> remaining today.
  This module does not request device permission, log coordinates, save location,
  contact the meal Worker, or use the old station-observation / sunrise APIs.
*/
(() => {
  "use strict";

  const locations = Object.freeze([
    { id: "hayward", city: "Hayward", latitude: 37.6688, longitude: -122.0808 },
    { id: "oakland", city: "Oakland", latitude: 37.8044, longitude: -122.2712 },
    { id: "san-francisco", city: "San Francisco", latitude: 37.7749, longitude: -122.4194 },
    { id: "san-jose", city: "San Jose", latitude: 37.3382, longitude: -121.8863 },
    { id: "san-mateo", city: "San Mateo", latitude: 37.5630, longitude: -122.3255 },
    { id: "dublin", city: "Dublin", latitude: 37.7022, longitude: -121.9358 },
  ].map(Object.freeze));

  // Bounded cache for preset cities only. Device coordinates are never cached.
  const cityAreas = new Map();

  function localDate(value, timeZone) {
    const parts = new Intl.DateTimeFormat("en-US", {
      timeZone, year: "numeric", month: "2-digit", day: "2-digit",
    }).formatToParts(new Date(value));
    const part = (type) => parts.find((entry) => entry.type === type).value;
    return `${part("year")}-${part("month")}-${part("day")}`;
  }

  function forecastUrl(value) {
    let url;
    try { url = new URL(value); } catch { throw new Error("NWS did not return a usable forecast link. Choose a city or try again."); }
    if (url.origin !== "https://api.weather.gov" || url.username || url.password ||
        !/^\/gridpoints\/[A-Z]{3}\/\d+,\d+\/forecast$/.test(url.pathname) || url.search || url.hash) {
      throw new Error("NWS did not return a supported forecast link. Choose a city or try again.");
    }
    return url.href;
  }

  async function requestJson(url, signal, stage) {
    let response;
    try {
      response = await fetch(url, {
        signal,
        headers: { Accept: "application/geo+json" },
        credentials: "omit",
        referrerPolicy: "no-referrer",
        // Avoid writing device point lookups to the browser's HTTP cache.
        cache: "no-store",
        redirect: "error",
      });
    } catch (error) {
      if (signal?.aborted) throw error;
      throw new Error("Could not reach the National Weather Service. Check your connection, choose a city, or try again.");
    }
    if (response.status === 404 && stage === "points") {
      throw new Error("NWS has no supported land forecast for this location. Choose one of the six Bay Area cities.");
    }
    if (response.status === 429) throw new Error("NWS is receiving too many requests. Wait a moment and try again.");
    if (!response.ok) throw new Error("The National Weather Service is temporarily unavailable. Choose a city or try again shortly.");
    try { return await response.json(); }
    catch { throw new Error("NWS returned unreadable forecast data. Please try again."); }
  }

  async function resolveArea(location, signal) {
    const preset = locations.find((item) => item.id === location.id);
    if (preset && cityAreas.has(preset.id)) return cityAreas.get(preset.id);
    const { latitude, longitude } = preset || location;
    if (!Number.isFinite(latitude) || !Number.isFinite(longitude) ||
        Math.abs(latitude) > 90 || Math.abs(longitude) > 180) {
      throw new Error("The device did not return a valid location. Choose a city instead.");
    }
    // Four decimals (~11 metres) are sufficient for an NWS forecast grid.
    const data = await requestJson(`https://api.weather.gov/points/${latitude.toFixed(4)},${longitude.toFixed(4)}`, signal, "points");
    const props = data?.properties;
    const url = forecastUrl(props?.forecast);
    try { localDate(Date.now(), props?.timeZone || "invalid"); }
    catch { throw new Error("NWS did not identify the forecast time zone. Choose a city or try again."); }
    const place = props?.relativeLocation?.properties;
    const city = typeof place?.city === "string" ? place.city.slice(0, 80) : "";
    const state = typeof place?.state === "string" ? place.state.slice(0, 30) : "";
    const area = Object.freeze({
      forecastUrl: url,
      timeZone: props.timeZone,
      label: preset ? `${preset.city}, California` : (city ? `Near ${city}${state ? `, ${state}` : ""}` : "Your device location"),
      source: preset ? "city" : "device",
    });
    if (preset) cityAreas.set(preset.id, area);
    return area;
  }

  function normalizeForecast(data, area, now = Date.now()) {
    const props = data?.properties;
    if (!Array.isArray(props?.periods)) throw new Error("NWS returned no forecast periods. Please try again.");
    const date = localDate(now, area.timeZone);
    const periods = props.periods.filter((period) => {
      const start = Date.parse(period?.startTime);
      const end = Date.parse(period?.endTime);
      // Include the overnight period after midnight and tonight after sunset.
      // Never present tomorrow's first period as today's forecast.
      return Number.isFinite(start) && Number.isFinite(end) && end > start && end > now &&
        localDate(start, area.timeZone) <= date && localDate(end - 1, area.timeZone) >= date;
    }).map((period) => {
      if (!Number.isFinite(period.temperature) || !["F", "C"].includes(period.temperatureUnit) ||
          typeof period.shortForecast !== "string" || !period.shortForecast.trim() ||
          typeof period.detailedForecast !== "string" || !period.detailedForecast.trim()) {
        throw new Error("NWS returned an incomplete forecast for today. Please try again.");
      }
      const chance = period.probabilityOfPrecipitation?.value;
      return Object.freeze({
        name: typeof period.name === "string" ? period.name.slice(0, 80) : "Forecast period",
        startTime: period.startTime,
        endTime: period.endTime,
        isDaytime: period.isDaytime === true,
        temperatureF: Math.round(period.temperatureUnit === "C" ? period.temperature * 9 / 5 + 32 : period.temperature),
        shortForecast: period.shortForecast.slice(0, 240),
        detailedForecast: period.detailedForecast.slice(0, 2000),
        windSpeed: typeof period.windSpeed === "string" ? period.windSpeed.slice(0, 60) : "Unavailable",
        windDirection: typeof period.windDirection === "string" ? period.windDirection.slice(0, 20) : "",
        precipitationChance: Number.isFinite(chance) && chance >= 0 && chance <= 100 ? chance : null,
      });
    }).sort((a, b) => Date.parse(a.startTime) - Date.parse(b.startTime));
    if (!periods.length) throw new Error("NWS has no remaining forecast for today. Choose a city or try again later.");
    const updated = Date.parse(props.updateTime || props.generatedAt);
    // A valid future period alone does not establish that a forecast is current.
    if (Number.isFinite(updated) && now - updated > 24 * 60 * 60_000) {
      throw new Error("NWS's forecast is more than a day old. Please try again later.");
    }
    return Object.freeze({
      date, timeZone: area.timeZone,
      updatedAt: Number.isFinite(updated) ? new Date(updated).toISOString() : null,
      fetchedAt: new Date(now).toISOString(),
      periods: Object.freeze(periods),
    });
  }

  async function loadForecast(location, { signal } = {}) {
    const area = await resolveArea(location, signal);
    return refreshForecast(area, { signal });
  }

  async function refreshForecast(area, { signal } = {}) {
    const data = await requestJson(forecastUrl(area.forecastUrl), signal, "forecast");
    return { area, forecast: normalizeForecast(data, area) };
  }

  // Explicit allowlist for the next meal-service step. No coordinates, grid URL,
  // place name, raw API response, or arbitrary user text belongs in the AI input.
  function mealContext(forecast) {
    if (!forecast || localDate(Date.now(), forecast.timeZone) !== forecast.date ||
        Date.now() - Date.parse(forecast.fetchedAt) >= 20 * 60_000) {
      throw new Error("Refresh today's forecast before requesting a meal.");
    }
    const periods = forecast.periods.filter((period) => Date.parse(period.endTime) > Date.now());
    if (!periods.length) throw new Error("Refresh today's forecast before requesting a meal.");
    return {
      date: forecast.date,
      timeZone: forecast.timeZone,
      fetchedAt: forecast.fetchedAt,
      periods: periods.map(({ isDaytime, temperatureF, shortForecast, windSpeed, windDirection, precipitationChance }) =>
        ({ isDaytime, temperatureF, shortForecast, windSpeed, windDirection, precipitationChance })),
    };
  }

  window.ForecastWeather = Object.freeze({ locations, loadForecast, refreshForecast, localDate, mealContext });
})();
