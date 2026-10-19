"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import {
  ArrowRight,
  HelpCircle,
  Lock,
  RefreshCw,
  ShieldCheck,
} from "lucide-react";

const items = [
  {
    icon: Lock,
    title: "Secure checkout",
    text: "Payments are processed by Stripe with PCI-DSS compliance.",
  },
  {
    icon: RefreshCw,
    title: "Refund policy",
    text: "Eligible courses can be refunded within the refund window.",
  },
  {
    icon: HelpCircle,
    title: "Need help?",
    text: "Billing issue? Contact support with your payment ID.",
  },
];

export function PaymentSecurityCard() {
  const reduceMotion = useReducedMotion();

  const container = {
    hidden: {},
    show: { transition: { staggerChildren: reduceMotion ? 0 : 0.07 } },
  };

  const item = {
    hidden: reduceMotion ? { opacity: 1 } : { opacity: 0, y: 8 },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: reduceMotion ? 0 : 0.25, ease: "easeOut" },
    },
  };

  return (
    <section
      aria-labelledby="billing-security-title"
      className="rounded-2xl border bg-card p-5 shadow-sm sm:p-6"
    >
      <div className="mb-5 flex items-center gap-3">
        <span
          aria-hidden="true"
          className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[#FACC15]/15 text-[#CA9A04] dark:text-[#FACC15]"
        >
          <ShieldCheck className="size-5" />
        </span>
        <h2
          id="billing-security-title"
          className="text-base font-semibold leading-none tracking-tight"
        >
          Billing &amp; security
        </h2>
      </div>

      <motion.ul
        variants={container}
        initial="hidden"
        animate="show"
        className="divide-y"
      >
        {items.map(({ icon: Icon, title, text }) => (
          <motion.li
            key={title}
            variants={item}
            className="flex gap-3 py-4 first:pt-0 last:pb-0"
          >
            <span
              aria-hidden="true"
              className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-[#8B5CF6]/10 text-[#8B5CF6]"
            >
              <Icon className="size-4" />
            </span>
            <div className="min-w-0 space-y-0.5">
              <p className="text-sm font-medium leading-snug">{title}</p>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {text}
              </p>
            </div>
          </motion.li>
        ))}
      </motion.ul>

      <Link
        href="/contact"
        className="group mt-5 inline-flex min-h-10 items-center gap-1.5 rounded-md text-sm font-medium text-foreground underline-offset-4 transition-colors hover:text-[#CA9A04] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FACC15] focus-visible:ring-offset-2 focus-visible:ring-offset-background dark:hover:text-[#FACC15]"
      >
        Contact support
        <ArrowRight
          aria-hidden="true"
          className="size-4 transition-transform group-hover:translate-x-0.5 motion-reduce:transition-none motion-reduce:group-hover:translate-x-0"
        />
      </Link>
    </section>
  );
}
