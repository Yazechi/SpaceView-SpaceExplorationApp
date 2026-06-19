import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getAPOD } from '../services/nasaApi';
import { missions, astronauts } from '../data/spaceData';
import LoadingSpinner from '../components/LoadingSpinner/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage/ErrorMessage';
import '../styles/Home.css';

function Home() {
  const [apod, setApod] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAPOD = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getAPOD();
      setApod(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAPOD();
  }, []);

  const featuredMissions = missions.slice(0, 3);

  return (
    <div className="page">
      <div className="container">
        {/* Hero Section */}
        <section className="home-hero">
          <h1>SpaceView</h1>
          <p style={{ fontSize: '1.25rem', fontWeight: '500', color: 'var(--color-text-primary)', marginBottom: '0.75rem', marginTop: '-0.5rem' }}>
            Explore the Cosmos
          </p>
          <p>
            Discover space missions, learn about astronauts, explore celestial
            bodies, and journey through the history of space exploration.
          </p>
          <div className="home-hero-actions">
            <Link to="/solar-system" className="btn btn-primary">
              View Solar System 3D
            </Link>
            <Link to="/missions" className="btn btn-secondary">
              Browse Missions
            </Link>
          </div>
        </section>

        {/* Astronomy Picture of the Day */}
        <section className="home-section">
          <div className="home-section-header">
            <h2>Astronomy Picture of the Day</h2>
          </div>
          {loading && <LoadingSpinner message="Loading today's picture..." />}
          {error && <ErrorMessage message={error} onRetry={fetchAPOD} />}
          {apod && !loading && (
            <div className="apod-section">
              {apod.media_type === 'image' ? (
                <img
                  src={apod.url}
                  alt={apod.title}
                  className="apod-image"
                />
              ) : (
                <iframe
                  src={apod.url}
                  title={apod.title}
                  className="apod-image"
                  allowFullScreen
                  style={{ border: 'none' }}
                />
              )}
              <div className="apod-content">
                <span className="apod-label">NASA APOD</span>
                <h3>{apod.title}</h3>
                <p>{apod.explanation}</p>
              </div>
            </div>
          )}
        </section>

        {/* Featured Missions */}
        <section className="home-section">
          <div className="home-section-header">
            <h2>Featured Missions</h2>
            <Link to="/missions">View all</Link>
          </div>
          <div className="grid">
            {featuredMissions.map((mission) => (
              <Link to={`/missions/${mission.id}`} key={mission.id} style={{ textDecoration: 'none' }}>
                <div className="card">
                  <div className="card-content">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                      <h3 className="card-title" style={{ margin: 0 }}>{mission.name}</h3>
                      <span className={`badge ${mission.status === 'Active' ? 'badge-active' : 'badge-completed'}`}>
                        {mission.status}
                      </span>
                    </div>
                    <p style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', marginBottom: '0.5rem' }}>
                      Launch: {new Date(mission.launchDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                    </p>
                    <p className="card-text">{mission.description}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Quick Links */}
        <section className="home-section">
          <div className="home-section-header">
            <h2>Explore</h2>
          </div>
          <div className="quick-links">
            <Link to="/missions" className="quick-link-card">
              <div className="quick-link-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" />
                  <path d="M12 15l-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" />
                  <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0" />
                  <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5" />
                </svg>
              </div>
              <h3>Missions</h3>
              <p>{missions.length} missions to explore</p>
            </Link>
            <Link to="/astronauts" className="quick-link-card">
              <div className="quick-link-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              </div>
              <h3>Astronauts</h3>
              <p>{astronauts.length} profiles available</p>
            </Link>
            <Link to="/celestial-bodies" className="quick-link-card">
              <div className="quick-link-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                </svg>
              </div>
              <h3>Celestial Bodies</h3>
              <p>Planets, moons, and more</p>
            </Link>
            <Link to="/timeline" className="quick-link-card">
              <div className="quick-link-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
              </div>
              <h3>Timeline</h3>
              <p>History of space exploration</p>
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}

export default Home;
