import { useState, useEffect, useCallback, useMemo } from 'react';
import { getNearEarthObjects } from '../services/nasaApi';
import LoadingSpinner from '../components/LoadingSpinner/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage/ErrorMessage';
import '../styles/Asteroids.css';

function formatDate(date) {
  return date.toISOString().split('T')[0];
}

function Asteroids() {
  const [startDate, setStartDate] = useState(() => formatDate(new Date()));
  const [endDate, setEndDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 3);
    return formatDate(d);
  });
  const [asteroids, setAsteroids] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [sortBy, setSortBy] = useState('date');
  const [selectedRadarAsteroid, setSelectedRadarAsteroid] = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getNearEarthObjects(startDate, endDate);
      const allAsteroids = [];
      Object.entries(data.near_earth_objects).forEach(([date, objects]) => {
        objects.forEach((obj) => {
          allAsteroids.push({ ...obj, close_approach_date: date });
        });
      });
      setAsteroids(allAsteroids);
      setStats({
        total: data.element_count,
        hazardous: allAsteroids.filter((a) => a.is_potentially_hazardous_asteroid).length,
      });
      setSelectedRadarAsteroid(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [startDate, endDate]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const sorted = useMemo(() => {
    return [...asteroids].sort((a, b) => {
      if (sortBy === 'size') {
        return (
          b.estimated_diameter.kilometers.estimated_diameter_max -
          a.estimated_diameter.kilometers.estimated_diameter_max
        );
      }
      if (sortBy === 'distance') {
        return (
          parseFloat(a.close_approach_data[0]?.miss_distance?.kilometers || 0) -
          parseFloat(b.close_approach_data[0]?.miss_distance?.kilometers || 0)
        );
      }
      if (sortBy === 'velocity') {
        return (
          parseFloat(b.close_approach_data[0]?.relative_velocity?.kilometers_per_hour || 0) -
          parseFloat(a.close_approach_data[0]?.relative_velocity?.kilometers_per_hour || 0)
        );
      }
      return a.close_approach_date.localeCompare(b.close_approach_date);
    });
  }, [asteroids, sortBy]);

  function getThreatLevel(asteroid) {
    if (!asteroid.is_potentially_hazardous_asteroid) return 'safe';
    const dist = parseFloat(asteroid.close_approach_data[0]?.miss_distance?.lunar || 999);
    if (dist < 5) return 'high';
    if (dist < 20) return 'medium';
    return 'low';
  }

  // Radar math
  const maxLD = 30; // Max Lunar Distance we show on radar
  const radarRadius = 210; // Radius in SVG pixels

  const getRadarCoords = (asteroid) => {
    const approach = asteroid.close_approach_data[0] || {};
    const missDistLD = parseFloat(approach.miss_distance?.lunar || 0);
    
    // Hash the ID to get a stable, non-overlapping orbital angle for display
    const idHash = asteroid.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const angle = (idHash % 360) * (Math.PI / 180);
    
    const distanceFactor = Math.min(missDistLD / maxLD, 1);
    const distance = 20 + distanceFactor * (radarRadius - 20); // offset Earth slightly
    
    const x = 250 + Math.cos(angle) * distance;
    const y = 250 + Math.sin(angle) * distance;
    
    return { x, y, dist: missDistLD };
  };

  return (
    <div className="asteroids-page">
      <div className="asteroids-hero">
        <h1>Near-Earth Asteroid Tracker</h1>
        <p>Track asteroids and near-Earth objects approaching our planet</p>
      </div>

      <div className="asteroid-controls">
        <div className="date-range">
          <div className="date-field">
            <label htmlFor="neo-start">Start Date:</label>
            <input
              id="neo-start"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>
          <div className="date-field">
            <label htmlFor="neo-end">End Date:</label>
            <input
              id="neo-end"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
        </div>

        <div className="sort-controls">
          <label>Sort by:</label>
          <div className="sort-buttons">
            {['date', 'size', 'distance', 'velocity'].map((s) => (
              <button
                key={s}
                className={sortBy === s ? 'active' : ''}
                onClick={() => setSortBy(s)}
              >
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {stats && (
        <div className="asteroid-stats">
          <div className="stat-card">
            <span className="stat-value">{stats.total}</span>
            <span className="stat-label">Total Objects</span>
          </div>
          <div className="stat-card hazardous">
            <span className="stat-value">{stats.hazardous}</span>
            <span className="stat-label">Potentially Hazardous</span>
          </div>
        </div>
      )}

      {loading && <LoadingSpinner />}
      {error && <ErrorMessage message={error} onRetry={fetchData} />}

      {!loading && !error && asteroids.length > 0 && (
        <div className="radar-section">
          <h2>Visual Radar Map</h2>
          <p className="radar-subtitle">Scanning orbital paths within 30 Lunar Distances (LD) from Earth</p>
          
          <div className="radar-dashboard">
            <div className="radar-canvas-container">
              <svg viewBox="0 0 500 500" className="radar-svg">
                {/* Concentric radar range lines */}
                <circle cx="250" cy="250" r="210" fill="none" stroke="rgba(59, 130, 246, 0.18)" strokeWidth="1" />
                <circle cx="250" cy="250" r="140" fill="none" stroke="rgba(59, 130, 246, 0.18)" strokeWidth="1" />
                <circle cx="250" cy="250" r="70" fill="none" stroke="rgba(59, 130, 246, 0.18)" strokeWidth="1" />
                <circle cx="250" cy="250" r="28" fill="none" stroke="rgba(239, 68, 68, 0.2)" strokeWidth="1" strokeDasharray="4,4" />

                {/* Grid lines */}
                <line x1="250" y1="20" x2="250" y2="480" stroke="rgba(59, 130, 246, 0.08)" strokeWidth="1" />
                <line x1="20" y1="250" x2="480" y2="250" stroke="rgba(59, 130, 246, 0.08)" strokeWidth="1" />

                {/* Radar sweep effect */}
                <div className="radar-sweep-effect"></div>

                {/* Range markers */}
                <text x="250" y="32" fill="rgba(255,255,255,0.4)" fontSize="9" textAnchor="middle">30 LD (11.5M km)</text>
                <text x="250" y="102" fill="rgba(255,255,255,0.4)" fontSize="9" textAnchor="middle">20 LD</text>
                <text x="250" y="172" fill="rgba(255,255,255,0.4)" fontSize="9" textAnchor="middle">10 LD</text>
                <text x="250" y="244" fill="rgba(239, 68, 68, 0.7)" fontSize="8" textAnchor="middle">3 LD (Close Call)</text>

                {/* Earth at center */}
                <g>
                  <circle cx="250" cy="250" r="11" fill="rgba(59, 130, 246, 0.2)" className="earth-pulse" />
                  <circle cx="250" cy="250" r="5" fill="#3b82f6" />
                  <text x="250" y="270" fill="#60a5fa" fontSize="9" fontWeight="700" textAnchor="middle">EARTH</text>
                </g>

                {/* Plotting Asteroids */}
                {sorted.map((asteroid) => {
                  const coords = getRadarCoords(asteroid);
                  const threat = getThreatLevel(asteroid);
                  const isSelected = selectedRadarAsteroid?.id === asteroid.id;
                  
                  let markerColor = '#9ca3af'; // safe
                  if (threat === 'high') markerColor = '#ef4444';
                  else if (threat === 'medium') markerColor = '#f59e0b';
                  else if (threat === 'low') markerColor = '#10b981';

                  return (
                    <g 
                      key={asteroid.id}
                      onMouseEnter={() => setSelectedRadarAsteroid(asteroid)}
                      onClick={() => {
                        setSelectedRadarAsteroid(asteroid);
                        const cardElement = document.getElementById(`asteroid-card-${asteroid.id}`);
                        if (cardElement) {
                          cardElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        }
                      }}
                      style={{ cursor: 'pointer' }}
                    >
                      {/* Highlight outline circle */}
                      {isSelected && (
                        <circle 
                          cx={coords.x} 
                          cy={coords.y} 
                          r="11" 
                          fill="none" 
                          stroke={markerColor} 
                          strokeWidth="1.5" 
                          className="radar-marker-pulse" 
                        />
                      )}
                      
                      {/* Target indicator ring */}
                      <circle 
                        cx={coords.x} 
                        cy={coords.y} 
                        r="7" 
                        fill="none" 
                        stroke={markerColor} 
                        strokeWidth="0.5" 
                        opacity="0.3" 
                      />

                      {/* Asteroid body dot */}
                      <circle 
                        cx={coords.x} 
                        cy={coords.y} 
                        r={isSelected ? 5.5 : 4} 
                        fill={markerColor} 
                        className={threat === 'high' ? 'pulsing-danger-dot' : ''}
                      />
                    </g>
                  );
                })}
              </svg>
            </div>

            {/* Radar readout Details Panel */}
            <div className="radar-details-panel">
              {selectedRadarAsteroid ? (
                <div className="radar-detail-content">
                  <div className="panel-header">
                    <span className={`detail-tag ${getThreatLevel(selectedRadarAsteroid)}`}>
                      {getThreatLevel(selectedRadarAsteroid).toUpperCase()} HAZARD
                    </span>
                    <h3>{selectedRadarAsteroid.name.replace(/[()]/g, '')}</h3>
                  </div>
                  
                  <div className="detail-rows">
                    <div className="panel-row">
                      <span className="label">Miss Distance</span>
                      <span className="val">
                        {parseFloat(selectedRadarAsteroid.close_approach_data[0]?.miss_distance?.kilometers || 0).toLocaleString(undefined, { maximumFractionDigits: 0 })} km
                      </span>
                    </div>
                    <div className="panel-row">
                      <span className="label">Lunar Distance</span>
                      <span className="val highlighted">
                        {parseFloat(selectedRadarAsteroid.close_approach_data[0]?.miss_distance?.lunar || 0).toFixed(2)} LD
                      </span>
                    </div>
                    <div className="panel-row">
                      <span className="label">Estimated Diameter</span>
                      <span className="val">
                        {selectedRadarAsteroid.estimated_diameter.meters.estimated_diameter_min.toFixed(0)} - {selectedRadarAsteroid.estimated_diameter.meters.estimated_diameter_max.toFixed(0)} m
                      </span>
                    </div>
                    <div className="panel-row">
                      <span className="label">Relative Velocity</span>
                      <span className="val">
                        {parseFloat(selectedRadarAsteroid.close_approach_data[0]?.relative_velocity?.kilometers_per_hour || 0).toLocaleString(undefined, { maximumFractionDigits: 0 })} km/h
                      </span>
                    </div>
                    <div className="panel-row">
                      <span className="label">Closest Approach</span>
                      <span className="val">{selectedRadarAsteroid.close_approach_date}</span>
                    </div>
                  </div>

                  {selectedRadarAsteroid.is_potentially_hazardous_asteroid && (
                    <div className="panel-warning-box">
                      ⚠️ Potentially Hazardous Space Object
                    </div>
                  )}
                  
                  <div className="panel-action-hint">
                    Click dot to scroll to data profile card below
                  </div>
                </div>
              ) : (
                <div className="radar-panel-placeholder">
                  <div className="scanner-line"></div>
                  <p>🛰️ SCANNER STANDBY</p>
                  <span>Hover or click any orbital asteroid vector dot to lock coordinates and load diagnostic telemetry.</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="asteroid-list">
        {sorted.map((asteroid) => {
          const approach = asteroid.close_approach_data[0] || {};
          const diamMin = asteroid.estimated_diameter.meters.estimated_diameter_min.toFixed(1);
          const diamMax = asteroid.estimated_diameter.meters.estimated_diameter_max.toFixed(1);
          const threat = getThreatLevel(asteroid);

          return (
            <div 
              key={asteroid.id} 
              id={`asteroid-card-${asteroid.id}`}
              className={`asteroid-card threat-${threat} ${selectedRadarAsteroid?.id === asteroid.id ? 'highlighted-card' : ''}`}
            >
              <div className="asteroid-header">
                <h3>{asteroid.name.replace(/[()]/g, '')}</h3>
                <span className={`threat-badge ${threat}`}>{threat.toUpperCase()}</span>
              </div>
              <div className="asteroid-details">
                <div className="detail">
                  <span className="detail-label">Diameter</span>
                  <span className="detail-value">{diamMin} - {diamMax} m</span>
                </div>
                <div className="detail">
                  <span className="detail-label">Miss Distance</span>
                  <span className="detail-value">
                    {parseFloat(approach.miss_distance?.kilometers || 0).toLocaleString(undefined, { maximumFractionDigits: 0 })} km
                  </span>
                </div>
                <div className="detail">
                  <span className="detail-label">Velocity</span>
                  <span className="detail-value">
                    {parseFloat(approach.relative_velocity?.kilometers_per_hour || 0).toLocaleString(undefined, { maximumFractionDigits: 0 })} km/h
                  </span>
                </div>
                <div className="detail">
                  <span className="detail-label">Approach Date</span>
                  <span className="detail-value">{asteroid.close_approach_date}</span>
                </div>
                <div className="detail">
                  <span className="detail-label">Lunar Distance</span>
                  <span className="detail-value">
                    {parseFloat(approach.miss_distance?.lunar || 0).toFixed(2)} LD
                  </span>
                </div>
              </div>
              {asteroid.is_potentially_hazardous_asteroid && (
                <div className="hazard-warning">Potentially Hazardous Asteroid</div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default Asteroids;
