import { useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { searchNASAImages } from '../services/nasaApi';
import { missions, astronauts, celestialBodies } from '../data/spaceData';
import SearchBar from '../components/SearchBar/SearchBar';
import LoadingSpinner from '../components/LoadingSpinner/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage/ErrorMessage';
import '../styles/Search.css';
import '../styles/Missions.css';

function Search() {
  const [query, setQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [nasaResults, setNasaResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searched, setSearched] = useState(false);

  const handleSearch = useCallback(async (searchQuery) => {
    setQuery(searchQuery);
    if (!searchQuery.trim()) {
      setNasaResults([]);
      setSearched(false);
      return;
    }

    setLoading(true);
    setError(null);
    setSearched(true);

    try {
      const data = await searchNASAImages(searchQuery);
      setNasaResults(data.collection?.items?.slice(0, 20) || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Debounce the search
  const [debounceTimer, setDebounceTimer] = useState(null);
  const onQueryChange = (value) => {
    setQuery(value);
    if (debounceTimer) clearTimeout(debounceTimer);
    const timer = setTimeout(() => handleSearch(value), 500);
    setDebounceTimer(timer);
  };

  // Filter local data
  const q = query.toLowerCase();
  const localMissions = missions.filter((m) =>
    m.name.toLowerCase().includes(q) || m.description.toLowerCase().includes(q)
  );
  const localAstronauts = astronauts.filter((a) =>
    a.name.toLowerCase().includes(q) || a.bio.toLowerCase().includes(q)
  );
  const localBodies = celestialBodies.filter((b) =>
    b.name.toLowerCase().includes(q) || b.description.toLowerCase().includes(q)
  );

  const showLocal = activeTab === 'all' || activeTab === 'local';
  const showNasa = activeTab === 'all' || activeTab === 'nasa';
  const hasLocalResults = localMissions.length > 0 || localAstronauts.length > 0 || localBodies.length > 0;

  return (
    <div className="page">
      <div className="container">
        <h1 className="page-title">Search</h1>
        <p className="page-subtitle">
          Search for missions, astronauts, celestial bodies, and NASA imagery.
        </p>

        <SearchBar
          value={query}
          onChange={onQueryChange}
          placeholder="Search across everything..."
        />

        <div className="search-page-tabs">
          {['all', 'local', 'nasa'].map((tab) => (
            <button
              key={tab}
              className={`filter-btn ${activeTab === tab ? 'active' : ''}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab === 'all' ? 'All Results' : tab === 'local' ? 'Missions / Astronauts / Bodies' : 'NASA Images'}
            </button>
          ))}
        </div>

        {!searched && !query && (
          <p style={{ textAlign: 'center', color: 'var(--color-text-secondary)', padding: '2rem' }}>
            Start typing to search.
          </p>
        )}

        {/* Local results */}
        {searched && showLocal && query && (
          <>
            {localMissions.length > 0 && (
              <div style={{ marginBottom: '2rem' }}>
                <h3 style={{ marginBottom: '1rem', fontSize: '1.1rem' }}>Missions ({localMissions.length})</h3>
                {localMissions.map((m) => (
                  <Link to={`/missions/${m.id}`} key={m.id} style={{ textDecoration: 'none' }}>
                    <div className="search-result-item">
                      <div className="search-result-content">
                        <h3>{m.name}</h3>
                        <p>{m.description}</p>
                        <span className="search-result-date">Launch: {m.launchDate} | Status: {m.status}</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}

            {localAstronauts.length > 0 && (
              <div style={{ marginBottom: '2rem' }}>
                <h3 style={{ marginBottom: '1rem', fontSize: '1.1rem' }}>Astronauts ({localAstronauts.length})</h3>
                {localAstronauts.map((a) => (
                  <Link to={`/astronauts/${a.id}`} key={a.id} style={{ textDecoration: 'none' }}>
                    <div className="search-result-item">
                      <div className="search-result-content">
                        <h3>{a.name}</h3>
                        <p>{a.bio}</p>
                        <span className="search-result-date">{a.nationality}</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}

            {localBodies.length > 0 && (
              <div style={{ marginBottom: '2rem' }}>
                <h3 style={{ marginBottom: '1rem', fontSize: '1.1rem' }}>Celestial Bodies ({localBodies.length})</h3>
                {localBodies.map((b) => (
                  <Link to={`/celestial-bodies/${b.id}`} key={b.id} style={{ textDecoration: 'none' }}>
                    <div className="search-result-item">
                      <div className="search-result-content">
                        <h3>{b.name}</h3>
                        <p>{b.description}</p>
                        <span className="search-result-date">{b.type}</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}

            {!hasLocalResults && activeTab === 'local' && (
              <p style={{ textAlign: 'center', color: 'var(--color-text-secondary)' }}>
                No local results found for "{query}".
              </p>
            )}
          </>
        )}

        {/* NASA API results */}
        {searched && showNasa && (
          <>
            {loading && <LoadingSpinner message="Searching NASA..." />}
            {error && <ErrorMessage message={error} onRetry={() => handleSearch(query)} />}
            {!loading && !error && nasaResults.length > 0 && (
              <div>
                <h3 style={{ marginBottom: '1rem', fontSize: '1.1rem' }}>NASA Images ({nasaResults.length})</h3>
                {nasaResults.map((item, idx) => {
                  const imgUrl = item.links?.[0]?.href;
                  const data = item.data?.[0];
                  return (
                    <div className="search-result-item" key={idx}>
                      {imgUrl && (
                        <img src={imgUrl} alt={data?.title || 'NASA'} className="search-result-image" loading="lazy" />
                      )}
                      <div className="search-result-content">
                        <h3>{data?.title || 'Untitled'}</h3>
                        <p>{data?.description || ''}</p>
                        {data?.date_created && (
                          <span className="search-result-date">
                            {new Date(data.date_created).toLocaleDateString('en-US', {
                              year: 'numeric', month: 'long', day: 'numeric'
                            })}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
            {!loading && !error && nasaResults.length === 0 && searched && (
              <p style={{ textAlign: 'center', color: 'var(--color-text-secondary)' }}>
                No NASA results found for "{query}".
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default Search;
