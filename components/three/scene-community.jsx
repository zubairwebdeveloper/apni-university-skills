"use client";

import { useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Line } from "@react-three/drei";
import * as THREE from "three";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { useSceneEnvironment } from "@/hooks/use-scene-environment";

function generateNodes(count, radius) {
  const nodes = [];
  for (let i = 0; i < count; i++) {
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(Math.random() * 2 - 1);
    const r = radius * (0.65 + Math.random() * 0.35);
    nodes.push(
      new THREE.Vector3(
        r * Math.sin(phi) * Math.cos(theta),
        r * Math.sin(phi) * Math.sin(theta) * 0.6,
        r * Math.cos(phi),
      ),
    );
  }
  return nodes;
}

function Network({ color, accent }) {
  const group = useRef(null);
  const nodes = useMemo(() => generateNodes(16, 2.4), []);

  const edges = useMemo(() => {
    const result = [];
    nodes.forEach((node, i) => {
      const distances = nodes
        .map((other, j) => ({ j, d: node.distanceTo(other) }))
        .filter((e) => e.j !== i)
        .sort((a, b) => a.d - b.d)
        .slice(0, 2);
      distances.forEach(({ j }) => {
        const key = [i, j].sort().join("-");
        if (!result.find((e) => e.key === key)) {
          result.push({ key, points: [nodes[i], nodes[j]] });
        }
      });
    });
    return result;
  }, [nodes]);

  useFrame((_, delta) => {
    if (group.current) group.current.rotation.y += delta * 0.07;
  });

  return (
    <group ref={group}>
      {edges.map((edge) => (
        <Line
          key={edge.key}
          points={edge.points}
          color={color}
          transparent
          opacity={0.25}
          lineWidth={1}
        />
      ))}
      {nodes.map((pos, i) => (
        <mesh key={i} position={pos}>
          <sphereGeometry args={[i % 4 === 0 ? 0.07 : 0.045, 16, 16]} />
          <meshBasicMaterial color={i % 5 === 0 ? accent : color} />
        </mesh>
      ))}
    </group>
  );
}

export default function CommunityScene({ className = "" }) {
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
        camera={{ position: [0, 0, 6], fov: 45 }}
        frameloop={reducedMotion ? "demand" : "always"}
        gl={{ antialias: true, alpha: true }}
      >
        <Network color={color} accent={accent} />
      </Canvas>
    </div>
  );
}
