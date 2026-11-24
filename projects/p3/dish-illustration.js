// A playful, decorative dish, not a picture of the generated recipe.
document.addEventListener("DOMContentLoaded", () => {
  const container = document.getElementById("dish-illustration");
  if (!container || typeof window.p5 !== "function") return;
  new window.p5((p) => {
    let seed = Math.floor(Math.random() * 1000000);
    let isSoup = false;
    let hasNoodles = false;
    let servings = 1;
    let ingredientColors = [];
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    window.refreshDishIllustration = (recipe) => {
      seed = Math.floor(Math.random() * 1000000);
      isSoup = /\b(soup|broth|stew|ramen|pho)\b/i.test(`${recipe.name || ""} ${recipe.summary || ""}`);
      hasNoodles = /\b(noodles?|pasta|spaghetti|ramen|pho)\b/i.test(`${recipe.name || ""} ${(recipe.ingredients || []).map((item) => item.name).join(" ")}`);
      servings = Number(recipe.servings) || 1;
      ingredientColors = (recipe.ingredients || []).map((item) => {
        const name = item.name.toLowerCase();
        if (/tomato|pepper|carrot/.test(name)) return "#df795f";
        if (/spinach|broccoli|herb|basil|cilantro|kale/.test(name)) return "#6f9d68";
        if (/onion|cabbage|eggplant/.test(name)) return "#8a86ba";
        if (/chicken|tofu|egg|bean|rice/.test(name)) return "#e3ad52";
        return "#d4bd92";
      });
      if (reduceMotion.matches) p.redraw();
    };
    window.setDishServings = (count) => {
      servings = Math.max(1, Math.min(4, Number(count) || 1));
      if (reduceMotion.matches) p.redraw();
    };
    p.setup = () => {
      p.createCanvas(240, 160);
      p.pixelDensity(1);
      p.frameRate(24);
      if (reduceMotion.matches) p.noLoop();
    };
    p.draw = () => {
      p.clear();
      p.randomSeed(seed);
      const phase = reduceMotion.matches ? 0 : p.frameCount * 0.025;
      const palette = ["#df795f", "#e3ad52", "#6f9d68", "#8a86ba"];
      p.noStroke();
      p.fill("#e5ebdc"); p.ellipse(120, 140, 184, 18);
      if (isSoup) {
        p.fill("#4f775b"); p.arc(120, 79, 180, 118, 0, p.PI, p.CHORD);
        p.fill("#e8d6ae"); p.ellipse(120, 77, 180, 100);
        p.fill("#f3c77c"); p.ellipse(120, 75, 158, 82);
        p.fill("#f8d99d"); p.ellipse(120, 72, 148, 74);
      } else {
        p.fill("#ead9bb"); p.ellipse(120, 83, 180, 132);
        p.fill("#fffaf0"); p.ellipse(120, 78, 180, 132);
        p.fill("#f2e5c9"); p.ellipse(120, 78, 144, 104);
        p.fill("#f8edcc"); p.ellipse(120, 75, 136, 96);
      }

      p.noFill(); p.stroke("#e4ae53"); p.strokeWeight(4); p.strokeCap(p.ROUND);
      const gradient = p.drawingContext.createLinearGradient(65, 50, 165, 105);
      palette.forEach((color, index) => gradient.addColorStop(index / (palette.length - 1), color));
      p.drawingContext.strokeStyle = gradient;
      for (let i = 0; i < (hasNoodles ? 4 + servings : 0); i++) {
        const y = 51 + i * 11;
        const x = 72 + p.random(-6, 6);
        p.bezier(x, y, 90 + p.random(-10, 10), y - 16 + Math.sin(phase + i) * 3,
          135 + p.random(-10, 10), y + 20, 163 + p.random(-7, 7), y + 2);
      }

      p.noStroke();
      const leaf = (x, y, angle) => {
        p.push(); p.translate(x, y); p.rotate(angle);
        p.fill("#6f9d68"); p.ellipse(0, 0, 26, 13);
        p.stroke("#487a50"); p.strokeWeight(1.5); p.line(-8, 0, 8, 0);
        p.pop();
      };
      const greenCount = ingredientColors.filter((color) => color === "#6f9d68").length;
      for (let i = 0; i < Math.min(greenCount * servings, 6); i++) leaf(p.random(82, 158), p.random(51, 102), p.random(-1, 1));
      p.noStroke();
      for (let i = 0; i < Math.min(3 + servings * 4, 19); i++) {
        const x = p.random(80, 160), y = p.random(53, 99), size = p.random(10, 19);
        p.fill(ingredientColors.length ? ingredientColors[i % ingredientColors.length] : palette[i % palette.length]); p.circle(x, y, size);
        p.fill("#fff5dd"); p.circle(x - size * 0.17, y - size * 0.17, size * 0.23);
      }
      p.stroke("#dfaa53"); p.strokeWeight(2); p.strokeCap(p.ROUND);
      p.line(32, 38, 32, 47); p.line(27, 42, 37, 42);
      p.line(207, 107, 207, 116); p.line(202, 111, 212, 111);
      p.noStroke(); p.fill("#dd8067"); p.circle(200, 44 + Math.sin(phase) * 3, 5); p.circle(42, 110 + Math.cos(phase) * 3, 5);
    };
  }, container);
});
