// bounce

let colorR, colorG, colorB;

let redX = 200;
let redY = 200;

let redSpeedX;
let redSpeedY;

let acceleration = 0.05;

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

    // Random starting direction and speed
    redSpeedX = random(-3, 3);
    redSpeedY = random(-3, 3);
}

function draw() {

    // Change background based on ball position
    let bgColorR = map(redX, 50, width - 50, 50, 255, true);
    let bgColorG = map(redY, 50, height - 50, 50, 255, true);

    background(bgColorR, bgColorG, bgB);

    // Accelerate
    redSpeedX += acceleration * Math.sign(redSpeedX);
    redSpeedY += acceleration * Math.sign(redSpeedY);

    // Limit maximum speed
    redSpeedX = constrain(redSpeedX, -5, 5);
    redSpeedY = constrain(redSpeedY, -5, 5);

    // Move ball
    redX += redSpeedX;
    redY += redSpeedY;

    // Ball size
    ballSize = map(redX, 50, width - 50, 50, 150, true);

    // Ball color
    colorR = map(redX, 50, 350, 0, 255, true);
    colorG = map(redY, 50, 350, 0, 255, true);
    colorB = map(redX, 50, 350, 255, 0, true);

    // Draw ball
    fill(colorR, colorG, colorB);
    ellipse(redX, redY, ballSize);

    // --------------------------------
    // LEFT / RIGHT BOUNCE
    // --------------------------------

    if (redX > width - ballSize / 2) {

        redX = width - ballSize / 2;

        // Reverse direction
        redSpeedX = -abs(redSpeedX);

        // Randomize vertical direction
        redSpeedY = random(-5, 5);
    }

    if (redX < ballSize / 2) {

        redX = ballSize / 2;

        // Reverse direction
        redSpeedX = abs(redSpeedX);

        // Randomize vertical direction
        redSpeedY = random(-5, 5);
    }

    // --------------------------------
    // TOP / BOTTOM BOUNCE
    // --------------------------------

    if (redY > height - ballSize / 2) {

        redY = height - ballSize / 2;

        // Reverse direction
        redSpeedY = -abs(redSpeedY);

        // Randomize horizontal direction
        redSpeedX = random(-5, 5);
    }

    if (redY < ballSize / 2) {

        redY = ballSize / 2;

        // Reverse direction
        redSpeedY = abs(redSpeedY);

        // Randomize horizontal direction
        redSpeedX = random(-5, 5);
    }
}