/*
  Project 2: Spooky Weather
  Ghost-sight card animation and visibility graphic.

  Description:
    - Represents visibility with a sweeping beacon and expanding signal rings.
    - Displays the current visibility value from the NOAA observation.

  References:
    - P5.js: https://p5js.org/reference/
    - NOAA API: https://www.weather.gov/documentation/services-web-api
    - OpenAI ChatGPT for code assistance and optimization suggestions.

  Code Origin:
    - [MIXED] original sketch and revised with AI assistance.
*/

// ============================================================
// DRAW VISIBILITY GRAPHIC
// - Animate a horizon and light rays to represent viewing distance.
// ============================================================
function drawVisibilityGraphic(centerX, centerY) {
  const METRIC_COLOR = getMetricColor(4);
  const SWEEP = sin(frameCount * 0.045) * 0.48;
  const BEACON_Y = centerY - 40;

  // A moving beacon sweeps through a haunted horizon while its signal expands.
  for (let i = 0; i < 3; i++) {
    const PHASE = ((frameCount * 0.012) + i / 3) % 1;
    noFill();
    stroke(red(METRIC_COLOR), green(METRIC_COLOR), blue(METRIC_COLOR), 210 * (1 - PHASE));
    strokeWeight(2);
    ellipse(centerX, BEACON_Y, 30 + PHASE * 112, 18 + PHASE * 68);
  }
  stroke(255, 196, 121, 135);
  strokeWeight(2);
  line(centerX - 116, centerY + 31, centerX + 116, centerY + 31);
  stroke(METRIC_COLOR);
  strokeWeight(4);
  line(centerX, BEACON_Y, centerX + sin(SWEEP - 0.55) * 105, centerY + 28);
  line(centerX, BEACON_Y, centerX + sin(SWEEP + 0.55) * 105, centerY + 28);
  noStroke();
  fill(255, 203, 125);
  circle(centerX, BEACON_Y, 24 + sin(frameCount * 0.08) * 7);
  fill(255);
  textAlign(CENTER, CENTER);
  textStyle(BOLD);
  textSize(20);
  text(formatValue(weatherData.visibility, ' mi'), centerX, centerY + 96);
}