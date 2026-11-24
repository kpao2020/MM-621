/*
  Project 3: Forecast Meal
  Decorative recipe dish illustration.

  Description:
    - Uses a separate p5.js sketch to draw a bowl or plate for the recipe.
    - Changes colors, noodles, and decorative pieces based on recipe details.
    - Supports the user's reduced-motion setting.
    - The drawing is decorative, not a picture of the generated recipe.

  References:
    - p5.js: https://p5js.org/reference/
    - OpenAI ChatGPT (Codex) for code assistance and optimization suggestions.

  Credits:
    - p5.js for the original plate, food shapes, and animation.
    - OpenAI ChatGPT (Codex) for code assistance and visual revisions.

  Code Origin:
    - [ORIGINAL P5.JS ILLUSTRATION + AI-ASSISTED REVISIONS]
*/

// ============================================================
// DISH ILLUSTRATION
// Create a separate p5 sketch inside the recipe result.
// ============================================================
document.addEventListener("DOMContentLoaded", () => {
  const container = document.getElementById("dish-illustration");
  if (!container || typeof window.p5 !== "function") return;
  new window.p5((p) => {
    let seed = p.floor(p.random(1000000));
    let isSoup = false;
    let hasNoodles = false;
    let hasTomato = false;
    let servings = 1;
    let vegetables = [];
    let protein = "";
    let hasRice = false;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

    // ============================================================
    // UPDATE DISH FROM RECIPE
    // Choose the dish style and colors from the generated ingredient names.
    // ============================================================
    window.refreshDishIllustration = (recipe) => {
      seed = p.floor(p.random(1000000));
      isSoup = /\b(soup|broth|stew|ramen|pho)\b/i.test(`${recipe.name || ""} ${recipe.summary || ""}`);
      const ingredientNames = (recipe.ingredients || []).map((item) => item.name.toLowerCase());
      const ingredientText = `${recipe.name || ""} ${recipe.summary || ""} ${ingredientNames.join(" ")}`.toLowerCase();
      hasNoodles = /\b(noodles?|pasta|spaghetti|ramen|pho)\b/i.test(ingredientText);
      hasTomato = /\btomato(?:es)?\b/i.test(ingredientText);
      hasRice = /\b(rice|quinoa|couscous|farro|bulgur)\b/i.test(ingredientText);
      const listedVegetables = ingredientNames.flatMap((name) => {
        if (/tomato/.test(name)) return ["tomato"];
        if (/carrot/.test(name)) return ["carrot"];
        if (/broccoli/.test(name)) return ["broccoli"];
        if (/mushroom/.test(name)) return ["mushroom"];
        if (/spinach|kale|lettuce|cabbage|herb|basil|cilantro/.test(name)) return ["leafy"];
        if (/bell pepper|capsicum/.test(name)) return ["pepper"];
        if (/onion|shallot/.test(name)) return ["onion"];
        return [];
      });
      // A featured vegetable can appear in the recipe title but not its ingredient list.
      const namedVegetables = [];
      if (/tomato/.test(ingredientText)) namedVegetables.push("tomato");
      if (/carrot/.test(ingredientText)) namedVegetables.push("carrot");
      if (/broccoli/.test(ingredientText)) namedVegetables.push("broccoli");
      vegetables = [...new Set([...listedVegetables, ...namedVegetables])];
      protein = /\b(fish|salmon|tuna|cod|tilapia|sardine|trout|halibut)\b/i.test(ingredientText)
        ? "fish"
        : /\b(chicken|turkey|beef|pork|steak|lamb|meat)\b/i.test(ingredientText)
          ? "meat"
          : /\b(tofu|bean|lentil|chickpea|egg)\b/i.test(ingredientText) ? "plant" : "";
      servings = Number(recipe.servings) || 1;
      if (reduceMotion.matches) p.redraw();
    };

    // ============================================================
    // UPDATE SERVINGS
    // Change the number of decorative pieces and redraw when motion is reduced.
    // ============================================================
    window.setDishServings = (count) => {
      servings = p.constrain(Number(count) || 1, 1, 4);
      if (reduceMotion.matches) p.redraw();
    };

    // ============================================================
    // P5 SETUP
    // Create the canvas and respect the reduced-motion setting.
    // ============================================================
    p.setup = () => {
      p.createCanvas(320, 214);
      p.pixelDensity(1);
      p.frameRate(24);
      if (reduceMotion.matches) p.noLoop();
    };

    // ============================================================
    // DRAW DISH
    // Use a fixed random seed so the ingredients stay in place between frames.
    // ============================================================
    p.draw = () => {
      p.clear();
      p.push();
      p.scale(4 / 3);
      // Repeat the same random positions on each frame so the food does not jump.
      p.randomSeed(seed);
      // Freeze the animation phase when the user prefers reduced motion.
      const phase = reduceMotion.matches ? 0 : p.frameCount * 0.025;
      const palette = ["#df795f", "#e3ad52", "#6f9d68", "#8a86ba"];
      p.noStroke();
      // Layer soft shadows, a warm plate rim, and a clean inner plate.
      p.fill("#dce4d4"); p.ellipse(120, 143, 190, 18);
      p.fill("#d4c5a6"); p.ellipse(120, 83, 196, 132);
      p.fill("#fffdf5"); p.ellipse(120, 78, 190, 130);
      p.fill("#f2e7ce"); p.ellipse(120, 77, 160, 105);
      if (isSoup) {
        p.fill("#527657"); p.arc(120, 78, 166, 104, 0, p.PI, p.CHORD);
        p.fill("#e7d5ae"); p.ellipse(120, 75, 162, 91);
        p.fill("#c98b4a"); p.ellipse(120, 72, 148, 76);
        p.fill("#e7bc72"); p.ellipse(120, 69, 140, 67);
      } else {
        p.fill("#f8efdb"); p.ellipse(120, 75, 146, 83);
      }

      // ============================================================
      // RICE OR GRAINS
      // Draw a small mound with visible grains when the recipe includes one.
      // ============================================================
      if (hasRice && !hasNoodles) {
        p.noStroke(); p.fill("#fff8e8"); p.ellipse(91, 87, 69, 43);
        p.fill("#ead9b8");
        for (let i = 0; i < 15 + servings * 3; i++) {
          p.push(); p.translate(p.random(65, 117), p.random(73, 99)); p.rotate(p.random(-0.7, 0.7));
          p.ellipse(0, 0, 5, 2); p.pop();
        }
      }

      // ============================================================
      // NOODLES
      // Use long overlapping curves so noodles read as strands, not dots.
      // ============================================================
      if (hasNoodles) {
        const context = p.drawingContext;
        const noodleGradient = context.createLinearGradient(65, 55, 174, 84);
        noodleGradient.addColorStop(0, "#d9853f");
        noodleGradient.addColorStop(0.45, "#f2ca68");
        noodleGradient.addColorStop(1, "#df795f");
        context.save();
        context.strokeStyle = noodleGradient;
        context.lineWidth = 3.6;
        context.lineCap = "round";
        for (let i = 0; i < 5 + servings; i++) {
          const y = 58 + i * 5;
          context.beginPath();
          context.moveTo(69, y);
          context.bezierCurveTo(87 + p.sin(phase + i) * 3, y - 17,
            147 + p.cos(phase + i) * 3, y + 18, 172, y - 1);
          context.stroke();
        }
        context.restore();
      }

      // ============================================================
      // VEGETABLES
      // Give common vegetables distinct silhouettes and recognizable colors.
      // ============================================================
      const drawVegetable = (kind, x, y, scale = 1) => {
        p.push(); p.translate(x, y); p.scale(scale); p.noStroke();
        if (kind === "tomato") {
          // A round cross-section and pale seed chambers make this read as a slice.
          p.fill("#b83e35"); p.circle(0, 0, 28);
          p.fill("#e76350"); p.circle(0, 0, 23);
          p.fill("#f7c0a0"); p.circle(0, 0, 7);
          p.fill("#f8d9ad");
          p.ellipse(0, -6, 4, 7); p.ellipse(6, -2, 7, 4);
          p.ellipse(4, 5, 6, 4); p.ellipse(-4, 5, 6, 4); p.ellipse(-6, -2, 7, 4);
          p.fill("#fff0c9");
          p.ellipse(0, -6, 1.5, 2.5); p.ellipse(6, -2, 2.5, 1.5);
          p.ellipse(4, 5, 1.5, 2); p.ellipse(-4, 5, 2, 1.5); p.ellipse(-6, -2, 2.5, 1.5);
        } else if (kind === "carrot") {
          p.fill("#e88b3e"); p.beginShape(); p.vertex(-8, -6); p.vertex(8, -4); p.vertex(1, 9); p.endShape(p.CLOSE);
          p.stroke("#f6bb64"); p.strokeWeight(1.4); p.line(-3, -2, 2, -1); p.line(-1, 3, 3, 4);
        } else if (kind === "broccoli") {
          p.fill("#5f8a52"); p.rect(-3, 0, 6, 9, 2); p.circle(-5, -3, 10); p.circle(2, -5, 12); p.circle(8, -2, 9);
          p.fill("#87a867"); p.circle(-5, -4, 3); p.circle(2, -7, 3);
        } else if (kind === "mushroom") {
          p.fill("#e8d5b7"); p.rect(-3, -1, 6, 11, 3); p.fill("#a97c59"); p.arc(0, 0, 19, 16, p.PI, p.TWO_PI, p.CHORD);
          p.fill("#f3e8d2"); p.arc(0, 0, 12, 8, p.PI, p.TWO_PI, p.CHORD);
        } else if (kind === "pepper") {
          p.fill("#dc6652"); p.beginShape(); p.vertex(-7, -7); p.vertex(0, -4); p.vertex(7, -7); p.vertex(8, 3); p.vertex(2, 9); p.vertex(-5, 7); p.endShape(p.CLOSE);
          p.fill("#5d804c"); p.rect(-1, -12, 2, 7, 1);
        } else if (kind === "onion") {
          p.noFill(); p.stroke("#9b82a2"); p.strokeWeight(3); p.circle(0, 0, 17); p.stroke("#d8c4d3"); p.strokeWeight(2); p.circle(0, 0, 9);
        } else {
          p.fill("#6f9d68"); p.ellipse(0, 0, 24, 12); p.stroke("#487a50"); p.strokeWeight(1.2); p.line(-9, 0, 9, 0);
        }
        p.pop();
      };
      const vegPositions = [[77, 51], [116, 98], [161, 52], [82, 97], [157, 97]];
      const vegKinds = vegetables.length ? vegetables : ["leafy"];
      vegKinds.slice(0, 5).forEach((kind, index) => drawVegetable(kind, ...vegPositions[index], kind === "tomato" ? 1.12 : 0.9));
      // ============================================================
      // FISH, MEAT, OR PLANT PROTEIN
      // Use a fillet, browned slices, or tofu pieces to match the recipe.
      // ============================================================
      if (protein === "fish") {
        p.push(); p.translate(151, 88); p.rotate(-0.2); p.noStroke();
        p.fill("#d99569"); p.beginShape(); p.vertex(-23, -10); p.vertex(13, -9); p.vertex(23, 0); p.vertex(12, 11); p.vertex(-22, 9); p.endShape(p.CLOSE);
        p.fill("#f4d3a3"); p.beginShape(); p.vertex(-18, -6); p.vertex(11, -5); p.vertex(17, 0); p.vertex(10, 6); p.vertex(-18, 5); p.endShape(p.CLOSE);
        p.stroke("#d99569"); p.strokeWeight(1.4); p.line(-9, -5, -5, 5); p.line(0, -5, 4, 5); p.line(8, -4, 11, 4); p.pop();
      } else if (protein === "meat") {
        p.push(); p.translate(151, 88); p.rotate(-0.22);
        for (let i = 0; i < 3; i++) {
          p.noStroke(); p.fill(i === 1 ? "#d99a55" : "#bd7045");
          p.beginShape(); p.vertex(-22 + i * 3, -12 + i * 8); p.vertex(14, -10 + i * 7); p.vertex(22, -5 + i * 7); p.vertex(17, 1 + i * 7); p.vertex(-19 + i * 2, -2 + i * 8); p.endShape(p.CLOSE);
          p.stroke("#f0bf7b"); p.strokeWeight(1.4); p.line(-12, -8 + i * 7, 12, -6 + i * 7);
        }
        p.pop();
      } else if (protein === "plant") {
        p.noStroke(); p.fill("#e7c889");
        p.rect(138, 73, 22, 17, 4); p.rect(153, 91, 20, 15, 4);
        p.fill("#fff0c9"); p.rect(141, 76, 13, 2, 1); p.rect(156, 94, 12, 2, 1);
      }

      // Put visible tomato slices at the front of the plate when the dish names tomato.
      if (hasTomato) {
        drawVegetable("tomato", 82, 96, 1.05);
        drawVegetable("tomato", 110, 101, 1.08);
        drawVegetable("tomato", 138, 96, 1.05);
      }

      p.pop();
    };
  }, container);
});
