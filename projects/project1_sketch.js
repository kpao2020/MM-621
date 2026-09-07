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

// Keep the rocket's starting point inside a central screen area so it is
// visible immediately instead of appearing close to an edge.
const ROCKET_SPAWN_X_RANGE = 0.25; // center 50% area x-axis
const ROCKET_SPAWN_Y_RANGE = 0.25; // center 50% area y-axis

// Head-Up-Display (HUD) state for the speed / warp indicator
let warpLevel = 0;

// Rocket - a 3D-style custom object
const rocket = {
  active: false,
  x: 0,
  y: 0,
  z: 1,
  pitch: 0,
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
    // x and y are normalized world coordinates, so these smaller ranges
    // create a center box around the middle of the canvas.
    rocket.x = random(-ROCKET_SPAWN_X_RANGE, ROCKET_SPAWN_X_RANGE);
    rocket.y = random(-ROCKET_SPAWN_Y_RANGE, ROCKET_SPAWN_Y_RANGE);
    rocket.z = random(0.95, 1.1);

    // The rocket travels at a random angle through world space
    rocket.angle = random(TWO_PI);

    // The rocket's pitch is a random angle, which tilts the rocket 60 degrees 
    // up or down. This gives the rocket a more dynamic 3D appearance.
    rocket.pitch = radians(random(-60, 60));

    // A slightly slower lateral speed gives the viewer more time to notice
    // the rocket before it travels off-screen.
    rocket.speed = random(0.0012, 0.0028);
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
    rocket.nextAppearance = millis() + random(1000, 5000);
  }
}

// Convert the rocket's 3D-style coordinates into 2D canvas coordinates
function getRocketScreenPosition() {
  return {
    x: width / 2 + (rocket.x / rocket.z) * width,
    y: height / 2 + (rocket.y / rocket.z) * height
  };
}

// Draw a 3D alike rocket with perspective: closer view = larger and brighter.
// The rocket is drawn along its local +x axis, then rotated to match its
// direction of travel. Layering the underside, highlights, and fin thickness
// gives the 2D canvas a small 3D-model feel.
function drawRocket() {
  // if no rocket, exit this function
  if (!rocket.active) {
    return;
  }

  const position = getRocketScreenPosition(); // canvas coordinates of the rocket x,y
  const perspectiveScale = map(rocket.z, 1.1, 0.05, 0.45, 2.8, true); // size scale based on rocket.z
  const rocketAlpha = map(rocket.z, 1.1, 0.05, 45, 100, true); // brightness

  push(); // push and pop to isolate rocket from other things on screen
  translate(position.x, position.y);
  
  // The nose points along +x, so the whole model tilts with its flight angle.
  rotate(rocket.angle); // rotate the rocket to match its direction of travel
  
  shearY(sin(rocket.pitch) * 0.6); // shearY tilts the rocket nose up or down based on its pitch angle
  
  scale(cos(rocket.pitch), 1); // scaleX shrinks the rocket's width based on its pitch angle
  
  scale(rocket.baseScale * perspectiveScale); // scale the rocket based on its baseScale and perspectiveScale

  // Engine glow and flame
  noStroke();
  fill(35, 80, 100, rocketAlpha * 0.18);
  ellipse(-32, 0, 82, 34);
  fill(15, 85, 100, rocketAlpha * 0.9);
  triangle(-23, 0, -58, -10, -58, 10);
  fill(48, 75, 100, rocketAlpha * 0.95);
  triangle(-23, 0, -49, -5, -49, 5);

  // Dark offset layers make the body and fins feel thick instead of flat.
  fill(220, 28, 35, rocketAlpha * 0.9);
  ellipse(0, 5, 56, 20);
  triangle(14, -4, 36, 5, 14, 14);

  // Back fins: the lower fin is slightly darker to suggest depth.
  fill(345, 72, 48, rocketAlpha * 0.95);
  triangle(-11, 7, 8, 9, -3, 21);
  fill(345, 55, 76, rocketAlpha * 0.98);
  triangle(-11, -8, 8, -7, -3, -18);

  // Engine nozzle and inner glow
  fill(220, 24, 30, rocketAlpha * 0.95);
  ellipse(-23, 2, 15, 18);
  fill(215, 18, 72, rocketAlpha * 0.95);
  ellipse(-25, 0, 10, 12);

  // Rounded body and nose cone. The offset dark layer above acts as the
  // lower edge of the cylindrical fuselage.
  fill(215, 12, 94, rocketAlpha * 0.98);
  ellipse(0, 0, 56, 20);
  fill(205, 16, 100, rocketAlpha * 0.98);
  triangle(14, -10, 36, 0, 14, 10);

  // Nose-cone underside and a bright top-plane highlight.
  fill(205, 20, 70, rocketAlpha * 0.72);
  triangle(14, 0, 36, 0, 14, 10);
  fill(45, 12, 100, rocketAlpha * 0.65);
  ellipse(0, -4, 42, 7);

  // A small body seam reinforces the cylindrical form.
  fill(190, 34, 75, rocketAlpha * 0.8);
  rect(10, -8, 3, 16, 2);

  // Window with a dark rim and a reflected highlight.
  fill(220, 38, 38, rocketAlpha * 0.95);
  circle(3, 0, 11);
  fill(195, 58, 94, rocketAlpha * 0.98);
  circle(3, -1, 8);
  fill(200, 12, 100, rocketAlpha * 0.75);
  circle(1, -3, 3);

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
