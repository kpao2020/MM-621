// Game health damage system
const SUN_DAMAGE = 20;          // Damage to spaceship's health when hitting the sun.

// Game objects setting
const SUN_RADIUS = 65;          // Constant sun collision radius.
let nextSunSpawnTime = 0;       // Time in millis when the next sun should spawn.

// Sun image and matter body
const SUN_FILE = "../../images/sun.png";
let sunImg;
let sunBody;

// ============================================================
// CREATE SUN
// ============================================================

// Sun spawn function
function updateSunSpawns() {
  // Only one sun may exist at a time.
  if (
    sunBody == null &&                      // check if any sun exist.
    millis() >= nextSunSpawnTime            // check if it's time to spawn a new sun.
  ) {
    createSun();
  }
}

function createSun() {
  const pos = randomSafePosition(170, SUN_RADIUS);

  sunBody = Bodies.circle(
    pos.x,
    pos.y,
    SUN_RADIUS,                 // Collision radius.
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
// HIT SUN
// ============================================================

function hitSun(body) {
  if (!canScore(body.gameId)) return;

  // Prevent Health to go negative
  healthLeft = max(0, healthLeft - SUN_DAMAGE);
  //console.log("health = "+healthLeft);

  // Briefly stop the ship when hit.
  shipScaredUntil = millis() + 1000;

  // Remove Sun
  removeSun(body); 
}

// ============================================================
// REMOVE SUN
// ============================================================

function removeSun(body) {
  // Remove the sun from Matter physics world..
  World.remove(world, body);

  // Remove p5.js visual drawing.
  sunBody = null;

  collisionCooldown.delete(body.gameId);

  // Schedule the next sun 2–5 seconds later.
  nextSunSpawnTime = millis() + random(2000, 5001);
}

// ============================================================
// DRAW SUN
// ============================================================

function drawSun() {
  if (!sunBody) return;
 
  push();
  imageMode(CENTER);

  translate(sunBody.position.x, sunBody.position.y);
  rotate(frameCount * -0.2);      // Slowly rotate the sun for animation effect.

  // sun image = 300x296
  drawImagePreserveAspect(
    sunImg,
    0,
    0,
    140
  );
  pop();
}
