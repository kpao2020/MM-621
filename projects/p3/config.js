/*
  Project 3: Forecast Meal
  Public browser configuration.

  Description:
    - Selects the local Worker for a local preview.
    - Selects the deployed Worker for the public website.
*/

// ============================================================
// WORKER CONFIGURATION
// Use the local Worker for previews and the deployed Worker for the public page.
// ============================================================
const isLocalPreview = ["localhost", "127.0.0.1"].includes(
  window.location.hostname,
);
window.FORECAST_MEAL_CONFIG = Object.freeze({
  workerUrl: isLocalPreview
    ? "http://localhost:8787"
    : "https://forecast-meal-api.xoakuma.workers.dev",
});
