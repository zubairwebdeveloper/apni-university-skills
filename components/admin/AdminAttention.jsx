// components/admin/AdminAttention.jsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import {
  FiBell,
  FiCheckCircle,
  FiChevronRight,
  FiAlertCircle,
  FiCreditCard,
  FiFileText,
  FiInbox,
  FiMessageSquare,
  FiUserCheck,
} from "react-icons/fi";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/*
  Server se icon ka function pass nahi ho sakta (client component ki
  props serializable honi chahiye), is liye items mein string key bhejein:
  { href, label, n, icon: "payments", tone: "danger", description: "..." }
*/
const ICONS = {
  payments: FiCreditCard,
  students: FiUserCheck,
  messages: FiMessageSquare,
  reviews: FiFileText,
  alert: FiAlertCircle,
  inbox: FiInbox,
};

const TONES = {
  danger: {
    tile: "border-red-500/20 bg-red-500/10 text-red-600 dark:text-red-400",
    badge: "bg-red-600 text-white",
  },
  warning: {
    tile: "border-yellow-400/30 bg-yellow-400/10 text-yellow-700 dark:text-yellow-300",
    badge: "bg-yellow-400 text-gray-900",
  },
  info: {
    tile: "border-violet-500/20 bg-violet-500/10 text-violet-600 dark:text-violet-300",
    badge: "bg-violet-600 text-white",
  },
};

const focusRing =
  "outline-none focus-visible:ring-2 focus-visible:ring-yellow-400/70 focus-visible:ring-offset-2 focus-visible:ring-offset-background";

function formatCount(n) {
  return n > 99 ? "99+" : String(n);
}

export function AdminAttention({ items = [] }) {
  const [open, setOpen] = useState(false);
  const reduceMotion = useReducedMotion();

  const total = items.reduce((n, i) => n + (i.n || 0), 0);
  const pendingKinds = items.filter((i) => (i.n || 0) > 0).length;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        className={cn(
          buttonVariants({ variant: "ghost", size: "icon" }),
          "group relative rounded-full transition-colors motion-reduce:transition-none",
          focusRing,
          open && "bg-accent",
        )}
        aria-label={
          total ? `${total} items need attention` : "Nothing needs attention"
        }
      >
        <FiBell
          aria-hidden="true"
          className={cn(
            "size-[18px] origin-top transition-transform duration-200 motion-reduce:transition-none",
            total > 0 &&
              "group-hover:rotate-12 motion-reduce:group-hover:rotate-0",
          )}
        />

        {total > 0 && (
          <span
            aria-hidden="true"
            className="absolute -right-0.5 -top-0.5 grid min-w-4 place-items-center rounded-full bg-destructive px-1 text-[10px] font-semibold leading-4 tabular-nums text-white ring-2 ring-background"
          >
            {formatCount(total)}
          </span>
        )}
      </PopoverTrigger>

      <PopoverContent
        align="end"
        sideOffset={8}
        className="w-[min(22rem,calc(100vw-1.5rem))] overflow-hidden p-0"
      >
        {/* Header */}
        <div className="flex items-center gap-3 border-b border-border bg-muted/40 px-4 py-3.5">
          <span
            aria-hidden="true"
            className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-violet-500/20 bg-violet-500/10 text-violet-600 dark:text-violet-300"
          >
            <FiBell className="size-4" />
          </span>

          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold leading-5 tracking-tight text-foreground">
              Needs attention
            </p>
            <p
              className="text-xs leading-5 text-muted-foreground"
              aria-live="polite"
            >
              {total > 0
                ? `${total} pending across ${pendingKinds} ${
                    pendingKinds === 1 ? "area" : "areas"
                  }`
                : "No pending items"}
            </p>
          </div>

          {total > 0 && (
            <span className="rounded-full border border-red-500/25 bg-red-500/10 px-2 py-0.5 text-xs font-semibold tabular-nums text-red-700 dark:text-red-300">
              {formatCount(total)}
            </span>
          )}
        </div>

        {/* Body */}
        {items.length ? (
          <ul className="max-h-80 space-y-0.5 overflow-y-auto p-1.5">
            {items.map((i, index) => {
              const Icon = ICONS[i.icon] ?? FiInbox;
              const tone = TONES[i.tone] ?? TONES.info;
              const count = i.n || 0;
              const pending = count > 0;

              return (
                <motion.li
                  key={i.href}
                  initial={reduceMotion ? false : { opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.2,
                    ease: "easeOut",
                    delay: reduceMotion ? 0 : Math.min(index, 6) * 0.04,
                  }}
                >
                  <Link
                    href={i.href}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "group flex items-center gap-3 rounded-lg px-2.5 py-2 text-sm transition-colors motion-reduce:transition-none",
                      "hover:bg-accent",
                      focusRing,
                      !pending && "opacity-70 hover:opacity-100",
                    )}
                  >
                    <span
                      aria-hidden="true"
                      className={cn(
                        "grid size-9 shrink-0 place-items-center rounded-lg border",
                        pending
                          ? tone.tile
                          : "border-border bg-muted text-muted-foreground",
                      )}
                    >
                      <Icon className="size-4" />
                    </span>

                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-medium leading-5 text-foreground">
                        {i.label}
                      </span>
                      {i.description ? (
                        <span className="block truncate text-xs leading-5 text-muted-foreground">
                          {i.description}
                        </span>
                      ) : null}
                    </span>

                    <span
                      className={cn(
                        "grid min-w-6 place-items-center rounded-full px-1.5 py-0.5 text-xs font-semibold tabular-nums",
                        pending ? tone.badge : "bg-muted text-muted-foreground",
                      )}
                    >
                      {formatCount(count)}
                      <span className="sr-only">
                        {pending ? " pending" : " pending items"}
                      </span>
                    </span>

                    <FiChevronRight
                      aria-hidden="true"
                      className="size-4 shrink-0 text-muted-foreground opacity-0 transition-all duration-200 group-hover:translate-x-0.5 group-hover:opacity-100 group-focus-visible:opacity-100 motion-reduce:transition-none motion-reduce:group-hover:translate-x-0"
                    />
                  </Link>
                </motion.li>
              );
            })}
          </ul>
        ) : (
          <div className="flex flex-col items-center gap-2 px-6 py-10 text-center">
            <span
              aria-hidden="true"
              className="grid size-12 place-items-center rounded-full border border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
            >
              <FiCheckCircle className="size-6" />
            </span>
            <p className="text-sm font-semibold tracking-tight text-foreground">
              You&apos;re all caught up
            </p>
            <p className="max-w-[16rem] text-xs leading-5 text-muted-foreground">
              New payments, messages and reviews that need action will appear
              here.
            </p>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
