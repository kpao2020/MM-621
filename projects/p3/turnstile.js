// Turnstile runs only when enabled in the public configuration.
window.ForecastMealTurnstile = Object.freeze({
  async getToken() {
    const config = window.FORECAST_MEAL_CONFIG?.turnstile;
    if (!config?.enabled) return null;
    if (!config.siteKey) throw new Error("Verification is not configured. Please try again later.");
    await loadTurnstile();
    return new Promise((resolve, reject) => {
      document.getElementById("turnstile-verification-status")?.remove();
      const container = document.createElement("div");
      container.setAttribute("aria-label", "Human verification");
      container.style.margin = "1rem auto";
      const form = document.getElementById("recipe-form");
      (form || document.body).appendChild(container);
      let widgetId;
      let settled = false;
      let challengeFailures = 0;
      const timer = setTimeout(() => { console.error("Turnstile diagnostic: timed out waiting for verification."); finish(null); }, 120_000);
      function finish(token) {
        if (settled) return;
        settled = true;
        clearTimeout(timer);
        // Let Turnstile finish its callback before removing its widget.
        setTimeout(() => {
          if (widgetId !== undefined) window.turnstile.remove(widgetId);
          container.remove();
        }, 0);
        if (token) {
          const status = document.createElement("span");
          status.id = "turnstile-verification-status";
          status.className = "turnstile-verification-status";
          status.setAttribute("role", "status");
          status.textContent = "✓ Verified";
          container.after(status);
          resolve(token);
        } else reject(new Error("Verification could not be completed. Please try again."));
      }
      try {
        widgetId = window.turnstile.render(container, {
          sitekey: config.siteKey,
          action: "forecast_recipe",
          size: "flexible",
          appearance: "interaction-only",
          retry: "auto",
          callback: finish,
          "error-callback": (code) => {
            const safeCode = String(code);
            console.error("Turnstile diagnostic: challenge error", /^\d{1,10}$/.test(safeCode) ? safeCode : "code unavailable");
            challengeFailures += 1;
            if (challengeFailures < 2) return false;
            finish(null);
            return true;
          },
          "expired-callback": () => { console.error("Turnstile diagnostic: token expired."); finish(null); },
        });
      } catch { console.error("Turnstile diagnostic: widget render failed."); finish(null); }
    });
  },
});

let turnstileLoading;
function loadTurnstile() {
  if (window.turnstile) return Promise.resolve();
  if (turnstileLoading) return turnstileLoading;
  turnstileLoading = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    const timer = setTimeout(() => finish(false), 15_000);
    function finish(ok) {
      clearTimeout(timer);
      if (ok && window.turnstile) resolve();
      else { script.remove(); reject(new Error("Verification could not load. Please try again.")); }
    }
    script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
    script.onload = () => finish(true);
    script.onerror = () => finish(false);
    document.head.appendChild(script);
  }).catch((error) => { turnstileLoading = null; throw error; });
  return turnstileLoading;
}

// Prepare the script early; the challenge still starts only on a recipe action.
if (window.FORECAST_MEAL_CONFIG?.turnstile?.enabled) {
  loadTurnstile().catch(() => {});
}
