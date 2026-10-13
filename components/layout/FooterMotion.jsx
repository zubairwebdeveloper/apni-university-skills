"use client";
// components/layout/FooterMotion.jsx
// framer-motion helpers for the footer. Every one of them respects
// prefers-reduced-motion and only animates transform / opacity.

import { useEffect, useRef, useState } from "react";
import {
  animate,
  motion,
  useInView,
  useMotionTemplate,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from "framer-motion";

const EASE = [0.22, 1, 0.36, 1];

/* ------------------------------------------------------------------ */
/* Reveal: fades + slides + tips up in 3D when scrolled into view      */
/* ------------------------------------------------------------------ */
// Same props as before (children, delay, y, className) plus:
// - x: horizontal start offset
// - rotateX: starting tilt in degrees (0 = flat, plain fade-slide)
export function Reveal({
  children,
  delay = 0,
  y = 24,
  x = 0,
  rotateX = 10,
  className,
}) {
  const reduce = useReducedMotion();

  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y, x, rotateX, scale: 0.98 }}
      whileInView={{ opacity: 1, y: 0, x: 0, rotateX: 0, scale: 1 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.7, delay, ease: EASE }}
      style={
        reduce
          ? undefined
          : { transformPerspective: 900, transformOrigin: "50% 100%" }
      }
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/* Stagger / StaggerItem: children pop in one after another            */
/* ------------------------------------------------------------------ */
// <Stagger as="ul" className="..."> <StaggerItem as="li">...</StaggerItem> </Stagger>
export function Stagger({
  as = "div",
  children,
  className,
  stagger = 0.07,
  delay = 0,
}) {
  const reduce = useReducedMotion();
  const Tag = motion[as];

  return (
    <Tag
      initial={reduce ? "show" : "hidden"}
      whileInView="show"
      viewport={{ once: true, margin: "-40px" }}
      variants={{
        hidden: {},
        show: {
          transition: { staggerChildren: stagger, delayChildren: delay },
        },
      }}
      className={className}
    >
      {children}
    </Tag>
  );
}

export function StaggerItem({ as = "div", children, className }) {
  const Tag = motion[as];

  return (
    <Tag
      variants={{
        hidden: { opacity: 0, y: 18, scale: 0.94 },
        show: {
          opacity: 1,
          y: 0,
          scale: 1,
          transition: { duration: 0.5, ease: EASE },
        },
      }}
      className={className}
    >
      {children}
    </Tag>
  );
}

/* ------------------------------------------------------------------ */
/* Tilt3D: card tilts towards the mouse, with a moving glare           */
/* ------------------------------------------------------------------ */
// Pass `className` with `relative` and the same border radius as the child,
// e.g. <Tilt3D className="relative rounded-3xl">...</Tilt3D>
export function Tilt3D({ children, className, max = 8, glare = true }) {
  const reduce = useReducedMotion();
  const ref = useRef(null);

  const px = useMotionValue(0.5);
  const py = useMotionValue(0.5);
  const hover = useMotionValue(0);

  const spring = { stiffness: 170, damping: 20, mass: 0.5 };
  const sx = useSpring(px, spring);
  const sy = useSpring(py, spring);
  const glareOpacity = useSpring(hover, { stiffness: 200, damping: 25 });

  const rotateY = useTransform(sx, [0, 1], [-max, max]);
  const rotateX = useTransform(sy, [0, 1], [max, -max]);
  const gx = useTransform(sx, [0, 1], [0, 100]);
  const gy = useTransform(sy, [0, 1], [0, 100]);
  const glareBg = useMotionTemplate`radial-gradient(420px circle at ${gx}% ${gy}%, rgba(255,255,255,0.14), transparent 60%)`;

  const onMove = (e) => {
    if (reduce || e.pointerType !== "mouse" || !ref.current) return;
    const r = ref.current.getBoundingClientRect();
    if (!r.width || !r.height) return;
    px.set((e.clientX - r.left) / r.width);
    py.set((e.clientY - r.top) / r.height);
    hover.set(1);
  };

  const onLeave = () => {
    px.set(0.5);
    py.set(0.5);
    hover.set(0);
  };

  return (
    <motion.div
      ref={ref}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
      style={
        reduce ? undefined : { rotateX, rotateY, transformPerspective: 1100 }
      }
      className={className}
    >
      {children}
      {glare && !reduce && (
        <motion.span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 rounded-[inherit]"
          style={{ background: glareBg, opacity: glareOpacity }}
        />
      )}
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/* Magnetic: element is gently pulled towards the cursor               */
/* ------------------------------------------------------------------ */
export function Magnetic({ children, className, strength = 0.35 }) {
  const reduce = useReducedMotion();
  const ref = useRef(null);
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const x = useSpring(mx, { stiffness: 220, damping: 16, mass: 0.5 });
  const y = useSpring(my, { stiffness: 220, damping: 16, mass: 0.5 });

  const onMove = (e) => {
    if (reduce || e.pointerType !== "mouse" || !ref.current) return;
    const r = ref.current.getBoundingClientRect();
    mx.set((e.clientX - (r.left + r.width / 2)) * strength);
    my.set((e.clientY - (r.top + r.height / 2)) * strength);
  };

  const onLeave = () => {
    mx.set(0);
    my.set(0);
  };

  return (
    <motion.div
      ref={ref}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
      style={reduce ? undefined : { x, y }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/* CountUp: "10K+" counts 0 -> 10 when it scrolls into view            */
/* ------------------------------------------------------------------ */
// Keeps any prefix / suffix ("K+", "%", "/7"). Text with no digits is
// shown as is. The final value is what server-side HTML contains.
export function CountUp({ value, duration = 1.6, className }) {
  const reduce = useReducedMotion();
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });

  const text = String(value);
  const match = text.match(/^(\D*)(\d[\d,]*\.?\d*)(.*)$/);
  const target = match ? parseFloat(match[2].replace(/,/g, "")) : 0;
  const decimals =
    match && match[2].includes(".") ? match[2].split(".")[1].length : 0;
  const withCommas = !!match && match[2].includes(",");

  const [n, setN] = useState(target);

  useEffect(() => {
    if (!match || reduce || !inView) return;
    const controls = animate(0, target, {
      duration,
      ease: EASE,
      onUpdate: setN,
    });
    return () => controls.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inView, reduce, target, duration]);

  if (!match) {
    return (
      <span ref={ref} className={className}>
        {text}
      </span>
    );
  }

  const shown = withCommas
    ? n.toLocaleString("en-US", {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      })
    : n.toFixed(decimals);

  return (
    <span ref={ref} className={className}>
      {match[1]}
      {shown}
      {match[3]}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/* CursorGlow: a soft light that follows the mouse across the footer   */
/* ------------------------------------------------------------------ */
// Put it as a DIRECT child of the (position: relative) footer. It listens
// on its parent element.
export function CursorGlow({ size = 560, className = "-z-10" }) {
  const reduce = useReducedMotion();
  const ref = useRef(null);
  const mx = useMotionValue(-9999);
  const my = useMotionValue(-9999);
  const x = useSpring(mx, { stiffness: 55, damping: 18, mass: 0.6 });
  const y = useSpring(my, { stiffness: 55, damping: 18, mass: 0.6 });

  useEffect(() => {
    const parent = ref.current?.parentElement;
    if (!parent || reduce) return;

    const move = (e) => {
      if (e.pointerType && e.pointerType !== "mouse") return;
      const r = parent.getBoundingClientRect();
      mx.set(e.clientX - r.left);
      my.set(e.clientY - r.top);
    };

    parent.addEventListener("pointermove", move);
    return () => parent.removeEventListener("pointermove", move);
  }, [reduce, mx, my]);

  if (reduce) return null;

  return (
    <motion.div
      ref={ref}
      aria-hidden="true"
      className={`pointer-events-none absolute left-0 top-0 rounded-full ${className}`}
      style={{
        x,
        y,
        width: size,
        height: size,
        marginLeft: -size / 2,
        marginTop: -size / 2,
        background:
          "radial-gradient(closest-side, rgb(var(--ft-d, 139 92 246) / 0.22), rgb(var(--ft-a, 52 211 153) / 0.08) 55%, transparent 72%)",
      }}
    />
  );
}

/* ------------------------------------------------------------------ */
/* FloatingGlows: slowly drifting background glows (3 colours)         */
/* ------------------------------------------------------------------ */
export function FloatingGlows() {
  const reduce = useReducedMotion();

  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0">
      <motion.div
        animate={reduce ? undefined : { x: [0, 50, 0], y: [0, 30, 0] }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -left-24 -top-24 size-72 rounded-full bg-[rgb(var(--ft-a,52_211_153)/0.18)] blur-3xl"
      />
      <motion.div
        animate={reduce ? undefined : { x: [0, -50, 0], y: [0, -30, 0] }}
        transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -bottom-32 right-0 size-80 rounded-full bg-[rgb(var(--ft-b,79_140_255)/0.18)] blur-3xl"
      />
      <motion.div
        animate={
          reduce ? undefined : { x: [0, 40, -20, 0], y: [0, -40, 20, 0] }
        }
        transition={{ duration: 26, repeat: Infinity, ease: "easeInOut" }}
        className="absolute left-1/3 top-1/3 size-64 rounded-full bg-[rgb(var(--ft-d,139_92_246)/0.16)] blur-3xl"
      />
      <div className="absolute inset-0 bg-[radial-gradient(circle,hsl(var(--foreground)/0.06)_1px,transparent_1px)] [background-size:22px_22px] [mask-image:linear-gradient(to_bottom,black,transparent_85%)]" />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* ShimmerLine: top edge with a glowing light sweeping across          */
/* ------------------------------------------------------------------ */
export function ShimmerLine() {
  const reduce = useReducedMotion();

  return (
    <div
      aria-hidden="true"
      className="absolute inset-x-0 top-0 z-10 h-px overflow-hidden"
      style={{
        background:
          "linear-gradient(90deg, transparent, rgb(var(--ft-a, 52 211 153) / 0.55), rgb(var(--ft-d, 139 92 246) / 0.55), rgb(var(--ft-b, 79 140 255) / 0.55), transparent)",
      }}
    >
      {!reduce && (
        <motion.div
          initial={{ x: "-100%" }}
          animate={{ x: "400%" }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "linear",
            repeatDelay: 1.5,
          }}
          className="h-full w-1/4"
          style={{
            background:
              "linear-gradient(90deg, transparent, rgb(255 255 255 / 0.95), transparent)",
            boxShadow: "0 0 14px 2px rgb(var(--ft-a, 52 211 153) / 0.8)",
          }}
        />
      )}
    </div>
  );
}
