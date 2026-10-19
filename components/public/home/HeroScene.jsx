"use client";

import { useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { AdditiveBlending } from "three";

/* ------------------------------------------------------------------ */
/* Palette (matches the page tokens)                                   */
/* ------------------------------------------------------------------ */
// WebGL can't read CSS variables, so the same values are kept here.
// Violet is the structure (rings, wireframe, dust); yellow is the single
// accent (core and one highlighted node per ring), like the buttons.
const VIOLET = "#8B5CF6";
const VIOLET_SOFT = "#C4B5FD";
const YELLOW = "#FACC15";
const SURFACE = "#171A21";

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

/* ------------------------------------------------------------------ */
/* Core                                                                */
/* ------------------------------------------------------------------ */
function Core({ animate }) {
  const shell = useRef(null);
  const outer = useRef(null);
  const glow = useRef(null);

  useFrame((state, delta) => {
    if (!animate) return;

    if (shell.current) {
      shell.current.rotation.y += delta * 0.15;
      shell.current.rotation.x += delta * 0.05;
    }
    // The wireframe turns the other way, so the two layers feel separate.
    if (outer.current) {
      outer.current.rotation.y -= delta * 0.08;
      outer.current.rotation.z += delta * 0.03;
    }
    // A slow, very small breathing of the glowing centre.
    if (glow.current) {
      const t = state.clock.elapsedTime;
      glow.current.scale.setScalar(1 + Math.sin(t * 1.4) * 0.05);
    }
  });

  return (
    <group>
      <mesh ref={shell}>
        <icosahedronGeometry args={[0.9, 1]} />
        <meshStandardMaterial
          color={SURFACE}
          emissive={VIOLET}
          emissiveIntensity={0.22}
          roughness={0.35}
          metalness={0.6}
          flatShading
          transparent
          opacity={0.85}
        />
      </mesh>
      <mesh ref={outer}>
        <icosahedronGeometry args={[1.04, 1]} />
        <meshBasicMaterial
          color={VIOLET}
          wireframe
          transparent
          opacity={0.45}
        />
      </mesh>
      <group ref={glow}>
        <mesh>
          <sphereGeometry args={[0.36, 32, 32]} />
          <meshStandardMaterial
            color={YELLOW}
            emissive={YELLOW}
            emissiveIntensity={0.8}
          />
        </mesh>
        {/* Soft halo around the accent core */}
        <mesh>
          <sphereGeometry args={[0.58, 24, 24]} />
          <meshBasicMaterial
            color={YELLOW}
            transparent
            opacity={0.1}
            depthWrite={false}
            blending={AdditiveBlending}
          />
        </mesh>
      </group>
    </group>
  );
}

/* ------------------------------------------------------------------ */
/* Rings                                                               */
/* ------------------------------------------------------------------ */
function Node({ point, isAccent, animate }) {
  const ref = useRef(null);

  useFrame((state) => {
    if (!animate || !isAccent || !ref.current) return;
    ref.current.scale.setScalar(
      1 + Math.sin(state.clock.elapsedTime * 2) * 0.14,
    );
  });

  return (
    <mesh ref={ref} position={point}>
      <sphereGeometry args={[isAccent ? 0.1 : 0.065, 16, 16]} />
      <meshStandardMaterial
        color={isAccent ? YELLOW : VIOLET}
        emissive={isAccent ? YELLOW : VIOLET_SOFT}
        emissiveIntensity={isAccent ? 1.2 : 0.9}
      />
    </mesh>
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
        {/* Wide, faint band under the thin ring gives it a soft edge */}
        <mesh>
          <torusGeometry args={[radius, 0.022, 8, 128]} />
          <meshBasicMaterial
            color={VIOLET}
            transparent
            opacity={0.08}
            depthWrite={false}
          />
        </mesh>
        <mesh>
          <torusGeometry args={[radius, 0.006, 8, 128]} />
          <meshBasicMaterial color={VIOLET} transparent opacity={0.55} />
        </mesh>

        <lineSegments>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              args={[linePositions, 3]}
            />
          </bufferGeometry>
          <lineBasicMaterial color={VIOLET} transparent opacity={0.3} />
        </lineSegments>

        {nodePoints.map((point, index) => (
          <Node
            key={index}
            point={point}
            isAccent={index === accent}
            animate={animate}
          />
        ))}
      </group>
    </group>
  );
}

/* ------------------------------------------------------------------ */
/* Dust                                                                */
/* ------------------------------------------------------------------ */
function Particles({
  count,
  animate,
  seed = 42,
  color = VIOLET,
  size = 0.035,
  opacity = 0.5,
  speed = 0.02,
}) {
  const ref = useRef(null);

  const positions = useMemo(() => {
    const random = seeded(seed);
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
  }, [count, seed]);

  useFrame((_, delta) => {
    if (animate && ref.current) ref.current.rotation.y += delta * speed;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        color={color}
        size={size}
        sizeAttenuation
        transparent
        opacity={opacity}
        depthWrite={false}
      />
    </points>
  );
}

/* ------------------------------------------------------------------ */
/* Rig                                                                 */
/* ------------------------------------------------------------------ */
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
    // A barely-there float keeps the scene alive while the page is idle.
    const float = animate ? Math.sin(state.clock.elapsedTime * 0.6) * 0.06 : 0;

    node.rotation.y += (px * 0.25 + progress * 1.1 - node.rotation.y) * ease;
    node.rotation.x += (-py * 0.15 + progress * 0.25 - node.rotation.x) * ease;
    node.position.y += (progress * 0.9 + float - node.position.y) * ease;
    node.scale.x += (scale - node.scale.x) * ease;
    node.scale.y += (scale - node.scale.y) * ease;
    node.scale.z += (scale - node.scale.z) * ease;
  });

  return <group ref={group}>{children}</group>;
}

/* ------------------------------------------------------------------ */
/* Scene                                                               */
/* ------------------------------------------------------------------ */
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
      <ambientLight intensity={0.55} />
      <pointLight position={[4, 3, 5]} intensity={40} color={VIOLET} />
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
        {/* Sparse, larger, lighter dust adds depth on desktop only */}
        {!compact && (
          <Particles
            count={28}
            animate={animate}
            seed={7}
            color={VIOLET_SOFT}
            size={0.06}
            opacity={0.35}
            speed={-0.012}
          />
        )}
      </Rig>
    </Canvas>
  );
}
