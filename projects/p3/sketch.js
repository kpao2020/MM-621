// Basket Buddy main p5.js entry point.
// p5 draws a small basket illustration; semantic HTML handles the form and results.

const APP_COLORS = {
  ink: "#21352e",
  green: "#466d50",
  leaf: "#8db779",
  berry: "#d76e57",
  gold: "#f2c766",
  basket: "#c99058",
  cream: "#fbf7ef",
};

function setup() {
  const canvas = createCanvas(208, 154);
  canvas.parent("basket-art");
  pixelDensity(1);
  noLoop();
  drawBasketIllustration();
  wireMealForm();
  showDeploymentHintWhenNeeded();
}

function drawBasketIllustration() {
  clear();
  noStroke();

  // Soft leaf shapes keep the illustration light and decorative.
  fill("#dce8cf");
  ellipse(45, 77, 33, 15);
  ellipse(163, 54, 34, 16);
  fill("#e9ddc0");
  ellipse(171, 112, 23, 13);

  // Fruit peeks above a simple hand-drawn basket.
  fill(APP_COLORS.berry);
  circle(76, 62, 36);
  circle(101, 49, 37);
  circle(128, 65, 35);
  fill(APP_COLORS.gold);
  circle(56, 70, 26);
  circle(150, 78, 25);
  fill(APP_COLORS.leaf);
  ellipse(101, 27, 22, 10);
  ellipse(113, 31, 18, 8);
  ellipse(74, 42, 18, 8);
  ellipse(137, 43, 18, 8);

  // Basket rim, body, and woven stripes.
  fill(APP_COLORS.basket);
  quad(39, 78, 168, 78, 150, 136, 57, 136);
  fill("#b97943");
  quad(32, 75, 175, 75, 170, 87, 37, 87);
  stroke("#e1ad70");
  strokeWeight(4);
  line(55, 99, 157, 99);
  line(53, 116, 152, 116);
  noStroke();
  fill("#f0c98e");
  triangle(65, 136, 88, 88, 101, 136);
  triangle(113, 136, 132, 88, 143, 136);
}

function wireMealForm() {
  const form = document.getElementById("meal-form");
  const input = document.getElementById("meal-request");
  const button = document.getElementById("submit-button");
  const status = document.getElementById("status-message");
  const verificationContainer = document.getElementById("verification-widget");
  let verificationToken = "";
  let verificationWidget = null;
  let submitting = false;

  // Turnstile tokens are short-lived and single-use; a new one is needed after each request.
  function startVerification(attempt = 0) {
    const siteKey = String(window.BASKET_BUDDY_CONFIG?.turnstileSiteKey || "").trim();
    if (!siteKey) {
      showStatus("Security verification is not configured yet.", "error");
      return;
    }
    if (!window.turnstile?.render) {
      if (attempt < 60) window.setTimeout(() => startVerification(attempt + 1), 250);
      else showStatus("Could not load verification. Please refresh the page.", "error");
      return;
    }
    try {
      verificationWidget = window.turnstile.render("#verification-widget", {
        sitekey: siteKey,
        action: "basket_meal",
        size: "flexible",
        appearance: "interaction-only",
        callback: (token) => {
          verificationToken = token;
          verificationContainer.hidden = true;
          if (!submitting) button.disabled = false;
          if (status.dataset.verification === "waiting") {
            status.hidden = true;
            delete status.dataset.verification;
          }
        },
        "expired-callback": () => {
          verificationToken = "";
          verificationContainer.hidden = false;
          button.disabled = true;
        },
        "error-callback": () => {
          verificationToken = "";
          verificationContainer.hidden = false;
          button.disabled = true;
          status.dataset.verification = "waiting";
          showStatus("Verification could not load. Please refresh the page.", "error");
        },
      });
    } catch {
      showStatus("Could not start verification. Please refresh the page.", "error");
    }
  }

  startVerification();

  document.getElementById("new-meal").addEventListener("click", () => {
    window.BasketBuddyResults.clear();
    input.value = "";
    status.hidden = true;
    input.scrollIntoView({ behavior: "smooth", block: "center" });
    input.focus({ preventScroll: true });
  });

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const mealRequest = input.value.trim();
    if (mealRequest.length < 3) {
      showStatus("Please describe a meal in a little more detail.", "error");
      input.focus();
      return;
    }

    if (!verificationToken) {
      showStatus("Please complete the security check first.", "error");
      return;
    }

    const requestToken = verificationToken;
    verificationToken = "";
    submitting = true;
    button.disabled = true;
    form.setAttribute("aria-busy", "true");
    button.innerHTML = '<span>Building your basket…</span><span class="loading-spinner" aria-hidden="true"></span>';
    showStatus("Making your meal list and checking recorded prices…", "loading");
    window.BasketBuddyResults.clear();

    try {
      const data = await window.BasketBuddyAPI.createBasket(mealRequest, requestToken);
      window.BasketBuddyResults.render(data);
      showStatus("Your basket is ready. Check each date and store below.", "success");
      document.getElementById("results-heading").scrollIntoView({ behavior: "smooth", block: "start" });
    } catch (error) {
      console.error("[Basket Buddy] Could not build the basket.", error);
      showStatus(error?.message || "Something went wrong. Please try again.", "error");
    } finally {
      // Preserve the shopper's request so errors never erase what they typed.
      input.value = mealRequest;
      form.removeAttribute("aria-busy");
      button.innerHTML = '<span>Build my basket</span><span aria-hidden="true">→</span>';
      submitting = false;
      // A verified token cannot be reused, even when the request fails.
      if (verificationWidget !== null && window.turnstile?.reset) {
        try {
          verificationContainer.hidden = false;
          window.turnstile.reset(verificationWidget);
        } catch {
          button.disabled = true;
          showStatus("Could not restart verification. Please refresh the page.", "error");
        }
      } else {
        button.disabled = true;
      }
    }
  });

  function showStatus(message, kind) {
    status.textContent = message;
    status.className = `status-message status-${kind}`;
    status.hidden = false;
  }
}

function showDeploymentHintWhenNeeded() {
  const workerUrl = String(window.BASKET_BUDDY_CONFIG?.workerUrl || "");
  const localHost = ["localhost", "127.0.0.1"].includes(window.location.hostname);
  const workerIsLocal = /127\.0\.0\.1|localhost/.test(workerUrl);
  document.getElementById("local-setup").hidden = !(workerIsLocal && !localHost);
}
