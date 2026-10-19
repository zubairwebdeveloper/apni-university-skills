"use client";

import { motion, useReducedMotion } from "framer-motion";
import { FiCheck, FiZap } from "react-icons/fi";
import { Card } from "@/components/ui/card";

const tips = [
  "Add a clear photo. It makes your reviews feel more trustworthy.",
  "Use your headline to state your goal, like “Learning Next.js & Firebase”.",
  "Keep your bio short. Two or three lines are enough.",
  "Use your real name as your public name, since it appears on reviews.",
];

export function ProfileTips() {
  const reduce = useReducedMotion();

  const container = {
    hidden: {},
    show: { transition: { staggerChildren: reduce ? 0 : 0.06 } },
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
      aria-labelledby="profile-tips-title"
      className="rounded-2xl border-border p-5 shadow-sm sm:p-6"
    >
      <div className="mb-5 flex items-center gap-3">
        <span
          aria-hidden="true"
          className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary"
        >
          <FiZap className="size-5" />
        </span>
        <div className="space-y-1">
          <h3
            id="profile-tips-title"
            className="text-base font-semibold leading-none tracking-tight"
          >
            Profile tips
          </h3>
          <p className="text-sm text-muted-foreground">
            Small changes that make your profile stand out.
          </p>
        </div>
      </div>

      <motion.ul
        variants={container}
        initial="hidden"
        animate="show"
        className="divide-y divide-border"
      >
        {tips.map((t) => (
          <motion.li
            key={t}
            variants={item}
            className="flex gap-3 py-3 text-sm leading-relaxed text-muted-foreground first:pt-0 last:pb-0"
          >
            <span
              aria-hidden="true"
              className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-primary/10 text-primary"
            >
              <FiCheck className="size-3" />
            </span>
            <span className="min-w-0">{t}</span>
          </motion.li>
        ))}
      </motion.ul>
    </Card>
  );
}
