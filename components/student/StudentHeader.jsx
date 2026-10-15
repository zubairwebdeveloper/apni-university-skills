"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { signOut } from "firebase/auth";
import {
  AnimatePresence,
  MotionConfig,
  motion,
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

const toNumber = (value) => Math.max(0, Number(value) || 0);

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

function Shortcut({ children }) {
  return (
    <kbd className="inline-flex h-5 min-w-5 items-center justify-center rounded-md border border-border bg-muted px-1.5 font-mono text-[10px] font-semibold text-muted-foreground">
      {children}
    </kbd>
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
}) {
  const [value, setValue] = useState("");
  const [active, setActive] = useState(0);
  const inputRef = useRef(null);

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

  const query = value.trim();

  const results = useMemo(() => {
    const q = query.toLowerCase();
    const out = [];

    if (q) {
      out.push({
        kind: "query",
        label: `Search courses for “${query}”`,
        hint: "Press Enter",
        icon: Search,
        query,
      });
    } else {
      recent.forEach((label) =>
        out.push({
          kind: "recent",
          label,
          hint: "Recent search",
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
    suggestion: query ? "Suggestions" : "Suggested",
  };

  return (
    <motion.div
      className="fixed inset-0 z-[100] flex items-start justify-center overflow-y-auto bg-slate-950/50 px-3 pb-6 pt-[8vh] backdrop-blur-sm sm:px-6 sm:pt-[12vh]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <motion.section
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
          <Search className="size-5 shrink-0 text-primary" />

          <Input
            ref={inputRef}
            value={value}
            onChange={(event) => {
              setValue(event.target.value);
              setActive(0);
            }}
            onKeyDown={(event) => {
              if (event.key === "Escape") {
                event.preventDefault();
                onClose();
              } else if (event.key === "ArrowDown" && results.length) {
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
            placeholder="Search courses, lessons, resources..."
            className="h-14 min-w-0 border-0 bg-transparent px-0 text-sm shadow-none focus-visible:ring-0 sm:text-base"
            aria-label="Search courses and student pages"
            role="combobox"
            aria-expanded="true"
            aria-controls="search-results"
            aria-activedescendant={`search-opt-${current}`}
            autoComplete="off"
          />

          <button
            type="button"
            onClick={onClose}
            className="inline-flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            aria-label="Close search"
          >
            <X className="size-4" />
          </button>
        </div>

        <div
          id="search-results"
          role="listbox"
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
                  <div className="mb-1 mt-2 flex items-center justify-between gap-2 px-2 first:mt-0">
                    <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground">
                      {headings[item.kind]}
                    </p>
                    {item.kind === "recent" && (
                      <button
                        type="button"
                        onClick={onClearRecent}
                        className="cursor-pointer text-xs font-medium text-muted-foreground transition-colors hover:text-primary"
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
                  type="button"
                  onMouseEnter={() => setActive(index)}
                  onClick={() => choose(item)}
                  className={cn(
                    "flex w-full cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors",
                    isActive ? "bg-primary/10" : "hover:bg-muted/70",
                  )}
                >
                  <span
                    className={cn(
                      "flex size-9 shrink-0 items-center justify-center rounded-xl border border-border bg-background text-muted-foreground transition-colors",
                      isActive &&
                        "border-primary/20 bg-primary text-primary-foreground",
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

                  {isActive && (
                    <CornerDownLeft className="size-4 shrink-0 text-primary" />
                  )}
                </button>
              </div>
            );
          })}

          {!results.length && (
            <div className="px-4 py-10 text-center">
              <Search className="mx-auto mb-3 size-7 text-muted-foreground/60" />
              <p className="text-sm font-semibold">Nothing to show yet</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Type something to search all courses.
              </p>
            </div>
          )}
        </div>

        <footer className="flex flex-wrap items-center justify-between gap-2 border-t border-border bg-muted/30 px-3 py-3 text-[11px] text-muted-foreground sm:px-4">
          <span className="flex items-center gap-1.5">
            <Shortcut>↑</Shortcut>
            <Shortcut>↓</Shortcut>
            <span>Navigate</span>
          </span>
          <span className="flex items-center gap-1.5">
            <Shortcut>↵</Shortcut>
            <span>Open</span>
            <Shortcut>Esc</Shortcut>
            <span>Close</span>
          </span>
        </footer>
      </motion.section>
    </motion.div>
  );
}

/* ---------------- Header ---------------- */
export function StudentHeader({ person, onSignOut }) {
  const router = useRouter();
  const pathname = usePathname();

  const [searchOpen, setSearchOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [greeting, setGreeting] = useState("Welcome");
  const [recent, setRecent] = useState([]);
  const [signingOut, setSigningOut] = useState(false);
  const [tickerIndex, setTickerIndex] = useState(0);
  const [tickerPaused, setTickerPaused] = useState(false);
  const [tickerHidden, setTickerHidden] = useState(false);

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
  const levelProgress = ((xp % XP_PER_LEVEL) / XP_PER_LEVEL) * 100;

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

  useEffect(() => {
    if (tickerPaused || tickerHidden || tickers.length < 2) return undefined;
    const id = window.setInterval(
      () => setTickerIndex((index) => (index + 1) % tickers.length),
      4000,
    );
    return () => window.clearInterval(id);
  }, [tickerPaused, tickerHidden, tickers.length]);

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

  return (
    <MotionConfig reducedMotion="user">
      <header className="sticky top-0 z-50 w-full">
        <div
          className={cn(
            "relative border-b transition-[background-color,box-shadow,border-color] duration-300",
            scrolled
              ? "border-border/80 bg-background/90 shadow-sm backdrop-blur-xl"
              : "border-border/50 bg-background",
          )}
        >
          <div className="mx-auto flex min-h-[64px] max-w-[1600px] items-center gap-2 px-3 sm:min-h-[68px] sm:gap-3 sm:px-5 lg:px-8">
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
                      active
                        ? "text-primary"
                        : "text-muted-foreground hover:bg-muted/70 hover:text-foreground",
                    )}
                  >
                    {active && (
                      <motion.span
                        layoutId="student-nav-active"
                        className="absolute inset-0 rounded-xl bg-primary/10"
                        transition={{
                          type: "spring",
                          stiffness: 380,
                          damping: 30,
                        }}
                      />
                    )}

                    <Icon className="relative size-4 shrink-0" />
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
                      className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-orange-500/20 bg-orange-500/10 px-2.5 text-xs font-bold text-orange-600 dark:text-orange-300"
                    >
                      <Flame className="size-4" />
                      {streak}
                    </span>
                  )}
                  <span
                    title={`${xp} XP total`}
                    className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-amber-500/20 bg-amber-500/10 px-2.5 text-xs font-bold text-amber-700 dark:text-amber-300"
                  >
                    <Zap className="size-4" />
                    {xp.toLocaleString()}
                  </span>
                </div>
              )}

              {/* Search trigger (wide) */}
              <button
                type="button"
                onClick={() => setSearchOpen(true)}
                className="group hidden h-10 min-w-[200px] cursor-pointer items-center gap-2 rounded-xl border border-border/80 bg-muted/35 px-3 text-left text-sm text-muted-foreground shadow-sm transition-all duration-200 hover:border-primary/50 hover:bg-primary/[0.04] hover:text-foreground xl:flex 2xl:min-w-[260px]"
                aria-label="Open search (Ctrl plus K)"
              >
                <Search className="size-4 shrink-0 transition-colors group-hover:text-primary" />
                <span className="flex-1">Search…</span>
                <Shortcut>Ctrl</Shortcut>
                <Shortcut>K</Shortcut>
              </button>

              {/* Search trigger (compact) */}
              <button
                type="button"
                onClick={() => setSearchOpen(true)}
                aria-label="Open search"
                className="inline-flex size-10 cursor-pointer items-center justify-center rounded-xl border border-border/80 bg-background text-muted-foreground shadow-sm transition-all duration-200 hover:border-primary/40 hover:bg-primary/5 hover:text-primary active:scale-95 xl:hidden"
              >
                <Search className="size-[18px]" />
              </button>

              {/* Real notifications from Firestore */}
              <StudentNotificationsMenu />

              {/* Profile */}
              <DropdownMenu>
                <DropdownMenuTrigger
                  aria-label="Open student profile menu"
                  className="group flex cursor-pointer items-center gap-2 rounded-xl border border-transparent p-1 outline-none transition-colors hover:border-border hover:bg-muted/60 focus-visible:ring-2 focus-visible:ring-primary active:scale-[0.98] xl:pr-2"
                >
                  <span className="relative">
                    <Avatar className="size-9 border border-border shadow-sm">
                      <AvatarImage
                        src={person?.photoURL || person?.avatar || ""}
                        alt={name}
                      />
                      <AvatarFallback className="bg-primary/10 text-xs font-bold text-primary">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                    <span className="absolute -bottom-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full border-2 border-background bg-primary px-1 text-[9px] font-bold text-primary-foreground">
                      {level}
                    </span>
                  </span>

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
                  className="w-[min(18rem,calc(100vw-1rem))] rounded-2xl p-2"
                >
                  {/* Profile summary (plain div: no group label needed) */}
                  <div className="px-3 pb-3 pt-2">
                    <div className="flex items-center gap-3">
                      <Avatar className="size-11 border border-border">
                        <AvatarImage
                          src={person?.photoURL || person?.avatar || ""}
                          alt=""
                        />
                        <AvatarFallback className="bg-primary/10 text-sm font-bold text-primary">
                          {initials}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-bold">{name}</p>
                        <p className="truncate text-xs text-muted-foreground">
                          {person?.email || "Keep your learning streak alive"}
                        </p>
                      </div>
                    </div>

                    <div className="mt-3 flex items-center justify-between gap-2 text-xs">
                      <span className="font-semibold">Level {level}</span>
                      <span className="text-muted-foreground">
                        {xp % XP_PER_LEVEL}/{XP_PER_LEVEL} XP
                      </span>
                    </div>
                    <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-muted">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${levelProgress}%` }}
                        transition={{ duration: 0.6, ease: "easeOut" }}
                        className="h-full rounded-full bg-primary"
                      />
                    </div>

                    <div className="mt-3 grid grid-cols-3 gap-2">
                      <div className="rounded-lg bg-muted/70 p-2 text-center">
                        <Flame className="mx-auto mb-1 size-3.5 text-orange-500" />
                        <span className="block text-xs font-bold">
                          {streak}
                        </span>
                        <span className="text-[10px] text-muted-foreground">
                          Day streak
                        </span>
                      </div>
                      <div className="rounded-lg bg-muted/70 p-2 text-center">
                        <BookOpen className="mx-auto mb-1 size-3.5 text-primary" />
                        <span className="block text-xs font-bold">
                          {coursesCount}
                        </span>
                        <span className="text-[10px] text-muted-foreground">
                          Courses
                        </span>
                      </div>
                      <div className="rounded-lg bg-muted/70 p-2 text-center">
                        <Target className="mx-auto mb-1 size-3.5 text-emerald-500" />
                        <span className="block text-xs font-bold">
                          {dailyGoal}%
                        </span>
                        <span className="text-[10px] text-muted-foreground">
                          Daily goal
                        </span>
                      </div>
                    </div>
                  </div>

                  <DropdownMenuSeparator />

                  <p className="px-3 pb-1 pt-2 text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
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
                        <span className="flex size-8 shrink-0 items-center justify-center rounded-lg border border-border bg-background text-primary">
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
                        className="cursor-pointer gap-2 rounded-lg py-2.5"
                      >
                        <Icon className="size-4 text-muted-foreground" />
                        {item.label}
                      </DropdownMenuItem>
                    );
                  })}

                  <DropdownMenuItem
                    onClick={handleSignOut}
                    disabled={signingOut}
                    className="cursor-pointer gap-2 rounded-lg py-2.5 text-destructive focus:text-destructive"
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
            style={{ scaleX: progress }}
            className="absolute inset-x-0 bottom-[-1px] h-0.5 origin-left bg-primary"
          />
        </div>

        {/* Explore ticker */}
        {ticker && !tickerHidden && (
          <div className="border-b border-border/70 bg-muted/25">
            <div className="mx-auto flex max-w-[1600px] items-center gap-2 px-3 py-1.5 sm:gap-3 sm:px-6 lg:px-8">
              <span className="flex shrink-0 items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-[0.12em] text-primary sm:tracking-[0.16em]">
                <Sparkles className="size-3.5" />
                Explore
              </span>

              <div className="h-4 w-px shrink-0 bg-border" />

              <Link
                href={
                  ticker.href ||
                  `/courses?q=${encodeURIComponent(ticker.label || "")}`
                }
                onMouseEnter={() => setTickerPaused(true)}
                onMouseLeave={() => setTickerPaused(false)}
                onFocus={() => setTickerPaused(true)}
                onBlur={() => setTickerPaused(false)}
                className="group flex min-w-0 flex-1 items-center gap-2 rounded-md text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <AnimatePresence mode="wait" initial={false}>
                  <motion.span
                    key={ticker.label}
                    initial={{ opacity: 0, y: 7 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -7 }}
                    transition={{ duration: 0.22 }}
                    className="truncate text-xs font-semibold group-hover:text-primary"
                  >
                    {ticker.label}
                  </motion.span>
                </AnimatePresence>

                {ticker.description && (
                  <span className="hidden truncate text-xs text-muted-foreground md:inline">
                    {ticker.description}
                  </span>
                )}

                <ArrowRight className="size-3.5 shrink-0 text-primary opacity-0 transition-all group-hover:translate-x-0.5 group-hover:opacity-100" />
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
                        "h-1.5 rounded-full transition-all",
                        index === tickerIndex % tickers.length
                          ? "w-4 bg-primary"
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
                className="inline-flex size-6 shrink-0 cursor-pointer items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
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
            onClose={() => setSearchOpen(false)}
            onSearch={goSearch}
            onNavigate={goTo}
            suggestions={
              Array.isArray(SEARCH_SUGGESTIONS) ? SEARCH_SUGGESTIONS : []
            }
            recent={recent}
            onClearRecent={clearRecent}
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
