"use client";

import { memo, useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Check, Laptop, Moon, Palette, Sun } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const OPTIONS = [
  {
    value: "light",
    label: "Light",
    description: "Bright and clean",
    icon: Sun,
  },
  {
    value: "dark",
    label: "Dark",
    description: "Easy on the eyes",
    icon: Moon,
  },
  {
    value: "system",
    label: "System",
    description: "Follow your device",
    icon: Laptop,
  },
];

export const ThemeToggle = memo(function ThemeToggle({
  className,
  align = "end",
  sideOffset = 10,
  showLabel = false,
}) {
  const { theme, resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const currentTheme = mounted ? theme : "system";

  const CurrentIcon = mounted
    ? OPTIONS.find((option) => option.value === currentTheme)?.icon || Laptop
    : Laptop;

  const selectTheme = (value) => {
    if (value !== theme) {
      setTheme(value);
    }
  };

  const currentLabel = mounted
    ? OPTIONS.find((option) => option.value === currentTheme)?.label || "System"
    : "Theme";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        type="button"
        aria-label={`Change appearance. Current theme: ${currentLabel}`}
        title={`Theme: ${currentLabel}`}
        className={cn(
          buttonVariants({
            variant: "ghost",
            size: showLabel ? "default" : "icon",
          }),
          "group relative isolate shrink-0 gap-2 overflow-hidden rounded-xl",
          "border border-transparent transition-all duration-200",
          "hover:border-border hover:bg-accent/70",
          "active:scale-95",
          "focus-visible:outline-none focus-visible:ring-2",
          "focus-visible:ring-ring focus-visible:ring-offset-2",
          "motion-reduce:transform-none motion-reduce:transition-none",
          showLabel && "px-3",
          className,
        )}
      >
        <span
          aria-hidden="true"
          className={cn(
            "pointer-events-none absolute inset-0 -z-10",
            "bg-gradient-to-br from-violet-500/10 via-transparent to-yellow-400/10",
            "opacity-0 transition-opacity duration-200 group-hover:opacity-100",
            "motion-reduce:transition-none",
          )}
        />

        <span className="relative grid size-5 shrink-0 place-items-center">
          {mounted ? (
            <>
              <Sun
                className={cn(
                  "absolute size-[18px] transition-all duration-300",
                  currentTheme === "light"
                    ? "rotate-0 scale-100 text-amber-500"
                    : "rotate-90 scale-0",
                  "motion-reduce:transition-none",
                )}
              />

              <Moon
                className={cn(
                  "absolute size-[18px] transition-all duration-300",
                  currentTheme === "dark"
                    ? "rotate-0 scale-100 text-violet-500"
                    : "rotate-90 scale-0",
                  "motion-reduce:transition-none",
                )}
              />

              <Laptop
                className={cn(
                  "absolute size-[18px] transition-all duration-300",
                  currentTheme === "system"
                    ? "rotate-0 scale-100 text-primary"
                    : "-rotate-90 scale-0",
                  "motion-reduce:transition-none",
                )}
              />
            </>
          ) : (
            <Palette
              aria-hidden="true"
              className="size-[18px] text-muted-foreground"
            />
          )}
        </span>

        {showLabel && (
          <span className="text-sm font-medium">
            {mounted ? currentLabel : "Theme"}
          </span>
        )}

        <span className="sr-only">Open theme settings</span>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align={align}
        sideOffset={sideOffset}
        className={cn(
          "z-[100] w-[min(19rem,calc(100vw-1.5rem))] p-2",
          "rounded-2xl border border-border/80",
          "bg-popover/95 text-popover-foreground shadow-xl",
          "backdrop-blur-xl",
        )}
      >
        <DropdownMenuLabel className="px-3 pb-2 pt-2">
          <span className="flex items-center gap-2 text-sm font-semibold">
            <Palette className="size-4 text-violet-500" />
            Appearance
          </span>
          <span className="mt-1 block text-xs font-normal text-muted-foreground">
            Personalize your learning space
          </span>
        </DropdownMenuLabel>

        <DropdownMenuSeparator className="my-1" />

        <div className="space-y-1">
          {OPTIONS.map(({ value, label, description, icon: Icon }) => {
            const selected = mounted && currentTheme === value;

            return (
              <DropdownMenuItem
                key={value}
                onClick={() => selectTheme(value)}
                className={cn(
                  "group flex cursor-pointer items-center gap-3",
                  "rounded-xl px-3 py-2.5 outline-none",
                  "transition-colors duration-150",
                  "focus:bg-accent focus:text-accent-foreground",
                  selected &&
                    "bg-violet-500/10 text-foreground focus:bg-violet-500/15",
                )}
              >
                <span
                  className={cn(
                    "grid size-9 shrink-0 place-items-center rounded-xl",
                    "border border-border/70 bg-muted/60",
                    "transition-all duration-200",
                    "group-hover:scale-105 group-hover:border-violet-500/30",
                    selected && "border-violet-500/30 bg-violet-500/10",
                    "motion-reduce:transform-none motion-reduce:transition-none",
                  )}
                >
                  <Icon
                    aria-hidden="true"
                    className={cn(
                      "size-[18px] text-muted-foreground transition-colors",
                      "group-hover:text-violet-500",
                      selected && "text-violet-500",
                      value === "light" && selected && "text-amber-500",
                    )}
                  />
                </span>

                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-medium">{label}</span>
                  <span className="mt-0.5 block text-xs text-muted-foreground">
                    {description}
                  </span>
                </span>

                <span className="grid size-5 shrink-0 place-items-center">
                  {selected && (
                    <Check
                      aria-hidden="true"
                      className="size-4 text-violet-500"
                    />
                  )}
                </span>
              </DropdownMenuItem>
            );
          })}
        </div>

        <DropdownMenuSeparator className="my-2" />

        <div className="flex items-center justify-between gap-3 px-3 py-1">
          <span className="text-xs text-muted-foreground">
            Active appearance
          </span>

          <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-muted/60 px-2 py-1 text-[11px] font-medium">
            <span
              className={cn(
                "size-1.5 rounded-full",
                mounted ? "bg-emerald-500" : "bg-muted-foreground",
              )}
            />
            {mounted
              ? `${currentLabel}${currentTheme === "system" && resolvedTheme ? ` · ${resolvedTheme}` : ""}`
              : "Loading"}
          </span>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
});

ThemeToggle.displayName = "ThemeToggle";

export default ThemeToggle;
