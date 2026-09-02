let r = 255;

function setup() {
    createCanvas(400, 400).parent('sketch-stage');
}

function draw() {
    background(r, 0, 0);

    if (mouseX < width/2) {
        r=255;
    } else if (mouseX < 300) {
        r=128;
    } else if (mouseX < 400) {
        r=50;
    } else {
        r=0;
    }

    console.log(mouseX, (width*0.66), r);
}
