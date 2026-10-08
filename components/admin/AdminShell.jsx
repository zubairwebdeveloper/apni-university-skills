// components/admin/AdminShell.jsx
"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { usePathname } from "next/navigation";
import { ArrowUp } from "lucide-react";

import { Button } from "@/components/ui/button";
import { AdminSidebar } from "./AdminSidebar";

const SIDEBAR_KEY = "admin:sidebar";
const sidebarListeners = new Set();

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

  return (
    <div className="flex min-h-dvh bg-secondary/30">
      <a
        href="#main"
        onClick={skipToMain}
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background"
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
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        className={`fixed bottom-4 right-4 z-30 rounded-full bg-background/90 shadow-md backdrop-blur transition-all duration-200 motion-reduce:transition-none sm:bottom-6 sm:right-6 ${
          showTop
            ? "translate-y-0 opacity-100"
            : "pointer-events-none translate-y-2 opacity-0"
        }`}
      >
        <ArrowUp aria-hidden="true" className="size-4" />
      </Button>
    </div>
  );
}
