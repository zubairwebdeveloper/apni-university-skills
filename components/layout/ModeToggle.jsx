"use client";

import { useTheme } from "next-themes";
import { FiMonitor, FiMoon, FiSun } from "react-icons/fi";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function ModeToggle() {
  const { setTheme } = useTheme();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="ghost"
            size="icon"
            aria-label="Change theme"
            className="relative size-9 cursor-pointer"
          />
        }
      >
        <FiSun
          className="absolute size-[1.1rem] rotate-0 scale-100 transition-transform dark:-rotate-90 dark:scale-0 motion-reduce:transition-none"
          aria-hidden="true"
        />
        <FiMoon
          className="absolute size-[1.1rem] rotate-90 scale-0 transition-transform dark:rotate-0 dark:scale-100 motion-reduce:transition-none"
          aria-hidden="true"
        />
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setTheme("light")}>
          <FiSun className="mr-2 size-4" aria-hidden="true" />
          Light
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("dark")}>
          <FiMoon className="mr-2 size-4" aria-hidden="true" />
          Dark
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("system")}>
          <FiMonitor className="mr-2 size-4" aria-hidden="true" />
          System
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
