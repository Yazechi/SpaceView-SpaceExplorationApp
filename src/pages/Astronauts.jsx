import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { astronauts } from '../data/spaceData';
import useSEO from '../hooks/useSEO';
import SearchBar from '../components/SearchBar/SearchBar';
import '../styles/Astronauts.css';

function Astronauts() {
  useSEO({
    title: 'Astronaut Profiles & Records',
    description: 'Profiles and flight records of pioneering astronauts and cosmonauts who shaped human space exploration history on SpaceView.',
    canonicalUrl: 'https://space-view-rho.vercel.app/astronauts',
  });

  const [searchQuery, setSearchQuery] = useState('');

  const filteredAstronauts = useMemo(() => {
    return astronauts.filter((a) => {
      const q = searchQuery.toLowerCase();
      return a.name.toLowerCase().includes(q) ||
        a.nationality.toLowerCase().includes(q) ||
        a.missions.some((m) => m.toLowerCase().includes(q));
    });
  }, [searchQuery]);

  return (
    <div className="page">
      <div className="container">
        <h1 className="page-title">Astronauts</h1>
        <p className="page-subtitle">
          Profiles of notable astronauts and cosmonauts who advanced space exploration.
        </p>

        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search astronauts by name, nationality, or mission..."
        />

        {filteredAstronauts.length === 0 ? (
          <p style={{ textAlign: 'center', color: 'var(--color-text-secondary)', padding: '2rem' }}>
            No astronauts found matching your search.
          </p>
        ) : (
          <div className="grid">
            {filteredAstronauts.map((astronaut) => (
              <Link
                to={`/astronauts/${astronaut.id}`}
                key={astronaut.id}
                style={{ textDecoration: 'none' }}
              >
                <div className="card astronaut-card">
                  <div className="card-content">
                    <h3 className="card-title">{astronaut.name}</h3>
                    <p className="astronaut-nationality">{astronaut.nationality}</p>
                    <p className="card-text">{astronaut.bio}</p>
                    <div className="astronaut-missions-list">
                      {astronaut.missions.map((mission) => (
                        <span key={mission} className="astronaut-mission-tag">
                          {mission}
                        </span>
                      ))}
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

export default Astronauts;
