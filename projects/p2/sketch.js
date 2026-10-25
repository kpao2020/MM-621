/*
  Name: Ken Pao
  Class: MM-621
  Project 2: Hayward Weather

  Description:
    An interactive weather dashboard using the free NOAA National Weather
    Service API. The dashboard visualizes current weather observations with
    animated gradients, gauges, particles, and hover interactions.

  Note:
    - This project is intended for educational purposes in the context of the MM-621 class project.
    - NOAA requires latitude and longitude to retrieve weather data.
    - Hayward, California is the default location for this project.

  Credits:
    - P5.js library for creative coding: https://p5js.org/
    - NOAA National Weather Service API
    - Adobe Stock Images for background and iconography

  References:
    - P5.js: https://p5js.org/reference/
    - NOAA API: https://www.weather.gov/documentation/services-web-api
    - OpenAI ChatGPT for code assistance and optimization suggestions.
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
let skyMode = 'auto';
let manualSky = 'day';
let sunriseTime = null;
let sunsetTime = null;
let skyToggleBounds = { x: 0, y: 0, width: 0, height: 0 };
let sourceLinkBounds = { x: 0, y: 0, width: 0, height: 0 };
let ghostX = 0;
let ghostY = 0;
let booUntil = 0;
let booEmoji = '🎃';
let spookyAudioContext = null;
let locationMenuOpen = false;
let locationArrowBounds = { x: 0, y: 0, width: 0, height: 0 };
let locationMenuItems = [];
let weatherRequestId = 0;
let sunRequestId = 0;

// ============================================================
// WEATHER SETTINGS
// ============================================================
const BAY_AREA_LOCATIONS = [
  { city: 'Hayward', state: 'California', latitude: 37.6688, longitude: -122.0808 },
  { city: 'Oakland', state: 'California', latitude: 37.7213, longitude: -122.2208 },
  { city: 'San Francisco', state: 'California', latitude: 37.7749, longitude: -122.4194 },
  { city: 'San Jose', state: 'California', latitude: 37.3382, longitude: -121.8863 }
];
let selectedLocation = BAY_AREA_LOCATIONS[0];

// ============================================================
// p5.js SETUP
// ============================================================
async function setup() {
  // Create a responsive canvas for the dashboard.
  const WW = Math.min(0.92 * windowWidth, 1160);
  createCanvas(WW, Math.max(690, WW * 0.67)).parent('sketch-stage');
  rectMode(CENTER);

  // Create the ambient animated particles before the data arrives.
  createWeatherParticles();

  // Load current weather observations from NOAA.
  // Wait for both weather data and sun data before drawing the full dashboard.
  await Promise.all([loadWeatherData(), loadSunTimes()]);

  // Keep the weather graphics animating continuously after setup completes.
  loop();

  // Refresh the sun schedule twice an hour so Auto mode stays current overnight.
  setInterval(loadSunTimes, 30 * 60 * 1000);
}

// ============================================================
// LOAD SUNRISE / SUNSET TIMES
// - Use the free sunrise-sunset service so Auto mode follows the local sky.
// ============================================================
async function loadSunTimes(location = selectedLocation) {
  const REQUEST_ID = ++sunRequestId;
  try {
    // Build the request URL and add Hayward's coordinates as query parameters.
    const SUN_TIMES_URL = new URL('https://api.sunrise-sunset.org/json');
    SUN_TIMES_URL.searchParams.set('lat', location.latitude);
    SUN_TIMES_URL.searchParams.set('lng', location.longitude);
    SUN_TIMES_URL.searchParams.set('formatted', '0');

    // Request today's sunrise and sunset values for Hayward.
    const SUN_TIMES_RESPONSE = await fetch(SUN_TIMES_URL);

    // Convert the response into a JavaScript object so the returned times can be used.
    const SUN_TIMES_DATA = await SUN_TIMES_RESPONSE.json();

    if (
      !SUN_TIMES_RESPONSE.ok ||
      SUN_TIMES_DATA.status !== 'OK'
    ) {
      throw new Error('Sun times were unavailable.');
    }

    if (REQUEST_ID !== sunRequestId) return;

    // Store the API timestamps as Date objects for direct time comparisons later.
    sunriseTime = new Date(SUN_TIMES_DATA.results.sunrise);
    sunsetTime = new Date(SUN_TIMES_DATA.results.sunset);
  } catch (error) {
    if (REQUEST_ID !== sunRequestId) return;
    // Use friendly approximate times if the sunrise/sunset service is unavailable.
    const TODAY = new Date();
    sunriseTime = new Date(TODAY.getFullYear(), TODAY.getMonth(), TODAY.getDate(), 6, 30);
    sunsetTime = new Date(TODAY.getFullYear(), TODAY.getMonth(), TODAY.getDate(), 19, 45);
    console.warn('Using approximate sunrise and sunset times:', error.message);
  }
}

// ============================================================
// LOAD WEATHER DATA
// - Use NOAA's point lookup before requesting the local observation station.
// ============================================================
async function loadWeatherData(location = selectedLocation) {
  const REQUEST_ID = ++weatherRequestId;
  weatherLoading = true;
  weatherError = '';

  try {
    const POINTS_URL = `https://api.weather.gov/points/${location.latitude},${location.longitude}`;
    const POINTS_RESPONSE = await fetch(POINTS_URL, {
      headers: { Accept: 'application/geo+json' }
    });
    const POINTS_DATA = await POINTS_RESPONSE.json();

    if (!POINTS_RESPONSE.ok) {
      throw new Error(POINTS_DATA.title || 'NOAA point lookup failed.');
    }

    const STATIONS_URL = POINTS_DATA.properties?.observationStations;

    if (!STATIONS_URL) {
      throw new Error(`NOAA did not return an observation station URL for ${location.city}.`);
    }

    const STATIONS_RESPONSE = await fetch(STATIONS_URL, {
      headers: { Accept: 'application/geo+json' }
    });
    const STATIONS_DATA = await STATIONS_RESPONSE.json();

    if (!STATIONS_RESPONSE.ok) {
      throw new Error(STATIONS_DATA.title || 'NOAA station lookup failed.');
    }

    if (
      !Array.isArray(STATIONS_DATA.features) ||
      STATIONS_DATA.features.length === 0
    ) {
      throw new Error(`NOAA did not return an observation station near ${location.city}.`);
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
      throw new Error(`NOAA returned no current observation for ${location.city}.`);
    }

    if (REQUEST_ID !== weatherRequestId) return;
    weatherData = normalizeWeatherData(OBSERVATION_DATA.properties);
    weatherLoading = false;
    updateParticleMotion();
  } catch (error) {
    if (REQUEST_ID !== weatherRequestId) return;
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
// CONVERT CELSIUS TO FAHRENHEIT
// - Change NOAA's temperature value into Fahrenheit for the dashboard.
// ============================================================
function convertCelsiusToFahrenheit(value) {
  return value == null ? null : value * 9 / 5 + 32;
}

// ============================================================
// CONVERT KILOMETERS TO MILES
// - Change NOAA's wind speed value into miles per hour.
// ============================================================
function convertKilometersToMiles(value) {
  return value == null ? null : value * 0.621371;
}

// ============================================================
// CONVERT PASCALS TO INCHES OF MERCURY
// - Change NOAA's pressure value into inHg for the dashboard.
// ============================================================
function convertPascalsToInches(value) {
  return value == null ? null : value * 0.0002953;
}

// ============================================================
// CONVERT METERS TO MILES
// - Change NOAA's visibility value into miles.
// ============================================================
function convertMetersToMiles(value) {
  return value == null ? null : value * 0.000621371;
}

// ============================================================
// CONVERT MILLIMETERS TO INCHES
// - Change NOAA's precipitation value into inches.
// ============================================================
function convertMillimetersToInches(value) {
  return value == null ? null : value * 0.0393701;
}

// ============================================================
// GET COMPASS DIRECTION
// - Convert NOAA's wind-direction degrees into a readable compass label.
// ============================================================
function getCompassDirection(degrees) {
  if (
    degrees == null ||
    Number.isNaN(degrees)
  ) {
    return 'direction unavailable';
  }

  const DIRECTIONS = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  const DIRECTION_INDEX = Math.round(degrees / 45) % DIRECTIONS.length;
  return DIRECTIONS[DIRECTION_INDEX];
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
  drawSkyToggle();
  drawMetricCards();
  drawLocationMenu();
  drawFeaturedMetric();
  drawDashboardFooter();
  drawFloatingGhost();
  drawBooEffect();
}

// ============================================================
// DRAW SKY TOGGLE
// - Click the tiny sun/moon pill to switch between Auto and Manual mode.
// ============================================================
function drawSkyToggle() {
  // Keep the day/night mode switch in the upper-right corner.
  const TOGGLE_WIDTH = min(128, width - 64);
  const TOGGLE_X = width - TOGGLE_WIDTH - 32;
  const TOGGLE_Y = 73;
  skyToggleBounds = { x: TOGGLE_X, y: TOGGLE_Y, width: TOGGLE_WIDTH, height: 32 };

  push();
  rectMode(CORNER);
  noStroke();
  fill(20, 25, 65, getSkyState() === 'day' ? 65 : 135);
  rect(TOGGLE_X, TOGGLE_Y, TOGGLE_WIDTH, 32, 16);
  fill(255, 246, 197, 230);
  circle(TOGGLE_X + 19, TOGGLE_Y + 16, 18);
  if (getSkyState() === 'day') {
    fill(255, 193, 83);
    circle(TOGGLE_X + 19, TOGGLE_Y + 16, 12);
  } else {
    fill(43, 35, 103);
    circle(TOGGLE_X + 23, TOGGLE_Y + 12, 13);
  }
  fill(255, 244, 222);
  textAlign(LEFT, CENTER);
  textStyle(BOLD);
  textSize(11);
  text(getSkyLabel(), TOGGLE_X + 34, TOGGLE_Y + 16);

  textStyle(NORMAL);
  textSize(12);
  fill(242, 220, 204);
  textAlign(CENTER, TOP);
  text(formatCalendarDate(), TOGGLE_X + TOGGLE_WIDTH / 2, 45);
  pop();
}

// ============================================================
// DRAW GRADIENT BACKGROUND
// - Animate two color fields to make the dashboard feel alive.
// ============================================================
function drawGradientBackground() {
  // Add a slow pulse so the background does not feel completely static.
  const PULSE = sin(frameCount * 0.012) * 0.5 + 0.5;

  // Decide which pair of colors to use based on the current sky state.
  const IS_DAY = getSkyState() === 'day';
  const TOP_COLOR = IS_DAY
    ? color(75 + PULSE * 8, 38, 58 + PULSE * 5)
    : color(30 + PULSE * 10, 22, 76 + PULSE * 18);
  const BOTTOM_COLOR = IS_DAY
    ? color(33, 27 + PULSE * 4, 50 + PULSE * 5)
    : color(13, 20 + PULSE * 12, 48 + PULSE * 18);

  for (let y = 0; y < height; y++) {
    // Convert the current row into a 0-to-1 gradient position.
    const AMOUNT = y / height;
    stroke(lerpColor(TOP_COLOR, BOTTOM_COLOR, AMOUNT));
    line(0, y, width, y);
  }

  noStroke();
  if (IS_DAY) {
    fill(255, 151, 72, 20 + PULSE * 9);
    circle(width * 0.16, height * 0.18, 280 + PULSE * 34);
    fill(181, 104, 144, 24 + PULSE * 9);
    circle(width * 0.88, height * 0.77, 330 + PULSE * 40);
  } else {
    fill(139, 119, 255, 18 + PULSE * 12);
    circle(width * 0.16, height * 0.18, 270 + PULSE * 30);
    fill(60, 215, 255, 15 + PULSE * 10);
    circle(width * 0.88, height * 0.77, 330 + PULSE * 40);
    drawNightStars();
  }
}

// ============================================================
// DRAW NIGHT STARS
// - Place tiny twinkling stars across the upper night sky.
// ============================================================
function drawNightStars() {
  noStroke();
  for (let i = 0; i < 26; i++) {
    // Use repeatable positions so the stars do not jump around each frame.
    const STAR_X = (i * 83 + 37) % width;
    const STAR_Y = 126 + ((i * 47 + 24) % max(1, height * 0.66 - 126));

    // Vary the size and opacity slightly to create a soft twinkle.
    const TWINKLE = 1.5 + sin(frameCount * 0.025 + i) * 0.8;
    fill(255, 239, 189, 150 + sin(frameCount * 0.02 + i) * 50);
    circle(STAR_X, STAR_Y, TWINKLE);
  }
}

// ============================================================
// GET SKY STATE
// - Return the current day/night state from manual mode or the clock.
// ============================================================
function getSkyState() {
  if (skyMode === 'manual') return manualSky;
  if (
    !sunriseTime ||
    !sunsetTime
  ) {
    return 'day';
  }

  // Compare the current time with the fetched sunrise and sunset timestamps.
  const CURRENT_TIME = new Date();
  return CURRENT_TIME >= sunriseTime && CURRENT_TIME < sunsetTime ? 'day' : 'night';
}

// ============================================================
// GET SKY LABEL
// - Create the short label shown inside the sky toggle.
// ============================================================
function getSkyLabel() {
  return skyMode === 'auto' ? `Auto • ${getSkyState()}` : `Manual • ${manualSky}`;
}

// ============================================================
// DRAW WEATHER PARTICLES
// - Move glowing particles according to the live wind speed.
// ============================================================
function drawWeatherParticles() {
  const WIND_FACTOR = weatherData ? map(weatherData.windSpeed || 0, 0, 30, 0.3, 2.8, true) : 0.6;

  noStroke();
  for (let particle of particles) {
    particle.x += particle.speed * WIND_FACTOR;
    particle.y += sin(frameCount * 0.01 + particle.phase) * 0.15;

    if (particle.x > width + 20) {
      particle.x = -20;
    }

    if (particle.y >= 124) {
      fill(particle.color);
      circle(particle.x, particle.y, particle.size);
    }
  }

  drawSpookyWeatherParticles();
}

// ============================================================
// DRAW SPOOKY WEATHER PARTICLES
// - Add purple falling drops in rain and twinkling stars in clear weather.
// ============================================================
function drawSpookyWeatherParticles() {
  if (!weatherData) return;

  const CONDITION = weatherData.description.toLowerCase();
  const IS_RAINY = CONDITION.includes('rain') || (weatherData.precipitation || 0) > 0;
  const IS_CLEAR = CONDITION.includes('clear') || CONDITION.includes('fair') || CONDITION.includes('sunny');

  noStroke();
  if (IS_RAINY) {
    for (let i = 0; i < 28; i++) {
      const DROP_X = (i * 97 + 23) % width;
      const DROP_Y = 126 + ((frameCount * (2.1 + (i % 4) * 0.35) + i * 39) % max(1, height - 126));
      fill(190, 143, 255, 115);
      ellipse(DROP_X, DROP_Y, 3, 9);
    }
  } else if (IS_CLEAR) {
    for (let i = 0; i < 24; i++) {
      const STAR_X = (i * 113 + 31) % width;
      const STAR_Y = 126 + ((i * 61 + 18) % max(1, height - 126));
      const TWINKLE = 1.2 + (sin(frameCount * 0.055 + i) + 1) * 1.1;
      fill(255, 220, 133, 100 + (sin(frameCount * 0.04 + i) + 1) * 65);
      circle(STAR_X, STAR_Y, TWINKLE);
    }
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
  const TITLE = `${selectedLocation.city} weather`;
  text(TITLE, 42, 34);

  // This triangle opens the Bay Area location menu.
  const ARROW_X = 42 + textWidth(TITLE) + 13;
  const ARROW_Y = 52;
  locationArrowBounds = { x: ARROW_X - 6, y: ARROW_Y - 12, width: 28, height: 28 };
  fill(255, 184, 113);
  if (locationMenuOpen) {
    triangle(ARROW_X, ARROW_Y - 4, ARROW_X + 14, ARROW_Y - 4, ARROW_X + 7, ARROW_Y + 5);
  } else {
    triangle(ARROW_X, ARROW_Y + 4, ARROW_X + 14, ARROW_Y + 4, ARROW_X + 7, ARROW_Y - 5);
  }

  textStyle(NORMAL);
  fill(244, 218, 193);
  textSize(15);
  text(`${selectedLocation.city}, ${selectedLocation.state}  •  ${getConditionLabel()}`, 44, 78, max(80, width - 300), 22);
}

// ============================================================
// FORMAT CURRENT CONDITION
// - Turn NOAA's terse description into a familiar weather phrase.
// ============================================================
function getConditionLabel() {
  const CONDITION = (weatherData.description || '').toLowerCase();
  if (CONDITION.includes('thunder') || CONDITION.includes('storm')) return 'Thunderstorms';
  if (CONDITION.includes('rain') || CONDITION.includes('drizzle') || CONDITION.includes('shower')) return 'Raining';
  if (CONDITION.includes('snow') || CONDITION.includes('sleet')) return 'Snowing';
  if (CONDITION.includes('fog') || CONDITION.includes('mist')) return 'Foggy';
  if (CONDITION.includes('haze')) return 'Hazy';
  if (CONDITION.includes('mostly sunny')) return 'Mostly Sunny';
  if (CONDITION.includes('partly sunny')) return 'Partly Sunny';
  if (CONDITION.includes('sunny')) return 'Sunny';
  if (CONDITION.includes('mostly cloudy')) return 'Mostly Cloudy';
  if (CONDITION.includes('partly cloudy')) return 'Partly Cloudy';
  if (CONDITION.includes('overcast') || CONDITION.includes('cloud')) return 'Cloudy';
  if (CONDITION.includes('clear') || CONDITION.includes('fair')) return 'Clear Sky';
  return weatherData.description || 'Conditions unavailable';
}

// ============================================================
// DRAW LOCATION MENU
// - Offer a few Bay Area locations that NOAA can resolve to nearby stations.
// ============================================================
function drawLocationMenu() {
  locationMenuItems = [];
  if (!locationMenuOpen) return;

  const MENU_X = 42;
  const MENU_Y = 72;
  const MENU_WIDTH = 228;
  const ITEM_HEIGHT = 36;

  push();
  rectMode(CORNER);
  noStroke();
  fill(31, 23, 44, 248);
  rect(MENU_X, MENU_Y, MENU_WIDTH, ITEM_HEIGHT * BAY_AREA_LOCATIONS.length, 12);
  stroke(255, 224, 201, 110);
  strokeWeight(1);
  noFill();
  rect(MENU_X, MENU_Y, MENU_WIDTH, ITEM_HEIGHT * BAY_AREA_LOCATIONS.length, 12);

  for (let i = 0; i < BAY_AREA_LOCATIONS.length; i++) {
    const ITEM_BOUNDS = { x: MENU_X, y: MENU_Y + i * ITEM_HEIGHT, width: MENU_WIDTH, height: ITEM_HEIGHT };
    locationMenuItems.push({ ...ITEM_BOUNDS, index: i });
    const IS_HOVERED = mouseX >= ITEM_BOUNDS.x && mouseX <= ITEM_BOUNDS.x + ITEM_BOUNDS.width &&
      mouseY >= ITEM_BOUNDS.y && mouseY <= ITEM_BOUNDS.y + ITEM_BOUNDS.height;
    if (IS_HOVERED || selectedLocation === BAY_AREA_LOCATIONS[i]) {
      noStroke();
      fill(255, 154, 83, IS_HOVERED ? 68 : 36);
      rect(MENU_X + 3, ITEM_BOUNDS.y + 2, MENU_WIDTH - 6, ITEM_HEIGHT - 4, 8);
    }
    noStroke();
    fill(255, 239, 225);
    textAlign(LEFT, CENTER);
    textStyle(i === 0 ? BOLD : NORMAL);
    textSize(13);
    text(`${BAY_AREA_LOCATIONS[i].city}, CA`, MENU_X + 14, ITEM_BOUNDS.y + ITEM_HEIGHT / 2);
  }
  pop();
}

// ============================================================
// SELECT WEATHER LOCATION
// - Reload NOAA observations and sunrise/sunset for the chosen coordinates.
// ============================================================
function selectWeatherLocation(index) {
  selectedLocation = BAY_AREA_LOCATIONS[index];
  locationMenuOpen = false;
  activeMetric = 0;
  booUntil = 0;
  loadWeatherData(selectedLocation);
  loadSunTimes(selectedLocation);
}

// ============================================================
// FORMAT CALENDAR DATE
// - Use a compact weekday and month so the header remains easy to scan.
// ============================================================
function formatCalendarDate(date = new Date()) {
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
}

// ============================================================
// DRAW METRIC CARDS
// - Draw colorful cards that can be hovered or clicked for details.
// ============================================================
function drawMetricCards() {
  const METRICS = getWeatherMetrics();
  const COLUMN_COUNT = 2;
  const ROW_GAP = 10;
  const CARD_TOP = 122;
  const SAFE_BOTTOM = height - 292;
  const CARD_HEIGHT = min(104, max(84, (SAFE_BOTTOM - CARD_TOP - ROW_GAP * 2) / 3));
  const CARD_WIDTH = (width - 70) / COLUMN_COUNT;
  metricCards = [];

  for (let i = 0; i < METRICS.length; i++) {
    // Use a compact two-column stack on narrow canvases to protect card text.
    const COLUMN = i % COLUMN_COUNT;
    const ROW = floor(i / COLUMN_COUNT);
    const CARD_X = 28 + COLUMN * (CARD_WIDTH + 14);
    const CARD_Y = 122 + ROW * (CARD_HEIGHT + ROW_GAP);

    // Check both the horizontal and vertical bounds for hover feedback.
  // Check whether the pointer is inside the card's full rectangle.
  const IS_HOVERED = mouseX >= CARD_X && mouseX <= CARD_X + CARD_WIDTH &&
    mouseY >= CARD_Y && mouseY <= CARD_Y + CARD_HEIGHT;
    const IS_ACTIVE = activeMetric === i;

    metricCards.push({ x: CARD_X, y: CARD_Y, width: CARD_WIDTH, height: CARD_HEIGHT, index: i });
    drawMetricCard(METRICS[i], CARD_X, CARD_Y, CARD_WIDTH, CARD_HEIGHT, IS_HOVERED || IS_ACTIVE);
  }
}

// ============================================================
// DRAW METRIC CARD
// - Use a gradient accent and glass effect instead of a flat color block.
// ============================================================
function drawMetricCard(metric, x, y, cardWidth, cardHeight, isHighlighted) {
  push();
  rectMode(CORNER);
  const IS_COMPACT = cardHeight < 100 || cardWidth < 230;
  const COMPACT_LABELS = [
    'HAUNTED TEMP',
    'ECTOPLASM',
    'WITCH WIND',
    'HAUNTED PRESSURE',
    'GHOST SIGHT',
    'VAMPIRE RAIN'
  ];
  const DISPLAY_LABEL = IS_COMPACT ? COMPACT_LABELS[metric.index] : metric.label;
  const TEXT_INSET = IS_COMPACT ? 12 : 20;
  noStroke();
  // Keep animated background particles from competing with card content.
  fill(34, 26, 48, isHighlighted ? 248 : 240);
  rect(x, y, cardWidth, cardHeight, 18);

  if (metric.index === 0) {
    const TEMP = weatherData.temperature;
    if (TEMP != null && TEMP < 50) fill(200, 210, 225, 24);
    else if (TEMP != null && TEMP >= 80) fill(255, 139, 67, 28);
    else fill(181, 104, 144, 20);
    rect(x + 1, y + 1, cardWidth - 2, cardHeight - 2, 17);
  }

  noFill();
  stroke(isHighlighted ? color(255, 190, 128, 220) : color(255, 238, 225, 78));
  strokeWeight(isHighlighted ? 2 : 1);
  rect(x + 0.5, y + 0.5, cardWidth - 1, cardHeight - 1, 18);
  noStroke();
  // A faint inset sheen suggests glass while leaving card text fully opaque.
  fill(255, 246, 236, isHighlighted ? 18 : 9);
  rect(x + 2, y + 2, cardWidth - 4, 26, 16, 16, 0, 0);

  fill(246, 231, 220);
  textAlign(LEFT, TOP);
  textStyle(BOLD);
  const MAX_LABEL_SIZE = IS_COMPACT ? 10 : 13;
  textSize(MAX_LABEL_SIZE);
  const LABEL_SIZE = min(MAX_LABEL_SIZE, MAX_LABEL_SIZE * (cardWidth - TEXT_INSET * 2) / max(1, textWidth(DISPLAY_LABEL)));
  textSize(max(IS_COMPACT ? 8 : 10, LABEL_SIZE));
  text(DISPLAY_LABEL, x + TEXT_INSET, y + (IS_COMPACT ? 7 : 12), cardWidth - TEXT_INSET * 2, 17);

  fill(255);
  textSize(IS_COMPACT ? 20 : 25);
  text(metric.value, x + TEXT_INSET, y + (IS_COMPACT ? 25 : 34));

  fill(210, 198, 207);
  textStyle(NORMAL);
  textSize(IS_COMPACT ? 8 : 10);
  text(metric.detail, x + TEXT_INSET, y + (IS_COMPACT ? 55 : 69), cardWidth - TEXT_INSET * 2, IS_COMPACT ? 25 : 27);

  pop();
}

// ============================================================
// GET WEATHER METRICS
// - Return the current observation values used by the dashboard cards.
// ============================================================
function getWeatherMetrics() {
  const TEMP = weatherData.temperature;
  const WIND = weatherData.windSpeed;
  const HAS_WIND_DIRECTION = weatherData.windDirectionLabel !== 'direction unavailable';
  const WIND_DETAIL = !HAS_WIND_DIRECTION
    ? 'No witch-flying direction data available'
    : WIND != null && WIND >= 20
      ? `Hold onto your brooms! Wind from ${weatherData.windDirectionLabel}`
      : `Broom-friendly breeze from ${weatherData.windDirectionLabel}`;
  return [
    {
      index: 0,
      label: TEMP != null && TEMP < 50 ? 'CHILLED BONE TEMPERATURE' :
        TEMP != null && TEMP >= 80 ? 'CAULDRON HEAT' : 'HAUNTED TEMPERATURE',
      value: formatValue(weatherData.temperature, '°F'),
      detail: TEMP != null && TEMP < 50 ? 'A ghostly chill is in the air' :
        TEMP != null && TEMP >= 80 ? 'The cauldron is bubbling' : 'A mild, mysterious evening',
      color: getMetricColor(0)
    },
    {
      index: 1,
      label: 'ECTOPLASM LEVEL',
      value: formatValue(weatherData.humidity, '%'),
      detail: 'The air’s supernatural moisture',
      color: getMetricColor(1)
    },
    {
      index: 2,
      label: 'WITCH FLYING CONDITIONS',
      value: formatValue(weatherData.windSpeed, ' mph'),
      detail: WIND_DETAIL,
      color: getMetricColor(2)
    },
    {
      index: 3,
      label: 'HAUNTED PRESSURE',
      value: formatValue(weatherData.pressure, ' inHg'),
      detail: 'Atmospheric pressure from the local station',
      color: getMetricColor(3)
    },
    {
      index: 4,
      label: 'GHOST SIGHT RANGE',
      value: formatValue(weatherData.visibility, ' mi'),
      detail: 'How far the night is visible',
      color: getMetricColor(4)
    },
    {
      index: 5,
      label: 'VAMPIRE RAINFALL',
      value: formatValue(weatherData.precipitation, ' in'),
      detail: (weatherData.precipitation || 0) > 0 ? 'The clouds are feeding the night creatures' : 'No rain for the vampires tonight',
      color: getMetricColor(5)
    }
  ];
}

// ============================================================
// DRAW FEATURED METRIC
// - Show a large animated gauge for the selected weather element.
// ============================================================
function drawFeaturedMetric() {
  const METRICS = getWeatherMetrics();
  const METRIC = METRICS[activeMetric];
  const IS_NARROW = width < 760;
  const CENTER_X = width * 0.2;
  const CENTER_Y = height - 166;
  // Reserve a distinct right-hand column for copy; never draw it over the gauge.
  const TEXT_X = max(width * (IS_NARROW ? 0.52 : 0.58), CENTER_X + 150);
  const TEXT_WIDTH = width - TEXT_X - 28;

  push();
  drawSelectedMetricGraphic(CENTER_X, CENTER_Y);
  pop();

  fill(255, 224, 187);
  textAlign(LEFT, TOP);
  textStyle(BOLD);
  textSize(IS_NARROW ? 13 : 17);
  text(METRIC.label, TEXT_X, height - 221, TEXT_WIDTH, 24);
  textStyle(NORMAL);
  fill(239, 226, 218);
  textSize(IS_NARROW ? 11 : 14);
  text(
    METRIC.detail,
    TEXT_X,
    height - 190,
    TEXT_WIDTH,
    45
  );
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

// ============================================================
// DRAW WIND GRAPHIC
// - Move layered wind lines at a speed controlled by the observation.
// ============================================================
function drawWindGraphic(centerX, centerY) {
  const METRIC_COLOR = getMetricColor(2);
  const WIND_MOTION = (frameCount * map(weatherData.windSpeed || 0, 0, 30, 1, 4, true)) % 90;
  const DIRECTION_DEGREES = weatherData.windDirection || 0;
  const DIRECTION_ANGLE = radians(DIRECTION_DEGREES + 180) - HALF_PI;

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
  fill(METRIC_COLOR);
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

// ============================================================
// DRAW WIND STREAKS
// - Use moving lines to make wind speed visible without another gauge.
// ============================================================
function drawWindStreaks(startX, startY) {
  // Move the streaks repeatedly from left to right.
  const WIND_MOTION = (frameCount * 1.5) % 70;

  noFill();
  stroke(115, 231, 224, 145);
  strokeWeight(3);
  line(startX + WIND_MOTION, startY, startX + 42 + WIND_MOTION, startY);
  line(startX - 14 + WIND_MOTION, startY + 13, startX + 28 + WIND_MOTION, startY + 13);
}

// ============================================================
// GET METRIC COLOR
// - Use meaningful gradients so every weather element has visual range.
// ============================================================
function getMetricColor(metricIndex) {
  const VALUES = [
    getThreePointGradient(weatherData.temperature, 45, 65, 85, '#55bfff', '#72e0a0', '#ff5f75'),
    getThreePointGradient(weatherData.humidity, 20, 50, 80, '#ffad66', '#72e0a0', '#55bfff'),
    getThreePointGradient(weatherData.windSpeed, 0, 15, 35, '#72e0a0', '#ffd166', '#ff5f75'),
    getThreePointGradient(weatherData.pressure, 29, 29.8, 30.6, '#55bfff', '#72e0a0', '#ff9f68'),
    getThreePointGradient(weatherData.visibility, 1, 5, 10, '#ff5f75', '#ffd166', '#72e0a0'),
    getThreePointGradient(weatherData.precipitation, 0, 0.15, 0.5, '#72e0a0', '#55bfff', '#ad7bff')
  ];

  return VALUES[metricIndex];
}

// ============================================================
// GET THREE-POINT COLOR GRADIENT
// - Interpolate from low to normal to high conditions.
// ============================================================
function getThreePointGradient(value, low, middle, high, lowColor, middleColor, highColor) {
  if (
    value == null ||
    Number.isNaN(value)
  ) {
    return color(160, 170, 210);
  }

  // Blend from the low color to the middle color when the value is below normal.
  if (value <= middle) {
    return lerpColor(color(lowColor), color(middleColor), map(value, low, middle, 0, 1, true));
  }

  // Blend from the middle color to the high color when the value is above normal.
  return lerpColor(color(middleColor), color(highColor), map(value, middle, high, 0, 1, true));
}

// ============================================================
// DRAW DASHBOARD FOOTER
// - Show the source station and the time of the latest observation.
// ============================================================
function drawDashboardFooter() {
  textStyle(NORMAL);
  textSize(11);
  const SOURCE_LABEL = 'NOAA source ↗';
  const UPDATED_LABEL = `Updated: ${formatTimestamp(weatherData.timestamp)}`;
  const SOURCE_WIDTH = textWidth(SOURCE_LABEL);
  const UPDATED_WIDTH = textWidth(UPDATED_LABEL);
  const FOOTER_RIGHT = width - 42;
  const FOOTER_GAP = 12;
  sourceLinkBounds = {
    x: FOOTER_RIGHT - SOURCE_WIDTH,
    y: height - 36,
    width: SOURCE_WIDTH,
    height: 15
  };
  textAlign(LEFT, TOP);
  fill(145, 160, 215);
  text(UPDATED_LABEL, sourceLinkBounds.x - FOOTER_GAP - UPDATED_WIDTH, height - 36);
  fill(226, 171, 126, 205);
  text(SOURCE_LABEL, sourceLinkBounds.x, sourceLinkBounds.y);
}

// ============================================================
// DRAW FLOATING GHOST
// - Ease a tiny ghost toward the pointer so it drifts across the dashboard.
// ============================================================
function drawFloatingGhost() {
  // Adjust these dimensions and offsets to customize the cursor-following ghost.
  const GHOST_WIDTH = 34;
  const GHOST_HEIGHT = 38;
  const EYE_OFFSET_X = 6;
  const EYE_OFFSET_Y = -3;
  const TARGET_X = constrain(mouseX, 18, width - 18);
  const TARGET_Y = constrain(mouseY, 18, height - 18);
  ghostX = lerp(ghostX || TARGET_X, TARGET_X, 0.075);
  ghostY = lerp(ghostY || TARGET_Y, TARGET_Y, 0.075);

  push();
  noStroke();
  fill(244, 242, 232);
  // A solid body polygon gives the ghost one clean animated hem.
  const BODY_LEFT = ghostX - GHOST_WIDTH / 2;
  const BODY_RIGHT = ghostX + GHOST_WIDTH / 2;
  const WAVE_SEGMENTS = 12;
  // Draw the round crown first; the moving body redraws its lower edge as a wave.
  ellipse(ghostX, ghostY - 5, GHOST_WIDTH, GHOST_HEIGHT * 0.82);
  beginShape();
  vertex(BODY_LEFT, ghostY - 5);
  for (let i = 0; i <= WAVE_SEGMENTS; i++) {
    const X = BODY_LEFT + (GHOST_WIDTH * i) / WAVE_SEGMENTS;
    const WAVE_Y = ghostY + 7 + sin(frameCount * 0.035 + i * 0.55) * 2;
    vertex(X, WAVE_Y);
  }
  vertex(BODY_RIGHT, ghostY - 5);
  endShape(CLOSE);

  // ghost 2 eyes.
  fill(37, 34, 54, 220);
  ellipse(ghostX - EYE_OFFSET_X, ghostY + EYE_OFFSET_Y, 4, 6);
  ellipse(ghostX + EYE_OFFSET_X, ghostY + EYE_OFFSET_Y, 4, 6);
  pop();
}

// ============================================================
// DRAW BOO EFFECT
// - Keep the playful click surprise visible for one second.
// ============================================================
function drawBooEffect() {
  if (millis() >= booUntil) return;
  push();
  textAlign(LEFT, CENTER);
  textStyle(BOLD);
  textSize(30);
  fill(255, 226, 173, 245);
  text(`BOO! ${booEmoji}`, constrain(mouseX + 24, 8, width - 145), constrain(mouseY - 30, 22, height - 20));
  pop();
}

// ============================================================
// PLAY CREEPY CREAK
// - Synthesize a short descending creak on a user click without an audio file.
// ============================================================
async function playCreak() {
  const AUDIO_CONTEXT_CLASS = window.AudioContext || window.webkitAudioContext;
  if (!AUDIO_CONTEXT_CLASS) return;
  try {
    // Resume the context from this click gesture before scheduling any sound.
    if (!spookyAudioContext) spookyAudioContext = new AUDIO_CONTEXT_CLASS();
    if (spookyAudioContext.state === 'suspended') await spookyAudioContext.resume();
    const CONTEXT = spookyAudioContext;
    if (CONTEXT.state !== 'running') return;

    const OSCILLATOR = CONTEXT.createOscillator();
    const GAIN = CONTEXT.createGain();
    const FILTER = CONTEXT.createBiquadFilter();
    const NOW = CONTEXT.currentTime;

    OSCILLATOR.type = 'sawtooth';
    OSCILLATOR.frequency.setValueAtTime(420, NOW);
    OSCILLATOR.frequency.exponentialRampToValueAtTime(125, NOW + 0.42);
    FILTER.type = 'lowpass';
    FILTER.frequency.setValueAtTime(1100, NOW);
    FILTER.frequency.exponentialRampToValueAtTime(380, NOW + 0.42);
    GAIN.gain.setValueAtTime(0.0001, NOW);
    GAIN.gain.exponentialRampToValueAtTime(0.055, NOW + 0.035);
    GAIN.gain.exponentialRampToValueAtTime(0.0001, NOW + 0.45);

    OSCILLATOR.connect(FILTER);
    FILTER.connect(GAIN);
    GAIN.connect(CONTEXT.destination);
    OSCILLATOR.start(NOW);
    OSCILLATOR.stop(NOW + 0.46);
  } catch (error) {
    console.warn('The spooky sound could not be played:', error.message);
  }
}

// ============================================================
// DRAW LOADING STATE
// - Provide visual feedback while NOAA data is loading.
// ============================================================
function drawLoadingState() {
  fill(255);
  textAlign(CENTER, CENTER);
  textSize(22);
  text(`Loading live ${selectedLocation.city} weather…`, width / 2, height / 2);
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
  if (
    value === null ||
    Number.isNaN(value)
  ) {
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
    const OVER_SOURCE = mouseX >= sourceLinkBounds.x && mouseX <= sourceLinkBounds.x + sourceLinkBounds.width &&
      mouseY >= sourceLinkBounds.y && mouseY <= sourceLinkBounds.y + sourceLinkBounds.height;
    const OVER_SKY_TOGGLE = mouseX >= skyToggleBounds.x && mouseX <= skyToggleBounds.x + skyToggleBounds.width &&
      mouseY >= skyToggleBounds.y && mouseY <= skyToggleBounds.y + skyToggleBounds.height;
    const OVER_LOCATION_ARROW = mouseX >= locationArrowBounds.x && mouseX <= locationArrowBounds.x + locationArrowBounds.width &&
      mouseY >= locationArrowBounds.y && mouseY <= locationArrowBounds.y + locationArrowBounds.height;
    const OVER_LOCATION_OPTION = locationMenuItems.some((item) => mouseX >= item.x && mouseX <= item.x + item.width &&
      mouseY >= item.y && mouseY <= item.y + item.height);
    const OVER_CARD = metricCards.some((card) => mouseX >= card.x && mouseX <= card.x + card.width &&
      mouseY >= card.y && mouseY <= card.y + card.height);
    cursor(OVER_SOURCE || OVER_SKY_TOGGLE || OVER_LOCATION_ARROW || OVER_LOCATION_OPTION || OVER_CARD ? HAND : ARROW);
  }

  return false;
}

// ============================================================
// MOUSE CLICK INTERACTION
// - Select a weather card and update the large gauge.
// ============================================================
function mousePressed() {
  if (
    mouseX >= locationArrowBounds.x &&
    mouseX <= locationArrowBounds.x + locationArrowBounds.width &&
    mouseY >= locationArrowBounds.y &&
    mouseY <= locationArrowBounds.y + locationArrowBounds.height
  ) {
    locationMenuOpen = !locationMenuOpen;
    loop();
    return false;
  }

  for (let item of locationMenuItems) {
    if (
      mouseX >= item.x &&
      mouseX <= item.x + item.width &&
      mouseY >= item.y &&
      mouseY <= item.y + item.height
    ) {
      selectWeatherLocation(item.index);
      loop();
      return false;
    }
  }

  if (
    weatherData &&
    mouseX >= sourceLinkBounds.x &&
    mouseX <= sourceLinkBounds.x + sourceLinkBounds.width &&
    mouseY >= sourceLinkBounds.y &&
    mouseY <= sourceLinkBounds.y + sourceLinkBounds.height
  ) {
    window.open(weatherData.station, '_blank', 'noopener');
    return false;
  }

  // Check whether the user clicked inside the sun/moon control.
  if (
    mouseX >= skyToggleBounds.x &&
    mouseX <= skyToggleBounds.x + skyToggleBounds.width &&
    mouseY >= skyToggleBounds.y &&
    mouseY <= skyToggleBounds.y + skyToggleBounds.height
  ) {
    manualSky = getSkyState() === 'day' ? 'night' : 'day';
    skyMode = 'manual';
    loop();
    return false;
  }

  for (let card of metricCards) {
    if (
      mouseX >= card.x &&
      mouseX <= card.x + card.width &&
      mouseY >= card.y &&
      mouseY <= card.y + card.height
    ) {
      activeMetric = Number(card.index);
      booEmoji = ['🎃', '🦇', '🕷️'][floor(random(3))];
      booUntil = millis() + 1000;
      playCreak();
      loop();
      return false;
    }
  }

  return false;
}
