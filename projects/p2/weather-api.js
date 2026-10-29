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
    - NOAA API: https://www.weather.gov/documentation/services-web-api
    - OpenAI ChatGPT(Codex) for code assistance and optimization suggestions.

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
let weatherRequestId = 0;     // Weather API request ID to keep track of latest weather data
let weatherUpdatedAt = null;
const WEATHER_LOCATION_CACHE = new Map();
const MIN_LOADING_DURATION = 1000;

// ============================================================
// LOAD WEATHER DATA
// - Use NOAA's point lookup before requesting the local observation station.
// - https://api.weather.gov/points/37.6688,-122.0808
// - https://api.weather.gov/stations/KHWD/observations/latest
//
// Note: When user selects different location quickly, it may 
//       overwrite global variable weatherData with outdated data.
//       To prevent that happening, I use a local variable
//       REQUEST_ID to keep track of each async running function call
//       and use it compare the current weatherRequestId to make sure
//       only store the latest weather data align with the latest
//       selected location.
// ============================================================
async function loadWeatherData(location = selectedLocation) {
  const REQUEST_ID = ++weatherRequestId;
  const LOADING_STARTED_AT = Date.now();
  weatherLoading = true;
  weatherError = '';

  try {
    const LOCATION_KEY = `${location.latitude},${location.longitude}`;
    let LOCATION_DATA = WEATHER_LOCATION_CACHE.get(LOCATION_KEY);

    // Resolve the nearby station once per location. Scheduled refreshes can
    // then request only the latest observation.
    if (!LOCATION_DATA) {
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
      if (!Array.isArray(STATIONS_DATA.features) || STATIONS_DATA.features.length === 0) {
        throw new Error(`NOAA did not return an observation station near ${location.city}.`);
      }

      const STATION_URL = STATIONS_DATA.features[0]?.id;
      if (!STATION_URL) {
        throw new Error('NOAA returned a station without a usable URL.');
      }

      LOCATION_DATA = {
        observationUrl: `${STATION_URL}/observations/latest`,
        sunrise: POINTS_DATA.properties.astronomicalData?.sunrise,
        sunset: POINTS_DATA.properties.astronomicalData?.sunset
      };
      WEATHER_LOCATION_CACHE.set(LOCATION_KEY, LOCATION_DATA);
    }

    const OBSERVATION_URL = LOCATION_DATA.observationUrl;
    const OBSERVATION_RESPONSE = await fetch(OBSERVATION_URL, {
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
    sunriseTime = LOCATION_DATA.sunrise ? new Date(LOCATION_DATA.sunrise) : null;
    sunsetTime = LOCATION_DATA.sunset ? new Date(LOCATION_DATA.sunset) : null;
    weatherData = normalizeWeatherData(OBSERVATION_DATA.properties);
    weatherData.sourceUrl = OBSERVATION_URL;
    weatherUpdatedAt = new Date();
    updateParticleMotion();
  } catch (error) {
    if (REQUEST_ID !== weatherRequestId) return;
    weatherError = error.message;
    console.error('Failed to load NOAA weather data:', error);
  } finally {
    const REMAINING_LOADING_TIME = MIN_LOADING_DURATION - (Date.now() - LOADING_STARTED_AT);
    if (REMAINING_LOADING_TIME > 0) {
      await new Promise((resolve) => setTimeout(resolve, REMAINING_LOADING_TIME));
    }
    if (REQUEST_ID === weatherRequestId) {
      weatherLoading = false;
    }
  }
}

// ============================================================
// SCHEDULE WEATHER REFRESH
// - Refresh on the next :00, :20, or :40 minute mark, then realign each time.
// ============================================================
function scheduleWeatherRefresh() {
  const NOW = new Date();
  const MINUTES_TO_NEXT_MARK = 20 - (NOW.getMinutes() % 20);
  const DELAY = MINUTES_TO_NEXT_MARK * 60_000 - NOW.getSeconds() * 1_000 - NOW.getMilliseconds();

  setTimeout(() => {
    loadWeatherData(selectedLocation);
    scheduleWeatherRefresh();
  }, DELAY);
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
