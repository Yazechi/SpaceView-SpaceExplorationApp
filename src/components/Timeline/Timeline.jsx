import './Timeline.css';

function Timeline({ events }) {
  return (
    <div className="timeline-container">
      <div className="timeline-line" />
      {events.map((event, index) => (
        <div className="timeline-item" key={index}>
          <div className="timeline-dot" />
          <div className="timeline-content">
            <div className="timeline-year">{event.year}</div>
            <h3 className="timeline-title">{event.title}</h3>
            <p className="timeline-description">{event.description}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

export default Timeline;
