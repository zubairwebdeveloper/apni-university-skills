// components/admin/AdminFooterLinks.jsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from "framer-motion";
import { FiExternalLink, FiHelpCircle } from "react-icons/fi";
import { ArrowUpRight } from "lucide-react";

import { LogoutButton } from "@/components/auth/LogoutButton";
import { cn } from "@/lib/utils";

const SPRING = { stiffness: 220, damping: 20, mass: 0.5 };

// Shared 3D tilt wrapper. The outer element is NOT transformed, so
// tooltips placed beside it never get clipped by the 3D context.
function Tilt({ children, tooltip, className }) {
  const reduce = useReducedMotion();
  const px = useMotionValue(0);
  const py = useMotionValue(0);
  const sx = useSpring(px, SPRING);
  const sy = useSpring(py, SPRING);
  const rotateY = useTransform(sx, [-0.5, 0.5], [-7, 7]);
  const rotateX = useTransform(sy, [-0.5, 0.5], [7, -7]);

  function onMove(e) {
    if (reduce) return;
    const r = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - r.left;
    const y = e.clientY - r.top;
    px.set(x / r.width - 0.5);
    py.set(y / r.height - 0.5);
    e.currentTarget.style.setProperty("--mx", `${x}px`);
    e.currentTarget.style.setProperty("--my", `${y}px`);
  }
  function onLeave() {
    px.set(0);
    py.set(0);
  }

  return (
    <div
      className={cn("group relative [perspective:500px]", className)}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
    >
      <motion.div
        style={reduce ? undefined : { rotateX, rotateY }}
        whileTap={reduce ? undefined : { scale: 0.97 }}
        className="relative rounded-lg [transform-style:preserve-3d]"
      >
        {children}
      </motion.div>

      {tooltip ? (
        <span
          aria-hidden="true"
          className="pointer-events-none absolute left-full top-1/2 z-50 ml-2 -translate-y-1/2 whitespace-nowrap rounded-md border bg-popover px-2 py-1 text-xs text-popover-foreground opacity-0 shadow-md transition-opacity duration-150 group-focus-within:opacity-100 group-hover:opacity-100"
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
    <Tilt tooltip={collapsed ? label : null}>
      <Link
        href={href}
        target={external ? "_blank" : undefined}
        rel={external ? "noopener noreferrer" : undefined}
        aria-current={active ? "page" : undefined}
        className={cn(
          "group/link relative flex items-center gap-3 overflow-hidden rounded-lg px-2 py-1.5 text-sm outline-none transition-colors",
          "hover:bg-accent hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring",
          active
            ? "bg-accent font-medium text-foreground"
            : "text-muted-foreground",
          collapsed && "justify-center px-0",
        )}
      >
        {/* Pointer spotlight */}
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-200 group-hover/link:opacity-100 motion-reduce:hidden"
          style={{
            background:
              "radial-gradient(90px circle at var(--mx, 50%) var(--my, 50%), color-mix(in oklab, var(--primary) 18%, transparent), transparent 70%)",
          }}
        />

        {/* Active indicator */}
        <span
          aria-hidden="true"
          className={cn(
            "absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 origin-center rounded-full bg-primary transition-transform duration-300 motion-reduce:transition-none",
            active ? "scale-y-100" : "scale-y-0",
          )}
        />

        {/* Icon tile: sits on its own depth layer */}
        <span
          className={cn(
            "relative grid size-8 shrink-0 place-items-center rounded-md shadow-sm ring-1 ring-inset ring-border/60 transition-colors [transform:translateZ(10px)]",
            active
              ? "bg-primary/10 text-primary"
              : "bg-muted text-muted-foreground group-hover/link:bg-primary/10 group-hover/link:text-primary",
          )}
        >
          <Icon aria-hidden="true" className="size-4" />
        </span>

        <span
          className={cn(
            "relative min-w-0 flex-1 truncate",
            collapsed && "sr-only",
          )}
        >
          {label}
          {external ? (
            <span className="sr-only"> (opens in a new tab)</span>
          ) : null}
        </span>

        {external && !collapsed ? (
          <ArrowUpRight
            aria-hidden="true"
            className="relative size-3.5 shrink-0 opacity-50 transition-transform duration-200 group-hover/link:-translate-y-0.5 group-hover/link:translate-x-0.5 group-hover/link:opacity-100 motion-reduce:transition-none"
          />
        ) : null}
      </Link>
    </Tilt>
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

      <Tilt>
        <LogoutButton className="w-full" compact={collapsed} />
      </Tilt>
    </div>
  );
}
