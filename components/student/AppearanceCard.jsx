"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { FiSun, FiMoon, FiMonitor, FiDroplet, FiCheck } from "react-icons/fi";
import { Card } from "@/components/ui/card";
import { SectionTitle } from "@/components/student/SectionTitle";

const THEMES = [
  {
    value: "light",
    label: "Light",
    description: "Bright surfaces",
    icon: FiSun,
  },
  {
    value: "dark",
    label: "Dark",
    description: "Easier in low light",
    icon: FiMoon,
  },
  {
    value: "system",
    label: "System",
    description: "Matches your device",
    icon: FiMonitor,
  },
];

// Fixed palettes: these illustrate each theme, so they must not follow the
// currently active theme.
const PALETTES = {
  light: {
    bg: "#F8FAFC",
    panel: "#E2E8F0",
    line: "#CBD5E1",
    accent: "#FACC15",
  },
  dark: { bg: "#111318", panel: "#1E222B", line: "#2C313D", accent: "#FACC15" },
};

function MiniScreen({ palette }) {
  return (
    <div
      className="flex h-full w-full gap-1.5 p-2"
      style={{ backgroundColor: palette.bg }}
    >
      <div
        className="w-1/4 rounded-sm"
        style={{ backgroundColor: palette.panel }}
      />
      <div className="flex flex-1 flex-col gap-1.5">
        <div
          className="h-1.5 w-1/2 rounded-full"
          style={{ backgroundColor: palette.accent }}
        />
        <div
          className="h-1.5 w-full rounded-full"
          style={{ backgroundColor: palette.line }}
        />
        <div
          className="h-1.5 w-3/4 rounded-full"
          style={{ backgroundColor: palette.line }}
        />
      </div>
    </div>
  );
}

function ThemePreview({ value }) {
  return (
    <div
      className="relative h-14 w-full overflow-hidden rounded-md border"
      aria-hidden="true"
    >
      {value === "system" ? (
        <>
          <MiniScreen palette={PALETTES.light} />
          <div
            className="absolute inset-0"
            style={{ clipPath: "polygon(100% 0, 100% 100%, 0 100%)" }}
          >
            <MiniScreen palette={PALETTES.dark} />
          </div>
        </>
      ) : (
        <MiniScreen palette={PALETTES[value]} />
      )}
    </div>
  );
}

export function AppearanceCard() {
  const { theme, setTheme, resolvedTheme } = useTheme();

  // next-themes cannot know the theme on the server, so only show the
  // selected state after mount to avoid a hydration mismatch.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const activeTheme = mounted ? theme : undefined;
  const showSystemNote = mounted && theme === "system" && resolvedTheme;

  return (
    <Card id="appearance" className="scroll-mt-24 gap-4 p-6">
      <SectionTitle icon={FiDroplet} title="Appearance" />

      <p className="text-sm text-muted-foreground">
        Choose how the app looks on this device. Your choice is saved in this
        browser.
      </p>

      <div
        role="group"
        aria-label="Theme"
        className="grid grid-cols-3 gap-2 sm:gap-3"
      >
        {THEMES.map(({ value, label, description, icon: Icon }) => {
          const active = activeTheme === value;
          return (
            <button
              key={value}
              type="button"
              onClick={() => setTheme(value)}
              aria-pressed={active}
              className={`group relative flex flex-col gap-3 rounded-xl border p-2.5 text-left transition-colors motion-reduce:transition-none sm:p-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background ${
                active
                  ? "border-primary bg-primary/5 ring-1 ring-primary"
                  : "hover:border-foreground/25 hover:bg-muted/60"
              }`}
            >
              <ThemePreview value={value} />

              <span className="flex items-start gap-2">
                <Icon
                  className={`mt-0.5 h-4 w-4 shrink-0 ${
                    active ? "text-primary" : "text-muted-foreground"
                  }`}
                  aria-hidden="true"
                />
                <span className="min-w-0 flex-1">
                  <span
                    className={`block text-sm font-medium leading-tight ${
                      active ? "text-primary" : ""
                    }`}
                  >
                    {label}
                  </span>
                  <span className="mt-0.5 hidden text-xs leading-snug text-muted-foreground sm:block">
                    {description}
                  </span>
                </span>
                {active && (
                  <FiCheck
                    className="mt-0.5 h-4 w-4 shrink-0 text-primary"
                    aria-hidden="true"
                  />
                )}
              </span>
            </button>
          );
        })}
      </div>

      <p className="min-h-4 text-xs text-muted-foreground" aria-live="polite">
        {showSystemNote
          ? `Following your device. Currently using the ${resolvedTheme} theme.`
          : ""}
      </p>
    </Card>
  );
}
