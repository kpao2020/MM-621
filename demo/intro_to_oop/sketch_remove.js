// remove objects from array

let cars=[];

function setup() {
  createCanvas(400, 400);
  for (let i = 0; i < 15; i++){
    let car = new Car(
      color(random(255),random(255),random(255), random(255)),
      0,
      random(height),
      random(5)
    );
    cars.push(car);
  }
}

function mousePressed(){
  for (let i = 0; i < cars.length; i++){
    if (cars[i].click(mouseX, mouseY)) {
      cars.splice(i, 1);
      i--;    // this is to fix the index after removing an element
    }
  }
}

function draw() {
  background(220);

  for (let i = 0; i < cars.length; i++){
    cars[i].display();
    cars[i].drive();
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
}