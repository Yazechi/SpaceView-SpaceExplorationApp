import { useState, useEffect, useCallback } from 'react';
import { searchNASAImages } from '../services/nasaApi';
import LoadingSpinner from '../components/LoadingSpinner/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage/ErrorMessage';
import '../styles/MarsRover.css';

const ROVERS = [
  { id: 'curiosity', name: 'Curiosity', status: 'active', landing: '2012-08-06', query: 'Mars rover Curiosity' },
  { id: 'perseverance', name: 'Perseverance', status: 'active', landing: '2021-02-18', query: 'Mars rover Perseverance' },
  { id: 'opportunity', name: 'Opportunity', status: 'complete', landing: '2004-01-25', query: 'Mars rover Opportunity' },
  { id: 'spirit', name: 'Spirit', status: 'complete', landing: '2004-01-04', query: 'Mars rover Spirit' },
];

function MarsRover() {
  const [rover, setRover] = useState('curiosity');
  const [photos, setPhotos] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [totalHits, setTotalHits] = useState(0);

  const currentRover = ROVERS.find((r) => r.id === rover);

  const fetchPhotos = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await searchNASAImages(currentRover.query, 'image', page);
      const items = (data.collection?.items || []).map((item) => ({
        id: item.data?.[0]?.nasa_id || Math.random().toString(),
        title: item.data?.[0]?.title || 'Mars Photo',
        description: item.data?.[0]?.description || '',
        date: item.data?.[0]?.date_created?.split('T')[0] || '',
        center: item.data?.[0]?.center || '',
        thumbnail: item.links?.[0]?.href || '',
      }));
      setPhotos(items);
      setTotalHits(data.collection?.metadata?.total_hits || 0);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [currentRover, page]);

  useEffect(() => {
    setPage(1);
  }, [rover]);

  useEffect(() => {
    fetchPhotos();
  }, [fetchPhotos]);

  return (
    <div className="mars-rover-page">
      <div className="mars-rover-hero">
        <h1>Mars Rover Gallery</h1>
        <p>Browse photos captured by NASA's Mars rovers on the Red Planet surface</p>
      </div>

      <div className="mars-rover-controls">
        <div className="rover-selector">
          {ROVERS.map((r) => (
            <button
              key={r.id}
              className={`rover-btn ${rover === r.id ? 'active' : ''}`}
              onClick={() => setRover(r.id)}
            >
              <span className="rover-name">{r.name}</span>
              <span className={`rover-status ${r.status}`}>{r.status}</span>
            </button>
          ))}
        </div>

        <div className="rover-info">
          <span>Landing: {currentRover.landing}</span>
          <span>Status: {currentRover.status}</span>
          {totalHits > 0 && <span>{totalHits.toLocaleString()} images available</span>}
        </div>
      </div>

      {loading && <LoadingSpinner />}
      {error && <ErrorMessage message={error} onRetry={fetchPhotos} />}

      {!loading && !error && photos.length === 0 && (
        <div className="no-photos">
          <p>No photos found. Try a different rover.</p>
        </div>
      )}

      <div className="photo-count">
        {photos.length > 0 && <span>Showing {photos.length} of {totalHits.toLocaleString()} photos (page {page})</span>}
      </div>

      <div className="rover-photo-grid">
        {photos.map((photo) => (
          <div
            key={photo.id}
            className="rover-photo-card"
            onClick={() => setSelectedPhoto(photo)}
          >
            <img src={photo.thumbnail} alt={photo.title} loading="lazy" />
            <div className="photo-overlay">
              <span>{photo.title.length > 30 ? photo.title.slice(0, 30) + '...' : photo.title}</span>
              <span>{photo.date}</span>
            </div>
          </div>
        ))}
      </div>

      {totalHits > 0 && (
        <div className="pagination">
          <button disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>Previous</button>
          <span>Page {page}</span>
          <button disabled={photos.length < 100} onClick={() => setPage((p) => p + 1)}>Next</button>
        </div>
      )}

      {selectedPhoto && (
        <div className="photo-modal" onClick={() => setSelectedPhoto(null)}>
          <div className="photo-modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setSelectedPhoto(null)}>X</button>
            <img src={selectedPhoto.thumbnail} alt={selectedPhoto.title} />
            <div className="modal-info">
              <h3>{selectedPhoto.title}</h3>
              {selectedPhoto.date && <p>Date: {selectedPhoto.date}</p>}
              {selectedPhoto.center && <p>Center: {selectedPhoto.center}</p>}
              {selectedPhoto.description && (
                <p className="photo-description">
                  {selectedPhoto.description.length > 400
                    ? selectedPhoto.description.slice(0, 400) + '...'
                    : selectedPhoto.description}
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default MarsRover;
