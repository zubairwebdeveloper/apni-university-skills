"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { FiCheck, FiMonitor, FiMoon, FiSun } from "react-icons/fi";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

const THEME_OPTIONS = [
  {
    value: "light",
    label: "Light",
    description: "A bright, clean appearance",
    icon: FiSun,
  },
  {
    value: "dark",
    label: "Dark",
    description: "Easy on the eyes",
    icon: FiMoon,
  },
  {
    value: "system",
    label: "System",
    description: "Follow your device settings",
    icon: FiMonitor,
  },
];

export function ModeToggle({ className }) {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const CurrentIcon = !mounted
    ? FiMonitor
    : resolvedTheme === "dark"
      ? FiMoon
      : FiSun;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="ghost"
            size="icon"
            aria-label="Change appearance"
            title="Change appearance"
            className={cn(
              "group relative size-10 shrink-0 overflow-hidden rounded-xl",
              "border border-transparent transition-colors duration-200",
              "hover:border-border hover:bg-accent",
              "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
              className,
            )}
          />
        }
      >
        <CurrentIcon
          key={mounted ? resolvedTheme : "loading"}
          aria-hidden="true"
          className={cn(
            "size-[18px] transition-transform duration-300",
            "group-hover:rotate-[-8deg] group-active:scale-90",
            "motion-reduce:transform-none motion-reduce:transition-none",
          )}
        />

        <span className="sr-only">Toggle color theme</span>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        sideOffset={8}
        className="w-64 rounded-2xl border-border/80 p-2 shadow-xl"
      >
        <DropdownMenuLabel className="px-3 pb-1 pt-2 text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
          Appearance
        </DropdownMenuLabel>

        <p className="px-3 pb-2 text-xs leading-5 text-muted-foreground">
          Personalize how Apni University looks on your device.
        </p>

        <DropdownMenuSeparator className="mx-1" />

        <div className="space-y-1 pt-1">
          {THEME_OPTIONS.map(({ value, label, description, icon: Icon }) => {
            const selected = mounted && theme === value;

            return (
              <DropdownMenuItem
                key={value}
                onClick={() => setTheme(value)}
                className={cn(
                  "flex min-h-[58px] cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5",
                  "focus:bg-accent focus:text-accent-foreground",
                  selected && "bg-primary/5",
                )}
                aria-label={`${label} theme`}
              >
                <span
                  className={cn(
                    "grid size-9 shrink-0 place-items-center rounded-xl border transition-colors",
                    selected
                      ? "border-primary/20 bg-primary/10 text-primary"
                      : "border-border bg-muted/50 text-muted-foreground",
                  )}
                >
                  <Icon size={17} aria-hidden="true" />
                </span>

                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-medium">{label}</span>
                  <span className="mt-0.5 block text-xs leading-4 text-muted-foreground">
                    {description}
                  </span>
                </span>

                {selected && (
                  <FiCheck
                    size={16}
                    aria-hidden="true"
                    className="shrink-0 text-primary"
                  />
                )}
              </DropdownMenuItem>
            );
          })}
        </div>

        <DropdownMenuSeparator className="mx-1" />

        <p className="px-3 py-2 text-[11px] leading-5 text-muted-foreground">
          Current appearance:{" "}
          <span className="font-medium capitalize text-foreground">
            {mounted
              ? theme === "system"
                ? `System (${resolvedTheme || "default"})`
                : theme || "System"
              : "Loading"}
          </span>
        </p>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
