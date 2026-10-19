// components/shared/FadeIn.jsx
"use client";
import { motion, useReducedMotion } from "framer-motion";

/** Client-only fade/slide wrapper. Takes already-rendered children, so it's
 * safe to use from a Server Component — only JSX crosses the boundary, never
 * a function prop. */
export function FadeIn({ children, className = "", y = 10, duration = 0.4 }) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y }}
      animate={reduce ? undefined : { opacity: 1, y: 0 }}
      transition={{ duration, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
