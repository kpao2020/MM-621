// Small, reusable p5.js drawings for the nutrition table.
window.ForecastMealNutrientIcons = Object.freeze({
  mount(root = document) {
    if (typeof window.p5 !== "function") return;
    root.querySelectorAll("[data-nutrient-icon]").forEach((container) => {
      if (container.dataset.iconMounted === "true") return;
      const kind = container.dataset.nutrientIcon;
      if (!["calories", "protein", "carbohydrates", "fat", "fiber", "sodium"].includes(kind)) return;
      container.dataset.iconMounted = "true";
      try {
        new window.p5((p) => {
          p.setup = () => {
            p.createCanvas(28, 28);
            p.pixelDensity(1);
            p.noLoop();
            drawNutrientIcon(p, kind);
          };
        }, container);
      } catch {
        container.dataset.iconMounted = "false";
      }
    });
  },
});

function drawNutrientIcon(p, kind) {
  const colors = {
    calories: ["#e8b64f", "#fff3cf"],
    protein: ["#5f8a57", "#e3eedc"],
    carbohydrates: ["#bd8b44", "#f5e8cb"],
    fat: ["#ce765f", "#f8e1d9"],
    fiber: ["#6f9b69", "#e1efdc"],
    sodium: ["#648da0", "#dcebf0"],
  };
  const [ink, pale] = colors[kind];
  p.clear();
  p.strokeJoin(p.ROUND);
  p.strokeCap(p.ROUND);

  if (kind === "calories") {
    p.noStroke(); p.fill(ink);
    p.beginShape();
    p.vertex(16, 2); p.vertex(7, 15); p.vertex(12, 15);
    p.vertex(10, 26); p.vertex(21, 11); p.vertex(15, 11);
    p.endShape(p.CLOSE);
  } else if (kind === "protein") {
    p.fill(pale); p.stroke(ink); p.strokeWeight(2);
    p.push(); p.translate(14, 14); p.rotate(-0.55); p.ellipse(0, 0, 12, 19); p.pop();
    p.noFill(); p.stroke(ink); p.strokeWeight(1.5);
    p.line(10, 17, 17, 8);
  } else if (kind === "carbohydrates") {
    p.stroke(ink); p.strokeWeight(2); p.line(14, 25, 14, 4);
    p.fill(pale); p.stroke(ink); p.strokeWeight(1.5);
    p.push(); p.translate(10, 9); p.rotate(-0.65); p.ellipse(0, 0, 6, 10); p.pop();
    p.push(); p.translate(18, 13); p.rotate(0.65); p.ellipse(0, 0, 6, 10); p.pop();
    p.push(); p.translate(10, 18); p.rotate(-0.65); p.ellipse(0, 0, 6, 9); p.pop();
  } else if (kind === "fat") {
    p.fill(pale); p.stroke(ink); p.strokeWeight(2);
    p.beginShape();
    p.vertex(14, 3); p.vertex(18, 10); p.vertex(22, 16);
    p.vertex(23, 20); p.vertex(21, 24); p.vertex(18, 27);
    p.vertex(14, 28); p.vertex(10, 27); p.vertex(7, 24);
    p.vertex(5, 20); p.vertex(6, 16); p.vertex(10, 10);
    p.endShape(p.CLOSE);
    p.noStroke(); p.fill(ink); p.ellipse(11, 19, 3, 3);
  } else if (kind === "fiber") {
    p.fill(pale); p.stroke(ink); p.strokeWeight(2);
    p.push(); p.translate(14, 14); p.rotate(0.65); p.ellipse(0, 0, 12, 21); p.pop();
    p.line(9, 20, 19, 8); p.line(12, 16, 9, 12); p.line(15, 13, 19, 14);
  } else {
    p.fill(pale); p.stroke(ink); p.strokeWeight(2);
    p.rect(8, 10, 12, 16, 3); p.rect(10, 6, 8, 4, 1);
    p.noStroke(); p.fill(ink);
    p.circle(12, 8, 1.5); p.circle(16, 8, 1.5);
    p.circle(12, 15, 1.5); p.circle(16, 15, 1.5); p.circle(14, 19, 1.5);
  }
}
