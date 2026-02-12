import { Link } from 'react-router-dom';
import './Footer.css';

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <p className="footer-text">
          SpaceView -- Exploring the cosmos. Powered by NASA Open APIs.
        </p>
        <ul className="footer-links">
          <li><Link to="/missions">Missions</Link></li>
          <li><Link to="/astronauts">Astronauts</Link></li>
          <li><Link to="/celestial-bodies">Celestial Bodies</Link></li>
          <li>
            <a href="https://api.nasa.gov/" target="_blank" rel="noopener noreferrer">
              NASA API
            </a>
          </li>
        </ul>
        <p className="footer-copyright">
          &copy; {new Date().getFullYear()} Yaze. All rights reserved.
        </p>
      </div>
    </footer>
  );
}

export default Footer;
