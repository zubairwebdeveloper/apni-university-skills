"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { signOut } from "firebase/auth";
import {
  AnimatePresence,
  MotionConfig,
  motion,
  useReducedMotion,
  useScroll,
  useSpring,
} from "framer-motion";
import {
  ArrowRight,
  BookOpen,
  ChevronDown,
  ClipboardCheck,
  CornerDownLeft,
  Compass,
  Flame,
  History,
  LayoutDashboard,
  LifeBuoy,
  Library,
  Loader2,
  LogOut,
  Search,
  Settings,
  Sparkles,
  Target,
  Trophy,
  UserRound,
  Users,
  Video,
  X,
  Zap,
} from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { auth } from "@/lib/firebase/client/auth";
import { StudentMobileNav } from "./StudentMobileNav";
import { StudentNotificationsMenu } from "./StudentNotificationsMenu";
import {
  NAV_LINKS,
  SEARCH_SUGGESTIONS,
  TECH_TICKER,
  USER_MENU,
} from "@/lib/student-header-data";

const RECENT_KEY = "student-recent-searches";
const TICKER_KEY = "student-ticker-dismissed";
const XP_PER_LEVEL = 500;
const SESSION_ENDPOINT = "/api/auth/session"; // route that clears the session cookie

/* Design tokens: yellow = progress / key highlights, violet = selected states */
const FOCUS =
  "outline-none focus-visible:ring-2 focus-visible:ring-[#8B5CF6] focus-visible:ring-offset-2 focus-visible:ring-offset-background";
const SELECTED_TEXT = "text-violet-700 dark:text-violet-300";

const RING_R = 20;
const RING_C = 2 * Math.PI * RING_R;

const ICONS = {
  dashboard: LayoutDashboard,
  book: BookOpen,
  video: Video,
  users: Users,
  library: Library,
  user: UserRound,
  trophy: Trophy,
  settings: Settings,
  help: LifeBuoy,
};

const QUICK_ACTIONS = [
  {
    label: "Continue learning",
    description: "Pick up where you left off",
    href: "/student/courses",
    icon: BookOpen,
  },
  {
    label: "Join live class",
    description: "Find upcoming sessions",
    href: "/student/live",
    icon: Video,
  },
  {
    label: "Assignments",
    description: "Review your next task",
    href: "/student/assignments",
    icon: ClipboardCheck,
  },
  {
    label: "Learning library",
    description: "Open notes and resources",
    href: "/student/library",
    icon: Library,
  },
];

const KIND_LABEL = {
  query: "Search",
  recent: "Recent",
  link: "Go to",
  suggestion: "Topic",
};

const toNumber = (value) => Math.max(0, Number(value) || 0);

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

function Shortcut({ children }) {
  return (
    <kbd className="inline-flex h-5 min-w-5 items-center justify-center rounded-md border border-border bg-background px-1.5 font-mono text-[10px] font-semibold text-muted-foreground shadow-[0_1px_0_0_var(--border)]">
      {children}
    </kbd>
  );
}

/* Avatar wrapped in an XP progress ring with a level badge */
function LevelRing({ progress, level, children }) {
  return (
    <span className="relative inline-flex size-11 shrink-0 items-center justify-center">
      <svg
        aria-hidden="true"
        viewBox="0 0 44 44"
        className="absolute inset-0 size-full -rotate-90"
      >
        <circle
          cx="22"
          cy="22"
          r={RING_R}
          fill="none"
          strokeWidth="2.5"
          className="stroke-border"
        />
        <motion.circle
          cx="22"
          cy="22"
          r={RING_R}
          fill="none"
          strokeWidth="2.5"
          strokeLinecap="round"
          className="stroke-[#FACC15]"
          strokeDasharray={RING_C}
          initial={{ strokeDashoffset: RING_C }}
          animate={{ strokeDashoffset: RING_C * (1 - progress / 100) }}
          transition={{ duration: 0.9, ease: "easeOut" }}
        />
      </svg>
      {children}
      <span className="absolute -bottom-1 -right-1 flex h-[18px] min-w-[18px] items-center justify-center rounded-full border-2 border-background bg-[#8B5CF6] px-1 text-[9px] font-bold leading-none text-white">
        {level}
      </span>
    </span>
  );
}

function StatTile({ icon: Icon, value, label, iconClass }) {
  return (
    <div className="rounded-xl border border-border/70 bg-muted/40 px-2 py-2.5 text-center">
      <Icon className={cn("mx-auto mb-1.5 size-4", iconClass)} />
      <span className="block text-sm font-bold tabular-nums leading-none">
        {value}
      </span>
      <span className="mt-1 block text-[10px] font-medium text-muted-foreground">
        {label}
      </span>
    </div>
  );
}

/* ---------------- Global search (mounted only while open) ---------------- */
function SearchPanel({
  onClose,
  onSearch,
  onNavigate,
  suggestions,
  recent,
  onClearRecent,
  modKey,
}) {
  const [value, setValue] = useState("");
  const [active, setActive] = useState(0);
  const inputRef = useRef(null);
  const dialogRef = useRef(null);

  // Lock page scroll, focus the input, and give focus back on close
  useEffect(() => {
    const previouslyFocused = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const id = window.setTimeout(() => inputRef.current?.focus(), 40);

    return () => {
      window.clearTimeout(id);
      document.body.style.overflow = previousOverflow;
      previouslyFocused?.focus?.();
    };
  }, []);

  // Escape closes from anywhere inside the dialog; Tab stays trapped in it
  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }

      if (event.key === "Tab") {
        const nodes = dialogRef.current?.querySelectorAll(
          'input, button:not([tabindex="-1"])',
        );
        if (!nodes || !nodes.length) return;
        const first = nodes[0];
        const last = nodes[nodes.length - 1];

        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  const query = value.trim();

  const results = useMemo(() => {
    const q = query.toLowerCase();
    const out = [];

    if (q) {
      out.push({
        kind: "query",
        label: `Search courses for “${query}”`,
        hint: "Find matching courses across the catalog",
        icon: Search,
        query,
      });
    } else {
      recent.forEach((label) =>
        out.push({
          kind: "recent",
          label,
          hint: "Search again",
          icon: History,
        }),
      );
      QUICK_ACTIONS.forEach((a) =>
        out.push({
          kind: "link",
          label: a.label,
          hint: a.description,
          icon: a.icon,
          href: a.href,
        }),
      );
    }

    suggestions
      .filter(
        (s) =>
          !q ||
          String(s.label || "")
            .toLowerCase()
            .includes(q),
      )
      .slice(0, q ? 6 : 5)
      .forEach((s) => out.push({ ...s, kind: "suggestion" }));

    return out.slice(0, 11);
  }, [query, recent, suggestions]);

  const current = Math.min(active, Math.max(0, results.length - 1));

  useEffect(() => {
    document
      .getElementById(`search-opt-${current}`)
      ?.scrollIntoView({ block: "nearest" });
  }, [current]);

  const choose = (item) => {
    if (!item) return;
    if (item.kind === "query") return onSearch(item.query);
    if (item.href) return onNavigate(item.href);
    if (item.kind === "recent" || item.kind === "suggestion")
      return onSearch(item.label);
  };

  const headings = {
    recent: "Recent searches",
    link: "Quick links",
    suggestion: query ? "Suggestions" : "Suggested topics",
  };

  return (
    <motion.div
      className="fixed inset-0 z-[100] flex items-start justify-center overflow-y-auto bg-[#111318]/70 px-3 pb-6 pt-[8vh] backdrop-blur-sm sm:px-6 sm:pt-[12vh]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <motion.section
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label="Search"
        initial={{ opacity: 0, y: 18, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 10, scale: 0.98 }}
        transition={{ type: "spring", stiffness: 360, damping: 30 }}
        className="w-full max-w-2xl overflow-hidden rounded-2xl border border-border bg-background shadow-2xl"
      >
        <div className="flex items-center gap-3 border-b border-border px-3 sm:px-4">
          <Search className="size-5 shrink-0 text-[#8B5CF6]" />

          <Input
            ref={inputRef}
            value={value}
            onChange={(event) => {
              setValue(event.target.value);
              setActive(0);
            }}
            onKeyDown={(event) => {
              if (event.key === "ArrowDown" && results.length) {
                event.preventDefault();
                setActive((i) => (i + 1) % results.length);
              } else if (event.key === "ArrowUp" && results.length) {
                event.preventDefault();
                setActive((i) => (i - 1 + results.length) % results.length);
              } else if (event.key === "Enter") {
                event.preventDefault();
                choose(results[current]);
              }
            }}
            placeholder="Search courses, lessons, resources…"
            className="h-14 min-w-0 border-0 bg-transparent px-0 text-sm shadow-none focus-visible:ring-0 sm:text-base"
            aria-label="Search courses and student pages"
            role="combobox"
            aria-expanded="true"
            aria-controls="search-results"
            aria-activedescendant={`search-opt-${current}`}
            autoComplete="off"
          />

          <span className="hidden sm:block">
            <Shortcut>Esc</Shortcut>
          </span>

          <button
            type="button"
            onClick={onClose}
            className={cn(
              "inline-flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
              FOCUS,
            )}
            aria-label="Close search"
          >
            <X className="size-4" />
          </button>
        </div>

        <div
          id="search-results"
          role="listbox"
          aria-label="Search results"
          className="max-h-[min(60vh,28rem)] overflow-y-auto p-2 sm:p-3"
        >
          {results.map((item, index) => {
            const ItemIcon = item.icon || Compass;
            const isActive = current === index;
            const showHeading =
              headings[item.kind] && results[index - 1]?.kind !== item.kind;

            return (
              <div key={`${item.kind}-${item.label}-${index}`}>
                {showHeading && (
                  <div className="mb-1 mt-3 flex items-center justify-between gap-2 px-2 first:mt-0">
                    <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground">
                      {headings[item.kind]}
                    </p>
                    {item.kind === "recent" && (
                      <button
                        type="button"
                        onClick={onClearRecent}
                        className={cn(
                          "cursor-pointer rounded-md px-1.5 py-0.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground",
                          FOCUS,
                        )}
                      >
                        Clear
                      </button>
                    )}
                  </div>
                )}

                <button
                  id={`search-opt-${index}`}
                  role="option"
                  aria-selected={isActive}
                  tabIndex={-1}
                  type="button"
                  onMouseEnter={() => setActive(index)}
                  onClick={() => choose(item)}
                  className={cn(
                    "flex w-full cursor-pointer items-center gap-3 rounded-xl px-2.5 py-2.5 text-left transition-colors",
                    isActive ? "bg-[#8B5CF6]/10" : "hover:bg-muted/70",
                  )}
                >
                  <span
                    className={cn(
                      "flex size-9 shrink-0 items-center justify-center rounded-lg border border-border bg-muted/40 text-muted-foreground transition-colors",
                      isActive && "border-[#8B5CF6] bg-[#8B5CF6] text-white",
                    )}
                  >
                    <ItemIcon className="size-[17px]" />
                  </span>

                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold">
                      {item.label}
                    </span>
                    <span className="mt-0.5 block truncate text-xs text-muted-foreground">
                      {item.hint || item.description || "Open this destination"}
                    </span>
                  </span>

                  <span className="hidden shrink-0 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground sm:inline">
                    {KIND_LABEL[item.kind]}
                  </span>

                  <CornerDownLeft
                    className={cn(
                      "size-4 shrink-0 text-[#8B5CF6] transition-opacity",
                      isActive ? "opacity-100" : "opacity-0",
                    )}
                  />
                </button>
              </div>
            );
          })}

          {!results.length && (
            <div className="px-4 py-12 text-center">
              <span className="mx-auto mb-3 flex size-12 items-center justify-center rounded-2xl border border-border bg-muted/50">
                <Search className="size-5 text-muted-foreground" />
              </span>
              <p className="text-sm font-semibold">Nothing to show yet</p>
              <p className="mx-auto mt-1 max-w-xs text-xs leading-relaxed text-muted-foreground">
                Start typing to search every course, or press {modKey}+K any
                time to open search from anywhere.
              </p>
            </div>
          )}
        </div>

        <footer className="flex flex-wrap items-center justify-between gap-2 border-t border-border bg-muted/30 px-3 py-3 text-[11px] text-muted-foreground sm:px-4">
          <span className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
            <span className="flex items-center gap-1.5">
              <Shortcut>↑</Shortcut>
              <Shortcut>↓</Shortcut>
              <span>Navigate</span>
            </span>
            <span className="flex items-center gap-1.5">
              <Shortcut>↵</Shortcut>
              <span>Open</span>
            </span>
          </span>
          <span className="tabular-nums">
            {results.length} {results.length === 1 ? "result" : "results"}
          </span>
        </footer>

        <div className="sr-only" aria-live="polite">
          {results.length} {results.length === 1 ? "result" : "results"}{" "}
          available
        </div>
      </motion.section>
    </motion.div>
  );
}

/* ---------------- Header ---------------- */
export function StudentHeader({ person, onSignOut }) {
  const router = useRouter();
  const pathname = usePathname();
  const reduceMotion = useReducedMotion();

  const [searchOpen, setSearchOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [greeting, setGreeting] = useState("Welcome");
  const [recent, setRecent] = useState([]);
  const [signingOut, setSigningOut] = useState(false);
  const [tickerIndex, setTickerIndex] = useState(0);
  const [tickerPaused, setTickerPaused] = useState(false);
  const [tickerHidden, setTickerHidden] = useState(false);
  const [isMac, setIsMac] = useState(false);

  const recentRef = useRef([]);

  // Thin reading-progress bar along the bottom edge of the header
  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, {
    stiffness: 140,
    damping: 24,
    restDelta: 0.001,
  });

  const name = person?.name || person?.displayName || "Student";
  const firstName = name.split(/\s+/)[0] || "Student";

  // Real values only: no made-up defaults
  const xp = toNumber(person?.xp);
  const streak = toNumber(person?.streak);
  const coursesCount = toNumber(person?.coursesCount);
  const dailyGoal = Math.min(100, toNumber(person?.dailyGoalProgress));

  const level = Math.floor(xp / XP_PER_LEVEL) + 1;
  const xpInLevel = xp % XP_PER_LEVEL;
  const levelProgress = (xpInLevel / XP_PER_LEVEL) * 100;

  const modKey = isMac ? "⌘" : "Ctrl";

  const tickers = Array.isArray(TECH_TICKER) ? TECH_TICKER : [];
  const ticker = tickers.length ? tickers[tickerIndex % tickers.length] : null;

  const initials =
    name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0])
      .join("")
      .toUpperCase() || "S";

  // Client-only values (kept out of the first render to avoid hydration mismatch)
  useEffect(() => {
    const id = window.setTimeout(() => {
      setGreeting(getGreeting());

      try {
        setIsMac(/Mac|iPhone|iPad|iPod/i.test(navigator.platform || ""));
      } catch {
        // ignore
      }

      try {
        const stored = JSON.parse(
          window.localStorage.getItem(RECENT_KEY) || "[]",
        );
        if (Array.isArray(stored)) {
          const clean = stored
            .filter((item) => typeof item === "string")
            .slice(0, 5);
          recentRef.current = clean;
          setRecent(clean);
        }
      } catch {
        // ignore malformed or unavailable storage
      }

      try {
        if (window.sessionStorage.getItem(TICKER_KEY) === "1")
          setTickerHidden(true);
      } catch {
        // ignore
      }
    }, 0);

    return () => window.clearTimeout(id);
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Auto-rotation stops for people who prefer reduced motion
  useEffect(() => {
    if (reduceMotion || tickerPaused || tickerHidden || tickers.length < 2)
      return undefined;
    const id = window.setInterval(
      () => setTickerIndex((index) => (index + 1) % tickers.length),
      4000,
    );
    return () => window.clearInterval(id);
  }, [reduceMotion, tickerPaused, tickerHidden, tickers.length]);

  const saveRecent = useCallback((label) => {
    const next = [
      label,
      ...recentRef.current.filter(
        (item) => item.toLowerCase() !== label.toLowerCase(),
      ),
    ].slice(0, 5);

    recentRef.current = next;
    setRecent(next);

    try {
      window.localStorage.setItem(RECENT_KEY, JSON.stringify(next));
    } catch {
      // search still works without storage
    }
  }, []);

  const clearRecent = useCallback(() => {
    recentRef.current = [];
    setRecent([]);
    try {
      window.localStorage.removeItem(RECENT_KEY);
    } catch {
      // ignore
    }
  }, []);

  const goSearch = useCallback(
    (rawQuery) => {
      const query = String(rawQuery || "").trim();
      if (!query) return;
      saveRecent(query);
      setSearchOpen(false);
      router.push(`/courses?q=${encodeURIComponent(query)}`);
    },
    [router, saveRecent],
  );

  const goTo = useCallback(
    (href) => {
      setSearchOpen(false);
      router.push(href);
    },
    [router],
  );

  // Ctrl/Cmd/Alt + K opens search, "/" too (when not typing in a field)
  useEffect(() => {
    const onKeyDown = (event) => {
      const tag = event.target?.tagName;
      const typing =
        tag === "INPUT" ||
        tag === "TEXTAREA" ||
        tag === "SELECT" ||
        event.target?.isContentEditable;

      const combo =
        (event.metaKey || event.ctrlKey || event.altKey) &&
        !event.shiftKey &&
        event.key.toLowerCase() === "k";

      if (combo || (event.key === "/" && !typing)) {
        event.preventDefault();
        setSearchOpen(true);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  // Server cookie first, then Firebase client, then redirect (avoids a login loop)
  const handleSignOut = useCallback(async () => {
    if (onSignOut) {
      onSignOut();
      return;
    }

    setSigningOut(true);

    try {
      await fetch(SESSION_ENDPOINT, { method: "DELETE" });
    } catch (error) {
      console.error("Failed to clear server session:", error);
    }

    try {
      await signOut(auth);
    } catch (error) {
      console.error("Failed to sign out:", error);
    }

    router.replace("/login");
    router.refresh();
  }, [onSignOut, router]);

  const isActive = (href) =>
    href === "/student"
      ? pathname === href
      : pathname === href || pathname?.startsWith(`${href}/`);

  const dismissTicker = () => {
    setTickerHidden(true);
    try {
      window.sessionStorage.setItem(TICKER_KEY, "1");
    } catch {
      // ignore
    }
  };

  const closeSearch = useCallback(() => setSearchOpen(false), []);

  return (
    <MotionConfig reducedMotion="user">
      <header className="sticky top-0 z-50 w-full">
        <div
          className={cn(
            "relative border-b transition-[background-color,box-shadow,border-color] duration-300",
            scrolled
              ? "border-border bg-background/95 shadow-[0_8px_24px_-16px_rgba(17,19,24,0.45)] backdrop-blur-md"
              : "border-border/60 bg-background",
          )}
        >
          <div className="mx-auto flex min-h-[64px] max-w-[1600px] items-center gap-2 px-3 sm:min-h-[68px] sm:gap-3 sm:px-5 lg:px-8">
            {/* Greeting (mobile + tablet, where the desktop nav is hidden) */}
            <div className="flex min-w-0 items-center gap-2.5 lg:hidden">
              <div className="min-w-0">
                <p className="truncate text-[11px] font-medium text-muted-foreground">
                  {greeting}
                </p>
                <p className="truncate text-sm font-bold leading-tight tracking-tight">
                  {firstName}
                </p>
              </div>
              <span className="hidden shrink-0 items-center gap-1 rounded-full border border-[#FACC15]/40 bg-[#FACC15]/10 px-2 py-0.5 text-[11px] font-bold text-amber-700 dark:text-[#FACC15] sm:inline-flex">
                <Zap className="size-3" />
                Level {level}
              </span>
            </div>

            {/* Desktop navigation */}
            <nav
              className="hidden min-w-0 flex-1 items-center gap-1 overflow-x-auto lg:flex [scrollbar-width:none]"
              aria-label="Student navigation"
            >
              {NAV_LINKS.map((item) => {
                const Icon = ICONS[item.icon] || Compass;
                const active = isActive(item.href);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "group relative flex shrink-0 items-center gap-2 rounded-xl px-3 py-2 text-[13px] font-semibold transition-colors",
                      FOCUS,
                      active
                        ? SELECTED_TEXT
                        : "text-muted-foreground hover:bg-muted/70 hover:text-foreground",
                    )}
                  >
                    {active && (
                      <motion.span
                        layoutId="student-nav-active"
                        className="absolute inset-0 rounded-xl border border-[#8B5CF6]/25 bg-[#8B5CF6]/10"
                        transition={{
                          type: "spring",
                          stiffness: 380,
                          damping: 30,
                        }}
                      />
                    )}

                    <Icon className="relative size-4 shrink-0 transition-transform duration-200 group-hover:scale-110" />
                    <span className="relative whitespace-nowrap">
                      {item.label}
                    </span>
                  </Link>
                );
              })}
            </nav>

            {/* Right cluster */}
            <div className="ml-auto flex shrink-0 items-center gap-1.5 sm:gap-2">
              {/* Streak and XP chips */}
              {(streak > 0 || xp > 0) && (
                <div className="mr-1 hidden items-center gap-1.5 xl:flex">
                  {streak > 0 && (
                    <span
                      title={`${streak}-day learning streak`}
                      className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-orange-500/25 bg-orange-500/10 px-2.5 text-xs font-bold tabular-nums text-orange-700 dark:text-orange-300"
                    >
                      <Flame className="size-4" />
                      {streak}
                      <span className="sr-only">day streak</span>
                    </span>
                  )}
                  <span
                    title={`${xp.toLocaleString()} XP total`}
                    className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-[#FACC15]/40 bg-[#FACC15]/10 px-2.5 text-xs font-bold tabular-nums text-amber-700 dark:text-[#FACC15]"
                  >
                    <Zap className="size-4" />
                    {xp.toLocaleString()}
                    <span className="sr-only">XP</span>
                  </span>
                </div>
              )}

              {/* Search trigger (wide) */}
              <button
                type="button"
                onClick={() => setSearchOpen(true)}
                className={cn(
                  "group hidden h-10 min-w-[200px] cursor-pointer items-center gap-2 rounded-xl border border-border bg-muted/40 px-3 text-left text-sm text-muted-foreground transition-all duration-200 hover:border-[#8B5CF6]/50 hover:bg-[#8B5CF6]/[0.05] hover:text-foreground xl:flex 2xl:min-w-[260px]",
                  FOCUS,
                )}
                aria-label={`Open search (${isMac ? "Command" : "Control"} plus K)`}
              >
                <Search className="size-4 shrink-0 transition-colors group-hover:text-[#8B5CF6]" />
                <span className="flex-1">Search courses…</span>
                <Shortcut>{modKey}</Shortcut>
                <Shortcut>K</Shortcut>
              </button>

              {/* Search trigger (compact) */}
              <button
                type="button"
                onClick={() => setSearchOpen(true)}
                aria-label="Open search"
                className={cn(
                  "inline-flex size-10 cursor-pointer items-center justify-center rounded-xl border border-border bg-background text-muted-foreground transition-all duration-200 hover:border-[#8B5CF6]/50 hover:bg-[#8B5CF6]/[0.06] hover:text-[#8B5CF6] active:scale-95 xl:hidden",
                  FOCUS,
                )}
              >
                <Search className="size-[18px]" />
              </button>

              {/* Real notifications from Firestore */}
              <StudentNotificationsMenu />

              {/* Profile */}
              <DropdownMenu>
                <DropdownMenuTrigger
                  aria-label="Open student profile menu"
                  className={cn(
                    "group flex cursor-pointer items-center gap-2 rounded-xl border border-transparent p-0.5 transition-colors hover:border-border hover:bg-muted/60 active:scale-[0.98] xl:pr-2",
                    FOCUS,
                  )}
                >
                  <LevelRing progress={levelProgress} level={level}>
                    <Avatar className="size-8">
                      <AvatarImage
                        src={person?.photoURL || person?.avatar || ""}
                        alt={name}
                      />
                      <AvatarFallback className="bg-[#8B5CF6]/10 text-[11px] font-bold text-violet-700 dark:text-violet-300">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                  </LevelRing>

                  <span className="hidden max-w-32 text-left xl:block">
                    <span className="block truncate text-[10px] text-muted-foreground">
                      {greeting}
                    </span>
                    <span className="block truncate text-xs font-bold">
                      {firstName}
                    </span>
                  </span>

                  {/* Base UI sets data-popup-open on the trigger */}
                  <ChevronDown className="hidden size-3.5 text-muted-foreground transition-transform duration-200 group-data-[popup-open]:rotate-180 xl:block" />
                </DropdownMenuTrigger>

                <DropdownMenuContent
                  align="end"
                  sideOffset={10}
                  className="w-[min(20rem,calc(100vw-1rem))] rounded-2xl p-2"
                >
                  {/* Profile summary (plain div: no group label needed) */}
                  <div className="px-2 pb-3 pt-2">
                    <div className="flex items-center gap-3">
                      <Avatar className="size-12 border border-border">
                        <AvatarImage
                          src={person?.photoURL || person?.avatar || ""}
                          alt=""
                        />
                        <AvatarFallback className="bg-[#8B5CF6]/10 text-sm font-bold text-violet-700 dark:text-violet-300">
                          {initials}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-bold tracking-tight">
                          {name}
                        </p>
                        <p className="truncate text-xs text-muted-foreground">
                          {person?.email || "Keep your learning streak alive"}
                        </p>
                      </div>
                    </div>

                    {/* Level progress */}
                    <div className="mt-3 rounded-xl border border-border/70 bg-muted/40 p-3">
                      <div className="flex items-center justify-between gap-2 text-xs">
                        <span className="inline-flex items-center gap-1.5 font-bold">
                          <Zap className="size-3.5 text-amber-600 dark:text-[#FACC15]" />
                          Level {level}
                        </span>
                        <span className="tabular-nums text-muted-foreground">
                          {xpInLevel}/{XP_PER_LEVEL} XP
                        </span>
                      </div>
                      <div
                        role="progressbar"
                        aria-label="Progress to next level"
                        aria-valuemin={0}
                        aria-valuemax={100}
                        aria-valuenow={Math.round(levelProgress)}
                        className="mt-2 h-1.5 overflow-hidden rounded-full bg-border"
                      >
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${levelProgress}%` }}
                          transition={{ duration: 0.6, ease: "easeOut" }}
                          className="h-full rounded-full bg-[#FACC15]"
                        />
                      </div>
                      <p className="mt-1.5 text-[11px] text-muted-foreground">
                        {XP_PER_LEVEL - xpInLevel} XP to reach level {level + 1}
                      </p>
                    </div>

                    <div className="mt-2 grid grid-cols-3 gap-2">
                      <StatTile
                        icon={Flame}
                        value={streak}
                        label="Day streak"
                        iconClass="text-orange-500"
                      />
                      <StatTile
                        icon={BookOpen}
                        value={coursesCount}
                        label="Courses"
                        iconClass="text-[#8B5CF6]"
                      />
                      <StatTile
                        icon={Target}
                        value={`${dailyGoal}%`}
                        label="Daily goal"
                        iconClass="text-emerald-500"
                      />
                    </div>
                  </div>

                  <DropdownMenuSeparator />

                  <p className="px-2 pb-1 pt-2 text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
                    Quick actions
                  </p>
                  {QUICK_ACTIONS.map((action) => {
                    const ActionIcon = action.icon;
                    return (
                      <DropdownMenuItem
                        key={action.href}
                        onClick={() => router.push(action.href)}
                        className="cursor-pointer gap-3 rounded-lg px-2 py-2"
                      >
                        <span className="flex size-8 shrink-0 items-center justify-center rounded-lg border border-border bg-background text-[#8B5CF6]">
                          <ActionIcon className="size-4" />
                        </span>
                        <span className="min-w-0">
                          <span className="block text-sm font-semibold">
                            {action.label}
                          </span>
                          <span className="block truncate text-xs text-muted-foreground">
                            {action.description}
                          </span>
                        </span>
                      </DropdownMenuItem>
                    );
                  })}

                  <DropdownMenuSeparator />

                  {(USER_MENU || []).map((item) => {
                    const Icon = ICONS[item.icon] || UserRound;
                    return (
                      <DropdownMenuItem
                        key={item.href || item.label}
                        onClick={() => item.href && router.push(item.href)}
                        className="cursor-pointer gap-2.5 rounded-lg px-2 py-2.5"
                      >
                        <Icon className="size-4 text-muted-foreground" />
                        {item.label}
                      </DropdownMenuItem>
                    );
                  })}

                  <DropdownMenuSeparator />

                  <DropdownMenuItem
                    onClick={handleSignOut}
                    disabled={signingOut}
                    className="cursor-pointer gap-2.5 rounded-lg px-2 py-2.5 text-destructive focus:text-destructive"
                  >
                    {signingOut ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      <LogOut className="size-4" />
                    )}
                    {signingOut ? "Signing out…" : "Sign out"}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Mobile and tablet navigation */}
          <div className="border-t border-border/60 lg:hidden">
            <div className="mx-auto flex max-w-[1600px] items-center justify-between gap-2 px-3 py-2 sm:px-5">
              <div className="min-w-0 flex-1">
                <StudentMobileNav />
              </div>
            </div>
          </div>

          {/* Scroll progress */}
          <motion.div
            aria-hidden
            style={{ scaleX: reduceMotion ? scrollYProgress : progress }}
            className="absolute inset-x-0 bottom-[-1px] h-0.5 origin-left bg-[#FACC15]"
          />
        </div>

        {/* Explore ticker */}
        {ticker && !tickerHidden && (
          <div className="border-b border-border/70 bg-muted/30">
            <div className="mx-auto flex max-w-[1600px] items-center gap-2 px-3 py-1.5 sm:gap-3 sm:px-6 lg:px-8">
              <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-[#FACC15] px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-[0.12em] text-[#111318]">
                <Sparkles className="size-3" />
                Explore
              </span>

              <Link
                href={
                  ticker.href ||
                  `/courses?q=${encodeURIComponent(ticker.label || "")}`
                }
                onMouseEnter={() => setTickerPaused(true)}
                onMouseLeave={() => setTickerPaused(false)}
                onFocus={() => setTickerPaused(true)}
                onBlur={() => setTickerPaused(false)}
                className={cn(
                  "group flex min-w-0 flex-1 items-center gap-2 rounded-md py-0.5 text-left",
                  FOCUS,
                )}
              >
                <AnimatePresence mode="wait" initial={false}>
                  <motion.span
                    key={ticker.label}
                    initial={{ opacity: 0, y: 7 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -7 }}
                    transition={{ duration: 0.22 }}
                    className="truncate text-xs font-semibold transition-colors group-hover:text-violet-700 dark:group-hover:text-violet-300"
                  >
                    {ticker.label}
                  </motion.span>
                </AnimatePresence>

                {ticker.description && (
                  <span className="hidden truncate text-xs text-muted-foreground md:inline">
                    {ticker.description}
                  </span>
                )}

                <ArrowRight className="size-3.5 shrink-0 text-[#8B5CF6] opacity-0 transition-all group-hover:translate-x-0.5 group-hover:opacity-100 group-focus-visible:opacity-100" />
              </Link>

              {tickers.length > 1 && tickers.length <= 8 && (
                <div
                  className="hidden items-center gap-1 sm:flex"
                  role="group"
                  aria-label="Featured technologies"
                >
                  {tickers.map((item, index) => (
                    <button
                      key={item.label || index}
                      type="button"
                      onClick={() => setTickerIndex(index)}
                      aria-label={`Show ${item.label}`}
                      aria-current={index === tickerIndex % tickers.length}
                      className={cn(
                        "h-1.5 cursor-pointer rounded-full transition-all",
                        FOCUS,
                        index === tickerIndex % tickers.length
                          ? "w-4 bg-[#8B5CF6]"
                          : "w-1.5 bg-border hover:bg-muted-foreground/50",
                      )}
                    />
                  ))}
                </div>
              )}

              <button
                type="button"
                onClick={dismissTicker}
                aria-label="Hide featured technologies"
                className={cn(
                  "inline-flex size-7 shrink-0 cursor-pointer items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
                  FOCUS,
                )}
              >
                <X className="size-3.5" />
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Global search */}
      <AnimatePresence>
        {searchOpen && (
          <SearchPanel
            onClose={closeSearch}
            onSearch={goSearch}
            onNavigate={goTo}
            suggestions={
              Array.isArray(SEARCH_SUGGESTIONS) ? SEARCH_SUGGESTIONS : []
            }
            recent={recent}
            onClearRecent={clearRecent}
            modKey={modKey}
          />
        )}
      </AnimatePresence>

      {/* Screen-reader greeting */}
      <div className="sr-only" aria-live="polite">
        {greeting}, {firstName}.
      </div>
    </MotionConfig>
  );
}

export default StudentHeader;
