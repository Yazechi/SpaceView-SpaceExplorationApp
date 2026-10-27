import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { celestialBodies } from '../data/spaceData';
import { searchNASAImages } from '../services/nasaApi';
import useSEO from '../hooks/useSEO';
import LoadingSpinner from '../components/LoadingSpinner/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage/ErrorMessage';
import '../styles/CelestialBodies.css';
import '../styles/Missions.css';

function CelestialBodyDetail() {
  const { id } = useParams();
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const body = celestialBodies.find((b) => b.id === id);

  useSEO({
    title: body ? body.name + " - Celestial Body" : "Celestial Body Details",
    description: body ? body.description : "Detailed celestial body information and NASA imagery.",
    canonicalUrl: body ? "https://space-view-rho.vercel.app/celestial-bodies/" + body.id : undefined,
  });

  const fetchImages = async () => {
    if (!body) return;
    setLoading(true);
    setError(null);
    try {
      const data = await searchNASAImages(body.searchQuery);
      const items = data.collection?.items?.slice(0, 6) || [];
      setImages(items);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchImages();
  }, [id]);

  if (!body) {
    return (
      <div className="page">
        <div className="container">
          <ErrorMessage message="Celestial body not found." />
          <Link to="/celestial-bodies" className="back-link">Back to Celestial Bodies</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="container celestial-detail">
        <Link to="/celestial-bodies" className="back-link">
          &larr; Back to Celestial Bodies
        </Link>

        <div className="celestial-header">
          <h1>{body.name}</h1>
          <p className="celestial-detail-type">{body.type}</p>
          <p className="celestial-detail-desc">{body.description}</p>

          <div className="celestial-detail-stats">
            <div className="stat-card">
              <p className="stat-label">Distance from Sun</p>
              <p className="stat-value">{body.distanceFromSun}</p>
            </div>
            <div className="stat-card">
              <p className="stat-label">Diameter</p>
              <p className="stat-value">{body.diameter}</p>
            </div>
            <div className="stat-card">
              <p className="stat-label">Orbital Period</p>
              <p className="stat-value">{body.orbitalPeriod}</p>
            </div>
          </div>

          <div className="celestial-facts">
            <h3>Interesting Facts</h3>
            <ul>
              {body.facts.map((fact, idx) => (
                <li key={idx}>{fact}</li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mission-images">
          <h3>Images from NASA</h3>
          {loading && <LoadingSpinner message="Loading images..." />}
          {error && <ErrorMessage message={error} onRetry={fetchImages} />}
          {!loading && !error && images.length > 0 && (
            <div className="image-grid">
              {images.map((item, idx) => {
                const imgUrl = item.links?.[0]?.href;
                const title = item.data?.[0]?.title || 'NASA Image';
                return imgUrl ? (
                  <img key={idx} src={imgUrl} alt={title} loading="lazy" />
                ) : null;
              })}
            </div>
          )}
          {!loading && !error && images.length === 0 && (
            <p style={{ color: 'var(--color-text-secondary)' }}>No images available.</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default CelestialBodyDetail;
