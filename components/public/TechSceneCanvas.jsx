"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

// Brand palette per theme. Light mode uses deeper blues so lines stay visible on white.
const PALETTE = {
  dark: { core: "#4F8CFF", line: "#8DCBFF", accent: "#FFC857", ambient: 0.7 },
  light: { core: "#2563EB", line: "#2563EB", accent: "#F5B82E", ambient: 1.1 },
};

// Deterministic pseudo-random so the scene is identical on every load.
function seeded(seed) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function Core({ pal }) {
  const ref = useRef(null);
  useFrame((_, dt) => {
    if (!ref.current) return;
    ref.current.rotation.y += dt * 0.15;
    ref.current.rotation.x += dt * 0.05;
  });
  return (
    <group ref={ref}>
      <mesh>
        <icosahedronGeometry args={[1, 1]} />
        <meshStandardMaterial
          color={pal.core}
          emissive={pal.core}
          emissiveIntensity={0.35}
          metalness={0.6}
          roughness={0.25}
          flatShading
        />
      </mesh>
      <mesh scale={1.35}>
        <icosahedronGeometry args={[1, 1]} />
        <meshBasicMaterial
          color={pal.line}
          wireframe
          transparent
          opacity={0.35}
        />
      </mesh>
    </group>
  );
}

const RINGS = [
  { radius: 2.2, tilt: [1.2, 0.2], speed: 0.16 },
  { radius: 2.9, tilt: [0.6, -0.5], speed: -0.1 },
  { radius: 3.6, tilt: [1.0, 0.8], speed: 0.07 },
];

function Rings({ pal }) {
  const group = useRef(null);
  useFrame((_, dt) => {
    group.current?.children.forEach((g, i) => {
      g.children[0].rotation.z += dt * RINGS[i].speed;
    });
  });
  return (
    <group ref={group}>
      {RINGS.map((r) => (
        <group key={r.radius} rotation={[r.tilt[0], r.tilt[1], 0]}>
          <mesh>
            <torusGeometry args={[r.radius, 0.009, 8, 160, 4.2]} />
            <meshBasicMaterial color={pal.line} transparent opacity={0.45} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

function Network({ count, pal }) {
  const meshes = useRef([]);
  const lineRef = useRef(null);

  const seeds = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        r: 2 + (i % 3) * 0.55,
        speed: 0.12 + (i % 4) * 0.035,
        phase: i * 2.399,
        lift: 0.5 + (i % 2) * 0.4,
      })),
    [count],
  );
  const initial = useMemo(
    () => new Float32Array((count * (count - 1) * 6) / 2),
    [count],
  );

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    const nodes = meshes.current;
    seeds.forEach((s, i) => {
      const m = nodes[i];
      if (!m) return;
      const a = s.phase + t * s.speed;
      m.position.set(
        Math.cos(a) * s.r,
        Math.sin(a * 1.3 + s.phase) * s.lift,
        Math.sin(a) * s.r,
      );
    });
    const geo = lineRef.current?.geometry;
    if (!geo) return;
    const arr = geo.attributes.position.array;
    let n = 0;
    for (let i = 0; i < count; i++) {
      for (let j = i + 1; j < count; j++) {
        const a = nodes[i]?.position;
        const b = nodes[j]?.position;
        if (!a || !b || a.distanceTo(b) > 2.6) continue;
        const o = n * 6;
        arr[o] = a.x;
        arr[o + 1] = a.y;
        arr[o + 2] = a.z;
        arr[o + 3] = b.x;
        arr[o + 4] = b.y;
        arr[o + 5] = b.z;
        n++;
      }
    }
    geo.attributes.position.needsUpdate = true;
    geo.setDrawRange(0, n * 2);
  });

  return (
    <group>
      {seeds.map((_, i) => {
        const c = i === 0 ? pal.accent : pal.line;
        return (
          <mesh
            key={i}
            ref={(el) => {
              meshes.current[i] = el;
            }}
          >
            <sphereGeometry args={[i === 0 ? 0.11 : 0.065, 16, 16]} />
            <meshStandardMaterial
              color={c}
              emissive={c}
              emissiveIntensity={0.9}
            />
          </mesh>
        );
      })}
      <lineSegments ref={lineRef} frustumCulled={false}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[initial, 3]} />
        </bufferGeometry>
        <lineBasicMaterial color={pal.line} transparent opacity={0.35} />
      </lineSegments>
    </group>
  );
}

function Dust({ count, pal }) {
  const ref = useRef(null);
  const positions = useMemo(() => {
    const rand = seeded(7);
    const a = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const r = 4 + rand() * 3;
      const th = rand() * Math.PI * 2;
      const ph = Math.acos(2 * rand() - 1);
      a[i * 3] = r * Math.sin(ph) * Math.cos(th);
      a[i * 3 + 1] = r * Math.sin(ph) * Math.sin(th);
      a[i * 3 + 2] = r * Math.cos(ph) - 1;
    }
    return a;
  }, [count]);
  useFrame((_, dt) => {
    if (ref.current) ref.current.rotation.y += dt * 0.02;
  });
  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        color={pal.line}
        size={0.03}
        sizeAttenuation
        transparent
        opacity={0.6}
        depthWrite={false}
      />
    </points>
  );
}

/** Pointer parallax and optional scroll-linked movement, no React re-renders. */
function Rig({ interactive, scrollLinked, children }) {
  const ref = useRef(null);
  const pointer = useRef({ x: 0, y: 0 });

  useEffect(() => {
    if (!interactive) return;
    const onMove = (e) => {
      pointer.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      pointer.current.y = (e.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, [interactive]);

  useFrame((_, dt) => {
    const g = ref.current;
    if (!g) return;
    const sy = scrollLinked ? Math.min(window.scrollY / 900, 1.5) : 0;
    g.rotation.x = THREE.MathUtils.damp(
      g.rotation.x,
      pointer.current.y * 0.18 + sy * 0.25,
      3,
      dt,
    );
    g.rotation.y = THREE.MathUtils.damp(
      g.rotation.y,
      pointer.current.x * 0.35 + sy * 0.7,
      3,
      dt,
    );
    g.position.y = THREE.MathUtils.damp(g.position.y, sy * 0.5, 3, dt);
  });

  return <group ref={ref}>{children}</group>;
}

export default function TechSceneCanvas({
  nodeCount = 6,
  lite = false,
  reduceMotion = false,
  dark = false,
  scrollLinked = true,
}) {
  const wrapRef = useRef(null);
  const [visible, setVisible] = useState(true);
  const pal = dark ? PALETTE.dark : PALETTE.light;

  // Pause rendering while the scene is off screen.
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting));
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={wrapRef} className="absolute inset-0">
      <Canvas
        frameloop={reduceMotion ? "demand" : visible ? "always" : "never"}
        dpr={[1, lite ? 1.25 : 1.75]}
        camera={{ position: [0, 0, 8], fov: 42 }}
        gl={{
          antialias: !lite,
          alpha: true,
          powerPreference: "high-performance",
        }}
      >
        <ambientLight intensity={pal.ambient} />
        <directionalLight
          position={[4, 4, 5]}
          intensity={2.2}
          color="#ffffff"
        />
        <pointLight position={[-4, -2, 3]} intensity={25} color={pal.accent} />
        <Rig interactive={!lite && !reduceMotion} scrollLinked={scrollLinked}>
          <Core pal={pal} />
          <Rings pal={pal} />
          <Network count={nodeCount} pal={pal} />
          <Dust count={lite ? 50 : 140} pal={pal} />
        </Rig>
      </Canvas>
    </div>
  );
}
