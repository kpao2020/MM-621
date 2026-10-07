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
let earthquakes;
let currentIndex = 0;
let mapLayer;
let ripples = [];  // Array to hold ripple effects for earthquakes

// ============================================================
// IMAGES VARIABLES
// ============================================================
const BG_FILE = '../../assets/images/worldmap.png';
let bgImg;
let assetLoadError = '';

// ============================================================
// ASSETS LOADING
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

    // Permanently add this earthquake to the map layer
    mapLayer.noStroke();
    mapLayer.fill(dotColor);
    mapLayer.circle(x, y, diameter);

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
  
  // Draw the map layer with all permanent earthquake dots
  image(mapLayer, 0, 0);

  // Draw and animate the ripples
  drawRipples();

  // Stop only after every earthquake and ripple are finished
  if (
    currentIndex >= earthquakes.length &&
    ripples.length === 0
  ) {
    noLoop();
  }
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
// DRAW EARTHQUAKE DOTS WITH RIPPLE EFFECT
// - Draw a circle for the earthquake with a ripple effect
// ============================================================
function drawEarthquakeDots(x, y, diameter, dotColor, index) {
  // Draw the earthquake center
  noStroke();
  fill(dotColor);
  circle(x, y, diameter);

  // Create a repeating ripple
  let rippleSize = (frameCount * 2 + index * 15) % 60;
  let rippleAlpha = map(rippleSize, 0, 60, 150, 0);

  let rippleColor = color(
    red(dotColor),
    green(dotColor),
    blue(dotColor),
    rippleAlpha
  );

  noFill();
  stroke(rippleColor);
  strokeWeight(2);
  circle(x, y, diameter + rippleSize);
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
      ripple.x,
      ripple.y,
      rippleDiameter
    );
  }
}