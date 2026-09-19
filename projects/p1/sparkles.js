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
    fill(250, 222, 23, this.lifespan);
    ellipse(this.pos.x, this.pos.y, random(10));
  }

  isFinished() {
    return this.lifespan < 0;
  }
}