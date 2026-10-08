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
      transition={{ duration: 0.55, delay, ease: EASE }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// Drifting glows + dotted grid behind the top of the page.
export function PricingGlows() {
  const reduce = useReducedMotion();
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[36rem] overflow-hidden"
    >
      <motion.div
        animate={reduce ? undefined : { x: [0, 40, 0], y: [0, 30, 0] }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -left-24 -top-24 size-80 rounded-full bg-primary/15 blur-3xl"
      />
      <motion.div
        animate={reduce ? undefined : { x: [0, -40, 0], y: [0, 30, 0] }}
        transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -right-24 top-10 size-80 rounded-full bg-highlight/25 blur-3xl"
      />
      <div className="absolute inset-0 opacity-60 [background-image:radial-gradient(var(--border)_1px,transparent_1px)] [background-size:22px_22px] [mask-image:linear-gradient(to_bottom,black,transparent_85%)]" />
    </div>
  );
}

// Row of small trust chips that float in one by one.
export function TrustChips({ items }) {
  const reduce = useReducedMotion();
  return (
    <ul className="mt-6 flex flex-wrap gap-2">
      {items.map(({ icon: Icon, text }, i) => (
        <motion.li
          key={text}
          initial={reduce ? false : { opacity: 0, y: 10, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.45, delay: 0.2 + i * 0.08, ease: EASE }}
          className="inline-flex items-center gap-1.5 rounded-full border bg-card/70 px-3 py-1.5 text-xs font-medium text-foreground/80 backdrop-blur"
        >
          <Icon aria-hidden="true" className="size-3.5 text-primary" />
          {text}
        </motion.li>
      ))}
    </ul>
  );
}
