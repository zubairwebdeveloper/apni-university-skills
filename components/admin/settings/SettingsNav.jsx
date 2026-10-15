// components/admin/settings/SettingsNav.jsx
"use client";
import { useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
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
  const activeRef = useRef(null);
  const active = TABS.find((t) => isActive(t, path)) ?? TABS[0];

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
    <div className="mb-6 space-y-3">
      <nav
        aria-label="Settings"
        className="relative [mask-image:linear-gradient(to_right,transparent,black_12px,black_calc(100%-12px),transparent)] sm:[mask-image:none]"
      >
        <ul className="flex w-full gap-1 overflow-x-auto rounded-xl border bg-muted/60 p-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:w-fit">
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
                    "group relative flex items-center gap-2 whitespace-nowrap rounded-lg px-3.5 py-2 text-sm font-medium outline-none transition-all duration-200",
                    "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                    "motion-reduce:transition-none",
                    on
                      ? "bg-background text-foreground shadow-sm ring-1 ring-border"
                      : "text-muted-foreground hover:bg-background/60 hover:text-foreground",
                  )}
                >
                  <Icon
                    aria-hidden="true"
                    className={cn(
                      "size-4 transition-colors duration-200",
                      on
                        ? "text-primary"
                        : "text-muted-foreground group-hover:text-foreground",
                    )}
                  />
                  {tab.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Tells the admin what the current section controls */}
      <p className="text-sm text-muted-foreground" aria-live="polite">
        {active.hint}
      </p>
    </div>
  );
}
