/*
  Project 2: Spooky Weather
  NOAA weather requests and observation conversion helpers.

  Description:
    - Location selection and API request handling functions. 2 APIs are
      used to get the current weather conditions and sunrise / sunset times 
      The NOAA API provides the current weather conditions, while the 
      sunrise-sunset API provides the sunrise and sunset times 
      for the selected location.

  References:
    - P5.js: https://p5js.org/reference/
    - Sunrise-sunset API: https://sunrise-sunset.org/api
    - NOAA API: https://www.weather.gov/documentation/services-web-api
    - OpenAI ChatGPT for code assistance and optimization suggestions.

  Code Origin:
    - [ORIGINAL API + AI-ASSISTED REVISIONS]  
*/

// ============================================================
// WEATHER DATA STATE
// - Keep values from the NOAA and sunrise/sunset requests together.
// ============================================================
let weatherData;
let weatherError = '';
let weatherLoading = true;
let sunriseTime = null;
let sunsetTime = null;
let weatherRequestId = 0;

// ============================================================
// LOAD WEATHER DATA
// - Use NOAA's point lookup before requesting the local observation station.
// - https://api.weather.gov/points/37.6688,-122.0808
// - https://api.weather.gov/stations/KHWD/observations/latest
// ============================================================
async function loadWeatherData(location = selectedLocation) {
  const REQUEST_ID = ++weatherRequestId;
  weatherLoading = true;
  weatherError = '';

  try {
    const POINTS_URL = `https://api.weather.gov/points/${location.latitude},${location.longitude}`;
    const POINTS_RESPONSE = await fetch(POINTS_URL, {
      headers: { Accept: 'application/geo+json' }
    });
    const POINTS_DATA = await POINTS_RESPONSE.json();

    if (!POINTS_RESPONSE.ok) {
      throw new Error(POINTS_DATA.title || 'NOAA point lookup failed.');
    }

    const STATIONS_URL = POINTS_DATA.properties?.observationStations;

    if (!STATIONS_URL) {
      throw new Error(`NOAA did not return an observation station URL for ${location.city}.`);
    }

    const STATIONS_RESPONSE = await fetch(STATIONS_URL, {
      headers: { Accept: 'application/geo+json' }
    });
    const STATIONS_DATA = await STATIONS_RESPONSE.json();

    if (!STATIONS_RESPONSE.ok) {
      throw new Error(STATIONS_DATA.title || 'NOAA station lookup failed.');
    }

    if (
      !Array.isArray(STATIONS_DATA.features) ||
      STATIONS_DATA.features.length === 0
    ) {
      throw new Error(`NOAA did not return an observation station near ${location.city}.`);
    }

    const STATION_URL = STATIONS_DATA.features[0]?.id;

    if (!STATION_URL) {
      throw new Error('NOAA returned a station without a usable URL.');
    }

    const OBSERVATION_RESPONSE = await fetch(`${STATION_URL}/observations/latest`, {
      headers: { Accept: 'application/geo+json' }
    });
    const OBSERVATION_DATA = await OBSERVATION_RESPONSE.json();

    if (!OBSERVATION_RESPONSE.ok) {
      throw new Error(OBSERVATION_DATA.title || 'NOAA observation lookup failed.');
    }

    if (!OBSERVATION_DATA.properties) {
      throw new Error(`NOAA returned no current observation for ${location.city}.`);
    }

    if (REQUEST_ID !== weatherRequestId) return;
    sunriseTime = new Date(POINTS_DATA.properties.astronomicalData.sunrise);
    sunsetTime = new Date(POINTS_DATA.properties.astronomicalData.sunset);
    weatherData = normalizeWeatherData(OBSERVATION_DATA.properties);
    weatherLoading = false;
    updateParticleMotion();
  } catch (error) {
    if (REQUEST_ID !== weatherRequestId) return;
    weatherError = error.message;
    weatherLoading = false;
    console.error('Failed to load NOAA weather data:', error);
  }
}

// ============================================================
// NORMALIZE WEATHER DATA
// - Convert NOAA's metric observation values into dashboard-friendly units.
// ============================================================
function normalizeWeatherData(observation) {
  return {
    temperature: convertCelsiusToFahrenheit(observation.temperature?.value),
    humidity: observation.relativeHumidity?.value ?? null,
    windSpeed: convertKilometersToMiles(observation.windSpeed?.value),
    windDirection: observation.windDirection?.value,
    windDirectionLabel: getCompassDirection(observation.windDirection?.value),
    pressure: convertPascalsToInches(observation.barometricPressure?.value),
    visibility: convertMetersToMiles(observation.visibility?.value),
    precipitation: convertMillimetersToInches(observation.precipitationLastHour?.value),
    description: observation.textDescription || 'Current conditions',
    station: observation.station || 'NOAA weather station',
    timestamp: observation.timestamp
  };
}

// ============================================================
// CONVERT CELSIUS TO FAHRENHEIT
// - Change NOAA's temperature value into Fahrenheit for the dashboard.
// ============================================================
function convertCelsiusToFahrenheit(value) {
  return value == null ? null : value * 9 / 5 + 32;
}

// ============================================================
// CONVERT KILOMETERS TO MILES
// - Change NOAA's wind speed value into miles per hour.
// ============================================================
function convertKilometersToMiles(value) {
  return value == null ? null : value * 0.621371;
}

// ============================================================
// CONVERT PASCALS TO INCHES OF MERCURY
// - Change NOAA's pressure value into inHg for the dashboard.
// ============================================================
function convertPascalsToInches(value) {
  return value == null ? null : value * 0.0002953;
}

// ============================================================
// CONVERT METERS TO MILES
// - Change NOAA's visibility value into miles.
// ============================================================
function convertMetersToMiles(value) {
  return value == null ? null : value * 0.000621371;
}

// ============================================================
// CONVERT MILLIMETERS TO INCHES
// - Change NOAA's precipitation value into inches.
// ============================================================
function convertMillimetersToInches(value) {
  return value == null ? null : value * 0.0393701;
}

// ============================================================
// GET COMPASS DIRECTION
// - Convert NOAA's wind-direction degrees into a readable compass label.
// ============================================================
function getCompassDirection(degrees) {
  if (
    degrees == null ||
    Number.isNaN(degrees)
  ) {
    return 'direction unavailable';
  }

  const DIRECTIONS = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  const DIRECTION_INDEX = Math.round(degrees / 45) % DIRECTIONS.length;
  return DIRECTIONS[DIRECTION_INDEX];
}