/*
  Project 3: Forecast Meal
  Public browser configuration.

  Description:
    - Selects the local Worker for a local preview.
    - Selects the deployed Worker for the public website.

  Credits:
    - Cloudflare Workers for hosting the recipe service.
    - OpenAI ChatGPT (Codex) for code assistance and revisions.

  Code Origin:
    - [ORIGINAL PROJECT CONFIGURATION + AI-ASSISTED REVISIONS]
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
