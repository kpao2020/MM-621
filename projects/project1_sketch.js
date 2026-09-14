/*
  Name: Ken Pao
  Class: MM-621
  Project: Space Travel
  
  Description: 
    Space Travel is a simple 2D game where the player controls a spaceship to collect stars, 
    land on planets, while trying to avoid asteroids and the sun. 
    The game uses p5.js for rendering graphics and Matter.js for physics simulation.

    - p5.js      = drawing, images, user interface, keyboard / mouse input
    - Matter.js  = physics bodies, movement, and collision detection

    - try to keep things simple and intend to NO sound effects.

  Note: This project is intended for educational purposes
        in the context of the MM-621 class project.

  Credits:
    - Adobe Stock Images for images

  References:
    - P5.js: https://p5js.org/reference/
    - Matter.js: https://brm.io/matter-js/docs/
    - Pythagorean Theorem: https://gamedev.stackexchange.com/questions/60078/how-do-i-calculate-speed-given-x-y-components-of-a-velocity-vector
    - Spread syntax: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Spread_syntax
*/

// ============================================================
// GAME VARIABLES
// - use const to avoid accidental changes to these values.
// ============================================================

// Game timer
const GAME_TIME = 60;           // Total game time in seconds (1 min).

// Game scoring system
const STAR_POINTS = 1;          // Score for collecting a star.
const PLANET_POINTS = 5;        // Score for landing on a planet.
const ASTEROID_POINTS = -1;     // Score when hit by an asteroid.
const SUN_POINTS = -3;          // Score when hitting the sun.

// All objects are "circles" - to keep things simple.
const SHIP_SIZE = 42;           // Matter collision diameter for the spaceship.
const STAR_RADIUS = 18;         // Constant star collision radius.
const PLANET_RADIUS = 45;       // Constant planet collision radius.
const ASTEROID_RADIUS = 25;     // Constant asteroid collision radius.
const SUN_RADIUS = 65;          // Constant sun collision raidus.
const OBJECT_GAP = 25;          // Extra spacing between objects.
const EDGE_PADDING = 30;        // Edge padding prevent objects create on canvas edge.

// Note: Stars, Planets, Sun = static objects, do not move.
const SHIP_MAX_SPEED = 5;       // Maximum spaceship velocity.
const ASTEROID_SPEED = 1;       // Constant asteroid speed.
const COLLISION_COOLDOWN = 800; // Cooldown timer in (0.8 sec) before the same object can score again.

let nextPlanetSpawnTime = 0;    // Time in millis when the next planet should spawn.
let nextStarId = 0;             // Unique ID for each star to prevent repeated scoring.
let shipScaredUntil = 0;        // Hold time in millis when spaceship hit asteroid.
// ============================================================
// ASSET FILES
// ============================================================

const BG_FILES = [
  "../images/bg1.jpg",
  "../images/bg2.jpg",
  "../images/bg3.jpg"
];

const ASTEROID_FILES = [
  "../images/asteroid1.png",
  "../images/asteroid2.png"
];

const PLANET_FILES = [
  "../images/planet1.png",
  "../images/planet2.png",
  "../images/planet3.png"
];

const SHIP_FILE = "../images/spaceship.png";
const STAR_FILE = "../images/star.png";
const SUN_FILE = "../images/sun.png";

// ============================================================
// IMAGE VARIABLES
// - Assets are filled during async setup() for p5.js v2
// ============================================================

let bgImages = [];
let asteroidImgs = [];
let planetImgs = [];

let shipImg = null;
let starImg = null;
let sunImg = null;

let assetLoadError = null;

// ============================================================
// MATTER.JS VARIABLES
// ============================================================
let Engine = Matter.Engine,
    World = Matter.World,
    Body = Matter.Body,       // Modify existing body objects
    Bodies = Matter.Bodies;   // Create new body objects

let engine;
let world;

let shipBody;
let starBodies = [];
let planetBodies = [];
let asteroidBodies = [];
let sunBody;

// ============================================================
// GAME STATE
// "start" = game-start screen
// "play"  = game-play screen
// "end"   = game-over screen
// ============================================================

let gameState = "start";

let score = 0;
let timeLeft = GAME_TIME;
let gameStartMillis = 0;

let selectedBackground;

// Prevent an object from awarding points repeatedly.
let collectedObjects = new Set();

// Prevent rapid repeated planet/asteroid/sun scoring.
let collisionCooldown = new Map();

// ============================================================
// ASSET LOADING
// - p5.js v2: use async/await instead of preload().
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
  // Load all backgrounds.
  bgImages = await Promise.all(
    BG_FILES.map((file, index) =>
      loadOptionalImage(file, `Background ${index + 1}`)
    )
  );

  // Load 2 asteroid images.
  asteroidImgs = await Promise.all(
    ASTEROID_FILES.map((file, index) =>
      loadOptionalImage(file, `asteroid${index + 1}.png`)
    )
  );  

  // Load 3 planet images.
  planetImgs = await Promise.all(
    PLANET_FILES.map((file, index) =>
      loadOptionalImage(file, `planet${index + 1}.png`)
    )
  );

  // Load individual object images.
  shipImg = await loadOptionalImage(SHIP_FILE, "spaceship.png");
  starImg = await loadOptionalImage(STAR_FILE, "star.png");
  sunImg = await loadOptionalImage(SUN_FILE, "sun.png");
}

// ============================================================
// p5.js SETUP
// ============================================================

async function setup() {
  // Use browser window width for responsive design.
  createCanvas(windowWidth, windowHeight);

  // Load images before creating the game world.
  // if any image fails to load, the game will not start and 
  // display an error message in console.log.
  try {
    await loadAssets();
  } catch (error) {
    assetLoadError = error.message;
    console.error(assetLoadError);
    return;
  }

  // Create the Matter.js physics engine.
  engine = Engine.create();

  // Get the physics world from the engine.
  world = engine.world;

  // NOTE: Do not use Engine.run(engine) because p5.js draw() loop handles
  //       how input and physics updates at each frame.
  // Engine.run(engine);
  
  // Space has no normal gravity.
  engine.gravity.x = 0;
  engine.gravity.y = 0;

  // Setup collision handling.
  setupCollisionEvents();

  // Create the initial game world.
  createGameWorld();

  // Use a system font for the interface.
  textFont("system-ui");
}

// ============================================================
// CREATE / RESET GAME WORLD
// ============================================================

function createGameWorld() {
  // Clear Matter bodies before starting a new game.
  clearMatterWorld();

  // Clear matter.js body variables and initialize score and timer.
  starBodies = [];
  planetBodies = [];
  asteroidBodies = [];
  sunBody = null;

  score = 0;
  timeLeft = GAME_TIME;

  collectedObjects.clear();
  collisionCooldown.clear();

  // Pick one of the available background images at random.
  selectedBackground = floor(random(bgImages.length));

  // ----------------------------------------------------------
  // SPACESHIP
  // - just a simple circle for physical collision detection, 
  //   and use p5.js image for the visual spaceship.
  // ----------------------------------------------------------

  shipBody = Bodies.circle(
    width / 2,                 // Start X position in center.
    height / 2,                // Start Y position in center.
    SHIP_SIZE / 2,             // Spaceship radius.
    {
      label: "ship",           // Used to identify spaceship.
      frictionAir: 0.08,       // Slows the ship naturally.
      restitution: 0.2,        // Small bounce.
      inertia: Infinity        // Prevents unwanted rotation.
    }
  );

  World.add(world, shipBody);

  // ----------------------------------------------------------
  // GAME OBJECTS
  // ----------------------------------------------------------

  // Create 1 to 3 stars randomly.
  const starCount = floor(random(1, 4));  // Randomly choose 1, 2, or 3 stars.

  for (let i = 0; i < starCount; i++) {
    createStar();
  }

  // Create 1 planet randomly between 5 to 15 seconds.
  nextPlanetSpawnTime = millis() + random(5000, 15000);
  
  // Create 1 to 2 asteroids randomly.
  const asteroidCount = floor(random(1, 3));

  for (let i = 0; i < asteroidCount; i++) {
    createAsteroid(i);
  }

  // Create 1 sun.
  createSun();
}

// ============================================================
// CLEAR MATTER WORLD
// ============================================================

function clearMatterWorld() {
  if (!world) return;

  // Remove all bodies from the current Matter world.
  World.clear(world, false);

  // Clear engine state before rebuilding the world.
  Engine.clear(engine);
}

// ============================================================
// CREATE STAR
// ============================================================

function createStar() {
  // Keep the star away from the center where the ship starts.
  const pos = randomSafePosition(100, STAR_RADIUS);

  const body = Bodies.circle(
    pos.x,
    pos.y,
    STAR_RADIUS,                         // Collision radius.
    {
      label: "star",
      isSensor: true,           // Detect collision without physical bouncing.
      isStatic: true            // Star itself does not move.
    }
  );

  // Keep track of the star's unique ID to prevent repeated scoring.
  body.gameId = `star-${nextStarId++}`;

  World.add(world, body);
  starBodies.push(body);
}

// ============================================================
// CREATE PLANET
// ============================================================

function updatePlanetSpawns() {
  // Only one planet may exist at a time.
  if (
    planetBodies.length === 0 &&            // check if any planets exist
    millis() >= nextPlanetSpawnTime         // check if it's time to spawn a new planet
  ) {
    let planetIndex = floor(random(0, 3));  // Randomly choose planet image 0, 1, or 2.
    createPlanet(planetIndex);
  }
}

function createPlanet(index) {
  const pos = randomSafePosition(130, PLANET_RADIUS);

  const body = Bodies.circle(
    pos.x,
    pos.y,
    PLANET_RADIUS,                         // Collision radius.
    {
      label: `planet-${index}`,
      isStatic: true,           // Planets do not move.
      restitution: 0.1          // Small bounce if the ship hits the planet.
    }
  );

  // Custom properties make it easier to identify the planet.
  body.gameId = `planet-${index}`;
  body.planetIndex = index;

  World.add(world, body);
  planetBodies.push(body);
}

// ============================================================
// CREATE ASTEROID
// ============================================================

// Helper function for create asteroid
// When asteroid is replaced, it appears from a different side
// 0 = left, 1 = right, 2 = top, 3 = bottom
function chooseAsteroidEntrySide(previousSide) {
  let side = floor(random(4));

  while (side === previousSide) {
    side = floor(random(4));
  }

  return side;
}

// Helper function for remove asteroid
function removeAsteroid(body) {
  World.remove(world, body);

  asteroidBodies = asteroidBodies.filter(
    asteroid => asteroid !== body
  );

  collisionCooldown.delete(body.gameId);

  // Replace the asteroid using a different entry boundary.
  createAsteroid(body.asteroidId, body.entrySide);
}

// Create Asteroid
function createAsteroid(id, previousEntrySide = -1) {
  const side = chooseAsteroidEntrySide(previousEntrySide);
  const margin = ASTEROID_RADIUS + 5;

  let start;
  let target;

  // 0 = left, 1 = right, 2 = top, 3 = bottom
  if (side === 0) {
    // Enter from left and exit right.
    start = {
      x: -margin,
      y: random(100, height - margin)
    };

    target = {
      x: width + margin,
      y: random(100, height - margin)
    };
  } else if (side === 1) {
    // Enter from right and exit left.
    start = {
      x: width + margin,
      y: random(100, height - margin)
    };

    target = {
      x: -margin,
      y: random(100, height - margin)
    };
  } else if (side === 2) {
    // Enter from top and exit bottom.
    start = {
      x: random(margin, width - margin),
      y: -margin
    };

    target = {
      x: random(margin, width - margin),
      y: height + margin
    };
  } else {
    // side === 3
    // Enter from bottom and exit top.
    start = {
      x: random(margin, width - margin),
      y: height + margin
    };

    target = {
      x: random(margin, width - margin),
      y: -margin
    };
  }

  const body = Bodies.circle(
    start.x,
    start.y,
    ASTEROID_RADIUS,
    {
      label: `asteroid-${id}`,
      frictionAir: 0,
      restitution: 1,
      inertia: Infinity
    }
  );

  body.gameId = `asteroid-${id}`;
  body.asteroidId = id;
  body.entrySide = side;

  // Randomly pick 1 of the astroid image
  body.asteroidIndex = floor(random(asteroidImgs.length));

  World.add(world, body);

  const dx = target.x - start.x;
  const dy = target.y - start.y;

  // Use Pythagorean Theorem to calculate travel distance between
  // start and target position
  const distance = sqrt(dx * dx + dy * dy);

  Body.setVelocity(body, {
    x: (dx / distance) * ASTEROID_SPEED,
    y: (dy / distance) * ASTEROID_SPEED
  });

  asteroidBodies.push(body);
}

// ============================================================
// CREATE SUN
// ============================================================

function createSun() {
  const pos = randomSafePosition(170, SUN_RADIUS);

  sunBody = Bodies.circle(
    pos.x,
    pos.y,
    SUN_RADIUS,                         // Collision radius.
    {
      label: "sun",
      isStatic: true,           // Sun does not move.
      restitution: 0            // No bounce when spaceship hits the sun.
    }
  );

  sunBody.gameId = "sun";

  World.add(world, sunBody);
}

// ============================================================
// p5.js DRAW LOOP
// - 60 Frame Per Second (FPS) is the default frame rate for p5.js.
// ============================================================

function draw() {
  // Check if any asset failed to load before starting the game.
  if (assetLoadError) {
    background(10, 10, 20);

    fill(255, 80, 80);
    textAlign(CENTER, CENTER);
    textSize(24);
    text("GAME CANNOT START", width / 2, height / 2 - 30);

    fill(255);
    textSize(16);
    text(assetLoadError, width / 2, height / 2 + 10);

    return;
  }

  if (gameState === "start") {
    drawStartPage();
    return;
  }

  if (gameState === "play") {
    updateGame();
    drawGame();
    return;
  }

  if (gameState === "end") {
    drawEndPage();
  }
}

// ============================================================
// GAME UPDATE
// Physics and game logic are updated here.
// ============================================================

function updateGame() {
  updateMouseMovement();

  // Keep asteroid speed and direction stable.
  keepAsteroidsStraight();

  // Keep Matter.js physics match p5.js draw loop frame rate,
  // This is necessary because p5.js draw() runs at 60 FPS, 
  // prevent Matter.js from updating at a different rate.
  Engine.update(engine, 1000 / 60);

  updateTimer();              // Update the game countdown timer.
  updatePlanetSpawns();       // Spawn planets at random intervals.
  updateAsteroidBoundaries(); // Update asteroid when reach boundary.
  
  if (timeLeft <= 0) {        // end the game when the timer reaches zero.
    endGame();
  }
}

// ============================================================
// SHIP MOVEMENT BASED ON MOUSE POSITION
// ============================================================

function updateMouseMovement() {
  // Skip if no spaceship.
  if (!shipBody) return;

  // Hold spaceship if hit asteroid for shipScaredUntil timer
  if (millis() < shipScaredUntil) {
    Body.setVelocity(shipBody, {
      x: 0,
      y: 0
    });

    return;
  }

  // Only move ship when mouse button is pressed
  if (!mouseIsPressed) {
    Body.setVelocity(shipBody, { x: 0, y: 0 });
    return;
  }

  const dx = mouseX - shipBody.position.x;
  const dy = mouseY - shipBody.position.y;

  // Use Pythagorean Theorem to calculate distance between
  // mouse and spaceship position
  const distance = sqrt(dx * dx + dy * dy);

  // Do not use distance > 0, to prevent jitter when mouse is 
  // near or on spaceship. SHIP_SIZE/2 means no ship movement
  // until mouse is outside of spaceship collision area.
  if (distance > SHIP_SIZE/2) {
    Body.setVelocity(shipBody, {
      x: (dx / distance) * SHIP_MAX_SPEED,
      y: (dy / distance) * SHIP_MAX_SPEED
    });
  } else {
    Body.setVelocity(shipBody, { x: 0, y: 0 });
  }
 
  Body.setAngularVelocity(shipBody, 0);

  // Prevent the ship from leaving the canvas.
  let x = constrain(
    shipBody.position.x,
    SHIP_SIZE / 2,
    width - SHIP_SIZE / 2
  );

  let y = constrain(
    shipBody.position.y,
    SHIP_SIZE / 2,
    height - SHIP_SIZE / 2
  );

  Body.setPosition(shipBody, { x, y });
}

// ============================================================
// ASTEROID MOVEMENT
// ============================================================

function keepAsteroidsStraight() {
  for (const asteroid of asteroidBodies) {
    // Remove any accumulated force.
    asteroid.force.x = 0;
    asteroid.force.y = 0;

    const vx = asteroid.velocity.x;
    const vy = asteroid.velocity.y;

    // Pythagorean Theorem : speed = sqrt(vx^2 + vy^2)
    const speed = sqrt(vx * vx + vy * vy);

    if (speed > 0) {
      // Keep the current direction but force a constant speed.
      Body.setVelocity(asteroid, {
        x: (vx / speed) * ASTEROID_SPEED,
        y: (vy / speed) * ASTEROID_SPEED
      });
    }
  }
}

// Helper function for update asteroid when it reaches boundary
function updateAsteroidBoundaries() {
  // ... = flatten nested arrays of asteroidBodies
  for (const asteroid of [...asteroidBodies]) {
    const radius = asteroid.circleRadius || ASTEROID_RADIUS;
    let hasExited = false;

    if (asteroid.entrySide === 0 && asteroid.position.x > width + radius) {
      hasExited = true;
    }

    if (asteroid.entrySide === 1 && asteroid.position.x < -radius) {
      hasExited = true;
    }

    if (asteroid.entrySide === 2 && asteroid.position.y > height + radius) {
      hasExited = true;
    }

    if (asteroid.entrySide === 3 && asteroid.position.y < -radius) {
      hasExited = true;
    }

    if (hasExited) {
      removeAsteroid(asteroid);
    }
  }
}

// ============================================================
// TIMER
// ============================================================

function updateTimer() {
  // Calculate how many whole seconds have passed.
  const elapsed = floor((millis() - gameStartMillis) / 1000);

  // Never allow the timer to become negative.
  timeLeft = max(0, GAME_TIME - elapsed);
}

function formatTime(seconds) {
  const minutes = floor(seconds / 60);
  const secs = seconds % 60;

  // Example: 9 seconds becomes "0:09".
  return `${minutes}:${String(secs).padStart(2, "0")}`;
}

// ============================================================
// MATTER COLLISION EVENTS
// ============================================================

function setupCollisionEvents() {
  Matter.Events.on(engine, "collisionStart", function(event) {
    for (const pair of event.pairs) {
      const bodyA = pair.bodyA;
      const bodyB = pair.bodyB;

      // Check both directions because either body can be A or B.
      handleCollision(bodyA, bodyB);
      handleCollision(bodyB, bodyA);
    }
  });
}

function handleCollision(a, b) {
  // If game not in play, skip.
  if (gameState !== "play") return;

  // Handle ship collisons with stars, planets, asteroids, and sun.
  if (a.label === "ship") {
    if (b.label === "star") {
      collectStar(b);
    } else if (b.label.startsWith("planet-")) {
      landOnPlanet(b);
    } else if (b.label.startsWith("asteroid-")) {
      hitAsteroid(b);
    } else if (b.label === "sun") {
      hitSun(b);
    }

    return;
  }

  // Handle asteroid collisions with stars, planets, and the sun.
  if (a.label.startsWith("asteroid-")) {
    if (b.label === "star") {
      collectStar(b);
      removeAsteroid(a);
    } else if (b.label.startsWith("planet-")) {
      landOnPlanet(b);
      removeAsteroid(a);
    } else if (b.label === "sun") {
      hitSun(b);
      removeAsteroid(a);
    }
  }
}

// ============================================================
// COLLISION SCORE COOLDOWN
// - Prevents rapid repeated scoring from the same object.
// ============================================================

function canScore(id) {
  const now = millis();

  // First collision with this object is allowed immediately.
  if (!collisionCooldown.has(id)) {
    collisionCooldown.set(id, now);
    return true;
  }

  // Allow another score after 800 ms.
  if (now - collisionCooldown.get(id) > COLLISION_COOLDOWN) {
    collisionCooldown.set(id, now);
    return true;
  }

  return false;
}

// ============================================================
// COLLECT STAR
// ============================================================

function collectStar(body) {
  const id = body.gameId;

  // A star can only be collected once.
  if (collectedObjects.has(id)) return;

  collectedObjects.add(id);
  score += STAR_POINTS;

  // Remove the star from the physics world.
  World.remove(world, body);

  // Remove it from the drawing array as well.
  starBodies = starBodies.filter(item => item !== body);

  // Immediately replace the collected star.
  createStar();
}

// ============================================================
// PLANET / ASTEROID / SUN SCORE
// ============================================================

function landOnPlanet(body) {
  if (!canScore(body.gameId)) return;

  score += PLANET_POINTS;

  // Rmove planet from Matter physics world and p5.js drawing array.
  World.remove(world, body);

  planetBodies = planetBodies.filter(item => item !== body);

  collisionCooldown.delete(body.gameId);

  // Schedule the next planet 5–15 seconds later.
  nextPlanetSpawnTime = millis() + random(5000, 15000);
}

function hitAsteroid(body) {
  if (canScore(body.gameId)) {
    // Prevent Score to go negative
    score = Math.max(0, score + ASTEROID_POINTS);
  }

  // Briefly stop the ship when hit.
  shipScaredUntil = millis() + 600;

  removeAsteroid(body);
}

function hitSun(body) {
  if (!canScore(body.gameId)) return;

  // Prevent Score to go negative
  score = Math.max(0, score + SUN_POINTS);

  // Remove the sun from Matter physics world and p5.js drawing array.
  World.remove(world, body);

  sunBody = null;

  collisionCooldown.delete(body.gameId);

  // Immediately replace the sun at another safe location.
  createSun();
}

// ============================================================
// GAME START / END / RESTART
// ============================================================

function startGame() {
  createGameWorld();

  // Record game-start time.
  gameStartMillis = millis();

  gameState = "play";
}

function endGame() {
  // Game mode should be in "play" to transition to "end" mode.
  // Skip if the game is not in "play" mode.
  if (gameState !== "play") return;

  gameState = "end";

  // Stop the ship when the timer reaches zero.
  Body.setVelocity(shipBody, { x: 0, y: 0 });
  Body.setAngularVelocity(shipBody, 0);
}

function restartGame() {
  createGameWorld();

  gameStartMillis = millis(); // Reset the game timer.

  gameState = "play";
}

// ============================================================
// START PAGE
// ============================================================

function drawStartPage() {
  drawSpaceBackground();

  push();

  textAlign(CENTER, CENTER);

  fill(255);
  textSize(min(width, height) * 0.08);
  textStyle(BOLD);
  text("SPACE TRAVEL", width / 2, height * 0.35);

  textStyle(NORMAL);
  textSize(18);
  fill(220, 230, 255);

  drawButton(
    width / 2,
    height * 0.5,
    220,                        // Button width.
    60,                         // Button height.
    "START GAME"
  );

  text(
    "Move mouse to fly through space",
    width / 2,
    height * 0.6
  );

  pop();
}

// ============================================================
// GAME DRAWING
// ============================================================

function drawGame() {
  drawSpaceBackground();

  // Draw order matters:
  // background first, objects next, interface last.
  drawSun();
  drawPlanets();
  drawAsteroids();
  drawStars();
  drawShip();

  drawTopBar();
}

// ============================================================
// SPACE BACKGROUND
// ============================================================

function drawSpaceBackground() {
  const img = bgImages[selectedBackground];

  imageMode(CORNER);

  // Cover the entire canvas while keeping the image's aspect ratio.
  const scale = max(width / img.width, height / img.height);
  const w = img.width * scale;
  const h = img.height * scale;

  image(
    img,
    (width - w) / 2,
    (height - h) / 2,
    w,
    h
  );

  // Dark overlay keeps white UI text readable.
  push();
  noStroke();
  fill(0, 0, 20, 75);         // Last value = 75% transparency.
  rect(0, 0, width, height);  // Just a simple rectangle cover entire canvas.
  pop();
}

// ============================================================
// DRAW IMAGE PRESERVE ASPECT RATIO (HELPER FUNCTION)
// ============================================================

function drawImagePreserveAspect(img, x, y, maxSize) {
  const scale = maxSize / max(img.width, img.height);

  image(
    img,
    x,
    y,
    img.width * scale,
    img.height * scale
  );
}

// ============================================================
// TOP INFORMATION BAR
// ============================================================

function drawTopBar() {
  push();

  noStroke();
  fill(0, 0, 20, 190);
  rect(0, 0, width, 70);

  // Game title.
  textAlign(LEFT, CENTER);
  fill(255);
  textStyle(BOLD);
  textSize(22);
  text("SPACE TRAVEL", 25, 35);

  // Timer.
  textAlign(CENTER, CENTER);
  textSize(24);

  // Make the timer easier to notice during the final 10 seconds.
  fill(timeLeft <= 10 ? 255 : 220);
  text(formatTime(timeLeft), width / 2, 35);

  // Score.
  textAlign(RIGHT, CENTER);
  fill(255);
  text(`SCORE: ${score}`, width - 25, 35);

  pop();
}

// ============================================================
// DRAW SPACESHIP
// ============================================================

function drawShip() {
  if (!shipBody) return;

  push();
  imageMode(CENTER);

  // spaceship image = 300x116
  drawImagePreserveAspect(
    shipImg,
    shipBody.position.x,
    shipBody.position.y,
    SHIP_SIZE * 1.7
  );
  pop();
}

// ============================================================
// DRAW STAR
// ============================================================

function drawStars() {
  for (const body of starBodies) {
    push();
    imageMode(CENTER);
    translate(body.position.x, body.position.y);
    rotate(frameCount * 0.03);      // Slowly rotate the star for animation effect.
    
    // star image = 100x100
    drawImagePreserveAspect(
      starImg,
      0,
      0,
      42
    );
    pop();
  }
}

// ============================================================
// DRAW PLANETS
// ============================================================

function drawPlanets() {
  for (const body of planetBodies) {
    push();
    imageMode(CENTER);

    // Planet 1 = 200x205
    // Planet 2 = 200x200
    // Planet 3 = 200x198
    drawImagePreserveAspect(
      planetImgs[body.planetIndex],
      body.position.x,
      body.position.y,
      100
    );
    pop();
  }
}

// ============================================================
// DRAW ASTEROIDS
// ============================================================

function drawAsteroids() {
  for (const body of asteroidBodies) {
    push();
    imageMode(CENTER);

    translate(body.position.x, body.position.y);
    rotate(atan2(body.velocity.y, body.velocity.x) - HALF_PI/2);

    // asteroid 1 = 200x133
    // asteroid 2 = 200x151
    drawImagePreserveAspect(
      asteroidImgs[body.asteroidIndex],
      0,
      0,
      55
    );
    pop();
  }
}

// ============================================================
// DRAW SUN
// ============================================================

function drawSun() {
  if (!sunBody) return;
 
  push();
  imageMode(CENTER);

  // sun image = 300x296
  drawImagePreserveAspect(
    sunImg,
    sunBody.position.x,
    sunBody.position.y,
    140
  );
  pop();
}

// ============================================================
// END PAGE
// ============================================================

function drawEndPage() {
  drawSpaceBackground();

  push();

  textAlign(CENTER, CENTER);

  fill(255);
  textStyle(BOLD);
  textSize(min(width, height) * 0.08);
  text("TIME'S UP", width / 2, height * 0.32);

  textStyle(NORMAL);
  textSize(22);
  fill(210, 220, 245);
  text("FINAL SCORE", width / 2, height * 0.47);

  textStyle(BOLD);
  textSize(64);
  fill(255);
  text(score, width / 2, height * 0.56);

  textStyle(NORMAL);
  textSize(18);
  fill(190, 200, 225);

  text(
    "Click RESTART to play again",
    width / 2,
    height * 0.67
  );

  drawButton(
    width / 2,
    height * 0.78,
    220,
    60,
    "RESTART"
  );

  pop();
}

// ============================================================
// BUTTON
// ============================================================

function drawButton(x, y, w, h, label) {
  push();

  rectMode(CENTER);
  noStroke();

  // Check whether the mouse is currently over the button.
  const hovering =
    mouseX > x - w / 2 &&
    mouseX < x + w / 2 &&
    mouseY > y - h / 2 &&
    mouseY < y + h / 2;

  // Change button appearance on hover.
  if (hovering) {
    fill(80, 120, 255, 230);
  } else {
    fill(40, 70, 150, 220);
  }

  rect(x, y, w, h, 12);

  fill(255);
  textAlign(CENTER, CENTER);
  textStyle(BOLD);
  textSize(18);
  text(label, x, y);

  pop();
}

// ============================================================
// MOUSE INPUT
// - only for the start and end pages, not during gameplay.
// ============================================================

function mousePressed() {
  if (gameState === "start") {
    // Start button bounds:
    // 220 wide x 60 high, centered at 60% canvas height.
    if (
      mouseX > width / 2 - 110 &&
      mouseX < width / 2 + 110 &&
      mouseY > height * 0.5 - 30 &&
      mouseY < height * 0.5 + 30
    ) {
      startGame();
    }
  } else if (gameState === "end") {
    // Restart button bounds.
    if (
      mouseX > width / 2 - 110 &&
      mouseX < width / 2 + 110 &&
      mouseY > height * 0.78 - 30 &&
      mouseY < height * 0.78 + 30
    ) {
      restartGame();
    }
  }
}

// ============================================================
// RANDOM SAFE POSITION
// Keeps objects away from the starting ship position.
// ============================================================

function randomSafePosition(minDistanceFromCenter, objectRadius) {
  let pos;

  // try 100 times to find a safe position that does not overlap with existing objects.
  for (let attempts = 0; attempts < 100; attempts++) {
    pos = {
      x: random(objectRadius + EDGE_PADDING, width - objectRadius - EDGE_PADDING), 
      y: random(objectRadius + 80, height - objectRadius - EDGE_PADDING)    // 80 = leave space for the top bar.
    };

    // Keep the object away from the ship's starting location (center).
    if (
      dist(
        pos.x,
        pos.y,
        width / 2,
        height / 2
      ) < minDistanceFromCenter
    ) {
      continue;
    }

    // "..." = Spread operator to combine all existing bodies into one array.
    // i.e. starBodies = [star1, star2, star3]
    //      planetBodies = [planet1]
    //      asteroidBodies = [asteroid1, asteroid2]
    // This is to "flatten" the arrays into a single array of all existing bodies
    // from nested arrays.
    // ref: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Spread_syntax

    const existingBodies = [
      shipBody,
      ...starBodies,
      ...planetBodies,
      ...asteroidBodies,
      sunBody
    ].filter(body => body);

    // Check if the new object overlaps with any existing objects.
    let overlapsAnotherObject = false;

    for (const body of existingBodies) {
      // all game objects are circles, so we can use their circleRadius for collision detection.
      // console.log(body);
      const otherRadius = body.circleRadius || 0; // Use 0 if the body has no circleRadius.

      const requiredDistance =                    // Minimum distance to avoid overlap.
        objectRadius + otherRadius + OBJECT_GAP;

      // use p5.js dist() function to calculate the distance between two points.
      // dist(x1, y1, x2, y2)
      if (
        dist(                  
          pos.x,
          pos.y,
          body.position.x,
          body.position.y
        ) < requiredDistance
      ) {
        overlapsAnotherObject = true;   // once a overlap found, we can stop checking other objects.
        break;
      }
    }

    if (!overlapsAnotherObject) {       // If no overlap found, return the "safe" position.
      return pos;
    }
  }

  // Fallback to a random position.
  return {
    x: floor(random(50, width - 50)),   // 50 = leave space for the left/right boundary.
    y: floor(random(100, height - 50))  // 100 = leave space for the top bar and bottom boundary.
  };
}

// ============================================================
// MATTER VELOCITY HELPER
// This keeps all Matter calls easy to find while learning.
// ============================================================

function BodySetVelocity(body, velocity) {
  // Set the object's current velocity directly.
  Body.setVelocity(body, velocity);
}

// ============================================================
// RESPONSIVE CANVAS
// ============================================================

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);

  // Keep the ship inside the visible canvas after resizing.
  if (shipBody) {
    Body.setPosition(shipBody, {
      x: constrain(shipBody.position.x, 50, width - 50),
      y: constrain(shipBody.position.y, 100, height - 50)
    });
  }
}
