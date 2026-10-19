// components/admin/AdminSidebar.jsx
"use client";

import { motion, useReducedMotion } from "framer-motion";
import { FiChevronsLeft, FiChevronsRight } from "react-icons/fi";

import { Button } from "@/components/ui/button";
import { AdminNav } from "./AdminNav";
import { AdminFooterLinks } from "./AdminFooterLinks";
import { cn } from "@/lib/utils";

const focusRing =
  "outline-none focus-visible:ring-2 focus-visible:ring-yellow-400/70 focus-visible:ring-offset-2 focus-visible:ring-offset-background";

// Solid brand mark in the yellow accent
function BrandTile() {
  return (
    <span
      aria-hidden="true"
      className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-yellow-400 font-serif text-lg font-bold text-gray-900 shadow-sm"
    >
      A
    </span>
  );
}

export function AdminSidebar({ permissions, collapsed, onToggle }) {
  const reduce = useReducedMotion();

  return (
    <motion.aside
      initial={false}
      animate={{ width: collapsed ? 72 : 264 }}
      transition={
        reduce ? { duration: 0 } : { duration: 0.25, ease: [0.22, 1, 0.36, 1] }
      }
      // No overflow-hidden here: collapsed tooltips must extend past the edge.
      className="sticky top-0 z-40 hidden h-dvh shrink-0 flex-col border-r border-border bg-background lg:flex"
    >
      {/* Brand + toggle */}
      <div
        className={cn(
          "flex h-16 shrink-0 items-center gap-3 border-b border-border px-3",
          collapsed ? "justify-center" : "justify-between",
        )}
      >
        <div className="flex min-w-0 items-center gap-3">
          <BrandTile />
          {collapsed ? (
            <span className="sr-only">Apni University admin</span>
          ) : (
            <div className="min-w-0 leading-tight">
              <p className="truncate text-sm font-semibold tracking-tight text-foreground">
                Apni University
              </p>
              <p className="truncate text-xs text-muted-foreground">
                Admin Dashboard
              </p>
            </div>
          )}
        </div>

        {!collapsed && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className={cn(
              "group size-8 shrink-0 rounded-full text-muted-foreground hover:bg-muted/60 hover:text-foreground",
              "transition-[transform,background-color,color] active:scale-95 motion-reduce:transition-none motion-reduce:active:scale-100",
              focusRing,
            )}
            onClick={onToggle}
            title="Collapse sidebar (Ctrl/⌘ + B)"
            aria-label="Collapse sidebar"
            aria-expanded={true}
            aria-keyshortcuts="Control+B Meta+B"
          >
            <FiChevronsLeft
              aria-hidden="true"
              className="size-4 transition-transform duration-200 group-hover:-translate-x-0.5 motion-reduce:transition-none motion-reduce:group-hover:translate-x-0"
            />
          </Button>
        )}
      </div>

      {/* When collapsed the expand button sits under the tile */}
      {collapsed && (
        <div className="flex justify-center border-b border-border py-2">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className={cn(
              "group size-8 rounded-full text-muted-foreground hover:bg-muted/60 hover:text-foreground",
              "transition-[transform,background-color,color] active:scale-95 motion-reduce:transition-none motion-reduce:active:scale-100",
              focusRing,
            )}
            onClick={onToggle}
            title="Expand sidebar (Ctrl/⌘ + B)"
            aria-label="Expand sidebar"
            aria-expanded={false}
            aria-keyshortcuts="Control+B Meta+B"
          >
            <FiChevronsRight
              aria-hidden="true"
              className="size-4 transition-transform duration-200 group-hover:translate-x-0.5 motion-reduce:transition-none motion-reduce:group-hover:translate-x-0"
            />
          </Button>
        </div>
      )}

      {/* Navigation */}
      <nav
        aria-label="Admin navigation"
        className={cn(
          "min-h-0 flex-1 overscroll-contain p-3",
          collapsed ? "overflow-visible" : "overflow-y-auto",
        )}
      >
        <AdminNav permissions={permissions} collapsed={collapsed} />
      </nav>

      {/* Footer */}
      <div className="space-y-2 border-t border-border bg-muted/30 p-3">
        {!collapsed && (
          <p className="flex items-center justify-between rounded-md border border-border bg-background/60 px-2.5 py-1.5 text-xs text-muted-foreground">
            Toggle sidebar
            <kbd className="rounded border border-border bg-muted px-1.5 font-mono text-[10px] text-foreground">
              Ctrl B
            </kbd>
          </p>
        )}
        <AdminFooterLinks collapsed={collapsed} />
      </div>
    </motion.aside>
  );
}
