// https://docs.google.com/document/d/1FWJBvbCRL1pr6PqKjEz_af5YIGUKKbokheJSW9bFLWI/edit?tab=t.0#heading=h.9iipw3mwlh63

// ken-pao-food.csv
// https://docs.google.com/spreadsheets/d/e/2PACX-1vSAZRURTMgJudhekP3gdrCpPdV90ow_7SZoH8osD6CPxRfJyzPxpcDlW5UhRg-Cl6kEPoGsm7kB2MbM/pub?gid=1864131184&single=true&output=csv

let data;
let url = "https://docs.google.com/spreadsheets/d/e/2PACX-1vSAZRURTMgJudhekP3gdrCpPdV90ow_7SZoH8osD6CPxRfJyzPxpcDlW5UhRg-Cl6kEPoGsm7kB2MbM/pub?gid=1864131184&single=true&output=csv";

function preload() {
  data = loadTable(url, "csv", "header");
}

function setup() {
  createCanvas(1000, 500);
}

function draw() {
  background(0);

  if (data) {
    let numRows = data.getRowCount();
    let carbs = data.getColumn("Sodium");
    let names = data.getColumn("Food");

    for (let i = 0; i < numRows; i++) {
      let x = 50;
      let y = 100 + i * 50;
      let w = carbs[i];
      let h = 10;

      rect(x, y, w, h);

      textAlign(LEFT);
      fill(255);
      text(names[i], x, y - 5);

      textAlign(CENTER);
      text("Sodium", width / 2, 50);
    }
  }
}
