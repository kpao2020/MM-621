let foodSelect;
let table;
let selectedFood;

async function setup() {
  createCanvas(400, 400);

  // Initialize food selector
  foodSelect = createSelect();
  foodSelect.position(10, 10);
  foodSelect.option('Select a food item...');

  // Load the CSV file with a header row
  table = await loadTable('../../assets/data/in_class_food.csv', ',', 'header');

  // Get all rows
  let rows = table.getRows();

  // initialize the food selector with food items from the CSV
  for (let row of rows) {
    foodSelect.option(row.get('Food'));
  }

  // Initialize selectedFood to null
  selectedFood = null;

  // Set up the event listener for when a food item is selected
  foodSelect.changed(onFoodSelected);
}
  

function draw() {
  background(220);
  textSize(20);

  let foodDisplay = 'Selected food: ' + foodSelect.value();
  
  // If a food item is selected, display its nutritional information
  if (selectedFood) {
    foodDisplay +=
      '\n     Calories: ' + selectedFood.get('Calories') +
      '\n     Sugar: ' + selectedFood.get('Sugar') +
      '\n     Carbs: ' + selectedFood.get('Carbs') +
      '\n     Sodium: ' + selectedFood.get('Sodium') +
      '\n     Protein: ' + selectedFood.get('Protein');
  }

  text(foodDisplay, 20, 100); 
}

function onFoodSelected() {
  selectedFood = table.findRow(foodSelect.value(), 'Food');
}
