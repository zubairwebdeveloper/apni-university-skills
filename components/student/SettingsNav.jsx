"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

const items = [
  { id: "email", label: "Email" },
  { id: "password", label: "Password" },
  { id: "notifications", label: "Notifications" },
  { id: "appearance", label: "Appearance" },
  { id: "sessions", label: "Sessions" },
  { id: "danger", label: "Delete account" },
];

export function SettingsNav() {
  const [active, setActive] = useState("email");

  useEffect(() => {
    if (!("IntersectionObserver" in window)) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.find((e) => e.isIntersecting);
        if (visible) setActive(visible.target.id);
      },
      { rootMargin: "-20% 0px -60% 0px" },
    );
    items.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  return (
    <nav
      aria-label="Settings sections"
      className="sticky top-24 hidden h-fit lg:block"
    >
      <p className="mb-3 pl-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        On this page
      </p>
      <ul className="space-y-0.5 border-l border-border">
        {items.map(({ id, label }) => {
          const on = active === id;
          const danger = id === "danger";
          return (
            <li key={id}>
              <a
                href={`#${id}`}
                onClick={() => setActive(id)}
                aria-current={on ? "true" : undefined}
                className={cn(
                  "-ml-px block rounded-r-md border-l-2 py-2 pl-4 pr-3 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none",
                  on
                    ? cn(
                        "bg-muted/60 font-medium",
                        danger
                          ? "border-destructive text-destructive"
                          : "border-primary text-primary",
                      )
                    : cn(
                        "border-transparent hover:bg-muted/40",
                        danger
                          ? "text-muted-foreground hover:text-destructive"
                          : "text-muted-foreground hover:text-foreground",
                      ),
                )}
              >
                {label}
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
