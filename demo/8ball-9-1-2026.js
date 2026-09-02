let answer=["Yes", "No", "Maybe"];
let ans = "8";

function setup() {
    createCanvas(500, 700).parent('sketch-stage');
    background(250);
}

function draw() {
    fill(0);
    ellipse(width/2, 300, 300);

    fill(255);
    textSize(64);
    textAlign(CENTER, CENTER);
    text(ans, width/2, 300);

    //button
    if (mouseX > width/2 - 100 && mouseX < width/2 + 100 && mouseY > 550 - 50 && mouseY < 550 + 50) {
        fill(100);
    } else {
        fill(250);
    }
    rectMode(CENTER);
    rect(width/2, 550, 200, 100);
    fill(0);
    textSize(32);
    text("Ask Me", width/2, 550);

}

function mousePressed() {
    if (mouseX > width/2 - 100 && mouseX < width/2 + 100 && mouseY > 500 && mouseY < 600) {
        ans = random(answer);
    } else {
        ans = "8";
    }
}