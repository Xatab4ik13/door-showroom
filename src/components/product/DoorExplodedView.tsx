import { useState, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Html } from '@react-three/drei';
import * as THREE from 'three';

// Door panel
const DoorPanel = ({ exploded, color }: { exploded: boolean; color: string }) => {
  const ref = useRef<THREE.Group>(null);
  const targetY = exploded ? 0.3 : 0;

  useFrame(() => {
    if (ref.current) {
      ref.current.position.y = THREE.MathUtils.lerp(ref.current.position.y, targetY, 0.05);
    }
  });

  return (
    <group ref={ref} position={[0, 0, 0]}>
      {/* Door slab */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[0.8, 2.0, 0.04]} />
        <meshStandardMaterial color={color} roughness={0.3} metalness={0.1} />
      </mesh>
      {/* Panel detail lines */}
      <mesh position={[0, 0.3, 0.021]}>
        <boxGeometry args={[0.6, 0.02, 0.002]} />
        <meshStandardMaterial color="#555" />
      </mesh>
      <mesh position={[0, -0.3, 0.021]}>
        <boxGeometry args={[0.6, 0.02, 0.002]} />
        <meshStandardMaterial color="#555" />
      </mesh>
      {/* Handle */}
      <mesh position={[0.32, 0, 0.03]}>
        <cylinderGeometry args={[0.012, 0.012, 0.12, 16]} />
        <meshStandardMaterial color="#C0A060" metalness={0.8} roughness={0.2} />
      </mesh>
      {exploded && (
        <Html position={[0, 1.15, 0]} center>
          <div className="bg-foreground/90 text-background text-[10px] px-2 py-1 rounded whitespace-nowrap font-medium" style={{ fontFamily: "'Oswald', sans-serif" }}>
            ДВЕРНОЕ ПОЛОТНО
          </div>
        </Html>
      )}
    </group>
  );
};

// Door frame (коробка)
const DoorFrame = ({ exploded, color }: { exploded: boolean; color: string }) => {
  const ref = useRef<THREE.Group>(null);
  const targetZ = exploded ? -0.25 : 0;

  useFrame(() => {
    if (ref.current) {
      ref.current.position.z = THREE.MathUtils.lerp(ref.current.position.z, targetZ, 0.05);
    }
  });

  const frameColor = new THREE.Color(color).offsetHSL(0, -0.05, -0.1).getStyle();

  return (
    <group ref={ref}>
      {/* Left jamb */}
      <mesh position={[-0.44, 0, 0]}>
        <boxGeometry args={[0.06, 2.1, 0.08]} />
        <meshStandardMaterial color={frameColor} roughness={0.4} />
      </mesh>
      {/* Right jamb */}
      <mesh position={[0.44, 0, 0]}>
        <boxGeometry args={[0.06, 2.1, 0.08]} />
        <meshStandardMaterial color={frameColor} roughness={0.4} />
      </mesh>
      {/* Header */}
      <mesh position={[0, 1.05, 0]}>
        <boxGeometry args={[0.94, 0.06, 0.08]} />
        <meshStandardMaterial color={frameColor} roughness={0.4} />
      </mesh>
      {exploded && (
        <Html position={[0.44, 1.2, 0]} center>
          <div className="bg-foreground/90 text-background text-[10px] px-2 py-1 rounded whitespace-nowrap font-medium" style={{ fontFamily: "'Oswald', sans-serif" }}>
            ДВЕРНАЯ КОРОБКА
          </div>
        </Html>
      )}
    </group>
  );
};

// Наличники (casings)
const Casings = ({ exploded, color }: { exploded: boolean; color: string }) => {
  const ref = useRef<THREE.Group>(null);
  const targetZ = exploded ? 0.25 : 0.04;

  useFrame(() => {
    if (ref.current) {
      ref.current.position.z = THREE.MathUtils.lerp(ref.current.position.z, targetZ, 0.05);
    }
  });

  const casingColor = new THREE.Color(color).offsetHSL(0, -0.02, -0.05).getStyle();

  return (
    <group ref={ref}>
      {/* Left casing */}
      <mesh position={[-0.5, 0, 0]}>
        <boxGeometry args={[0.06, 2.15, 0.01]} />
        <meshStandardMaterial color={casingColor} roughness={0.3} />
      </mesh>
      {/* Right casing */}
      <mesh position={[0.5, 0, 0]}>
        <boxGeometry args={[0.06, 2.15, 0.01]} />
        <meshStandardMaterial color={casingColor} roughness={0.3} />
      </mesh>
      {/* Top casing */}
      <mesh position={[0, 1.08, 0]}>
        <boxGeometry args={[1.06, 0.06, 0.01]} />
        <meshStandardMaterial color={casingColor} roughness={0.3} />
      </mesh>
      {exploded && (
        <Html position={[-0.5, -1.15, 0]} center>
          <div className="bg-foreground/90 text-background text-[10px] px-2 py-1 rounded whitespace-nowrap font-medium" style={{ fontFamily: "'Oswald', sans-serif" }}>
            НАЛИЧНИКИ
          </div>
        </Html>
      )}
    </group>
  );
};

// Hinges (петли)
const Hinges = ({ exploded }: { exploded: boolean }) => {
  const ref = useRef<THREE.Group>(null);
  const targetX = exploded ? -0.7 : -0.4;

  useFrame(() => {
    if (ref.current) {
      ref.current.position.x = THREE.MathUtils.lerp(ref.current.position.x, targetX, 0.05);
    }
  });

  return (
    <group ref={ref}>
      {[0.6, 0, -0.6].map((y, i) => (
        <mesh key={i} position={[0, y, 0.02]}>
          <boxGeometry args={[0.03, 0.08, 0.015]} />
          <meshStandardMaterial color="#C0A060" metalness={0.8} roughness={0.2} />
        </mesh>
      ))}
      {exploded && (
        <Html position={[0, 0.85, 0]} center>
          <div className="bg-foreground/90 text-background text-[10px] px-2 py-1 rounded whitespace-nowrap font-medium" style={{ fontFamily: "'Oswald', sans-serif" }}>
            ПЕТЛИ
          </div>
        </Html>
      )}
    </group>
  );
};

// Threshold (порог)
const Threshold = ({ exploded, color }: { exploded: boolean; color: string }) => {
  const ref = useRef<THREE.Group>(null);
  const targetY = exploded ? -1.3 : -1.05;

  useFrame(() => {
    if (ref.current) {
      ref.current.position.y = THREE.MathUtils.lerp(ref.current.position.y, targetY, 0.05);
    }
  });

  return (
    <group ref={ref}>
      <mesh>
        <boxGeometry args={[0.88, 0.03, 0.08]} />
        <meshStandardMaterial color={new THREE.Color(color).offsetHSL(0, -0.1, -0.15).getStyle()} roughness={0.5} />
      </mesh>
      {exploded && (
        <Html position={[0, -0.12, 0]} center>
          <div className="bg-foreground/90 text-background text-[10px] px-2 py-1 rounded whitespace-nowrap font-medium" style={{ fontFamily: "'Oswald', sans-serif" }}>
            ПОРОГ
          </div>
        </Html>
      )}
    </group>
  );
};

const DoorScene = ({ exploded, color }: { exploded: boolean; color: string }) => {
  return (
    <>
      <ambientLight intensity={0.6} />
      <directionalLight position={[3, 5, 5]} intensity={1} castShadow />
      <directionalLight position={[-2, 3, -3]} intensity={0.4} />

      <group position={[0, 0.05, 0]}>
        <DoorFrame exploded={exploded} color={color} />
        <DoorPanel exploded={exploded} color={color} />
        <Casings exploded={exploded} color={color} />
        <Hinges exploded={exploded} />
        <Threshold exploded={exploded} color={color} />
      </group>

      <OrbitControls
        enablePan={false}
        enableZoom={true}
        minDistance={1.5}
        maxDistance={5}
        minPolarAngle={Math.PI / 6}
        maxPolarAngle={Math.PI / 1.5}
        autoRotate={!exploded}
        autoRotateSpeed={0.5}
      />
    </>
  );
};

interface DoorExplodedViewProps {
  color?: string;
}

const DoorExplodedView = ({ color = '#D0CCC6' }: DoorExplodedViewProps) => {
  const [exploded, setExploded] = useState(false);

  return (
    <div className="w-full">
      <div className="relative w-full aspect-square max-h-[500px] bg-secondary/30 rounded-lg overflow-hidden">
        <Canvas
          camera={{ position: [1.8, 0.5, 2.2], fov: 40 }}
          gl={{ antialias: true }}
        >
          <DoorScene exploded={exploded} color={color} />
        </Canvas>
      </div>
      <button
        onClick={() => setExploded(!exploded)}
        className="mt-4 w-full py-3 bg-secondary text-secondary-foreground rounded-md text-sm font-medium uppercase tracking-wider hover:bg-accent transition-colors"
        style={{ fontFamily: "'Oswald', sans-serif" }}
      >
        {exploded ? 'Собрать дверной блок' : 'Покомпонентный разбор'}
      </button>
    </div>
  );
};

export default DoorExplodedView;
