"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

const BRAND_YELLOW = "#FACC15";
const BRAND_PURPLE = "#8B5CF6";

const LOGO_SIZES = {
  sm: {
    mark: "size-8 rounded-xl",
    text: "text-base sm:text-lg",
    tagline: "text-[8px]",
    gap: "gap-2",
  },
  md: {
    mark: "size-10 rounded-xl",
    text: "text-xl sm:text-2xl",
    tagline: "text-[9px]",
    gap: "gap-2.5 sm:gap-3",
  },
  lg: {
    mark: "size-12 rounded-2xl sm:size-14",
    text: "text-2xl sm:text-3xl lg:text-4xl",
    tagline: "text-[9px] sm:text-[10px]",
    gap: "gap-3 sm:gap-3.5",
  },
};

function CapMark({ className }) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.span
      initial={reduceMotion ? false : { opacity: 0, scale: 0.82 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{
        duration: reduceMotion ? 0 : 0.45,
        ease: [0.22, 1, 0.36, 1],
      }}
      className={cn(
        "relative isolate inline-flex shrink-0 items-center justify-center",
        "overflow-hidden border border-black/5 bg-[#FACC15]",
        "shadow-[0_5px_18px_-8px_rgba(250,204,21,0.55)]",
        className,
      )}
    >
      <svg
        viewBox="0 0 100 100"
        fill="none"
        aria-hidden="true"
        className="relative z-10 size-[76%] overflow-visible"
      >
        {/* Graduation cap */}
        <path d="M8 39.5 50 19 92 39.5 50 60 8 39.5Z" fill="#171326" />

        {/* Cap base */}
        <path
          d="M25 48.5V65C39 75.5 61 75.5 75 65V48.5L50 61 25 48.5Z"
          fill="#171326"
        />

        {/* Tassel cord */}
        <motion.g
          style={{ originX: "82%", originY: "40%" }}
          animate={reduceMotion ? undefined : { rotate: [0, 5, -3, 0] }}
          transition={{
            duration: 2.2,
            repeat: Infinity,
            repeatDelay: 8,
            ease: "easeInOut",
          }}
        >
          <path
            d="M82 35V65"
            stroke={BRAND_PURPLE}
            strokeWidth="4"
            strokeLinecap="round"
          />
          <circle cx="82" cy="69" r="5" fill={BRAND_PURPLE} />
        </motion.g>

        {/* Small highlight */}
        <path
          d="M25 38 50 26"
          stroke="white"
          strokeOpacity=".18"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>

      <span
        aria-hidden="true"
        className="absolute inset-x-2 bottom-0 h-[3px] rounded-full bg-violet-500"
      />
    </motion.span>
  );
}

function AnimatedWordmark({ name, size, reduceMotion }) {
  const words = name.split(" ");

  return (
    <span
      aria-hidden="true"
      className={cn(
        "flex flex-wrap items-baseline gap-x-[0.28em]",
        "font-sans font-bold leading-none tracking-[-0.045em]",
        size,
      )}
    >
      {words.map((word, wordIndex) => (
        <span
          key={`${word}-${wordIndex}`}
          className={cn(
            "inline-flex whitespace-nowrap",
            wordIndex === 0 ? "text-foreground" : "text-violet-500",
          )}
        >
          {Array.from(word).map((character, characterIndex) => {
            const delay = (wordIndex * 10 + characterIndex) * 0.025;

            return (
              <motion.span
                key={`${character}-${characterIndex}`}
                className="inline-block"
                initial={reduceMotion ? false : { opacity: 0, y: 7 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={reduceMotion ? undefined : { y: -2 }}
                transition={{
                  duration: reduceMotion ? 0 : 0.35,
                  delay: reduceMotion ? 0 : Math.min(delay, 0.45),
                  ease: [0.22, 1, 0.36, 1],
                }}
              >
                {character}
              </motion.span>
            );
          })}
        </span>
      ))}
    </span>
  );
}

export function AnimatedLogo({
  name = "Apni University",
  tagline,
  href = "/",
  size = "md",
  className,
}) {
  const reduceMotion = useReducedMotion();
  const sizes = LOGO_SIZES[size] || LOGO_SIZES.md;

  return (
    <div
      aria-hidden="true"
      className={cn(
        "group/logo inline-flex min-w-0 max-w-full items-center",
        sizes.gap,
        "rounded-xl outline-none",
        "transition-opacity duration-200 hover:opacity-95",
        "motion-reduce:transition-none",
        className,
      )}
    >
      <CapMark
        className={cn(
          sizes.mark,
          "transition-[box-shadow,transform] duration-300",
          "group-hover/logo:shadow-[0_7px_24px_-6px_rgba(139,92,246,0.45)]",
          "group-hover/logo:rotate-2",
          "motion-reduce:transform-none motion-reduce:transition-none",
        )}
      />

      <span className="flex min-w-0 flex-col justify-center gap-1.5">
        <AnimatedWordmark
          name={name}
          size={sizes.text}
          reduceMotion={reduceMotion}
        />

        {tagline ? (
          <motion.span
            initial={reduceMotion ? false : { opacity: 0, x: -5 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{
              duration: reduceMotion ? 0 : 0.35,
              delay: reduceMotion ? 0 : 0.25,
            }}
            className={cn(
              "hidden max-w-full truncate font-semibold uppercase",
              "leading-tight tracking-[0.13em] text-muted-foreground",
              "sm:block",
              sizes.tagline,
            )}
          >
            {tagline}
          </motion.span>
        ) : null}
      </span>
    </div>
  );
}
