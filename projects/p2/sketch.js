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

  // Draw background worldmap.
  image(bgImg, 0, 0, width, height);

  // Load earthquake data from USGS GeoJSON feed for magnitude 2.5+ earthquakes in past 30 days.
  // Why 2.5+? Because 2.5 is a common threshold for earthquakes that are felt by people and 
  // can cause minor damage. If I skip 2.5, the next level is 4.5 which is slightly too high 
  // and would result in very few earthquakes being showed.
  let URL = 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/2.5_month.geojson';

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
    let x = map(lon, -180, 180, 0.05 * width, 0.95 * width);
    
    // Map latitude (90 to -90) to canvas height 
    // Invert (90 to -90 instead of -90 to 90) because p5's Y-axis direction
    // The image has larger top/bottom margins than a geographic map.
    let y = map(lat, 90, -90, 0.17 * height, 0.90 * height);
    
    // Map the earthquake magnitude to the visual radius of our circle
    let radius = map(mag, 2.5, 8.0, 2, 40);
    
    // Draw the earthquake dot
    noStroke();
    fill(255, 80, 100, 150); // Glowing, semi-transparent red
    circle(x, y, radius);

    currentIndex++; // Move to the next earthquake for the next frame
  } else {
    noLoop(); // Stop the draw loop when all earthquakes have been drawn
  }
}
