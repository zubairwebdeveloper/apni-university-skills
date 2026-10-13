"use client";

import { useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { useSceneEnvironment } from "@/hooks/use-scene-environment";

function BroadcastRings({ color }) {
  const group = useRef(null);
  const ring1 = useRef(null);
  const ring2 = useRef(null);
  const ring3 = useRef(null);

  useFrame((state, delta) => {
    if (!group.current) return;
    group.current.rotation.y += delta * 0.12;
    const t = state.clock.getElapsedTime();
    if (ring1.current)
      ring1.current.scale.setScalar(1 + Math.sin(t * 0.8) * 0.03);
    if (ring2.current)
      ring2.current.scale.setScalar(1 + Math.sin(t * 0.8 + 1.2) * 0.04);
    if (ring3.current)
      ring3.current.scale.setScalar(1 + Math.sin(t * 0.8 + 2.4) * 0.05);
  });

  return (
    <group ref={group} rotation={[0.5, 0, 0]}>
      <mesh ref={ring1}>
        <torusGeometry args={[1.6, 0.012, 16, 100]} />
        <meshBasicMaterial color={color} transparent opacity={0.55} />
      </mesh>
      <mesh ref={ring2} rotation={[0.4, 0.3, 0]}>
        <torusGeometry args={[2.1, 0.01, 16, 100]} />
        <meshBasicMaterial color={color} transparent opacity={0.35} />
      </mesh>
      <mesh ref={ring3} rotation={[-0.3, 0.6, 0]}>
        <torusGeometry args={[2.6, 0.008, 16, 100]} />
        <meshBasicMaterial color={color} transparent opacity={0.2} />
      </mesh>
      <mesh>
        <sphereGeometry args={[0.18, 32, 32]} />
        <meshBasicMaterial color={color} />
      </mesh>
    </group>
  );
}

function Particles({ color, count = 90 }) {
  const points = useRef(null);
  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const sample = (seed) => {
        const value = Math.sin((i + 1) * 127.1 + seed * 311.7) * 43758.5453;
        return value - Math.floor(value);
      };
      const r = 3 + sample(1) * 1.6;
      const theta = sample(2) * Math.PI * 2;
      const phi = Math.acos(sample(3) * 2 - 1);
      arr[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      arr[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta) * 0.5;
      arr[i * 3 + 2] = r * Math.cos(phi);
    }
    return arr;
  }, [count]);

  useFrame((_, delta) => {
    if (points.current) points.current.rotation.y += delta * 0.03;
  });

  return (
    <points ref={points}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={positions.length / 3}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial color={color} size={0.025} transparent opacity={0.5} />
    </points>
  );
}

export default function LiveScene({ className = "" }) {
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
        <BroadcastRings color={color} />
        {!reducedMotion && <Particles color={accent} />}
      </Canvas>
    </div>
  );
}
