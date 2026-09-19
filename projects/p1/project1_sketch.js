/*
  Name: Ken Pao
  Class: MM-621
  Project: Space Travel
  
  Description: 
    Space Travel is a simple 2D game where the player controls a spaceship to collect stars, 
    land on planets, while trying to avoid asteroids and the sun. 
    The game uses p5.js for rendering graphics and Matter.js for physics simulation.

    - p5.js      = drawing, images, user interface, mouse input
    - Matter.js  = physics bodies, movement, and collision detection
    - Pythagorean Theorem is used to calculate distance between mouse position and spaceship
                   which is then used to set spaceship's velocity
    - Array filter is used to update an array elements with condition
    - Spread syntax is used to flatten a nested arrays, which is very useful on function
                   updateAsteroidBoundaries() and randomSafePosition()
    - Explosion animation is to enhance visual effect when something collided.
    - try to keep things simple and intend to NOT implement sound effects.

  Note: This project is intended for educational purposes
        in the context of the MM-621 class project.

  Credits:
    - Adobe Stock Images for all images used in this game.

  References:
    - P5.js: https://p5js.org/reference/
    - Matter.js: https://brm.io/matter-js/docs/
    - Coding Train Matter.js: https://www.youtube.com/watch?v=urR596FsU68
    - Matter Collision: https://stackoverflow.com/questions/45281577/matter-js-event-pairs-array-is-blank-on-collision
    - Pythagorean Theorem: https://gamedev.stackexchange.com/questions/60078/how-do-i-calculate-speed-given-x-y-components-of-a-velocity-vector
    - Array Filter: https://www.youtube.com/watch?v=4_iT6EGkQfk
    - Spread syntax: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Spread_syntax
    - Explosion animation: https://www.youtube.com/watch?v=YPKidHmretc&t=10s
*/

// ============================================================
// GAME VARIABLES
// - use const to avoid accidental changes to these values.
// ============================================================

const OBJECT_GAP = 25;          // Extra spacing between objects. (avoid overlap)
const EDGE_PADDING = 30;        // Edge padding prevent objects create on canvas edge.
const COLLISION_COOLDOWN = 800; // Cooldown timer in (0.8 sec) before the same object can score again.

let shipScaredUntil = 0;        // Hold time in millis when spaceship hit asteroid or sun.

// ============================================================
// ASSET FILES
// ============================================================

const BG_FILES = [
  "../../images/bg1.jpg",
  "../../images/bg2.jpg",
  "../../images/bg3.jpg"
];

const LOGO_FILE = "../../images/spacetravel_logo.png";
const ICON_FILE = "../../images/spaceship_icon.png";

// ============================================================
// IMAGE VARIABLES
// - Assets are filled during async setup() for p5.js v2
// ============================================================

let bgImages = [];

let logoImg;
let iconImg;

let assetLoadError = null;

// ============================================================
// MATTER.JS VARIABLES
// ============================================================

let Engine = Matter.Engine,   // Alias Engine
    World = Matter.World,     // Alias World
    Body = Matter.Body,       // Modify existing body objects
    Bodies = Matter.Bodies;   // Create new body objects

let engine;
let world;

// ============================================================
// GAME STATE
// "start" = game-start screen
// "play"  = game-play screen
// "end"   = game-over screen
// ============================================================

const TOP_BAR_HEIGHT = 70;
const TOP_BAR_GAP = 10;
const PLAY_AREA_TOP = TOP_BAR_HEIGHT + TOP_BAR_GAP;
const BUTTON_WIDTH = 220;
const BUTTON_HEIGHT = 60;

let StartButtonX;
let StartButtonY;
let EndButtonX;
let EndButtonY;

let gameState = "start";

let score = 0;

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
  logoImg = await loadOptionalImage(LOGO_FILE, "spacetravel_logo.png");
  iconImg = await loadOptionalImage(ICON_FILE, "spaceship_icon.png");
  starImg = await loadOptionalImage(STAR_FILE, "star.png");
  sunImg = await loadOptionalImage(SUN_FILE, "sun.png");
}

// ============================================================
// p5.js SETUP
// ============================================================

async function setup() {
  // Use browser window width for responsive design.
  createCanvas(windowWidth, windowHeight);

  // Use degree mode
  angleMode(DEGREES);

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

  // Use News Gothic text style for the user interface.
  textFont("News Gothic");
  stroke('#FFE81F');

  StartButtonX = width/2;
  StartButtonY = height * 0.5;
  EndButtonX = width/2;
  EndButtonY = height * 0.7;
}

// ============================================================
// CREATE / RESET GAME WORLD
// ============================================================

function createGameWorld() {
  // Clear Matter bodies before starting a new game.
  clearMatterWorld();

  // Clear matter.js body variables and initialize game variables.
  starBodies = [];
  planetBodies = [];
  asteroidBodies = [];
  sunBody = null;

  score = 0;
  maxAsteroids = START_ASTEROIDS;
  healthLeft = SHIP_HEALTH;

  collectedObjects.clear();
  collisionCooldown.clear();

  // Pick one of the available background images at random.
  selectedBackground = floor(random(bgImages.length));

  // ----------------------------------------------------------
  // GAME OBJECTS
  // ----------------------------------------------------------

  // Create Spaceship
  createShip();

  // Create 1 to 3 stars randomly.
  const starCount = floor(random(MIN_STARS, MAX_STARS+1)); 

  for (let i = 0; i < starCount; i++) {
    createStar();
  }

  // Create 1 planet randomly between 5 to 15 seconds.
  nextPlanetSpawnTime = millis() + random(5000, 15001);
  
  // Create 1-2 asteroid randomly between 1 to 3 seconds.
  nextAsteroidSpawnTime = millis() + random(1000, 3001);

  // Create 1 sun randomly between 2 to 5 seconds.
  nextSunSpawnTime = millis() + random(2000, 5001);

  // Initialize explosion animation
  sparkles=[];
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

  // Game State to draw respective game page
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

  updatePlanetSpawns();       // Spawn planet at random intervals.
  updateAsteroidSpawns();     // Spawn asteroid at random intervals.
  updateSunSpawns();          // Spawn sun at random intervals.
  updateAsteroidBoundaries(); // Update asteroid when reach boundary.

  if (healthLeft <= 0) {      // end the game when health reaches zero.
    endGame();
  }
}

// ============================================================
// MATTER COLLISION EVENTS
// "collisionStart" is a matter.js event when 2 bodies started
// to collide
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

  // Handle ship collisions with stars, planets, asteroids, and sun.
  if (a.label === "ship") {
    createExplosion(a);
    if (b.label === "star") {
      collectStar(b);
    } else if (b.label === "planet") {
      landOnPlanet(b);
    } else if (b.label === "asteroid") {
      hitAsteroid(b);
    } else if (b.label === "sun") {
      hitSun(b);
    }

    return;
  }

  // Handle asteroid collisions with stars, planets, and the sun.
  if (a.label === "asteroid") {
    createExplosion(b);
    if (b.label === "star") {
      removeStar(b);
      removeAsteroid(a);
    } else if (b.label === "planet") {
      removePlanet(b);
      removeAsteroid(a);
    } else if (b.label === "sun") {
      removeSun(b);
      removeAsteroid(a);
    }
    // else if (b.label === "asteroid") {
    //   removeAsteroid(b);
    //   removeAsteroid(a);
    // }
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
// GAME START / END / RESTART
// ============================================================

function startGame() {
  createGameWorld();
  gameState = "play";
}

function endGame() {
  // Game mode should be in "play" to transition to "end" mode.
  // Skip if the game is not in "play" mode.
  if (gameState !== "play") return;

  gameState = "end";

  // Stop the ship when the health reaches zero.
  Body.setVelocity(shipBody, { x: 0, y: 0 });
  Body.setAngularVelocity(shipBody, 0);
}

function restartGame() {
  createGameWorld();
  gameState = "play";
}

// ============================================================
// START PAGE
// ============================================================

function drawStartPage() {
  drawSpaceBackground();

  push();

  textAlign(CENTER, CENTER);

  fill("#FFE81F");
  textSize(min(width, height) * 0.08);
  textStyle(BOLD);
  text("Space Travel", width / 2, height * 0.35);
  textStyle(NORMAL);
  textSize(20);

  drawButton(
    StartButtonX,
    StartButtonY,
    BUTTON_WIDTH,                        
    BUTTON_HEIGHT,                        
    "START GAME"
  );

  text(
    "Move mouse to fly through space\n\n\
    Earn points: stars, planets\n\
    Health reduced: asteroids, sun",
    width / 2,
    height * 0.65
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
  drawSun();        // display sun
  drawPlanets();    // display planet
  drawAsteroids();  // display asteroids
  drawStars();      // display starts
  drawShip();       // display spaceship
  drawSparkles(); // display sparkles

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

  // fill(red, green, blue, alpha "opacity/transparency");
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

  // fill(red, green, blue, alpha "opacity/transparency");
  fill(0, 0, 20, 190);
  rect(0, 0, width, TOP_BAR_HEIGHT);

  // Game title.
  textAlign(LEFT, CENTER);
  fill("#FFE81F");
  textStyle(BOLD);
  textSize(22);
  text("Space Travel", 25, 35);

  image(logoImg,150,10);

  // Health Bar
  image(iconImg, width/2-SHIP_HEALTH + 10, 30);

  // Health Bar background
  fill(100);
  rect(width/2 - SHIP_HEALTH/2, 25, SHIP_HEALTH, 20, 5);

  // Make the health bar easier to notice during the final 20%.
  // Note: 
  //    fill(healthLeft <= 20 ? '#FF0055' : 'lightgreen');
  //
  //      is short hand for
  //
  //        if (healthLeft <= 20) {
  //            fill('#FF0055');    // red
  //        } else {
  //            fill('lightgreen');   // light green
  //        }

  fill(healthLeft <= 20 ? '#FF0055' : 'lightgreen');
  rect(width/2 - SHIP_HEALTH/2, 25, healthLeft, 20, 5);
  //text("Spaceship Health: "+ healthLeft, width/2, 35);

  // Score.
  textAlign(RIGHT, CENTER);
  fill("#FFE81F");
  text(`Score: ${score}`, width - 25, 35);

  pop();
}

// ============================================================
// END PAGE
// ============================================================

function drawEndPage() {
  drawSpaceBackground();

  push();

  textAlign(CENTER, CENTER);

  fill("#FFE81F");
  textStyle(BOLD);
  textSize(min(width, height) * 0.08);
  text("Game Over", width / 2, height * 0.32);

  textStyle(NORMAL);
  textSize(28);
  text("Final Score", width / 2, height * 0.47);

  textStyle(BOLD);
  textSize(64);
  text(score, width / 2, height * 0.56);

  textStyle(NORMAL);
  textSize(20);

  drawButton(
    EndButtonX,
    EndButtonY,
    BUTTON_WIDTH,
    BUTTON_HEIGHT,
    "RESTART"
  );

  text(
    "Click RESTART to play again",
    width / 2,
    height * 0.8
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

    // fill(red, green, blue, alpha "opacity/transparency");
    fill(80, 120, 255, 230);
  } else {
    fill(40, 70, 150, 220);
  }

  // rect(x, y, width, height, cornerRadius);
  rect(x, y, w, h, 12);

  fill("#FFE81F");
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
    // 220 wide x 60 high, centered at 50% canvas height.
    if (
      mouseX > StartButtonX - (BUTTON_WIDTH/2) &&
      mouseX < StartButtonX + (BUTTON_WIDTH/2) &&
      mouseY > StartButtonY - (BUTTON_HEIGHT/2) &&
      mouseY < StartButtonY + (BUTTON_HEIGHT/2)
    ) {
      startGame();
    }
  } else if (gameState === "end") {
    // Restart button bounds.
    if (
      mouseX > EndButtonX - (BUTTON_WIDTH/2) &&
      mouseX < EndButtonX + (BUTTON_WIDTH/2) &&
      mouseY > EndButtonY - (BUTTON_HEIGHT/2) &&
      mouseY < EndButtonY + (BUTTON_HEIGHT/2)
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
      y: random(PLAY_AREA_TOP + objectRadius, height - objectRadius - EDGE_PADDING)    // Keep objects below the top bar.
    };

    // Keep the object away from the ship's starting location (center).
    // dist() is a p5.js function to calculate distance between 2 points
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
    y: floor(                           // leave space for topBar
          random(
            PLAY_AREA_TOP + objectRadius,
            height - objectRadius - EDGE_PADDING
          )
       )
  };
}

// ============================================================
// RESPONSIVE CANVAS
// ============================================================

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);

  // Keep the ship inside the visible canvas after resizing.
  if (shipBody) {
    Body.setPosition(shipBody, {
      x: constrain(shipBody.position.x, SHIP_SIZE / 2, width - SHIP_SIZE /2),
      y: constrain(
            shipBody.position.y, 
            PLAY_AREA_TOP + SHIP_SIZE / 2,
            height - SHIP_SIZE / 2
         )
    });
  }

  // Update button reference when resize
  StartButtonX = width/2;
  StartButtonY = height * 0.5;
  EndButtonX = width/2;
  EndButtonY = height * 0.7;
}
