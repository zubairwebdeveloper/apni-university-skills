"use client";

import { useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";

const BLUE = "#4F8CFF";
const ICE = "#8DCBFF";
const YELLOW = "#FFC857";

const RINGS = [
  { radius: 1.75, tilt: [1.15, 0.25, 0], speed: 0.16, nodes: 5, accent: -1 },
  { radius: 2.35, tilt: [0.45, 0, 0.75], speed: -0.11, nodes: 6, accent: 2 },
  { radius: 2.95, tilt: [0.95, 0.85, 0.3], speed: 0.07, nodes: 4, accent: -1 },
];

// Deterministic pseudo-random so the scene looks identical on every render.
function seeded(seed) {
  let value = seed;
  return () => {
    value = (value * 1664525 + 1013904223) % 4294967296;
    return value / 4294967296;
  };
}

function Core({ animate }) {
  const ref = useRef(null);

  useFrame((_, delta) => {
    if (!animate || !ref.current) return;
    ref.current.rotation.y += delta * 0.15;
    ref.current.rotation.x += delta * 0.05;
  });

  return (
    <group ref={ref}>
      <mesh>
        <icosahedronGeometry args={[0.9, 1]} />
        <meshStandardMaterial
          color="#0D121C"
          emissive={BLUE}
          emissiveIntensity={0.25}
          roughness={0.35}
          metalness={0.6}
          flatShading
          transparent
          opacity={0.78}
        />
      </mesh>
      <mesh>
        <icosahedronGeometry args={[1.04, 1]} />
        <meshBasicMaterial color={BLUE} wireframe transparent opacity={0.4} />
      </mesh>
      <mesh>
        <sphereGeometry args={[0.36, 32, 32]} />
        <meshStandardMaterial
          color={YELLOW}
          emissive={YELLOW}
          emissiveIntensity={0.9}
        />
      </mesh>
    </group>
  );
}

function Ring({ radius, tilt, speed, nodes, accent, animate }) {
  const spin = useRef(null);

  const nodePoints = useMemo(
    () =>
      Array.from({ length: nodes }, (_, index) => {
        const angle = (index / nodes) * Math.PI * 2 + radius;
        return [Math.cos(angle) * radius, Math.sin(angle) * radius, 0];
      }),
    [nodes, radius],
  );

  // Each node connects back to the core (origin of the ring's local space).
  const linePositions = useMemo(() => {
    const positions = new Float32Array(nodePoints.length * 6);
    nodePoints.forEach((point, index) => positions.set(point, index * 6));
    return positions;
  }, [nodePoints]);

  useFrame((_, delta) => {
    if (animate && spin.current) spin.current.rotation.z += delta * speed;
  });

  return (
    <group rotation={tilt}>
      <group ref={spin}>
        <mesh>
          <torusGeometry args={[radius, 0.006, 8, 128]} />
          <meshBasicMaterial color={BLUE} transparent opacity={0.5} />
        </mesh>

        <lineSegments>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              args={[linePositions, 3]}
            />
          </bufferGeometry>
          <lineBasicMaterial color={BLUE} transparent opacity={0.3} />
        </lineSegments>

        {nodePoints.map((point, index) => {
          const isAccent = index === accent;

          return (
            <mesh key={index} position={point}>
              <sphereGeometry args={[isAccent ? 0.1 : 0.065, 16, 16]} />
              <meshStandardMaterial
                color={isAccent ? YELLOW : BLUE}
                emissive={isAccent ? YELLOW : ICE}
                emissiveIntensity={isAccent ? 1.4 : 1.1}
              />
            </mesh>
          );
        })}
      </group>
    </group>
  );
}

function Particles({ count, animate }) {
  const ref = useRef(null);

  const positions = useMemo(() => {
    const random = seeded(42);
    const array = new Float32Array(count * 3);

    for (let index = 0; index < count; index += 1) {
      const radius = 3.6 + random() * 2.6;
      const theta = random() * Math.PI * 2;
      const phi = Math.acos(2 * random() - 1);
      array[index * 3] = radius * Math.sin(phi) * Math.cos(theta);
      array[index * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      array[index * 3 + 2] = radius * Math.cos(phi);
    }

    return array;
  }, [count]);

  useFrame((_, delta) => {
    if (animate && ref.current) ref.current.rotation.y += delta * 0.02;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        color={BLUE}
        size={0.035}
        sizeAttenuation
        transparent
        opacity={0.5}
        depthWrite={false}
      />
    </points>
  );
}

// Moves the whole composition in response to scroll and (optionally) pointer.
function Rig({ scrollProgress, pointerEnabled, animate, children }) {
  const group = useRef(null);

  useFrame((state, delta) => {
    const node = group.current;
    if (!node) return;

    const progress = animate && scrollProgress ? scrollProgress.get() : 0;
    const px = pointerEnabled ? state.pointer.x : 0;
    const py = pointerEnabled ? state.pointer.y : 0;
    const ease = 1 - Math.exp(-delta * 3);
    const scale = 1 - progress * 0.18;

    node.rotation.y += (px * 0.25 + progress * 1.1 - node.rotation.y) * ease;
    node.rotation.x += (-py * 0.15 + progress * 0.25 - node.rotation.x) * ease;
    node.position.y += (progress * 0.9 - node.position.y) * ease;
    node.scale.x += (scale - node.scale.x) * ease;
    node.scale.y += (scale - node.scale.y) * ease;
    node.scale.z += (scale - node.scale.z) * ease;
  });

  return <group ref={group}>{children}</group>;
}

export default function HeroScene({
  scrollProgress,
  reduce = false,
  compact = false,
  active = true,
  pointerEnabled = false,
}) {
  const animate = !reduce;
  const rings = compact ? RINGS.slice(0, 2) : RINGS;

  return (
    <Canvas
      dpr={compact ? [1, 1.5] : [1, 2]}
      camera={{ position: [0, 0, 8.5], fov: 40 }}
      gl={{
        antialias: !compact,
        alpha: true,
        powerPreference: "high-performance",
      }}
      frameloop={reduce ? "demand" : active ? "always" : "never"}
    >
      <ambientLight intensity={0.5} />
      <pointLight position={[4, 3, 5]} intensity={40} color={BLUE} />
      <pointLight position={[-4, -2, 3]} intensity={14} color={YELLOW} />

      <Rig
        scrollProgress={scrollProgress}
        pointerEnabled={pointerEnabled}
        animate={animate}
      >
        <Core animate={animate} />
        {rings.map((ring) => (
          <Ring key={ring.radius} {...ring} animate={animate} />
        ))}
        <Particles count={compact ? 50 : 120} animate={animate} />
      </Rig>
    </Canvas>
  );
}
