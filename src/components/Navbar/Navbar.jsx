import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import './Navbar.css';

function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => setIsOpen(!isOpen);
  const closeMenu = () => setIsOpen(false);

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <Link to="/" className="navbar-brand" onClick={closeMenu}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
            <path d="M2 12h20" />
          </svg>
          SpaceView
        </Link>

        <button className="navbar-toggle" onClick={toggleMenu} aria-label="Toggle navigation">
          {isOpen ? '\u2715' : '\u2630'}
        </button>

        <ul className={`navbar-links ${isOpen ? 'open' : ''}`}>
          <li><NavLink to="/" onClick={closeMenu} end>Home</NavLink></li>
          <li><NavLink to="/missions" onClick={closeMenu}>Missions</NavLink></li>
          <li><NavLink to="/astronauts" onClick={closeMenu}>Astronauts</NavLink></li>
          <li><NavLink to="/celestial-bodies" onClick={closeMenu}>Celestial Bodies</NavLink></li>
          <li><NavLink to="/timeline" onClick={closeMenu}>Timeline</NavLink></li>
          <li><NavLink to="/solar-system" onClick={closeMenu}>Solar System</NavLink></li>
          <li><NavLink to="/mars-rover" onClick={closeMenu}>Mars Rover</NavLink></li>
          <li><NavLink to="/asteroids" onClick={closeMenu}>Asteroids</NavLink></li>
          <li><NavLink to="/apod-gallery" onClick={closeMenu}>APOD Gallery</NavLink></li>
          <li><NavLink to="/iss-tracker" onClick={closeMenu}>ISS Tracker</NavLink></li>
          <li><NavLink to="/space-weather" onClick={closeMenu}>Space Weather</NavLink></li>
          <li><NavLink to="/exoplanets" onClick={closeMenu}>Exoplanets</NavLink></li>
          <li><NavLink to="/insight" onClick={closeMenu}>InSight</NavLink></li>
          <li><NavLink to="/search" onClick={closeMenu}>Search</NavLink></li>
        </ul>
      </div>
    </nav>
  );
}

export default Navbar;
