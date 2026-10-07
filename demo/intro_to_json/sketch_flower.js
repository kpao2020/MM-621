let flower;

async function setup() {
  createCanvas(500, 500);

  flower = await loadJSON("flower.json");
}

function draw() {
  background(0);

  fill(flower.r, flower.g, flower.b);
  textSize(24);
  textAlign(CENTER, CENTER)
  text(flower.name, width/2, height/2);
}
