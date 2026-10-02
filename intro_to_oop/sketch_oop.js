let myCars=[];
let numOfCars=100;

function setup() {
  createCanvas(400, 400);
  for (let i = 0; i < numOfCars; i++){
    myCars[i] = new Car(color(random(255),random(255),random(255)),0,random(height),random(10));
  }
}

function draw() {
  background(220);

  for (let i = 0; i < numOfCars; i++){
    myCars[i].display();
    myCars[i].drive();
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
}