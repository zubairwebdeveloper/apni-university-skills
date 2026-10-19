"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { FiArrowRight, FiEye, FiLock, FiShield } from "react-icons/fi";
import { Card } from "@/components/ui/card";

const items = [
  {
    icon: FiEye,
    title: "Public on reviews",
    text: "Only your display name and photo are shown publicly on reviews.",
  },
  {
    icon: FiLock,
    title: "Email stays private",
    text: "Your email address is never made public.",
  },
];

export function PrivacyCard() {
  const reduce = useReducedMotion();

  const container = {
    hidden: {},
    show: { transition: { staggerChildren: reduce ? 0 : 0.07 } },
  };

  const item = {
    hidden: reduce ? { opacity: 1 } : { opacity: 0, y: 8 },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: reduce ? 0 : 0.25, ease: "easeOut" },
    },
  };

  return (
    <Card
      aria-labelledby="privacy-card-title"
      className="rounded-2xl border-border p-5 shadow-sm sm:p-6"
    >
      <div className="mb-5 flex items-center gap-3">
        <span
          aria-hidden="true"
          className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary"
        >
          <FiShield className="size-5" />
        </span>
        <h3
          id="privacy-card-title"
          className="text-base font-semibold leading-none tracking-tight"
        >
          Privacy
        </h3>
      </div>

      <motion.ul
        variants={container}
        initial="hidden"
        animate="show"
        className="divide-y divide-border"
      >
        {items.map(({ icon: Icon, title, text }) => (
          <motion.li
            key={title}
            variants={item}
            className="flex gap-3 py-4 first:pt-0 last:pb-0"
          >
            <span
              aria-hidden="true"
              className="grid size-8 shrink-0 place-items-center rounded-lg bg-muted text-primary"
            >
              <Icon className="size-4" />
            </span>
            <div className="min-w-0 space-y-0.5">
              <p className="text-sm font-medium leading-snug text-foreground">
                {title}
              </p>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {text}
              </p>
            </div>
          </motion.li>
        ))}
      </motion.ul>

      <Link
        href="/privacy"
        className="group mt-5 inline-flex min-h-10 items-center gap-1.5 rounded-md text-sm font-medium text-primary underline-offset-4 transition-colors hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      >
        Read privacy policy
        <FiArrowRight
          aria-hidden="true"
          className="size-4 transition-transform group-hover:translate-x-0.5 motion-reduce:transition-none motion-reduce:group-hover:translate-x-0"
        />
      </Link>
    </Card>
  );
}
