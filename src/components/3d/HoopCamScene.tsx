"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { DroneBallMesh } from "./DroneBallMesh";

export function HoopCamScene() {
  const hoopRef = useRef<THREE.Mesh>(null);
  const hoopLightRef = useRef<THREE.PointLight>(null);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (hoopLightRef.current) {
      // Gentle glow pulse on the goal ring
      hoopLightRef.current.intensity = 1.8 + Math.sin(t * 3) * 0.4;
    }
  });

  return (
    <>
      {/* Warm daylight ambiance */}
      <color attach="background" args={["#f5ead8"]} />
      <ambientLight intensity={1.2} color="#fff6e8" />
      <directionalLight position={[5, 8, 4]} intensity={1.5} color="#fffaf0" />

      {/* The Goal Ring / Hoop (Perspective: looking through it) */}
      <group position={[0, 0, 1.2]} rotation={[0, 0, 0]}>
        <mesh ref={hoopRef}>
          <torusGeometry args={[1.45, 0.06, 16, 64]} />
          <meshStandardMaterial
            color="#c67139"
            metalness={0.7}
            roughness={0.2}
            emissive="#c67139"
            emissiveIntensity={0.25}
          />
        </mesh>
        <pointLight ref={hoopLightRef} color="#c67139" distance={4} />
      </group>

      {/* Court Floor Grid */}
      <gridHelper
        args={[20, 20, "#c67139", "#201e1d"]}
        position={[0, -1.8, -4]}
        rotation={[0, 0, 0]}
      >
        <meshBasicMaterial transparent opacity={0.12} />
      </gridHelper>

      {/* Arena Netting Boundary Rings */}
      <mesh position={[0, 0, -6]}>
        <ringGeometry args={[2.5, 2.54, 64]} />
        <meshBasicMaterial color="#7a8a5e" transparent opacity={0.25} side={THREE.DoubleSide} />
      </mesh>

      {/* Team A Terracotta Drone (Striker approaching the hoop) */}
      <DroneBallMesh
        color="#c67139"
        position={[-0.45, 0.1, -1.2]}
        rotationSpeed={1.2}
        hoverOffset={0}
      />

      {/* Team B Sage Drone (Opposing drone maneuvering in background) */}
      <DroneBallMesh
        color="#7a8a5e"
        position={[0.7, 0.35, -2.8]}
        rotationSpeed={0.9}
        hoverOffset={2.5}
      />
    </>
  );
}
