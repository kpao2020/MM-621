/*
  Name: Ken Pao
  Class: MM-621
  Project: Space Travel
  Note: Code authored by Ken Pao, and debugged with AI assistance.
*/

// Global variables for the starfield simulation
// Note: use 'const' in front of variables to prevent accidental reassignment
const stars = [];
const STAR_COUNT = 520;
const SLOW_TRAVEL_SPEED = 0.0015;
const FAST_TRAVEL_SPEED = 0.012;
const SPEED_EASING = 0.05; // smooth speed transition
const STEER_AMOUNT = 0.01; // how much the stars move based on mouse position

// p5.js setup function to initialize the canvas and stars
function setup() {
  createCanvas(windowWidth, windowHeight);
  colorMode(HSB, 360, 100, 100, 100); // Use HSB color mode for easier color manipulation for space theme
  noStroke();

  // initialize stars with random positions and z values (depth)
  for (let i = 0; i < STAR_COUNT; i += 1) {
    stars.push(createStar(true));
  }
}

// p5.js draw function to continuously render the starfield
function draw() {
  drawStarfield();
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
