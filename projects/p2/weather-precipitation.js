/*
  Project 2: Spooky Weather
  Vampire-rain card animation and weather scene helpers.

  Description:
    - Shows animated rain when precipitation is reported.
    - Uses a sun and drifting cloud for a dry-weather scene.

  References:
    - P5.js: https://p5js.org/reference/
    - NOAA API: https://www.weather.gov/documentation/services-web-api
    - OpenAI ChatGPT for code assistance and optimization suggestions.

  Code Origin:
    - [MIXED] original sketch and revised together with AI-assisted suggestions. 
      The rain and sun/cloud graphics were revised together to create 
      a more dynamic weather scene.
*/

// ============================================================
// DRAW PRECIPITATION GRAPHIC
// - Animate rain drops falling through a colorful precipitation cloud.
// ============================================================
function drawPrecipitationGraphic(centerX, centerY) {
  const HAS_RAIN = weatherData.precipitation != null && weatherData.precipitation > 0;

  if (HAS_RAIN) {
    drawAnimatedCloud(centerX, centerY - 34, 0.9);
    drawAnimatedRain(centerX, centerY + 18, 1);
  } else {
    drawAnimatedSun(centerX - 28, centerY - 35, 0.55);
    drawAnimatedCloud(centerX + 25, centerY - 18, 0.62);
    fill(178, 193, 240);
    textAlign(CENTER, CENTER);
    textStyle(NORMAL);
    textSize(13);
    text('The vampires are thirsty tonight', centerX, centerY + 42);
  }

  fill(255);
  textAlign(CENTER, CENTER);
  textStyle(BOLD);
  textSize(20);
  text(formatValue(weatherData.precipitation, ' in'), centerX, centerY + 106);
}

// ============================================================
// DRAW ANIMATED SUN
// - Rotate warm rays around the sun to show changing weather energy.
// ============================================================
function drawAnimatedSun(centerX, centerY, scaleAmount = 1) {
  push();
  translate(centerX, centerY);
  scale(scaleAmount);
  rotate(frameCount * 0.006);
  stroke(255, 198, 92, 170);
  strokeWeight(4);

  for (let i = 0; i < 8; i++) {
    line(52, 0, 68, 0);
    rotate(PI / 4);
  }

  noStroke();
  fill(255, 191, 83);
  circle(0, 0, 76);
  pop();
}

// ============================================================
// DRAW ANIMATED CLOUD
// - Float overlapping cloud shapes horizontally for a soft weather motion.
// ============================================================
function drawAnimatedCloud(centerX, centerY, scaleAmount = 1) {
  // Add a small horizontal float to make the cloud feel soft and alive.
  const CLOUD_OFFSET = sin(frameCount * 0.025) * 8;

  push();
  rectMode(CORNER);
  translate(centerX + CLOUD_OFFSET, centerY);
  scale(scaleAmount);
  noStroke();
  fill(189, 211, 255, 225);
  ellipse(-30, 5, 68, 42);
  ellipse(8, -9, 84, 62);
  ellipse(47, 6, 64, 40);
  rect(-45, 5, 108, 27, 14);
  pop();
}

// ============================================================
// DRAW ANIMATED RAIN
// - Animate falling rain drops beneath the cloud when rain is reported.
// ============================================================
function drawAnimatedRain(centerX, centerY, scaleAmount = 1) {
  push();
  translate(centerX, centerY);
  scale(scaleAmount);
  stroke(92, 207, 255, 190);
  strokeWeight(3);

  for (let i = 0; i < 7; i++) {
    // Offset each raindrop so the whole group does not fall in sync.
    const DROP_Y = (frameCount * (2 + i * 0.2) + i * 21) % 58;
    line(-42 + i * 14, DROP_Y, -47 + i * 14, DROP_Y + 13);
  }
  pop();
}