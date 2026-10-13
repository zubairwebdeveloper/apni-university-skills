// components/admin/AdminSidebar.jsx
"use client";

import {
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from "framer-motion";
import { FiChevronsLeft, FiChevronsRight } from "react-icons/fi";

import { Button } from "@/components/ui/button";
import { AdminNav } from "./AdminNav";
import { AdminFooterLinks } from "./AdminFooterLinks";
import { cn } from "@/lib/utils";

const SPRING = { stiffness: 220, damping: 18, mass: 0.6 };

function BrandTile({ reduce }) {
  const px = useMotionValue(0); // -0.5 .. 0.5
  const py = useMotionValue(0);
  const sx = useSpring(px, SPRING);
  const sy = useSpring(py, SPRING);
  const rotateY = useTransform(sx, [-0.5, 0.5], [-18, 18]);
  const rotateX = useTransform(sy, [-0.5, 0.5], [18, -18]);

  function onMove(e) {
    if (reduce) return;
    const r = e.currentTarget.getBoundingClientRect();
    px.set((e.clientX - r.left) / r.width - 0.5);
    py.set((e.clientY - r.top) / r.height - 0.5);
  }
  function onLeave() {
    px.set(0);
    py.set(0);
  }

  return (
    <div
      className="relative [perspective:600px]"
      onPointerMove={onMove}
      onPointerLeave={onLeave}
    >
      {/* depth shadow */}
      <div
        aria-hidden="true"
        className="absolute inset-0 translate-y-1.5 rounded-xl bg-primary/30 blur-md"
      />
      <motion.div
        style={reduce ? undefined : { rotateX, rotateY }}
        className="relative flex size-10 items-center justify-center rounded-xl bg-primary font-serif text-lg font-bold text-primary-foreground shadow-lg ring-1 ring-inset ring-white/20 [transform-style:preserve-3d]"
      >
        <span aria-hidden="true" className="[transform:translateZ(14px)]">
          A
        </span>
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 rounded-xl bg-gradient-to-br from-white/25 via-transparent to-black/10"
        />
      </motion.div>
    </div>
  );
}

export function AdminSidebar({ permissions, collapsed, onToggle }) {
  const reduce = useReducedMotion();

  // Spotlight follows the pointer (position relative to the sidebar)
  const mx = useMotionValue(-200);
  const my = useMotionValue(-200);
  const gx = useSpring(mx, { stiffness: 120, damping: 20 });
  const gy = useSpring(my, { stiffness: 120, damping: 20 });

  function onPointerMove(e) {
    if (reduce) return;
    const r = e.currentTarget.getBoundingClientRect();
    mx.set(e.clientX - r.left - 96);
    my.set(e.clientY - r.top - 96);
  }

  return (
    <motion.aside
      initial={false}
      animate={{ width: collapsed ? 72 : 264 }}
      transition={
        reduce ? { duration: 0 } : { duration: 0.25, ease: [0.22, 1, 0.36, 1] }
      }
      onPointerMove={onPointerMove}
      // No overflow-hidden here: collapsed tooltips must extend past the edge.
      className="sticky top-0 z-40 hidden h-dvh shrink-0 flex-col border-r bg-background shadow-[4px_0_24px_-12px_rgba(0,0,0,0.18)] lg:flex"
    >
      {/* Ambient layer: clipped on its own so tooltips are not affected */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 overflow-hidden"
      >
        {!reduce && (
          <motion.div
            style={{ x: gx, y: gy }}
            className="absolute size-48 rounded-full bg-primary/15 blur-2xl"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-primary/[0.06] via-transparent to-transparent" />
      </div>

      {/* Animated edge line */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 -right-px w-px overflow-hidden"
      >
        <div
          className={cn(
            "h-1/3 w-full bg-gradient-to-b from-transparent via-primary to-transparent",
            !reduce && "animate-[sidebar-edge_5s_linear_infinite]",
          )}
        />
      </div>

      {/* Brand + toggle */}
      <div
        className={cn(
          "relative flex h-16 shrink-0 items-center gap-3 border-b px-3",
          collapsed ? "justify-center" : "justify-between",
        )}
      >
        <div className="flex min-w-0 items-center gap-3">
          <BrandTile reduce={reduce} />
          {collapsed ? (
            <span className="sr-only">Apni University admin</span>
          ) : (
            <div className="min-w-0 leading-tight">
              <p className="truncate text-sm font-semibold tracking-tight">
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
            className="group size-8 shrink-0 rounded-full"
            onClick={onToggle}
            title="Collapse sidebar (Ctrl/⌘ + B)"
            aria-label="Collapse sidebar"
            aria-expanded={true}
            aria-keyshortcuts="Control+B Meta+B"
          >
            <FiChevronsLeft
              aria-hidden="true"
              className="transition-transform duration-200 group-hover:-translate-x-0.5 motion-reduce:transition-none"
            />
          </Button>
        )}
      </div>

      {/* When collapsed the expand button sits under the tile */}
      {collapsed && (
        <div className="relative flex justify-center border-b py-2">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="group size-8 rounded-full"
            onClick={onToggle}
            title="Expand sidebar (Ctrl/⌘ + B)"
            aria-label="Expand sidebar"
            aria-expanded={false}
            aria-keyshortcuts="Control+B Meta+B"
          >
            <FiChevronsRight
              aria-hidden="true"
              className="transition-transform duration-200 group-hover:translate-x-0.5 motion-reduce:transition-none"
            />
          </Button>
        </div>
      )}

      {/* Navigation */}
      <nav
        aria-label="Admin navigation"
        className={cn(
          "relative min-h-0 flex-1 overscroll-contain p-3",
          collapsed ? "overflow-visible" : "overflow-y-auto",
        )}
      >
        <AdminNav permissions={permissions} collapsed={collapsed} />
      </nav>

      {/* Footer */}
      <div className="relative space-y-2 border-t bg-muted/30 p-3">
        {!collapsed && (
          <p className="flex items-center justify-between rounded-md border bg-background/60 px-2.5 py-1.5 text-xs text-muted-foreground">
            Toggle sidebar
            <kbd className="rounded border bg-muted px-1.5 font-mono text-[10px] text-foreground">
              Ctrl B
            </kbd>
          </p>
        )}
        <AdminFooterLinks collapsed={collapsed} />
      </div>
    </motion.aside>
  );
}
