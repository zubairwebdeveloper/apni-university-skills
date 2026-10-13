"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { signOut } from "firebase/auth";
import {
  AnimatePresence,
  MotionConfig,
  motion,
  useMotionValue,
  useSpring,
} from "framer-motion";
import {
  ArrowDownRight,
  ArrowRight,
  Bell,
  BookOpen,
  CheckCheck,
  ChevronDown,
  Command,
  Compass,
  Flame,
  History,
  LayoutDashboard,
  LifeBuoy,
  LogOut,
  Search,
  Settings,
  Sparkles,
  Trophy,
  Target,
  UserRound,
  Video,
  X,
  Zap,
  ClipboardCheck,
  Library,
  Users,
} from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { auth } from "@/lib/firebase/client/auth";
import { StudentMobileNav } from "./StudentMobileNav";
import {
  NAV_LINKS,
  NOTIFICATIONS,
  SEARCH_SUGGESTIONS,
  TECH_TICKER,
  USER_MENU,
} from "@/lib/student-header-data";

const RECENT_KEY = "student-recent-searches";
const XP_PER_LEVEL = 500;

// TODO: apne session API route ka sahi path likhein (jo cookie delete karta hai)
const SESSION_ENDPOINT = "/api/auth/session";

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

function SearchDialog({
  open,
  onOpenChange,
  onSearch,
  suggestions = [],
  recent = [],
  onClearRecent,
}) {
  const [value, setValue] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef(null);

  const results = useMemo(() => {
    const query = value.trim().toLowerCase();

    const matched = suggestions.filter((item) =>
      String(item.label || "")
        .toLowerCase()
        .includes(query),
    );

    const recentItems = !query
      ? recent.map((label) => ({
          label,
          hint: "Recent search",
          icon: History,
          kind: "recent",
        }))
      : [];

    return [
      ...recentItems,
      ...matched.map((item) => ({
        ...item,
        kind: "suggestion",
      })),
    ].slice(0, 8);
  }, [value, suggestions, recent]);

  const currentActiveIndex = results.length
    ? Math.min(activeIndex, results.length - 1)
    : 0;

  useEffect(() => {
    if (!open) return undefined;

    const resetId = window.setTimeout(() => {
      setValue("");
      setActiveIndex(0);
    }, 0);

    const focusId = window.setTimeout(() => {
      inputRef.current?.focus();
    }, 60);

    return () => {
      window.clearTimeout(resetId);
      window.clearTimeout(focusId);
    };
  }, [open]);

  const submit = (label = value) => {
    const query = String(label || "").trim();

    if (!query) return;

    onSearch(query);
    onOpenChange(false);
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-start justify-center overflow-y-auto bg-slate-950/50 px-3 pb-6 pt-[8vh] backdrop-blur-sm sm:px-6 sm:pt-[12vh]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              onOpenChange(false);
            }
          }}
        >
          <motion.section
            role="dialog"
            aria-modal="true"
            aria-label="Global search"
            initial={{ opacity: 0, y: 22, scale: 0.97, rotateX: 3 }}
            animate={{ opacity: 1, y: 0, scale: 1, rotateX: 0 }}
            exit={{ opacity: 0, y: 12, scale: 0.98 }}
            transition={{ type: "spring", stiffness: 360, damping: 30 }}
            className="w-full max-w-2xl overflow-hidden rounded-2xl border border-border bg-background shadow-2xl [transform-style:preserve-3d]"
          >
            <form
              className="flex items-center gap-3 border-b border-border px-3 sm:px-4"
              onSubmit={(event) => {
                event.preventDefault();
                submit(results[currentActiveIndex]?.label || value);
              }}
            >
              <Search className="size-5 shrink-0 text-primary" />

              <Input
                ref={inputRef}
                value={value}
                onChange={(event) => {
                  setValue(event.target.value);
                  setActiveIndex(0);
                }}
                onKeyDown={(event) => {
                  if (event.key === "Escape") {
                    event.preventDefault();
                    onOpenChange(false);
                  } else if (event.key === "ArrowDown" && results.length) {
                    event.preventDefault();
                    setActiveIndex((index) => (index + 1) % results.length);
                  } else if (event.key === "ArrowUp" && results.length) {
                    event.preventDefault();
                    setActiveIndex(
                      (index) => (index - 1 + results.length) % results.length,
                    );
                  }
                }}
                placeholder="Search courses, lessons, resources..."
                className="h-14 min-w-0 border-0 bg-transparent px-0 text-sm shadow-none focus-visible:ring-0 sm:text-base"
                aria-label="Search courses and student pages"
                autoComplete="off"
              />

              <button
                type="button"
                onClick={() => onOpenChange(false)}
                className="inline-flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-lg text-muted-foreground transition-all duration-200 hover:bg-muted hover:text-foreground active:scale-95"
                aria-label="Close search"
              >
                <X className="size-4" />
              </button>
            </form>

            <div className="max-h-[min(60vh,28rem)] overflow-y-auto p-2 sm:p-3">
              <div className="mb-2 flex items-center justify-between gap-2 px-2">
                <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground sm:text-[11px]">
                  {value
                    ? "Search results"
                    : recent.length
                      ? "Recent & suggested"
                      : "Suggested destinations"}
                </p>

                {!value && recent.length > 0 && (
                  <button
                    type="button"
                    onClick={onClearRecent}
                    className="cursor-pointer text-xs font-medium text-muted-foreground transition-colors hover:text-primary"
                  >
                    Clear recent
                  </button>
                )}
              </div>

              {results.length > 0 ? (
                <div className="space-y-1">
                  {results.map((item, index) => {
                    const ItemIcon = item.icon || Compass;
                    const active = currentActiveIndex === index;

                    return (
                      <button
                        key={`${item.kind}-${item.label}-${index}`}
                        type="button"
                        onMouseEnter={() => setActiveIndex(index)}
                        onClick={() => submit(item.label)}
                        className={cn(
                          "group flex w-full cursor-pointer items-center gap-3 rounded-xl px-3 py-3 text-left transition-all duration-200",
                          active
                            ? "bg-primary/10 text-foreground shadow-sm"
                            : "hover:bg-muted/70",
                        )}
                      >
                        <span
                          className={cn(
                            "flex size-9 shrink-0 items-center justify-center rounded-xl border border-border bg-background text-muted-foreground transition-all duration-200 sm:size-10",
                            active &&
                              "border-primary/20 bg-primary text-primary-foreground shadow-md shadow-primary/20",
                          )}
                        >
                          <ItemIcon className="size-[17px] sm:size-[18px]" />
                        </span>

                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm font-semibold">
                            {item.label}
                          </span>

                          <span className="mt-0.5 block truncate text-xs text-muted-foreground">
                            {item.hint ||
                              item.description ||
                              "Open this destination"}
                          </span>
                        </span>

                        {active ? (
                          <ArrowRight className="size-4 shrink-0 text-primary" />
                        ) : (
                          <ArrowDownRight className="size-4 shrink-0 text-muted-foreground opacity-0 transition group-hover:translate-x-0.5 group-hover:opacity-100" />
                        )}
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="px-4 py-10 text-center">
                  <Search className="mx-auto mb-3 size-7 text-muted-foreground/60" />

                  <p className="text-sm font-semibold">
                    No matching suggestions
                  </p>

                  <p className="mt-1 text-xs text-muted-foreground">
                    Press Enter to search for “{value}”.
                  </p>

                  <button
                    type="button"
                    onClick={() => submit(value)}
                    className="mt-4 cursor-pointer rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-all hover:-translate-y-0.5 hover:shadow-md active:translate-y-0"
                  >
                    Search all courses
                  </button>
                </div>
              )}
            </div>

            <footer className="flex flex-wrap items-center justify-between gap-2 border-t border-border bg-muted/30 px-3 py-3 text-[10px] text-muted-foreground sm:px-4 sm:text-[11px]">
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
      )}
    </AnimatePresence>
  );
}

function TargetIcon() {
  return <Target className="mx-auto mb-1 size-3.5 text-emerald-500" />;
}

function QuickActionCard({ action, onNavigate }) {
  const Icon = action.icon;

  return (
    <Link
      href={action.href}
      onClick={onNavigate}
      className="group flex cursor-pointer items-center gap-3 rounded-xl p-3 transition-all duration-200 hover:translate-x-0.5 hover:bg-muted/70 active:scale-[0.99]"
    >
      <span className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-border bg-background text-primary shadow-sm transition-all duration-300 group-hover:-translate-y-0.5 group-hover:rotate-[-3deg] group-hover:shadow-md">
        <Icon className="size-[18px]" />
      </span>

      <span className="min-w-0 flex-1">
        <span className="block text-sm font-semibold">{action.label}</span>

        <span className="mt-0.5 block text-xs text-muted-foreground">
          {action.description}
        </span>
      </span>

      <ArrowRight className="size-4 shrink-0 text-muted-foreground opacity-0 transition-all duration-200 group-hover:translate-x-0.5 group-hover:opacity-100" />
    </Link>
  );
}

export function StudentHeader({ person, onSignOut }) {
  const router = useRouter();
  const pathname = usePathname();

  const [searchOpen, setSearchOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [tickerIndex, setTickerIndex] = useState(0);
  const [tickerPaused, setTickerPaused] = useState(false);
  const [greeting, setGreeting] = useState("Welcome");
  const [recent, setRecent] = useState([]);
  const [readIds, setReadIds] = useState([]);
  const [notifTab, setNotifTab] = useState("all");

  const pointerX = useMotionValue(0);
  const pointerY = useMotionValue(0);

  const rotateX = useSpring(pointerY, { stiffness: 180, damping: 22 });
  const rotateY = useSpring(pointerX, { stiffness: 180, damping: 22 });

  const name = person?.name || person?.displayName || "Student";
  const firstName = name.split(/\s+/)[0] || "Student";

  const xp = Math.max(0, Number(person?.xp ?? 1250) || 0);
  const streak = Math.max(0, Number(person?.streak ?? 3) || 0);
  const coursesCount = Math.max(0, Number(person?.coursesCount ?? 4) || 0);

  const dailyGoal = Math.min(
    100,
    Math.max(0, Number(person?.dailyGoalProgress ?? 65) || 0),
  );

  const level = Math.floor(xp / XP_PER_LEVEL) + 1;
  const levelProgress = ((xp % XP_PER_LEVEL) / XP_PER_LEVEL) * 100;

  const unreadCount = NOTIFICATIONS.filter(
    (notification) => !readIds.includes(notification.id),
  ).length;

  const visibleNotifications =
    notifTab === "unread"
      ? NOTIFICATIONS.filter(
          (notification) => !readIds.includes(notification.id),
        )
      : NOTIFICATIONS;

  const ticker = TECH_TICKER?.[tickerIndex] || TECH_TICKER?.[0];

  const avatarInitials = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setGreeting(getGreeting());

      try {
        const stored = JSON.parse(
          window.localStorage.getItem(RECENT_KEY) || "[]",
        );

        if (Array.isArray(stored)) {
          setRecent(
            stored.filter((item) => typeof item === "string").slice(0, 5),
          );
        }
      } catch {
        // Ignore malformed or unavailable local storage.
      }
    }, 0);

    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (tickerPaused || !TECH_TICKER || TECH_TICKER.length < 2) {
      return undefined;
    }

    const timer = window.setInterval(() => {
      setTickerIndex((index) => (index + 1) % TECH_TICKER.length);
    }, 3600);

    return () => window.clearInterval(timer);
  }, [tickerPaused]);

  const saveRecent = useCallback((label) => {
    setRecent((previous) => {
      const next = [
        label,
        ...previous.filter(
          (item) => item.toLowerCase() !== label.toLowerCase(),
        ),
      ].slice(0, 5);

      try {
        window.localStorage.setItem(RECENT_KEY, JSON.stringify(next));
      } catch {
        // Search still works if storage is unavailable.
      }

      return next;
    });
  }, []);

  const clearRecent = useCallback(() => {
    setRecent([]);

    try {
      window.localStorage.removeItem(RECENT_KEY);
    } catch {
      // Ignore unavailable local storage.
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

  // Alt + K opens search
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (
        event.altKey &&
        !event.ctrlKey &&
        !event.shiftKey &&
        event.key.toLowerCase() === "k"
      ) {
        event.preventDefault();
        setSearchOpen(true);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const markRead = useCallback((id) => {
    setReadIds((previous) =>
      previous.includes(id) ? previous : [...previous, id],
    );
  }, []);

  const markAllRead = useCallback(() => {
    setReadIds(NOTIFICATIONS.map((notification) => notification.id));
  }, []);

  // Real sign out: pehle server cookie hatao, phir Firebase client, phir redirect.
  // Warna client "logged in" rehta hai aur login/student ke beech loop ban sakta hai.
  const handleSignOut = useCallback(async () => {
    setProfileOpen(false);

    if (onSignOut) {
      onSignOut();
      return;
    }

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

  const handlePointerMove = (event) => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    const rect = event.currentTarget.getBoundingClientRect();

    if (!rect.width || !rect.height) return;

    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;

    pointerX.set(x * 4);
    pointerY.set(y * -3);
  };

  const resetTilt = () => {
    pointerX.set(0);
    pointerY.set(0);
  };

  return (
    <MotionConfig reducedMotion="user">
      <header className="sticky top-0 z-50 w-full">
        <motion.div
          onMouseMove={handlePointerMove}
          onMouseLeave={resetTilt}
          style={{
            transformPerspective: 1400,
            rotateX: scrolled ? 0 : rotateX,
            rotateY: scrolled ? 0 : rotateY,
          }}
          className={cn(
            "relative border-b transition-[background-color,box-shadow,border-color] duration-300",
            scrolled
              ? "border-border/80 bg-background/95 shadow-sm backdrop-blur-xl"
              : "border-border/50 bg-background",
          )}
        >
          <div className="mx-auto flex min-h-[64px] max-w-[1600px] items-center gap-2 px-3 sm:min-h-[72px] sm:gap-3 sm:px-5 lg:px-8">
            {/* Desktop navigation */}
            <nav
              className="ml-1 hidden min-w-0 flex-1 items-center gap-1 lg:flex"
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
                      "group relative flex cursor-pointer items-center gap-2 rounded-xl px-2.5 py-2 text-[13px] font-semibold transition-all duration-200 ease-out xl:px-3",
                      active
                        ? "text-primary"
                        : "text-muted-foreground hover:-translate-y-0.5 hover:bg-muted/70 hover:text-foreground active:translate-y-0",
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

                    <Icon className="relative size-4 shrink-0 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:scale-105" />

                    <span className="relative whitespace-nowrap">
                      {item.label}
                    </span>
                  </Link>
                );
              })}
            </nav>

            {/* Search, notifications and profile */}
            <div className="ml-auto flex shrink-0 items-center gap-1.5 sm:gap-2">
              <button
                type="button"
                onClick={() => setSearchOpen(true)}
                className="group hidden h-10 min-w-[190px] cursor-pointer items-center gap-2 rounded-xl border border-border/80 bg-muted/35 px-3 text-left text-sm text-muted-foreground shadow-sm transition-all duration-300 ease-out hover:-translate-y-0.5 hover:border-primary/50 hover:bg-primary/[0.04] hover:text-foreground hover:shadow-md hover:shadow-primary/5 active:translate-y-0 active:scale-[0.98] xl:flex 2xl:min-w-[250px]"
                aria-label="Open global search (Alt plus K)"
              >
                <Search className="size-4 shrink-0 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-[-8deg] group-hover:text-primary" />

                <span>Quick search</span>
                <Shortcut>Alt</Shortcut>
                <Shortcut>K</Shortcut>
              </button>

              <button
                type="button"
                onClick={() => setSearchOpen(true)}
                aria-label="Open search"
                className="inline-flex size-10 cursor-pointer items-center justify-center rounded-xl border border-border/80 bg-background text-muted-foreground shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/40 hover:bg-primary/5 hover:text-primary hover:shadow-md active:scale-95 xl:hidden"
              >
                <Search className="size-[18px] transition-transform duration-200" />
              </button>

              {/* Notifications */}
              <DropdownMenu open={notifOpen} onOpenChange={setNotifOpen}>
                {/* FIX: andar <button> nahi, trigger khud button hai */}
                <DropdownMenuTrigger
                  aria-label={`Notifications, ${unreadCount} unread`}
                  className="group relative inline-flex size-10 cursor-pointer items-center justify-center rounded-xl border border-border/80 bg-background text-muted-foreground shadow-sm outline-none transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/40 hover:bg-primary/5 hover:text-primary hover:shadow-md focus-visible:ring-2 focus-visible:ring-primary active:scale-95"
                >
                  <Bell className="size-[18px] transition-transform duration-300 group-hover:rotate-[-8deg]" />

                  {unreadCount > 0 && (
                    <span className="absolute right-1.5 top-1.5 flex size-[17px] items-center justify-center rounded-full border-2 border-background bg-primary text-[9px] font-bold text-primary-foreground">
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                  )}
                </DropdownMenuTrigger>

                <DropdownMenuContent
                  align="end"
                  sideOffset={10}
                  className="w-[min(23rem,calc(100vw-1rem))] rounded-2xl p-0"
                >
                  <div className="flex items-center justify-between gap-3 border-b border-border p-4">
                    <div>
                      <p className="font-semibold">Notifications</p>

                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {unreadCount
                          ? `${unreadCount} unread updates`
                          : "You're all caught up"}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={markAllRead}
                      className="inline-flex shrink-0 cursor-pointer items-center gap-1 text-xs font-semibold text-primary transition-colors hover:underline"
                    >
                      <CheckCheck className="size-3.5" />
                      Mark all read
                    </button>
                  </div>

                  <div className="flex gap-1 border-b border-border px-3 py-2">
                    {["all", "unread"].map((tab) => (
                      <button
                        key={tab}
                        type="button"
                        onClick={() => setNotifTab(tab)}
                        className={cn(
                          "cursor-pointer rounded-lg px-3 py-1.5 text-xs font-semibold capitalize transition-colors",
                          notifTab === tab
                            ? "bg-primary/10 text-primary"
                            : "text-muted-foreground hover:bg-muted",
                        )}
                      >
                        {tab}
                      </button>
                    ))}
                  </div>

                  <div className="max-h-[min(55vh,24rem)] overflow-y-auto p-2">
                    {visibleNotifications.length ? (
                      visibleNotifications.map((notification) => {
                        const read = readIds.includes(notification.id);

                        const NotificationIcon =
                          notification.type === "live"
                            ? Video
                            : notification.type === "assignment"
                              ? ClipboardCheck
                              : BookOpen;

                        return (
                          <button
                            key={notification.id}
                            type="button"
                            onClick={() => {
                              markRead(notification.id);

                              if (notification.href) {
                                setNotifOpen(false);
                                router.push(notification.href);
                              }
                            }}
                            className={cn(
                              "flex w-full cursor-pointer gap-3 rounded-xl p-3 text-left transition-all duration-200 hover:translate-x-0.5 hover:bg-muted/70",
                              !read && "bg-primary/[0.04]",
                            )}
                          >
                            <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                              <NotificationIcon className="size-4" />
                            </span>

                            <span className="min-w-0 flex-1">
                              <span className="flex items-start justify-between gap-2">
                                <span className="text-sm font-semibold">
                                  {notification.title}
                                </span>

                                {!read && (
                                  <span className="mt-1 size-1.5 shrink-0 rounded-full bg-primary" />
                                )}
                              </span>

                              <span className="mt-1 block text-xs leading-relaxed text-muted-foreground">
                                {notification.description ||
                                  notification.message}
                              </span>

                              {notification.time && (
                                <span className="mt-1.5 block text-[10px] text-muted-foreground">
                                  {notification.time}
                                </span>
                              )}
                            </span>
                          </button>
                        );
                      })
                    ) : (
                      <p className="px-4 py-8 text-center text-sm text-muted-foreground">
                        No notifications here.
                      </p>
                    )}
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Student profile */}
              <DropdownMenu open={profileOpen} onOpenChange={setProfileOpen}>
                {/* FIX: andar <button> nahi, trigger khud button hai */}
                <DropdownMenuTrigger
                  aria-label="Open student profile menu"
                  className="group flex cursor-pointer items-center gap-1.5 rounded-xl border border-transparent p-1 outline-none transition-all duration-200 hover:border-border hover:bg-muted/60 focus-visible:ring-2 focus-visible:ring-primary active:scale-[0.98] sm:gap-2 sm:pr-2"
                >
                  <Avatar className="size-9 border border-border shadow-sm transition duration-300 group-hover:scale-[1.04] group-hover:shadow-md">
                    <AvatarImage
                      src={person?.photoURL || person?.avatar || ""}
                      alt={name}
                    />

                    <AvatarFallback className="bg-primary/10 text-xs font-bold text-primary">
                      {avatarInitials || "S"}
                    </AvatarFallback>
                  </Avatar>

                  <span className="hidden max-w-28 text-left xl:block">
                    <span className="block truncate text-xs font-bold">
                      {firstName}
                    </span>

                    <span className="block text-[10px] text-muted-foreground">
                      Level {level}
                    </span>
                  </span>

                  {/* Base UI trigger par data-popup-open lagata hai (data-state nahi) */}
                  <ChevronDown className="hidden size-3.5 text-muted-foreground transition-transform duration-200 group-data-[popup-open]:rotate-180 xl:block" />
                </DropdownMenuTrigger>

                <DropdownMenuContent
                  align="end"
                  sideOffset={10}
                  className="w-[min(16rem,calc(100vw-1rem))] rounded-2xl p-2 sm:w-64"
                >
                  <DropdownMenuLabel className="px-3 py-3 font-normal">
                    <p className="truncate text-sm font-bold">{name}</p>

                    <p className="mt-1 truncate text-xs text-muted-foreground">
                      {person?.email || "Keep your learning streak alive"}
                    </p>

                    <div className="mt-3 flex items-center justify-between gap-2 text-xs">
                      <span className="text-muted-foreground">
                        Level {level}
                      </span>

                      <span className="font-semibold">
                        {xp % XP_PER_LEVEL}/{XP_PER_LEVEL} XP
                      </span>
                    </div>

                    <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${levelProgress}%` }}
                        transition={{ duration: 0.6, ease: "easeOut" }}
                        className="h-full rounded-full bg-primary"
                      />
                    </div>

                    <div className="mt-3 grid grid-cols-3 gap-2">
                      <div className="rounded-lg bg-muted/70 p-2 text-center transition-colors hover:bg-muted">
                        <Flame className="mx-auto mb-1 size-3.5 text-orange-500" />
                        <span className="block text-xs font-bold">
                          {streak} days
                        </span>
                        <span className="text-[10px] text-muted-foreground">
                          Streak
                        </span>
                      </div>

                      <div className="rounded-lg bg-muted/70 p-2 text-center transition-colors hover:bg-muted">
                        <BookOpen className="mx-auto mb-1 size-3.5 text-primary" />
                        <span className="block text-xs font-bold">
                          {coursesCount}
                        </span>
                        <span className="text-[10px] text-muted-foreground">
                          Courses
                        </span>
                      </div>

                      <div className="rounded-lg bg-muted/70 p-2 text-center transition-colors hover:bg-muted">
                        <TargetIcon />
                        <span className="block text-xs font-bold">
                          {dailyGoal}%
                        </span>
                        <span className="text-[10px] text-muted-foreground">
                          Daily goal
                        </span>
                      </div>
                    </div>
                  </DropdownMenuLabel>

                  <DropdownMenuSeparator />

                  <div className="px-1 py-1">
                    <p className="px-2 pb-1 text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
                      Quick actions
                    </p>

                    {QUICK_ACTIONS.map((action) => (
                      <QuickActionCard
                        key={action.href}
                        action={action}
                        onNavigate={() => setProfileOpen(false)}
                      />
                    ))}
                  </div>

                  <DropdownMenuSeparator />

                  {(USER_MENU || []).map((item) => {
                    const Icon = ICONS[item.icon] || UserRound;

                    return (
                      <DropdownMenuItem
                        key={item.href || item.label}
                        // FIX: Base UI mein onSelect nahi, onClick hota hai
                        onClick={() => {
                          if (item.href) {
                            router.push(item.href);
                          }
                        }}
                        className="cursor-pointer rounded-lg py-2.5 transition-colors"
                      >
                        <Icon className="mr-2 size-4 text-muted-foreground" />
                        {item.label}
                      </DropdownMenuItem>
                    );
                  })}

                  <DropdownMenuItem
                    onClick={handleSignOut}
                    className="cursor-pointer rounded-lg py-2.5 text-destructive focus:text-destructive"
                  >
                    <LogOut className="mr-2 size-4" />
                    Sign out
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

              <button
                type="button"
                onClick={() => setSearchOpen(true)}
                className="inline-flex min-h-10 shrink-0 cursor-pointer items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs font-medium text-muted-foreground transition-all duration-200 hover:bg-muted hover:text-primary active:scale-95 sm:px-3"
                aria-label="Open global search"
              >
                <Search className="size-3.5" />

                <span>Search</span>

                <span className="hidden items-center gap-1 sm:inline-flex">
                  <Shortcut>Alt</Shortcut>
                  <Shortcut>K</Shortcut>
                </span>
              </button>
            </div>
          </div>
        </motion.div>

        {/* Featured technology ticker */}
        {ticker && (
          <div className="border-b border-border/70 bg-muted/25">
            <div className="mx-auto flex max-w-[1600px] items-center gap-2 px-3 py-2 sm:gap-3 sm:px-6 lg:px-8">
              <span className="flex shrink-0 items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-[0.12em] text-primary sm:tracking-[0.16em]">
                <Sparkles className="size-3.5" />
                <span>Explore</span>
              </span>

              <div className="h-4 w-px shrink-0 bg-border" />

              <button
                type="button"
                onMouseEnter={() => setTickerPaused(true)}
                onMouseLeave={() => setTickerPaused(false)}
                onFocus={() => setTickerPaused(true)}
                onBlur={() => setTickerPaused(false)}
                className="flex min-w-0 flex-1 cursor-pointer items-center gap-2 text-left"
                aria-label="Featured technology"
              >
                <AnimatePresence mode="wait" initial={false}>
                  <motion.span
                    key={ticker.label}
                    initial={{ opacity: 0, y: 7 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -7 }}
                    transition={{ duration: 0.22 }}
                    className="truncate text-xs font-semibold"
                  >
                    {ticker.label}
                  </motion.span>
                </AnimatePresence>

                {ticker.description && (
                  <span className="hidden truncate text-xs text-muted-foreground md:inline">
                    {ticker.description}
                  </span>
                )}
              </button>

              <span className="hidden shrink-0 items-center gap-1 text-[10px] text-muted-foreground sm:flex">
                <Zap className="size-3 text-amber-500" />
                Keep growing
              </span>
            </div>
          </div>
        )}
      </header>

      {/* Global search */}
      <SearchDialog
        open={searchOpen}
        onOpenChange={setSearchOpen}
        onSearch={goSearch}
        suggestions={SEARCH_SUGGESTIONS}
        recent={recent}
        onClearRecent={clearRecent}
      />

      {/* Keyboard shortcut hint */}
      <div className="pointer-events-none fixed bottom-4 right-4 z-40 hidden items-center gap-2 rounded-xl border border-border/70 bg-background/85 px-3 py-2 text-[11px] text-muted-foreground shadow-lg backdrop-blur-md 2xl:flex">
        <span className="flex size-6 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Command className="size-3.5" />
        </span>

        <span>Quick search</span>
        <Shortcut>Alt</Shortcut>
        <Shortcut>K</Shortcut>
      </div>

      {/* Screen-reader announcement */}
      <div className="sr-only" aria-live="polite">
        {greeting}, {firstName}. You have {unreadCount} unread notifications.
      </div>
    </MotionConfig>
  );
}

export default StudentHeader;
