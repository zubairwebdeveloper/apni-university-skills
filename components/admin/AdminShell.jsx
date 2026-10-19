// components/admin/AdminShell.jsx
"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { usePathname } from "next/navigation";
import { ArrowUp } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { AdminSidebar } from "./AdminSidebar";

const SIDEBAR_KEY = "admin:sidebar";
const sidebarListeners = new Set();

const focusRing =
  "outline-none focus-visible:ring-2 focus-visible:ring-yellow-400/70 focus-visible:ring-offset-2 focus-visible:ring-offset-background";

function getSidebarSnapshot() {
  try {
    return localStorage.getItem(SIDEBAR_KEY) === "1";
  } catch {
    return false;
  }
}

function subscribeToSidebar(callback) {
  sidebarListeners.add(callback);
  const onStorage = (event) => {
    if (event.key === SIDEBAR_KEY) callback();
  };
  window.addEventListener("storage", onStorage);
  return () => {
    sidebarListeners.delete(callback);
    window.removeEventListener("storage", onStorage);
  };
}

function saveSidebarSnapshot(collapsed) {
  try {
    localStorage.setItem(SIDEBAR_KEY, collapsed ? "1" : "0");
  } catch {}
  sidebarListeners.forEach((listener) => listener());
}

function isEditable(target) {
  if (!(target instanceof HTMLElement)) return false;
  return (
    target.isContentEditable ||
    ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName)
  );
}

export function AdminShell({ header, permissions, children }) {
  const pathname = usePathname();
  const [showTop, setShowTop] = useState(false);

  const collapsed = useSyncExternalStore(
    subscribeToSidebar,
    getSidebarSnapshot,
    () => false,
  );

  const toggle = () => saveSidebarSnapshot(!getSidebarSnapshot());

  // Ctrl/⌘ + B toggles the sidebar (ignored while typing in a field).
  useEffect(() => {
    const onKey = (e) => {
      if (!(e.metaKey || e.ctrlKey) || e.key.toLowerCase() !== "b") return;
      if (isEditable(e.target)) return;
      e.preventDefault();
      saveSidebarSnapshot(!getSidebarSnapshot());
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Show the "Back to top" button after scrolling down a bit.
  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 600);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const skipToMain = (e) => {
    e.preventDefault();
    const main = document.getElementById("main");
    main?.focus();
    main?.scrollIntoView({ block: "start" });
  };

  const backToTop = () => {
    const reduce = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
  };

  return (
    <div className="flex min-h-dvh bg-secondary/30">
      <a
        href="#main"
        onClick={skipToMain}
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-yellow-400 focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-gray-900 focus:shadow-md focus:outline-none focus:ring-2 focus:ring-yellow-400/70 focus:ring-offset-2 focus:ring-offset-background"
      >
        Skip to content
      </a>

      <AdminSidebar
        permissions={permissions}
        collapsed={collapsed}
        onToggle={toggle}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        {header}

        <main
          id="main"
          tabIndex={-1}
          className="mx-auto w-full max-w-[1600px] flex-1 p-4 outline-none sm:p-6 lg:p-8"
        >
          {/* key = pathname, so the fade-in replays on every page change */}
          <div
            key={pathname}
            className="animate-in fade-in slide-in-from-bottom-1 duration-300 motion-reduce:animate-none"
          >
            {children}
          </div>
        </main>
      </div>

      <Button
        type="button"
        size="icon"
        variant="outline"
        aria-label="Back to top"
        tabIndex={showTop ? 0 : -1}
        aria-hidden={!showTop}
        onClick={backToTop}
        className={cn(
          "fixed bottom-4 right-4 z-30 size-10 rounded-full border-border bg-background/95 text-muted-foreground shadow-md backdrop-blur",
          "transition-[transform,opacity,background-color,color] duration-200 hover:bg-muted hover:text-foreground",
          "active:scale-95 motion-reduce:transition-none motion-reduce:active:scale-100",
          "sm:bottom-6 sm:right-6",
          focusRing,
          showTop
            ? "translate-y-0 opacity-100"
            : "pointer-events-none translate-y-2 opacity-0",
        )}
      >
        <ArrowUp aria-hidden="true" className="size-4" />
      </Button>
    </div>
  );
}
