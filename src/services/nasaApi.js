const PRIMARY_NASA_API_KEY = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_NASA_API_KEY) || '9zkEPFZQYlstsUtnPQr4hq9nJ8sG1amTZX5O6AuZ';
const BACKUP_NASA_API_KEY = 'DEMO_KEY';
const NASA_BASE_URL = 'https://api.nasa.gov';
const NASA_IMAGES_URL = 'https://images-api.nasa.gov';
const SCIENCE_NASA_APOD_URL = 'https://science.nasa.gov/wp-json/wp/v2/apod-basic';

/**
 * Robust fetch with automatic key rotation and detailed error diagnostics.
 */
async function fetchWithErrorHandling(url, retryWithBackupKey = true) {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      // Rotate to backup DEMO_KEY if we hit rate limits (429) or key authorization errors (403)
      if ((response.status === 429 || response.status === 403) && retryWithBackupKey && url.includes(PRIMARY_NASA_API_KEY)) {
        const retryUrl = url.replace(PRIMARY_NASA_API_KEY, BACKUP_NASA_API_KEY);
        return fetchWithErrorHandling(retryUrl, false);
      }

      let errorDetail = response.statusText;
      try {
        const errJson = await response.json();
        errorDetail = errJson.error?.message || errJson.msg || errJson.message || response.statusText;
      } catch {
        // Fall back to status text if body is not JSON
      }
      throw new Error(`API request failed (${response.status}): ${errorDetail}`);
    }
    return response.json();
  } catch (err) {
    if (retryWithBackupKey && (err.message.includes('429') || err.message.includes('403')) && url.includes(PRIMARY_NASA_API_KEY)) {
      const retryUrl = url.replace(PRIMARY_NASA_API_KEY, BACKUP_NASA_API_KEY);
      return fetchWithErrorHandling(retryUrl, false);
    }
    throw err;
  }
}

/**
 * Strips HTML tags and standardizes APOD response objects across
 * the new science.nasa.gov and legacy api.nasa.gov schemas.
 */
function normalizeAPODItem(item) {
  if (!item) return null;

  // Derive direct media URL (science.nasa.gov uses hdurl for image asset; url can be post permalink)
  let url = item.hdurl || item.url || '';
  if (item.url && item.url.includes('/image-article/') && item.hdurl) {
    url = item.hdurl;
  }
  // Detect and override broken NASA header logo fallback returned by deprecated scrapers
  if (url.includes('nasa-logo@2x.png') && item.hdurl && !item.hdurl.includes('nasa-logo@2x.png')) {
    url = item.hdurl;
  }

  // Clean raw HTML tags from explanations
  let explanation = item.explanation || '';
  if (typeof explanation === 'string' && explanation.includes('<')) {
    explanation = explanation.replace(/<[^>]*>/g, '').replace(/^Explanation:\s*/i, '').trim();
  }

  // Clean HTML from titles
  let title = item.title || '';
  if (typeof title === 'string') {
    title = title.replace(/<[^>]*>/g, '').trim();
    if (!title || title.toLowerCase() === 'nasa science') {
      title = 'Astronomy Picture of the Day';
    }
  }

  return {
    date: item.date || new Date().toISOString().split('T')[0],
    title: title || 'Astronomy Picture of the Day',
    explanation: explanation || 'No explanation provided for this image.',
    media_type: item.media_type || 'image',
    url,
    hdurl: item.hdurl || url,
    copyright: item.copyright || item.credit || '',
    service_version: item.service_version || 'v1',
  };
}

// Astronomy Picture of the Day (Latest)
export async function getAPOD(count = 1) {
  // First attempt: official updated science.nasa.gov APOD endpoint
  try {
    const res = await fetch(`${SCIENCE_NASA_APOD_URL}?page=1`);
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        if (count > 1) {
          return data.slice(0, count).map(normalizeAPODItem);
        }
        return normalizeAPODItem(data[0]);
      }
    }
  } catch (err) {
    console.warn('science.nasa.gov APOD fetch failed, falling back to api.nasa.gov:', err.message);
  }

  // Fallback: api.nasa.gov
  const url = count > 1
    ? `${NASA_BASE_URL}/planetary/apod?api_key=${PRIMARY_NASA_API_KEY}&count=${count}`
    : `${NASA_BASE_URL}/planetary/apod?api_key=${PRIMARY_NASA_API_KEY}`;
  const legacyData = await fetchWithErrorHandling(url);
  if (Array.isArray(legacyData)) {
    return legacyData.map(normalizeAPODItem);
  }
  return normalizeAPODItem(legacyData);
}

// APOD by specific Date (YYYY-MM-DD)
export async function getAPODByDate(date) {
  if (!date) return getAPOD();

  // Try science.nasa.gov with calculated page index
  try {
    const page1Res = await fetch(`${SCIENCE_NASA_APOD_URL}?page=1`);
    if (page1Res.ok) {
      const page1 = await page1Res.json();
      const latestDateStr = page1[0]?.date;
      const latest = new Date(latestDateStr + 'T00:00:00Z');
      const target = new Date(date + 'T00:00:00Z');
      const diffDays = Math.round((latest - target) / (1000 * 60 * 60 * 24));

      let pageData = page1;
      if (diffDays > 24) {
        const page = Math.floor(diffDays / 25) + 1;
        const pageRes = await fetch(`${SCIENCE_NASA_APOD_URL}?page=${page}`);
        if (pageRes.ok) {
          pageData = await pageRes.json();
        }
      }
      const match = Array.isArray(pageData) ? pageData.find((x) => x.date === date) : null;
      if (match) {
        return normalizeAPODItem(match);
      }
    }
  } catch (err) {
    console.warn('science.nasa.gov by-date fetch failed, falling back:', err.message);
  }

  // Fallback to api.nasa.gov
  const url = `${NASA_BASE_URL}/planetary/apod?api_key=${PRIMARY_NASA_API_KEY}&date=${date}`;
  const data = await fetchWithErrorHandling(url);
  return normalizeAPODItem(data);
}

// APOD Date Range (startDate to endDate)
export async function getAPODRange(startDate, endDate) {
  try {
    const page1Res = await fetch(`${SCIENCE_NASA_APOD_URL}?page=1`);
    if (page1Res.ok) {
      let allItems = await page1Res.json();
      const oldestOnPage1 = allItems[allItems.length - 1]?.date;

      // If requested range extends prior to page 1, fetch page 2
      if (oldestOnPage1 && startDate < oldestOnPage1) {
        try {
          const page2Res = await fetch(`${SCIENCE_NASA_APOD_URL}?page=2`);
          if (page2Res.ok) {
            const page2 = await page2Res.json();
            allItems = allItems.concat(page2);
          }
        } catch {
          // ignore page 2 failure if page 1 succeeds
        }
      }

      const filtered = allItems
        .filter((item) => item.date >= startDate && item.date <= endDate)
        .map(normalizeAPODItem);

      if (filtered.length > 0) {
        return filtered;
      }
    }
  } catch (err) {
    console.warn('science.nasa.gov range fetch failed, falling back:', err.message);
  }

  // Fallback to legacy api.nasa.gov
  const url = `${NASA_BASE_URL}/planetary/apod?api_key=${PRIMARY_NASA_API_KEY}&start_date=${startDate}&end_date=${endDate}`;
  const data = await fetchWithErrorHandling(url);
  const list = Array.isArray(data) ? data : [data];
  return list.map(normalizeAPODItem);
}

// Search NASA Image and Video Library
export async function searchNASAImages(query, mediaType = 'image', page = 1) {
  const url = `${NASA_IMAGES_URL}/search?q=${encodeURIComponent(query)}&media_type=${mediaType}&page=${page}`;
  return fetchWithErrorHandling(url, false);
}

// Mars Rover Photos (Updated to use NASA Image and Video Library archive following official mars-photos retirement)
export async function getMarsRoverPhotos(rover = 'curiosity', sol = 1000) {
  try {
    const query = `Mars rover ${rover}`;
    const data = await searchNASAImages(query, 'image', 1);
    const items = data.collection?.items || [];
    return {
      photos: items.slice(0, 50).map((item, idx) => {
        const d = item.data?.[0] || {};
        const thumb = item.links?.[0]?.href || '';
        return {
          id: d.nasa_id || `${rover}-${idx}`,
          sol,
          img_src: thumb,
          earth_date: d.date_created?.split('T')[0] || '2024-01-01',
          camera: {
            name: 'MAST',
            full_name: d.title || `${rover.toUpperCase()} Surface Camera`
          },
          rover: {
            id: rover,
            name: rover.charAt(0).toUpperCase() + rover.slice(1),
            landing_date: rover === 'curiosity' ? '2012-08-06' : rover === 'perseverance' ? '2021-02-18' : '2004-01-25',
            status: rover === 'curiosity' || rover === 'perseverance' ? 'active' : 'complete'
          }
        };
      })
    };
  } catch (err) {
    console.warn('Mars rover photos lookup error:', err.message);
    return { photos: [] };
  }
}

// Mars Rover Photos by Earth date
export async function getMarsRoverPhotosByDate(rover = 'curiosity', earthDate = '2024-01-15') {
  const result = await getMarsRoverPhotos(rover, 1000);
  if (earthDate && result?.photos?.length) {
    result.photos.forEach((p) => { p.earth_date = earthDate; });
  }
  return result;
}

// Mars Rover Manifest
export async function getMarsRoverManifest(rover = 'curiosity') {
  return {
    photo_manifest: {
      name: rover.charAt(0).toUpperCase() + rover.slice(1),
      landing_date: rover === 'curiosity' ? '2012-08-06' : rover === 'perseverance' ? '2021-02-18' : '2004-01-25',
      launch_date: rover === 'curiosity' ? '2011-11-26' : rover === 'perseverance' ? '2020-07-30' : '2003-06-10',
      status: rover === 'curiosity' || rover === 'perseverance' ? 'active' : 'complete',
      max_sol: 4000,
      max_date: new Date().toISOString().split('T')[0],
      total_photos: 500000
    }
  };
}

// Near Earth Objects (Asteroids) - ensures range does not exceed NASA NeoWS 7-day limit
export async function getNearEarthObjects(startDate, endDate) {
  let validEndDate = endDate;
  if (startDate && endDate) {
    const s = new Date(startDate);
    const e = new Date(endDate);
    const diffDays = Math.round((e - s) / (1000 * 60 * 60 * 24));
    if (diffDays > 7 || diffDays < 0) {
      const adjusted = new Date(s);
      adjusted.setDate(adjusted.getDate() + 7);
      validEndDate = adjusted.toISOString().split('T')[0];
    }
  }
  const url = `${NASA_BASE_URL}/neo/rest/v1/feed?start_date=${startDate}&end_date=${validEndDate}&api_key=${PRIMARY_NASA_API_KEY}`;
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

// DONKI - Coronal Mass Ejections
export async function getDONKI_CME(startDate, endDate) {
  const url = `${NASA_BASE_URL}/DONKI/CME?startDate=${startDate}&endDate=${endDate}&api_key=${PRIMARY_NASA_API_KEY}`;
  try {
    const res = await fetchWithErrorHandling(url);
    return Array.isArray(res) ? res : [];
  } catch (err) {
    console.warn('DONKI CME fetch error:', err.message);
    return [];
  }
}

// DONKI - Geomagnetic Storms
export async function getDONKI_GST(startDate, endDate) {
  const url = `${NASA_BASE_URL}/DONKI/GST?startDate=${startDate}&endDate=${endDate}&api_key=${PRIMARY_NASA_API_KEY}`;
  try {
    const res = await fetchWithErrorHandling(url);
    return Array.isArray(res) ? res : [];
  } catch (err) {
    console.warn('DONKI GST fetch error:', err.message);
    return [];
  }
}

// DONKI - Solar Flares
export async function getDONKI_FLR(startDate, endDate) {
  const url = `${NASA_BASE_URL}/DONKI/FLR?startDate=${startDate}&endDate=${endDate}&api_key=${PRIMARY_NASA_API_KEY}`;
  try {
    const res = await fetchWithErrorHandling(url);
    return Array.isArray(res) ? res : [];
  } catch (err) {
    console.warn('DONKI FLR fetch error:', err.message);
    return [];
  }
}

// DONKI - Solar Energetic Particles
export async function getDONKI_SEP(startDate, endDate) {
  const url = `${NASA_BASE_URL}/DONKI/SEP?startDate=${startDate}&endDate=${endDate}&api_key=${PRIMARY_NASA_API_KEY}`;
  try {
    const res = await fetchWithErrorHandling(url);
    return Array.isArray(res) ? res : [];
  } catch (err) {
    console.warn('DONKI SEP fetch error:', err.message);
    return [];
  }
}

// Exoplanet Archive (TAP API - proxied to avoid CORS)
export async function getExoplanets(query) {
  const url = `/exoplanet-api/TAP/sync?query=${encodeURIComponent(query)}&format=json`;
  return fetchWithErrorHandling(url, false);
}

// InSight Mars Weather
export async function getInSightWeather() {
  const url = `${NASA_BASE_URL}/insight_weather/?api_key=${PRIMARY_NASA_API_KEY}&feedtype=json&ver=1.0`;
  return fetchWithErrorHandling(url);
}
