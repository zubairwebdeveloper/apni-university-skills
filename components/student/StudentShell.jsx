"use client";

import { motion } from "framer-motion";
import { ChevronLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSidebar } from "./SidebarContext";

export function StudentShell({ sidebar, header, children }) {
  const { open, toggle } = useSidebar();

  return (
    <div
      style={{
        gridTemplateColumns: open
          ? "16rem minmax(0,1fr)"
          : "0rem minmax(0,1fr)",
      }}
      className="min-h-dvh bg-secondary/30 transition-[grid-template-columns] duration-300 ease-in-out lg:grid"
    >
      {/* Sidebar column */}
      <aside
        aria-hidden={!open}
        className={cn(
          "hidden min-w-0 overflow-hidden transition-[visibility] duration-300 lg:block",
          open ? "visible" : "invisible",
        )}
      >
        <div className="sticky top-0 h-dvh w-64">{sidebar}</div>
      </aside>

      {/* Edge arrow toggle (desktop) */}
      <motion.button
        type="button"
        onClick={toggle}
        whileHover={{ scale: 1.12 }}
        whileTap={{ scale: 0.92 }}
        aria-label={open ? "Close sidebar" : "Open sidebar"}
        aria-expanded={open}
        title={open ? "Close sidebar (Ctrl+B)" : "Open sidebar (Ctrl+B)"}
        style={{ left: open ? "calc(16rem - 0.875rem)" : "0.5rem" }}
        className="group fixed top-20 z-40 hidden size-7 items-center justify-center rounded-full border bg-background text-muted-foreground shadow-md outline-none transition-[left,color,background-color,border-color] duration-300 ease-in-out hover:border-primary hover:bg-primary hover:text-primary-foreground focus-visible:ring-2 focus-visible:ring-ring lg:flex"
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
      <div className="flex min-w-0 flex-col">
        {header}
        <main id="main" className="flex-1 p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
