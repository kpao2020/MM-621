// Game scoring system
const PLANET_POINTS = 5;        // Score for landing on a planet.

// Game objects setting
const PLANET_RADIUS = 45;       // Constant planet collision radius.
let nextPlanetSpawnTime = 0;    // Time in millis when the next planet should spawn.

// Planets images and matter body
const PLANET_FILES = [
  "../../images/planet1.png",
  "../../images/planet2.png",
  "../../images/planet3.png"
];

let planetImgs = [];            // Planets images array
let planetBodies = [];          // Planets matter bodies array

// ============================================================
// CREATE PLANET
// ============================================================

// Planet spawn function
function updatePlanetSpawns() {
  // Only one planet may exist at a time.
  if (
    planetBodies.length === 0 &&            // check if any planets exist.
    millis() >= nextPlanetSpawnTime         // check if it's time to spawn a new planet.
  ) {
    let planetIndex = floor(random(0, 3));  // Randomly choose planet image 0, 1, or 2.
    createPlanet(planetIndex);
  }
}

// Planet matter bodies
function createPlanet(index) {
  const pos = randomSafePosition(130, PLANET_RADIUS);

  const body = Bodies.circle(
    pos.x,
    pos.y,
    PLANET_RADIUS,              // Collision radius.
    {
      label: "planet",
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
// LAND ON PLANET
// ============================================================

function landOnPlanet(body) {
  // Prevent rapid score
  if (!canScore(body.gameId)) return;

  score += PLANET_POINTS;   // update score

  // Remove Planet
  removePlanet(body);
}

// ============================================================
// REMOVE PLANET
// ============================================================

function removePlanet(body) {
  // Remove planet from Matter physics world.
  World.remove(world, body);

  // Remove planet from p5.js drawing array.
  planetBodies = planetBodies.filter(item => item !== body);

  collisionCooldown.delete(body.gameId);

  // Schedule the next planet 5–15 seconds later.
  nextPlanetSpawnTime = millis() + random(5000, 15001);
}

// ============================================================
// DRAW PLANETS
// ============================================================

// p5.js Planets visual drawing
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