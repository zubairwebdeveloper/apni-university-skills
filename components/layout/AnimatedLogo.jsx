// components/layout/AnimatedLogo.jsx
// Animated wordmark with a graduation-cap mark.
// Works in the Navbar, the auth side panel, the Footer, anywhere.
"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";

import { cn } from "@/lib/utils";

function CapMark({ className }) {
  const reduce = useReducedMotion();

  return (
    <motion.svg
      viewBox="0 0 100 100"
      className={cn("shrink-0", className)}
      aria-hidden="true"
      initial={reduce ? false : { scale: 0.6, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: "spring", stiffness: 260, damping: 20 }}
    >
      {/* Tile follows the theme's primary blue */}
      <rect width="100" height="100" rx="26" className="fill-primary" />

      {/* Cap base + board: always readable on the primary tile */}
      <path
        d="M27 53 L50 65 L73 53 V69 L50 80 L27 69 Z"
        className="fill-primary-foreground"
        fillOpacity="0.85"
      />
      <path
        d="M50 24 L90 43 L50 62 L10 43 Z"
        className="fill-primary-foreground"
      />

      {/* Brand-yellow tassel, a restrained accent that swings now and then */}
      <motion.g
        style={{ originX: "86px", originY: "45px" }}
        animate={reduce ? undefined : { rotate: [0, 8, -6, 0] }}
        transition={{
          duration: 2.4,
          repeat: Infinity,
          repeatDelay: 7,
          ease: "easeInOut",
        }}
      >
        <line
          x1="86"
          y1="45"
          x2="86"
          y2="66"
          strokeWidth="3"
          strokeLinecap="round"
          className="stroke-[#F5B82E] dark:stroke-[#FFC857]"
        />
        <circle
          cx="86"
          cy="69"
          r="3.8"
          className="fill-[#F5B82E] dark:fill-[#FFC857]"
        />
      </motion.g>
    </motion.svg>
  );
}

export function AnimatedLogo({
  name = "Apni University",
  tagline,
  href = "/",
  size = "md", // "sm" | "md" | "lg"
  className,
}) {
  const reduce = useReducedMotion();
  const words = name.split(" ");
  const total = Array.from(name).length;

  const sizes = {
    sm: { mark: "size-8", text: "text-lg", sub: "text-[9px]" },
    md: { mark: "size-10", text: "text-2xl", sub: "text-[10px]" },
    lg: { mark: "size-14", text: "text-4xl", sub: "text-xs" },
  }[size];

  // Running letter index so the entrance stagger flows across words.
  let index = 0;

  return (
    <Link
      href={href}
      aria-label={name}
      className={cn(
        "group inline-flex cursor-pointer items-center gap-3 rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        className,
      )}
    >
      <CapMark
        className={cn(
          sizes.mark,
          "transition-transform duration-300 group-hover:rotate-3 group-hover:scale-105 motion-reduce:transition-none motion-reduce:group-hover:transform-none",
        )}
      />

      <span className="flex flex-col leading-none">
        <span
          aria-hidden="true"
          className={cn(
            "flex gap-[0.28em] font-sans font-semibold tracking-tight",
            sizes.text,
          )}
        >
          {words.map((word, w) => (
            <span
              key={`${word}-${w}`}
              className={cn(
                "flex",
                w === 0 ? "text-foreground" : "text-primary",
              )}
            >
              {Array.from(word).map((ch, i) => {
                const delay = 0.15 + index * 0.04;
                index += 1;
                return (
                  <motion.span
                    key={`${ch}-${i}`}
                    className="inline-block"
                    initial={reduce ? false : { opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    whileHover={reduce ? undefined : { y: -3 }}
                    transition={{
                      type: "spring",
                      stiffness: 380,
                      damping: 26,
                      delay: reduce ? 0 : delay,
                    }}
                  >
                    {ch}
                  </motion.span>
                );
              })}
            </span>
          ))}
        </span>

        {tagline ? (
          <motion.span
            aria-hidden="true"
            initial={reduce ? false : { opacity: 0, x: -6 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{
              delay: reduce ? 0 : 0.15 + total * 0.04 + 0.1,
              duration: 0.4,
            }}
            className={cn(
              "mt-1.5 hidden font-medium uppercase tracking-[0.2em] text-muted-foreground sm:block",
              sizes.sub,
            )}
          >
            {tagline}
          </motion.span>
        ) : null}
      </span>
    </Link>
  );
}
