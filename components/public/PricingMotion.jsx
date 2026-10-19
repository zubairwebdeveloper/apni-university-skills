"use client";

import { useId } from "react";
import { motion, useReducedMotion } from "framer-motion";

import { cn } from "@/lib/utils";

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

/* ------------------------------ PricingGlows --------------------------- */

// Drifting glows + dotted grid behind the top of the page.
export function PricingGlows() {
  const reduce = useReducedMotion();
  const patternId = `pricing-dots-${useId().replace(/:/g, "")}`;

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[36rem] overflow-hidden"
    >
      <motion.div
        animate={reduce ? undefined : { x: [0, 40, 0], y: [0, 30, 0] }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -left-24 -top-24 size-80 rounded-full bg-primary/15 blur-3xl will-change-transform"
      />
      <motion.div
        animate={reduce ? undefined : { x: [0, -40, 0], y: [0, 30, 0] }}
        transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -right-24 top-10 size-80 rounded-full bg-highlight/25 blur-3xl will-change-transform"
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

/* ------------------------------ TrustChips ----------------------------- */

// Row of small trust chips that float in one by one.
export function TrustChips({ items = [], className }) {
  const reduce = useReducedMotion();

  if (!items.length) return null;

  return (
    <ul className={cn("mt-6 flex flex-wrap gap-2.5", className)}>
      {items.map(({ icon: Icon, text }, i) => (
        <motion.li
          key={text}
          initial={reduce ? false : { opacity: 0, y: 10, scale: 0.94 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{
            duration: 0.45,
            delay: reduce ? 0 : 0.2 + i * 0.08,
            ease: EASE,
          }}
          className="inline-flex items-center gap-2 rounded-full border bg-card py-1.5 pl-1.5 pr-3.5 text-xs font-medium text-foreground/85 shadow-sm transition-[border-color,box-shadow] duration-200 hover:border-primary/40 hover:shadow-md sm:text-sm"
        >
          {Icon && (
            <span
              aria-hidden="true"
              className="grid size-6 shrink-0 place-items-center rounded-full border border-primary/20 bg-primary/10 text-primary sm:size-7"
            >
              <Icon className="size-3.5" />
            </span>
          )}
          {text}
        </motion.li>
      ))}
    </ul>
  );
}
