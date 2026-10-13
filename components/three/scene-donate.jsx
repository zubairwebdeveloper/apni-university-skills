"use client";

import { useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { useSceneEnvironment } from "@/hooks/use-scene-environment";

function RisingParticles({ color, accent, count = 70 }) {
  const points = useRef(null);

  const { positions, speeds, resetY } = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const spd = new Float32Array(count);
    const random = (index, axis) => {
      const value = Math.sin((index + 1) * 127.1 + axis * 311.7) * 43758.5453;
      return value - Math.floor(value);
    };
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (random(i, 0) - 0.5) * 4.5;
      pos[i * 3 + 1] = (random(i, 1) - 0.5) * 3.5;
      pos[i * 3 + 2] = (random(i, 2) - 0.5) * 2;
      spd[i] = 0.15 + random(i, 3) * 0.25;
    }
    return { positions: pos, speeds: spd, resetY: -2.2 };
  }, [count]);

  useFrame((_, delta) => {
    if (!points.current) return;
    const arr = points.current.geometry.attributes.position.array;
    for (let i = 0; i < count; i++) {
      arr[i * 3 + 1] += speeds[i] * delta;
      if (arr[i * 3 + 1] > 2.2) arr[i * 3 + 1] = resetY;
    }
    points.current.geometry.attributes.position.needsUpdate = true;
    points.current.rotation.y += delta * 0.03;
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
      <pointsMaterial color={accent} size={0.035} transparent opacity={0.65} />
    </points>
  );
}

function GivingCircle({ color }) {
  const ref = useRef(null);
  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (ref.current) {
      ref.current.rotation.z = t * 0.1;
      ref.current.scale.setScalar(1 + Math.sin(t * 0.6) * 0.04);
    }
  });
  return (
    <group ref={ref}>
      <mesh>
        <torusGeometry args={[1.1, 0.015, 16, 100]} />
        <meshBasicMaterial color={color} transparent opacity={0.5} />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[1.1, 0.015, 16, 100]} />
        <meshBasicMaterial color={color} transparent opacity={0.25} />
      </mesh>
    </group>
  );
}

export default function DonateScene({ className = "" }) {
  const reducedMotion = useReducedMotion();
  const { supported, isDark } = useSceneEnvironment();

  const color = isDark ? "#4F8CFF" : "#2563EB";
  const accent = isDark ? "#FFC857" : "#F5B82E";

  if (supported === null) return <div className={className} />;

  if (!supported) {
    return (
      <div
        className={`${className} bg-gradient-to-br from-accent/20 via-transparent to-primary/10`}
      />
    );
  }

  return (
    <div className={className}>
      <Canvas
        dpr={[1, 1.5]}
        camera={{ position: [0, 0, 5], fov: 45 }}
        frameloop={reducedMotion ? "demand" : "always"}
        gl={{ antialias: true, alpha: true }}
      >
        <GivingCircle color={color} />
        {!reducedMotion && <RisingParticles color={color} accent={accent} />}
      </Canvas>
    </div>
  );
}
