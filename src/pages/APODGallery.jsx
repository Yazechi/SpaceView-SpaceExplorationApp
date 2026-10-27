import { useState, useEffect, useCallback } from 'react';
import { getAPODByDate, getAPODRange } from '../services/nasaApi';
import useSEO from '../hooks/useSEO';
import LoadingSpinner from '../components/LoadingSpinner/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage/ErrorMessage';
import '../styles/APODGallery.css';

function formatDate(date) {
  return date.toISOString().split('T')[0];
}

function APODGallery() {
  useSEO({
    title: 'Astronomy Picture of the Day Gallery',
    description: 'Browse NASA daily curated cosmic photography, view high-resolution space imagery, and export custom wallpapers with SpaceView.',
    canonicalUrl: 'https://space-view-rho.vercel.app/apod-gallery',
  });

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
  const [exporting, setExporting] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      if (mode === 'single') {
        const data = await getAPODByDate(singleDate);
        setItems(data ? [data] : []);
      } else {
        const data = await getAPODRange(rangeStart, rangeEnd);
        const list = Array.isArray(data) ? data : (data ? [data] : []);
        // Always sort newest first
        const sorted = [...list].sort((a, b) => b.date.localeCompare(a.date));
        setItems(sorted);
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

  const handleExportWallpaper = (aspectRatio = 'desktop') => {
    if (!selectedItem) return;
    setExporting(true);
    const img = new Image();
    img.crossOrigin = 'anonymous';
    // Use hdurl for highest wallpaper quality if available, falling back to url
    img.src = selectedItem.hdurl || selectedItem.url;
    
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        // Define canvas sizing based on option
        const width = aspectRatio === 'desktop' ? 1920 : 1080;
        const height = aspectRatio === 'desktop' ? 1080 : 1920;
        canvas.width = width;
        canvas.height = height;
        
        // Calculate crop fitting (cover sizing style)
        const imgRatio = img.width / img.height;
        const canvasRatio = width / height;
        
        let drawWidth, drawHeight, x, y;
        if (imgRatio > canvasRatio) {
          drawHeight = height;
          drawWidth = height * imgRatio;
          x = (width - drawWidth) / 2;
          y = 0;
        } else {
          drawWidth = width;
          drawHeight = width / imgRatio;
          x = 0;
          y = (height - drawHeight) / 2;
        }
        
        // Render image onto canvas
        ctx.drawImage(img, x, y, drawWidth, drawHeight);
        
        // Draw overlay shadow gradient
        const gradient = ctx.createLinearGradient(0, height, 0, height - 340);
        gradient.addColorStop(0, 'rgba(3, 7, 18, 0.96)');
        gradient.addColorStop(0.4, 'rgba(3, 7, 18, 0.7)');
        gradient.addColorStop(1, 'rgba(3, 7, 18, 0)');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, height - 340, width, 340);
        
        // Configure text parameters
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 12px "Plus Jakarta Sans", system-ui, sans-serif';
        // Check browser letter-spacing support in canvas context
        if (ctx.letterSpacing !== undefined) {
          ctx.letterSpacing = '2px';
        }
        ctx.fillText('SPACEVIEW // ASTRONOMY PICTURE OF THE DAY', 60, height - 120);
        
        ctx.font = 'bold 32px "Plus Jakarta Sans", system-ui, sans-serif';
        ctx.fillText(selectedItem.title, 60, height - 75);
        
        ctx.fillStyle = '#9ca3af';
        ctx.font = '500 15px "Plus Jakarta Sans", system-ui, sans-serif';
        const copyrightString = selectedItem.copyright ? ` | © ${selectedItem.copyright.replace(/\n/g, ' ').trim()}` : '';
        ctx.fillText(`${selectedItem.date}${copyrightString}`, 60, height - 45);
        
        // Export file and trigger user download
        const link = document.createElement('a');
        link.download = `SpaceView_${selectedItem.date}_${aspectRatio}.jpg`;
        link.href = canvas.toDataURL('image/jpeg', 0.92);
        link.click();
      } catch (err) {
        console.error("Canvas export failed: ", err);
        alert("Failed to render custom wallpaper locally due to image CORS policy. Try downloading the HD URL link directly.");
      } finally {
        setExporting(false);
      }
    };
    
    img.onerror = () => {
      setExporting(false);
      alert("Failed to fetch image data. The resource host may restrict direct cross-origin access.");
    };
  };

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
            <button className="modal-close" onClick={() => setSelectedItem(null)} aria-label="Close modal">
              &times;
            </button>
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
              
              {selectedItem.media_type === 'image' && (
                <div className="wallpaper-export-controls">
                  <span>Download Custom Wallpaper:</span>
                  <div className="export-buttons">
                    <button 
                      onClick={() => handleExportWallpaper('desktop')} 
                      className="btn-export"
                      disabled={exporting}
                    >
                      🖥️ Desktop Poster (16:9)
                    </button>
                    <button 
                      onClick={() => handleExportWallpaper('mobile')} 
                      className="btn-export"
                      disabled={exporting}
                    >
                      📱 Mobile Screen (9:16)
                    </button>
                  </div>
                  {selectedItem.hdurl && (
                    <a 
                      href={selectedItem.hdurl} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="btn-hd-link"
                    >
                      Download Original High-Res (HD) Image ↗
                    </a>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default APODGallery;
