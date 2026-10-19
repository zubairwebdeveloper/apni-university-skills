"use client";

import {
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from "framer-motion";
import { Check, X } from "lucide-react";
import { cn } from "@/lib/utils";

const EASE = [0.22, 1, 0.36, 1];

/** Circular progress with a light 3D tilt. value is 0-100. */
export function ProgressRing({ value = 0, caption }) {
  const reduce = useReducedMotion();
  const pct = Math.max(0, Math.min(100, Number(value) || 0));
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [6, -6]), {
    stiffness: 200,
    damping: 22,
  });
  const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-6, 6]), {
    stiffness: 200,
    damping: 22,
  });

  function move(e) {
    if (reduce || e.pointerType === "touch") return;
    const r = e.currentTarget.getBoundingClientRect();
    x.set((e.clientX - r.left) / r.width - 0.5);
    y.set((e.clientY - r.top) / r.height - 0.5);
  }

  return (
    <motion.div
      className="relative size-36 shrink-0"
      style={{
        rotateX: reduce ? 0 : rotateX,
        rotateY: reduce ? 0 : rotateY,
        transformPerspective: 700,
        transformStyle: "preserve-3d",
      }}
      onPointerMove={move}
      onPointerLeave={() => {
        x.set(0);
        y.set(0);
      }}
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={pct}
      aria-valuetext={`${pct}% complete`}
      aria-label="Course progress"
    >
      <svg
        viewBox="0 0 120 120"
        className="size-full -rotate-90"
        aria-hidden="true"
      >
        <circle
          cx="60"
          cy="60"
          r="52"
          fill="none"
          strokeWidth="10"
          className="stroke-muted"
        />
        {/* A round linecap at pathLength 0 can paint a stray dot, so skip it at 0% */}
        {pct > 0 && (
          <motion.circle
            cx="60"
            cy="60"
            r="52"
            fill="none"
            strokeWidth="10"
            strokeLinecap="round"
            className={cn(pct >= 100 ? "stroke-emerald-500" : "stroke-primary")}
            initial={reduce ? false : { pathLength: 0 }}
            animate={{ pathLength: pct / 100 }}
            transition={{ duration: 1, ease: EASE }}
          />
        )}
      </svg>
      <div
        className="absolute inset-0 flex flex-col items-center justify-center px-5 text-center"
        style={{ transform: "translateZ(24px)" }}
      >
        <span className="text-3xl font-semibold leading-none tracking-tight tabular-nums">
          {pct}%
        </span>
        {caption && (
          <span className="mt-1.5 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
            {caption}
          </span>
        )}
      </div>
    </motion.div>
  );
}

const TONES = {
  done: {
    marker: "bg-emerald-500 text-white",
    sr: "Completed: ",
    icon: Check,
  },
  danger: {
    marker: "bg-destructive text-white",
    sr: "Needs attention: ",
    icon: X,
  },
  default: {
    marker: "bg-primary text-primary-foreground",
    sr: "",
    icon: null,
  },
};

/** items: [{ label, value, tone?: "done" | "danger" }] already formatted. */
export function EnrollmentTimeline({ items }) {
  const reduce = useReducedMotion();
  return (
    <ol className="relative space-y-6 border-l border-border pl-7">
      {items.map((it, i) => {
        const tone = TONES[it.tone] ?? TONES.default;
        const Icon = tone.icon;
        return (
          <motion.li
            key={`${it.label}-${i}`}
            className="relative"
            initial={reduce ? false : { opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{
              duration: 0.4,
              delay: reduce ? 0 : Math.min(i, 6) * 0.1,
              ease: EASE,
            }}
          >
            {/* Icon, not just color, tells done/danger apart */}
            <span
              className={cn(
                "absolute -left-[2.4rem] top-0 grid size-5 place-items-center rounded-full ring-4 ring-background",
                tone.marker,
              )}
              aria-hidden="true"
            >
              {Icon ? (
                <Icon className="size-3" strokeWidth={3} />
              ) : (
                <span className="size-1.5 rounded-full bg-current" />
              )}
            </span>
            <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
              {it.label}
            </p>
            <p className="mt-0.5 text-sm font-medium leading-snug [overflow-wrap:anywhere]">
              {tone.sr && <span className="sr-only">{tone.sr}</span>}
              {it.value}
            </p>
          </motion.li>
        );
      })}
    </ol>
  );
}
