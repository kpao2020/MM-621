function setup() {
  createCanvas(400, 400).parent('sketch');
  background(19, 13, 48);
}

function draw() {
  if (keyIsPressed) {
    rectMode(CENTER);
    fill(119, 91, 255, 190);
    noStroke();
    rect(random(width), random(height), 50, 100);
  } else {
    background(19, 13, 48);
  }
}
