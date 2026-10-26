/*
  Project 2: Spooky Weather
  Ectoplasm card animation and flask graphic.

  Description:
    - Draws relative humidity as ectoplasm in an animated flask.
    - The liquid surface ripples while bubbles rise inside the bottle.

  References:
    - P5.js: https://p5js.org/reference/
    - NOAA API: https://www.weather.gov/documentation/services-web-api
    - OpenAI ChatGPT for code assistance and optimization suggestions.

  Code Origin:
    - [MIXED] the flask and liquid animation were revised together 
      (Huamn + AI-assisted).
*/

// ============================================================
// DRAW HUMIDITY GRAPHIC
// - Animate an ectoplasm fill inside a lab-style flask for relative humidity.
// ============================================================
function drawHumidityGraphic(centerX, centerY) {
  push();
  rectMode(CORNER);

  const BOTTLE_TOP = centerY - 83;
  const NECK_WIDTH = 30;
  const NECK_BOTTOM = centerY - 35;
  const BODY_LEFT = centerX - 48;
  const BODY_RIGHT = centerX + 48;
  const BODY_WIDTH = BODY_RIGHT - BODY_LEFT;
  const BODY_TOP = centerY - 10;
  const BODY_BOTTOM = centerY + 58;
  const BODY_HEIGHT = BODY_BOTTOM - BODY_TOP;
  const CORNER_RADIUS = 15;
  const HUMIDITY = constrain(weatherData.humidity || 0, 0, 100);
  const LIQUID_BOTTOM = BODY_BOTTOM - 5;
  const LIQUID_HEIGHT = map(HUMIDITY, 0, 100, 8, BODY_HEIGHT - 12) + sin(frameCount * 0.04);
  const LIQUID_Y = LIQUID_BOTTOM - LIQUID_HEIGHT;

  // Build the flask from p5 primitives so its outline does not rely on
  // custom vertex paths (which were throwing during draw()).
  noStroke();
  fill(35, 44, 50, 88);
  rect(BODY_LEFT, BODY_TOP, BODY_WIDTH, BODY_HEIGHT, CORNER_RADIUS);
  rect(centerX - NECK_WIDTH / 2, BOTTLE_TOP + 12, NECK_WIDTH, NECK_BOTTOM - (BOTTLE_TOP + 12), 4);

  // The liquid is inset from the body, with the same flat bottom and rounded corners.
  noStroke();
  fill(109, 255, 160, 224);
  rect(BODY_LEFT + 6, LIQUID_Y, BODY_RIGHT - BODY_LEFT - 12, LIQUID_HEIGHT, 10);

  // Bubbles rise within the rectangular liquid area to keep the fill animated.
  const LIQUID_DEPTH = LIQUID_BOTTOM - LIQUID_Y;
  if (LIQUID_DEPTH > 20) {
    for (let i = 0; i < 5; i++) {
      // A slow rise makes each bubble take several seconds to cross the liquid.
      const BUBBLE_Y = LIQUID_BOTTOM - ((frameCount * (0.12 + i * 0.025) + i * 19) % LIQUID_DEPTH);
      const BUBBLE_X = centerX + sin(frameCount * 0.015 + i * 1.7) * 24;
      if (BUBBLE_Y > LIQUID_Y + 7) {
        noFill();
        stroke(226, 255, 234, 225);
        strokeWeight(2);
        circle(BUBBLE_X, BUBBLE_Y, 5 + (i % 2) * 2);
      }
    }
  }

  // Restore a gently rippling surface using short connected segments.
  stroke(222, 255, 231, 215);
  strokeWeight(1.5);
  for (let i = 0; i < 8; i++) {
    const SEGMENT_WIDTH = (BODY_WIDTH - 14) / 8;
    const X1 = BODY_LEFT + 7 + i * SEGMENT_WIDTH;
    const X2 = X1 + SEGMENT_WIDTH;
    const Y1 = LIQUID_Y + sin(frameCount * 0.035 + i * 0.55) * 1.5;
    const Y2 = LIQUID_Y + sin(frameCount * 0.035 + (i + 1) * 0.55) * 1.5;
    line(X1, Y1, X2, Y2);
  }

  // Draw one continuous-looking flask silhouette. The body top and neck bottom
  // are intentionally open so there are no duplicate strokes at the joins.
  stroke(230, 250, 237, 235);
  strokeWeight(3);
  line(centerX - NECK_WIDTH / 2, BOTTLE_TOP + 12, centerX - NECK_WIDTH / 2, NECK_BOTTOM);
  line(centerX + NECK_WIDTH / 2, BOTTLE_TOP + 12, centerX + NECK_WIDTH / 2, NECK_BOTTOM);
  line(centerX - NECK_WIDTH / 2, NECK_BOTTOM, BODY_LEFT, BODY_TOP);
  line(centerX + NECK_WIDTH / 2, NECK_BOTTOM, BODY_RIGHT, BODY_TOP);
  line(BODY_LEFT, BODY_TOP, BODY_LEFT, BODY_BOTTOM - CORNER_RADIUS);
  arc(BODY_LEFT + CORNER_RADIUS, BODY_BOTTOM - CORNER_RADIUS, CORNER_RADIUS * 2, CORNER_RADIUS * 2, HALF_PI, PI);
  line(BODY_LEFT + CORNER_RADIUS, BODY_BOTTOM, BODY_RIGHT - CORNER_RADIUS, BODY_BOTTOM);
  arc(BODY_RIGHT - CORNER_RADIUS, BODY_BOTTOM - CORNER_RADIUS, CORNER_RADIUS * 2, CORNER_RADIUS * 2, 0, HALF_PI);
  line(BODY_RIGHT, BODY_BOTTOM - CORNER_RADIUS, BODY_RIGHT, BODY_TOP);
  noStroke();
  fill(255, 171, 93, 245);
  rect(centerX - 20, BOTTLE_TOP - 1, 40, 13, 4);

  fill(255);
  textAlign(CENTER, CENTER);
  textStyle(BOLD);
  textSize(20);
  text(formatValue(weatherData.humidity, '%'), centerX, centerY + 94);
  pop();
}