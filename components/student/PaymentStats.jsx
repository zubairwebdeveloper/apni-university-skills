"use client";

import { motion, useReducedMotion } from "framer-motion";
import {
  FiDollarSign,
  FiShoppingBag,
  FiCheckCircle,
  FiClock,
} from "react-icons/fi";

const fmt = (cents, currency = "usd") =>
  new Intl.NumberFormat("en-US", { style: "currency", currency }).format(
    cents / 100,
  );

export function PaymentStats({ payments = [] }) {
  const reduce = useReducedMotion();

  const paid = payments.filter((p) => p.status === "succeeded");
  const pending = payments.filter((p) => p.status === "pending");
  const total = paid.reduce((sum, p) => sum + p.amount, 0);
  const last = paid[0]?.createdAt
    ? new Date(paid[0].createdAt).toLocaleDateString("en-US", {
        dateStyle: "medium",
      })
    : "—";

  const stats = [
    {
      label: "Total spent",
      hint: "Successful payments",
      value: fmt(total, paid[0]?.currency),
      icon: FiDollarSign,
    },
    {
      label: "Courses purchased",
      hint: "Completed purchases",
      value: paid.length,
      icon: FiShoppingBag,
    },
    {
      label: "Pending",
      hint: "Awaiting confirmation",
      value: pending.length,
      icon: FiClock,
    },
    {
      label: "Last payment",
      hint: "Most recent success",
      value: last,
      icon: FiCheckCircle,
    },
  ];

  const container = {
    hidden: {},
    show: { transition: { staggerChildren: reduce ? 0 : 0.06 } },
  };

  const item = {
    hidden: reduce ? { opacity: 1 } : { opacity: 0, y: 10 },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: reduce ? 0 : 0.3, ease: [0.22, 1, 0.36, 1] },
    },
  };

  return (
    <motion.ul
      aria-label="Payment summary"
      variants={container}
      initial="hidden"
      animate="show"
      className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4"
    >
      {stats.map(({ label, hint, value, icon: Icon }) => (
        <motion.li
          key={label}
          variants={item}
          className="group min-w-0 rounded-2xl border border-border bg-card p-4 shadow-sm transition-[border-color,box-shadow] duration-200 hover:border-primary/40 hover:shadow-md motion-reduce:transition-none sm:p-5"
        >
          <div className="flex items-center justify-between gap-2">
            <p className="truncate text-xs font-medium uppercase tracking-wider text-muted-foreground">
              {label}
            </p>
            <span
              aria-hidden="true"
              className="grid size-9 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground motion-reduce:transition-none"
            >
              <Icon className="size-4" />
            </span>
          </div>
          <p className="mt-4 truncate text-2xl font-semibold tabular-nums tracking-tight text-foreground sm:text-3xl">
            {value}
          </p>
          <p className="mt-1 truncate text-xs text-muted-foreground">{hint}</p>
        </motion.li>
      ))}
    </motion.ul>
  );
}
