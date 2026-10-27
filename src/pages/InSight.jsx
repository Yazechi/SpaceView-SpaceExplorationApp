import { useState, useEffect } from 'react';
import { getInSightWeather } from '../services/nasaApi';
import useSEO from '../hooks/useSEO';
import LoadingSpinner from '../components/LoadingSpinner/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage/ErrorMessage';
import '../styles/InSight.css';

function InSight() {
  useSEO({
    title: 'InSight Mars Weather & Atmospheric Data',
    description: 'Explore atmospheric weather reports, temperatures, wind, and air pressure recorded on Elysium Planitia, Mars by NASA InSight.',
    canonicalUrl: 'https://space-view-rho.vercel.app/insight',
  });

  const [solData, setSolData] = useState([]);
  const [selectedSol, setSelectedSol] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchWeather() {
      try {
        const data = await getInSightWeather();
        const solKeys = data.sol_keys || Object.keys(data).filter((k) => !isNaN(k)).sort((a, b) => a - b);
        const sols = solKeys.map((sol) => {
          const d = data[sol];
          return {
            sol,
            season: d.Season || d.Northern_season || '—',
            firstUTC: d.First_UTC,
            lastUTC: d.Last_UTC,
            temp: d.AT ? { avg: d.AT.av, min: d.AT.mn, max: d.AT.mx } : null,
            wind: d.HWS ? { avg: d.HWS.av, min: d.HWS.mn, max: d.HWS.mx } : null,
            pressure: d.PRE ? { avg: d.PRE.av, min: d.PRE.mn, max: d.PRE.mx } : null,
            windDir: d.WD?.most_common?.compass_point || '—',
          };
        });
        setSolData(sols);
        if (sols.length > 0) setSelectedSol(sols[sols.length - 1]);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchWeather();
  }, []);

  function tempBar(val, min, max) {
    const range = max - min || 1;
    const pct = ((val - min) / range) * 100;
    return Math.max(0, Math.min(100, pct));
  }

  return (
    <div className="insight-page">
      <div className="insight-hero">
        <h1>InSight Mars Weather</h1>
        <p>Weather data collected by NASA's InSight lander on the surface of Mars</p>
        <span className="insight-note">
          InSight collected weather data from Sol 0 (Nov 2018) to Sol 675+ (Oct 2020). This data represents the final available readings.
        </span>
      </div>

      {loading && <LoadingSpinner />}
      {error && <ErrorMessage message={error} onRetry={() => window.location.reload()} />}

      {!loading && solData.length > 0 && (
        <>
          <div className="sol-selector">
            {solData.map((s) => (
              <button
                key={s.sol}
                className={`sol-btn ${selectedSol?.sol === s.sol ? 'active' : ''}`}
                onClick={() => setSelectedSol(s)}
              >
                Sol {s.sol}
              </button>
            ))}
          </div>

          {selectedSol && (
            <div className="sol-detail">
              <div className="sol-header">
                <h2>Sol {selectedSol.sol}</h2>
                <div className="sol-meta">
                  <span>Season: {selectedSol.season}</span>
                  {selectedSol.firstUTC && (
                    <span>{new Date(selectedSol.firstUTC).toLocaleDateString()} — {new Date(selectedSol.lastUTC).toLocaleDateString()}</span>
                  )}
                </div>
              </div>

              <div className="weather-cards">
                {/* Temperature */}
                <div className="weather-card temp-card">
                  <div className="weather-icon">🌡️</div>
                  <h3>Temperature</h3>
                  {selectedSol.temp ? (
                    <>
                      <div className="weather-main">{selectedSol.temp.avg.toFixed(1)}°C</div>
                      <div className="weather-range">
                        <div className="range-bar-container">
                          <div className="range-bar"
                            style={{
                              left: `${tempBar(selectedSol.temp.min, -100, 0)}%`,
                              width: `${tempBar(selectedSol.temp.max, -100, 0) - tempBar(selectedSol.temp.min, -100, 0)}%`,
                            }}
                          />
                          <div className="range-marker" style={{ left: `${tempBar(selectedSol.temp.avg, -100, 0)}%` }} />
                        </div>
                        <div className="range-labels">
                          <span>{selectedSol.temp.min.toFixed(1)}°C</span>
                          <span>{selectedSol.temp.max.toFixed(1)}°C</span>
                        </div>
                      </div>
                    </>
                  ) : <div className="no-data">No data</div>}
                </div>

                {/* Wind Speed */}
                <div className="weather-card wind-card">
                  <div className="weather-icon">💨</div>
                  <h3>Wind Speed</h3>
                  {selectedSol.wind ? (
                    <>
                      <div className="weather-main">{selectedSol.wind.avg.toFixed(1)} m/s</div>
                      <div className="weather-sub">
                        <span>Min: {selectedSol.wind.min.toFixed(1)} m/s</span>
                        <span>Max: {selectedSol.wind.max.toFixed(1)} m/s</span>
                      </div>
                      <div className="wind-direction">
                        <span>Prevailing: {selectedSol.windDir}</span>
                      </div>
                    </>
                  ) : <div className="no-data">No data</div>}
                </div>

                {/* Pressure */}
                <div className="weather-card pressure-card">
                  <div className="weather-icon">📊</div>
                  <h3>Atmospheric Pressure</h3>
                  {selectedSol.pressure ? (
                    <>
                      <div className="weather-main">{selectedSol.pressure.avg.toFixed(1)} Pa</div>
                      <div className="weather-sub">
                        <span>Min: {selectedSol.pressure.min.toFixed(1)} Pa</span>
                        <span>Max: {selectedSol.pressure.max.toFixed(1)} Pa</span>
                      </div>
                    </>
                  ) : <div className="no-data">No data</div>}
                </div>
              </div>

              {/* Sol comparison mini chart */}
              <div className="sol-comparison">
                <h3>Temperature Across Sols</h3>
                <div className="sol-bars">
                  {solData.map((s) => (
                    <div key={s.sol} className={`sol-bar-group ${selectedSol.sol === s.sol ? 'selected' : ''}`} onClick={() => setSelectedSol(s)}>
                      {s.temp ? (
                        <div className="sol-bar-wrapper">
                          <div className="sol-bar"
                            style={{
                              height: `${Math.max(10, ((s.temp.avg + 100) / 100) * 100)}%`,
                              background: s.temp.avg > -50 ? '#f59e0b' : '#3b82f6',
                            }}
                          />
                        </div>
                      ) : (
                        <div className="sol-bar-wrapper"><div className="sol-bar no-data-bar" /></div>
                      )}
                      <span className="sol-bar-label">Sol {s.sol}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </>
      )}

      <div className="insight-about">
        <h2>About InSight</h2>
        <div className="insight-facts">
          <div className="insight-fact">
            <h3>Mission</h3>
            <p>Interior Exploration using Seismic Investigations, Geodesy and Heat Transport. Launched May 5, 2018 and landed on Elysium Planitia on November 26, 2018.</p>
          </div>
          <div className="insight-fact">
            <h3>Instruments</h3>
            <p>SEIS (seismometer), HP³ (heat probe), RISE (rotation), TWINS (weather sensors), and a pressure sensor.</p>
          </div>
          <div className="insight-fact">
            <h3>Key Discovery</h3>
            <p>InSight detected over 1,300 marsquakes and revealed Mars has a liquid iron core about 1,830 km in radius.</p>
          </div>
          <div className="insight-fact">
            <h3>End of Mission</h3>
            <p>NASA declared the mission complete on December 21, 2022, after dust accumulation reduced solar panel power below operational levels.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default InSight;
