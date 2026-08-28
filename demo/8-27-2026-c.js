function setup() {
    createCanvas(400, 400);
    background(220);
}

function draw() {

    if(keyIsPressed) {
        rectMode(CENTER);
        rect(random(width), random(height), 50, 100);
    } else {
        background(220);
    }
}