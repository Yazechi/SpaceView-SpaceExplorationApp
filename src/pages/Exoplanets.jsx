import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Html } from '@react-three/drei';
import * as THREE from 'three';
import { getExoplanets } from '../services/nasaApi';
import useSEO from '../hooks/useSEO';
import LoadingSpinner from '../components/LoadingSpinner/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage/ErrorMessage';
import '../styles/Exoplanets.css';

const DISCOVERY_METHODS = ['All', 'Transit', 'Radial Velocity', 'Imaging', 'Microlensing', 'Eclipse Timing Variations'];
const YEAR_OPTIONS = ['All', '2026', '2025', '2024', '2023', '2022', '2021', '2020', '2015-2019', '2010-2014', '<2010'];

function ExoplanetOrbitScene({ planet }) {
  const planetRef = useRef();
  
  // Calculate semi-major axis in AU using Kepler's 3rd Law: a = (T / 365.25)^(2/3) (assuming ~1 solar mass star)
  const orbitalPeriodDays = planet.pl_orbper || 365;
  const a = useMemo(() => Math.pow(orbitalPeriodDays / 365.25, 2 / 3), [orbitalPeriodDays]);
  
  // Scale exoplanet orbit to a fixed visual radius of 4 units, adjust Earth's orbit accordingly
  const exoplanetVisualRadius = 4.2;
  const earthVisualRadius = useMemo(() => 4.2 / a, [a]);
  
  // Speed factor inversely proportional to orbital period for visually pleasing rates
  const speed = useMemo(() => 1.8 * Math.sqrt(365.25 / orbitalPeriodDays), [orbitalPeriodDays]);

  useFrame((state) => {
    const t = state.clock.getElapsedTime() * speed * 0.4;
    if (planetRef.current) {
      planetRef.current.position.set(
        Math.cos(t) * exoplanetVisualRadius,
        0,
        Math.sin(t) * exoplanetVisualRadius
      );
      planetRef.current.rotation.y += 0.01;
    }
  });

  // Circular paths for orbital visualization
  const exoPoints = useMemo(() => {
    const pts = [];
    const segments = 90;
    for (let i = 0; i <= segments; i++) {
      const theta = (i / segments) * Math.PI * 2;
      pts.push(new THREE.Vector3(Math.cos(theta) * exoplanetVisualRadius, 0, Math.sin(theta) * exoplanetVisualRadius));
    }
    return pts;
  }, [exoplanetVisualRadius]);

  const earthPoints = useMemo(() => {
    const pts = [];
    const segments = 90;
    for (let i = 0; i <= segments; i++) {
      const theta = (i / segments) * Math.PI * 2;
      pts.push(new THREE.Vector3(Math.cos(theta) * earthVisualRadius, 0, Math.sin(theta) * earthVisualRadius));
    }
    return pts;
  }, [earthVisualRadius]);

  return (
    <>
      <ambientLight intensity={0.25} />
      <pointLight intensity={10} distance={60} decay={1} />
      
      {/* Central Star */}
      <mesh>
        <sphereGeometry args={[1.1, 32, 32]} />
        <meshBasicMaterial color="#f97316" />
      </mesh>

      {/* Exoplanet Orbit Ellipse Path */}
      <line>
        <bufferGeometry attach="geometry" setFromPoints={exoPoints} />
        <lineBasicMaterial attach="material" color="#60a5fa" opacity={0.6} transparent linewidth={1.5} />
      </line>

      {/* Exoplanet Node */}
      <mesh ref={planetRef}>
        <sphereGeometry args={[planet.pl_radj ? Math.max(planet.pl_radj * 0.35, 0.18) : 0.3, 32, 32]} />
        <meshStandardMaterial color="#3b82f6" roughness={0.7} emissive="#1d4ed8" emissiveIntensity={0.1} />
      </mesh>

      {/* Earth Orbit Reference Line */}
      {earthVisualRadius < 35 && earthVisualRadius > 0.4 && (
        <>
          <line>
            <bufferGeometry attach="geometry" setFromPoints={earthPoints} />
            <lineBasicMaterial attach="material" color="#10b981" opacity={0.25} transparent linewidth={1} />
          </line>
          <Html position={[earthVisualRadius, 0.1, 0]}>
            <div style={{ color: '#10b981', fontSize: '9px', fontFamily: 'monospace', whiteSpace: 'nowrap', opacity: 0.6 }}>
              Earth Reference (1 AU)
            </div>
          </Html>
        </>
      )}

      {/* Text overlays in R3F */}
      <Html position={[exoplanetVisualRadius, -0.4, 0]}>
        <div style={{ color: '#60a5fa', fontSize: '10px', fontFamily: 'monospace', fontWeight: '700', whiteSpace: 'nowrap' }}>
          {planet.pl_name} ({a.toFixed(3)} AU)
        </div>
      </Html>
    </>
  );
}

function Exoplanets() {
  useSEO({
    title: 'Exoplanet Explorer & 3D Orbits',
    description: 'Explore confirmed exoplanets using NASA Exoplanet Archive TAP data with interactive 3D orbital mechanics visualization on SpaceView.',
    canonicalUrl: 'https://space-view-rho.vercel.app/exoplanets',
  });

  const [allPlanets, setAllPlanets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [method, setMethod] = useState('All');
  const [yearFilter, setYearFilter] = useState('All');
  const [sortBy, setSortBy] = useState('disc_year');
  const [sortDir, setSortDir] = useState('DESC');
  const [page, setPage] = useState(0);
  const [stats, setStats] = useState(null);
  const [selectedPlanet, setSelectedPlanet] = useState(null);
  const perPage = 50;

  const buildQuery = useCallback(() => {
    let where = [];
    if (method !== 'All') where.push(`discoverymethod='${method}'`);
    if (yearFilter !== 'All') {
      if (yearFilter === '<2010') where.push('disc_year<2010');
      else if (yearFilter.includes('-')) {
        const [a, b] = yearFilter.split('-');
        where.push(`disc_year>=${a} AND disc_year<=${b}`);
      } else where.push(`disc_year=${yearFilter}`);
    }
    const whereClause = where.length > 0 ? `WHERE ${where.join(' AND ')}` : '';
    return `SELECT TOP 500 pl_name,hostname,discoverymethod,disc_year,pl_orbper,pl_bmassj,pl_radj,sy_dist FROM ps ${whereClause} ORDER BY ${sortBy} ${sortDir}`;
  }, [method, yearFilter, sortBy, sortDir]);

  const planets = allPlanets.slice(page * perPage, (page + 1) * perPage);
  const totalPages = Math.ceil(allPlanets.length / perPage);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getExoplanets(buildQuery());
      setAllPlanets(Array.isArray(data) ? data : []);
      setSelectedPlanet(null);
    } catch (err) {
      setError(err.message);
    } finally {
      loading && setLoading(false);
    }
  }, [buildQuery]);

  // Load stats once
  useEffect(() => {
    getExoplanets("SELECT COUNT(*) AS total FROM ps").then((d) => {
      if (d?.[0]) setStats({ total: d[0].total });
    }).catch(() => {});
    getExoplanets("SELECT discoverymethod, COUNT(*) AS cnt FROM ps GROUP BY discoverymethod ORDER BY cnt DESC").then((d) => {
      setStats((prev) => ({ ...prev, methods: d }));
    }).catch(() => {});
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  useEffect(() => { setPage(0); }, [method, yearFilter, sortBy, sortDir]);

  return (
    <div className="exoplanets-page">
      <div className="exo-hero">
        <h1>Exoplanet Explorer</h1>
        <p>Browse confirmed exoplanets from NASA's Exoplanet Archive</p>
      </div>

      {stats && (
        <div className="exo-stats">
          {stats.total && (
            <div className="exo-stat-card highlight">
              <span className="stat-value">{stats.total.toLocaleString()}</span>
              <span className="stat-label">Confirmed Entries</span>
            </div>
          )}
          {stats.methods?.slice(0, 4).map((m) => (
            <div key={m.discoverymethod} className="exo-stat-card">
              <span className="stat-value">{m.cnt.toLocaleString()}</span>
              <span className="stat-label">{m.discoverymethod}</span>
            </div>
          ))}
        </div>
      )}

      {selectedPlanet && (
        <div className="exo-orbit-section">
          <div className="exo-orbit-header">
            <h3>3D Orbit Simulation: {selectedPlanet.pl_name}</h3>
            <button className="exo-orbit-close" onClick={() => setSelectedPlanet(null)} aria-label="Close simulation">
              &times;
            </button>
          </div>
          
          <div className="exo-orbit-sandbox">
            <div className="exo-canvas-container">
              <Canvas camera={{ position: [0, 7, 9], fov: 45 }}>
                <ExoplanetOrbitScene planet={selectedPlanet} />
                <OrbitControls enableZoom={true} enableRotate={true} />
              </Canvas>
            </div>
            
            <div className="exo-orbit-readout">
              <h4>Readout Diagnostics</h4>
              <div className="readout-rows">
                <div className="readout-row">
                  <span className="label">Host Star</span>
                  <span className="val">{selectedPlanet.hostname}</span>
                </div>
                <div className="readout-row">
                  <span className="label">Orbital Semi-Major Axis</span>
                  <span className="val highlighted">
                    {Math.pow(selectedPlanet.pl_orbper / 365.25, 2/3).toFixed(3)} AU
                  </span>
                </div>
                <div className="readout-row">
                  <span className="label">Orbital Period</span>
                  <span className="val">{selectedPlanet.pl_orbper ? `${selectedPlanet.pl_orbper.toFixed(2)} days` : '—'}</span>
                </div>
                <div className="readout-row">
                  <span className="label">Mass (Jupiter Mass equivalents)</span>
                  <span className="val">{selectedPlanet.pl_bmassj ? `${selectedPlanet.pl_bmassj.toFixed(4)} M_Jup` : '—'}</span>
                </div>
                <div className="readout-row">
                  <span className="label">Radius (Jupiter Radii equivalents)</span>
                  <span className="val">{selectedPlanet.pl_radj ? `${selectedPlanet.pl_radj.toFixed(3)} R_Jup` : '—'}</span>
                </div>
                <div className="readout-row">
                  <span className="label">Distance to System</span>
                  <span className="val">
                    {selectedPlanet.sy_dist ? `${selectedPlanet.sy_dist.toFixed(1)} pc (${(selectedPlanet.sy_dist * 3.26).toFixed(1)} ly)` : '—'}
                  </span>
                </div>
                <div className="readout-row">
                  <span className="label">Discovery Year</span>
                  <span className="val">{selectedPlanet.disc_year}</span>
                </div>
              </div>
              <p className="readout-note">
                *The green ring denotes Earth's orbit (1.0 AU) for size reference. Auto-zooms to fit the exoplanet orbit (blue).
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="exo-controls">
        <div className="filter-group">
          <label>Discovery Method:</label>
          <select value={method} onChange={(e) => setMethod(e.target.value)}>
            {DISCOVERY_METHODS.map((m) => <option key={m} value={m}>{m}</option>)}
          </select>
        </div>
        <div className="filter-group">
          <label>Year:</label>
          <select value={yearFilter} onChange={(e) => setYearFilter(e.target.value)}>
            {YEAR_OPTIONS.map((y) => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
        <div className="filter-group">
          <label>Sort by:</label>
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
            <option value="disc_year">Year</option>
            <option value="pl_name">Name</option>
            <option value="pl_bmassj">Mass</option>
            <option value="pl_radj">Radius</option>
            <option value="sy_dist">Distance</option>
            <option value="pl_orbper">Orbital Period</option>
          </select>
          <button className="sort-dir-btn" onClick={() => setSortDir((d) => d === 'DESC' ? 'ASC' : 'DESC')}>
            {sortDir === 'DESC' ? '↓' : '↑'}
          </button>
        </div>
      </div>

      {loading && <LoadingSpinner />}
      {error && <ErrorMessage message={error} onRetry={fetchData} />}

      {!loading && !error && planets.length === 0 && (
        <div className="exo-empty">No exoplanets found for the current filters.</div>
      )}

      {!loading && !error && planets.length > 0 && (
        <div className="exo-table-wrapper">
          <table className="exo-table">
            <thead>
              <tr>
                <th>Planet</th>
                <th>Host Star</th>
                <th>Method</th>
                <th>Year</th>
                <th>Orbital Period (days)</th>
                <th>Mass (Jup)</th>
                <th>Radius (Jup)</th>
                <th>Distance (pc)</th>
              </tr>
            </thead>
            <tbody>
              {planets.map((p, i) => {
                const isSelected = selectedPlanet?.pl_name === p.pl_name;
                return (
                  <tr 
                    key={`${p.pl_name}-${i}`}
                    onClick={() => setSelectedPlanet(p)}
                    className={isSelected ? 'selected-row' : ''}
                    style={{ cursor: 'pointer' }}
                  >
                    <td className="planet-name">{p.pl_name}</td>
                    <td>{p.hostname}</td>
                    <td><span className={`method-badge method-${p.discoverymethod?.replace(/\s+/g, '-').toLowerCase()}`}>{p.discoverymethod}</span></td>
                    <td>{p.disc_year}</td>
                    <td>{p.pl_orbper != null ? p.pl_orbper.toFixed(2) : '—'}</td>
                    <td>{p.pl_bmassj != null ? p.pl_bmassj.toFixed(4) : '—'}</td>
                    <td>{p.pl_radj != null ? p.pl_radj.toFixed(3) : '—'}</td>
                    <td>{p.sy_dist != null ? p.sy_dist.toFixed(1) : '—'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <div className="exo-pagination">
        <button disabled={page === 0} onClick={() => setPage((p) => p - 1)}>← Previous</button>
        <span>Page {page + 1}{totalPages > 0 ? ` of ${totalPages}` : ''}</span>
        <button disabled={page + 1 >= totalPages} onClick={() => setPage((p) => p + 1)}>Next →</button>
      </div>
    </div>
  );
}

export default Exoplanets;
