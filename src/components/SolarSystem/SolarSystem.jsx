import { useState, useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Stars } from '@react-three/drei';
import * as THREE from 'three';
import { planetData, celestialBodies } from '../../data/spaceData';
import './SolarSystem.css';

// Preset configurations for planet moons
const MOONS_PRESETS = {
  Earth: [
    { name: 'Moon', color: '#c0c0c0', size: 0.12, distance: 1.1, speed: 0.9 }
  ],
  Mars: [
    { name: 'Phobos', color: '#9e8a78', size: 0.06, distance: 0.7, speed: 1.3 },
    { name: 'Deimos', color: '#8c7d70', size: 0.05, distance: 0.95, speed: 1.0 }
  ],
  Jupiter: [
    { name: 'Io', color: '#dfb73c', size: 0.12, distance: 2.0, speed: 1.5 },
    { name: 'Europa', color: '#a6c0d0', size: 0.11, distance: 2.4, speed: 1.2 },
    { name: 'Ganymede', color: '#9d9d9d', size: 0.16, distance: 2.9, speed: 0.9 },
    { name: 'Callisto', color: '#7a7a7a', size: 0.14, distance: 3.4, speed: 0.7 }
  ],
  Saturn: [
    { name: 'Titan', color: '#dfb06c', size: 0.18, distance: 2.6, speed: 0.8 }
  ],
  Uranus: [
    { name: 'Ariel', color: '#9090b0', size: 0.09, distance: 1.5, speed: 1.3 },
    { name: 'Umbriel', color: '#707080', size: 0.08, distance: 1.8, speed: 1.0 },
    { name: 'Titania', color: '#b0b0c0', size: 0.12, distance: 2.2, speed: 0.8 },
    { name: 'Oberon', color: '#808090', size: 0.11, distance: 2.6, speed: 0.6 }
  ],
  Neptune: [
    { name: 'Triton', color: '#a0c0c0', size: 0.14, distance: 1.6, speed: -0.9 } // Retrograde orbit
  ]
};

// Enrich static planetData with moons
const planetDataWithMoons = planetData.map(planet => ({
  ...planet,
  moons: MOONS_PRESETS[planet.name] || []
}));

function Sun() {
  const meshRef = useRef();

  useFrame(() => {
    meshRef.current.rotation.y += 0.002;
  });

  return (
    <mesh ref={meshRef}>
      <sphereGeometry args={[2.2, 32, 32]} />
      <meshBasicMaterial color="#fdb813" />
      <pointLight intensity={12} distance={150} decay={1.2} />
    </mesh>
  );
}

function OrbitLine({ distance, color = '#3b82f6', opacity = 0.3 }) {
  const points = useMemo(() => {
    const pts = [];
    const segments = 128;
    for (let i = 0; i <= segments; i++) {
      const theta = (i / segments) * Math.PI * 2;
      pts.push(new THREE.Vector3(Math.cos(theta) * distance, 0, Math.sin(theta) * distance));
    }
    return pts;
  }, [distance]);

  return (
    <line>
      <bufferGeometry attach="geometry" setFromPoints={points} />
      <lineBasicMaterial attach="material" color={color} opacity={opacity} transparent linewidth={1} />
    </line>
  );
}

function MoonOrbitLine({ distance, color = '#4b5563', opacity = 0.2 }) {
  const points = useMemo(() => {
    const pts = [];
    const segments = 64;
    for (let i = 0; i <= segments; i++) {
      const theta = (i / segments) * Math.PI * 2;
      pts.push(new THREE.Vector3(Math.cos(theta) * distance, 0, Math.sin(theta) * distance));
    }
    return pts;
  }, [distance]);

  return (
    <line>
      <bufferGeometry attach="geometry" setFromPoints={points} />
      <lineBasicMaterial attach="material" color={color} opacity={opacity} transparent linewidth={1} />
    </line>
  );
}

function Planet({ planet, onClick, isSelected }) {
  const groupRef = useRef();
  const planetRef = useRef();
  const angle = useRef(Math.random() * Math.PI * 2);
  const moonAngles = useRef(planet.moons.map(() => Math.random() * Math.PI * 2));

  useFrame((state, delta) => {
    // Orbital motion around the Sun
    angle.current += planet.speed * delta * 0.4;
    const x = Math.cos(angle.current) * planet.distance;
    const z = Math.sin(angle.current) * planet.distance;
    groupRef.current.position.set(x, 0, z);

    // Planet self-rotation
    if (planetRef.current) {
      planetRef.current.rotation.y += 0.005;
    }

    // Moons orbital motion
    if (planet.moons && planet.moons.length > 0) {
      planet.moons.forEach((moon, idx) => {
        moonAngles.current[idx] += moon.speed * delta * 1.5;
        const moonMesh = groupRef.current.getObjectByName(`moon-${idx}`);
        if (moonMesh) {
          const mx = Math.cos(moonAngles.current[idx]) * moon.distance;
          const mz = Math.sin(moonAngles.current[idx]) * moon.distance;
          moonMesh.position.set(mx, 0, mz);
          moonMesh.rotation.y += 0.01;
        }
      });
    }
  });

  return (
    <group ref={groupRef}>
      {/* The planet body */}
      <mesh
        ref={planetRef}
        name="planet-body"
        onClick={(e) => {
          e.stopPropagation();
          onClick(planet);
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          document.body.style.cursor = 'pointer';
        }}
        onPointerOut={() => {
          document.body.style.cursor = 'default';
        }}
      >
        <sphereGeometry args={[planet.size, 32, 32]} />
        <meshStandardMaterial
          color={planet.color}
          emissive={isSelected ? planet.color : '#000000'}
          emissiveIntensity={isSelected ? 0.4 : 0.05}
          roughness={0.7}
        />

        {/* Planet Rings */}
        {planet.name === 'Saturn' && (
          <mesh rotation={[Math.PI / 3.2, 0, 0]}>
            <ringGeometry args={[planet.size * 1.3, planet.size * 2.3, 64]} />
            <meshStandardMaterial color="#c4a44a" transparent opacity={0.7} side={THREE.DoubleSide} />
          </mesh>
        )}

        {planet.name === 'Uranus' && (
          <mesh rotation={[Math.PI / 2.3, Math.PI / 8, 0]}>
            <ringGeometry args={[planet.size * 1.3, planet.size * 1.7, 64]} />
            <meshStandardMaterial color="#86e3ec" transparent opacity={0.45} side={THREE.DoubleSide} />
          </mesh>
        )}

        {planet.name === 'Jupiter' && (
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <ringGeometry args={[planet.size * 1.35, planet.size * 1.55, 64]} />
            <meshStandardMaterial color="#c88b3a" transparent opacity={0.2} side={THREE.DoubleSide} />
          </mesh>
        )}

        {planet.name === 'Neptune' && (
          <mesh rotation={[Math.PI / 2.1, 0, 0]}>
            <ringGeometry args={[planet.size * 1.25, planet.size * 1.45, 64]} />
            <meshStandardMaterial color="#4b6cb7" transparent opacity={0.25} side={THREE.DoubleSide} />
          </mesh>
        )}
      </mesh>

      {/* Moons and their orbits */}
      {planet.moons.map((moon, idx) => (
        <group key={`moon-group-${idx}`}>
          <MoonOrbitLine distance={moon.distance} color="#ffffff" opacity={0.12} />
          <mesh name={`moon-${idx}`}>
            <sphereGeometry args={[moon.size, 16, 16]} />
            <meshStandardMaterial color={moon.color} roughness={0.9} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

function Scene({ onPlanetClick, selectedPlanet }) {
  return (
    <>
      <ambientLight intensity={0.2} />
      <Stars radius={120} depth={60} count={3500} factor={5} fade speed={1.2} />
      <Sun />
      
      {/* Draw orbital paths and planets */}
      {planetDataWithMoons.map((planet) => (
        <group key={planet.name}>
          <OrbitLine distance={planet.distance} color="#4b5563" opacity={0.35} />
          <Planet
            planet={planet}
            onClick={onPlanetClick}
            isSelected={selectedPlanet?.name === planet.name}
          />
        </group>
      ))}

      <OrbitControls
        enablePan={true}
        enableZoom={true}
        enableRotate={true}
        minDistance={5}
        maxDistance={70}
        makeDefault
      />
    </>
  );
}

function SolarSystem() {
  const [selectedPlanet, setSelectedPlanet] = useState(null);

  const handlePlanetClick = (planet) => {
    setSelectedPlanet(planet);
  };

  return (
    <div className="solar-system-container">
      <Canvas camera={{ position: [0, 22, 32], fov: 48 }}>
        <Scene onPlanetClick={handlePlanetClick} selectedPlanet={selectedPlanet} />
      </Canvas>
      
      <div className="solar-system-hint">
        Scroll to zoom • Drag to rotate • Click planet for detailed information
      </div>

      {selectedPlanet && (
        <div className="solar-system-modal">
          <div className="solar-system-modal-header">
            <h3>{selectedPlanet.name}</h3>
            <button 
              className="solar-system-modal-close" 
              onClick={() => setSelectedPlanet(null)}
              aria-label="Close details"
            >
              &times;
            </button>
          </div>
          
          <div className="solar-system-modal-body">
            <p className="solar-system-modal-description">{selectedPlanet.description}</p>
            
            {(() => {
              const bodyDetails = celestialBodies.find(
                c => c.name.toLowerCase() === selectedPlanet.name.toLowerCase()
              );
              if (!bodyDetails) return null;
              return (
                <div className="solar-system-modal-details">
                  <div className="detail-row">
                    <span className="detail-label">Distance from Sun</span>
                    <span className="detail-val">{bodyDetails.distanceFromSun}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Diameter</span>
                    <span className="detail-val">{bodyDetails.diameter}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Orbital Period</span>
                    <span className="detail-val">{bodyDetails.orbitalPeriod}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Moons Simulated</span>
                    <span className="detail-val">{selectedPlanet.moons?.length || 0}</span>
                  </div>

                  {bodyDetails.facts && bodyDetails.facts.length > 0 && (
                    <div className="modal-facts-section">
                      <h4>Key Facts</h4>
                      <ul>
                        {bodyDetails.facts.map((fact, index) => (
                          <li key={index}>{fact}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
}

export default SolarSystem;
