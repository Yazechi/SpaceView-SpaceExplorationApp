import SolarSystem from '../components/SolarSystem/SolarSystem';

function SolarSystemPage() {
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
