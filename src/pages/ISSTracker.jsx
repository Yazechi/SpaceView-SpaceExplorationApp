import { useState, useEffect, useRef, useCallback } from 'react';
import '../styles/ISSTracker.css';

const ISS_API = 'https://api.wheretheiss.at/v1/satellites/25544';

function ISSTracker() {
  const [position, setPosition] = useState(null);
  const [error, setError] = useState(null);
  const [isPaused, setIsPaused] = useState(false);
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
  const markerRef = useRef(null);
  const polylineRef = useRef(null);
  const intervalRef = useRef(null);

  // Initialize Map
  useEffect(() => {
    const L = window.L;
    if (L && mapContainerRef.current && !mapRef.current) {
      // Create Leaflet map instance
      mapRef.current = L.map(mapContainerRef.current, {
        zoomControl: true,
        attributionControl: false
      }).setView([0, 0], 2);

      // Add CartoDB Dark Matter tiles
      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        maxZoom: 18,
      }).addTo(mapRef.current);

      // Initialize path polyline for tracking ISS orbit history with high visibility neon cyan color
      polylineRef.current = L.polyline(history, {
        color: '#00d4ff',
        weight: 3,
        opacity: 0.85
      }).addTo(mapRef.current);

      // Center map on last saved coordinate if available
      if (history.length > 0) {
        mapRef.current.setView(history[history.length - 1], 3);
      }
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  // Sync history state changes with polyline map overlay and localStorage
  useEffect(() => {
    try {
      localStorage.setItem('iss_trail_history', JSON.stringify(history));
    } catch (e) {}

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
          
          // Create custom pulsing icon
          const issIcon = L.divIcon({
            className: 'custom-iss-icon',
            html: `
              <div class="pulsing-marker">
                <div class="inner-dot"></div>
                <div class="outer-ring"></div>
              </div>
            `,
            iconSize: [24, 24],
            iconAnchor: [12, 12]
          });

          // Add ISS marker
          markerRef.current = L.marker(latlng, { icon: issIcon })
            .addTo(mapRef.current)
            .bindPopup(`<b>ISS Location</b><br>Lat: ${pos.lat.toFixed(4)}<br>Lng: ${pos.lng.toFixed(4)}`)
            .openPopup();
        } else {
          // Update marker position
          markerRef.current.setLatLng(latlng);
          markerRef.current.getPopup().setContent(`<b>ISS Location</b><br>Lat: ${pos.lat.toFixed(4)}<br>Lng: ${pos.lng.toFixed(4)}`);
          
          // Smoothly pan map to follow the ISS
          mapRef.current.panTo(latlng);
        }

        // Add coordinate to trail (avoid duplicate updates)
        setHistory((prev) => {
          const lastPoint = prev[prev.length - 1];
          if (lastPoint && lastPoint[0] === latlng[0] && lastPoint[1] === latlng[1]) {
            return prev;
          }
          return [...prev, latlng].slice(-100); // keep last 100 points
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
    } catch (e) {}
    if (polylineRef.current) {
      polylineRef.current.setLatLngs([]);
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
