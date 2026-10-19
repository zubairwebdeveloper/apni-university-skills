// components/student/StudentMobileNav.jsx
"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { MotionConfig, motion } from "framer-motion";
import { ChevronRight, LayoutDashboard, Menu } from "lucide-react";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { LogoutButton } from "@/components/auth/LogoutButton";
import { NAV_LINKS } from "@/lib/student-header-data";
import { StudentNavList } from "./StudentNavList";
import { UserChip } from "./UserChip";
import { cn } from "@/lib/utils";

const FOCUS =
  "outline-none focus-visible:ring-2 focus-visible:ring-[#8B5CF6] focus-visible:ring-offset-2 focus-visible:ring-offset-background";

export function StudentMobileNav({ person }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  // Safety net: always close the drawer after a route change
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Label of the page the student is currently on (real data from NAV_LINKS)
  const links = Array.isArray(NAV_LINKS) ? NAV_LINKS : [];
  const currentLink = links.find((item) =>
    item.href === "/student"
      ? pathname === item.href
      : pathname === item.href || pathname?.startsWith(`${item.href}/`),
  );

  return (
    <MotionConfig reducedMotion="user">
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger
          className={cn(
            "group flex h-11 w-full cursor-pointer items-center gap-3 rounded-xl border border-border bg-muted/40 px-2.5 text-left transition-all duration-200 hover:border-[#8B5CF6]/50 hover:bg-[#8B5CF6]/[0.05] active:scale-[0.99] lg:hidden",
            FOCUS,
          )}
          aria-label="Open dashboard menu"
        >
          <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-[#8B5CF6]/10 text-violet-700 transition-colors group-hover:bg-[#8B5CF6] group-hover:text-white dark:text-violet-300">
            <Menu className="size-4" aria-hidden="true" />
          </span>

          <span className="text-sm font-semibold">Menu</span>

          <span className="ml-auto flex min-w-0 items-center gap-1 text-xs text-muted-foreground">
            {currentLink && (
              <span className="truncate font-medium">{currentLink.label}</span>
            )}
            <ChevronRight
              className="size-4 shrink-0 transition-transform duration-200 group-hover:translate-x-0.5"
              aria-hidden="true"
            />
          </span>
        </SheetTrigger>

        <SheetContent
          side="left"
          className="w-[85vw] max-w-xs gap-0 border-r border-border bg-background p-0"
        >
          <SheetHeader className="border-b border-border p-4 pr-12">
            <div className="flex items-center gap-3">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[#FACC15] text-[#111318]">
                <LayoutDashboard className="size-5" aria-hidden="true" />
              </span>
              <div className="min-w-0 text-left">
                <SheetTitle className="text-base font-bold leading-tight tracking-tight">
                  Dashboard
                </SheetTitle>
                <p
                  aria-hidden="true"
                  className="mt-0.5 text-xs text-muted-foreground"
                >
                  Your learning workspace
                </p>
              </div>
            </div>
            <SheetDescription className="sr-only">
              Student navigation
            </SheetDescription>
          </SheetHeader>

          <motion.div
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.25, delay: 0.05, ease: "easeOut" }}
            className="flex-1 overflow-y-auto p-3"
          >
            <p className="px-2 pb-2 text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground">
              Navigate
            </p>
            <StudentNavList onNavigate={() => setOpen(false)} />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, delay: 0.12, ease: "easeOut" }}
            className="space-y-2 border-t border-border bg-muted/30 p-3"
          >
            <UserChip person={person} />
            <LogoutButton className="w-full" />
          </motion.div>
        </SheetContent>
      </Sheet>
    </MotionConfig>
  );
}
