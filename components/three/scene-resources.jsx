"use client";

import { useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { useSceneEnvironment } from "@/hooks/use-scene-environment";

const SHAPES = [
  { geom: "box", pos: [-2, 0.6, -0.5], scale: 0.42, speed: 0.6 },
  { geom: "icosahedron", pos: [1.8, -0.4, 0.3], scale: 0.5, speed: 0.45 },
  { geom: "octahedron", pos: [0.3, 1.1, -1], scale: 0.38, speed: 0.7 },
  { geom: "box", pos: [2.4, 0.9, -1.2], scale: 0.3, speed: 0.5 },
  { geom: "icosahedron", pos: [-1.6, -0.9, 0.6], scale: 0.32, speed: 0.55 },
];

function Shape({ geom, pos, scale, speed, color, index }) {
  const ref = useRef(null);

  useFrame((state) => {
    if (!ref.current) return;
    const t = state.clock.getElapsedTime();
    ref.current.position.y = pos[1] + Math.sin(t * speed + index) * 0.25;
    ref.current.rotation.x = t * speed * 0.3;
    ref.current.rotation.y = t * speed * 0.4;
  });

  return (
    <mesh ref={ref} position={pos} scale={scale}>
      {geom === "box" && <boxGeometry args={[1, 1, 1]} />}
      {geom === "icosahedron" && <icosahedronGeometry args={[0.8, 0]} />}
      {geom === "octahedron" && <octahedronGeometry args={[0.8, 0]} />}
      <meshBasicMaterial color={color} wireframe />
    </mesh>
  );
}

function FloatingField({ color, accent }) {
  const group = useRef(null);
  useFrame((_, delta) => {
    if (group.current) group.current.rotation.y += delta * 0.05;
  });

  return (
    <group ref={group}>
      {SHAPES.map((s, i) => (
        <Shape key={i} index={i} color={i % 2 === 0 ? color : accent} {...s} />
      ))}
    </group>
  );
}

export default function ResourcesScene({ className = "" }) {
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
        camera={{ position: [0, 0, 5], fov: 45 }}
        frameloop={reducedMotion ? "demand" : "always"}
        gl={{ antialias: true, alpha: true }}
      >
        <FloatingField color={color} accent={accent} />
      </Canvas>
    </div>
  );
}
