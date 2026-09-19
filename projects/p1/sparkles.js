let sparkles=[];    // Explosion animation.

// ============================================================
// SPARKLE CLASS OBJECT
// ============================================================
class Sparkle {
  constructor(x, y) {
    this.pos = createVector(x, y);
    
    // Random direction and speed
    this.vel = p5.Vector.random2D().mult(random(2));
    
    // Fade out lifespan
    this.lifespan = 255;
  }

  update() {
    this.pos.add(this.vel);
    this.lifespan -= 5; // Fade over time
  }

  display() {
    noStroke();
    fill(250, 222, 23, this.lifespan);    // yellow sparkles and fade out
    ellipse(this.pos.x, this.pos.y, random(10));
  }

  isFinished() {
    return this.lifespan < 0;
  }
}

// ============================================================
// CREATE EXPLOSION
// ============================================================
function createExplosion(body) {
  for (let i = 0; i < 30; i++) {
    sparkles.push(new Sparkle(body.position.x, body.position.y));
  }
  // console.log("EXPLOSION CREATED:", sparkles.length);
}

// ============================================================
// DRAW SPARKLES
// ============================================================
function drawSparkles() {
  // console.log("SPARKLES",sparkles.length);

  for (let i = sparkles.length - 1; i >= 0; i--) {
    sparkles[i].update();
    sparkles[i].display();

    // console.log("display",sparkles[i]);
    if (sparkles[i].isFinished()) {
      sparkles.splice(i,1);
    }
  }
}