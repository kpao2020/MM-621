/*
  Project 2: Spooky Weather
  Haunted pressure card animation and pressure graphic.

  Description:
    - Shows atmospheric pressure with expanding animated waves.
    - Displays the current pressure value from the NOAA observation.

  References:
    - P5.js: https://p5js.org/reference/
    - NOAA API: https://www.weather.gov/documentation/services-web-api
    - OpenAI ChatGPT for code assistance and optimization suggestions.

  Code Origin:
    - [MIXED] original sketch; the expanding pressure waves graphic and
      pressure value display were added with AI assistance.
*/

// ============================================================
// DRAW PRESSURE GRAPHIC
// - Expand atmospheric wave rings to represent air pressure.
// ============================================================
function drawPressureGraphic(centerX, centerY) {
  const METRIC_COLOR = getMetricColor(3);
  const PULSE = (frameCount % 150) / 150;

  // Three full expanding waves keep air pressure visibly animated.
  for (let i = 0; i < 3; i++) {
    const PHASE = (PULSE + i / 3) % 1;
    const DIAMETER = 28 + PHASE * 176;
    noFill();
    stroke(red(METRIC_COLOR), green(METRIC_COLOR), blue(METRIC_COLOR), 240 * (1 - PHASE));
    strokeWeight(2 + (1 - PHASE) * 2);
    circle(centerX, centerY - 8, DIAMETER);
  }
  noStroke();
  fill(255, 177, 105, 220);
  circle(centerX, centerY - 8, 18 + sin(frameCount * 0.12) * 4);
  noStroke();
  fill(255);
  textAlign(CENTER, CENTER);
  textStyle(BOLD);
  textSize(20);
  text(formatValue(weatherData.pressure, ' inHg'), centerX, centerY + 96);
}