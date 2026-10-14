// Note: Use AI to help troubleshoot and debug.


// ken-pao-food.csv
// https://docs.google.com/spreadsheets/d/e/2PACX-1vSAZRURTMgJudhekP3gdrCpPdV90ow_7SZoH8osD6CPxRfJyzPxpcDlW5UhRg-Cl6kEPoGsm7kB2MbM/pub?gid=1864131184&single=true&output=csv

let csvUrl = "https://docs.google.com/spreadsheets/d/e/2PACX-1vSAZRURTMgJudhekP3gdrCpPdV90ow_7SZoH8osD6CPxRfJyzPxpcDlW5UhRg-Cl6kEPoGsm7kB2MbM/pub?gid=1864131184&single=true&output=csv";
let nutriSelector;
let table;
let selectedNutri;
let nutriNames;

async function setup() {

  createCanvas(windowWidth * 0.8, windowHeight * 0.8);

  // Initialize nutrition selector
  nutriSelector = createSelect();
  nutriSelector.position(140, 20);
  nutriSelector.option('Select a nutrition...');

  // Load the CSV file with a header row
  table = await loadTable(csvUrl, ',', 'header');

  // initialize the nutrition selector with nutrition names from the CSV
  nutriNames = table.columns;

  // Skip food names (index 0)
  for (let i = 1; i < nutriNames.length; i++) {
    nutriSelector.option(nutriNames[i]);
  }

  // Initialize selectedNutri to null
  selectedNutri = null;

  // Set up the event listener for when a nutrition is selected
  nutriSelector.changed(onNutriSelected);
}
  
function draw() {
  background(0);

  // Add a label for the nutrition selector
  fill(255);
  noStroke();
  textSize(20);
  text('Nutrition:', 50, 36);

  if (!selectedNutri || selectedNutri.length === 0) {
    textSize(18);
    text('Choose a nutrition to see the graph.', 50, 90);
    return;
  }

  // Graph boundaries
  const graphLeft = 50;
  const graphRight = width - 180;
  const graphTop = 150;
  const graphBottom = height - 100;

  // Data range
  const values = selectedNutri.map((item) => item.value);
  const minValue = min(values);
  const maxValue = max(values);

  // Calculate the horizontal step size based on the number of selected foods
  const xStep = (graphRight - graphLeft) / (selectedNutri.length - 1);

  // Draw the title and axes.
  noStroke();
  fill(255);
  text(selectedNutri.name, graphLeft, 90);

  // Draw the axes
  stroke(255);
  strokeWeight(1);
  line(graphLeft, graphBottom, graphRight, graphBottom);
  line(graphLeft, graphTop, graphLeft, graphBottom);

  // Draw the line, points, and food names in one loop
  let previousX;
  let previousY;
  textSize(12);

  // Go through each selected nutrition item and plot it on the graph
  for (let i = 0; i < selectedNutri.length; i++) {
    const item = selectedNutri[i];
    const x = graphLeft + i * xStep;
    const y = map(item.value, minValue, maxValue, graphBottom, graphTop);

    // Draw the current point
    fill(255, 190, 80);
    noStroke();
    circle(x, y, 9);

    // Put each food name beside its point
    push();
    translate(x + 5, y - 15);
    fill(255);
    textAlign(LEFT, TOP);
    text(item.food, 0, 0);
    pop();

    // Skip the first point and then connect each point 
    // to the previous point
    if (i > 0) {
      stroke(255, 190, 80);
      strokeWeight(2);
      line(previousX, previousY, x, y);
    }

    // Save the current point's coordinates for the next iteration
    previousX = x;
    previousY = y;
  }
}

function onNutriSelected() {
  const columnName = nutriSelector.value();

  // Ignore the placeholder option.
  if (columnName === 'Select a nutrition...') {
    selectedNutri = null;
    return;
  }

  const foods = table.getColumn('Food');
  const values = table.getColumn(columnName);

  // Keep each food paired with its selected numeric value
  selectedNutri = values
    .map((rawValue, index) => ({
      food: foods[index],

      // data imported from CSV is all "string"
      // Convert the raw value to a number, 
      // removing commas and trimming whitespace
      value: Number(String(rawValue).replace(/,/g, '').trim())
    }))
    .filter((item) => item.food && Number.isFinite(item.value));

  selectedNutri.name = columnName;
}
