"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Bell, BellRing, CheckCheck } from "lucide-react";

export function NotificationsStats({ total, unread, latestLabel }) {
  const reduce = useReducedMotion();
  const stats = [
    { label: "Total", value: total, icon: Bell },
    { label: "Unread", value: unread, icon: BellRing, accent: unread > 0 },
    {
      label: "All caught up",
      value: unread === 0 ? "Yes" : "Not yet",
      icon: CheckCheck,
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
            whileHover={reduce ? undefined : { y: -3 }}
            className="flex items-center gap-3 rounded-2xl border border-border bg-card/80 p-4 shadow-sm backdrop-blur"
          >
            <span
              className={
                "grid h-10 w-10 place-items-center rounded-xl " +
                (s.accent
                  ? "bg-amber-400/15 text-amber-700 dark:text-amber-300"
                  : "bg-primary/10 text-primary")
              }
            >
              <s.icon className="h-5 w-5" aria-hidden="true" />
            </span>
            <div>
              <dt className="text-xs font-medium text-muted-foreground">
                {s.label}
              </dt>
              <dd className="text-xl font-semibold tracking-tight text-foreground">
                {s.value}
              </dd>
            </div>
          </motion.div>
        ))}
      </dl>
      {latestLabel && (
        <p className="mt-2 text-xs text-muted-foreground">
          Latest update: {latestLabel}
        </p>
      )}
    </div>
  );
}
