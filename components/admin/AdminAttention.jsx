// components/admin/AdminAttention.jsx
"use client";

import { useState } from "react";
import Link from "next/link";
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
    tile: "bg-destructive/10 text-destructive",
    badge: "bg-destructive text-white",
  },
  warning: {
    tile: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
    badge: "bg-amber-500 text-white",
  },
  info: {
    tile: "bg-primary/10 text-primary",
    badge: "bg-primary text-primary-foreground",
  },
};

export function AdminAttention({ items = [] }) {
  const [open, setOpen] = useState(false);

  const total = items.reduce((n, i) => n + (i.n || 0), 0);
  const pendingKinds = items.filter((i) => i.n > 0).length;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        className={cn(
          buttonVariants({ variant: "ghost", size: "icon" }),
          "relative rounded-full transition-colors",
          open && "bg-accent",
        )}
        aria-label={
          total ? `${total} items need attention` : "Nothing needs attention"
        }
      >
        <FiBell
          aria-hidden="true"
          className={cn(
            "size-[18px] transition-transform duration-200",
            total > 0 && "origin-top group-hover:rotate-12",
          )}
        />

        {total > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex">
            <span
              aria-hidden="true"
              className="absolute inline-flex size-full animate-ping rounded-full bg-destructive/50 motion-reduce:animate-none"
            />
            <span className="relative grid min-w-4 place-items-center rounded-full bg-destructive px-1 text-[10px] font-semibold leading-4 text-white ring-2 ring-background">
              {total > 99 ? "99+" : total}
            </span>
          </span>
        )}
      </PopoverTrigger>

      <PopoverContent
        align="end"
        sideOffset={8}
        className="w-[min(20rem,calc(100vw-1.5rem))] overflow-hidden p-0"
      >
        {/* Header */}
        <div className="flex items-center justify-between gap-3 border-b bg-muted/40 px-4 py-3">
          <div className="space-y-0.5">
            <p className="text-sm font-semibold leading-none">
              Needs attention
            </p>
            <p className="text-xs text-muted-foreground">
              {total > 0
                ? `${total} pending across ${pendingKinds} ${
                    pendingKinds === 1 ? "area" : "areas"
                  }`
                : "No pending items"}
            </p>
          </div>

          {total > 0 && (
            <span className="rounded-full bg-destructive/10 px-2 py-0.5 text-xs font-semibold text-destructive">
              {total > 99 ? "99+" : total}
            </span>
          )}
        </div>

        {/* Body */}
        {items.length ? (
          <ul className="max-h-80 divide-y overflow-y-auto p-1.5">
            {items.map((i) => {
              const Icon = ICONS[i.icon] ?? FiInbox;
              const tone = TONES[i.tone] ?? TONES.info;
              const pending = i.n > 0;

              return (
                <li key={i.href} className="py-0.5 first:pt-0 last:pb-0">
                  <Link
                    href={i.href}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "group flex items-center gap-3 rounded-lg px-2.5 py-2 text-sm outline-none transition-colors",
                      "hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring",
                      !pending && "opacity-60",
                    )}
                  >
                    <span
                      className={cn(
                        "grid size-9 shrink-0 place-items-center rounded-lg",
                        pending ? tone.tile : "bg-muted text-muted-foreground",
                      )}
                    >
                      <Icon aria-hidden="true" className="size-4" />
                    </span>

                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-medium">
                        {i.label}
                      </span>
                      {i.description ? (
                        <span className="block truncate text-xs text-muted-foreground">
                          {i.description}
                        </span>
                      ) : null}
                    </span>

                    <span
                      className={cn(
                        "grid min-w-6 place-items-center rounded-full px-1.5 py-0.5 text-xs font-semibold",
                        pending ? tone.badge : "bg-muted text-muted-foreground",
                      )}
                    >
                      {i.n > 99 ? "99+" : i.n}
                    </span>

                    <FiChevronRight
                      aria-hidden="true"
                      className="size-4 shrink-0 text-muted-foreground opacity-0 transition-all duration-200 group-hover:translate-x-0.5 group-hover:opacity-100 motion-reduce:transition-none"
                    />
                  </Link>
                </li>
              );
            })}
          </ul>
        ) : (
          <div className="flex flex-col items-center gap-2 px-6 py-8 text-center">
            <span className="grid size-12 place-items-center rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <FiCheckCircle aria-hidden="true" className="size-6" />
            </span>
            <p className="text-sm font-medium">You&apos;re all caught up</p>
            <p className="text-xs text-muted-foreground">
              New pending items will appear here.
            </p>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
