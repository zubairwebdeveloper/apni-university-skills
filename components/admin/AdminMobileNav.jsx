// components/admin/AdminMobileNav.jsx
"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from "framer-motion";
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

const SPRING = { stiffness: 220, damping: 18, mass: 0.6 };
const enter =
  "animate-in fade-in slide-in-from-left-3 fill-mode-both duration-300 motion-reduce:animate-none";

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

// 3D tile: touch ya mouse ke saath tilt
function BrandTile({ reduce }) {
  const px = useMotionValue(0);
  const py = useMotionValue(0);
  const sx = useSpring(px, SPRING);
  const sy = useSpring(py, SPRING);
  const rotateY = useTransform(sx, [-0.5, 0.5], [-20, 20]);
  const rotateX = useTransform(sy, [-0.5, 0.5], [20, -20]);

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
      className="relative shrink-0 touch-none [perspective:600px]"
      onPointerMove={onMove}
      onPointerLeave={onLeave}
      onPointerUp={onLeave}
    >
      <div
        aria-hidden="true"
        className="absolute inset-0 translate-y-1.5 rounded-xl bg-primary/30 blur-md"
      />
      <motion.span
        style={reduce ? undefined : { rotateX, rotateY }}
        whileTap={reduce ? undefined : { scale: 0.94 }}
        className="relative grid size-11 place-items-center rounded-xl bg-primary text-primary-foreground shadow-lg ring-1 ring-inset ring-white/20 [transform-style:preserve-3d]"
      >
        <LayoutDashboard
          aria-hidden="true"
          className="size-5 [transform:translateZ(14px)]"
        />
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 rounded-xl bg-gradient-to-br from-white/25 via-transparent to-black/10"
        />
      </motion.span>
    </div>
  );
}

export function AdminMobileNav({ permissions }) {
  const pathname = usePathname();
  const reduce = useReducedMotion();
  const [openPathname, setOpenPathname] = useState(null);
  const open = openPathname === pathname;
  const setOpen = (nextOpen) => setOpenPathname(nextOpen ? pathname : null);

  // Spotlight: header mein touch ke saath chalta hai
  const mx = useMotionValue(200);
  const my = useMotionValue(20);
  const gx = useSpring(mx, { stiffness: 120, damping: 20 });
  const gy = useSpring(my, { stiffness: 120, damping: 20 });

  function onHeaderMove(e) {
    if (reduce) return;
    const r = e.currentTarget.getBoundingClientRect();
    mx.set(e.clientX - r.left - 80);
    my.set(e.clientY - r.top - 80);
  }

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
          "rounded-full lg:hidden",
          "shadow-[0_2px_0_0_var(--border)] transition-[transform,box-shadow,background-color] duration-100",
          "active:translate-y-[2px] active:shadow-none motion-reduce:transition-none motion-reduce:active:translate-y-0",
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
        <SheetHeader
          onPointerMove={onHeaderMove}
          className="relative overflow-hidden border-b bg-gradient-to-br from-primary/10 via-background to-background p-4 text-left"
        >
          {!reduce && (
            <motion.div
              aria-hidden="true"
              style={{ x: gx, y: gy }}
              className="pointer-events-none absolute left-0 top-0 size-40 rounded-full bg-primary/15 blur-2xl"
            />
          )}

          <div className="relative flex items-center gap-3">
            <BrandTile reduce={reduce} />
            <div className="min-w-0 space-y-0.5">
              <SheetTitle className="text-base leading-none">
                Apni University
              </SheetTitle>
              <SheetDescription className="text-xs">
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
            "space-y-2 border-t bg-muted/30 p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]",
            enter,
          )}
          style={{ animationDelay: "160ms" }}
        >
          <p className="text-center text-[11px] text-muted-foreground">
            Swipe left to close
          </p>
          <AdminFooterLinks />
        </div>
      </SheetContent>
    </Sheet>
  );
}
