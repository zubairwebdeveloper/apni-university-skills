// components/admin/AdminFooterLinks.jsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FiExternalLink, FiHelpCircle } from "react-icons/fi";
import { ArrowUpRight } from "lucide-react";

import { LogoutButton } from "@/components/auth/LogoutButton";
import { cn } from "@/lib/utils";

function FooterLink({
  href,
  label,
  icon: Icon,
  collapsed,
  external = false,
  active = false,
}) {
  return (
    <Link
      href={href}
      target={external ? "_blank" : undefined}
      rel={external ? "noopener noreferrer" : undefined}
      aria-current={active ? "page" : undefined}
      className={cn(
        "group relative flex items-center gap-3 rounded-lg px-2 py-1.5 text-sm outline-none transition-colors",
        "hover:bg-accent hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring",
        active
          ? "bg-accent font-medium text-foreground"
          : "text-muted-foreground",
        collapsed && "justify-center px-0",
      )}
    >
      <span
        className={cn(
          "grid size-8 shrink-0 place-items-center rounded-md transition-colors",
          active
            ? "bg-primary/10 text-primary"
            : "bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary",
        )}
      >
        <Icon aria-hidden="true" className="size-4" />
      </span>

      <span className={cn("min-w-0 flex-1 truncate", collapsed && "sr-only")}>
        {label}
        {external ? (
          <span className="sr-only"> (opens in a new tab)</span>
        ) : null}
      </span>

      {external && !collapsed ? (
        <ArrowUpRight
          aria-hidden="true"
          className="size-3.5 shrink-0 opacity-50 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:opacity-100 motion-reduce:transition-none"
        />
      ) : null}

      {/* Collapsed sidebar ka tooltip */}
      {collapsed ? (
        <span
          aria-hidden="true"
          className="pointer-events-none absolute left-full top-1/2 z-50 ml-2 -translate-y-1/2 whitespace-nowrap rounded-md border bg-popover px-2 py-1 text-xs text-popover-foreground opacity-0 shadow-md transition-opacity duration-150 group-hover:opacity-100 group-focus-visible:opacity-100"
        >
          {label}
        </span>
      ) : null}
    </Link>
  );
}

export function AdminFooterLinks({ collapsed = false }) {
  const pathname = usePathname();

  return (
    <div className="space-y-1">
      <FooterLink
        href="/"
        label="View Website"
        icon={FiExternalLink}
        collapsed={collapsed}
        external
      />

      <FooterLink
        href="/faq"
        label="Help Center"
        icon={FiHelpCircle}
        collapsed={collapsed}
        active={pathname === "/faq"}
      />

      <div className="my-2 border-t" role="separator" />

      <LogoutButton className="w-full" compact={collapsed} />
    </div>
  );
}
