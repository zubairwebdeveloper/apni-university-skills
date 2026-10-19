"use client";

import { motion, useReducedMotion } from "framer-motion";
import {
  FiAlertTriangle,
  FiCheckCircle,
  FiShield,
  FiShieldOff,
} from "react-icons/fi";
import { cn } from "@/lib/utils";

export function SecurityOverview({ user = {} }) {
  const reduce = useReducedMotion();

  const hasPassword =
    user.providerData?.some((p) => p.providerId === "password") ?? true;

  const checks = [
    { label: "Email verified", ok: !!user.emailVerified },
    { label: "Password sign-in enabled", ok: hasPassword },
  ];
  const good = checks.filter((c) => c.ok).length;
  const allGood = good === checks.length;
  const HeaderIcon = allGood ? FiShield : FiShieldOff;

  return (
    <motion.section
      aria-labelledby="security-overview-title"
      initial={reduce ? false : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: reduce ? 0 : 0.35, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        "flex flex-col gap-5 rounded-2xl border bg-card p-5 shadow-sm sm:p-6 lg:flex-row lg:items-center lg:gap-6",
        allGood ? "border-border" : "border-destructive/30",
      )}
    >
      <div className="flex min-w-0 flex-1 items-center gap-4">
        <span
          aria-hidden="true"
          className={cn(
            "grid size-12 shrink-0 place-items-center rounded-2xl",
            allGood
              ? "bg-primary/10 text-primary"
              : "bg-destructive/10 text-destructive",
          )}
        >
          <HeaderIcon className="size-6" />
        </span>
        <div className="min-w-0 space-y-1">
          <h2
            id="security-overview-title"
            className="text-base font-semibold leading-snug tracking-tight sm:text-lg"
          >
            {allGood
              ? "Your account looks secure"
              : "A few things need attention"}
          </h2>
          <p className="text-sm text-muted-foreground tabular-nums">
            {good} of {checks.length} security checks passed
          </p>
        </div>
      </div>

      <ul
        aria-label="Security checks"
        className="grid gap-2 sm:grid-cols-2 lg:flex lg:flex-wrap lg:justify-end"
      >
        {checks.map(({ label, ok }) => (
          <li
            key={label}
            className={cn(
              "flex items-center gap-2 rounded-xl border px-3 py-2 text-sm",
              ok
                ? "border-border bg-muted/40 text-foreground"
                : "border-destructive/30 bg-destructive/5 text-foreground",
            )}
          >
            {ok ? (
              <FiCheckCircle
                aria-hidden="true"
                className="size-4 shrink-0 text-primary"
              />
            ) : (
              <FiAlertTriangle
                aria-hidden="true"
                className="size-4 shrink-0 text-destructive"
              />
            )}
            <span>{label}</span>
            <span className="sr-only">
              {ok ? "(passed)" : "(needs attention)"}
            </span>
          </li>
        ))}
      </ul>
    </motion.section>
  );
}
