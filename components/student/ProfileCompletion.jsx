"use client";

import { motion, useReducedMotion } from "framer-motion";
import { FiCheck, FiCircle } from "react-icons/fi";
import { Card } from "@/components/ui/card";

export function ProfileCompletion({ profile = {} }) {
  const reduce = useReducedMotion();

  const checks = [
    { label: "Profile photo", done: !!profile.photoURL },
    { label: "Display name", done: !!profile.displayName },
    { label: "Headline", done: !!profile.headline },
    { label: "Short bio", done: !!profile.bio },
    { label: "Location", done: !!profile.location },
    { label: "Verified email", done: !!profile.emailVerified },
  ];
  const done = checks.filter((c) => c.done).length;
  const pct = Math.round((done / checks.length) * 100);
  const complete = done === checks.length;

  const container = {
    hidden: {},
    show: { transition: { staggerChildren: reduce ? 0 : 0.05 } },
  };

  const item = {
    hidden: reduce ? { opacity: 1 } : { opacity: 0, x: -6 },
    show: {
      opacity: 1,
      x: 0,
      transition: { duration: reduce ? 0 : 0.25, ease: "easeOut" },
    },
  };

  return (
    <Card
      aria-labelledby="profile-strength-title"
      className="rounded-2xl border-border p-5 shadow-sm sm:p-6"
    >
      <div className="flex items-end justify-between gap-3">
        <div className="space-y-1">
          <h3
            id="profile-strength-title"
            className="text-base font-semibold leading-none tracking-tight"
          >
            Profile strength
          </h3>
          <p className="text-sm text-muted-foreground tabular-nums">
            {done} of {checks.length} steps complete
          </p>
        </div>
        <span className="text-3xl font-semibold leading-none tracking-tight text-primary tabular-nums">
          {pct}%
        </span>
      </div>

      <div
        role="progressbar"
        aria-label="Profile completion"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={pct}
        className="mt-4 h-2 overflow-hidden rounded-full bg-muted"
      >
        <motion.div
          className="h-full rounded-full bg-primary"
          initial={{ width: reduce ? `${pct}%` : 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: reduce ? 0 : 0.8, ease: "easeOut" }}
        />
      </div>

      <motion.ul
        variants={container}
        initial="hidden"
        animate="show"
        className="mt-5 grid gap-1 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2"
      >
        {checks.map(({ label, done }) => (
          <motion.li
            key={label}
            variants={item}
            className="flex items-center gap-3 rounded-lg px-2 py-2 text-sm transition-colors hover:bg-muted/50 motion-reduce:transition-none"
          >
            <span
              aria-hidden="true"
              className={
                done
                  ? "grid size-6 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground"
                  : "grid size-6 shrink-0 place-items-center rounded-full border border-border text-muted-foreground/60"
              }
            >
              {done ? (
                <FiCheck className="size-3.5" />
              ) : (
                <FiCircle className="size-3" />
              )}
            </span>
            <span
              className={
                done ? "font-medium text-foreground" : "text-muted-foreground"
              }
            >
              {label}
              <span className="sr-only">
                {done ? " (completed)" : " (not completed)"}
              </span>
            </span>
          </motion.li>
        ))}
      </motion.ul>

      <p className="mt-4 border-t border-border pt-4 text-sm text-muted-foreground">
        {complete
          ? "Your profile is complete."
          : "Complete the remaining steps to strengthen your profile."}
      </p>
    </Card>
  );
}
