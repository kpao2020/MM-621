// Game scoring system
const STAR_POINTS = 1;          // Score for collecting a star.

// Game objects setting
const STAR_RADIUS = 18;         // Constant star collision radius.

const MIN_STARS = 1;            // Min number of stars during game play.
const MAX_STARS = 3;            // Max number of stars during game play.

let nextStarId = 0;             // Unique ID for each star to prevent repeated scoring.

// Star image and matter body
const STAR_FILE = "../../images/star.png";
let starImg;
let starBodies = [];

// ============================================================
// CREATE STAR
// ============================================================

function createStar() {
  // Keep the star away from the center where the ship starts.
  const pos = randomSafePosition(100, STAR_RADIUS);

  const body = Bodies.circle(
    pos.x,
    pos.y,
    STAR_RADIUS,                // Collision radius.
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
// COLLECT STAR
// ============================================================

// Star matter body
function collectStar(body) {
  const id = body.gameId;

  // A star can only be collected once.
  if (collectedObjects.has(id)) return;

  collectedObjects.add(id);
  score += STAR_POINTS;

  // Remove star
  removeStar(body);
}

// ============================================================
// REMOVE STAR
// ============================================================

function removeStar(body) {
  // Remember how many stars before removal.
  const previousCount = starBodies.length;

  // Remove the star from the physics world.
  World.remove(world, body);

  // Remove it from the drawing array as well.
  starBodies = starBodies.filter(item => item !== body);

  // Randomly choose -1 or +1. This will give the game a
  // more randomized effect.
  const change = random() < 0.5 ? -1 : 1;

  // Keep the target count between 1 and 3.
  // original     -1 count      +1 count
  //     1            1             2
  //     2            1             3
  //     3            2             3
  const targetCount = constrain(
    previousCount + change,
    MIN_STARS,
    MAX_STARS
  );

  // Add stars until the target count is reached.
  while (starBodies.length < targetCount) {
    createStar();
  }
}

// ============================================================
// DRAW STAR
// ============================================================

// p5.js Star visual drawing
function drawStars() {
  for (const body of starBodies) {
    push();
    imageMode(CENTER);
    translate(body.position.x, body.position.y);
    rotate(frameCount * 0.8);      // Slowly rotate the star for animation effect.
    
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