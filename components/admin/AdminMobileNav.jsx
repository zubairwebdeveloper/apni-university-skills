// components/admin/AdminMobileNav.jsx
"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { FiMenu } from "react-icons/fi";
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

export function AdminMobileNav({ permissions }) {
  const pathname = usePathname();
  const [openPathname, setOpenPathname] = useState(null);
  const open = openPathname === pathname;
  const setOpen = (nextOpen) =>
    setOpenPathname(nextOpen ? pathname : null);

  // Close the menu if the screen grows to the desktop layout,
  // where the sidebar is already visible.
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const onChange = (e) => {
      if (e.matches) setOpen(false);
    };
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        className={cn(
          buttonVariants({ variant: "ghost", size: "icon" }),
          "rounded-full transition-colors lg:hidden",
          open && "bg-accent",
        )}
        aria-label="Open admin menu"
      >
        <FiMenu className="size-5" aria-hidden="true" />
      </SheetTrigger>

      <SheetContent
        side="left"
        className="w-[85vw] max-w-xs gap-0 overflow-hidden p-0"
      >
        {/* Header */}
        <SheetHeader className="relative border-b bg-gradient-to-br from-primary/10 via-background to-background p-4 text-left">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-8 -top-8 size-28 rounded-full bg-primary/15 blur-2xl"
          />

          <div className="relative flex items-center gap-3">
            <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary text-primary-foreground shadow-sm">
              <LayoutDashboard aria-hidden="true" className="size-5" />
            </span>

            <div className="min-w-0 space-y-0.5">
              <SheetTitle className="text-base leading-none">
                Admin Panel
              </SheetTitle>
              <SheetDescription className="text-xs">
                Manage your platform
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>

        {/* Navigation */}
        <nav
          aria-label="Admin navigation"
          className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-3"
        >
          <AdminNav
            permissions={permissions}
            onNavigate={() => setOpen(false)}
          />
        </nav>

        {/* Footer */}
        <div className="border-t bg-muted/30 p-3">
          <AdminFooterLinks />
        </div>
      </SheetContent>
    </Sheet>
  );
}
