import { useState, useEffect, useRef, useCallback } from 'react';
import useSEO from '../hooks/useSEO';
import '../styles/ISSTracker.css';

const ISS_API = 'https://api.wheretheiss.at/v1/satellites/25544';

// 100% free, public, high-reliability basemaps that DO NOT require any API key or subscription
const TILE_PROVIDERS = {
  dark: {
    name: 'Dark Canvas',
    base: 'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}',
    ref: 'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Reference/MapServer/tile/{z}/{y}/{x}',
    maxZoom: 16,
    attribution: 'Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ',
  },
  satellite: {
    name: 'Satellite (Orbit View)',
    base: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    ref: null,
    maxZoom: 18,
    attribution: 'Tiles &copy; Esri &mdash; Source: Esri, Maxar, Earthstar Geographics',
  },
  osm: {
    name: 'Street Map',
    base: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    ref: null,
    maxZoom: 19,
    attribution: '&copy; OpenStreetMap contributors',
  },
};

function ISSTracker() {
  useSEO({
    title: 'Live ISS Tracker & Orbit Map',
    description: 'Track the International Space Station in real time with live orbital coordinates, ground speed, altitude, and telemetry map without API keys.',
    canonicalUrl: 'https://space-view-rho.vercel.app/iss-tracker',
  });

  const [position, setPosition] = useState(null);
  const [error, setError] = useState(null);
  const [isPaused, setIsPaused] = useState(false);
  const [followISS, setFollowISS] = useState(true);
  const [mapStyle, setMapStyle] = useState('dark');
  const [history, setHistory] = useState(() => {
    try {
      const saved = localStorage.getItem('iss_trail_history');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const baseTileRef = useRef(null);
  const refTileRef = useRef(null);
  const markerRef = useRef(null);
  const polylineRef = useRef(null);
  const intervalRef = useRef(null);
  const followRef = useRef(followISS);

  // Keep followRef synchronized with state
  useEffect(() => {
    followRef.current = followISS;
  }, [followISS]);

  // Apply Tile Layers based on selected style
  const applyTileLayer = useCallback((styleKey) => {
    const L = window.L;
    if (!L || !mapRef.current) return;

    const provider = TILE_PROVIDERS[styleKey] || TILE_PROVIDERS.dark;

    // Remove existing tile layers if present
    if (baseTileRef.current) {
      mapRef.current.removeLayer(baseTileRef.current);
      baseTileRef.current = null;
    }
    if (refTileRef.current) {
      mapRef.current.removeLayer(refTileRef.current);
      refTileRef.current = null;
    }

    // Add base tiles
    baseTileRef.current = L.tileLayer(provider.base, {
      maxZoom: provider.maxZoom,
      attribution: provider.attribution,
    }).addTo(mapRef.current);

    // Add reference labels overlay if available (e.g. for Dark Canvas)
    if (provider.ref) {
      refTileRef.current = L.tileLayer(provider.ref, {
        maxZoom: provider.maxZoom,
      }).addTo(mapRef.current);
    }
  }, []);

  // Initialize Map with resilient script readiness check
  useEffect(() => {
    let checkTimer;

    const initMap = () => {
      const L = window.L;
      if (!L || !mapContainerRef.current || mapRef.current) return;

      // Create Leaflet map instance
      mapRef.current = L.map(mapContainerRef.current, {
        zoomControl: true,
        attributionControl: false,
      }).setView([0, 0], 2);

      // Apply initial tiles (Esri Dark Canvas by default - no API key needed)
      applyTileLayer(mapStyle);

      // Initialize path polyline for ISS orbit history
      polylineRef.current = L.polyline(history, {
        color: '#00d4ff',
        weight: 3,
        opacity: 0.85,
      }).addTo(mapRef.current);

      // Center map on last saved coordinate if available
      if (history.length > 0) {
        mapRef.current.setView(history[history.length - 1], 3);
      }
    };

    if (window.L) {
      initMap();
    } else {
      checkTimer = setInterval(() => {
        if (window.L) {
          clearInterval(checkTimer);
          initMap();
        }
      }, 100);
    }

    return () => {
      if (checkTimer) clearInterval(checkTimer);
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
        baseTileRef.current = null;
        refTileRef.current = null;
        markerRef.current = null;
        polylineRef.current = null;
      }
    };
  }, []);

  // Update tile style when user clicks map style selector
  const handleStyleChange = (styleKey) => {
    setMapStyle(styleKey);
    applyTileLayer(styleKey);
  };

  // Sync history state changes with polyline map overlay and localStorage
  useEffect(() => {
    try {
      localStorage.setItem('iss_trail_history', JSON.stringify(history));
    } catch (err) {
      void err;
    }

    if (polylineRef.current) {
      polylineRef.current.setLatLngs(history);
    }
  }, [history]);

  const fetchPosition = useCallback(async () => {
    try {
      const res = await fetch(ISS_API);
      if (!res.ok) throw new Error('Failed to fetch ISS position');
      const data = await res.json();

      const pos = {
        lat: data.latitude,
        lng: data.longitude,
        velocity: data.velocity,
        altitude: data.altitude,
        timestamp: data.timestamp,
        visibility: data.visibility,
      };

      setPosition(pos);
      setError(null);

      // Update map position and marker
      const L = window.L;
      if (L && mapRef.current) {
        const latlng = [pos.lat, pos.lng];

        // Center map on ISS on first load
        if (!markerRef.current) {
          mapRef.current.setView(latlng, 3);

          // Create custom pulsing ISS icon
          const issIcon = L.divIcon({
            className: 'custom-iss-icon',
            html: `
              <div class="pulsing-marker">
                <div class="inner-dot"></div>
                <div class="outer-ring"></div>
              </div>
            `,
            iconSize: [24, 24],
            iconAnchor: [12, 12],
          });

          // Add ISS marker
          markerRef.current = L.marker(latlng, { icon: issIcon })
            .addTo(mapRef.current)
            .bindPopup(`<b>ISS Location</b><br>Lat: ${pos.lat.toFixed(4)}<br>Lng: ${pos.lng.toFixed(4)}<br>Alt: ${pos.altitude.toFixed(1)} km<br>Vel: ${pos.velocity.toFixed(1)} km/h`)
            .openPopup();
        } else {
          // Update marker position & popup
          markerRef.current.setLatLng(latlng);
          const popup = markerRef.current.getPopup();
          if (popup) {
            popup.setContent(`<b>ISS Location</b><br>Lat: ${pos.lat.toFixed(4)}<br>Lng: ${pos.lng.toFixed(4)}<br>Alt: ${pos.altitude.toFixed(1)} km<br>Vel: ${pos.velocity.toFixed(1)} km/h`);
          }

          // Smoothly pan map to follow the ISS if follow mode is active
          if (followRef.current) {
            mapRef.current.panTo(latlng);
          }
        }

        // Add coordinate to trail (avoid duplicate updates)
        setHistory((prev) => {
          const lastPoint = prev[prev.length - 1];
          if (lastPoint && lastPoint[0] === latlng[0] && lastPoint[1] === latlng[1]) {
            return prev;
          }
          return [...prev, latlng].slice(-100);
        });
      }
    } catch (err) {
      setError(err.message);
    }
  }, []);

  useEffect(() => {
    fetchPosition();
    if (!isPaused) {
      intervalRef.current = setInterval(fetchPosition, 5000);
    }
    return () => clearInterval(intervalRef.current);
  }, [fetchPosition, isPaused]);

  const handleClearTrail = () => {
    setHistory([]);
    try {
      localStorage.removeItem('iss_trail_history');
    } catch (err) {
      void err;
    }
    if (polylineRef.current) {
      polylineRef.current.setLatLngs([]);
    }
  };

  const handleCenterOnISS = () => {
    if (position && mapRef.current) {
      mapRef.current.setView([position.lat, position.lng], 4);
      setFollowISS(true);
    }
  };

  return (
    <div className="iss-tracker-page">
      <div className="iss-hero">
        <h1>ISS Live Tracker</h1>
        <p>Track the International Space Station in real-time on an interactive map</p>
      </div>

      {position && (
        <div className="iss-stats">
          <div className="iss-stat">
            <span className="stat-label">Latitude</span>
            <span className="stat-value">{position.lat.toFixed(4)}</span>
          </div>
          <div className="iss-stat">
            <span className="stat-label">Longitude</span>
            <span className="stat-value">{position.lng.toFixed(4)}</span>
          </div>
          <div className="iss-stat">
            <span className="stat-label">Altitude</span>
            <span className="stat-value">{position.altitude.toFixed(1)} km</span>
          </div>
          <div className="iss-stat">
            <span className="stat-label">Velocity</span>
            <span className="stat-value">{position.velocity.toFixed(1)} km/h</span>
          </div>
        </div>
      )}

      <div className="iss-controls">
        <button onClick={() => setIsPaused(!isPaused)}>
          {isPaused ? 'Resume Tracking' : 'Pause Tracking'}
        </button>
        <button onClick={handleClearTrail}>Clear Trail</button>
        <button
          className={followISS ? 'active' : ''}
          onClick={() => setFollowISS(!followISS)}
          title="Auto-pan map to ISS location"
        >
          {followISS ? 'Follow ISS: ON' : 'Follow ISS: OFF'}
        </button>
        <button onClick={handleCenterOnISS} title="Center view directly on the ISS">
          Recenter ISS
        </button>

        <div className="iss-style-toggle" role="group" aria-label="Map style selector">
          {Object.entries(TILE_PROVIDERS).map(([key, provider]) => (
            <button
              key={key}
              className={mapStyle === key ? 'active' : ''}
              onClick={() => handleStyleChange(key)}
            >
              {provider.name}
            </button>
          ))}
        </div>

        <span className="update-note">Updates every 5 seconds</span>
      </div>

      {error && <p className="iss-error">{error}</p>}

      <div className="iss-map-container">
        {/* Div container for Leaflet map */}
        <div ref={mapContainerRef} className="iss-map"></div>
      </div>

      <div className="iss-info-section">
        <h2>About the ISS</h2>
        <div className="iss-facts">
          <div className="iss-fact">
            <h3>Orbital Speed</h3>
            <p>The ISS travels at approximately 28,000 km/h, completing one orbit around Earth every 90 minutes.</p>
          </div>
          <div className="iss-fact">
            <h3>Altitude</h3>
            <p>It orbits at roughly 408 km above Earth's surface, in low Earth orbit (LEO).</p>
          </div>
          <div className="iss-fact">
            <h3>Size</h3>
            <p>The station spans 109 meters end-to-end, roughly the size of a football field including the solar arrays.</p>
          </div>
          <div className="iss-fact">
            <h3>Crew</h3>
            <p>Typically hosts 6-7 crew members from multiple international space agencies.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ISSTracker;
