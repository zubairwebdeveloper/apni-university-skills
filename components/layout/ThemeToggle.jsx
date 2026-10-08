// components/layout/ThemeToggle.jsx
// Put <ThemeToggle /> inside the Navbar (see the notes in the reply).
"use client";

import { useTheme } from "next-themes";
import { Laptop, Moon, Sun } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const OPTIONS = [
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
  { value: "system", label: "System", icon: Laptop },
];

export function ThemeToggle({ className }) {
  const { theme, setTheme } = useTheme();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label="Change theme"
        className={cn(
          buttonVariants({ variant: "ghost", size: "icon" }),
          "group relative cursor-pointer overflow-hidden transition-all duration-200 hover:bg-accent/60 active:scale-90 motion-reduce:transition-none motion-reduce:active:scale-100",
          className,
        )}
      >
        {/* Sun and moon swap with a spin, driven by the .dark class */}
        <Sun
          aria-hidden="true"
          className="size-4 rotate-0 scale-100 transition-all duration-500 group-hover:rotate-45 dark:-rotate-90 dark:scale-0 motion-reduce:transition-none"
        />
        <Moon
          aria-hidden="true"
          className="absolute size-4 rotate-90 scale-0 transition-all duration-500 group-hover:-rotate-12 dark:rotate-0 dark:scale-100 motion-reduce:transition-none"
        />
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" sideOffset={8} className="w-36">
        {OPTIONS.map(({ value, label, icon: Icon }) => (
          <DropdownMenuItem
            key={value}
            onClick={() => setTheme(value)}
            className={cn(
              "group cursor-pointer gap-2.5",
              theme === value && "bg-accent font-medium",
            )}
          >
            <Icon
              aria-hidden="true"
              className="size-4 text-muted-foreground transition-all duration-200 group-hover:scale-110 group-hover:text-primary motion-reduce:transition-none motion-reduce:group-hover:scale-100"
            />
            {label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
