function setup() {
    createCanvas(300, 300).parent('sketch-stage');
}

function draw() {
    background(100);
    
    for (let circleX = 75; circleX <= 255; circleX += 75) {
        for (let circleY = 75; circleY <= 255; circleY += 75) {
            circle(circleX, circleY, 50);
        }   
    }
}