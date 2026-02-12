import { useState, useEffect, useCallback } from 'react';
import { getAPODByDate, getAPODRange } from '../services/nasaApi';
import LoadingSpinner from '../components/LoadingSpinner/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage/ErrorMessage';
import '../styles/APODGallery.css';

function formatDate(date) {
  return date.toISOString().split('T')[0];
}

function APODGallery() {
  const [mode, setMode] = useState('range');
  const [singleDate, setSingleDate] = useState(() => formatDate(new Date()));
  const [rangeStart, setRangeStart] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 6);
    return formatDate(d);
  });
  const [rangeEnd, setRangeEnd] = useState(() => formatDate(new Date()));
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      if (mode === 'single') {
        const data = await getAPODByDate(singleDate);
        setItems([data]);
      } else {
        const data = await getAPODRange(rangeStart, rangeEnd);
        setItems(Array.isArray(data) ? data.reverse() : [data]);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [mode, singleDate, rangeStart, rangeEnd]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <div className="apod-gallery-page">
      <div className="apod-gallery-hero">
        <h1>Astronomy Picture of the Day</h1>
        <p>Browse NASA's daily curated collection of cosmic imagery</p>
      </div>

      <div className="apod-controls">
        <div className="mode-toggle">
          <button
            className={mode === 'range' ? 'active' : ''}
            onClick={() => setMode('range')}
          >
            Date Range
          </button>
          <button
            className={mode === 'single' ? 'active' : ''}
            onClick={() => setMode('single')}
          >
            Single Date
          </button>
        </div>

        {mode === 'single' ? (
          <div className="date-inputs">
            <label htmlFor="apod-date">Date:</label>
            <input
              id="apod-date"
              type="date"
              value={singleDate}
              max={formatDate(new Date())}
              onChange={(e) => setSingleDate(e.target.value)}
            />
          </div>
        ) : (
          <div className="date-inputs">
            <label htmlFor="apod-start">From:</label>
            <input
              id="apod-start"
              type="date"
              value={rangeStart}
              max={rangeEnd}
              onChange={(e) => setRangeStart(e.target.value)}
            />
            <label htmlFor="apod-end">To:</label>
            <input
              id="apod-end"
              type="date"
              value={rangeEnd}
              max={formatDate(new Date())}
              onChange={(e) => setRangeEnd(e.target.value)}
            />
          </div>
        )}
      </div>

      {loading && <LoadingSpinner />}
      {error && <ErrorMessage message={error} onRetry={fetchData} />}

      <div className="apod-grid">
        {items.map((item) => (
          <div
            key={item.date}
            className="apod-card"
            onClick={() => setSelectedItem(item)}
          >
            {item.media_type === 'image' ? (
              <img src={item.url} alt={item.title} loading="lazy" />
            ) : (
              <div className="video-thumbnail">
                <iframe src={item.url} title={item.title} loading="lazy" />
              </div>
            )}
            <div className="apod-card-info">
              <h3>{item.title}</h3>
              <span className="apod-date">{item.date}</span>
            </div>
          </div>
        ))}
      </div>

      {selectedItem && (
        <div className="apod-modal" onClick={() => setSelectedItem(null)}>
          <div className="apod-modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setSelectedItem(null)}>X</button>
            {selectedItem.media_type === 'image' ? (
              <img
                src={selectedItem.hdurl || selectedItem.url}
                alt={selectedItem.title}
              />
            ) : (
              <iframe src={selectedItem.url} title={selectedItem.title} />
            )}
            <div className="modal-text">
              <h2>{selectedItem.title}</h2>
              <p className="modal-date">{selectedItem.date}</p>
              <p className="modal-explanation">{selectedItem.explanation}</p>
              {selectedItem.copyright && (
                <p className="modal-copyright">Copyright: {selectedItem.copyright}</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default APODGallery;
