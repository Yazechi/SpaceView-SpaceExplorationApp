import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { celestialBodies } from '../data/spaceData';
import useSEO from '../hooks/useSEO';
import SearchBar from '../components/SearchBar/SearchBar';
import '../styles/CelestialBodies.css';

function CelestialBodies() {
  useSEO({
    title: 'Celestial Bodies & Planetary Guide',
    description: 'Explore planets, moons, dwarf planets, and asteroids across our solar system with detailed facts and imagery on SpaceView.',
    canonicalUrl: 'https://space-view-rho.vercel.app/celestial-bodies',
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');

  const types = ['All', ...new Set(celestialBodies.map((b) => b.type))];

  const filteredBodies = useMemo(() => {
    return celestialBodies.filter((body) => {
      const matchesSearch = body.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        body.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesType = typeFilter === 'All' || body.type === typeFilter;
      return matchesSearch && matchesType;
    });
  }, [searchQuery, typeFilter]);

  return (
    <div className="page">
      <div className="container">
        <h1 className="page-title">Celestial Bodies</h1>
        <p className="page-subtitle">
          Explore planets, moons, and other objects in our Solar System.
        </p>

        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search celestial bodies..."
        />

        <div className="missions-filters" style={{ marginBottom: '1.5rem' }}>
          {types.map((type) => (
            <button
              key={type}
              className={`filter-btn ${typeFilter === type ? 'active' : ''}`}
              onClick={() => setTypeFilter(type)}
            >
              {type}
            </button>
          ))}
        </div>

        {filteredBodies.length === 0 ? (
          <p style={{ textAlign: 'center', color: 'var(--color-text-secondary)', padding: '2rem' }}>
            No celestial bodies found matching your criteria.
          </p>
        ) : (
          <div className="grid">
            {filteredBodies.map((body) => (
              <Link
                to={`/celestial-bodies/${body.id}`}
                key={body.id}
                style={{ textDecoration: 'none' }}
              >
                <div className="card celestial-card">
                  <div className="card-content">
                    <p className="celestial-type">{body.type}</p>
                    <h3 className="card-title">{body.name}</h3>
                    <p className="card-text">{body.description}</p>
                    <div className="celestial-stats">
                      <span className="celestial-stat">
                        <strong>Diameter:</strong> {body.diameter}
                      </span>
                      <span className="celestial-stat">
                        <strong>Orbit:</strong> {body.orbitalPeriod}
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default CelestialBodies;
