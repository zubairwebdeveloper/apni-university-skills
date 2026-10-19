"use client";

import { useId } from "react";
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
} from "framer-motion";

const EASE = [0.22, 1, 0.36, 1];

/* -------------------------------- Reveal ------------------------------- */

// Fades and slides its children in when they scroll into view.
export function Reveal({
  children,
  delay = 0,
  y = 24,
  className,
  once = true,
}) {
  const reduce = useReducedMotion();

  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once, margin: "-40px" }}
      transition={{ duration: 0.55, delay, ease: EASE }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* --------------------------------- Tilt -------------------------------- */

// Subtle 3D tilt that follows the mouse. `max` is the largest angle in
// degrees. Touch and pen input never tilt, and reduced motion disables it.
export function Tilt({ children, className, max = 6 }) {
  const reduce = useReducedMotion();
  const rx = useMotionValue(0);
  const ry = useMotionValue(0);
  const rotateX = useSpring(rx, { stiffness: 220, damping: 22 });
  const rotateY = useSpring(ry, { stiffness: 220, damping: 22 });

  if (reduce) {
    return <div className={className}>{children}</div>;
  }

  function handleMove(e) {
    if (e.pointerType !== "mouse") return;
    const rect = e.currentTarget.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    const px = (e.clientX - rect.left) / rect.width - 0.5;
    const py = (e.clientY - rect.top) / rect.height - 0.5;
    ry.set(px * max * 2);
    rx.set(-py * max * 2);
  }

  function handleLeave() {
    rx.set(0);
    ry.set(0);
  }

  return (
    <div className={className} style={{ perspective: 900 }}>
      <motion.div
        onPointerMove={handleMove}
        onPointerLeave={handleLeave}
        style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
        className="h-full will-change-transform"
      >
        {children}
      </motion.div>
    </div>
  );
}

/* ------------------------------- PageGlows ----------------------------- */

// Soft drifting background for the page.
export function PageGlows() {
  const reduce = useReducedMotion();
  const patternId = `page-dots-${useId().replace(/:/g, "")}`;

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[32rem] overflow-hidden"
    >
      <motion.div
        animate={reduce ? undefined : { x: [0, 40, 0], y: [0, 30, 0] }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -left-24 -top-24 size-80 rounded-full bg-primary/10 blur-3xl will-change-transform"
      />
      <motion.div
        animate={reduce ? undefined : { x: [0, -40, 0], y: [0, 30, 0] }}
        transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -right-24 top-10 size-80 rounded-full bg-highlight/20 blur-3xl will-change-transform"
      />

      {/* Dot grid drawn as SVG so it follows the theme's border color
          whatever format the CSS variable uses. */}
      <svg
        className="absolute inset-0 h-full w-full text-border opacity-70 [-webkit-mask-image:linear-gradient(to_bottom,black,transparent_85%)] [mask-image:linear-gradient(to_bottom,black,transparent_85%)]"
        fill="none"
      >
        <defs>
          <pattern
            id={patternId}
            width="22"
            height="22"
            patternUnits="userSpaceOnUse"
          >
            <circle cx="1" cy="1" r="1" fill="currentColor" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill={`url(#${patternId})`} />
      </svg>
    </div>
  );
}
