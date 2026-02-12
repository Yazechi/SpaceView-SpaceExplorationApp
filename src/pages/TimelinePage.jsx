import { timelineEvents } from '../data/spaceData';
import Timeline from '../components/Timeline/Timeline';

function TimelinePage() {
  return (
    <div className="page">
      <div className="container">
        <h1 className="page-title">Space Exploration Timeline</h1>
        <p className="page-subtitle">
          Key milestones in humanity's journey to explore the cosmos.
        </p>
        <Timeline events={timelineEvents} />
      </div>
    </div>
  );
}

export default TimelinePage;
