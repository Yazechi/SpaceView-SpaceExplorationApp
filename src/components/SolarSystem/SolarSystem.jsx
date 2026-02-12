import { useState, useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Stars, Html } from '@react-three/drei';
import { planetData } from '../../data/spaceData';
import './SolarSystem.css';

function Sun() {
  const meshRef = useRef();

  useFrame((state) => {
    meshRef.current.rotation.y += 0.002;
  });

  return (
    <mesh ref={meshRef}>
      <sphereGeometry args={[2, 32, 32]} />
      <meshBasicMaterial color="#fdb813" />
      <pointLight intensity={2} distance={100} decay={2} />
    </mesh>
  );
}

function Planet({ planet, onClick, isSelected }) {
  const meshRef = useRef();
  const orbitRef = useRef();
  const angle = useRef(Math.random() * Math.PI * 2);

  useFrame((state, delta) => {
    angle.current += planet.speed * delta * 10;
    const x = Math.cos(angle.current) * planet.distance;
    const z = Math.sin(angle.current) * planet.distance;
    meshRef.current.position.set(x, 0, z);
    meshRef.current.rotation.y += 0.01;
  });

  return (
    <group>
      {/* Orbit ring */}
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[planet.distance - 0.02, planet.distance + 0.02, 128]} />
        <meshBasicMaterial color="#1a2332" transparent opacity={0.5} side={2} />
      </mesh>

      <mesh
        ref={meshRef}
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
          emissiveIntensity={isSelected ? 0.3 : 0}
        />
        {/* Saturn ring */}
        {planet.name === 'Saturn' && (
          <mesh rotation={[Math.PI / 3, 0, 0]}>
            <ringGeometry args={[planet.size * 1.4, planet.size * 2, 64]} />
            <meshStandardMaterial color="#c4a44a" transparent opacity={0.6} side={2} />
          </mesh>
        )}
      </mesh>
    </group>
  );
}

function Scene({ onPlanetClick, selectedPlanet }) {
  return (
    <>
      <ambientLight intensity={0.15} />
      <Stars radius={100} depth={50} count={3000} factor={4} fade speed={1} />
      <Sun />
      {planetData.map((planet) => (
        <Planet
          key={planet.name}
          planet={planet}
          onClick={onPlanetClick}
          isSelected={selectedPlanet?.name === planet.name}
        />
      ))}
      <OrbitControls
        enablePan={true}
        enableZoom={true}
        enableRotate={true}
        minDistance={5}
        maxDistance={60}
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
      <Canvas camera={{ position: [0, 20, 30], fov: 50 }}>
        <Scene onPlanetClick={handlePlanetClick} selectedPlanet={selectedPlanet} />
      </Canvas>
      <div className="solar-system-hint">
        Click on a planet for details. Scroll to zoom. Drag to rotate.
      </div>
      {selectedPlanet && (
        <div className="solar-system-info">
          <h3>{selectedPlanet.name}</h3>
          <p>{selectedPlanet.description}</p>
        </div>
      )}
    </div>
  );
}

export default SolarSystem;
