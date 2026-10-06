// show data on mouse hover

let cars=[];

function setup() {
  createCanvas(400, 400);
  for (let i = 0; i < 5; i++){
    let car = new Car(
      color(random(255),random(255),random(255), random(255)),
      0,
      random(height),
      random(1)
    );
    cars.push(car);
  }
}

function mousePressed(){
  for (let i = 0; i < cars.length; i++){
  }
}

function draw() {
  background(220);

  for (let i = 0; i < cars.length; i++){
    cars[i].display();
    cars[i].drive();
    if (cars[i].click(mouseX, mouseY)) {
      cars[i].info();
    }
  }
}

class Car {
  constructor(tempC, tempXpos, tempYpos, tempXspeed) {
    this.c = tempC;
    this.xpos = tempXpos;
    this.ypos = tempYpos;
    this.xspeed = tempXspeed;
  }

  drive() {
    this.xpos += this.xspeed;
    
    if (this.xpos > width){
      this.xpos = 0;
    }
  }

  display() {
    stroke(0);
    rectMode(CENTER);
    fill(this.c);
    rect(this.xpos, this.ypos, 50, 25);
  }

  click(px, py) {
    let halfW = 50/2;
    let halfH = 25/2;

    if (abs(px - this.xpos) < halfW && 
        abs(py - this.ypos) < halfH) {
      return true;
    } else {
      return false;
    }
  }

  info() {
    // text box
    fill(255, 50);
    // .toFixed() is a JS method to format numbers with a specified number of decimal places
    text(this.xspeed.toFixed(1)+ " mph", this.xpos + 25, this.ypos - 25);
    rect(this.xpos + 40, this.ypos - 27, 60, 35);
  }
}