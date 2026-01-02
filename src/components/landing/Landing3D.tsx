"use client";

import { useRef, useState } from "react";
import { Canvas, useFrame, ThreeElements } from "@react-three/fiber";
import { Points, PointMaterial } from "@react-three/drei";
// @ts-ignore - maath types are notoriously difficult
import * as random from "maath/random/dist/maath-random.cjs";
import * as THREE from "three";

function ParticleField(props: any) {
  const ref = useRef<THREE.Points>(null!);

  // Robust typing for sphere generation
  const [sphere] = useState(() => {
    const data = new Float32Array(5000 * 3);
    return random.inSphere(data, { radius: 1.5 }) as Float32Array;
  });

  useFrame((state, delta) => {
    if (ref.current) {
      ref.current.rotation.x -= delta / 10;
      ref.current.rotation.y -= delta / 15;
    }
  });

  return (
    <group rotation={[0, 0, Math.PI / 4]}>
      <Points ref={ref} positions={sphere} stride={3} frustumCulled={false} {...props}>
        <PointMaterial
          transparent
          color="#2563eb"
          size={0.005}
          sizeAttenuation={true}
          depthWrite={false}
        />
      </Points>
    </group>
  );
}

export function Landing3D() {
  return (
    <div className="absolute inset-0 z-0">
      <Canvas camera={{ position: [0, 0, 1] }}>
        <ParticleField />
      </Canvas>
    </div>
  );
}
