// components/layout/CommandPalette.jsx
// Quick search: Ctrl/⌘ + K. Needs: npx shadcn@latest add command
"use client";

import { useCallback, useEffect, useState, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import {
  Bell,
  BookOpen,
  FileText,
  Laptop,
  LayoutDashboard,
  LogIn,
  Moon,
  Search,
  Settings,
  Sparkles,
  Sun,
  User,
} from "lucide-react";

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { useAuth } from "@/components/auth/AuthProvider";
import { primaryNav, moreNav } from "@/config/site";
import { cn } from "@/lib/utils";

const OPEN_EVENT = "open-command-palette";

const ACCOUNT_ITEMS = [
  { href: "/student", label: "Dashboard", icon: LayoutDashboard },
  { href: "/profile", label: "Profile", icon: User },
  { href: "/student/courses", label: "My Courses", icon: BookOpen },
  { href: "/notifications", label: "Notifications", icon: Bell },
  { href: "/settings", label: "Settings", icon: Settings },
];

const GUEST_ITEMS = [
  { href: "/login", label: "Log in", icon: LogIn },
  { href: "/register", label: "Get started free", icon: Sparkles },
];

const THEMES = [
  { value: "light", label: "Light theme", icon: Sun },
  { value: "dark", label: "Dark theme", icon: Moon },
  { value: "system", label: "System theme", icon: Laptop },
];

export function CommandPalette() {
  const router = useRouter();
  const { user } = useAuth();
  const { setTheme } = useTheme();
  const [open, setOpen] = useState(false);

  // Ctrl/⌘ + K toggles. The trigger button fires a custom event to open it.
  useEffect(() => {
    const onKey = (e) => {
      if (e.key.toLowerCase() === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((v) => !v);
      }
    };
    const onOpen = () => setOpen(true);

    window.addEventListener("keydown", onKey);
    window.addEventListener(OPEN_EVENT, onOpen);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener(OPEN_EVENT, onOpen);
    };
  }, []);

  const run = useCallback((fn) => {
    setOpen(false);
    fn();
  }, []);

  const go = (href) => run(() => router.push(href));

  const pages = [...primaryNav, ...moreNav];
  const accountItems = user ? ACCOUNT_ITEMS : GUEST_ITEMS;

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Search pages and actions…" />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>

        <CommandGroup heading="Pages">
          {pages.map((l) => {
            const Icon = l.icon ?? FileText;
            return (
              <CommandItem
                key={l.href}
                value={`${l.label} ${l.description ?? ""}`}
                onSelect={() => go(l.href)}
                className="cursor-pointer gap-2.5"
              >
                <Icon aria-hidden="true" className="size-4 text-muted-foreground" />
                <span className="flex-1">{l.label}</span>
                {l.description ? (
                  <span className="hidden truncate text-xs text-muted-foreground sm:block">
                    {l.description}
                  </span>
                ) : null}
              </CommandItem>
            );
          })}
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading={user ? "Your account" : "Account"}>
          {accountItems.map(({ href, label, icon: Icon }) => (
            <CommandItem
              key={href}
              value={label}
              onSelect={() => go(href)}
              className="cursor-pointer gap-2.5"
            >
              <Icon aria-hidden="true" className="size-4 text-muted-foreground" />
              {label}
            </CommandItem>
          ))}
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="Appearance">
          {THEMES.map(({ value, label, icon: Icon }) => (
            <CommandItem
              key={value}
              value={label}
              onSelect={() => run(() => setTheme(value))}
              className="cursor-pointer gap-2.5"
            >
              <Icon aria-hidden="true" className="size-4 text-muted-foreground" />
              {label}
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}

// A search-style button for the Navbar that opens the palette.
export function CommandTrigger({ className }) {
  const mac = useSyncExternalStore(
    () => () => {},
    () => /Mac|iPhone|iPad/i.test(navigator.userAgent),
    () => false,
  );

  return (
    <button
      type="button"
      onClick={() => window.dispatchEvent(new Event(OPEN_EVENT))}
      aria-label="Search pages and actions"
      className={cn(
        "group inline-flex h-9 cursor-pointer items-center gap-2 rounded-full border bg-background/60 px-3 text-sm text-muted-foreground outline-none transition-all duration-200",
        "hover:border-primary/40 hover:bg-accent/50 hover:text-foreground hover:shadow-sm active:scale-95",
        "focus-visible:ring-2 focus-visible:ring-ring",
        "motion-reduce:transition-none motion-reduce:active:scale-100",
        className,
      )}
    >
      <Search
        aria-hidden="true"
        className="size-4 transition-transform duration-200 group-hover:scale-110 motion-reduce:transition-none motion-reduce:group-hover:scale-100"
      />
      <span className="hidden xl:inline">Search</span>
      <kbd className="hidden rounded border bg-muted px-1.5 py-0.5 font-sans text-[10px] font-medium xl:inline">
        {mac ? "⌘" : "Ctrl"} K
      </kbd>
    </button>
  );
}
