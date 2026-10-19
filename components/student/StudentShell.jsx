// components/student/StudentShell.jsx
"use client";

import { useEffect, useState } from "react";
import { MotionConfig, motion } from "framer-motion";
import { ChevronLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSidebar } from "./SidebarContext";

/* One CSS variable (--sb) holds the sidebar width. The grid column and the edge toggle both read it,
   so they always stay in sync and animate together.
   open:      15rem (lg) / 17rem (xl) / 18.5rem (2xl)
   collapsed: 4.75rem icon rail */

const FOCUS =
  "outline-none focus-visible:ring-2 focus-visible:ring-[#8B5CF6] focus-visible:ring-offset-2 focus-visible:ring-offset-background";

function Kbd({ children }) {
  return (
    <kbd className="inline-flex h-5 min-w-5 items-center justify-center rounded border border-border bg-background px-1 font-mono text-[10px] font-semibold text-muted-foreground">
      {children}
    </kbd>
  );
}

export function StudentShell({ sidebar, header, children }) {
  const { open, toggle } = useSidebar();
  const [isMac, setIsMac] = useState(false);

  // Client-only: keeps the first render identical on server and client
  useEffect(() => {
    const id = window.setTimeout(() => {
      try {
        setIsMac(/Mac|iPhone|iPad|iPod/i.test(navigator.platform || ""));
      } catch {
        // ignore
      }
    }, 0);
    return () => window.clearTimeout(id);
  }, []);

  const modKey = isMac ? "⌘" : "Ctrl";
  const label = open ? "Collapse sidebar" : "Expand sidebar";

  return (
    <MotionConfig reducedMotion="user">
      <div
        className={cn(
          "min-h-dvh bg-secondary/30 transition-[grid-template-columns] duration-300 ease-in-out motion-reduce:transition-none lg:grid lg:grid-cols-[var(--sb)_minmax(0,1fr)]",
          open
            ? "[--sb:15rem] xl:[--sb:17rem] 2xl:[--sb:18.5rem]"
            : "[--sb:4.75rem]",
        )}
      >
        {/* Skip link: first tab stop, jumps past the header and sidebar */}
        <a
          href="#main"
          className="sr-only rounded-xl bg-[#FACC15] px-4 py-2.5 text-sm font-bold text-[#111318] shadow-lg outline-none focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus-visible:ring-2 focus-visible:ring-[#8B5CF6] focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          Skip to main content
        </a>

        {/* Sidebar column: the sidebar fills it and sticks to the viewport */}
        <div className="min-w-0">{sidebar}</div>

        {/* Edge arrow toggle (desktop) */}
        <motion.button
          type="button"
          onClick={toggle}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.92 }}
          aria-label={label}
          aria-expanded={open}
          className={cn(
            "group fixed left-[calc(var(--sb)_-_1rem)] top-20 z-50 hidden size-8 cursor-pointer items-center justify-center rounded-full border border-border bg-background text-muted-foreground shadow-md transition-[left,color,background-color,border-color] duration-300 ease-in-out motion-reduce:transition-none hover:border-[#8B5CF6] hover:bg-[#8B5CF6] hover:text-white lg:flex",
            FOCUS,
          )}
        >
          <motion.span
            animate={{ rotate: open ? 0 : 180 }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
            className="inline-flex"
          >
            <ChevronLeft className="size-4" aria-hidden="true" />
          </motion.span>

          {/* Tooltip (decorative: the button already has an aria-label) */}
          <span
            aria-hidden="true"
            className="pointer-events-none absolute left-full ml-2.5 hidden items-center gap-2 whitespace-nowrap rounded-lg border border-border bg-popover px-2.5 py-1.5 text-[11px] font-medium text-popover-foreground opacity-0 shadow-lg transition-opacity duration-150 group-hover:opacity-100 group-focus-visible:opacity-100 xl:flex"
          >
            {label}
            <span className="flex items-center gap-1">
              <Kbd>{modKey}</Kbd>
              <Kbd>B</Kbd>
            </span>
          </span>
        </motion.button>

        {/* Main column */}
        <div className="flex min-w-0 flex-col overflow-x-clip">
          {header}
          <main
            id="main"
            tabIndex={-1}
            className="mx-auto w-full min-w-0 max-w-[1600px] flex-1 p-4 outline-none sm:p-6 lg:p-8"
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
    </MotionConfig>
  );
}
