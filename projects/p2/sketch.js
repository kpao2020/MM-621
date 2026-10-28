/*
  Name: Ken Pao
  Class: MM-621
  Project 2: Spooky Weather

  Description:
    A Halloween-themed, interactive weather dashboard using the free NOAA National Weather
    Service API. The dashboard visualizes current weather observations across multiple
    locations with animated graphics, gauges, particles, and mouse interactions.

  Note:
    - This project is intended for educational purposes in the context of the MM-621 class project.
    - NOAA requires latitude and longitude to retrieve weather data.
    - Hayward, California is the default location for this project, with selectable Bay Area cities
      for demonstration.

  Credits:
    - P5.js library for creative coding: https://p5js.org/
    - Sunrise/Sunset API for calculating day/night transitions: https://sunrise-sunset.org/api
    - NOAA National Weather Service API
    - Adobe Stock Images for background and iconography
    - Sound effects from Pixabay: https://pixabay.com/sound-effects/

  References:
    - P5.js: https://p5js.org/reference/
    - Sunrise/Sunset API: https://sunrise-sunset.org/api
    - NOAA API: https://www.weather.gov/documentation/services-web-api
    - OpenAI ChatGPT for code assistance and optimization suggestions.

  Code Origin:
    - [ORIGINAL SKETCH + AI-ASSISTED REVISIONS] 
*/

// ============================================================
// GLOBAL VARIABLES
// ============================================================
let activeMetric = 0;
let particles = [];
let metricCards = [];
let skyMode = 'auto';
let manualSky = 'day';
let skyToggleBounds = { x: 0, y: 0, width: 0, height: 0 };
let sourceLinkBounds = { x: 0, y: 0, width: 0, height: 0 };
let locationMenuOpen = false;
let locationArrowBounds = { x: 0, y: 0, width: 0, height: 0 };
let locationMenuItems = [];

// ============================================================
// WEATHER SETTINGS
// ============================================================
const BAY_AREA_LOCATIONS = [
  { city: 'Hayward', state: 'California', latitude: 37.6688, longitude: -122.0808 },
  { city: 'Oakland', state: 'California', latitude: 37.7213, longitude: -122.2208 },
  { city: 'San Francisco', state: 'California', latitude: 37.7749, longitude: -122.4194 },
  { city: 'San Jose', state: 'California', latitude: 37.3382, longitude: -121.8863 }
];
let selectedLocation = BAY_AREA_LOCATIONS[0];   // default location to Hayward

// ============================================================
// p5.js SETUP
// ============================================================
async function setup() {
  // Create a responsive canvas for the dashboard.
  const WW = getDashboardWidth();
  createCanvas(WW, getDashboardHeight(WW)).parent('sketch-stage');
  rectMode(CENTER);
  setupSpookySounds();

  // Create the ambient animated particles before the data arrives.
  createWeatherParticles();

  // Load current weather observations from NOAA.
  // Wait for weather data before drawing the full dashboard.
  await loadWeatherData();

  // Keep the weather graphics animating continuously after setup completes.
  loop();
}

// ============================================================
// RESIZE CANVAS
// - Keep p5's drawing coordinates in step with the available browser width.
// ============================================================
function getDashboardWidth() {
  const SIDE_SPACE = windowWidth < 600 ? 24 : 56;
  return Math.min(1160, Math.max(280, windowWidth - SIDE_SPACE));
}

function getDashboardHeight(canvasWidth) {
  const COMPACT_HEIGHT = canvasWidth < 760 ? 760 : 690;
  return Math.max(COMPACT_HEIGHT, canvasWidth * 0.67);
}

function windowResized() {
  const NEW_WIDTH = getDashboardWidth();
  resizeCanvas(NEW_WIDTH, getDashboardHeight(NEW_WIDTH));
  particles = [];
  createWeatherParticles();
  loop();
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
  const IS_NARROW = width < 560;
  // Keep the day/night mode switch in the upper-right corner.
  const TOGGLE_WIDTH = min(128, width - (IS_NARROW ? 40 : 64));
  const TOGGLE_X = width - TOGGLE_WIDTH - (IS_NARROW ? 20 : 32);
  const TOGGLE_Y = IS_NARROW ? 83 : 73;
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
  textSize(IS_NARROW ? 10 : 11);
  text(getSkyLabel(), TOGGLE_X + 34, TOGGLE_Y + 16);

  textStyle(NORMAL);
  textSize(IS_NARROW ? 11 : 12);
  fill(242, 220, 204);
  textAlign(IS_NARROW ? LEFT : CENTER, IS_NARROW ? CENTER : TOP);
  text(formatCalendarDate(), IS_NARROW ? 20 : TOGGLE_X + TOGGLE_WIDTH / 2, IS_NARROW ? 99 : 45);
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
  const IS_NARROW = width < 560;
  const LEFT_MARGIN = IS_NARROW ? 20 : 42;
  const TITLE = `${selectedLocation.city} weather`;

  noStroke();
  fill(255);
  textAlign(LEFT, TOP);
  textStyle(BOLD);
  const TITLE_SIZE = IS_NARROW ? 24 : min(32, width * 0.042);
  textSize(TITLE_SIZE);
  const TITLE_WIDTH = width - LEFT_MARGIN - (IS_NARROW ? 36 : 62);
  textSize(min(TITLE_SIZE, TITLE_SIZE * TITLE_WIDTH / max(1, textWidth(TITLE))));
  text(TITLE, LEFT_MARGIN, IS_NARROW ? 17 : 34);

  // This triangle opens the Bay Area location menu.
  const ARROW_X = LEFT_MARGIN + textWidth(TITLE) + (IS_NARROW ? 8 : 13);
  const ARROW_Y = IS_NARROW ? 35 : 52;
  locationArrowBounds = { x: ARROW_X - 6, y: ARROW_Y - 12, width: 28, height: 28 };
  fill(255, 184, 113);
  if (locationMenuOpen) {
    triangle(ARROW_X, ARROW_Y - 4, ARROW_X + 14, ARROW_Y - 4, ARROW_X + 7, ARROW_Y + 5);
  } else {
    triangle(ARROW_X, ARROW_Y + 4, ARROW_X + 14, ARROW_Y + 4, ARROW_X + 7, ARROW_Y - 5);
  }

  textStyle(NORMAL);
  fill(244, 218, 193);
  if (IS_NARROW) {
    // Keep the full place name and condition on their own lines on narrow screens.
    const CITY_LABEL = `${selectedLocation.city}, ${selectedLocation.state}`;
    textStyle(NORMAL);
    textSize(13);
    textSize(min(13, 13 * (width - 40) / max(1, textWidth(CITY_LABEL))));
    text(CITY_LABEL, 20, 49);

    const CONDITION_LABEL = getConditionLabel();
    textSize(12);
    textSize(min(12, 12 * (width - 40) / max(1, textWidth(CONDITION_LABEL))));
    text(CONDITION_LABEL, 20, 66);
  } else {
    const LOCATION_LABEL = `${selectedLocation.city}, ${selectedLocation.state}  •  ${getConditionLabel()}`;
    const LABEL_WIDTH = max(80, width - 300);
    textSize(15);
    textSize(min(15, 15 * LABEL_WIDTH / max(1, textWidth(LOCATION_LABEL))));
    text(LOCATION_LABEL, 44, 78);
  }
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

  const IS_NARROW = width < 560;
  const MENU_X = IS_NARROW ? 20 : 42;
  const MENU_Y = IS_NARROW ? 132 : 72;
  const MENU_WIDTH = min(228, width - (IS_NARROW ? 40 : 84));
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
  const CARD_TOP = width < 560 ? 142 : 122;
  const SAFE_BOTTOM = height - 292;
  const CARD_HEIGHT = min(104, max(84, (SAFE_BOTTOM - CARD_TOP - ROW_GAP * 2) / 3));
  const CARD_WIDTH = (width - 70) / COLUMN_COUNT;
  metricCards = [];

  for (let i = 0; i < METRICS.length; i++) {
    // Use a compact two-column stack on narrow canvases to protect card text.
    const COLUMN = i % COLUMN_COUNT;
    const ROW = floor(i / COLUMN_COUNT);
    const CARD_X = 28 + COLUMN * (CARD_WIDTH + 14);
    const CARD_Y = CARD_TOP + ROW * (CARD_HEIGHT + ROW_GAP);

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
    ? 'Broom heading unknown'
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
  const IS_COMPACT = width < 760;
  const CENTER_X = IS_COMPACT ? width / 2 : width * 0.2;
  const CENTER_Y = IS_COMPACT ? height - 132 : height - 166;
  const TEXT_X = IS_COMPACT ? width / 2 : max(width * 0.58, CENTER_X + 150);
  const TEXT_WIDTH = IS_COMPACT ? width - 40 : width - TEXT_X - 28;
  const TITLE_Y = IS_COMPACT ? height - 278 : height - 221;
  const DETAIL_Y = IS_COMPACT ? height - 252 : height - 190;

  push();
  if (IS_COMPACT) {
    // Scale the complete graphic as one unit beneath the description.
    translate(CENTER_X, CENTER_Y);
    scale(0.72);
    drawSelectedMetricGraphic(0, 0);
  } else {
    drawSelectedMetricGraphic(CENTER_X, CENTER_Y);
  }
  pop();

  fill(255, 224, 187);
  textAlign(IS_COMPACT ? CENTER : LEFT, TOP);
  textStyle(BOLD);
  const TITLE_SIZE = IS_COMPACT ? 13 : 17;
  textSize(TITLE_SIZE);
  textSize(min(TITLE_SIZE, TITLE_SIZE * TEXT_WIDTH / max(1, textWidth(METRIC.label))));
  text(METRIC.label, TEXT_X, TITLE_Y);
  textStyle(NORMAL);
  fill(239, 226, 218);
  const DETAIL_SIZE = IS_COMPACT ? 11 : 14;
  textSize(DETAIL_SIZE);
  textSize(min(DETAIL_SIZE, DETAIL_SIZE * TEXT_WIDTH / max(1, textWidth(METRIC.detail))));
  text(METRIC.detail, TEXT_X, DETAIL_Y);
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

  // Check if mouse is in the NOAA source area
  if (
    weatherData &&
    mouseX >= sourceLinkBounds.x &&
    mouseX <= sourceLinkBounds.x + sourceLinkBounds.width &&
    mouseY >= sourceLinkBounds.y &&
    mouseY <= sourceLinkBounds.y + sourceLinkBounds.height
  ) {
    // Open selected location weather API data
    window.open(weatherData.sourceUrl, '_blank', 'noopener');
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
      playSpookySound();
      loop();
      return false;
    }
  }

  return false;
}
