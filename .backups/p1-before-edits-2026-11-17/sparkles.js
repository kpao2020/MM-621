let sparkles=[];    // Explosion animation.

// ============================================================
// SPARKLE CLASS OBJECT
// ============================================================
class Sparkle {
  constructor(x, y, c) {
    this.pos = createVector(x, y);
    
    // Random direction and speed
    this.vel = p5.Vector.random2D().mult(random(2));
    
    // Fade out lifespan
    this.lifespan = 255;

    this.c = c;
  }

  update() {
    this.pos.add(this.vel);
    this.lifespan -= 5; // Fade over time
  }

  display() {
    noStroke();
    this.c.setAlpha(this.lifespan);
    fill(this.c);    // green, yellow or red sparkles and fade out
    ellipse(this.pos.x, this.pos.y, random(10));
  }

  isFinished() {
    return this.lifespan < 0;
  }
}

// ============================================================
// CREATE EXPLOSION
// ============================================================
function createExplosion(body, c) {
  let col = c == "g" ? color('#50AE53') : (c == "y" ? color('#FADE17') : color('#FF474C'));
  for (let i = 0; i < 30; i++) {
    sparkles.push(new Sparkle(body.position.x, body.position.y, col));
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