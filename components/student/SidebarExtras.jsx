// components/student/SidebarExtras.jsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { FiArrowRight, FiTrendingUp, FiZap } from "react-icons/fi";

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
      transition={{ delay: 0.35, duration: 0.35 }}
      className="relative overflow-hidden rounded-2xl bg-primary p-4 text-primary-foreground"
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
      <p className="relative mt-1 text-xs text-primary-foreground/80">
        Build a new skill at your own pace.
      </p>
      <Link
        href="/courses?price=free"
        className="group relative mt-3 inline-flex items-center gap-1.5 rounded-lg bg-primary-foreground px-3 py-1.5 text-xs font-semibold text-primary transition-transform hover:scale-[1.04] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-foreground focus-visible:ring-offset-2 focus-visible:ring-offset-primary"
      >
        Explore now
        <FiArrowRight
          aria-hidden="true"
          className="transition-transform group-hover:translate-x-0.5"
        />
      </Link>
    </motion.div>
  );
}

// Optional: layout se { total, active, completed } pass karein
export function SidebarProgress({ total = 0, active = 0, completed = 0 }) {
  const reduce = useReducedMotion();
  if (!total) return <SidebarPromo />;
  const pct = Math.round((completed / total) * 100);

  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.35, duration: 0.35 }}
      className="rounded-2xl border bg-card p-4"
    >
      <div className="flex items-center justify-between gap-2">
        <p className="flex items-center gap-2 text-sm font-semibold">
          <span className="grid size-7 place-items-center rounded-lg bg-primary/10 text-primary">
            <FiTrendingUp aria-hidden="true" className="size-3.5" />
          </span>
          Your progress
        </p>
        <span className="text-sm font-bold tabular-nums text-primary">
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
          transition={{ duration: 0.9, ease: "easeOut", delay: 0.4 }}
        />
      </div>

      <p className="mt-2 text-xs text-muted-foreground">
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

  return (
    <div
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      className="rounded-2xl border bg-card p-4"
    >
      <p className="flex items-center gap-2 text-sm font-semibold">
        <span className="grid size-7 place-items-center rounded-lg bg-primary/10 text-primary">
          <FiZap aria-hidden="true" className="size-3.5" />
        </span>
        Study tip
      </p>

      <div className="mt-2 min-h-[4.25rem]" aria-live="polite">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={index}
            initial={reduce ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
          >
            <p className="text-sm font-medium">{tip.title}</p>
            <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
              {tip.body}
            </p>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="mt-2 flex gap-1.5" role="group" aria-label="Choose tip">
        {TIPS.map((t, i) => (
          <button
            key={t.title}
            type="button"
            onClick={() => setIndex(i)}
            aria-label={`Tip ${i + 1}: ${t.title}`}
            aria-current={i === index}
            className="grid h-4 place-items-center focus-visible:outline-none"
          >
            <span
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === index ? "w-5 bg-primary" : "w-1.5 bg-muted-foreground/30"
              }`}
            />
          </button>
        ))}
      </div>
    </div>
  );
}
