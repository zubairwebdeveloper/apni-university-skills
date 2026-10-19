"use client";

import { Fragment, useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import {
  ArrowLeft,
  ArrowUp,
  Bell,
  BookOpen,
  Check,
  ChevronRight,
  Command as CommandIcon,
  FileText,
  History,
  Keyboard,
  Laptop,
  LayoutDashboard,
  Link2,
  LogIn,
  Moon,
  Search,
  Settings,
  Sparkles,
  Sun,
  User,
  X,
} from "lucide-react";

import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { useAuth } from "@/components/auth/AuthProvider";
import { primaryNav, moreNav } from "@/config/site";
import { cn } from "@/lib/utils";

const OPEN_EVENT = "open-command-palette";

const RECENT_KEY = "apni:recent-pages";
const TIP_KEY = "apni:shortcut-tip-seen";
const SINGLE_KEY = "apni:single-key-shortcuts";

const BRAND_YELLOW = "#FACC15";
const BRAND_PURPLE = "#8B5CF6";

const ACCOUNT_ITEMS = [
  {
    href: "/student",
    label: "Dashboard",
    icon: LayoutDashboard,
  },
  {
    href: "/student/profile",
    label: "Profile",
    icon: User,
  },
  {
    href: "/student/courses",
    label: "My Courses",
    icon: BookOpen,
  },
  {
    href: "/student/notifications",
    label: "Notifications",
    icon: Bell,
  },
  {
    href: "/student/settings",
    label: "Settings",
    icon: Settings,
  },
];

const GUEST_ITEMS = [
  {
    href: "/login",
    label: "Log in",
    icon: LogIn,
  },
  {
    href: "/register",
    label: "Get started free",
    icon: Sparkles,
  },
];

const THEMES = [
  { value: "light", label: "Light theme", icon: Sun },
  { value: "dark", label: "Dark theme", icon: Moon },
  { value: "system", label: "System theme", icon: Laptop },
];

const NAV_SHORTCUTS = [
  { keys: ["g", "h"], label: "Go to home", href: "/" },
  { keys: ["g", "c"], label: "Go to courses", href: "/courses" },
  {
    keys: ["g", "d"],
    label: "Go to dashboard",
    href: "/student",
    when: "auth",
  },
  {
    keys: ["g", "p"],
    label: "Go to profile",
    href: "/student/profile",
    when: "auth",
  },
  {
    keys: ["g", "l"],
    label: "Go to log in",
    href: "/login",
    when: "guest",
  },
];

const itemClass = cn(
  "group relative cursor-pointer gap-3 rounded-xl px-3 py-2.5",
  "transition-colors duration-150",
  "data-[selected=true]:bg-accent",
);

const iconClass = cn(
  "size-4 shrink-0 text-muted-foreground",
  "transition-colors group-data-[selected=true]:text-foreground",
);

function isTyping(element) {
  if (!element || !element.tagName) return false;

  const tag = element.tagName;

  return (
    tag === "INPUT" ||
    tag === "TEXTAREA" ||
    tag === "SELECT" ||
    element.isContentEditable ||
    element.getAttribute?.("role") === "textbox"
  );
}

function safePath(value) {
  return (
    typeof value === "string" &&
    value.startsWith("/") &&
    !value.startsWith("//") &&
    !value.includes("\\")
  );
}

function readRecent() {
  try {
    const value = JSON.parse(window.localStorage.getItem(RECENT_KEY) || "[]");

    if (!Array.isArray(value)) return [];

    return value
      .filter(
        (item) => item && safePath(item.href) && typeof item.label === "string",
      )
      .slice(0, 5);
  } catch {
    return [];
  }
}

function pushRecent(item) {
  if (!safePath(item.href)) return;

  try {
    const next = [
      item,
      ...readRecent().filter((recent) => recent.href !== item.href),
    ];

    window.localStorage.setItem(RECENT_KEY, JSON.stringify(next.slice(0, 5)));
  } catch {
    // Recent pages are an enhancement; storage is optional.
  }
}

function Kbd({ children, className }) {
  return (
    <kbd
      className={cn(
        "inline-flex min-h-5 min-w-5 items-center justify-center",
        "rounded-md border border-border/80 bg-muted px-1.5 py-0.5",
        "font-sans text-[10px] font-semibold text-muted-foreground",
        "shadow-[0_1px_0_rgba(0,0,0,0.05)]",
        className,
      )}
    >
      {children}
    </kbd>
  );
}

function Keys({ keys, joiner = "then" }) {
  return (
    <span className="inline-flex items-center gap-1">
      {keys.map((key, index) => (
        <Fragment key={`${key}-${index}`}>
          {index > 0 && (
            <span className="text-[10px] text-muted-foreground">{joiner}</span>
          )}
          <Kbd>{key}</Kbd>
        </Fragment>
      ))}
    </span>
  );
}

function ShortcutSection({ title, children }) {
  return (
    <section>
      <h3 className="mb-3 text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground">
        {title}
      </h3>
      <ul className="space-y-3">{children}</ul>
    </section>
  );
}

function ShortcutRow({ label, children }) {
  return (
    <li className="flex items-center justify-between gap-4 text-sm">
      <span className="text-foreground/85">{label}</span>
      {children}
    </li>
  );
}

function SectionLabel({ children }) {
  return (
    <div className="flex items-center gap-2 px-3 pb-2 pt-3">
      <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground">
        {children}
      </span>
      <span className="h-px flex-1 bg-border/60" />
    </div>
  );
}

function PremiumCommandItem({ children, ...props }) {
  return (
    <CommandItem {...props} className={cn(itemClass, props.className)}>
      {children}
    </CommandItem>
  );
}

export function CommandPalette() {
  const router = useRouter();
  const { user } = useAuth();
  const { theme, setTheme } = useTheme();

  const [isMac, setIsMac] = useState(false);
  const [open, setOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [copied, setCopied] = useState(false);
  const [tip, setTip] = useState(false);
  const [singleKey, setSingleKey] = useState(true);

  const gAt = useRef(0);

  const modifier = isMac ? "⌘" : "Ctrl";
  const shortcutLabel = "Alt + K";

  const visibleNav = NAV_SHORTCUTS.filter((shortcut) => {
    if (!shortcut.when) return true;
    return shortcut.when === "auth" ? Boolean(user) : !user;
  });

  const pages = [...primaryNav, ...moreNav].filter(
    (item) => item && safePath(item.href),
  );

  const accountItems = user ? ACCOUNT_ITEMS : GUEST_ITEMS;

  const hintFor = useCallback(
    (href) => visibleNav.find((item) => item.href === href)?.keys,
    [visibleNav],
  );

  const markTipSeen = useCallback(() => {
    setTip(false);

    try {
      window.localStorage.setItem(TIP_KEY, "1");
    } catch {
      // Storage is optional.
    }
  }, []);

  const openPalette = useCallback(() => {
    setQuery("");
    setOpen(true);
    markTipSeen();
  }, [markTipSeen]);

  const handleOpenChange = useCallback((nextOpen) => {
    setOpen(nextOpen);

    if (!nextOpen) {
      setQuery("");
      setCopied(false);
    }
  }, []);

  // Detect the platform after mount to keep server and client output consistent.
  useEffect(() => {
    setIsMac(/Mac|iPhone|iPad/i.test(navigator.userAgent));
  }, []);

  useEffect(() => {
    try {
      if (window.localStorage.getItem(SINGLE_KEY) === "off") {
        setSingleKey(false);
      }
    } catch {
      // Keep the default if storage is unavailable.
    }
  }, []);

  const changeSingleKey = useCallback((enabled) => {
    setSingleKey(enabled);

    try {
      window.localStorage.setItem(SINGLE_KEY, enabled ? "on" : "off");
    } catch {
      // The setting remains active for the current session.
    }
  }, []);

  // Alt + K opens search. "?" and G sequences are optional shortcuts.
  useEffect(() => {
    const onKeyDown = (event) => {
      if (typeof event.key !== "string") return;

      if (
        event.altKey &&
        !event.ctrlKey &&
        !event.metaKey &&
        event.key.toLowerCase() === "k"
      ) {
        event.preventDefault();
        setQuery("");
        setOpen((current) => !current);
        markTipSeen();
        return;
      }

      if (event.metaKey || event.ctrlKey || event.altKey || event.shiftKey) {
        return;
      }

      if (!singleKey || open || helpOpen || isTyping(event.target)) {
        gAt.current = 0;
        return;
      }

      if (event.key === "?") {
        event.preventDefault();
        setHelpOpen(true);
        markTipSeen();
        gAt.current = 0;
        return;
      }

      const key = event.key.toLowerCase();

      if (gAt.current && Date.now() - gAt.current < 1200) {
        gAt.current = 0;

        const match = visibleNav.find((shortcut) => shortcut.keys[1] === key);

        if (match) {
          event.preventDefault();
          pushRecent({
            href: match.href,
            label: match.label,
          });
          router.push(match.href);
        }

        return;
      }

      gAt.current = key === "g" ? Date.now() : 0;
    };

    window.addEventListener("keydown", onKeyDown);

    window.addEventListener(OPEN_EVENT, openPalette);

    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener(OPEN_EVENT, openPalette);
    };
  }, [singleKey, open, helpOpen, visibleNav, router, openPalette, markTipSeen]);

  // Show the discovery tip once on devices with a mouse or trackpad.
  useEffect(() => {
    let alreadySeen = false;

    try {
      alreadySeen = window.localStorage.getItem(TIP_KEY) === "1";
    } catch {
      // Continue without persistence.
    }

    const finePointer = window.matchMedia(
      "(hover: hover) and (pointer: fine)",
    ).matches;

    if (alreadySeen || !finePointer) return undefined;

    const showTimer = window.setTimeout(() => setTip(true), 3500);

    const hideTimer = window.setTimeout(() => setTip(false), 16000);

    return () => {
      window.clearTimeout(showTimer);
      window.clearTimeout(hideTimer);
    };
  }, []);

  useEffect(() => {
    if (!copied) return undefined;

    const timeout = window.setTimeout(() => setCopied(false), 1800);

    return () => window.clearTimeout(timeout);
  }, [copied]);

  const run = useCallback((callback) => {
    setOpen(false);
    setQuery("");
    callback();
  }, []);

  const go = useCallback(
    (href, label) => {
      if (!safePath(href)) return;

      run(() => {
        pushRecent({ href, label });
        router.push(href);
      });
    },
    [router, run],
  );

  const copyLink = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  }, []);

  const scrollToTop = useCallback(() => {
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    window.scrollTo({
      top: 0,
      behavior: reduceMotion ? "auto" : "smooth",
    });
  }, []);

  const recent = open && !query ? readRecent() : [];

  return (
    <>
      <CommandDialog open={open} onOpenChange={handleOpenChange}>
        <Command
          className={cn(
            "overflow-hidden rounded-2xl bg-popover text-popover-foreground",
            "[&_[cmdk-group-heading]]:px-0",
            "[&_[cmdk-group-heading]]:font-normal",
          )}
        >
          {/* Search header */}
          <div className="relative border-b border-border/70">
            <div
              aria-hidden="true"
              className="absolute inset-y-0 left-0 w-[3px]"
              style={{
                background: `linear-gradient(to bottom, ${BRAND_YELLOW}, ${BRAND_PURPLE})`,
              }}
            />

            <div className="flex items-center gap-3 px-4">
              <div className="grid size-9 shrink-0 place-items-center rounded-xl border border-border/70 bg-muted/70">
                <Search className="size-4 text-foreground/80" />
              </div>

              <CommandInput
                placeholder="Search pages, courses and actions..."
                value={query}
                onValueChange={setQuery}
                className="h-[58px] border-0 text-sm shadow-none focus-visible:ring-0"
              />

              <Kbd className="hidden sm:inline-flex">Esc</Kbd>
            </div>
          </div>

          <CommandList className="max-h-[min(65vh,480px)] p-2">
            <CommandEmpty>
              <div className="flex flex-col items-center gap-2 py-10 text-center">
                <div className="grid size-12 place-items-center rounded-2xl border border-border bg-muted/60">
                  <Search className="size-5 text-muted-foreground" />
                </div>
                <p className="text-sm font-semibold">No results found</p>
                <p className="max-w-[240px] text-xs leading-relaxed text-muted-foreground">
                  Try another keyword or search for a page or action.
                </p>
              </div>
            </CommandEmpty>

            {recent.length > 0 && (
              <>
                <CommandGroup>
                  <SectionLabel>Recently visited</SectionLabel>

                  {recent.map((item) => (
                    <PremiumCommandItem
                      key={item.href}
                      value={`recent ${item.label}`}
                      onSelect={() => go(item.href, item.label)}
                    >
                      <div className="grid size-8 shrink-0 place-items-center rounded-lg bg-muted/80">
                        <History className={iconClass} />
                      </div>

                      <span className="min-w-0 flex-1 truncate">
                        {item.label}
                      </span>

                      <ChevronRight className="size-3.5 text-muted-foreground opacity-0 transition-opacity group-data-[selected=true]:opacity-100" />
                    </PremiumCommandItem>
                  ))}
                </CommandGroup>

                <CommandSeparator className="my-2" />
              </>
            )}

            <CommandGroup>
              <SectionLabel>Explore pages</SectionLabel>

              {pages.map((item) => {
                const Icon = item.icon ?? FileText;
                const hint = hintFor(item.href);

                return (
                  <PremiumCommandItem
                    key={item.href}
                    value={`${item.label} ${item.description ?? ""}`}
                    onSelect={() => go(item.href, item.label)}
                  >
                    <div className="grid size-8 shrink-0 place-items-center rounded-lg bg-muted/80 transition-colors group-data-[selected=true]:bg-background">
                      <Icon className={iconClass} />
                    </div>

                    <span className="min-w-0 flex-1 truncate text-[13px] font-medium">
                      {item.label}
                    </span>

                    {item.description && (
                      <span className="hidden max-w-[180px] truncate text-xs text-muted-foreground md:block">
                        {item.description}
                      </span>
                    )}

                    {hint && singleKey && (
                      <span className="hidden sm:inline-flex">
                        <Keys keys={hint} />
                      </span>
                    )}

                    <ChevronRight className="size-3.5 text-muted-foreground opacity-0 transition-opacity group-data-[selected=true]:opacity-100" />
                  </PremiumCommandItem>
                );
              })}
            </CommandGroup>

            <CommandSeparator className="my-2" />

            <CommandGroup>
              <SectionLabel>
                {user ? "Your account" : "Get started"}
              </SectionLabel>

              {accountItems.map(({ href, label, icon: Icon }) => {
                const hint = hintFor(href);

                return (
                  <PremiumCommandItem
                    key={href}
                    value={label}
                    onSelect={() => go(href, label)}
                  >
                    <div className="grid size-8 shrink-0 place-items-center rounded-lg bg-muted/80">
                      <Icon className={iconClass} />
                    </div>

                    <span className="flex-1 text-[13px] font-medium">
                      {label}
                    </span>

                    {hint && singleKey && (
                      <span className="hidden sm:inline-flex">
                        <Keys keys={hint} />
                      </span>
                    )}

                    <ChevronRight className="size-3.5 text-muted-foreground opacity-0 transition-opacity group-data-[selected=true]:opacity-100" />
                  </PremiumCommandItem>
                );
              })}
            </CommandGroup>

            <CommandSeparator className="my-2" />

            <CommandGroup>
              <SectionLabel>Quick actions</SectionLabel>

              <PremiumCommandItem value="Copy page link" onSelect={copyLink}>
                <div className="grid size-8 shrink-0 place-items-center rounded-lg bg-muted/80">
                  {copied ? (
                    <Check className="size-4 text-emerald-500" />
                  ) : (
                    <Link2 className={iconClass} />
                  )}
                </div>

                <span className="flex-1 text-[13px] font-medium">
                  {copied ? "Link copied" : "Copy page link"}
                </span>

                <span role="status" className="sr-only">
                  {copied ? "Page link copied to clipboard" : ""}
                </span>
              </PremiumCommandItem>

              <PremiumCommandItem
                value="Scroll to top"
                onSelect={() => run(scrollToTop)}
              >
                <div className="grid size-8 shrink-0 place-items-center rounded-lg bg-muted/80">
                  <ArrowUp className={iconClass} />
                </div>

                <span className="flex-1 text-[13px] font-medium">
                  Scroll to top
                </span>
              </PremiumCommandItem>

              <PremiumCommandItem
                value="Go back previous page"
                onSelect={() => run(() => router.back())}
              >
                <div className="grid size-8 shrink-0 place-items-center rounded-lg bg-muted/80">
                  <ArrowLeft className={iconClass} />
                </div>

                <span className="flex-1 text-[13px] font-medium">Go back</span>
              </PremiumCommandItem>

              <PremiumCommandItem
                value="Keyboard shortcuts help"
                onSelect={() => run(() => setHelpOpen(true))}
              >
                <div className="grid size-8 shrink-0 place-items-center rounded-lg bg-muted/80">
                  <Keyboard className={iconClass} />
                </div>

                <span className="flex-1 text-[13px] font-medium">
                  Keyboard shortcuts
                </span>

                {singleKey && <Kbd>?</Kbd>}
              </PremiumCommandItem>
            </CommandGroup>

            <CommandSeparator className="my-2" />

            <CommandGroup>
              <SectionLabel>Appearance</SectionLabel>

              {THEMES.map(({ value, label, icon: Icon }) => {
                const active = theme === value;

                return (
                  <PremiumCommandItem
                    key={value}
                    value={label}
                    onSelect={() => run(() => setTheme(value))}
                  >
                    <div className="grid size-8 shrink-0 place-items-center rounded-lg bg-muted/80">
                      <Icon className={iconClass} />
                    </div>

                    <span className="flex-1 text-[13px] font-medium">
                      {label}
                    </span>

                    {active && (
                      <Check
                        aria-label="Current theme"
                        className="size-4 text-primary"
                      />
                    )}
                  </PremiumCommandItem>
                );
              })}
            </CommandGroup>
          </CommandList>

          {/* Keyboard hints footer */}
          <div className="hidden items-center justify-between gap-3 border-t border-border/70 bg-muted/20 px-4 py-3 text-[10px] text-muted-foreground sm:flex">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1.5">
                <Kbd>↑</Kbd>
                <Kbd>↓</Kbd>
                Navigate
              </span>

              <span className="flex items-center gap-1.5">
                <Kbd>↵</Kbd>
                Select
              </span>

              <span className="flex items-center gap-1.5">
                <Kbd>Esc</Kbd>
                Close
              </span>
            </div>

            <span className="flex items-center gap-1.5">
              <Kbd>?</Kbd>
              Shortcuts
            </span>
          </div>
        </Command>
      </CommandDialog>

      {/* Keyboard shortcut help dialog */}
      <Dialog open={helpOpen} onOpenChange={setHelpOpen}>
        <DialogContent className="max-h-[85vh] overflow-y-auto rounded-2xl sm:max-w-md">
          <DialogHeader>
            <div className="mb-2 grid size-11 place-items-center rounded-2xl border border-border bg-muted/70">
              <Keyboard className="size-5 text-foreground" />
            </div>

            <DialogTitle className="text-xl font-bold tracking-tight">
              Keyboard shortcuts
            </DialogTitle>

            <DialogDescription>
              Navigate Apni University faster without leaving your keyboard.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-3">
            <ShortcutSection title="Search and navigation">
              <ShortcutRow label="Open search">
                <Keys keys={["Alt", "K"]} joiner="+" />
              </ShortcutRow>

              <ShortcutRow label="Show shortcut guide">
                <Kbd>?</Kbd>
              </ShortcutRow>

              <ShortcutRow label="Close dialog">
                <Kbd>Esc</Kbd>
              </ShortcutRow>
            </ShortcutSection>

            <div className="h-px bg-border/70" />

            <ShortcutSection title="Quick navigation">
              {visibleNav.map((shortcut) => (
                <ShortcutRow key={shortcut.href} label={shortcut.label}>
                  <Keys keys={shortcut.keys} />
                </ShortcutRow>
              ))}
            </ShortcutSection>

            <div className="h-px bg-border/70" />

            <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-border/80 bg-muted/30 p-3.5 transition-colors hover:bg-muted/50">
              <input
                type="checkbox"
                checked={singleKey}
                onChange={(event) => changeSingleKey(event.target.checked)}
                className="mt-0.5 size-4 shrink-0 accent-[#8B5CF6]"
              />

              <span className="min-w-0">
                <span className="block text-sm font-semibold">
                  Enable single-key shortcuts
                </span>

                <span className="mt-1 block text-xs leading-relaxed text-muted-foreground">
                  Enables the question-mark shortcut and two-key G navigation
                  sequences. Alt + K always works.
                </span>
              </span>
            </label>
          </div>
        </DialogContent>
      </Dialog>

      {/* One-time keyboard shortcut tip */}
      {tip && !open && !helpOpen && (
        <div
          role="status"
          className={cn(
            "fixed bottom-5 right-5 z-[60] hidden w-full max-w-sm",
            "items-start gap-3 rounded-2xl border border-border",
            "bg-popover p-4 text-popover-foreground",
            "shadow-2xl shadow-black/10 md:flex",
          )}
        >
          <div className="relative grid size-10 shrink-0 place-items-center overflow-hidden rounded-xl border border-border bg-muted/60">
            <span
              aria-hidden="true"
              className="absolute inset-x-0 top-0 h-[2px]"
              style={{
                background: `linear-gradient(to right, ${BRAND_YELLOW}, ${BRAND_PURPLE})`,
              }}
            />
            <CommandIcon className="size-4" />
          </div>

          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold">Work smarter with search</p>

            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
              Press <Kbd className="mx-0.5">Alt</Kbd>
              <span className="text-muted-foreground">+</span>
              <Kbd className="mx-0.5">K</Kbd>
              to jump to pages and actions instantly.
            </p>

            <button
              type="button"
              onClick={openPalette}
              className="mt-3 inline-flex items-center gap-1.5 text-xs font-bold text-foreground underline decoration-border underline-offset-4 transition-colors hover:decoration-foreground"
            >
              Try it now
              <ChevronRight className="size-3.5" />
            </button>
          </div>

          <button
            type="button"
            onClick={markTipSeen}
            aria-label="Dismiss keyboard shortcut tip"
            className="grid size-7 shrink-0 place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <X className="size-4" />
          </button>
        </div>
      )}
    </>
  );
}

/**
 * Navbar search trigger.
 *
 * Use:
 * <CommandTrigger />
 *
 * The palette opens with Alt + K or this button.
 */
export function CommandTrigger({ className }) {
  return (
    <button
      type="button"
      onClick={() => {
        window.dispatchEvent(new Event(OPEN_EVENT));
      }}
      aria-label="Search pages and actions"
      className={cn(
        "group inline-flex h-9 items-center gap-2 rounded-xl",
        "border border-border/80 bg-background px-3",
        "text-sm text-muted-foreground",
        "outline-none transition-all duration-200",
        "hover:border-[#8B5CF6]/50 hover:bg-accent hover:text-foreground",
        "focus-visible:ring-2 focus-visible:ring-[#8B5CF6]",
        "active:scale-[0.98]",
        "motion-reduce:transition-none motion-reduce:active:scale-100",
        className,
      )}
    >
      <Search className="size-4 shrink-0 transition-transform duration-200 group-hover:scale-110" />

      <span className="hidden xl:inline">Search</span>

      <span className="hidden items-center gap-1 rounded-md border border-border bg-muted/70 px-1.5 py-1 text-[10px] font-medium text-muted-foreground sm:inline-flex">
        <span>Alt</span>
        <span className="opacity-50">+</span>
        <span>K</span>
      </span>
    </button>
  );
}

export default CommandPalette;
