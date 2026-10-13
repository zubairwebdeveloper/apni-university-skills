"use client";

import Link from "next/link";
import {
  MotionConfig,
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
} from "framer-motion";
import { FiArrowRight, FiAward, FiBookOpen } from "react-icons/fi";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/* Respects the OS "reduce motion" setting for every motion child below */
export function MotionRoot({ children }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}

export function Reveal({ children, delay = 0, className }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.45, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* Ambient glow + faint grid + a tilted orbit scene (md and up only) */
export function ProgressBackdrop() {
  const rings = [
    { size: 440, dur: 42, tone: "border-primary/25" },
    { size: 310, dur: 30, tone: "border-primary/40" },
    { size: 190, dur: 20, tone: "border-primary/60" },
  ];

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
    >
      <div className="absolute -top-40 left-1/2 h-[420px] w-[820px] -translate-x-1/2 rounded-full bg-primary/10 blur-3xl dark:bg-primary/15" />
      <div className="absolute -left-20 top-1/3 h-64 w-64 rounded-full bg-amber-400/10 blur-3xl" />
      <div
        className="absolute inset-0 opacity-[0.35] dark:opacity-[0.22]"
        style={{
          backgroundImage:
            "linear-gradient(to right, hsl(var(--border)) 1px, transparent 1px), linear-gradient(to bottom, hsl(var(--border)) 1px, transparent 1px)",
          backgroundSize: "56px 56px",
          maskImage:
            "radial-gradient(ellipse 70% 50% at 50% 0%, #000 25%, transparent 75%)",
          WebkitMaskImage:
            "radial-gradient(ellipse 70% 50% at 50% 0%, #000 25%, transparent 75%)",
        }}
      />

      <div
        className="absolute right-[-150px] top-[-70px] hidden h-[440px] w-[440px] md:block lg:right-[2%]"
        style={{ perspective: 1000 }}
      >
        <div className="relative h-full w-full [transform-style:preserve-3d]">
          {rings.map((r, i) => (
            <motion.div
              key={r.size}
              className={cn(
                "absolute left-1/2 top-1/2 rounded-full border",
                r.tone,
              )}
              style={{
                width: r.size,
                height: r.size,
                marginLeft: -r.size / 2,
                marginTop: -r.size / 2,
                rotateX: 66,
              }}
              animate={{ rotate: i % 2 ? -360 : 360 }}
              transition={{ duration: r.dur, ease: "linear", repeat: Infinity }}
            />
          ))}
          <motion.span
            className="absolute left-1/2 top-1/2 -ml-1.5 -mt-1.5 size-3 rounded-full bg-amber-400 shadow-[0_0_14px_#F5B82E]"
            animate={{ x: [155, 0, -155, 0, 155], y: [0, 58, 0, -58, 0] }}
            transition={{ duration: 12, ease: "linear", repeat: Infinity }}
          />
        </div>
      </div>
    </div>
  );
}

/* Progress ring on a tilting 3D plate. Numbers stay flat and readable. */
function Ring3D({ percent }) {
  const reduce = useReducedMotion();
  const pct = Math.max(0, Math.min(100, Math.round(percent)));
  const R = 44;
  const C = 2 * Math.PI * R;

  const rx = useMotionValue(0);
  const ry = useMotionValue(0);
  const sx = useSpring(rx, { stiffness: 120, damping: 16 });
  const sy = useSpring(ry, { stiffness: 120, damping: 16 });

  const onMove = (e) => {
    if (reduce || e.pointerType !== "mouse") return;
    const r = e.currentTarget.getBoundingClientRect();
    ry.set(((e.clientX - r.left) / r.width - 0.5) * 30);
    rx.set(-((e.clientY - r.top) / r.height - 0.5) * 30);
  };
  const reset = () => {
    rx.set(0);
    ry.set(0);
  };

  return (
    <div
      onPointerMove={onMove}
      onPointerLeave={reset}
      className="relative mx-auto size-44 sm:size-52"
      style={{ perspective: 800 }}
    >
      <motion.div
        aria-hidden="true"
        className="absolute inset-0"
        style={{ rotateX: sx, rotateY: sy, transformStyle: "preserve-3d" }}
      >
        <div
          className="absolute inset-2 rounded-full bg-primary/20 blur-xl"
          style={{ transform: "translateZ(-40px)" }}
        />
        <div
          className="absolute inset-0 rounded-full border border-border bg-card shadow-lg"
          style={{ transform: "translateZ(0)" }}
        />
        <svg
          viewBox="0 0 100 100"
          className="absolute inset-0 -rotate-90"
          style={{ transform: "translateZ(26px) rotate(-90deg)" }}
        >
          <circle
            cx="50"
            cy="50"
            r={R}
            fill="none"
            strokeWidth="7"
            className="stroke-muted"
          />
          <motion.circle
            cx="50"
            cy="50"
            r={R}
            fill="none"
            strokeWidth="7"
            strokeLinecap="round"
            className="stroke-primary"
            strokeDasharray={C}
            initial={{ strokeDashoffset: C }}
            animate={{ strokeDashoffset: C * (1 - pct / 100) }}
            transition={{ duration: 1.1, ease: "easeOut" }}
          />
        </svg>
      </motion.div>

      <div
        role="img"
        aria-label={`Average progress ${pct} percent`}
        className="absolute inset-0 flex flex-col items-center justify-center"
      >
        <span className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          {pct}%
        </span>
        <span className="text-[11px] text-muted-foreground">Average</span>
      </div>
    </div>
  );
}

/* Real data only: counts and averages come from the enrollments */
export function ContinueLearning({ next, total, completed, average }) {
  const allDone = total > 0 && completed === total;

  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      className="relative overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-primary/10 via-card to-card p-5 sm:p-8"
    >
      <div className="grid items-center gap-8 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
        <div className="min-w-0">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background/70 px-3 py-1 text-xs font-medium text-muted-foreground">
            {allDone ? (
              <FiAward className="size-3.5 text-primary" aria-hidden="true" />
            ) : (
              <FiBookOpen
                className="size-3.5 text-primary"
                aria-hidden="true"
              />
            )}
            {allDone ? "All courses complete" : "Pick up where you left off"}
          </span>

          <h2 className="mt-3 font-serif text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            {allDone
              ? "Great work. Every course is finished."
              : next?.courseTitle}
          </h2>

          <p className="mt-2 text-sm text-muted-foreground">
            {total} course{total === 1 ? "" : "s"} enrolled
            <span aria-hidden="true"> · </span>
            {completed} completed
            {!allDone && next && (
              <>
                <span aria-hidden="true"> · </span>
                {Math.round(next.progress)}% through this one
              </>
            )}
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            {!allDone && next && (
              <Link
                href={`/student/learning/${next.courseSlug}`}
                className={cn(buttonVariants(), "group")}
              >
                Continue learning
                <FiArrowRight className="ml-1.5 size-4 transition-transform group-hover:translate-x-1 motion-reduce:transition-none" />
              </Link>
            )}
            <Link
              href="/courses"
              className={buttonVariants({
                variant: allDone ? "default" : "outline",
              })}
            >
              Browse courses
            </Link>
            <a
              href="#all-progress"
              className={buttonVariants({ variant: "ghost" })}
            >
              See all progress
            </a>
          </div>
        </div>

        <Ring3D percent={average} />
      </div>
    </motion.section>
  );
}
