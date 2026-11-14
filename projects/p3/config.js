// Public browser configuration. The Turnstile site key is public by design.
// Keep its matching secret in the Cloudflare Worker secret store only.
window.FORECAST_MEAL_CONFIG = Object.freeze({
  workerUrl: "https://forecast-meal-api.xoakuma.workers.dev",
  turnstileSiteKey: "0x4AAAAAAF5g9O8lgf8ve72J",
});
