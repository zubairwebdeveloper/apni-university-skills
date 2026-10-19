// components/admin/AdminMobileNav.jsx
"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { LayoutDashboard } from "lucide-react";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { buttonVariants } from "@/components/ui/button";
import { AdminNav } from "./AdminNav";
import { AdminFooterLinks } from "./AdminFooterLinks";
import { cn } from "@/lib/utils";

const enter =
  "animate-in fade-in slide-in-from-left-3 fill-mode-both duration-300 motion-reduce:animate-none";

const focusRing =
  "outline-none focus-visible:ring-2 focus-visible:ring-yellow-400/70 focus-visible:ring-offset-2 focus-visible:ring-offset-background";

// Teen lines jo "X" ban jati hain
function MenuIcon({ open }) {
  const line =
    "absolute left-0 h-0.5 w-full rounded-full bg-current transition-all duration-300 motion-reduce:transition-none";
  return (
    <span aria-hidden="true" className="relative block h-3.5 w-5">
      <span
        className={cn(
          line,
          open ? "top-1/2 -translate-y-1/2 rotate-45" : "top-0",
        )}
      />
      <span
        className={cn(
          line,
          "top-1/2 -translate-y-1/2",
          open && "scale-x-0 opacity-0",
        )}
      />
      <span
        className={cn(
          line,
          open ? "top-1/2 -translate-y-1/2 -rotate-45" : "bottom-0",
        )}
      />
    </span>
  );
}

// Solid brand mark in the yellow accent
function BrandTile() {
  return (
    <span
      aria-hidden="true"
      className="grid size-11 shrink-0 place-items-center rounded-xl bg-yellow-400 text-gray-900 shadow-sm"
    >
      <LayoutDashboard className="size-5" />
    </span>
  );
}

export function AdminMobileNav({ permissions }) {
  const pathname = usePathname();
  const [openPathname, setOpenPathname] = useState(null);
  const open = openPathname === pathname;
  const setOpen = (nextOpen) => setOpenPathname(nextOpen ? pathname : null);

  // Swipe left to close
  const touch = useRef(null);
  function onTouchStart(e) {
    const t = e.touches[0];
    touch.current = { x: t.clientX, y: t.clientY };
  }
  function onTouchEnd(e) {
    const start = touch.current;
    touch.current = null;
    if (!start) return;
    const t = e.changedTouches[0];
    const dx = t.clientX - start.x;
    const dy = Math.abs(t.clientY - start.y);
    if (dx < -70 && dy < 40) setOpen(false);
  }

  // Desktop size par sidebar pehle se nazar aata hai, to menu band kar den
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const onChange = (e) => {
      if (e.matches) setOpenPathname(null);
    };
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        className={cn(
          buttonVariants({ variant: "ghost", size: "icon" }),
          "size-10 rounded-full border border-border lg:hidden",
          "transition-[transform,background-color] duration-100 hover:bg-muted/60",
          "active:scale-[0.96] motion-reduce:transition-none motion-reduce:active:scale-100",
          focusRing,
          open && "bg-accent",
        )}
        aria-label={open ? "Close admin menu" : "Open admin menu"}
      >
        <MenuIcon open={open} />
      </SheetTrigger>

      <SheetContent
        side="left"
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
        className="w-[85vw] max-w-xs gap-0 overflow-hidden p-0"
      >
        {/* Header */}
        <SheetHeader className="border-b border-border bg-muted/30 p-4 text-left">
          <div className="flex items-center gap-3">
            <BrandTile />
            <div className="min-w-0 space-y-1">
              <SheetTitle className="truncate text-base font-semibold leading-none tracking-tight text-foreground">
                Apni University
              </SheetTitle>
              <SheetDescription className="inline-flex items-center rounded-full border border-violet-500/25 bg-violet-500/10 px-2 py-0.5 text-[11px] font-medium leading-4 text-violet-700 dark:text-violet-300">
                Admin Panel
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>

        {/* Navigation: upar aur neeche halka fade */}
        <div className="relative min-h-0 flex-1">
          <nav
            aria-label="Admin navigation"
            className={cn(
              "h-full overflow-y-auto overscroll-contain p-3",
              enter,
            )}
            style={{ animationDelay: "80ms" }}
          >
            <AdminNav
              permissions={permissions}
              onNavigate={() => setOpen(false)}
            />
          </nav>
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 top-0 h-3 bg-gradient-to-b from-background to-transparent"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 bottom-0 h-4 bg-gradient-to-t from-background to-transparent"
          />
        </div>

        {/* Footer */}
        <div
          className={cn(
            "space-y-2 border-t border-border bg-muted/30 p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]",
            enter,
          )}
          style={{ animationDelay: "160ms" }}
        >
          <p className="text-center text-[11px] leading-4 text-muted-foreground">
            Swipe left to close
          </p>
          <AdminFooterLinks />
        </div>
      </SheetContent>
    </Sheet>
  );
}
