"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

const COOKIE = "student-sidebar";
const SidebarContext = createContext(null);

export function SidebarProvider({ defaultOpen = true, children }) {
  const [open, setOpen] = useState(defaultOpen);

  const toggle = useCallback(() => setOpen((o) => !o), []);

  // Persist state so the server can render the right layout on refresh
  useEffect(() => {
    document.cookie = `${COOKIE}=${open ? 1 : 0}; path=/; max-age=31536000; SameSite=Lax`;
  }, [open]);

  // Ctrl/Cmd + B shortcut (desktop only)
  useEffect(() => {
    const onKey = (e) => {
      if (!(e.ctrlKey || e.metaKey) || e.shiftKey || e.altKey) return;
      if (e.key.toLowerCase() !== "b") return;
      if (window.innerWidth < 1024) return;
      if (e.target instanceof HTMLElement && e.target.isContentEditable) return;
      e.preventDefault();
      toggle();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [toggle]);

  const value = useMemo(() => ({ open, setOpen, toggle }), [open, toggle]);

  return (
    <SidebarContext.Provider value={value}>{children}</SidebarContext.Provider>
  );
}

export function useSidebar() {
  const ctx = useContext(SidebarContext);
  if (!ctx) throw new Error("useSidebar must be used inside <SidebarProvider>");
  return ctx;
}
