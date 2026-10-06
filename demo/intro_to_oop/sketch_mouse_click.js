let cars=[];

function setup() {
  createCanvas(400, 400);
  for (let i = 0; i < 5; i++){
    let car = new Car(
      color(random(255),random(255),random(255), random(255)),
      0,
      random(height),
      random(10)
    );
    cars.push(car);
  }
}

function mousePressed(){
  for (let i = 0; i < cars.length; i++){
    cars[i].click(mouseX, mouseY);
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

    // if (mouseX > this.xpos - halfW && 
    //     mouseX < this.xpos + halfW && 
    //     mouseY > this.ypos - halfH && 
    //     mouseY < this.ypos + halfH) {
    if (abs(px - this.xpos) < halfW && 
        abs(py - this.ypos) < halfH) {
      console.log("clicked on the car");
    }
    // let d = dist(mouseX, mouseY, this.xpos, this.ypos);

    // if (d < 25) {
    //   console.log("clicked on the car");
    // }
    
  }
}