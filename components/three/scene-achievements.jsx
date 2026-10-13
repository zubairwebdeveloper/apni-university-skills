"use client";

import { useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { useSceneEnvironment } from "@/hooks/use-scene-environment";

function StarRing({ color, accent, count = 10, radius = 2.2 }) {
  const group = useRef(null);
  const stars = useMemo(() => {
    return new Array(count).fill(0).map((_, i) => {
      const angle = (i / count) * Math.PI * 2;
      return {
        pos: [
          Math.cos(angle) * radius,
          Math.sin(angle * 2) * 0.4,
          Math.sin(angle) * radius,
        ],
        scale: 0.14 + (((i * 37 + 17) % 100) / 100) * 0.1,
        isAccent: i % 3 === 0,
      };
    });
  }, [count, radius]);

  useFrame((state, delta) => {
    if (group.current) group.current.rotation.y += delta * 0.15;
  });

  return (
    <group ref={group} rotation={[0.3, 0, 0]}>
      {stars.map((s, i) => (
        <mesh key={i} position={s.pos} scale={s.scale}>
          <octahedronGeometry args={[1, 0]} />
          <meshBasicMaterial color={s.isAccent ? accent : color} wireframe />
        </mesh>
      ))}
    </group>
  );
}

function GlowCore({ accent }) {
  const ref = useRef(null);
  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (ref.current) {
      const s = 1 + Math.sin(t * 1.4) * 0.08;
      ref.current.scale.setScalar(s);
    }
  });
  return (
    <mesh ref={ref}>
      <icosahedronGeometry args={[0.45, 1]} />
      <meshBasicMaterial color={accent} transparent opacity={0.85} wireframe />
    </mesh>
  );
}

export default function AchievementsScene({ className = "" }) {
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
        camera={{ position: [0, 0, 5.5], fov: 45 }}
        frameloop={reducedMotion ? "demand" : "always"}
        gl={{ antialias: true, alpha: true }}
      >
        <GlowCore accent={accent} />
        <StarRing color={color} accent={accent} />
      </Canvas>
    </div>
  );
}
