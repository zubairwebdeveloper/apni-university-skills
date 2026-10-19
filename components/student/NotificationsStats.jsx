"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Bell, BellRing, CheckCheck } from "lucide-react";

const TONES = {
  default: "bg-primary/10 text-primary ring-primary/20",
  attention:
    "bg-amber-400/15 text-amber-700 ring-amber-500/25 dark:text-amber-300",
  success:
    "bg-emerald-500/10 text-emerald-700 ring-emerald-500/25 dark:text-emerald-400",
};

export function NotificationsStats({ total, unread, latestLabel }) {
  const reduce = useReducedMotion();
  const caughtUp = unread === 0;

  const stats = [
    { label: "Total", value: total, icon: Bell, tone: "default" },
    {
      label: "Unread",
      value: unread,
      icon: BellRing,
      tone: unread > 0 ? "attention" : "default",
    },
    {
      label: "Inbox",
      value: caughtUp ? "All caught up" : "Needs review",
      icon: CheckCheck,
      tone: caughtUp ? "success" : "default",
    },
  ];

  return (
    <div className="mb-6">
      <dl className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {stats.map((s, i) => (
          <motion.div
            key={s.label}
            initial={reduce ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.4,
              delay: i * 0.07,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="flex items-center gap-3.5 rounded-2xl border border-border bg-card p-4 shadow-sm"
          >
            <span
              className={`grid size-10 shrink-0 place-items-center rounded-xl ring-1 ring-inset ${TONES[s.tone]}`}
            >
              <s.icon className="size-5" aria-hidden="true" />
            </span>
            <div className="min-w-0">
              <dt className="text-xs font-medium text-muted-foreground">
                {s.label}
              </dt>
              <dd className="mt-0.5 truncate text-xl font-semibold tabular-nums tracking-tight text-foreground">
                {s.value}
              </dd>
            </div>
          </motion.div>
        ))}
      </dl>

      {latestLabel && (
        <p className="mt-3 text-xs text-muted-foreground">
          Latest update: {latestLabel}
        </p>
      )}
    </div>
  );
}
