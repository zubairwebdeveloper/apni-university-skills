"use client";

import { useTheme } from "next-themes";
import { FiSun, FiMoon, FiMonitor, FiDroplet } from "react-icons/fi";
import { Card } from "@/components/ui/card";
import { SectionTitle } from "@/components/student/SectionTitle";

const THEMES = [
  { value: "light", label: "Light", icon: FiSun },
  { value: "dark", label: "Dark", icon: FiMoon },
  { value: "system", label: "System", icon: FiMonitor },
];

export function AppearanceCard() {
  const { theme, setTheme } = useTheme();

  return (
    <Card id="appearance" className="scroll-mt-24 gap-4 p-6">
      <SectionTitle icon={FiDroplet} title="Appearance" />
      <div className="grid grid-cols-3 gap-3">
        {THEMES.map(({ value, label, icon: Icon }) => {
          const active = theme === value;
          return (
            <button
              key={value}
              onClick={() => setTheme(value)}
              className={`flex flex-col items-center gap-2 rounded-xl border p-4 text-sm transition ${
                active
                  ? "border-primary bg-primary/5 text-primary"
                  : "hover:bg-muted"
              }`}
            >
              <Icon className="h-5 w-5" />
              {label}
            </button>
          );
        })}
      </div>
    </Card>
  );
}
