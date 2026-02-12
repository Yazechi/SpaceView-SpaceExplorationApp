import { useState, useEffect, useCallback } from 'react';
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
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [startDate, endDate]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const sorted = [...asteroids].sort((a, b) => {
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

  function getThreatLevel(asteroid) {
    if (!asteroid.is_potentially_hazardous_asteroid) return 'safe';
    const dist = parseFloat(asteroid.close_approach_data[0]?.miss_distance?.lunar || 999);
    if (dist < 5) return 'high';
    if (dist < 20) return 'medium';
    return 'low';
  }

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

      <div className="asteroid-list">
        {sorted.map((asteroid) => {
          const approach = asteroid.close_approach_data[0] || {};
          const diamMin = asteroid.estimated_diameter.meters.estimated_diameter_min.toFixed(1);
          const diamMax = asteroid.estimated_diameter.meters.estimated_diameter_max.toFixed(1);
          const threat = getThreatLevel(asteroid);

          return (
            <div key={asteroid.id} className={`asteroid-card threat-${threat}`}>
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
