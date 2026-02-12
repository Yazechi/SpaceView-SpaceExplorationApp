import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { missions } from '../data/spaceData';
import { searchNASAImages } from '../services/nasaApi';
import LoadingSpinner from '../components/LoadingSpinner/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage/ErrorMessage';
import '../styles/Missions.css';

function MissionDetail() {
  const { id } = useParams();
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const mission = missions.find((m) => m.id === id);

  const fetchImages = async () => {
    if (!mission) return;
    setLoading(true);
    setError(null);
    try {
      const data = await searchNASAImages(mission.image);
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

  if (!mission) {
    return (
      <div className="page">
        <div className="container">
          <ErrorMessage message="Mission not found." />
          <Link to="/missions" className="back-link">Back to Missions</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="container mission-detail">
        <Link to="/missions" className="back-link">
          &larr; Back to Missions
        </Link>

        <div className="mission-detail-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <h1>{mission.name}</h1>
            <span className={`badge ${mission.status === 'Active' ? 'badge-active' : 'badge-completed'}`}>
              {mission.status}
            </span>
          </div>
          <div className="mission-meta">
            <span>
              Launch: {new Date(mission.launchDate).toLocaleDateString('en-US', {
                year: 'numeric', month: 'long', day: 'numeric'
              })}
            </span>
          </div>
        </div>

        <p className="mission-description">{mission.description}</p>

        {mission.crew.length > 0 && (
          <div className="mission-crew">
            <h3>Crew Members</h3>
            <ul className="crew-list">
              {mission.crew.map((member) => (
                <li key={member} className="crew-member">{member}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="mission-images">
          <h3>Related Images from NASA</h3>
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
            <p style={{ color: 'var(--color-text-secondary)' }}>No images available for this mission.</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default MissionDetail;
