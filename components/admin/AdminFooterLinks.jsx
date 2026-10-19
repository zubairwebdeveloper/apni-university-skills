// components/admin/AdminFooterLinks.jsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FiExternalLink, FiHelpCircle } from "react-icons/fi";
import { ArrowUpRight } from "lucide-react";

import { LogoutButton } from "@/components/auth/LogoutButton";
import { cn } from "@/lib/utils";

const focusRing =
  "outline-none focus-visible:ring-2 focus-visible:ring-yellow-400/70 focus-visible:ring-offset-2 focus-visible:ring-offset-background";

// Wrapper that shows a CSS tooltip beside the item (used when the sidebar is
// collapsed and the label is hidden). No transforms, so the tooltip is never
// clipped by a 3D context.
function WithTooltip({ children, tooltip, className }) {
  return (
    <div className={cn("group relative", className)}>
      {children}

      {tooltip ? (
        <span
          aria-hidden="true"
          className="pointer-events-none absolute left-full top-1/2 z-50 ml-2 -translate-y-1/2 whitespace-nowrap rounded-md border border-border bg-popover px-2 py-1 text-xs font-medium text-popover-foreground opacity-0 shadow-md transition-opacity duration-150 group-focus-within:opacity-100 group-hover:opacity-100 motion-reduce:transition-none"
        >
          {tooltip}
        </span>
      ) : null}
    </div>
  );
}

function FooterLink({
  href,
  label,
  icon: Icon,
  collapsed,
  external = false,
  active = false,
}) {
  return (
    <WithTooltip tooltip={collapsed ? label : null}>
      <Link
        href={href}
        target={external ? "_blank" : undefined}
        rel={external ? "noopener noreferrer" : undefined}
        aria-current={active ? "page" : undefined}
        className={cn(
          "group/link relative flex items-center gap-3 rounded-lg px-2 py-1.5 text-sm transition-colors motion-reduce:transition-none",
          "hover:bg-muted/60 hover:text-foreground",
          focusRing,
          active
            ? "bg-muted font-medium text-foreground"
            : "text-muted-foreground",
          collapsed && "justify-center px-0",
        )}
      >
        {/* Active indicator */}
        <span
          aria-hidden="true"
          className={cn(
            "absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 origin-center rounded-full bg-yellow-400 transition-transform duration-300 motion-reduce:transition-none",
            active ? "scale-y-100" : "scale-y-0",
          )}
        />

        {/* Icon tile */}
        <span
          aria-hidden="true"
          className={cn(
            "grid size-8 shrink-0 place-items-center rounded-md border transition-colors motion-reduce:transition-none",
            active
              ? "border-violet-500/25 bg-violet-500/10 text-violet-600 dark:text-violet-300"
              : "border-border bg-muted/50 text-muted-foreground group-hover/link:border-violet-500/25 group-hover/link:bg-violet-500/10 group-hover/link:text-violet-600 dark:group-hover/link:text-violet-300",
          )}
        >
          <Icon className="size-4" />
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
            className="size-3.5 shrink-0 opacity-50 transition-all duration-200 group-hover/link:-translate-y-0.5 group-hover/link:translate-x-0.5 group-hover/link:opacity-100 motion-reduce:transition-none motion-reduce:group-hover/link:translate-x-0 motion-reduce:group-hover/link:translate-y-0"
          />
        ) : null}
      </Link>
    </WithTooltip>
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

      <div className="my-2 border-t border-border" role="separator" />

      <LogoutButton className="w-full" compact={collapsed} />
    </div>
  );
}
