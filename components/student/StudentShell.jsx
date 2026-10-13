"use client";

import { motion } from "framer-motion";
import { ChevronLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSidebar } from "./SidebarContext";

/* One CSS variable (--sb) holds the sidebar width. The grid column and the edge toggle both read it,
   so they always stay in sync and animate together.
   open:      15rem (lg) / 17rem (xl) / 18.5rem (2xl)
   collapsed: 4.75rem icon rail */
export function StudentShell({ sidebar, header, children }) {
  const { open, toggle } = useSidebar();

  return (
    <div
      className={cn(
        "min-h-dvh bg-secondary/30 transition-[grid-template-columns] duration-300 ease-in-out lg:grid lg:grid-cols-[var(--sb)_minmax(0,1fr)]",
        open
          ? "[--sb:15rem] xl:[--sb:17rem] 2xl:[--sb:18.5rem]"
          : "[--sb:4.75rem]",
      )}
    >
      {/* Sidebar column: the sidebar fills it and sticks to the viewport */}
      <div className="min-w-0">{sidebar}</div>

      {/* Edge arrow toggle (desktop) */}
      <motion.button
        type="button"
        onClick={toggle}
        whileHover={{ scale: 1.12 }}
        whileTap={{ scale: 0.92 }}
        aria-label={open ? "Collapse sidebar" : "Expand sidebar"}
        aria-expanded={open}
        title={open ? "Collapse sidebar (Ctrl+B)" : "Expand sidebar (Ctrl+B)"}
        className="group fixed left-[calc(var(--sb)_-_0.875rem)] top-20 z-50 hidden size-7 items-center justify-center rounded-full border bg-background text-muted-foreground shadow-md outline-none transition-[left,color,background-color,border-color] duration-300 ease-in-out hover:border-primary hover:bg-primary hover:text-primary-foreground focus-visible:ring-2 focus-visible:ring-ring lg:flex"
      >
        <motion.span
          animate={{ rotate: open ? 0 : 180 }}
          transition={{ type: "spring", stiffness: 260, damping: 20 }}
          className="inline-flex"
        >
          <ChevronLeft className="size-4" />
        </motion.span>
        <span className="pointer-events-none absolute left-full ml-2 hidden whitespace-nowrap rounded-md border bg-popover px-2 py-1 text-[11px] text-popover-foreground opacity-0 shadow transition-opacity group-hover:opacity-100 xl:block">
          Ctrl + B
        </span>
      </motion.button>

      {/* Main column */}
      <div className="flex min-w-0 flex-col overflow-x-clip">
        {header}
        <main
          id="main"
          className="mx-auto w-full min-w-0 max-w-[1600px] flex-1 p-4 sm:p-6 lg:p-8"
        >
          <div
            className={cn(
              // size: never wider than the column, may shrink inside the grid
              "w-full min-w-0 max-w-full",
              // scrolling: wide tables/code scroll sideways inside this box, not the whole page
              "overflow-auto overscroll-x-contain [scrollbar-width:thin]",
              // spacing between page sections grows with the screen
              "space-y-4 sm:space-y-6 lg:space-y-8",
              // text size
              "text-sm sm:text-[15px] lg:text-base",
              // safe defaults for content inside
              "[&_img]:h-auto [&_img]:max-w-full [&_table]:w-full [&_pre]:max-w-full [&_pre]:overflow-x-auto",
            )}
          >
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
