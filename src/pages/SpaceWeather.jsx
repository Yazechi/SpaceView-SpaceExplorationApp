import { useState, useEffect, useCallback } from 'react';
import { getDONKI_CME, getDONKI_GST, getDONKI_FLR } from '../services/nasaApi';
import LoadingSpinner from '../components/LoadingSpinner/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage/ErrorMessage';
import '../styles/SpaceWeather.css';

function formatDate(date) {
  return date.toISOString().split('T')[0];
}

const TABS = [
  { id: 'flr', label: 'Solar Flares', icon: '☀️' },
  { id: 'cme', label: 'Coronal Mass Ejections', icon: '💫' },
  { id: 'gst', label: 'Geomagnetic Storms', icon: '🌍' },
];

function getKpColor(kp) {
  if (kp >= 8) return '#ef4444';
  if (kp >= 6) return '#f59e0b';
  if (kp >= 5) return '#eab308';
  return '#10b981';
}

function getKpLabel(kp) {
  if (kp >= 9) return 'Extreme (G5)';
  if (kp >= 8) return 'Severe (G4)';
  if (kp >= 7) return 'Strong (G3)';
  if (kp >= 6) return 'Moderate (G2)';
  if (kp >= 5) return 'Minor (G1)';
  return 'Below Storm';
}

function getFlareColor(cls) {
  if (!cls) return '#10b981';
  if (cls.startsWith('X')) return '#ef4444';
  if (cls.startsWith('M')) return '#f59e0b';
  if (cls.startsWith('C')) return '#eab308';
  return '#10b981';
}

function SpaceWeather() {
  const [tab, setTab] = useState('flr');
  const [startDate, setStartDate] = useState(() => {
    const d = new Date(); d.setDate(d.getDate() - 30);
    return formatDate(d);
  });
  const [endDate, setEndDate] = useState(() => formatDate(new Date()));
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      let result;
      if (tab === 'cme') result = await getDONKI_CME(startDate, endDate);
      else if (tab === 'gst') result = await getDONKI_GST(startDate, endDate);
      else result = await getDONKI_FLR(startDate, endDate);
      setData(Array.isArray(result) ? result : []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [tab, startDate, endDate]);

  useEffect(() => { fetchData(); }, [fetchData]);

  return (
    <div className="space-weather-page">
      <div className="sw-hero">
        <h1>Space Weather Dashboard</h1>
        <p>Live solar activity from NASA's DONKI — flares, CMEs, and geomagnetic storms</p>
      </div>

      <div className="sw-tabs">
        {TABS.map((t) => (
          <button key={t.id} className={`sw-tab ${tab === t.id ? 'active' : ''}`} onClick={() => setTab(t.id)}>
            <span className="tab-icon">{t.icon}</span>{t.label}
          </button>
        ))}
      </div>

      <div className="sw-controls">
        <div className="date-field">
          <label>From:</label>
          <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
        </div>
        <div className="date-field">
          <label>To:</label>
          <input type="date" value={endDate} max={formatDate(new Date())} onChange={(e) => setEndDate(e.target.value)} />
        </div>
        <div className="sw-count">{data.length} events found</div>
      </div>

      {loading && <LoadingSpinner />}
      {error && <ErrorMessage message={error} onRetry={fetchData} />}

      {!loading && !error && data.length === 0 && (
        <div className="sw-empty">No events found for this date range.</div>
      )}

      <div className="sw-list">
        {/* Solar Flares */}
        {tab === 'flr' && data.map((flr) => (
          <div key={flr.flrID} className="sw-card" style={{ borderLeftColor: getFlareColor(flr.classType) }}>
            <div className="sw-card-header">
              <span className="sw-badge" style={{ background: getFlareColor(flr.classType) + '25', color: getFlareColor(flr.classType) }}>
                {flr.classType || 'N/A'}
              </span>
              <span className="sw-time">{new Date(flr.beginTime).toLocaleString()}</span>
            </div>
            <div className="sw-card-body">
              <div className="sw-detail"><span className="sw-label">Peak</span><span>{flr.peakTime ? new Date(flr.peakTime).toLocaleTimeString() : '—'}</span></div>
              <div className="sw-detail"><span className="sw-label">End</span><span>{flr.endTime ? new Date(flr.endTime).toLocaleTimeString() : '—'}</span></div>
              <div className="sw-detail"><span className="sw-label">Source</span><span>{flr.sourceLocation || '—'}</span></div>
              <div className="sw-detail"><span className="sw-label">Active Region</span><span>{flr.activeRegionNum || '—'}</span></div>
            </div>
            {flr.note && <p className="sw-note">{flr.note}</p>}
          </div>
        ))}

        {/* Coronal Mass Ejections */}
        {tab === 'cme' && data.map((cme) => {
          const analysis = cme.cmeAnalyses?.find((a) => a.isMostAccurate) || cme.cmeAnalyses?.[0];
          return (
            <div key={cme.activityID} className="sw-card" style={{ borderLeftColor: '#818cf8' }}>
              <div className="sw-card-header">
                <span className="sw-badge" style={{ background: 'rgba(129,140,248,0.2)', color: '#818cf8' }}>
                  {analysis?.type === 'S' ? 'Slow' : analysis?.type === 'C' ? 'Common' : analysis?.type === 'O' ? 'Occasional' : analysis?.type || 'CME'}
                </span>
                <span className="sw-time">{new Date(cme.startTime).toLocaleString()}</span>
              </div>
              <div className="sw-card-body">
                {analysis && (
                  <>
                    <div className="sw-detail"><span className="sw-label">Speed</span><span>{analysis.speed ? `${analysis.speed} km/s` : '—'}</span></div>
                    <div className="sw-detail"><span className="sw-label">Half Angle</span><span>{analysis.halfAngle ? `${analysis.halfAngle}°` : '—'}</span></div>
                    <div className="sw-detail"><span className="sw-label">Latitude</span><span>{analysis.latitude ?? '—'}</span></div>
                    <div className="sw-detail"><span className="sw-label">Longitude</span><span>{analysis.longitude ?? '—'}</span></div>
                  </>
                )}
                <div className="sw-detail"><span className="sw-label">Source</span><span>{cme.sourceLocation || '—'}</span></div>
                <div className="sw-detail"><span className="sw-label">Instruments</span><span>{cme.instruments?.map((i) => i.displayName).join(', ') || '—'}</span></div>
              </div>
              {cme.note && <p className="sw-note">{cme.note}</p>}
            </div>
          );
        })}

        {/* Geomagnetic Storms */}
        {tab === 'gst' && data.map((gst) => {
          const maxKp = gst.allKpIndex?.reduce((max, k) => Math.max(max, k.kpIndex), 0) || 0;
          return (
            <div key={gst.gstID} className="sw-card" style={{ borderLeftColor: getKpColor(maxKp) }}>
              <div className="sw-card-header">
                <span className="sw-badge" style={{ background: getKpColor(maxKp) + '25', color: getKpColor(maxKp) }}>
                  Kp {maxKp.toFixed(1)} — {getKpLabel(maxKp)}
                </span>
                <span className="sw-time">{new Date(gst.startTime).toLocaleString()}</span>
              </div>
              <div className="sw-kp-timeline">
                {gst.allKpIndex?.map((k, i) => (
                  <div key={i} className="kp-bar-wrapper" title={`${new Date(k.observedTime).toLocaleTimeString()} — Kp ${k.kpIndex}`}>
                    <div className="kp-bar" style={{ height: `${(k.kpIndex / 9) * 100}%`, background: getKpColor(k.kpIndex) }} />
                    <span className="kp-val">{k.kpIndex.toFixed(1)}</span>
                  </div>
                ))}
              </div>
              {gst.linkedEvents?.length > 0 && (
                <p className="sw-note">Linked events: {gst.linkedEvents.map((e) => e.activityID).join(', ')}</p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default SpaceWeather;
