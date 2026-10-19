// components/student/SidebarExtras.jsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { FiArrowRight, FiTrendingUp, FiZap } from "react-icons/fi";
import { cn } from "@/lib/utils";

const TIPS = [
  {
    title: "Study in short bursts",
    body: "25 focused minutes beat two distracted hours.",
  },
  {
    title: "Pick a fixed time",
    body: "The same slot every day removes the decision of when to start.",
  },
  {
    title: "Teach it back",
    body: "Explain a lesson in your own words to find the gaps.",
  },
  {
    title: "Finish before you switch",
    body: "One completed course beats five half-finished ones.",
  },
  {
    title: "Review before sleep",
    body: "A five-minute recap helps the day's lessons stick.",
  },
];

export function SidebarPromo() {
  const reduce = useReducedMotion();
  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: reduce ? 0 : 0.35, duration: reduce ? 0 : 0.35 }}
      className="relative overflow-hidden rounded-2xl bg-primary p-4 text-primary-foreground shadow-sm"
    >
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -right-8 -top-8 size-24 rounded-full border border-primary-foreground/15"
      />
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-10 -left-6 size-20 rounded-full bg-primary-foreground/10"
      />
      <p className="relative text-sm font-semibold">Free courses are waiting</p>
      <p className="relative mt-1 text-sm leading-relaxed text-primary-foreground/85">
        Build a new skill at your own pace.
      </p>
      <Link
        href="/courses?price=free"
        className="group relative mt-4 inline-flex min-h-9 items-center gap-1.5 rounded-lg bg-primary-foreground px-3.5 py-2 text-sm font-semibold text-primary transition-transform hover:scale-[1.03] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-foreground focus-visible:ring-offset-2 focus-visible:ring-offset-primary motion-reduce:transition-none motion-reduce:hover:scale-100"
      >
        Explore now
        <FiArrowRight
          aria-hidden="true"
          className="transition-transform group-hover:translate-x-0.5 motion-reduce:transition-none motion-reduce:group-hover:translate-x-0"
        />
      </Link>
    </motion.div>
  );
}

// Optional: layout se { total, active, completed } pass karein
export function SidebarProgress({ total = 0, active = 0, completed = 0 }) {
  const reduce = useReducedMotion();
  if (!total) return <SidebarPromo />;
  const pct = Math.max(0, Math.min(100, Math.round((completed / total) * 100)));

  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: reduce ? 0 : 0.35, duration: reduce ? 0 : 0.35 }}
      className="rounded-2xl border border-border bg-card p-4 shadow-sm"
    >
      <div className="flex items-center justify-between gap-2">
        <p className="flex items-center gap-2 text-sm font-semibold">
          <span className="grid size-7 place-items-center rounded-lg bg-primary/10 text-primary">
            <FiTrendingUp aria-hidden="true" className="size-3.5" />
          </span>
          Your progress
        </p>
        <span className="text-base font-bold tabular-nums text-primary">
          {pct}%
        </span>
      </div>

      <div
        className="mt-3 h-2 overflow-hidden rounded-full bg-muted"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={pct}
        aria-label="Courses completed"
      >
        <motion.div
          className="h-full rounded-full bg-primary"
          initial={reduce ? false : { width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{
            duration: reduce ? 0 : 0.9,
            ease: "easeOut",
            delay: reduce ? 0 : 0.4,
          }}
        />
      </div>

      <p className="mt-2 text-sm text-muted-foreground tabular-nums">
        {completed} of {total} completed
        {active ? ` · ${active} in progress` : ""}
      </p>
    </motion.div>
  );
}

export function SidebarTip() {
  const reduce = useReducedMotion();
  const [index, setIndex] = useState(
    () => Math.floor(Date.now() / 86_400_000) % TIPS.length,
  );
  const [paused, setPaused] = useState(false);

  // Auto-rotate (hover ya focus par ruk jata hai)
  useEffect(() => {
    if (reduce || paused) return;
    const t = setInterval(() => setIndex((i) => (i + 1) % TIPS.length), 9000);
    return () => clearInterval(t);
  }, [reduce, paused]);

  const tip = TIPS[index];
  const rotating = !reduce && !paused;

  return (
    <div
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      className="rounded-2xl border border-border bg-card p-4 shadow-sm"
    >
      <p className="flex items-center gap-2 text-sm font-semibold">
        <span className="grid size-7 place-items-center rounded-lg bg-primary/10 text-primary">
          <FiZap aria-hidden="true" className="size-3.5" />
        </span>
        Study tip
      </p>

      {/* Announce changes only when the user is in control, not on auto-rotate */}
      <div
        className="mt-3 min-h-[4.75rem]"
        aria-live={rotating ? "off" : "polite"}
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={index}
            initial={reduce ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, y: -8 }}
            transition={{ duration: reduce ? 0 : 0.2 }}
          >
            <p className="text-sm font-medium">{tip.title}</p>
            <p className="mt-0.5 text-sm leading-relaxed text-muted-foreground">
              {tip.body}
            </p>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="mt-1 flex" role="group" aria-label="Choose tip">
        {TIPS.map((t, i) => (
          <button
            key={t.title}
            type="button"
            onClick={() => setIndex(i)}
            aria-label={`Tip ${i + 1}: ${t.title}`}
            aria-current={i === index}
            className="group grid h-6 min-w-6 place-items-center rounded-full px-0.5 focus-visible:outline-none"
          >
            <span
              className={cn(
                "h-1.5 rounded-full transition-all duration-300 group-focus-visible:ring-2 group-focus-visible:ring-ring group-focus-visible:ring-offset-2 group-focus-visible:ring-offset-background motion-reduce:transition-none",
                i === index
                  ? "w-5 bg-primary"
                  : "w-1.5 bg-muted-foreground/30 group-hover:bg-muted-foreground/60",
              )}
            />
          </button>
        ))}
      </div>
    </div>
  );
}
