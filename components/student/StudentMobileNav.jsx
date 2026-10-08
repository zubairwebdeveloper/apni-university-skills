// components/student/StudentMobileNav.jsx
"use client";
import { useState } from "react";
import { FiMenu } from "react-icons/fi";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { buttonVariants } from "@/components/ui/button";
import { LogoutButton } from "@/components/auth/LogoutButton";
import { StudentNavList } from "./StudentNavList";
import { UserChip } from "./UserChip";
import { cn } from "@/lib/utils";

export function StudentMobileNav({ person }) {
  const [open, setOpen] = useState(false);
  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        className={cn(
          buttonVariants({ variant: "ghost", size: "icon" }),
          "lg:hidden",
        )}
        aria-label="Open dashboard menu"
      >
        <FiMenu className="size-5" aria-hidden="true" />
      </SheetTrigger>
      <SheetContent side="left" className="w-[85vw] max-w-xs gap-0 p-0">
        <SheetHeader className="border-b p-4">
          <SheetTitle>Dashboard</SheetTitle>
          <SheetDescription className="sr-only">
            Student navigation
          </SheetDescription>
        </SheetHeader>
        <div className="flex-1 overflow-y-auto p-3">
          <StudentNavList onNavigate={() => setOpen(false)} />
        </div>
        <div className="space-y-2 border-t p-3">
          <UserChip person={person} />
          <LogoutButton className="w-full" />
        </div>
      </SheetContent>
    </Sheet>
  );
}

