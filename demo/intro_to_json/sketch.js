let data;

// p5.js v1
function preload() {
  data = loadJSON('birds.json');
}

function setup() {
  createCanvas(500, 500);
}

function draw() {
  background(0);

  // call and use the data following the root directory path
  let bird = data.birds[1].members[2];

  fill(255);
  textSize(32);
  text(bird, 15, 200);
}