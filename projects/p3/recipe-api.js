/*
  Project 3: Forecast Meal
  Browser-to-Worker recipe requests.

  Description:
    - Sends recipe generation and ingredient swap requests to the Worker.
    - Handles timeouts, request errors, and incomplete recipe responses.
    - Request data does not include device location coordinates.

  References:
    - Fetch API: https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API
    - AbortController: https://developer.mozilla.org/en-US/docs/Web/API/AbortController
*/

// ============================================================
// RECIPE SERVICE FUNCTIONS
// Expose recipe generation and ingredient swaps to the main page.
// ============================================================
window.ForecastMealAPI = Object.freeze({
  async createRecipe(input) {
    return request("/api/recipe", input);
  },
  async suggestSwaps(input) {
    return request("/api/swap", input);
  },
});

// ============================================================
// REQUEST TIMEOUT
// Stop waiting after 45 seconds if the Worker does not respond.
// ============================================================
const RECIPE_REQUEST_TIMEOUT_MS = 45_000;

// ============================================================
// SEND RECIPE REQUEST
// Send the selected choices and check the returned recipe before displaying it.
// ============================================================
async function request(path, input) {
    const workerUrl = String(window.FORECAST_MEAL_CONFIG?.workerUrl || "")
      .trim()
      .replace(/\/+$/, "");
    if (!workerUrl) throw new Error("The recipe service is not configured yet.");

    const controller = new AbortController();
    // Abort also stops the response body from waiting indefinitely after the deadline.
    const timeoutId = setTimeout(() => controller.abort(), RECIPE_REQUEST_TIMEOUT_MS);
    try {
      let response;
      try {
        response = await fetch(`${workerUrl}${path}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(input),
          cache: "no-store",
          credentials: "omit",
          referrerPolicy: "no-referrer",
          signal: controller.signal,
        });
      } catch {
        if (controller.signal.aborted) throw new Error("The recipe service took too long to respond. Please try again.");
        const isLocalWorker = new URL(workerUrl).hostname === "localhost";
        throw new Error(isLocalWorker
          ? "Could not reach the local recipe service. Start the Worker dev server on port 8787 and try again."
          : "Could not reach the recipe service. Check your connection and try again.");
      }

      let data;
      try { data = await response.json(); }
      catch {
        if (controller.signal.aborted) throw new Error("The recipe service took too long to respond. Please try again.");
        throw new Error("The recipe service returned an unreadable response.");
      }
      if (!response.ok) throw new Error(typeof data?.error === "string" ? data.error : "The recipe could not be generated. Please try again.");
      // Check fields used by the page before attempting to render a recipe.
      const nutrition = data?.recipe?.nutrition;
      const nutrientKeys = ["calories", "proteinG", "carbohydratesG", "fatG", "fiberG", "sodiumMg"];
      if (!data || typeof data !== "object" || !data.recipe || !Array.isArray(data.recipe.ingredients) || !Array.isArray(data.recipe.steps) ||
          !nutrition || typeof nutrition !== "object" || nutrientKeys.some((key) => !Number.isFinite(nutrition[key]) && nutrition[key] !== null)) {
        throw new Error("The recipe service returned an incomplete recipe. Please try again.");
      }
      return data;
    } finally {
      clearTimeout(timeoutId);
    }
}
