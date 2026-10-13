"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { FiArrowLeft, FiAward, FiCheckCircle } from "react-icons/fi";

export function LearningHeader({
  slug,
  title,
  percent = 0,
  completedCount = 0,
}) {
  const reduce = useReducedMotion();
  const pct = Math.max(0, Math.min(100, Math.round(percent)));
  const done = pct >= 100;

  return (
    <motion.header
      initial={reduce ? false : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      className="mb-6 rounded-2xl border border-border bg-card/80 p-4 shadow-sm backdrop-blur sm:p-5"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <Link
            href={`/courses/${slug}`}
            className="inline-flex items-center gap-1.5 rounded-md text-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <FiArrowLeft aria-hidden="true" /> Course overview
          </Link>
          <h1 className="mt-1 truncate font-serif text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
            {title}
          </h1>
        </div>

        <div className="flex items-center gap-4 sm:w-72">
          <div className="flex-1">
            <div className="mb-1.5 flex items-center justify-between text-xs font-medium text-muted-foreground">
              <span className="inline-flex items-center gap-1">
                <FiCheckCircle aria-hidden="true" /> {completedCount} completed
              </span>
              <span className="text-foreground">{pct}%</span>
            </div>
            <div
              role="progressbar"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={pct}
              aria-label="Course progress"
              className="h-2 overflow-hidden rounded-full bg-muted"
            >
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-primary to-sky-400"
                initial={reduce ? false : { width: 0 }}
                animate={{ width: `${pct}%` }}
                transition={{ duration: 0.9, ease: "easeOut" }}
              />
            </div>
          </div>
          {done && (
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-400/15 px-2.5 py-1 text-xs font-semibold text-amber-700 dark:text-amber-300">
              <FiAward aria-hidden="true" /> Finished
            </span>
          )}
        </div>
      </div>
    </motion.header>
  );
}
