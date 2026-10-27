import { timelineEvents } from '../data/spaceData';
import Timeline from '../components/Timeline/Timeline';
import useSEO from '../hooks/useSEO';

function TimelinePage() {
  useSEO({
    title: "Space Exploration Timeline",
    description: "An interactive chronology of the greatest milestones and achievements in human spaceflight and cosmos exploration on SpaceView.",
    canonicalUrl: "https://space-view-rho.vercel.app/timeline",
  });
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
