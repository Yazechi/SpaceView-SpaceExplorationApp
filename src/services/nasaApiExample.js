const NASA_API_KEY = 'DEMO_KEY';
const NASA_BASE_URL = 'https://api.nasa.gov';
const NASA_IMAGES_URL = 'https://images-api.nasa.gov';

async function fetchWithErrorHandling(url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`API request failed: ${response.status} ${response.statusText}`);
  }
  return response.json();
}

// Astronomy Picture of the Day
export async function getAPOD(count = 1) {
  const url = count > 1
    ? `${NASA_BASE_URL}/planetary/apod?api_key=${NASA_API_KEY}&count=${count}`
    : `${NASA_BASE_URL}/planetary/apod?api_key=${NASA_API_KEY}`;
  return fetchWithErrorHandling(url);
}

// Search NASA Image and Video Library
export async function searchNASAImages(query, mediaType = 'image', page = 1) {
  const url = `${NASA_IMAGES_URL}/search?q=${encodeURIComponent(query)}&media_type=${mediaType}&page=${page}`;
  return fetchWithErrorHandling(url);
}

// Mars Rover Photos
export async function getMarsRoverPhotos(rover = 'curiosity', sol = 1000) {
  const url = `${NASA_BASE_URL}/mars-photos/api/v1/rovers/${rover}/photos?sol=${sol}&api_key=${NASA_API_KEY}`;
  return fetchWithErrorHandling(url);
}

// Near Earth Objects (Asteroids)
export async function getNearEarthObjects(startDate, endDate) {
  const url = `${NASA_BASE_URL}/neo/rest/v1/feed?start_date=${startDate}&end_date=${endDate}&api_key=${NASA_API_KEY}`;
  return fetchWithErrorHandling(url);
}

// Search missions via NASA Image Library
export async function searchMissions(query = 'space mission', page = 1) {
  return searchNASAImages(query, 'image', page);
}

// Search astronaut images
export async function searchAstronauts(query = 'astronaut', page = 1) {
  return searchNASAImages(query, 'image', page);
}

// Search celestial body images
export async function searchCelestialBodies(query = 'planet', page = 1) {
  return searchNASAImages(query, 'image', page);
}

// APOD by date
export async function getAPODByDate(date) {
  const url = `${NASA_BASE_URL}/planetary/apod?api_key=${NASA_API_KEY}&date=${date}`;
  return fetchWithErrorHandling(url);
}

// APOD date range
export async function getAPODRange(startDate, endDate) {
  const url = `${NASA_BASE_URL}/planetary/apod?api_key=${NASA_API_KEY}&start_date=${startDate}&end_date=${endDate}`;
  return fetchWithErrorHandling(url);
}

// Mars Rover Photos by Earth date
export async function getMarsRoverPhotosByDate(rover = 'curiosity', earthDate = '2024-01-15') {
  const url = `${NASA_BASE_URL}/mars-photos/api/v1/rovers/${rover}/photos?earth_date=${earthDate}&api_key=${NASA_API_KEY}`;
  return fetchWithErrorHandling(url);
}

// Mars Rover manifest (to know available dates)
export async function getMarsRoverManifest(rover = 'curiosity') {
  const url = `${NASA_BASE_URL}/mars-photos/api/v1/manifests/${rover}?api_key=${NASA_API_KEY}`;
  return fetchWithErrorHandling(url);
}

// DONKI - Coronal Mass Ejections
export async function getDONKI_CME(startDate, endDate) {
  const url = `${NASA_BASE_URL}/DONKI/CME?startDate=${startDate}&endDate=${endDate}&api_key=${NASA_API_KEY}`;
  return fetchWithErrorHandling(url);
}

// DONKI - Geomagnetic Storms
export async function getDONKI_GST(startDate, endDate) {
  const url = `${NASA_BASE_URL}/DONKI/GST?startDate=${startDate}&endDate=${endDate}&api_key=${NASA_API_KEY}`;
  return fetchWithErrorHandling(url);
}

// DONKI - Solar Flares
export async function getDONKI_FLR(startDate, endDate) {
  const url = `${NASA_BASE_URL}/DONKI/FLR?startDate=${startDate}&endDate=${endDate}&api_key=${NASA_API_KEY}`;
  return fetchWithErrorHandling(url);
}

// DONKI - Solar Energetic Particles
export async function getDONKI_SEP(startDate, endDate) {
  const url = `${NASA_BASE_URL}/DONKI/SEP?startDate=${startDate}&endDate=${endDate}&api_key=${NASA_API_KEY}`;
  return fetchWithErrorHandling(url);
}

// Exoplanet Archive (TAP API - proxied to avoid CORS)
export async function getExoplanets(query) {
  const url = `/exoplanet-api/TAP/sync?query=${encodeURIComponent(query)}&format=json`;
  return fetchWithErrorHandling(url);
}

// InSight Mars Weather
export async function getInSightWeather() {
  const url = `${NASA_BASE_URL}/insight_weather/?api_key=${NASA_API_KEY}&feedtype=json&ver=1.0`;
  return fetchWithErrorHandling(url);
}
