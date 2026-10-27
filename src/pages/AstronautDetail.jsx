import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { astronauts } from '../data/spaceData';
import { searchNASAImages } from '../services/nasaApi';
import useSEO from '../hooks/useSEO';
import LoadingSpinner from '../components/LoadingSpinner/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage/ErrorMessage';
import '../styles/Astronauts.css';
import '../styles/Missions.css';

function AstronautDetail() {
  const { id } = useParams();
  const astronaut = astronauts.find((a) => a.id === id);

  useSEO({
    title: astronaut ? `${astronaut.name} - Astronaut` : 'Astronaut Profile',
    description: astronaut ? astronaut.bio : 'Astronaut biography, missions participated, and NASA archival photography.',
    canonicalUrl: astronaut ? `https://space-view-rho.vercel.app/astronauts/${astronaut.id}` : undefined,
  });

  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchImages = async () => {
    if (!astronaut) return;
    setLoading(true);
    setError(null);
    try {
      const data = await searchNASAImages(astronaut.searchQuery);
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

  if (!astronaut) {
    return (
      <div className="page">
        <div className="container">
          <ErrorMessage message="Astronaut not found." />
          <Link to="/astronauts" className="back-link">Back to Astronauts</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="container astronaut-detail">
        <Link to="/astronauts" className="back-link">
          &larr; Back to Astronauts
        </Link>

        <div className="astronaut-profile">
          <h1>{astronaut.name}</h1>
          <div className="astronaut-info-row">
            <span>Nationality: {astronaut.nationality}</span>
            <span>
              Born: {new Date(astronaut.birthDate).toLocaleDateString('en-US', {
                year: 'numeric', month: 'long', day: 'numeric'
              })}
            </span>
          </div>
          <p className="astronaut-bio">{astronaut.bio}</p>

          <div className="astronaut-detail-missions">
            <h3>Missions</h3>
            <div className="astronaut-missions-list">
              {astronaut.missions.map((mission) => (
                <span key={mission} className="astronaut-mission-tag" style={{ fontSize: '0.85rem', padding: '0.3rem 0.75rem' }}>
                  {mission}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="mission-images">
          <h3>Photos from NASA</h3>
          {loading && <LoadingSpinner message="Loading photos..." />}
          {error && <ErrorMessage message={error} onRetry={fetchImages} />}
          {!loading && !error && images.length > 0 && (
            <div className="image-grid">
              {images.map((item, idx) => {
                const imgUrl = item.links?.[0]?.href;
                const title = item.data?.[0]?.title || 'NASA Photo';
                return imgUrl ? (
                  <img key={idx} src={imgUrl} alt={title} loading="lazy" />
                ) : null;
              })}
            </div>
          )}
          {!loading && !error && images.length === 0 && (
            <p style={{ color: 'var(--color-text-secondary)' }}>No photos available.</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default AstronautDetail;
