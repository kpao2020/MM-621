/*
  Project 2: Spooky Weather
  Witch-flying card animation and wind graphic.

  Description:
    - Animates wind streaks using the current wind speed and direction.
    - Hides the direction arrow when NOAA has no direction reading.

  References:
    - P5.js: https://p5js.org/reference/
    - NOAA API: https://www.weather.gov/documentation/services-web-api
    - OpenAI ChatGPT for code assistance and optimization suggestions.

  Code Origin:
    - [MIXED] original sketch and revised with AI-assistance.
*/

// ============================================================
// DRAW WIND GRAPHIC
// - Move layered wind lines at a speed controlled by the observation.
// ============================================================
function drawWindGraphic(centerX, centerY) {
  const METRIC_COLOR = getMetricColor(2);
  const WIND_MOTION = (frameCount * map(weatherData.windSpeed || 0, 0, 30, 1, 4, true)) % 90;
  const HAS_WIND_DIRECTION = weatherData.windDirectionLabel !== 'direction unavailable';
  const DIRECTION_DEGREES = weatherData.windDirection ?? 0;
  const DIRECTION_ANGLE = HAS_WIND_DIRECTION ? radians(DIRECTION_DEGREES + 180) - HALF_PI : 0;

  // Isolate wind streaks and arrow rotation from other elements
  push();
  translate(centerX, centerY - 8);
  rotate(DIRECTION_ANGLE);
  noFill();
  stroke(METRIC_COLOR);
  strokeWeight(5);
  for (let i = 0; i < 4; i++) {
    // Keep the wind lines moving in the same direction as the arrow.
    const LINE_Y = -48 + i * 27;
    line(-104 + WIND_MOTION, LINE_Y, -20 + WIND_MOTION, LINE_Y);
    line(4 + WIND_MOTION, LINE_Y, 72 + WIND_MOTION, LINE_Y);
  }
  if (HAS_WIND_DIRECTION) {
    fill(METRIC_COLOR);
    noStroke();
    triangle(100, 0, 76, -14, 76, 14);
  }
  pop();

  noStroke();
  fill(255);
  textAlign(CENTER, CENTER);
  textStyle(BOLD);
  textSize(18);
  text(formatValue(weatherData.windSpeed, ' mph'), centerX, centerY + 88);
  fill(178, 193, 240);
  textStyle(NORMAL);
  textSize(13);
  text(HAS_WIND_DIRECTION ? `From ${weatherData.windDirectionLabel}` : 'Broom heading unknown', centerX, centerY + 113);
}