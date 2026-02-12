import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout/Layout';
import Home from './pages/Home';
import Missions from './pages/Missions';
import MissionDetail from './pages/MissionDetail';
import Astronauts from './pages/Astronauts';
import AstronautDetail from './pages/AstronautDetail';
import CelestialBodies from './pages/CelestialBodies';
import CelestialBodyDetail from './pages/CelestialBodyDetail';
import TimelinePage from './pages/TimelinePage';
import SolarSystemPage from './pages/SolarSystemPage';
import Search from './pages/Search';
import MarsRover from './pages/MarsRover';
import Asteroids from './pages/Asteroids';
import APODGallery from './pages/APODGallery';
import ISSTracker from './pages/ISSTracker';
import SpaceWeather from './pages/SpaceWeather';
import Exoplanets from './pages/Exoplanets';
import InSight from './pages/InSight';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="missions" element={<Missions />} />
          <Route path="missions/:id" element={<MissionDetail />} />
          <Route path="astronauts" element={<Astronauts />} />
          <Route path="astronauts/:id" element={<AstronautDetail />} />
          <Route path="celestial-bodies" element={<CelestialBodies />} />
          <Route path="celestial-bodies/:id" element={<CelestialBodyDetail />} />
          <Route path="timeline" element={<TimelinePage />} />
          <Route path="solar-system" element={<SolarSystemPage />} />
          <Route path="search" element={<Search />} />
          <Route path="mars-rover" element={<MarsRover />} />
          <Route path="asteroids" element={<Asteroids />} />
          <Route path="apod-gallery" element={<APODGallery />} />
          <Route path="iss-tracker" element={<ISSTracker />} />
          <Route path="space-weather" element={<SpaceWeather />} />
          <Route path="exoplanets" element={<Exoplanets />} />
          <Route path="insight" element={<InSight />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
