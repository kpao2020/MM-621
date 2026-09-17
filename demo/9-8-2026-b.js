function setup() {
    createCanvas(600, 400).parent('sketch-stage');
}

function draw() {
    background(0);

    drawLollipops(125, 200, 150, 200);
    drawLollipops(300, 100, 200, 50);
    drawLollipops(500, 175, 100, 100);
}

function drawLollipops(x, y, stickLength, LollipopSize) {
    fill(0, 200, 255);
    rect(x - 10, y, 20, stickLength);

    fill(255, 0, 200);
    ellipse(x, y, LollipopSize, LollipopSize);
}
