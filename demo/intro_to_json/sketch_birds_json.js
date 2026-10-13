let data;   // declare a variable to hold the JSON data
let birds;  // declare a variable to hold the birds array from the JSON data

// p5.js v1
function preload() {
  data = loadJSON('../../assets/data/birds.json');  // preload the JSON data
}

function setup() {
  birds = data.birds;  // initialize the birds array from the JSON data

  // Size the canvas from the amount of text so larger groups do not overlap.
  let contentHeight = 20;
  for (let bird of birds) {
    contentHeight += 32 + bird.members.length * 20 + 20;
  }
  createCanvas(400, contentHeight);
}

function draw() {
  background(0);

  // Keep one y-position for the whole list. This accounts for each group's
  // heading and all of its members before starting the next group.
  let y = 35;

  for (let i = 0; i < birds.length; i++) {
    fill(255);
    textSize(32);
    text(birds[i].family, 15, y);
    y += 32;

    let members = birds[i].members;
    for (let j = 0; j < members.length; j++) {
      textSize(10);
      text(members[j], 30, y);
      y += 20;
    }

    y += 20; // spacing before the next family
  }
}
