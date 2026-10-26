/*
  Project 2: Spooky Weather
  Temperature card animation and thermometer graphic.

  Description:
    - Draws the featured temperature as an animated thermometer.
    - Uses the current NOAA temperature to set the fill level and color.

  References:
    - P5.js: https://p5js.org/reference/
    - NOAA API: https://www.weather.gov/documentation/services-web-api
    - OpenAI ChatGPT for code assistance and optimization suggestions.

  Code Origin:
    - [MIXED] original sketch; the temperature animation was
      revised with AI assistance.
*/

// ============================================================
// DRAW TEMPERATURE GRAPHIC
// - Animate a thermometer with the temperature color gradient.
// ============================================================
function drawTemperatureGraphic(centerX, centerY) {
  push();
  rectMode(CORNER);
  const METRIC_COLOR = getMetricColor(0);
  const TEMPERATURE = weatherData.temperature || 0;
  const THERMAL_PULSE = sin(frameCount * 0.07) * 5;
  const LEVEL = constrain(map(TEMPERATURE, 20, 100, 20, 130, true) + THERMAL_PULSE, 20, 130);

  noStroke();
  fill(255, 255, 255, 35);
  rect(centerX - 12, centerY - 76, 24, 132, 12);
  fill(METRIC_COLOR);
  rect(centerX - 7, centerY + 48 - LEVEL, 14, LEVEL, 8);
  circle(centerX, centerY + 56, 40);
  fill(255);
  textAlign(CENTER, CENTER);
  textStyle(BOLD);
  textSize(20);
  text(formatValue(weatherData.temperature, '°F'), centerX, centerY + 106);

  // Tiny motes rise beside the thermometer; cold weather gets pale frost sparks.
  for (let i = 0; i < 4; i++) {
    const MOTE_PHASE = frameCount * 0.035 + i * 1.6;
    const MOTE_X = centerX + (i - 1.5) * 23 + sin(MOTE_PHASE) * 4;
    // Keep motes beside the thermometer instead of drifting into the card row.
    const MOTE_Y = centerY - 68 + ((frameCount * 0.65 + i * 23) % 91);
    if (TEMPERATURE < 50) {
      stroke(197, 229, 255, 150 + sin(MOTE_PHASE) * 70);
      strokeWeight(1.5);
      line(MOTE_X - 3, MOTE_Y, MOTE_X + 3, MOTE_Y);
      line(MOTE_X, MOTE_Y - 3, MOTE_X, MOTE_Y + 3);
    } else {
      noStroke();
      fill(TEMPERATURE >= 80 ? color(255, 146, 73, 190) : color(255, 214, 145, 155));
      ellipse(MOTE_X, MOTE_Y, 4, 7);
    }
  }
  pop();
}