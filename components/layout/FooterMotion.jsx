"use client";

import { motion, useReducedMotion } from "framer-motion";

const EASE = [0.22, 1, 0.36, 1];

// Fades and slides its children in when they scroll into view.
export function Reveal({ children, delay = 0, y = 24, className }) {
  const reduce = useReducedMotion();

  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.6, delay, ease: EASE }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// Slowly drifting background glows.
export function FloatingGlows() {
  const reduce = useReducedMotion();

  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0">
      <motion.div
        animate={reduce ? undefined : { x: [0, 50, 0], y: [0, 30, 0] }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -left-24 -top-24 size-72 rounded-full bg-primary/15 blur-3xl"
      />
      <motion.div
        animate={reduce ? undefined : { x: [0, -50, 0], y: [0, -30, 0] }}
        transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -bottom-32 right-0 size-80 rounded-full bg-primary/15 blur-3xl"
      />
      <div className="absolute inset-0 bg-[radial-gradient(circle,hsl(var(--foreground)/0.06)_1px,transparent_1px)] [background-size:22px_22px] [mask-image:linear-gradient(to_bottom,black,transparent_85%)]" />
    </div>
  );
}

// Thin line at the top of the footer with a light sweeping across it.
export function ShimmerLine() {
  const reduce = useReducedMotion();

  return (
    <div
      aria-hidden="true"
      className="absolute inset-x-0 top-0 h-px overflow-hidden bg-border"
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
          className="h-full w-1/4 bg-gradient-to-r from-transparent via-primary to-transparent"
        />
      )}
    </div>
  );
}
