"use client";

import { useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Line } from "@react-three/drei";
import * as THREE from "three";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { useSceneEnvironment } from "@/hooks/use-scene-environment";

function Beacon({ color }) {
  const ref = useRef(null);
  const haloRef = useRef(null);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (ref.current) ref.current.scale.setScalar(1 + Math.sin(t * 1.6) * 0.06);
    if (haloRef.current) {
      const s = 1 + ((t * 0.5) % 1.4);
      haloRef.current.scale.setScalar(s);
      haloRef.current.material.opacity = Math.max(0, 0.45 - (s - 1) * 0.35);
    }
  });

  return (
    <group>
      <mesh ref={ref}>
        <sphereGeometry args={[0.35, 32, 32]} />
        <meshBasicMaterial color={color} />
      </mesh>
      <mesh ref={haloRef}>
        <sphereGeometry args={[0.35, 32, 32]} />
        <meshBasicMaterial color={color} transparent opacity={0.4} wireframe />
      </mesh>
    </group>
  );
}

function OrbitNodes({ color, accent, count = 7, radius = 2 }) {
  const group = useRef(null);

  const nodes = useMemo(() => {
    return new Array(count).fill(0).map((_, i) => {
      const angle = (i / count) * Math.PI * 2;
      return new THREE.Vector3(
        Math.cos(angle) * radius,
        Math.sin(angle * 1.4) * 0.5,
        Math.sin(angle) * radius,
      );
    });
  }, [count, radius]);

  useFrame((_, delta) => {
    if (group.current) group.current.rotation.y += delta * 0.1;
  });

  return (
    <group ref={group}>
      {nodes.map((pos, i) => (
        <group key={i}>
          <Line
            points={[new THREE.Vector3(0, 0, 0), pos]}
            color={color}
            transparent
            opacity={0.18}
            lineWidth={1}
          />
          <mesh position={pos}>
            <boxGeometry args={[0.14, 0.14, 0.14]} />
            <meshBasicMaterial
              color={i % 3 === 0 ? accent : color}
              wireframe={i % 2 === 0}
            />
          </mesh>
        </group>
      ))}
    </group>
  );
}

export default function SupportScene({ className = "" }) {
  const reducedMotion = useReducedMotion();
  const { supported, isDark } = useSceneEnvironment();

  const color = isDark ? "#4F8CFF" : "#2563EB";
  const accent = isDark ? "#FFC857" : "#F5B82E";

  if (supported === null) return <div className={className} />;

  if (!supported) {
    return (
      <div
        className={`${className} bg-gradient-to-br from-primary/15 via-transparent to-accent/10`}
      />
    );
  }

  return (
    <div className={className}>
      <Canvas
        dpr={[1, 1.5]}
        camera={{ position: [0, 0, 5.5], fov: 45 }}
        frameloop={reducedMotion ? "demand" : "always"}
        gl={{ antialias: true, alpha: true }}
      >
        <Beacon color={accent} />
        <OrbitNodes color={color} accent={accent} />
      </Canvas>
    </div>
  );
}
