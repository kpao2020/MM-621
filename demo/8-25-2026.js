// Color + var + math

let colorRed;
let colorOrange;
let colorBlue;

let redX = 200;
let redY = 200;
let redSpeedX = 3;
let redSpeedY = 2;

let orangeX = 100;
let orangeY = 100;
let orangeSpeedX = 2;
let orangeSpeedY = 3;

let blueX = 300;
let blueY = 300;
let blueSpeedX = -3;
let blueSpeedY = -2;

function setup() {
    createCanvas(400, 400).parent('sketch-stage');

    colorRed = color(235, 0, 0);
    colorOrange = color(235, 155, 0);
    colorBlue = color(0, 0, 235);
}

function draw() {
    background(100, 255, 100);

    // RED circle
    redX = redX + redSpeedX;
    redY = redY + redSpeedY;

    if (redX > width - 50 || redX < 50) {
        redSpeedX = redSpeedX * -1;
    }

    if (redY > height - 50 || redY < 50) {
        redSpeedY = redSpeedY * -1;
    }

    strokeWeight(1);
    stroke(0);
    fill(colorRed);
    // ellipse(x, y, d);
    ellipse(redX, redY, 100);
    
     // ORANGE circle
    orangeX = orangeX + orangeSpeedX;
    orangeY = orangeY + orangeSpeedY;

    if (orangeX > width - 50 || orangeX < 50) {
        orangeSpeedX = orangeSpeedX * -1;
    }

    if (orangeY > height - 50 || orangeY < 50) {
        orangeSpeedY = orangeSpeedY * -1;
    }

    fill(colorOrange);
    ellipse(orangeX, orangeY, 100);
    
    // BLUE circle
    blueX = blueX + blueSpeedX;
    blueY = blueY + blueSpeedY;

    if (blueX > width - 50 || blueX < 50) {
        blueSpeedX = blueSpeedX * -1;
    }

    if (blueY > height - 50 || blueY < 50) {
        blueSpeedY = blueSpeedY * -1;
    }

    noFill();
    strokeWeight(4);
    stroke(255);
    //fill(colorBlue);
    ellipse(blueX, blueY, 100);
    
    // console.log(mouseY);
}
