let ball = {
    x:300,
    y:300,
    xspeed:4,
    yspeed:-3
}

function setup() {
    createCanvas(600, 400).parent('sketch-stage');
}

function draw() {
    background(0);
    
    drawBall();
    
    moveBall();

    bounceBall();
}

function drawBall() {
    // Draw the ball
    stroke(255);
    strokeWeight(4);
    fill(200,0,200);
    ellipse(ball.x, ball.y, 24, 24);
}

function bounceBall() {
    // Bounce left / right
    if (ball.x > width - 12 || ball.x < 12) {
        ball.xspeed = ball.xspeed * -1;
    }

    // Bounce top / bottom
    if (ball.y > height - 12 || ball.y < 12) {
        ball.yspeed = ball.yspeed * -1;
    }
}

function moveBall() {
    // Move the ball
    ball.x = ball.x + ball.xspeed;
    ball.y = ball.y + ball.yspeed;
}