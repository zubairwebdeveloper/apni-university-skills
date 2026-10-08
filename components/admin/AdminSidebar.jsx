// components/admin/AdminSidebar.jsx
"use client";

import { motion, useReducedMotion } from "framer-motion";
import { FiChevronsLeft, FiChevronsRight } from "react-icons/fi";

import { Button } from "@/components/ui/button";
import { Logo } from "@/components/layout/Logo";
import { AdminNav } from "./AdminNav";
import { AdminFooterLinks } from "./AdminFooterLinks";
import { cn } from "@/lib/utils";

export function AdminSidebar({ permissions, collapsed, onToggle }) {
  const reduce = useReducedMotion();

  return (
    <motion.aside
      initial={false}
      animate={{ width: collapsed ? 72 : 264 }}
      transition={
        reduce ? { duration: 0 } : { duration: 0.2, ease: [0.22, 1, 0.36, 1] }
      }
      // No overflow-hidden here: collapsed tooltips must be able to
      // extend past the sidebar edge. z-40 keeps them above the sticky header (z-30).
      className="sticky top-0 z-40 hidden h-dvh shrink-0 flex-col border-r bg-background lg:flex"
    >
      {/* Brand + toggle */}
      <div
        className={cn(
          "relative flex h-16 shrink-0 items-center gap-2 border-b px-3",
          collapsed ? "justify-center" : "justify-between",
        )}
      >
        {/* Soft brand glow, visible only when expanded */}
        {!collapsed ? (
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-gradient-to-r from-primary/10 via-transparent to-transparent"
          />
        ) : null}

        {collapsed ? (
          <span className="sr-only">Apni University admin</span>
        ) : (
          <div className="relative min-w-0 font-bold text-blue-600 flex-1 overflow-hidden">
            Admin Dashboard
          </div>
        )}

        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="group relative size-8 shrink-0 rounded-full"
          onClick={onToggle}
          title={`${collapsed ? "Expand" : "Collapse"} sidebar (Ctrl/⌘ + B)`}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          aria-expanded={!collapsed}
          aria-keyshortcuts="Control+B Meta+B"
        >
          {collapsed ? (
            <FiChevronsRight
              aria-hidden="true"
              className="transition-transform duration-200 group-hover:translate-x-0.5 motion-reduce:transition-none"
            />
          ) : (
            <FiChevronsLeft
              aria-hidden="true"
              className="transition-transform duration-200 group-hover:-translate-x-0.5 motion-reduce:transition-none"
            />
          )}
        </Button>
      </div>

      {/* Navigation */}
      <nav
        aria-label="Admin navigation"
        className={cn(
          "min-h-0 flex-1 overscroll-contain p-3",
          // Collapsed: no clipping so the tooltips can show.
          // Expanded: scroll when the list is long.
          collapsed ? "overflow-visible" : "overflow-y-auto",
        )}
      >
        <AdminNav permissions={permissions} collapsed={collapsed} />
      </nav>

      {/* Footer */}
      <div className="border-t bg-muted/30 p-3">
        <AdminFooterLinks collapsed={collapsed} />
      </div>
    </motion.aside>
  );
}
