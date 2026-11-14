// Browser-to-Worker recipe request. This payload never includes location coordinates.
window.ForecastMealAPI = Object.freeze({
  async createRecipe(input, turnstileToken) {
    const workerUrl = String(window.FORECAST_MEAL_CONFIG?.workerUrl || "")
      .trim()
      .replace(/\/+$/, "");
    if (!workerUrl) throw new Error("The recipe service is not configured yet.");

    let response;
    try {
      response = await fetch(`${workerUrl}/api/recipe`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...input, turnstileToken }),
        cache: "no-store",
        credentials: "omit",
        referrerPolicy: "no-referrer",
      });
    } catch {
      throw new Error("Could not reach the recipe service. Check your connection and try again.");
    }

    let data;
    try { data = await response.json(); }
    catch { throw new Error("The recipe service returned an unreadable response."); }
    if (!response.ok) throw new Error(typeof data?.error === "string" ? data.error : "The recipe could not be generated. Please try again.");
    if (!data || typeof data !== "object" || !data.recipe || !Array.isArray(data.recipe.ingredients) || !Array.isArray(data.recipe.steps)) {
      throw new Error("The recipe service returned an incomplete recipe. Please try again.");
    }
    return data;
  },
});
