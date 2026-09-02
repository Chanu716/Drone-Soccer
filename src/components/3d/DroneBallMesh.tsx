"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface DroneBallMeshProps {
  color: string;
  position: [number, number, number];
  rotationSpeed?: number;
  hoverOffset?: number;
}

export function DroneBallMesh({
  color,
  position,
  rotationSpeed = 1,
  hoverOffset = 0,
}: DroneBallMeshProps) {
  const groupRef = useRef<THREE.Group>(null);
  const coreRef = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime() * rotationSpeed + hoverOffset;
    if (groupRef.current) {
      // Gentle banking and floating motion
      groupRef.current.position.y = position[1] + Math.sin(t * 1.5) * 0.15;
      groupRef.current.position.x = position[0] + Math.cos(t * 1.2) * 0.1;
      groupRef.current.rotation.z = Math.sin(t) * 0.2;
      groupRef.current.rotation.y += 0.015;
    }
    if (coreRef.current) {
      const pulse = 1 + Math.sin(t * 4) * 0.15;
      coreRef.current.scale.set(pulse, pulse, pulse);
    }
  });

  return (
    <group ref={groupRef} position={position}>
      {/* Outer Protective Cage (Icosphere Wireframe) */}
      <mesh>
        <icosahedronGeometry args={[0.42, 2]} />
        <meshStandardMaterial
          wireframe
          color={color}
          roughness={0.4}
          metalness={0.6}
          wireframeLinewidth={2}
        />
      </mesh>

      {/* Internal Drone Quad Core */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.08, 0.08, 0.04, 16]} />
        <meshStandardMaterial color="#201e1d" roughness={0.3} metalness={0.8} />
      </mesh>

      {/* Propeller arms */}
      <mesh rotation={[0, 0, Math.PI / 4]}>
        <boxGeometry args={[0.5, 0.02, 0.02]} />
        <meshStandardMaterial color="#333a29" metalness={0.7} />
      </mesh>
      <mesh rotation={[0, 0, -Math.PI / 4]}>
        <boxGeometry args={[0.5, 0.02, 0.02]} />
        <meshStandardMaterial color="#333a29" metalness={0.7} />
      </mesh>

      {/* Emissive LED Center */}
      <mesh ref={coreRef}>
        <sphereGeometry args={[0.1, 16, 16]} />
        <meshBasicMaterial color={color} />
      </mesh>

      {/* Omni light for ambient glow */}
      <pointLight color={color} intensity={1.5} distance={1.8} />
    </group>
  );
}
