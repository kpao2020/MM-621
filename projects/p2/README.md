---
layout: default
title: Project 2 Readme
---

## Project 2

---

# Spooky Weather:
<p align="center">
  [ <a href="https://kpao2020.github.io/MM-621/projects/p2/index.html">Open the Spooky Weather Dashboard</a> ]
</p>

---

### Description:
Spooky Weather is a Halloween-themed weather dashboard that turns current Bay Area weather observations into an animated, interactive experience. It starts with Hayward, California, and lets visitors choose Oakland, San Francisco, or San Jose.

The dashboard uses p5.js to draw a responsive canvas, weather graphics, atmospheric particles, and interface elements. It retrieves current observations from the NOAA National Weather Service API, converts measurements into familiar U.S. units, and refreshes the data every 20 minutes while the page is open.

The six weather readings are temperature, humidity, wind, pressure, visibility, and precipitation. To add a hint of spookiness, I rephrase the weather elements names with a haunted-style wordings.

- Select a reading to see its animated graphic and details. A day/night control switches between automatic and manual sky themes, while the background responds to weather conditions and wind. A floating ghost follows the cursor, and clicking a metric card triggers a brief “Boo!” effect with a spooky sound.

---

### Interaction Design
- Click the location arrow beside the dashboard title to expand a selection of 4 available cities in the Bay Area.
- Choose a diffetent city will refresh the data automatically.
- When dashboard left open, it auto-fresh weather data every 20 minutes.
- Select one of the six metric cards to feature its animated visualization and play a spooky sound.
- Use the Auto/day/night toggle to switch the sky theme manually or return to automatic mode.
- In Auto-mode, day / night sky theme automatically switch when corresponding sunrise / sunset time hit. 
- Sunrise / Sunset times are location-based, display at upper right hand corner, and pull from NOAA API as well.
- Latest weather fetch timestamp is displayed at the lower right hand corner next to the clickable **NOAA source** label.
- Hover over cards and controls for pointer feedback. Click the NOAA source link to view the selected observation in raw JSON format.
- The canvas adjusts to the browser width, with a compact layout on smaller screens, which fit smartphone screensize more user-friendly.

---

### Developer Notes
- NOAA provides the dashboard’s current station observations. The project looks up a nearby station for each selected location and caches that station lookup for later refreshes.
- Measurements are converted from metric units to Fahrenheit, miles per hour, inches of mercury, miles, and inches for display.
- The weather modules draw separate animated graphics for temperature, humidity, wind, pressure, visibility, and precipitation.
- Wind speed influences the ambient particle movement. Rain and clear conditions also change the background particles.
- The sky control uses sunrise and sunset values when they are available; it falls back to daytime if those values are missing.
- Weather data refreshes at the next 20-minute mark (:00, :20, or :40) and continues on that schedule while the dashboard is open.

---

### Files:
  - sketch.js                    - main p5.js dashboard, layout, interactions, and animated background
  - weather-api.js               - NOAA requests, data normalization, unit conversion, and refresh schedule
  - weather-temperature.js       - temperature card visualization
  - weather-humidity.js          - humidity card visualization
  - weather-wind.js              - wind card visualization
  - weather-pressure.js          - pressure card visualization
  - weather-visibility.js        - visibility card visualization
  - weather-precipitation.js     - precipitation card visualization
  - ghost-mouse.js               - animated ghost cursor, click effect, and sound playback
  - index.html                   - dashboard webpage and script loading order
  - style.css                    - responsive page and canvas styling
  - README.md                    - project documentation

The dashboard also uses the shared p5.js library in `../../lib/` and sound files in `../../assets/sounds/`.

---

### Feature Roadmap
- Add a search option so visitors can enter a location beyond the four preset Bay Area cities.
- Add seasonal themes, such as Christmas, New Year, and July 4, so the dashboard can be used throughout the year.

---

### Note:
  - This project is intended for educational purposes in the context of the MM-621 class project.
  - NOAA weather data is requested by latitude and longitude. Hayward is the default location, with three additional Bay Area cities available in the location menu.

### Credits:
  - NOAA National Weather Service API for current weather observations.
  - p5.js for creative coding and canvas rendering.
  - Adobe Stock for background and iconography assets.
  - Pixabay for spooky sound effects.
  - OpenAI ChatGPT for code assistance and optimization suggestions.

### References:
  - [p5.js Reference](https://p5js.org/reference/)
  - [NOAA National Weather Service API](https://www.weather.gov/documentation/services-web-api)
  - [HTML Audio](https://developer.mozilla.org/en-US/docs/Web/API/HTMLAudioElement)
