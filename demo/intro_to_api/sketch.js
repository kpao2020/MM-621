let weather;



function setup() {
  createCanvas(400, 400);
  loadJSON('https://api.open-meteo.com/v1/forecast?latitude=37.6688&longitude=-122.0808&current=temperature_2m&timezone=America%2FLos_Angeles&wind_speed_unit=mph&temperature_unit=fahrenheit&precipitation_unit=inch', gotData);
}

function gotData(data) {
  weather = data;
}

function draw() {
  background(0);
  if (weather) {
    fill(255);
    textAlign(CENTER);
    textSize(30);
    text("Time: " + weather.current.time, 200, 100);
    text("Temperature: " + weather.current.temperature_2m + "°F", 200, 300);

    fill(weather.current.temperature_2m, 0, 0);
    ellipse(200, 200, weather.current.temperature_2m);
  }
}



