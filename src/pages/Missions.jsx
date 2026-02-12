import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { missions } from '../data/spaceData';
import SearchBar from '../components/SearchBar/SearchBar';
import '../styles/Missions.css';

function Missions() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  const filteredMissions = useMemo(() => {
    return missions.filter((mission) => {
      const matchesSearch = mission.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        mission.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'All' || mission.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [searchQuery, statusFilter]);

  return (
    <div className="page">
      <div className="container">
        <h1 className="page-title">Space Missions</h1>
        <p className="page-subtitle">
          Explore past and current space missions from around the world.
        </p>

        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search missions..."
        />

        <div className="missions-filters">
          {['All', 'Active', 'Completed'].map((status) => (
            <button
              key={status}
              className={`filter-btn ${statusFilter === status ? 'active' : ''}`}
              onClick={() => setStatusFilter(status)}
            >
              {status}
            </button>
          ))}
        </div>

        {filteredMissions.length === 0 ? (
          <p style={{ textAlign: 'center', color: 'var(--color-text-secondary)', padding: '2rem' }}>
            No missions found matching your criteria.
          </p>
        ) : (
          <div className="grid">
            {filteredMissions.map((mission) => (
              <Link
                to={`/missions/${mission.id}`}
                key={mission.id}
                style={{ textDecoration: 'none' }}
              >
                <div className="card">
                  <div className="card-content">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                      <h3 className="card-title" style={{ margin: 0 }}>{mission.name}</h3>
                      <span className={`badge ${mission.status === 'Active' ? 'badge-active' : 'badge-completed'}`}>
                        {mission.status}
                      </span>
                    </div>
                    <p style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', marginBottom: '0.5rem' }}>
                      Launch: {new Date(mission.launchDate).toLocaleDateString('en-US', {
                        year: 'numeric', month: 'long', day: 'numeric'
                      })}
                    </p>
                    <p className="card-text">{mission.description}</p>
                    {mission.crew.length > 0 && (
                      <p style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', marginTop: '0.5rem' }}>
                        Crew: {mission.crew.join(', ')}
                      </p>
                    )}
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

export default Missions;
