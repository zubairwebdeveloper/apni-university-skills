"use client";

import { useEffect, useState } from "react";

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
    <nav className="sticky top-24 hidden h-fit lg:block">
      <ul className="space-y-1 border-l">
        {items.map(({ id, label }) => (
          <li key={id}>
            <a
              href={`#${id}`}
              className={`-ml-px block border-l-2 py-1.5 pl-4 text-sm transition ${
                active === id
                  ? "border-primary font-medium text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              {label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
