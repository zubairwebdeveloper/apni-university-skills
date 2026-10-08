// components/layout/AnimatedLogo.jsx
// Letter-by-letter animated wordmark with a graduation-cap mark.
// Works in the Navbar, the auth side panel, the Footer, anywhere.
"use client";

import { useId } from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";

import { cn } from "@/lib/utils";

const STOPS = [
  [0.0, [34, 211, 238]], // cyan
  [0.3, [99, 102, 241]], // indigo
  [0.55, [168, 85, 247]], // violet
  [0.8, [236, 72, 153]], // pink
  [1.0, [245, 158, 11]], // amber
];

// Colour of letter i out of n, blended along the gradient above.
function letterColor(i, n) {
  const t = n <= 1 ? 0 : i / (n - 1);
  for (let k = 0; k < STOPS.length - 1; k++) {
    const [a, ca] = STOPS[k];
    const [b, cb] = STOPS[k + 1];
    if (t <= b) {
      const f = b > a ? (t - a) / (b - a) : 0;
      const c = ca.map((v, j) => Math.round(v + (cb[j] - v) * f));
      return `rgb(${c[0]} ${c[1]} ${c[2]})`;
    }
  }
  return "rgb(245 158 11)";
}

function CapMark({ className }) {
  const id = useId().replace(/:/g, "");
  const reduce = useReducedMotion();

  return (
    <motion.svg
      viewBox="0 0 100 100"
      className={cn("shrink-0", className)}
      aria-hidden="true"
      initial={reduce ? false : { scale: 0.3, rotate: -20, opacity: 0 }}
      animate={{ scale: 1, rotate: 0, opacity: 1 }}
      transition={{ type: "spring", stiffness: 260, damping: 16 }}
    >
      <defs>
        <linearGradient id={`${id}-g`} x1="0" y1="0" x2="1" y2="1">
          {STOPS.map(([o, c]) => (
            <stop key={o} offset={o} stopColor={`rgb(${c.join(" ")})`} />
          ))}
        </linearGradient>
      </defs>

      <rect width="100" height="100" rx="28" fill={`url(#${id}-g)`} />

      {/* cap base + board */}
      <path d="M27 53 L50 65 L73 53 V69 L50 80 L27 69 Z" fill="white" fillOpacity="0.85" />
      <path d="M50 24 L90 43 L50 62 L10 43 Z" fill="white" />

      {/* tassel swings gently */}
      <motion.g
        style={{ originX: "86px", originY: "45px" }}
        animate={reduce ? undefined : { rotate: [0, 8, -6, 0] }}
        transition={{ duration: 2.4, repeat: Infinity, repeatDelay: 2, ease: "easeInOut" }}
      >
        <line x1="86" y1="45" x2="86" y2="66" stroke="#fde047" strokeWidth="2.8" strokeLinecap="round" />
        <circle cx="86" cy="69" r="3.6" fill="#fde047" />
      </motion.g>
    </motion.svg>
  );
}

export  function AnimatedLogo({
  name = "Apni University",
  tagline,
  href = "/",
  size = "md", // "sm" | "md" | "lg"
  className,
}) {
  const reduce = useReducedMotion();
  const letters = Array.from(name);
  const n = letters.length;

  const sizes = {
    sm: { mark: "size-8", text: "text-lg", sub: "text-[9px]" },
    md: { mark: "size-10", text: "text-2xl", sub: "text-[10px]" },
    lg: { mark: "size-14", text: "text-4xl", sub: "text-xs" },
  }[size];

  return (
    <Link
      href={href}
      aria-label={name}
      className={cn(
        "group inline-flex cursor-pointer items-center gap-3 rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-ring",
        className,
      )}
    >
      <CapMark className={cn(sizes.mark, "transition-transform duration-300 group-hover:rotate-6 group-hover:scale-105 motion-reduce:transition-none")} />

      <span className="flex flex-col leading-none">
        <span
          aria-hidden="true"
          className={cn("flex font-sans font-semibold tracking-tight", sizes.text)}
        >
          {letters.map((ch, i) => (
            <motion.span
              key={`${ch}-${i}`}
              className="inline-block whitespace-pre"
              style={{ color: letterColor(i, n) }}
              initial={reduce ? false : { opacity: 0, y: 22, filter: "blur(6px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              transition={{
                type: "spring",
                stiffness: 380,
                damping: 18,
                delay: 0.25 + i * 0.07,
              }}
            >
              {/* Inner span: a little wave runs through the letters now and then */}
              <motion.span
                className="inline-block"
                animate={reduce ? undefined : { y: [0, -5, 0] }}
                transition={{
                  duration: 0.6,
                  delay: 2.2 + i * 0.06,
                  repeat: Infinity,
                  repeatDelay: 6,
                  ease: "easeInOut",
                }}
                whileHover={reduce ? undefined : { y: -6, scale: 1.15 }}
              >
                {ch}
              </motion.span>
            </motion.span>
          ))}
        </span>

        {tagline ? (
          <motion.span
            aria-hidden="true"
            initial={reduce ? false : { opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.25 + n * 0.07 + 0.2, duration: 0.5 }}
            className={cn(
              "mt-1.5 font-medium uppercase tracking-[0.22em] text-foreground/60",
              sizes.sub,
            )}
          >
            {tagline}
          </motion.span>
        ) : null}
      </span>

      {/* Screen readers read the name once, not letter by letter */}
      <span className="sr-only">{name}</span>
    </Link>
  );
}
