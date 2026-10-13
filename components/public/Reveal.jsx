"use client";

import { useRef } from "react";
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
} from "framer-motion";

/** Scroll-triggered entrance. Renders plain markup when motion is reduced. */
export function Reveal({ children, className = "", delay = 0, y = 24 }) {
  const reduce = useReducedMotion();
  if (reduce) return <div className={className}>{children}</div>;
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

/** Mouse-only perspective tilt for cards. Touch and reduced motion get a static card. */
export function Tilt({ children, className = "", max = 5 }) {
  const reduce = useReducedMotion();
  const rx = useMotionValue(0);
  const ry = useMotionValue(0);
  const srx = useSpring(rx, { stiffness: 180, damping: 18 });
  const sry = useSpring(ry, { stiffness: 180, damping: 18 });

  if (reduce) return <div className={className}>{children}</div>;

  const onMove = (e) => {
    if (e.pointerType !== "mouse") return;
    const r = e.currentTarget.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    ry.set(px * max * 2);
    rx.set(-py * max * 2);
  };
  const onLeave = () => {
    rx.set(0);
    ry.set(0);
  };

  return (
    <div className={className} style={{ perspective: 900 }}>
      <motion.div
        className="h-full will-change-transform"
        style={{ rotateX: srx, rotateY: sry, transformStyle: "preserve-3d" }}
        onPointerMove={onMove}
        onPointerLeave={onLeave}
      >
        {children}
      </motion.div>
    </div>
  );
}

/** Vertical line that fills as the user scrolls through its children. */
export function ProgressLine({ children, className = "" }) {
  const ref = useRef(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 70%", "end 60%"],
  });

  return (
    <div ref={ref} className={`relative ${className}`}>
      <div
        aria-hidden="true"
        className="absolute bottom-2 left-3.5 top-2 w-px bg-border"
      />
      <motion.div
        aria-hidden="true"
        className="absolute bottom-2 left-3.5 top-2 w-px origin-top bg-primary"
        style={{ scaleY: reduce ? 1 : scrollYProgress }}
      />
      {children}
    </div>
  );
}
