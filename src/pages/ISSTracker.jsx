import { useState, useEffect, useRef, useCallback } from 'react';
import '../styles/ISSTracker.css';

const ISS_API = 'https://api.wheretheiss.at/v1/satellites/25544';

function ISSTracker() {
  const [position, setPosition] = useState(null);
  const [history, setHistory] = useState([]);
  const [error, setError] = useState(null);
  const [isPaused, setIsPaused] = useState(false);
  const svgRef = useRef(null);
  const intervalRef = useRef(null);

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
      setHistory((prev) => [...prev.slice(-60), pos]);
      setError(null);
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

  // Convert lat/lng to SVG coordinates (equirectangular projection)
  function toSVG(lat, lng) {
    const x = ((lng + 180) / 360) * 1000;
    const y = ((90 - lat) / 180) * 500;
    return { x, y };
  }

  const issPos = position ? toSVG(position.lat, position.lng) : null;

  return (
    <div className="iss-tracker-page">
      <div className="iss-hero">
        <h1>ISS Live Tracker</h1>
        <p>Track the International Space Station in real-time as it orbits Earth</p>
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
        <button onClick={() => setHistory([])}>Clear Trail</button>
        <span className="update-note">Updates every 5 seconds</span>
      </div>

      {error && <p className="iss-error">{error}</p>}

      <div className="iss-map-container">
        <svg ref={svgRef} viewBox="0 0 1000 500" className="iss-map">
          {/* World map outline (simplified) */}
          <rect x="0" y="0" width="1000" height="500" fill="#0a1628" />
          
          {/* Grid lines */}
          {Array.from({ length: 7 }, (_, i) => (
            <line key={`h${i}`} x1="0" y1={i * 83.3} x2="1000" y2={i * 83.3} stroke="#1a2a4a" strokeWidth="0.5" />
          ))}
          {Array.from({ length: 13 }, (_, i) => (
            <line key={`v${i}`} x1={i * 83.3} y1="0" x2={i * 83.3} y2="500" stroke="#1a2a4a" strokeWidth="0.5" />
          ))}

          {/* Equator */}
          <line x1="0" y1="250" x2="1000" y2="250" stroke="#2a3a5a" strokeWidth="1" strokeDasharray="4,4" />
          {/* Prime meridian */}
          <line x1="500" y1="0" x2="500" y2="500" stroke="#2a3a5a" strokeWidth="1" strokeDasharray="4,4" />

          {/* Simplified continent outlines */}
          {/* North America */}
          <ellipse cx="250" cy="170" rx="120" ry="80" fill="#162040" stroke="#2a4a7a" strokeWidth="1" />
          {/* South America */}
          <ellipse cx="310" cy="320" rx="60" ry="90" fill="#162040" stroke="#2a4a7a" strokeWidth="1" />
          {/* Europe */}
          <ellipse cx="520" cy="150" rx="50" ry="40" fill="#162040" stroke="#2a4a7a" strokeWidth="1" />
          {/* Africa */}
          <ellipse cx="540" cy="280" rx="60" ry="80" fill="#162040" stroke="#2a4a7a" strokeWidth="1" />
          {/* Asia */}
          <ellipse cx="680" cy="170" rx="120" ry="70" fill="#162040" stroke="#2a4a7a" strokeWidth="1" />
          {/* Australia */}
          <ellipse cx="800" cy="340" rx="50" ry="35" fill="#162040" stroke="#2a4a7a" strokeWidth="1" />

          {/* Trail */}
          {history.map((point, i) => {
            const pos = toSVG(point.lat, point.lng);
            const opacity = (i + 1) / history.length * 0.6;
            return (
              <circle
                key={i}
                cx={pos.x}
                cy={pos.y}
                r="2"
                fill="#00d4ff"
                opacity={opacity}
              />
            );
          })}

          {/* ISS marker */}
          {issPos && (
            <g>
              <circle cx={issPos.x} cy={issPos.y} r="12" fill="none" stroke="#00d4ff" strokeWidth="2" className="iss-pulse" />
              <circle cx={issPos.x} cy={issPos.y} r="5" fill="#00d4ff" />
              <text x={issPos.x + 16} y={issPos.y + 4} fill="#ffffff" fontSize="12" fontFamily="monospace">ISS</text>
            </g>
          )}
        </svg>
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
