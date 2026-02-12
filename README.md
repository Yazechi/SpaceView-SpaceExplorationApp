# SpaceView

An immersive space exploration web application built with React and Three.js, powered by multiple NASA APIs. SpaceView provides an interactive experience for exploring space missions, astronaut profiles, celestial bodies, real-time space weather, exoplanet data, and a 3D solar system visualization.

## Table of Contents

- [Features](#features)
- [Screenshots](#screenshots)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [NASA API Integration](#nasa-api-integration)
- [Pages](#pages)
- [Configuration](#configuration)
- [Building for Production](#building-for-production)
- [License](#license)

## Features

- **3D Solar System** -- Interactive Three.js visualization where users can explore planets with orbital animations and click for detailed information.
- **NASA Astronomy Picture of the Day (APOD)** -- Browse a gallery of NASA's daily curated astronomical images with date range selection.
- **Mars Rover Gallery** -- Search and browse imagery captured by Mars rovers (Curiosity, Opportunity, Spirit) via the NASA Image and Video Library.
- **Near-Earth Asteroid Tracker** -- View asteroids approaching Earth within a date range, with hazard indicators and close-approach data.
- **ISS Live Tracker** -- Real-time International Space Station position tracking with auto-refresh, velocity, and orbital data.
- **Space Weather (DONKI)** -- Monitor coronal mass ejections, geomagnetic storms, and solar flares from NASA's DONKI API with Kp-index visualizations.
- **Exoplanet Explorer** -- Query NASA's Exoplanet Archive with filterable/sortable tables, discovery method stats, and paginated results.
- **InSight Mars Weather** -- View historical Martian weather data (temperature, wind, pressure) from the InSight lander.
- **Mission Database** -- Browse past and current space missions with details on launch dates, status, and objectives.
- **Astronaut Profiles** -- Detailed biographies, mission histories, and photos of notable astronauts.
- **Celestial Bodies** -- Information and facts about planets, moons, and asteroids in our solar system.
- **Interactive Timeline** -- A chronological timeline of significant events in space exploration history.
- **Global Search** -- Search across missions, astronauts, and celestial bodies from a single search bar.
- **Starfield Parallax Background** -- Multi-layered animated star background with depth-based parallax scrolling.
- **Page Transitions** -- Smooth animated transitions between routes.
- **Responsive Design** -- Fully responsive layout that works across desktop, tablet, and mobile devices.

## Tech Stack

| Category        | Technology                                                       |
| --------------- | ---------------------------------------------------------------- |
| Framework       | [React 19](https://react.dev/)                                   |
| Build Tool      | [Vite 7](https://vite.dev/)                                     |
| 3D Rendering    | [Three.js](https://threejs.org/) + [React Three Fiber](https://docs.pmnd.rs/react-three-fiber) + [Drei](https://docs.pmnd.rs/drei) |
| Routing         | [React Router DOM 7](https://reactrouter.com/)                  |
| Styling         | CSS with custom properties (no external UI library)              |
| Linting         | [ESLint 9](https://eslint.org/)                                 |
| APIs            | NASA Open APIs, Exoplanet Archive TAP, Where the ISS At         |

## Project Structure

```
SpaceView/
├── public/                          # Static assets
├── src/
│   ├── assets/                      # Images and media
│   ├── components/                  # Reusable UI components
│   │   ├── ErrorMessage/            # Error display with retry
│   │   ├── Footer/                  # Site footer
│   │   ├── Layout/                  # Page layout wrapper
│   │   ├── LoadingSpinner/          # Loading indicator
│   │   ├── Navbar/                  # Responsive navigation bar
│   │   ├── PageTransition/          # Route transition animations
│   │   ├── SearchBar/               # Search input component
│   │   ├── SolarSystem/             # 3D solar system (Three.js)
│   │   ├── Starfield/               # Parallax star background
│   │   └── Timeline/                # Interactive timeline
│   ├── data/
│   │   └── spaceData.js             # Static data (missions, astronauts, celestial bodies, timeline events)
│   ├── pages/                       # Route-level page components
│   │   ├── Home.jsx                 # Landing page
│   │   ├── Missions.jsx             # Mission list
│   │   ├── MissionDetail.jsx        # Individual mission details
│   │   ├── Astronauts.jsx           # Astronaut directory
│   │   ├── AstronautDetail.jsx      # Individual astronaut profile
│   │   ├── CelestialBodies.jsx      # Celestial body catalog
│   │   ├── CelestialBodyDetail.jsx  # Individual body details
│   │   ├── TimelinePage.jsx         # Space exploration timeline
│   │   ├── SolarSystemPage.jsx      # 3D solar system view
│   │   ├── Search.jsx               # Global search
│   │   ├── MarsRover.jsx            # Mars rover imagery
│   │   ├── Asteroids.jsx            # Near-Earth asteroid tracker
│   │   ├── APODGallery.jsx          # Astronomy Picture of the Day gallery
│   │   ├── ISSTracker.jsx           # ISS live position tracker
│   │   ├── SpaceWeather.jsx         # DONKI space weather dashboard
│   │   ├── Exoplanets.jsx           # Exoplanet archive explorer
│   │   └── InSight.jsx              # Mars InSight weather data
│   ├── services/
│   │   └── nasaApi.js               # All NASA API service functions
│   ├── styles/                      # Page-specific CSS files
│   ├── App.jsx                      # Root component with route definitions
│   ├── App.css                      # App-level styles
│   ├── index.css                    # Global styles and CSS custom properties
│   └── main.jsx                     # Application entry point
├── index.html                       # HTML entry point
├── vite.config.js                   # Vite configuration (includes API proxy)
├── eslint.config.js                 # ESLint configuration
├── package.json                     # Dependencies and scripts
└── README.md
```

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or later)
- npm (comes with Node.js)

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/your-username/SpaceView.git
   cd SpaceView
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. **Set your NASA API key.** Open `src/services/nasaApi.js` and replace the `NASA_API_KEY` value with your own key from [https://api.nasa.gov/](https://api.nasa.gov/):

   ```js
   const NASA_API_KEY = 'YOUR_API_KEY_HERE';
   ```

4. Start the development server:

   ```bash
   npm run dev
   ```

5. Open [http://localhost:5173](http://localhost:5173) in your browser.

## NASA API Integration

SpaceView integrates with the following APIs:

| API                        | Endpoint                                             | Used For                                          |
| -------------------------- | ---------------------------------------------------- | ------------------------------------------------- |
| **APOD**                   | `api.nasa.gov/planetary/apod`                        | Astronomy Picture of the Day gallery              |
| **NASA Image & Video Library** | `images-api.nasa.gov/search`                     | Mars rover photos and general NASA imagery        |
| **Near Earth Objects (NEO)** | `api.nasa.gov/neo/rest/v1/feed`                    | Asteroid tracking with close-approach data        |
| **DONKI - CME**            | `api.nasa.gov/DONKI/CME`                             | Coronal Mass Ejection events                      |
| **DONKI - GST**            | `api.nasa.gov/DONKI/GST`                             | Geomagnetic Storm data with Kp-index              |
| **DONKI - FLR**            | `api.nasa.gov/DONKI/FLR`                             | Solar Flare events with class ratings             |
| **Exoplanet Archive**      | `exoplanetarchive.ipac.caltech.edu/TAP/sync`         | Confirmed exoplanet data via TAP/ADQL queries     |
| **InSight Weather**        | `api.nasa.gov/insight_weather/`                       | Mars surface weather (historical, mission ended 2022) |
| **Where the ISS At**       | `api.wheretheiss.at/v1/satellites/25544`              | Real-time ISS position, velocity, and altitude    |

> **Note:** The Exoplanet Archive API does not support CORS. In development, requests are proxied through the Vite dev server (`/exoplanet-api` -> `exoplanetarchive.ipac.caltech.edu`). For production, you will need a server-side proxy or backend.

> **Note:** The InSight weather API returns historical data. The InSight lander's final weather reading was Sol 675-676 (October 2020), and the mission ended in December 2022.

## Pages

| Route               | Page              | Description                                                  |
| -------------------- | ----------------- | ------------------------------------------------------------ |
| `/`                  | Home              | Landing page with featured content and navigation highlights |
| `/missions`          | Missions          | Browse space missions with status filters                    |
| `/missions/:id`      | Mission Detail    | Detailed view of a specific mission                          |
| `/astronauts`        | Astronauts        | Astronaut directory with search                              |
| `/astronauts/:id`    | Astronaut Detail  | Full astronaut profile and mission history                   |
| `/celestial-bodies`  | Celestial Bodies  | Catalog of planets, moons, and asteroids                     |
| `/celestial-bodies/:id` | Body Detail    | Detailed facts about a celestial body                        |
| `/timeline`          | Timeline          | Interactive timeline of space exploration milestones         |
| `/solar-system`      | Solar System      | 3D interactive solar system built with Three.js              |
| `/mars-rover`        | Mars Rover        | Rover imagery gallery with per-rover filtering               |
| `/asteroids`         | Asteroids         | Near-Earth objects with hazard indicators                    |
| `/apod-gallery`      | APOD Gallery      | NASA's Astronomy Picture of the Day with date selection      |
| `/iss-tracker`       | ISS Tracker       | Live ISS position with auto-refreshing data                  |
| `/space-weather`     | Space Weather     | DONKI dashboard: CME, geomagnetic storms, solar flares       |
| `/exoplanets`        | Exoplanets        | Exoplanet archive with filtering, sorting, and statistics    |
| `/insight`           | InSight           | Mars weather data from the InSight lander                    |
| `/search`            | Search            | Global search across all content categories                  |

## Configuration

### Vite Dev Server Proxy

The `vite.config.js` includes a proxy configuration for the Exoplanet Archive API to bypass CORS restrictions during development:

```js
server: {
  proxy: {
    '/exoplanet-api': {
      target: 'https://exoplanetarchive.ipac.caltech.edu',
      changeOrigin: true,
      rewrite: (path) => path.replace(/^\/exoplanet-api/, ''),
    },
  },
}
```

### CSS Custom Properties

The app uses CSS custom properties defined in `src/index.css` for consistent theming:

```css
--color-bg-primary       /* Main background */
--color-bg-secondary     /* Card/section backgrounds */
--color-text-primary     /* Primary text */
--color-text-secondary   /* Secondary/muted text */
--color-accent           /* Accent/highlight color */
--color-border           /* Border color */
```

## Building for Production

```bash
npm run build
```

The output is generated in the `dist/` directory and can be served by any static file host. Preview the production build locally with:

```bash
npm run preview
```

### Production Considerations

- **Exoplanet API Proxy:** The Vite dev proxy does not apply in production. You will need to set up a server-side proxy (e.g., via Nginx, Cloudflare Workers, or a backend endpoint) to forward requests to `exoplanetarchive.ipac.caltech.edu`.
- **API Key Security:** The NASA API key is embedded in the client-side code. For production, consider moving API calls to a backend service if key security is a concern. NASA API keys have generous rate limits and are free, so client-side usage is generally acceptable.
- **Bundle Size:** The current bundle exceeds 500 KB. Consider implementing route-based code splitting with `React.lazy()` and `Suspense` for improved load performance.

## License

This project is for educational and personal use. NASA data and imagery are in the public domain unless otherwise noted. See [NASA's Media Usage Guidelines](https://www.nasa.gov/nasa-brand-center/images-and-media/) for details.
