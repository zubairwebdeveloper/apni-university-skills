// components/admin/settings/SettingsNav.jsx
"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
const TABS = [
  ["Overview", "/admin/settings"],
  ["General", "/admin/settings/general"],
  ["Security", "/admin/settings/security"],
  ["Notifications", "/admin/settings/notifications"],
];
export function SettingsNav() {
  const path = usePathname();
  return (
    <nav
      aria-label="Settings"
      className="mb-6 flex gap-1 overflow-x-auto border-b"
    >
      {TABS.map(([l, h]) => (
        <Link
          key={h}
          href={h}
          aria-current={path === h ? "page" : undefined}
          className={cn(
            "whitespace-nowrap border-b-2 border-transparent px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground",
            path === h && "border-primary text-foreground",
          )}
        >
          {l}
        </Link>
      ))}
    </nav>
  );
}

