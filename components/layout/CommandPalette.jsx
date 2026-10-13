// components/layout/CommandPalette.jsx
// Quick search (Ctrl/⌘ + K), keyboard shortcuts, recent pages, and a one-time tip.
// Needs: npx shadcn@latest add command dialog
"use client";

import {
  Fragment,
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import {
  ArrowLeft,
  ArrowUp,
  Bell,
  BookOpen,
  Check,
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
const SINGLE_KEY = "apni:single-key-shortcuts"; // "off" turns the letter shortcuts off

// Same destinations as the account menu in AuthNav.
const ACCOUNT_ITEMS = [
  { href: "/student", label: "Dashboard", icon: LayoutDashboard },
  { href: "/student/profile", label: "Profile", icon: User },
  { href: "/student/courses", label: "My Courses", icon: BookOpen },
  { href: "/student/notifications", label: "Notifications", icon: Bell },
  { href: "/student/settings", label: "Settings", icon: Settings },
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

// "G then X" shortcuts. `when` limits an entry to signed-in or signed-out visitors.
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
  { keys: ["g", "l"], label: "Go to log in", href: "/login", when: "guest" },
];

const itemClass = "cursor-pointer gap-2.5";
const iconClass = "size-4 text-muted-foreground";

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

function useIsMac() {
  return useSyncExternalStore(
    () => () => {},
    () => /Mac|iPhone|iPad/i.test(navigator.userAgent),
    () => false,
  );
}

function isTyping(el) {
  if (!el || !el.tagName) return false;
  const tag = el.tagName;
  return (
    tag === "INPUT" ||
    tag === "TEXTAREA" ||
    tag === "SELECT" ||
    el.isContentEditable ||
    el.getAttribute?.("role") === "textbox"
  );
}

// Only same-site paths are ever stored or followed.
const safePath = (v) =>
  typeof v === "string" && v.startsWith("/") && !v.startsWith("//");

function readRecent() {
  try {
    const v = JSON.parse(localStorage.getItem(RECENT_KEY) || "[]");
    return Array.isArray(v)
      ? v
          .filter((x) => x && safePath(x.href) && typeof x.label === "string")
          .slice(0, 5)
      : [];
  } catch {
    return [];
  }
}

function pushRecent(item) {
  try {
    const next = [item, ...readRecent().filter((r) => r.href !== item.href)];
    localStorage.setItem(RECENT_KEY, JSON.stringify(next.slice(0, 5)));
  } catch {
    /* storage can be blocked: ignore */
  }
}

function Kbd({ children, className }) {
  return (
    <kbd
      className={cn(
        "inline-flex min-w-5 items-center justify-center rounded border border-border bg-muted px-1.5 py-0.5 font-sans text-[11px] font-medium uppercase text-muted-foreground",
        className,
      )}
    >
      {children}
    </kbd>
  );
}

// ["g","h"] with joiner "then" -> G then H;  ["Ctrl","K"] with "+" -> Ctrl + K
function Keys({ keys, joiner = "then" }) {
  return (
    <span className="inline-flex items-center gap-1">
      {keys.map((k, i) => (
        <Fragment key={`${k}-${i}`}>
          {i > 0 && (
            <span className="text-[10px] text-muted-foreground">{joiner}</span>
          )}
          <Kbd>{k}</Kbd>
        </Fragment>
      ))}
    </span>
  );
}

function ShortcutSection({ title, children }) {
  return (
    <section>
      <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {title}
      </h3>
      <ul className="space-y-2">{children}</ul>
    </section>
  );
}

function ShortcutRow({ label, children }) {
  return (
    <li className="flex items-center justify-between gap-4 text-sm text-foreground">
      <span>{label}</span>
      {children}
    </li>
  );
}

/* ------------------------------------------------------------------ */
/* Palette                                                             */
/* ------------------------------------------------------------------ */

export function CommandPalette() {
  const router = useRouter();
  const { user } = useAuth();
  const { theme, setTheme } = useTheme();
  const mac = useIsMac();
  const mod = mac ? "⌘" : "Ctrl";

  const [open, setOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [copied, setCopied] = useState(false);
  const [tip, setTip] = useState(false);
  const [singleKey, setSingleKey] = useState(true);
  const gAt = useRef(0); // when "g" was pressed, for the "G then X" shortcuts

  const visibleNav = NAV_SHORTCUTS.filter(
    (s) => !s.when || (s.when === "auth") === Boolean(user),
  );
  const hintFor = (href) => visibleNav.find((s) => s.href === href)?.keys;

  const markTipSeen = useCallback(() => {
    setTip(false);
    try {
      localStorage.setItem(TIP_KEY, "1");
    } catch {
      /* ignore */
    }
  }, []);

  const openPalette = useCallback(() => {
    setQuery("");
    setOpen(true);
    markTipSeen(); // they found it, no need to show the tip
  }, [markTipSeen]);

  function handleOpenChange(next) {
    setOpen(next);
    if (!next) setQuery("");
  }

  // Load the saved "single-key shortcuts" choice
  useEffect(() => {
    try {
      if (localStorage.getItem(SINGLE_KEY) === "off") setSingleKey(false);
    } catch {
      /* ignore */
    }
  }, []);

  function changeSingleKey(on) {
    setSingleKey(on);
    try {
      localStorage.setItem(SINGLE_KEY, on ? "on" : "off");
    } catch {
      /* ignore */
    }
  }

  // Keyboard: Ctrl/⌘ + K always works; "?" and "G then X" respect the setting above.
  useEffect(() => {
    const onKey = (e) => {
      // Some events (e.g. browser autofill) arrive without a `key`, so guard it.
      if (typeof e.key !== "string") return;

      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setQuery("");
        setOpen((v) => !v);
        markTipSeen();
        return;
      }

      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (!singleKey || open || helpOpen || isTyping(e.target)) return;

      if (e.key === "?") {
        e.preventDefault();
        setHelpOpen(true);
        markTipSeen();
        return;
      }

      const key = e.key.toLowerCase();

      if (gAt.current && Date.now() - gAt.current < 1200) {
        gAt.current = 0;
        const match = visibleNav.find((s) => s.keys[1] === key);
        if (match) {
          e.preventDefault();
          router.push(match.href);
        }
        return;
      }

      if (key === "g") gAt.current = Date.now();
    };

    window.addEventListener("keydown", onKey);
    window.addEventListener(OPEN_EVENT, openPalette);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener(OPEN_EVENT, openPalette);
    };
  }, [router, singleKey, open, helpOpen, visibleNav, openPalette, markTipSeen]);

  // One-time tip for people with a keyboard and mouse. Hidden on touch devices.
  useEffect(() => {
    let seen = false;
    try {
      seen = localStorage.getItem(TIP_KEY) === "1";
    } catch {
      /* ignore */
    }
    const fine = window.matchMedia(
      "(hover: hover) and (pointer: fine)",
    ).matches;
    if (seen || !fine) return;

    const show = setTimeout(() => setTip(true), 3000);
    const hide = setTimeout(() => setTip(false), 15000);
    return () => {
      clearTimeout(show);
      clearTimeout(hide);
    };
  }, []);

  // "Link copied" resets after a moment
  useEffect(() => {
    if (!copied) return;
    const t = setTimeout(() => setCopied(false), 1600);
    return () => clearTimeout(t);
  }, [copied]);

  const run = useCallback((fn) => {
    setOpen(false);
    setQuery("");
    fn();
  }, []);

  const go = (href, label) =>
    run(() => {
      pushRecent({ href, label });
      router.push(href);
    });

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
    } catch {
      /* clipboard can be blocked (insecure context): ignore */
    }
  }

  function scrollToTop() {
    const calm = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top: 0, behavior: calm ? "auto" : "smooth" });
  }

  const pages = [...primaryNav, ...moreNav];
  const accountItems = user ? ACCOUNT_ITEMS : GUEST_ITEMS;
  const recent = open && !query ? readRecent() : [];

  return (
    <>
      <CommandDialog open={open} onOpenChange={handleOpenChange}>
        {/* This version of CommandDialog does not wrap its children in <Command>,
            and CommandInput / CommandList need that context. */}
        <Command>
          <CommandInput
            placeholder="Search pages and actions…"
            value={query}
            onValueChange={setQuery}
          />
          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>

            {recent.length > 0 && (
              <>
                <CommandGroup heading="Recent">
                  {recent.map((r) => (
                    <CommandItem
                      key={r.href}
                      value={`recent ${r.label}`}
                      onSelect={() => go(r.href, r.label)}
                      className={itemClass}
                    >
                      <History aria-hidden="true" className={iconClass} />
                      {r.label}
                    </CommandItem>
                  ))}
                </CommandGroup>
                <CommandSeparator />
              </>
            )}

            <CommandGroup heading="Pages">
              {pages.map((l) => {
                const Icon = l.icon ?? FileText;
                const hint = hintFor(l.href);
                return (
                  <CommandItem
                    key={l.href}
                    value={`${l.label} ${l.description ?? ""}`}
                    onSelect={() => go(l.href, l.label)}
                    className={itemClass}
                  >
                    <Icon aria-hidden="true" className={iconClass} />
                    <span className="flex-1">{l.label}</span>
                    {l.description ? (
                      <span className="hidden truncate text-xs text-muted-foreground sm:block">
                        {l.description}
                      </span>
                    ) : null}
                    {hint && singleKey ? (
                      <span className="hidden sm:inline-flex">
                        <Keys keys={hint} />
                      </span>
                    ) : null}
                  </CommandItem>
                );
              })}
            </CommandGroup>

            <CommandSeparator />

            <CommandGroup heading={user ? "Your account" : "Account"}>
              {accountItems.map(({ href, label, icon: Icon }) => {
                const hint = hintFor(href);
                return (
                  <CommandItem
                    key={href}
                    value={label}
                    onSelect={() => go(href, label)}
                    className={itemClass}
                  >
                    <Icon aria-hidden="true" className={iconClass} />
                    <span className="flex-1">{label}</span>
                    {hint && singleKey ? (
                      <span className="hidden sm:inline-flex">
                        <Keys keys={hint} />
                      </span>
                    ) : null}
                  </CommandItem>
                );
              })}
            </CommandGroup>

            <CommandSeparator />

            <CommandGroup heading="Actions">
              <CommandItem
                value="Copy page link"
                onSelect={copyLink}
                className={itemClass}
              >
                {copied ? (
                  <Check
                    aria-hidden="true"
                    className="size-4 text-emerald-700 dark:text-emerald-400"
                  />
                ) : (
                  <Link2 aria-hidden="true" className={iconClass} />
                )}
                <span className="flex-1">
                  {copied ? "Link copied" : "Copy page link"}
                </span>
                <span role="status" className="sr-only">
                  {copied ? "Page link copied to clipboard" : ""}
                </span>
              </CommandItem>
              <CommandItem
                value="Scroll to top"
                onSelect={() => run(scrollToTop)}
                className={itemClass}
              >
                <ArrowUp aria-hidden="true" className={iconClass} />
                Scroll to top
              </CommandItem>
              <CommandItem
                value="Go back"
                onSelect={() => run(() => router.back())}
                className={itemClass}
              >
                <ArrowLeft aria-hidden="true" className={iconClass} />
                Go back
              </CommandItem>
              <CommandItem
                value="Keyboard shortcuts help"
                onSelect={() => run(() => setHelpOpen(true))}
                className={itemClass}
              >
                <Keyboard aria-hidden="true" className={iconClass} />
                <span className="flex-1">Keyboard shortcuts</span>
                {singleKey ? (
                  <span className="hidden sm:inline-flex">
                    <Kbd>?</Kbd>
                  </span>
                ) : null}
              </CommandItem>
            </CommandGroup>

            <CommandSeparator />

            <CommandGroup heading="Appearance">
              {THEMES.map(({ value, label, icon: Icon }) => (
                <CommandItem
                  key={value}
                  value={label}
                  onSelect={() => run(() => setTheme(value))}
                  className={itemClass}
                >
                  <Icon aria-hidden="true" className={iconClass} />
                  <span className="flex-1">{label}</span>
                  {theme === value ? (
                    <Check
                      aria-label="Current theme"
                      className="size-4 text-primary"
                    />
                  ) : null}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>

          {/* Hints for the palette itself */}
          <div
            aria-hidden="true"
            className="hidden items-center justify-between gap-3 border-t border-border px-3 py-2 text-xs text-muted-foreground sm:flex"
          >
            <span className="inline-flex items-center gap-3">
              <span className="inline-flex items-center gap-1">
                <Kbd>↑</Kbd>
                <Kbd>↓</Kbd> Navigate
              </span>
              <span className="inline-flex items-center gap-1">
                <Kbd>↵</Kbd> Select
              </span>
              <span className="inline-flex items-center gap-1">
                <Kbd>Esc</Kbd> Close
              </span>
            </span>
            {singleKey ? (
              <span className="inline-flex items-center gap-1">
                <Kbd>?</Kbd> All shortcuts
              </span>
            ) : null}
          </div>
        </Command>
      </CommandDialog>

      {/* Keyboard shortcuts help */}
      <Dialog open={helpOpen} onOpenChange={setHelpOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Keyboard shortcuts</DialogTitle>
            <DialogDescription>
              Move around faster without the mouse.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-5">
            <ShortcutSection title="General">
              <ShortcutRow label="Open search and actions">
                <Keys keys={[mod, "K"]} joiner="+" />
              </ShortcutRow>
              <ShortcutRow label="Show this list">
                <Kbd>?</Kbd>
              </ShortcutRow>
              <ShortcutRow label="Close any dialog">
                <Kbd>Esc</Kbd>
              </ShortcutRow>
            </ShortcutSection>

            <ShortcutSection title="Go to">
              {visibleNav.map((s) => (
                <ShortcutRow key={s.href} label={s.label}>
                  <Keys keys={s.keys} />
                </ShortcutRow>
              ))}
            </ShortcutSection>

            <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-border bg-muted/40 p-3 text-sm">
              <input
                type="checkbox"
                checked={singleKey}
                onChange={(e) => changeSingleKey(e.target.checked)}
                className="mt-0.5 size-4 shrink-0 accent-[var(--primary)]"
              />
              <span>
                <span className="font-medium text-foreground">
                  Single-key shortcuts
                </span>
                <span className="block text-xs text-muted-foreground">
                  Turns <Kbd className="mx-0.5">?</Kbd> and the G shortcuts on
                  or off. {mod} + K always works.
                </span>
              </span>
            </label>
          </div>
        </DialogContent>
      </Dialog>

      {/* One-time tip so people discover the shortcut */}
      {tip && !open ? (
        <div
          role="status"
          className="fixed bottom-4 right-4 z-40 hidden max-w-xs items-start gap-3 rounded-xl border border-border bg-popover p-3 pr-2 text-sm text-popover-foreground shadow-lg shadow-foreground/10 md:flex"
        >
          <Search
            aria-hidden="true"
            className="mt-0.5 size-4 shrink-0 text-primary"
          />
          <p className="leading-snug">
            Tip: press <Keys keys={[mod, "K"]} joiner="+" /> to search anywhere,
            or <Kbd>?</Kbd> to see all shortcuts.
          </p>
          <button
            type="button"
            onClick={markTipSeen}
            aria-label="Dismiss tip"
            className="grid size-7 shrink-0 place-items-center rounded-md text-muted-foreground outline-none transition-colors hover:bg-accent hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
          >
            <X aria-hidden="true" className="size-4" />
          </button>
        </div>
      ) : null}
    </>
  );
}

// A search-style button for the Navbar that opens the palette.
export function CommandTrigger({ className }) {
  const mac = useIsMac();

  return (
    <button
      type="button"
      onClick={() => window.dispatchEvent(new Event(OPEN_EVENT))}
      aria-label="Search pages and actions"
      className={cn(
        "group inline-flex h-9 items-center gap-2 rounded-full border border-border bg-background px-3 text-sm text-muted-foreground outline-none transition-[background-color,border-color,color,box-shadow] duration-200",
        "hover:border-primary/40 hover:bg-accent hover:text-foreground hover:shadow-sm active:scale-95",
        "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        "motion-reduce:transition-none motion-reduce:active:scale-100",
        className,
      )}
    >
      <Search aria-hidden="true" className="size-4" />
      <span className="hidden xl:inline">Search</span>
      <kbd className="hidden rounded border border-border bg-muted px-1.5 py-0.5 font-sans text-[10px] font-medium text-muted-foreground xl:inline">
        {mac ? "⌘" : "Ctrl"} K
      </kbd>
    </button>
  );
}
