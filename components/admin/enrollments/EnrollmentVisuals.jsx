"use client";

import {
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from "framer-motion";

/** Circular progress with a light 3D tilt. value is 0-100. */
export function ProgressRing({ value = 0, caption }) {
  const reduce = useReducedMotion();
  const pct = Math.max(0, Math.min(100, Number(value) || 0));
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [10, -10]), {
    stiffness: 200,
    damping: 22,
  });
  const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-10, 10]), {
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
      aria-label={`Progress ${pct}%`}
    >
      <svg viewBox="0 0 120 120" className="size-full -rotate-90">
        <circle
          cx="60"
          cy="60"
          r="52"
          fill="none"
          strokeWidth="10"
          className="stroke-muted"
        />
        <motion.circle
          cx="60"
          cy="60"
          r="52"
          fill="none"
          strokeWidth="10"
          strokeLinecap="round"
          className="stroke-primary"
          initial={reduce ? false : { pathLength: 0 }}
          animate={{ pathLength: pct / 100 }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
        />
      </svg>
      <div
        className="absolute inset-0 flex flex-col items-center justify-center"
        style={{ transform: "translateZ(24px)" }}
      >
        <span className="text-3xl font-semibold tabular-nums">{pct}%</span>
        {caption && (
          <span className="text-xs text-muted-foreground">{caption}</span>
        )}
      </div>
    </motion.div>
  );
}

/** items: [{ label, value, tone?: "done" | "danger" }] already formatted. */
export function EnrollmentTimeline({ items }) {
  const reduce = useReducedMotion();
  const dot = {
    done: "bg-emerald-500",
    danger: "bg-destructive",
    default: "bg-primary",
  };
  return (
    <ol className="relative space-y-5 border-l border-border pl-6">
      {items.map((it, i) => (
        <motion.li
          key={it.label}
          className="relative"
          initial={reduce ? false : { opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: reduce ? 0 : i * 0.1 }}
        >
          <span
            className={`absolute -left-[1.9rem] top-1 size-3 rounded-full ring-4 ring-background ${dot[it.tone] ?? dot.default}`}
            aria-hidden="true"
          />
          <p className="text-xs text-muted-foreground">{it.label}</p>
          <p className="text-sm font-medium">{it.value}</p>
        </motion.li>
      ))}
    </ol>
  );
}
