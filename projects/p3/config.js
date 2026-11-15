// Public browser configuration.
const isLocalPreview = ["localhost", "127.0.0.1"].includes(
  window.location.hostname,
);
window.FORECAST_MEAL_CONFIG = Object.freeze({
  workerUrl: isLocalPreview
    ? "http://localhost:8787"
    : "https://forecast-meal-api.xoakuma.workers.dev",
});
