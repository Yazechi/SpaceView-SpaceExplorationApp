import SolarSystem from '../components/SolarSystem/SolarSystem';
import useSEO from '../hooks/useSEO';

function SolarSystemPage() {
  useSEO({
    title: "3D Interactive Solar System",
    description: "Interactive 3D simulation of our solar system with accurate orbital paths, speeds, planetary textures, and moon data on SpaceView.",
    canonicalUrl: "https://space-view-rho.vercel.app/solar-system",
  });
  return (
    <div className="page">
      <div className="container">
        <h1 className="page-title">3D Solar System</h1>
        <p className="page-subtitle">
          An interactive 3D preview of our Solar System. Click on any planet to learn more about it.
        </p>
        <SolarSystem />
      </div>
    </div>
  );
}

export default SolarSystemPage;
