// Browser-to-Worker API helper.
// Provider credentials and Open Prices requests stay on the Worker.
window.BasketBuddyAPI = {
  async createBasket(mealRequest, turnstileToken) {
    const workerUrl = String(window.BASKET_BUDDY_CONFIG?.workerUrl || "")
      .trim()
      .replace(/\/+$/, "");
    if (!workerUrl) throw new Error("Add your Cloudflare Worker URL to config.js first.");

    let response;
    try {
      response = await fetch(`${workerUrl}/api/meal`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mealRequest, turnstileToken }),
      });
    } catch (error) {
      console.error("[Basket Buddy] Could not reach the Worker.", error);
      throw new Error("Could not reach Basket Buddy. Check the connection and try again.");
    }

    console.info("[Basket Buddy] Worker response received.", {
      status: response.status,
      ok: response.ok,
    });

    let data;
    try {
      data = await response.json();
    } catch {
      throw new Error("The API returned an unreadable response. Please try again.");
    }

    if (!response.ok) {
      throw new Error(data?.error || `The request failed (${response.status}).`);
    }

    if (!data || typeof data !== "object" || !Array.isArray(data.products)) {
      console.error("[Basket Buddy] Worker returned an unexpected successful response shape.", {
        type: typeof data,
        keys: data && typeof data === "object" ? Object.keys(data) : [],
      });
      throw new Error("The Worker returned a response in an unexpected format. Check the browser console for details.");
    }

    console.info("[Basket Buddy] Basket data received.", {
      productCount: data.products.length,
      generatedAt: data.generatedAt || null,
    });
    return data;
  },
};
