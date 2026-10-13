/*
  Name: Ken Pao
  Class: MM-621
  Project 2B:

  Description:
    A live Hayward weather dashboard using the free NOAA National Weather
    Service API. The dashboard visualizes current weather observations with
    animated gradients, gauges, particles, and hover interactions.

  Note:
    - This project is intended for educational purposes in the context of the MM-621 class project.
    - NOAA requires a descriptive User-Agent for production applications.

  Credits:
    - NOAA National Weather Service API

  References:
    - P5.js: https://p5js.org/reference/
    - NOAA API: https://www.weather.gov/documentation/services-web-api
*/

// ============================================================
// GLOBAL VARIABLES
// ============================================================
let weatherData;
let weatherError = '';
let weatherLoading = true;
let activeMetric = 0;
let particles = [];
let metricCards = [];

// ============================================================
// WEATHER SETTINGS
// ============================================================
const HAYWARD_LATITUDE = 37.6688;
const HAYWARD_LONGITUDE = -122.0808;
const HAYWARD_LABEL = 'Hayward, California';
const NOAA_POINTS_URL = `https://api.weather.gov/points/${HAYWARD_LATITUDE},${HAYWARD_LONGITUDE}`;

// ============================================================
// p5.js SETUP
// ============================================================
async function setup() {
  // Create a responsive canvas for the dashboard.
  const WW = Math.min(0.92 * windowWidth, 1160);
  createCanvas(WW, Math.max(690, WW * 0.67)).parent('sketch-stage');

  // Create the ambient animated particles before the data arrives.
  createWeatherParticles();

  // Load current weather observations from NOAA.
  await loadWeatherData();
}

// ============================================================
// LOAD WEATHER DATA
// - Use NOAA's point lookup before requesting the local observation station.
// ============================================================
async function loadWeatherData() {
  try {
    const POINTS_RESPONSE = await fetch(NOAA_POINTS_URL, {
      headers: { Accept: 'application/geo+json' }
    });
    const POINTS_DATA = await POINTS_RESPONSE.json();

    if (!POINTS_RESPONSE.ok) {
      throw new Error(POINTS_DATA.title || 'NOAA point lookup failed.');
    }

    const STATIONS_URL = POINTS_DATA.properties?.observationStations;

    if (!STATIONS_URL) {
      throw new Error('NOAA did not return an observation station URL for Hayward.');
    }

    const STATIONS_RESPONSE = await fetch(STATIONS_URL, {
      headers: { Accept: 'application/geo+json' }
    });
    const STATIONS_DATA = await STATIONS_RESPONSE.json();

    if (!STATIONS_RESPONSE.ok) {
      throw new Error(STATIONS_DATA.title || 'NOAA station lookup failed.');
    }

    if (!Array.isArray(STATIONS_DATA.features) || STATIONS_DATA.features.length === 0) {
      throw new Error('NOAA did not return an observation station near Hayward.');
    }

    const STATION_URL = STATIONS_DATA.features[0]?.id;

    if (!STATION_URL) {
      throw new Error('NOAA returned a station without a usable URL.');
    }

    const OBSERVATION_RESPONSE = await fetch(`${STATION_URL}/observations/latest`, {
      headers: { Accept: 'application/geo+json' }
    });
    const OBSERVATION_DATA = await OBSERVATION_RESPONSE.json();

    if (!OBSERVATION_RESPONSE.ok) {
      throw new Error(OBSERVATION_DATA.title || 'NOAA observation lookup failed.');
    }

    if (!OBSERVATION_DATA.properties) {
      throw new Error('NOAA returned no current observation for the Hayward station.');
    }

    weatherData = normalizeWeatherData(OBSERVATION_DATA.properties);
    weatherLoading = false;
    updateParticleMotion();
  } catch (error) {
    weatherError = error.message;
    weatherLoading = false;
    console.error('Failed to load NOAA weather data:', error);
  }
}

// ============================================================
// NORMALIZE WEATHER DATA
// - Convert NOAA's metric observation values into dashboard-friendly units.
// ============================================================
function normalizeWeatherData(observation) {
  return {
    temperature: convertCelsiusToFahrenheit(observation.temperature?.value),
    humidity: observation.relativeHumidity?.value ?? null,
    windSpeed: convertKilometersToMiles(observation.windSpeed?.value),
    windDirection: observation.windDirection?.value,
    windDirectionLabel: getCompassDirection(observation.windDirection?.value),
    pressure: convertPascalsToInches(observation.barometricPressure?.value),
    visibility: convertMetersToMiles(observation.visibility?.value),
    precipitation: convertMillimetersToInches(observation.precipitationLastHour?.value),
    description: observation.textDescription || 'Current conditions',
    station: observation.station || 'NOAA weather station',
    timestamp: observation.timestamp
  };
}

// ============================================================
// UNIT CONVERSION HELPERS
// - Convert NOAA's SI measurements for a familiar dashboard display.
// ============================================================
function convertCelsiusToFahrenheit(value) {
  return value == null ? null : value * 9 / 5 + 32;
}

function convertKilometersToMiles(value) {
  return value == null ? null : value * 0.621371;
}

function convertPascalsToInches(value) {
  return value == null ? null : value * 0.0002953;
}

function convertMetersToMiles(value) {
  return value == null ? null : value * 0.000621371;
}

function convertMillimetersToInches(value) {
  return value == null ? null : value * 0.0393701;
}

// ============================================================
// GET COMPASS DIRECTION
// - Convert NOAA's wind-direction degrees into a readable compass label.
// ============================================================
function getCompassDirection(degrees) {
  if (degrees == null || Number.isNaN(degrees)) {
    return 'direction unavailable';
  }

  const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  const directionIndex = Math.round(degrees / 45) % directions.length;
  return directions[directionIndex];
}

// ============================================================
// p5.js DRAW
// ============================================================
function draw() {
  // Paint the animated gradient background first.
  drawGradientBackground();
  drawWeatherParticles();

  if (weatherLoading) {
    drawLoadingState();
    return;
  }

  if (weatherError) {
    drawErrorState();
    return;
  }

  // Draw the dashboard content after the atmospheric animation.
  drawDashboardHeader();
  drawMetricCards();
  drawFeaturedMetric();
  drawDashboardFooter();
}

// ============================================================
// DRAW GRADIENT BACKGROUND
// - Animate two color fields to make the dashboard feel alive.
// ============================================================
function drawGradientBackground() {
  const pulse = sin(frameCount * 0.012) * 0.5 + 0.5;
  const topColor = color(28 + pulse * 20, 22, 74 + pulse * 25);
  const bottomColor = color(7, 24 + pulse * 18, 55 + pulse * 30);

  for (let y = 0; y < height; y++) {
    const amount = y / height;
    stroke(lerpColor(topColor, bottomColor, amount));
    line(0, y, width, y);
  }

  noStroke();
  fill(255, 80, 140, 18 + pulse * 12);
  circle(width * 0.16, height * 0.18, 270 + pulse * 30);
  fill(60, 215, 255, 15 + pulse * 10);
  circle(width * 0.88, height * 0.77, 330 + pulse * 40);
}

// ============================================================
// DRAW WEATHER PARTICLES
// - Move glowing particles according to the live wind speed.
// ============================================================
function drawWeatherParticles() {
  const windFactor = weatherData ? map(weatherData.windSpeed || 0, 0, 30, 0.3, 2.8, true) : 0.6;

  noStroke();
  for (let particle of particles) {
    particle.x += particle.speed * windFactor;
    particle.y += sin(frameCount * 0.01 + particle.phase) * 0.15;

    if (particle.x > width + 20) {
      particle.x = -20;
    }

    fill(particle.color);
    circle(particle.x, particle.y, particle.size);
  }
}

// ============================================================
// CREATE WEATHER PARTICLES
// - Build a reusable field of colorful particles for the background.
// ============================================================
function createWeatherParticles() {
  for (let i = 0; i < 70; i++) {
    particles.push({
      x: random(width),
      y: random(height),
      speed: random(0.15, 0.7),
      size: random(1, 4),
      phase: random(TWO_PI),
      color: color(random(120, 255), random(130, 240), 255, random(25, 100))
    });
  }
}

// ============================================================
// UPDATE PARTICLE MOTION
// - Make the background movement respond to the current wind value.
// ============================================================
function updateParticleMotion() {
  for (let particle of particles) {
    particle.speed = map(weatherData.windSpeed || 0, 0, 30, 0.15, 1.15, true) * random(0.7, 1.3);
  }
}

// ============================================================
// DRAW DASHBOARD HEADER
// - Present the location, condition, and live data status.
// ============================================================
function drawDashboardHeader() {
  noStroke();
  fill(255);
  textAlign(LEFT, TOP);
  textStyle(BOLD);
  textSize(min(32, width * 0.042));
  text('Hayward weather', 42, 34);

  textStyle(NORMAL);
  fill(193, 203, 255);
  textSize(15);
  text(`${HAYWARD_LABEL}  •  LIVE NOAA OBSERVATION`, 44, 78);

  fill(255, 170, 208);
  textSize(14);
  drawConditionIcon(width - 196, 52);
  text(weatherData.description, width - 166, 42, 125, 22);
}

// ============================================================
// DRAW METRIC CARDS
// - Draw colorful cards that can be hovered or clicked for details.
// ============================================================
function drawMetricCards() {
  const metrics = getWeatherMetrics();
  const cardWidth = (width - 84) / 3;
  const cardHeight = 126;
  metricCards = [];

  for (let i = 0; i < metrics.length; i++) {
    const column = i % 3;
    const row = floor(i / 3);
    const x = 28 + column * (cardWidth + 14);
    const y = 122 + row * (cardHeight + 14);
    const isHovered = mouseX >= x && mouseX <= x + cardWidth && mouseY >= y && mouseY <= y + cardHeight;
    const isActive = activeMetric === i;

    metricCards.push({ x: x, y: y, width: cardWidth, height: cardHeight, index: i });
    drawMetricCard(metrics[i], x, y, cardWidth, cardHeight, isHovered || isActive);
  }
}

// ============================================================
// DRAW METRIC CARD
// - Use a gradient accent and glass effect instead of a flat color block.
// ============================================================
function drawMetricCard(metric, x, y, cardWidth, cardHeight, isHighlighted) {
  push();
  noStroke();
  fill(13, 17, 52, isHighlighted ? 235 : 190);
  rect(x, y, cardWidth, cardHeight, 18);

  const accent = color(metric.color);
  fill(red(accent), green(accent), blue(accent), isHighlighted ? 255 : 150);
  rect(x, y, 6, cardHeight, 18, 0, 0, 18);

  fill(220, 225, 255);
  textAlign(LEFT, TOP);
  textStyle(BOLD);
  textSize(13);
  text(metric.label, x + 20, y + 18);

  fill(255);
  textSize(27);
  text(metric.value, x + 20, y + 42);

  fill(163, 175, 226);
  textStyle(NORMAL);
  textSize(12);
  text(metric.detail, x + 20, y + 85, cardWidth - 34, 30);

  if (isHighlighted) {
    noFill();
    stroke(red(accent), green(accent), blue(accent), 200);
    strokeWeight(2);
    rect(x, y, cardWidth, cardHeight, 18);
  }
  pop();
}

// ============================================================
// GET WEATHER METRICS
// - Return the current observation values used by the dashboard cards.
// ============================================================
function getWeatherMetrics() {
  return [
    { label: 'TEMPERATURE', value: formatValue(weatherData.temperature, '°F'), detail: 'Blue is cold, green is comfortable, red is hot', color: getMetricColor(0) },
    { label: 'HUMIDITY', value: formatValue(weatherData.humidity, '%'), detail: 'Dry orange moves toward humid blue', color: getMetricColor(1) },
    { label: 'WIND SPEED', value: formatValue(weatherData.windSpeed, ' mph'), detail: `Calm green toward strong red • from ${weatherData.windDirectionLabel}`, color: getMetricColor(2) },
    { label: 'AIR PRESSURE', value: formatValue(weatherData.pressure, ' inHg'), detail: 'Low blue, typical green, high orange', color: getMetricColor(3) },
    { label: 'VISIBILITY', value: formatValue(weatherData.visibility, ' mi'), detail: 'Poor red visibility moves toward clear green', color: getMetricColor(4) },
    { label: 'PRECIPITATION', value: formatValue(weatherData.precipitation, ' in'), detail: 'No rain green moves toward heavier purple rain', color: getMetricColor(5) }
  ];
}

// ============================================================
// DRAW FEATURED METRIC
// - Show a large animated gauge for the selected weather element.
// ============================================================
function drawFeaturedMetric() {
  const metrics = getWeatherMetrics();
  const metric = metrics[activeMetric];
  const centerX = width * 0.25;
  const centerY = height - 166;

  push();
  drawSelectedMetricGraphic(centerX, centerY);
  pop();

  fill(216, 223, 255);
  textAlign(LEFT, TOP);
  textStyle(BOLD);
  textSize(17);
  text('Selected weather element', width * 0.43, height - 221);
  textStyle(NORMAL);
  fill(164, 177, 230);
  textSize(14);
  text(`${metric.detail}. Click another card to change the featured scene.`, width * 0.43, height - 190, width * 0.48, 45);
}

// ============================================================
// DRAW CONDITION ICON
// - Place a small animated sun or cloud next to the current-condition label.
// ============================================================
function drawConditionIcon(centerX, centerY) {
  const condition = weatherData.description.toLowerCase();
  const hasClouds = condition.includes('cloud') || condition.includes('overcast') || condition.includes('fog');
  const hasRain = condition.includes('rain') || (weatherData.precipitation || 0) > 0;
  const animationOffset = sin(frameCount * 0.035) * 2;

  noStroke();
  fill(255, 190, 105, 25);
  circle(centerX, centerY + animationOffset, 54);

  if (!hasClouds && !hasRain) {
    drawAnimatedSun(centerX, centerY + animationOffset, 0.28);
  } else {
    drawAnimatedCloud(centerX, centerY + animationOffset, 0.34);
    if (hasRain) {
      drawAnimatedRain(centerX, centerY + 17 + animationOffset, 0.35);
    }
  }
}

// ============================================================
// DRAW SELECTED METRIC GRAPHIC
// - Change the lower animated graphic when a metric card is selected.
// ============================================================
function drawSelectedMetricGraphic(centerX, centerY) {
  if (activeMetric === 0) {
    drawTemperatureGraphic(centerX, centerY);
  } else if (activeMetric === 1) {
    drawHumidityGraphic(centerX, centerY);
  } else if (activeMetric === 2) {
    drawWindGraphic(centerX, centerY);
  } else if (activeMetric === 3) {
    drawPressureGraphic(centerX, centerY);
  } else if (activeMetric === 4) {
    drawVisibilityGraphic(centerX, centerY);
  } else {
    drawPrecipitationGraphic(centerX, centerY);
  }
}

// ============================================================
// DRAW TEMPERATURE GRAPHIC
// - Animate a thermometer with the temperature color gradient.
// ============================================================
function drawTemperatureGraphic(centerX, centerY) {
  const metricColor = getMetricColor(0);
  const level = map(weatherData.temperature || 0, 20, 100, 20, 130, true);

  noStroke();
  fill(255, 255, 255, 35);
  rect(centerX - 12, centerY - 76, 24, 132, 12);
  fill(metricColor);
  rect(centerX - 7, centerY + 48 - level, 14, level, 8);
  circle(centerX, centerY + 56, 40);
  fill(255);
  textAlign(CENTER, CENTER);
  textStyle(BOLD);
  textSize(20);
  text(formatValue(weatherData.temperature, '°F'), centerX, centerY + 106);
}

// ============================================================
// DRAW HUMIDITY GRAPHIC
// - Animate a glowing water drop for relative humidity.
// ============================================================
function drawHumidityGraphic(centerX, centerY) {
  const metricColor = getMetricColor(1);
  const pulse = sin(frameCount * 0.05) * 6;

  noStroke();
  fill(red(metricColor), green(metricColor), blue(metricColor), 40);
  circle(centerX, centerY - 12, 170 + pulse);
  fill(metricColor);
  beginShape();
  vertex(centerX, centerY - 82 - pulse);
  bezierVertex(centerX - 48, centerY - 25, centerX - 46, centerY + 35, centerX, centerY + 48);
  bezierVertex(centerX + 46, centerY + 35, centerX + 48, centerY - 25, centerX, centerY - 82 - pulse);
  endShape(CLOSE);
  fill(255, 255, 255, 100);
  ellipse(centerX - 15, centerY - 18, 10, 24);
  noFill();
  stroke(255, 255, 255, 100);
  strokeWeight(3);
  ellipse(centerX, centerY + 4, 115 + pulse, 32 + pulse / 2);
  ellipse(centerX, centerY + 4, 145 + pulse, 45 + pulse / 2);
  noStroke();
  fill(255);
  textAlign(CENTER, CENTER);
  textStyle(BOLD);
  textSize(20);
  text(formatValue(weatherData.humidity, '%'), centerX, centerY + 94);
}

// ============================================================
// DRAW WIND GRAPHIC
// - Move layered wind lines at a speed controlled by the observation.
// ============================================================
function drawWindGraphic(centerX, centerY) {
  const metricColor = getMetricColor(2);
  const windMotion = (frameCount * map(weatherData.windSpeed || 0, 0, 30, 1, 4, true)) % 90;
  const directionDegrees = weatherData.windDirection || 0;
  const directionAngle = radians(directionDegrees + 180) - HALF_PI;

  push();
  translate(centerX, centerY - 8);
  rotate(directionAngle);
  noFill();
  stroke(metricColor);
  strokeWeight(5);
  for (let i = 0; i < 4; i++) {
    const lineY = -48 + i * 27;
    line(-104 + windMotion, lineY, -20 + windMotion, lineY);
    line(4 + windMotion, lineY, 72 + windMotion, lineY);
  }
  fill(metricColor);
  noStroke();
  triangle(100, 0, 76, -14, 76, 14);
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
  text(`from ${weatherData.windDirectionLabel}`, centerX, centerY + 113);
}

// ============================================================
// DRAW PRESSURE GRAPHIC
// - Expand atmospheric wave rings to represent air pressure.
// ============================================================
function drawPressureGraphic(centerX, centerY) {
  const metricColor = getMetricColor(3);
  noFill();
  stroke(metricColor);
  strokeWeight(4);

  for (let i = 0; i < 4; i++) {
    const waveSize = 48 + ((frameCount * 1.5 + i * 28) % 118);
    arc(centerX, centerY, waveSize, waveSize, PI + 0.25, TWO_PI - 0.25);
  }
  noStroke();
  fill(255);
  textAlign(CENTER, CENTER);
  textStyle(BOLD);
  textSize(20);
  text(formatValue(weatherData.pressure, ' inHg'), centerX, centerY + 96);
}

// ============================================================
// DRAW VISIBILITY GRAPHIC
// - Animate a horizon and light rays to represent viewing distance.
// ============================================================
function drawVisibilityGraphic(centerX, centerY) {
  const metricColor = getMetricColor(4);
  const rayMotion = sin(frameCount * 0.03) * 9;

  stroke(metricColor);
  strokeWeight(4);
  line(centerX - 110, centerY + 28, centerX + 110, centerY + 28);
  line(centerX, centerY + 28, centerX - 72 - rayMotion, centerY - 54);
  line(centerX, centerY + 28, centerX + 72 + rayMotion, centerY - 54);
  noStroke();
  fill(metricColor);
  circle(centerX, centerY - 42, 34 + rayMotion);
  fill(255);
  textAlign(CENTER, CENTER);
  textStyle(BOLD);
  textSize(20);
  text(formatValue(weatherData.visibility, ' mi'), centerX, centerY + 96);
}

// ============================================================
// DRAW PRECIPITATION GRAPHIC
// - Animate rain drops falling through a colorful precipitation cloud.
// ============================================================
function drawPrecipitationGraphic(centerX, centerY) {
  const hasRain = weatherData.precipitation != null && weatherData.precipitation > 0;

  if (hasRain) {
    drawAnimatedCloud(centerX, centerY - 34, 0.9);
    drawAnimatedRain(centerX, centerY + 18, 1);
  } else {
    drawAnimatedSun(centerX - 28, centerY - 35, 0.55);
    drawAnimatedCloud(centerX + 25, centerY - 18, 0.62);
    fill(178, 193, 240);
    textAlign(CENTER, CENTER);
    textStyle(NORMAL);
    textSize(13);
    text('No rain recorded', centerX, centerY + 42);
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
  const cloudOffset = sin(frameCount * 0.025) * 8;

  push();
  translate(centerX + cloudOffset, centerY);
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
    const dropY = (frameCount * (2 + i * 0.2) + i * 21) % 58;
    line(-42 + i * 14, dropY, -47 + i * 14, dropY + 13);
  }
  pop();
}

// ============================================================
// DRAW WIND STREAKS
// - Use moving lines to make wind speed visible without another gauge.
// ============================================================
function drawWindStreaks(startX, startY) {
  const windMotion = (frameCount * 1.5) % 70;

  noFill();
  stroke(115, 231, 224, 145);
  strokeWeight(3);
  line(startX + windMotion, startY, startX + 42 + windMotion, startY);
  line(startX - 14 + windMotion, startY + 13, startX + 28 + windMotion, startY + 13);
}

// ============================================================
// GET METRIC COLOR
// - Use meaningful gradients so every weather element has visual range.
// ============================================================
function getMetricColor(metricIndex) {
  const values = [
    getThreePointGradient(weatherData.temperature, 45, 65, 85, '#55bfff', '#72e0a0', '#ff5f75'),
    getThreePointGradient(weatherData.humidity, 20, 50, 80, '#ffad66', '#72e0a0', '#55bfff'),
    getThreePointGradient(weatherData.windSpeed, 0, 15, 35, '#72e0a0', '#ffd166', '#ff5f75'),
    getThreePointGradient(weatherData.pressure, 29, 29.8, 30.6, '#55bfff', '#72e0a0', '#ff9f68'),
    getThreePointGradient(weatherData.visibility, 1, 5, 10, '#ff5f75', '#ffd166', '#72e0a0'),
    getThreePointGradient(weatherData.precipitation, 0, 0.15, 0.5, '#72e0a0', '#55bfff', '#ad7bff')
  ];

  return values[metricIndex];
}

// ============================================================
// GET THREE-POINT COLOR GRADIENT
// - Interpolate from low to normal to high conditions.
// ============================================================
function getThreePointGradient(value, low, middle, high, lowColor, middleColor, highColor) {
  if (value == null || Number.isNaN(value)) {
    return color(160, 170, 210);
  }

  if (value <= middle) {
    return lerpColor(color(lowColor), color(middleColor), map(value, low, middle, 0, 1, true));
  }

  return lerpColor(color(middleColor), color(highColor), map(value, middle, high, 0, 1, true));
}

// ============================================================
// DRAW DASHBOARD FOOTER
// - Show the source station and the time of the latest observation.
// ============================================================
function drawDashboardFooter() {
  fill(145, 160, 215);
  textAlign(LEFT, TOP);
  textStyle(NORMAL);
  textSize(11);
  text(`Source: ${weatherData.station}`, 42, height - 36, width - 84, 15);
  textAlign(RIGHT, TOP);
  text(`Updated: ${formatTimestamp(weatherData.timestamp)}`, width - 42, height - 36);
}

// ============================================================
// DRAW LOADING STATE
// - Provide visual feedback while NOAA data is loading.
// ============================================================
function drawLoadingState() {
  fill(255);
  textAlign(CENTER, CENTER);
  textSize(22);
  text('Loading live Hayward weather…', width / 2, height / 2);
}

// ============================================================
// DRAW ERROR STATE
// - Explain when live weather data cannot be retrieved.
// ============================================================
function drawErrorState() {
  fill(255, 190, 215);
  textAlign(CENTER, CENTER);
  textSize(20);
  text('Weather data could not be loaded.', width / 2, height / 2 - 20);
  fill(190, 200, 240);
  textSize(13);
  text(weatherError, width / 2, height / 2 + 20, width - 120, 60);
}

// ============================================================
// FORMAT WEATHER VALUE
// - Display a fallback when NOAA reports a missing measurement.
// ============================================================
function formatValue(value, unit) {
  if (value === null || Number.isNaN(value)) {
    return `—${unit}`;
  }

  return `${value.toFixed(1)}${unit}`;
}

// ============================================================
// FORMAT TIMESTAMP
// - Convert NOAA's ISO timestamp into a local readable time.
// ============================================================
function formatTimestamp(timestamp) {
  return new Date(timestamp).toLocaleTimeString([], {
    hour: 'numeric',
    minute: '2-digit'
  });
}

// ============================================================
// MOUSE HOVER INTERACTION
// - Highlight cards as the cursor moves across the dashboard.
// ============================================================
function mouseMoved() {
  if (weatherData) {
    redraw();
  }

  return false;
}

// ============================================================
// MOUSE CLICK INTERACTION
// - Select a weather card and update the large gauge.
// ============================================================
function mousePressed() {
  for (let card of metricCards) {
    if (mouseX >= card.x && mouseX <= card.x + card.width && mouseY >= card.y && mouseY <= card.y + card.height) {
      activeMetric = card.index;
      redraw();
      return false;
    }
  }

  return false;
}
