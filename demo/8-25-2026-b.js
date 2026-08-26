// Color + var + math

let ballY = 200;

let colorR, colorG, colorB;

let redX = 200;
let redY = 200;
let redSpeedX = 3;
let redSpeedY = 2;

let ballSize;

let bgR, bgG, bgB;

function setup() {
    createCanvas(400, 400);

    colorR = 0;
    colorG = 0;
    colorB = 0;

    // Random background color
    bgR = random(255);
    bgG = random(255);
    bgB = random(255);
}

function draw() {

    // Change background based on the ball's position
    let bgColorR = map(redX, 50, width - 50, 50, 255);
    let bgColorG = map(redY, 50, height - 50, 50, 255);

    background(bgColorR, bgColorG, bgB);

    // RED circle
    redX = redX + redSpeedX;
    redY = redY + redSpeedY;

    // Bounce left / right
    if (redX > width - 50 || redX < 50) {
        redSpeedX = redSpeedX * -1;
    }

    // Bounce top / bottom
    if (redY > height - 50 || redY < 50) {
        redSpeedY = redSpeedY * -1;
    }

    // Map ball position to ball size
    ballSize = map(redX, 50, width - 50, 50, 150);

    fill(colorR, colorG, colorB);
    ellipse(redX, redY, ballSize);

    // Change ball color
    // colorR = (colorR + 1) % 256;
    // colorG = (colorG + 1) % 256;
    // colorB = (colorB + 1) % 256;

    colorR = map(redX, 50, 350, 0, 255);
    colorG = map(redY, 50, 350, 0, 255);
    colorB = map(redX, 50, 350, 255, 0);
}

function mousePressed() {
    // colorR = 0;
    // colorG = 0;
    // colorB = 0;

    // Randomize background when clicked
    bgR = random(255);
    bgG = random(255);
    bgB = random(255);
}