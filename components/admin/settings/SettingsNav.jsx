// components/admin/settings/SettingsNav.jsx
"use client";
import { useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
import { FiBell, FiGrid, FiShield, FiSliders } from "react-icons/fi";
import { cn } from "@/lib/utils";

const TABS = [
  {
    label: "Overview",
    href: "/admin/settings",
    icon: FiGrid,
    hint: "A summary of every settings area.",
    exact: true,
  },
  {
    label: "General",
    href: "/admin/settings/general",
    icon: FiSliders,
    hint: "Site name, logo, contact details, social links and SEO.",
  },
  {
    label: "Security",
    href: "/admin/settings/security",
    icon: FiShield,
    hint: "How long students and staff stay signed in.",
  },
  {
    label: "Notifications",
    href: "/admin/settings/notifications",
    icon: FiBell,
    hint: "Which emails the platform sends, and admin alerts.",
  },
];

function isActive(tab, path) {
  if (!path) return false;
  if (tab.exact) return path === tab.href || path === `${tab.href}/`;
  return path === tab.href || path.startsWith(`${tab.href}/`);
}

export function SettingsNav() {
  const path = usePathname();
  const reduceMotion = useReducedMotion();
  const activeRef = useRef(null);
  const active = TABS.find((t) => isActive(t, path)) ?? TABS[0];
  const ActiveIcon = active.icon;

  // On small screens the tab row scrolls sideways; keep the current tab visible.
  useEffect(() => {
    const el = activeRef.current;
    if (!el) return;
    const reduce = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    el.scrollIntoView({
      behavior: reduce ? "auto" : "smooth",
      inline: "center",
      block: "nearest",
    });
  }, [path]);

  return (
    <div className="mb-6 space-y-4">
      <nav
        aria-label="Settings"
        className="relative [mask-image:linear-gradient(to_right,transparent,black_12px,black_calc(100%-12px),transparent)] sm:[mask-image:none]"
      >
        <ul className="flex w-full gap-1 overflow-x-auto rounded-xl border border-border bg-muted/60 p-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:w-fit">
          {TABS.map((tab) => {
            const on = tab === active;
            const Icon = tab.icon;
            return (
              <li key={tab.href} className="shrink-0">
                <Link
                  ref={on ? activeRef : undefined}
                  href={tab.href}
                  title={tab.hint}
                  aria-current={on ? "page" : undefined}
                  className={cn(
                    "group relative flex items-center gap-2 whitespace-nowrap rounded-lg px-3.5 py-2 text-sm font-medium outline-none transition-colors duration-200",
                    "focus-visible:ring-2 focus-visible:ring-yellow-400/70 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                    "motion-reduce:transition-none",
                    on
                      ? "text-foreground"
                      : "text-muted-foreground hover:bg-background/60 hover:text-foreground",
                  )}
                >
                  {on && (
                    <motion.span
                      layoutId="settings-nav-active"
                      aria-hidden="true"
                      transition={
                        reduceMotion
                          ? { duration: 0 }
                          : { type: "spring", stiffness: 500, damping: 40 }
                      }
                      className="absolute inset-0 rounded-lg bg-background shadow-sm ring-1 ring-border"
                    >
                      <span className="absolute inset-x-3 bottom-0 h-0.5 rounded-full bg-yellow-400" />
                    </motion.span>
                  )}
                  <Icon
                    aria-hidden="true"
                    className={cn(
                      "relative size-4 transition-colors duration-200 motion-reduce:transition-none",
                      on
                        ? "text-violet-600 dark:text-violet-300"
                        : "text-muted-foreground group-hover:text-foreground",
                    )}
                  />
                  <span className="relative">{tab.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Tells the admin what the current section controls */}
      <div
        aria-live="polite"
        className="flex items-start gap-3 rounded-lg border border-border bg-muted/30 px-3.5 py-3"
      >
        <span
          aria-hidden="true"
          className="flex size-8 shrink-0 items-center justify-center rounded-lg border border-violet-500/20 bg-violet-500/10 text-violet-600 dark:text-violet-300"
        >
          <ActiveIcon className="size-4" />
        </span>
        <motion.div
          key={active.href}
          initial={reduceMotion ? false : { opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="min-w-0"
        >
          <p className="text-sm font-medium leading-5 text-foreground">
            {active.label}
          </p>
          <p className="text-sm leading-5 text-muted-foreground">
            {active.hint}
          </p>
        </motion.div>
      </div>
    </div>
  );
}
