// https://docs.google.com/document/d/1FWJBvbCRL1pr6PqKjEz_af5YIGUKKbokheJSW9bFLWI/edit?tab=t.0

let x = 0;
let spaceData;

function setup() {
  createCanvas(400, 400);
  loadJSON('http://api.open-notify.org/astros.json', gotData);
}

function gotData(data) {
  console.log(data);
  spaceData = data;
}

function draw() {

  background(0);
  randomSeed(4);
  stroke(255);
  line(x, 0, x, height);
  x++;

  if (x > width) {
    x = 0;
  }


  if (spaceData) {
    for (let i = 0; i < spaceData.people.length; i++) {
      ellipse(random(width), random(height), 16);
    }
  }
}
