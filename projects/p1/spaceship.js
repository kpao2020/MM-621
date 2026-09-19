// Game health system
const SHIP_HEALTH = 100;        // Total Spaceship's health.

// Game objects setting
const SHIP_SIZE = 80;           // Matter collision diameter for the spaceship.
const SHIP_MAX_SPEED = 10;      // Max spaceship speed.

// Spaceship image and matter body
const SHIP_FILE = "../../images/spaceship.png";
let shipImg;                    // In-game spacespace image
let shipBody;                   // In-game matter spacespace body
let healthLeft = SHIP_HEALTH;   // In-game spaceship current health


// ============================================================
// CREATE SHIP
// - This is a matter.js body for spaceship,
//   which is just a simple circle for physical collision 
//   detection, and use p5.js image for the visual spaceship.
// ============================================================

function createShip() {
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
}

// ============================================================
// SHIP MOVEMENT BASED ON MOUSE POSITION
// ============================================================

function updateMouseMovement() {
  // Skip if no spaceship.
  if (!shipBody) return;

  // Keep spaceship below top bar.
  const minShipY = PLAY_AREA_TOP + SHIP_SIZE / 2;

  // Prevent the ship from leaving the canvas.
  let x = constrain(
    shipBody.position.x,
    SHIP_SIZE / 2,
    width - SHIP_SIZE / 2
  );

  let y = constrain(
    shipBody.position.y,
    minShipY,
    height - SHIP_SIZE / 2
  );

  Body.setPosition(shipBody, { x, y });

  // Stop spaceship temporarily after an asteroid or sun collision.
  if (millis() < shipScaredUntil) {
    Body.setVelocity(shipBody, {
      x: 0,
      y: 0
    });

    return;
  }

  // Only move ship when mouse button is pressed.
  if (!mouseIsPressed) {
    Body.setVelocity(shipBody, { x: 0, y: 0 });
    return;
  }

  const dx = mouseX - shipBody.position.x;
  const dy = mouseY - shipBody.position.y;

  // Use Pythagorean Theorem to calculate distance between
  // mouse and spaceship position.
  const distance = sqrt(dx * dx + dy * dy);

  // Do not use distance > 0, to prevent jitter when mouse is 
  // near or on spaceship. SHIP_SIZE/2 means no ship movement
  // until mouse is outside of spaceship collision area.
  // Note:
  //   dx / distance = (percentage) how fast should spaceship travel on x direction
  //   dy / distance = (percentage) how fast should spaceship travel on y direction
  if (distance > SHIP_SIZE/2) {
    Body.setVelocity(shipBody, {
      x: (dx / distance) * SHIP_MAX_SPEED,
      y: (dy / distance) * SHIP_MAX_SPEED
    });
  } else {
    Body.setVelocity(shipBody, { x: 0, y: 0 });
  }
 
  // Prevent spaceship from rotating.
  Body.setAngularVelocity(shipBody, 0);  
}

// ============================================================
// DRAW SPACESHIP 
// - p5.js visual drawing for spaceship
// ============================================================

function drawShip() {
  // if no spaceship matter body, skip visual drawing.
  if (!shipBody) return;

  // use push/pop to isolate spaceship drawing from other objects.
  push();
  imageMode(CENTER);

  // spaceship image = 300x230
  drawImagePreserveAspect(
    shipImg,
    shipBody.position.x,
    shipBody.position.y,
    SHIP_SIZE
  );
  pop();
}