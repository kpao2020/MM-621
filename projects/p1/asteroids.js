// Game health damage system
const ASTEROID_DAMAGE = 10;     // Damage to spaceship's health when hit by an asteroid.

// Game objects setting
const ASTEROID_RADIUS = 25;     // Constant asteroid collision radius.
const HEAVY_ASTEROID_MULTIPLIER = 3;
const HEAVY_ASTEROID_DAMAGE_MULTIPLIER = 5;
const ASTEROID_MIN_SPEED = 1;   // Min asteroid speed.
const ASTEROID_MAX_SPEED = 8;   // Max asteroid speed.
const HEAVY_ASTEROID_MIN_SPEED = 0.5;
const HEAVY_ASTEROID_MAX_SPEED = 1;
const START_ASTEROIDS = 2;      // Initial number of asteroids when game start.

let nextAsteroidSpawnTime = 0;  // Time in millis when the next asteroid should spawn.
let nextHeavyAsteroidSpawnTime = 0;
let maxAsteroids;               // Max number of Asteroids on play screen

// Asteroids images and matter body
const ASTEROID_FILES = [
  "../../assets/images/asteroid1.png",
  "../../assets/images/asteroid2.png"
];

let asteroidImgs = [];
let asteroidBodies = [];

// ============================================================
// CREATE ASTEROID
// ============================================================

// Helper function for create asteroid.
// When asteroid is replaced, it appears from a different side.
// 0 = left, 1 = right, 2 = top, 3 = bottom.
function chooseAsteroidEntrySide(previousSide) {
  let side = floor(random(4));

  while (side === previousSide) {
    side = floor(random(4));
  }

  return side;
}

// Asteroid spawn function
function updateAsteroidSpawns() {
  // Normal asteroids increase in number as the player's score rises.
  maxAsteroids = START_ASTEROIDS + Math.floor(score / 5);
  const normalAsteroidCount = asteroidBodies.filter(
    asteroid => !asteroid.isHeavy
  ).length;

  if (
    normalAsteroidCount < maxAsteroids &&
    millis() >= nextAsteroidSpawnTime         // check if it's time to spawn a new asteroid.
  ) {
    let side = floor(random(0,4));            // Randomly pick a entry side 0, 1, 2, or 3.
    createAsteroid(0, side);
  }

  const heavyAsteroidIsActive = asteroidBodies.some(asteroid => asteroid.isHeavy);
  if (!heavyAsteroidIsActive && millis() >= nextHeavyAsteroidSpawnTime) {
    const side = floor(random(0, 4));
    createAsteroid(1, side);
  }
}

// Create Asteroid
function createAsteroid(id, entrySide) {
  const side = chooseAsteroidEntrySide(entrySide);
  const isHeavy = id === 1;
  const radius = ASTEROID_RADIUS * (isHeavy ? HEAVY_ASTEROID_MULTIPLIER : 1);
  const margin = radius + 5; // avoid asteroid to spawn on screen boundary
  
  let start;
  let travelDirection;

  // random() returns a number between 0 and 1.
  // random() < 0.5 ? -1 : 1 basically randomly determine -1 or +1.
  // travelAngle returns either -70 to -20 or +20 to +70 degrees.
  const travelAngle = random(20,70) * (random() < 0.5 ? -1 : 1);

  // 0 = left, 1 = right, 2 = top, 3 = bottom.
  if (side === 0) {
    // Enter from left.
    start = {
      x: -margin,
      y: random(radius, height - margin)
    };

    travelDirection = travelAngle;

  } else if (side === 1) {
    // Enter from right.
    start = {
      x: width + margin,
      y: random(radius, height - margin)
    };

    travelDirection = travelAngle + 180;

  } else if (side === 2) {
    // Enter from top.
    start = {
      x: random(margin, width - margin),
      y: radius
    };

    travelDirection = travelAngle + 90;

  } else {
    // side === 3
    // Enter from bottom.
    start = {
      x: random(margin, width - margin),
      y: height + margin
    };

    travelDirection = travelAngle - 90;

  }

  const body = Bodies.circle(
    start.x,
    start.y,
    radius,
    {
      label: "asteroid",
      frictionAir: 0,
      restitution: 1,
      inertia: Infinity
    }
  );

  body.gameId = `asteroid-${id}`;
  body.asteroidId = id;
  body.entrySide = side;
  body.isOnScreen = false;

  // Asteroid image 2 is the larger, slower heavy asteroid.
  body.asteroidIndex = id;
  body.isHeavy = isHeavy;
  body.asteroidDrawSize = 55 * (isHeavy ? HEAVY_ASTEROID_MULTIPLIER : 1);

  // Assign a speed based on asteroid type.
  body.asteroidSpeed = random(
    isHeavy ? HEAVY_ASTEROID_MIN_SPEED : ASTEROID_MIN_SPEED,
    isHeavy ? HEAVY_ASTEROID_MAX_SPEED : ASTEROID_MAX_SPEED
  );

  World.add(world, body);

  // cos (direction) to get x direction
  // sin (direction) to get y direction
  // velocity = direction * speed
  Body.setVelocity(body, {
    x: cos(travelDirection) * body.asteroidSpeed,
    y: sin(travelDirection) * body.asteroidSpeed
  });

  asteroidBodies.push(body);
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
      // Keep the current direction but use the assigned speed.
      // Note:
      //    vx / speed = speed in x direction
      //    vy / speed = speed in y direction
      Body.setVelocity(asteroid, {
        x: (vx / speed) * asteroid.asteroidSpeed,
        y: (vy / speed) * asteroid.asteroidSpeed
      });
    }
  }
}

// Remove and replace asteroids after they leave any canvas boundary.
function updateAsteroidBoundaries() {
  // ... = flatten nested arrays of asteroidBodies.
  for (const asteroid of [...asteroidBodies]) {
    const radius = asteroid.circleRadius || ASTEROID_RADIUS;
    const minAsteroidY = radius;

    // check if asteriod is inside the play area.
    const isInsideScreen =
      asteroid.position.x > -radius &&
      asteroid.position.x < width + radius &&
      asteroid.position.y >= minAsteroidY &&
      asteroid.position.y < height + radius;

    // mark asteroid as have entered the play area.
    if (isInsideScreen) {
      asteroid.isOnScreen = true;
    }

    // check if asteroid has left the play area.
    const hasLeftScreen =
      asteroid.position.x < -radius ||
      asteroid.position.x > width + radius ||
      asteroid.position.y < minAsteroidY ||
      asteroid.position.y > height + radius;

    if (asteroid.isOnScreen && hasLeftScreen) {
      removeAsteroid(asteroid);
    }
  }
}

// ============================================================
// HIT ASTEROID
// ============================================================

function hitAsteroid(body) {
  consecutiveStarCount = 0;

  if (canScore(body.gameId)) {
    const damage = body.isHeavy
      ? ASTEROID_DAMAGE * HEAVY_ASTEROID_DAMAGE_MULTIPLIER
      : ASTEROID_DAMAGE;
    healthLeft = max(0, healthLeft - damage);
    //console.log("health = "+healthLeft);
  }

  // Briefly stop the ship when hit.
  shipScaredUntil = millis() + (body.isHeavy ? 1000 : 600);

  // Remove Asteroid
  removeAsteroid(body);
}

// ============================================================
// REMOVE ASTEROID
// ============================================================

function removeAsteroid(body) {
  // Remove asteroid from Matter physics world and p5.js drawing array.
  World.remove(world, body);

  asteroidBodies = asteroidBodies.filter(
    asteroid => asteroid !== body
  );

  collisionCooldown.delete(body.gameId);

  if (body.isHeavy) {
    // Keep at most one heavy asteroid active and wait 5–10 seconds after it leaves play.
    nextHeavyAsteroidSpawnTime = millis() + random(5000, 10001);
  } else {
    // Schedule the next normal asteroid 0.5–2 seconds later.
    nextAsteroidSpawnTime = millis() + random(500, 2001);
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

    // rotate with a tangent to keep asteroid image to point
    // to the direction asteroid is going and offset 45 degrees
    rotate(atan2(body.velocity.y, body.velocity.x) - 45);

    // asteroid 1 = 200x133
    // asteroid 2 = 200x151
    drawImagePreserveAspect(
      asteroidImgs[body.asteroidIndex],
      0,
      0,
      body.asteroidDrawSize
    );
    pop();
  }
}
