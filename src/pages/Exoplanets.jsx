import { useState, useEffect, useCallback } from 'react';
import { getExoplanets } from '../services/nasaApi';
import LoadingSpinner from '../components/LoadingSpinner/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage/ErrorMessage';
import '../styles/Exoplanets.css';

const DISCOVERY_METHODS = ['All', 'Transit', 'Radial Velocity', 'Imaging', 'Microlensing', 'Eclipse Timing Variations'];
const YEAR_OPTIONS = ['All', '2026', '2025', '2024', '2023', '2022', '2021', '2020', '2015-2019', '2010-2014', '<2010'];

function Exoplanets() {
  const [allPlanets, setAllPlanets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [method, setMethod] = useState('All');
  const [yearFilter, setYearFilter] = useState('All');
  const [sortBy, setSortBy] = useState('disc_year');
  const [sortDir, setSortDir] = useState('DESC');
  const [page, setPage] = useState(0);
  const [stats, setStats] = useState(null);
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
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
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
            {planets.map((p, i) => (
              <tr key={`${p.pl_name}-${i}`}>
                <td className="planet-name">{p.pl_name}</td>
                <td>{p.hostname}</td>
                <td><span className={`method-badge method-${p.discoverymethod?.replace(/\s+/g, '-').toLowerCase()}`}>{p.discoverymethod}</span></td>
                <td>{p.disc_year}</td>
                <td>{p.pl_orbper != null ? p.pl_orbper.toFixed(2) : '—'}</td>
                <td>{p.pl_bmassj != null ? p.pl_bmassj.toFixed(4) : '—'}</td>
                <td>{p.pl_radj != null ? p.pl_radj.toFixed(3) : '—'}</td>
                <td>{p.sy_dist != null ? p.sy_dist.toFixed(1) : '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="exo-pagination">
        <button disabled={page === 0} onClick={() => setPage((p) => p - 1)}>← Previous</button>
        <span>Page {page + 1}{totalPages > 0 ? ` of ${totalPages}` : ''}</span>
        <button disabled={page + 1 >= totalPages} onClick={() => setPage((p) => p + 1)}>Next →</button>
      </div>
    </div>
  );
}

export default Exoplanets;
