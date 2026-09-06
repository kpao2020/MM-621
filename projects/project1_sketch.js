/*
  Name: Ken Pao
  Class: MM-621
  Project: Space Travel
  Note: Code authored by Ken Pao, with AI assistance on research and debugging.
*/

// Global variables for the starfield simulation
// Note: use 'const' in front of variables to prevent accidental reassignment
const stars = [];
const STAR_COUNT = 500;
const SLOW_TRAVEL_SPEED = 0.0015;
const FAST_TRAVEL_SPEED = 0.012;
const SPEED_EASING = 0.05; // smooth speed transition
const STEER_AMOUNT = 0.01; // how much the stars move based on mouse position

// Head-Up-Display (HUD) state for the speed / warp indicator
let warpLevel = 0;

// Rocket - a 3D-style custom object
const rocket = {
  active: false,
  x: 0,
  y: 0,
  z: 1,
  angle: 0,
  velocityX: 0,
  velocityY: 0,
  depthSpeed: 0,
  speed: 0,
  baseScale: 1,
  nextAppearance: 0
};

// p5.js setup function to initialize the canvas and stars
function setup() {
  createCanvas(windowWidth, windowHeight);
  colorMode(HSB, 360, 100, 100, 100); // Use HSB color mode for easier color manipulation for space theme
  noStroke();

  // initialize stars with random positions and z values (depth)
  for (let i = 0; i < STAR_COUNT; i += 1) {
    stars.push(createStar(true));
  }

  // Wait 3-7 seconds before the first rocket appears
  rocket.nextAppearance = millis() + random(3000, 7000);
}

// p5.js draw function to continuously render the starfield
function draw() {
  drawStarfield();
  updateRocket();
  drawRocket();
  drawHUD();
}

// Function to draw the starfield based on the current state of stars and mouse position
function drawStarfield() {
  background(235, 75, 5); // dark background for space

  // steerX and steerY are map mouse position values -1,0,1
  const steerX = map(mouseX, 0, width, -1, 1, true);
  const steerY = map(mouseY, 0, height, -1, 1, true);

  // centerX and centerY are the center of the canvas
  const centerX = width / 2;
  const centerY = height / 2;

  for (const star of stars) {
    // Calculate the previous position of the star based on its z value (depth)
    const previousX = centerX + (star.x / star.z) * width;
    const previousY = centerY + (star.y / star.z) * height;

    // Ease toward slow or fast travel based only on the mouseIsPressed.
    const targetSpeed = mouseIsPressed
      ? FAST_TRAVEL_SPEED + star.speed // fast when mouse is pressed
      : SLOW_TRAVEL_SPEED + star.speed * 0.15; // slow when mouse is NOT pressed

    // lerp will move current speed to target speed gradually, 5% each frame, 
    // creating a smooth transition effect
    star.travelSpeed = lerp(star.travelSpeed, targetSpeed, SPEED_EASING);
    
    // update new star position based on its travel speed and mouse steering
    star.z -= star.travelSpeed;
    star.x -= steerX * STEER_AMOUNT;
    star.y -= steerY * STEER_AMOUNT;

    // Calculate the current position of the star after star x,y,z update, 
    // as well as its size and alpha values based on its z value (depth)
    const screenX = centerX + (star.x / star.z) * width;
    const screenY = centerY + (star.y / star.z) * height;
    const size = map(star.z, 1, 0, 0.5, 5.5); // size of the star, 0.5 = smallest, 5.5 = largest
    const alpha = map(star.z, 1, 0, 20, 100); // alpha of the star, 20 = most transparent, 100 = most opaque

    // recycle the star if it is too close to the view (z < 0.04) or if it is outside the canvas bounds
    if (star.z < 0.04 || screenX < -20 || screenX > width + 20 || screenY < -20 || screenY > height + 20) {
      const newStar = createStar(false);

      star.x = newStar.x;
      star.y = newStar.y;
      star.z = newStar.z;
      star.speed = newStar.speed;
      star.travelSpeed = newStar.travelSpeed;
      star.tint = newStar.tint;
      continue; // skip drawing this star since it has been recycled
    }

    // draw star trail line
    stroke(205 + star.tint, 25, 100, alpha * 0.7);
    strokeWeight(max(0.5, size * 0.45));
    line(previousX, previousY, screenX, screenY);

    // draw star as a cirle
    noStroke();
    fill(205 + star.tint, 25, 100, alpha);
    circle(screenX, screenY, size);
  }
}

// Smooth the HUD indicator between cruise and warp states
function drawHUD() {
  // this move the bar 8% each frame for wrap drive speed
  const targetWarpLevel = mouseIsPressed ? 1 : 0;
  warpLevel = lerp(warpLevel, targetWarpLevel, 0.08);

  const panelWidth = min(180, width * 0.42);
  const panelX = width - panelWidth - 24;
  const panelY = 24;
  const barWidth = panelWidth - 24;
  const status = warpLevel > 0.5 ? 'WARP DRIVE' : 'CRUISE';

  push(); // push and pop to isolate HUD from other things on screen
  noStroke();

  // Soft panel background
  fill(235, 55, 8, 62);
  rect(panelX, panelY, panelWidth, 42, 8);

  // Status label
  fill(220, 15, 96, 88);
  textAlign(LEFT, CENTER);
  textSize(10);
  text(status, panelX + 12, panelY + 11);

  // Speed bar (empty)
  fill(220, 30, 35, 75);
  rect(panelX + 12, panelY + 25, barWidth, 4, 2);
  
  // Speed bar (filled based on warpLevel)
  fill(195 + warpLevel * 135, 70, 100, 92);
  rect(panelX + 12, panelY + 25, barWidth * warpLevel, 4, 2);

  pop();
}

// Start a rocket fly-by at a random time, location, depth, and direction
function updateRocket() {
  // create/spawn a rocket
  if (!rocket.active && millis() >= rocket.nextAppearance) {
    rocket.active = true;
    rocket.x = random(-0.75, 0.75);
    rocket.y = random(-0.75, 0.75);
    rocket.z = random(0.85, 1.1);

    // The rocket travels at a random angle through world space
    rocket.angle = random(TWO_PI);
    rocket.speed = random(0.0015, 0.004);
    rocket.velocityX = cos(rocket.angle) * rocket.speed;
    rocket.velocityY = sin(rocket.angle) * rocket.speed;

    // Moving toward the viewer makes the rocket grow through perspective
    rocket.depthSpeed = random(0.0018, 0.0035);
    rocket.baseScale = random(0.65, 1.15);
  }

  // if no rocket, exit this function
  if (!rocket.active) {
    return;
  }

  // if there is a rocket, move it
  rocket.x += rocket.velocityX;
  rocket.y += rocket.velocityY;
  rocket.z -= rocket.depthSpeed;

  const position = getRocketScreenPosition();

  if (
    rocket.z < 0.05 ||
    position.x < -120 ||
    position.x > width + 120 ||
    position.y < -120 ||
    position.y > height + 120
  ) {
    rocket.active = false;
    rocket.nextAppearance = millis() + random(5000, 13000);
  }
}

// Convert the rocket's 3D-style coordinates into 2D canvas coordinates
function getRocketScreenPosition() {
  return {
    x: width / 2 + (rocket.x / rocket.z) * width,
    y: height / 2 + (rocket.y / rocket.z) * height
  };
}

// Draw the rocket with perspective: closer rockets are larger and brighter
function drawRocket() {
  // if no rocket, exit this function
  if (!rocket.active) {
    return;
  }

  const position = getRocketScreenPosition();
  const perspectiveScale = map(rocket.z, 1.1, 0.05, 0.45, 2.8, true);
  const rocketAlpha = map(rocket.z, 1.1, 0.05, 45, 100, true);

  push(); // push and pop to isolate rocket from other things on screen
  translate(position.x, position.y);
  rotate(rocket.angle);
  scale(rocket.baseScale * perspectiveScale);

  // Engine glow and flame
  noStroke();
  fill(35, 80, 100, rocketAlpha * 0.18);
  ellipse(-28, 0, 70, 30);
  fill(15, 85, 100, rocketAlpha * 0.9);
  triangle(-25, 0, -52, -9, -52, 9);
  fill(48, 75, 100, rocketAlpha * 0.95);
  triangle(-25, 0, -44, -5, -44, 5);

  // Rocket body and nose
  fill(215, 12, 94, rocketAlpha * 0.96);
  ellipse(0, 0, 52, 18);
  fill(205, 16, 100, rocketAlpha * 0.98);
  triangle(16, -9, 34, 0, 16, 9);

  // Window and fins
  fill(195, 55, 95, rocketAlpha * 0.95);
  circle(5, -1, 9);
  fill(345, 65, 92, rocketAlpha * 0.95);
  triangle(-9, 8, 6, 8, -2, 17);
  triangle(-9, -8, 6, -8, -2, -17);

  pop();
}

// create a new star if isNew = true, otherwise recycle an existing star
function createStar(isNew) {
  const speed = random(0.001, 0.008); // 0.001 = slowest, 0.008 = fastest; this value changes only when the star is recycled

  return {
    x: random(-1, 1), // -1 = left, 0 = center, 1 = right (in decimal)
    y: random(-1, 1), // -1 = top, 0 = center, 1 = bottom (in decimal)
    z: isNew ? random(0.05, 1) : 1, // 0.05 = closest to view, 1 = farest to view, recycled when z < 0.04
    speed, // per-star speed variation; this value changes only when the star is recycled
    travelSpeed: SLOW_TRAVEL_SPEED + speed * 0.15, // current speed of the star, which eases toward slow or fast travel based on mouseIsPressed
    tint: random(-25, 35) // neg values = blueish, pos values = purplish, 0 = white
  };
}

// make canvas responsive to window resizing
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
