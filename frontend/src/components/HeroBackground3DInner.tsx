import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';

function RotatingShape({ position = [0, 0, 0], color = '#ffffff', scale = 1 }) {
  const ref = useRef<any>();
  useFrame((_state, delta) => {
    if (!ref.current) return;
    ref.current.rotation.x += delta * 0.1;
    ref.current.rotation.y += delta * 0.12;
  });
  return (
    <mesh ref={ref} position={position as any} scale={scale as any}>
      <icosahedronGeometry args={[1, 0]} />
      <meshStandardMaterial color={color} roughness={0.6} metalness={0.2} opacity={0.2} transparent />
    </mesh>
  );
}

const HeroBackground3DInner: React.FC = () => {
  return (
    <div className="absolute inset-0 pointer-events-none opacity-70">
      <Canvas
        camera={{ position: [0, 0, 6], fov: 50 }}
        dpr={[1, 1.25]}
        gl={{ powerPreference: 'low-power', antialias: false }}
      >
        <ambientLight intensity={0.5} />
        <directionalLight position={[5, 5, 5]} intensity={0.6} />
        <group>
          <RotatingShape position={[-2, 1, -2]} color="#93c5fd" scale={1.3} />
          <RotatingShape position={[2.5, -0.5, -3]} color="#a5b4fc" scale={1} />
          <RotatingShape position={[0, -1.2, -4]} color="#60a5fa" scale={1.6} />
        </group>
      </Canvas>
    </div>
  );
};

export default HeroBackground3DInner;
