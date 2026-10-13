/*
  Name: Ken Pao
  Class: MM-621
  Project 2: 
  
  Description: 
    

  Note: 
    -  This project is intended for educational purposes in the context of the MM-621 class project.

  Credits:
    

  References:
    - P5.js: https://p5js.org/reference/
    - USGS Earthquake Data: https://earthquake.usgs.gov/earthquakes/feed/v1.0/geojson.php
*/

// ============================================================
// GLOBAL VARIABLES
// ============================================================
let earthquakes;            // Array to hold earthquake data from USGS GeoJSON API
let currentIndex = 0;       // Index to track the current earthquake being processed for animation
let mapLayer;               // Separate map layer for the world map background
let ripples = [];           // Array to hold ripple effects for earthquakes
let earthquakePoints = [];  // Array to hold earthquake positions for hover interaction
let zoomLevel = 1;          // Current map zoom level
let zoomOffsetX = 0;        // Offset used for cursor-centered zoom
let zoomOffsetY = 0;

const MIN_ZOOM = 1;
const MAX_ZOOM = 8;
const ZOOM_STEP = 1.15;

// ============================================================
// IMAGES VARIABLES
// ============================================================
const BG_FILE = '../../assets/images/worldmap.png';
let bgImg;
let assetLoadError = '';

// ============================================================
// ASSETS LOADING
// - Load images and handle errors for missing files. 
//   If an image fails to load, sketch.js will stop and display
//   an error message.
// ============================================================
async function loadOptionalImage(path, label) {
  try {
    // loadImage() returns a Promise in the p5.js 2.x async workflow.
    return await loadImage(path);
  } catch (error) {
    // Log the error and stop game.
    throw new Error(`${label} failed to load: ${path}`);
  }
}

async function loadAssets() {
  // Load worldmap background.
  bgImg = await loadOptionalImage(BG_FILE, 'world map background');
}

// ============================================================
// p5.js SETUP
// ============================================================
async function setup() {
  // Create a temporary canvas first so loading errors can be shown visually.
  const WW = Math.min(0.8 * windowWidth, 1200);
  createCanvas(WW, WW * 0.48).parent('sketch-stage');

  // Load images before creating the world map.
  try {
    await loadAssets();
  } catch (error) {
    assetLoadError = error.message;
    console.error(assetLoadError);  // Log the error to the console for debugging.
    
    // Display the error message on the canvas.
    background('#201018');
    fill('#ffb3b3');
    textSize(16);
    text(`Image load error:\n${assetLoadError}`, 20, 30);
    noLoop();
    return;
  }

  // Keep the canvas in the same aspect ratio as the image.
  const WH = WW * bgImg.height / bgImg.width;
  resizeCanvas(WW, WH);

  // Create a separate layer for the map and permanent earthquake dots.
  mapLayer = createGraphics(width, height);

  // Draw the map onto the separate layer
  mapLayer.image(bgImg, 0, 0, width, height);

  // Connect the corner control after the canvas has been created.
  document.getElementById('reset-zoom').addEventListener('click', resetZoom);

  // Load earthquake data from USGS GeoJSON feed for magnitude 2.5+ earthquakes in past 30 days.
  // Why 2.5+? Because 2.5 is a common threshold for earthquakes that are felt by people and 
  // can cause minor damage. If I skip 2.5, the next level is 4.5 which is slightly too high 
  // and would result in very few earthquakes being showed.
  const URL = 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/2.5_month.geojson';

  // Use fetch is better than loadJSON because it allows for error handling and async/await syntax.
  try {
    // Await the fetch request instead of using p5's loadJSON
    const RESPONSE = await fetch(URL);
    const EARTHQUAKE_DATA = await RESPONSE.json();
    
    // Once awaited, store the array
    earthquakes = EARTHQUAKE_DATA.features;

  } catch (error) {
    console.error("Failed to load earthquake data:", error);
  }
}

// ============================================================
// p5.js DRAW
// ============================================================
function draw() {

  // If the earthquake data is not loaded yet, skip drawing.
  if (!earthquakes) {
    return;
  }

  // Use If statement is better than For loop because it lets each earthquake draw in a 
  // separate frame, creating a more dynamic visualization effect. Using for loop
  // would draw all earthquakes in a single burst, which destroys the visual effect.
  if (currentIndex < earthquakes.length) {

    // Get the current earthquake data
    let currentEarthquake = earthquakes[currentIndex];

    // geometry: {
    //   type: "Point",
    //   coordinates: [
    //     longitude,
    //     latitude,
    //     depth
    //   ]
    // }
    let coordinates = currentEarthquake.geometry.coordinates;
    let lon = coordinates[0];
    let lat = coordinates[1];
    
    // The magnitude is stored in the properties object
    // This JSON data feed is for mag 2.5+ earthquakes from past 30 days
    let mag = currentEarthquake.properties.mag;

    // Map longitude (-180 to 180) to the canvas width (0 to width)
    // The image has a small horizontal margin around the visible map.
    let x = map(lon, -180, 180, 0.024 * width, 0.967 * width);
    
    // Map latitude (90 to -90) to canvas height 
    // Invert (90 to -90 instead of -90 to 90) because p5's Y-axis direction
    // The image has larger top/bottom margins than a geographic map.
    let y = map(lat, 90, -90, 0.167 * height, 0.891 * height);
    
    // Map the earthquake magnitude to the visual diameter of our circle.
    let diameter = map(
      constrain(mag, 2.5, 8.0),   // constrain the magnitude to the range of 2.5 to 8.0
                                  // so magnitudes outside this range will not distort 
                                  // the visual representation.
      2.5, 
      8.0, 
      4, 
      40
    );
    
    let dotColor = getEarthquakeColor(mag); // Get color based on magnitude

    // Save the earthquake data and screen position for the hover interaction.
    earthquakePoints.push({
      x: x,
      y: y,
      diameter: diameter,
      color: dotColor,
      place: currentEarthquake.properties.place || 'Unknown location',
      latitude: lat,
      longitude: lon,
      magnitude: mag
    });

    // Start a ripple for this earthquake
    ripples.push({
      x: x,
      y: y,
      diameter: diameter,
      color: dotColor,
      startFrame: frameCount
    });

    currentIndex++; // Move to the next earthquake for the next frame
  } 
  
  // Draw the map, dots, and ripples with the same explicit coordinate
  // conversion so they stay aligned at every zoom level.
  background('#02030c');
  const mapLeft = width / 2 + zoomOffsetX - (width * zoomLevel) / 2;
  const mapTop = height / 2 + zoomOffsetY - (height * zoomLevel) / 2;
  image(mapLayer, mapLeft, mapTop, width * zoomLevel, height * zoomLevel);
  drawEarthquakePoints();
  drawRipples();

  // Draw the information box above the map when the mouse is over an earthquake.
  drawEarthquakeTooltip();

  // Stop only after every earthquake and ripple are finished
  if (
    currentIndex >= earthquakes.length &&
    ripples.length === 0
  ) {
    noLoop();
  }
}

// ============================================================
// MOUSE HOVER INTERACTION
// - Redraw the canvas while the mouse moves so the tooltip works after noLoop().
// ============================================================
function mouseMoved() {
  if (earthquakes) {
    redraw();
  }

  return false;
}

// ============================================================
// ZOOM INTERACTION
// - Zoom toward the cursor while preserving the map point under it.
// ============================================================
function mouseWheel(event) {
  if (!earthquakes || !isMouseOverCanvas()) {
    return true;
  }

  const previousZoom = zoomLevel;
  const zoomMultiplier = event.deltaY < 0 ? ZOOM_STEP : 1 / ZOOM_STEP;
  zoomLevel = constrain(zoomLevel * zoomMultiplier, MIN_ZOOM, MAX_ZOOM);

  if (zoomLevel !== previousZoom) {
    const mapX = (mouseX - width / 2 - zoomOffsetX) / previousZoom + width / 2;
    const mapY = (mouseY - height / 2 - zoomOffsetY) / previousZoom + height / 2;

    zoomOffsetX = mouseX - width / 2 - (mapX - width / 2) * zoomLevel;
    zoomOffsetY = mouseY - height / 2 - (mapY - height / 2) * zoomLevel;
    redraw();
  }

  // Prevent the page from scrolling while the cursor is over the canvas.
  return false;
}

function resetZoom() {
  zoomLevel = 1;
  zoomOffsetX = 0;
  zoomOffsetY = 0;
  redraw();
}

function isMouseOverCanvas() {
  return mouseX >= 0 && mouseX <= width && mouseY >= 0 && mouseY <= height;
}

function worldToScreenX(worldX) {
  return width / 2 + zoomOffsetX + (worldX - width / 2) * zoomLevel;
}

function worldToScreenY(worldY) {
  return height / 2 + zoomOffsetY + (worldY - height / 2) * zoomLevel;
}

// ============================================================
// DRAW EARTHQUAKE TOOLTIP
// - Show the place, coordinates, and magnitude for the nearest earthquake.
// ============================================================
function drawEarthquakeTooltip() {
  let hoveredEarthquake = getHoveredEarthquake();

  if (!hoveredEarthquake) {
    return;
  }

  const TOOLTIP_WIDTH = 220;
  const TOOLTIP_HEIGHT = 112;
  const TOOLTIP_MARGIN = 14;
  let tooltipX = mouseX + TOOLTIP_MARGIN;
  let tooltipY = mouseY + TOOLTIP_MARGIN;

  // Keep the tooltip inside the canvas when the mouse is near an edge.
  if (tooltipX + TOOLTIP_WIDTH > width) {
    tooltipX = mouseX - TOOLTIP_WIDTH - TOOLTIP_MARGIN;
  }

  if (tooltipY + TOOLTIP_HEIGHT > height) {
    tooltipY = mouseY - TOOLTIP_HEIGHT - TOOLTIP_MARGIN;
  }

  push();
  noStroke();
  fill(20, 24, 55, 235);
  rect(tooltipX, tooltipY, TOOLTIP_WIDTH, TOOLTIP_HEIGHT, 8);

  fill('#ffffff');
  textAlign(LEFT, TOP);
  textSize(13);
  text(`City / country: ${hoveredEarthquake.place}`, tooltipX + 12, tooltipY + 10, TOOLTIP_WIDTH - 24, 34);
  text(`Latitude: ${hoveredEarthquake.latitude.toFixed(3)}`, tooltipX + 12, tooltipY + 48);
  text(`Longitude: ${hoveredEarthquake.longitude.toFixed(3)}`, tooltipX + 12, tooltipY + 65);
  text(`Magnitude: ${hoveredEarthquake.magnitude.toFixed(1)}`, tooltipX + 12, tooltipY + 82);
  pop();
}

// ============================================================
// FIND HOVERED EARTHQUAKE
// - Return the earthquake point closest to the mouse cursor.
// ============================================================
function getHoveredEarthquake() {
  let closestEarthquake = null;
  let closestDistance = Infinity;

  // Convert the screen-space cursor back into map-layer coordinates.
  const mapMouseX = (mouseX - width / 2 - zoomOffsetX) / zoomLevel + width / 2;
  const mapMouseY = (mouseY - height / 2 - zoomOffsetY) / zoomLevel + height / 2;

  for (let earthquake of earthquakePoints) {
    let distanceToMouse = dist(mapMouseX, mapMouseY, earthquake.x, earthquake.y);
    let hoverRadius = Math.max(earthquake.diameter / 2 + 6, 10);

    if (distanceToMouse <= hoverRadius && distanceToMouse < closestDistance) {
      closestEarthquake = earthquake;
      closestDistance = distanceToMouse;
    }
  }

  return closestEarthquake;
}

// ============================================================
// GET EARTHQUAKE COLOR
// - Based on magnitude, use lerpColor() to interpolate between 
//   two colors (yellow for small, red for large).
// ============================================================
function getEarthquakeColor(magnitude) {
  let amount = map(magnitude, 2.5, 8.0, 0, 1, true);

  let smallColor = color(255, 230, 80, 180); // yellow
  let largeColor = color(255, 40, 40, 220);   // red

  return lerpColor(smallColor, largeColor, amount);
}

// ============================================================
// DRAW EARTHQUAKE POINTS
// - Redraw all earthquake dots in the same transformed coordinate system
//   as the map and ripples.
// ============================================================
function drawEarthquakePoints() {
  noStroke();

  for (let earthquake of earthquakePoints) {
    fill(earthquake.color);
    circle(
      worldToScreenX(earthquake.x),
      worldToScreenY(earthquake.y),
      earthquake.diameter * zoomLevel
    );
  }
}

// ============================================================
// DRAW RIPPLE EFFECT
// ============================================================
function drawRipples() {
  // Draw and animate the ripples
  for (let i = ripples.length - 1; i >= 0; i--) {
    let ripple = ripples[i];
    let age = frameCount - ripple.startFrame;
    let rippleDuration = 45;

    if (age > rippleDuration) {
      ripples.splice(i, 1);
      continue;
    }

    let rippleDiameter = map(
      age,
      0,
      rippleDuration,
      ripple.diameter,
      ripple.diameter + 60
    );

    let rippleAlpha = map(
      age,
      0,
      rippleDuration,
      150,
      0
    );

    noFill();
    stroke(
      red(ripple.color),
      green(ripple.color),
      blue(ripple.color),
      rippleAlpha
    );
    strokeWeight(2);

    circle(
      worldToScreenX(ripple.x),
      worldToScreenY(ripple.y),
      rippleDiameter * zoomLevel
    );
  }
}
