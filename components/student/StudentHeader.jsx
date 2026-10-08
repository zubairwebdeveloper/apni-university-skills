"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  AnimatePresence,
  motion,
  useMotionValueEvent,
  useScroll,
  useSpring,
} from "framer-motion";
import {
  ArrowRight,
  ArrowUpRight,
  Bell,
  BookOpen,
  CheckCheck,
  ClipboardList,
  Crown,
  Flame,
  GraduationCap,
  LayoutDashboard,
  LifeBuoy,
  Library,
  Search,
  Settings,
  Sparkles,
  TrendingUp,
  Trophy,
  User,
  Users,
  Video,
  X,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { StudentMobileNav } from "./StudentMobileNav";
import { AnimatedLogo } from "../layout/AnimatedLogo";
import {
  NAV_LINKS,
  NOTIFICATIONS,
  SEARCH_SUGGESTIONS,
  TECH_TICKER,
  USER_MENU,
} from "@/lib/student-header-data";

const ICONS = {
  dashboard: LayoutDashboard,
  book: BookOpen,
  video: Video,
  users: Users,
  library: Library,
  user: User,
  trophy: Trophy,
  settings: Settings,
  help: LifeBuoy,
};

const NOTIFICATION_ICONS = {
  course: BookOpen,
  assignment: ClipboardList,
  live: Video,
};

const XP_PER_LEVEL = 500;

/* Shared hover style for dropdown rows (Radix uses data-[highlighted]) */
const menuItemClass =
  "group relative flex cursor-pointer items-center rounded-lg px-2 py-2 outline-none transition-colors " +
  "focus:bg-primary/10 focus:text-primary data-[highlighted]:bg-primary/10 data-[highlighted]:text-primary";

const listVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.05, delayChildren: 0.05 } },
};

const itemVariants = {
  hidden: { opacity: 0, x: -10 },
  show: { opacity: 1, x: 0, transition: { duration: 0.2 } },
};

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

/* ---------- Desktop nav link: icon only, label expands on hover/active ---------- */
function NavLink({ item, active, hoveredHref, setHoveredHref }) {
  const Icon = ICONS[item.icon];
  const hovered = hoveredHref === item.href;

  return (
    <Link
      href={item.href}
      aria-label={item.label}
      onMouseEnter={() => setHoveredHref(item.href)}
      onFocus={() => setHoveredHref(item.href)}
      className={cn(
        "group relative flex items-center rounded-lg px-3 py-2 text-sm font-medium outline-none transition-colors",
        active ? "text-primary" : "text-muted-foreground hover:text-primary",
      )}
    >
      {hovered && (
        <motion.span
          layoutId="nav-hover-pill"
          className="absolute inset-0 rounded-lg bg-primary/10"
          transition={{ type: "spring", stiffness: 380, damping: 30 }}
        />
      )}
      <span className="relative z-10 flex items-center">
        <Icon className="size-[18px] transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:scale-110" />
        <AnimatePresence initial={false}>
          {(active || hovered) && (
            <motion.span
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: "auto", opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden whitespace-nowrap"
            >
              <span className="block pl-2">{item.label}</span>
            </motion.span>
          )}
        </AnimatePresence>
      </span>
      {active && (
        <motion.span
          layoutId="nav-active-line"
          className="absolute inset-x-3 -bottom-[14px] h-0.5 rounded-full bg-primary"
          transition={{ type: "spring", stiffness: 380, damping: 30 }}
        />
      )}
    </Link>
  );
}

export function StudentHeader({ person }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchRef = useRef(null);

  const [query, setQuery] = useState("");
  const [focused, setFocused] = useState(false);
  const [mobileSearch, setMobileSearch] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [tickerIndex, setTickerIndex] = useState(0);
  const [greeting, setGreeting] = useState("Welcome");
  const [hoveredHref, setHoveredHref] = useState(null);
  const [readIds, setReadIds] = useState([]);

  const { scrollY, scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 24 });

  // Hide header on scroll down, show on scroll up
  useMotionValueEvent(scrollY, "change", (latest) => {
    const prev = scrollY.getPrevious() ?? 0;
    setScrolled(latest > 8);
    setHidden(latest > prev && latest > 160);
  });

  const name = person?.name || person?.displayName || "Student";
  const firstName = name.split(" ")[0];
  const streak = person?.streak ?? 3;
  const xp = person?.xp ?? 1250;
  const coursesCount = person?.coursesCount ?? 4;
  const dailyGoal = Math.min(person?.dailyGoalProgress ?? 65, 100);
  const level = Math.floor(xp / XP_PER_LEVEL) + 1;
  const levelProgress = ((xp % XP_PER_LEVEL) / XP_PER_LEVEL) * 100;

  const unreadCount = NOTIFICATIONS.filter(
    (n) => !readIds.includes(n.id),
  ).length;
  const trimmed = query.trim();
  const filteredSuggestions = SEARCH_SUGGESTIONS.filter((s) =>
    s.label.toLowerCase().includes(trimmed.toLowerCase()),
  );

  useEffect(() => setGreeting(getGreeting()), []);

  useEffect(() => {
    const id = setInterval(
      () => setTickerIndex((i) => (i + 1) % TECH_TICKER.length),
      3500,
    );
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const onKey = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        if (window.innerWidth < 768) setMobileSearch(true);
        else searchRef.current?.focus();
      }
      if (e.key === "Escape") setMobileSearch(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const goSearch = (q) => {
    const value = q.trim();
    if (!value) return;
    setQuery(value);
    setMobileSearch(false);
    searchRef.current?.blur();
    router.push(`/courses?q=${encodeURIComponent(value)}`);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    goSearch(query);
  };

  const markRead = (id) =>
    setReadIds((prev) => (prev.includes(id) ? prev : [...prev, id]));
  const markAllRead = () => setReadIds(NOTIFICATIONS.map((n) => n.id));

  const isActive = (href) =>
    href === "/student" ? pathname === href : pathname?.startsWith(href);

  const ticker = TECH_TICKER[tickerIndex];

  return (
    <motion.header
      initial={{ y: -64, opacity: 0 }}
      animate={{ y: hidden && !mobileSearch ? "-100%" : 0, opacity: 1 }}
      transition={{ type: "spring", stiffness: 140, damping: 20 }}
      className={cn(
        "sticky top-0 z-30 border-b bg-background/80 backdrop-blur-xl transition-shadow",
        scrolled && "shadow-lg shadow-primary/5",
      )}
    >
      {/* Scroll progress bar */}
      <motion.div
        style={{ scaleX: progress }}
        className="absolute inset-x-0 bottom-0 h-0.5 origin-left bg-gradient-to-r from-primary via-primary/60 to-transparent"
      />

      <div className="flex h-16 items-center gap-2 px-3 sm:gap-3 sm:px-6 lg:px-8">
        <StudentMobileNav person={person} />
        <div className="lg:hidden">
          <AnimatedLogo />
        </div>

        {/* Desktop nav links */}
        <nav
          className="hidden items-center gap-1 xl:flex"
          onMouseLeave={() => setHoveredHref(null)}
          aria-label="Student navigation"
        >
          {NAV_LINKS.map((item) => (
            <NavLink
              key={item.href}
              item={item}
              active={isActive(item.href)}
              hoveredHref={hoveredHref}
              setHoveredHref={setHoveredHref}
            />
          ))}
        </nav>

        {/* Inline search with suggestions (tablet / desktop) */}
        <form onSubmit={handleSearch} className="ml-2 hidden md:block">
          <motion.div
            animate={{ width: focused ? 300 : 200 }}
            transition={{ type: "spring", stiffness: 220, damping: 24 }}
            className="relative"
          >
            <Search
              className={cn(
                "absolute left-3 top-1/2 size-4 -translate-y-1/2 transition-colors",
                focused ? "text-primary" : "text-muted-foreground",
              )}
            />
            <Input
              ref={searchRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              onKeyDown={(e) => e.key === "Escape" && e.currentTarget.blur()}
              placeholder="Search courses..."
              className="h-9 rounded-full bg-muted/50 pl-9 pr-12 transition-colors hover:bg-muted focus-visible:bg-background"
            />
            <kbd className="pointer-events-none absolute right-2.5 top-1/2 hidden -translate-y-1/2 rounded border bg-background px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground lg:block">
              Ctrl K
            </kbd>

            <AnimatePresence>
              {focused && (
                <motion.div
                  initial={{ opacity: 0, y: -6, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -6, scale: 0.98 }}
                  transition={{ duration: 0.15 }}
                  className="absolute left-0 top-full z-50 mt-2 w-full overflow-hidden rounded-xl border bg-popover p-1.5 text-popover-foreground shadow-xl"
                >
                  <p className="px-2 pb-1 pt-1 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                    {trimmed ? "Suggestions" : "Popular in tech"}
                  </p>

                  {trimmed && (
                    <button
                      type="button"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => goSearch(trimmed)}
                      className="group flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left text-sm transition-colors hover:bg-primary/10 hover:text-primary"
                    >
                      <Search className="size-4" />
                      <span className="min-w-0 flex-1 truncate">
                        Search for “{trimmed}”
                      </span>
                      <ArrowRight className="size-4 -translate-x-2 opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-100" />
                    </button>
                  )}

                  {filteredSuggestions.map((s, i) => (
                    <motion.button
                      key={s.label}
                      type="button"
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.03 }}
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => goSearch(s.label)}
                      className="group flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left text-sm transition-colors hover:bg-primary/10 hover:text-primary"
                    >
                      <TrendingUp className="size-4 text-muted-foreground transition-colors group-hover:text-primary" />
                      <span className="min-w-0 flex-1 truncate">{s.label}</span>
                      <span className="text-xs text-muted-foreground transition-opacity group-hover:opacity-0">
                        {s.hint}
                      </span>
                      <ArrowRight className="absolute right-4 size-4 -translate-x-2 opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-100" />
                    </motion.button>
                  ))}

                  {!filteredSuggestions.length && !trimmed && null}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </form>

        {/* Tech ticker (extra large screens) */}
        <div className="ml-2 hidden h-9 min-w-0 flex-1 items-center overflow-hidden 2xl:flex">
          <Sparkles className="mr-2 size-4 shrink-0 text-primary" />
          <AnimatePresence mode="wait">
            <motion.div
              key={ticker.label}
              initial={{ y: 16, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -16, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="flex min-w-0 items-center gap-2"
            >
              <Badge variant="secondary" className="shrink-0">
                {ticker.tag}
              </Badge>
              <Link
                href={ticker.href}
                className="group flex min-w-0 items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-primary"
              >
                <span className="truncate">{ticker.label}</span>
                <ArrowUpRight className="size-3.5 shrink-0 opacity-0 transition-all duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:opacity-100" />
              </Link>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Right side actions */}
        <div className="ml-auto flex items-center gap-1 sm:gap-2">
          {/* Mobile search toggle */}
          <motion.button
            type="button"
            whileTap={{ scale: 0.9 }}
            onClick={() => setMobileSearch((v) => !v)}
            aria-label={mobileSearch ? "Close search" : "Open search"}
            className={cn(
              buttonVariants({ variant: "ghost", size: "icon" }),
              "hover:bg-primary/10 hover:text-primary md:hidden",
            )}
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.span
                key={mobileSearch ? "x" : "s"}
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 90, opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="inline-flex"
              >
                {mobileSearch ? (
                  <X className="size-5" />
                ) : (
                  <Search className="size-5" />
                )}
              </motion.span>
            </AnimatePresence>
          </motion.button>

          {/* Streak + XP (large screens) */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.97 }}
            className="hidden xl:block"
          >
            <Link
              href="/student/achievements"
              className="flex items-center gap-2 rounded-full border bg-muted/50 px-3 py-1 text-xs font-medium transition-colors hover:border-primary/40 hover:bg-primary/10 hover:text-primary"
            >
              <span className="flex items-center gap-1">
                <motion.span
                  animate={{ scale: [1, 1.25, 1], rotate: [0, -8, 8, 0] }}
                  transition={{
                    duration: 1.6,
                    repeat: Infinity,
                    repeatDelay: 1.5,
                  }}
                  className="inline-flex"
                >
                  <Flame className="size-4 text-orange-500" />
                </motion.span>
                {streak} day streak
              </span>
              <span className="h-3 w-px bg-border" />
              <span className="flex items-center gap-1">
                <Trophy className="size-3.5 text-yellow-500" />
                {xp} XP
              </span>
            </Link>
          </motion.div>

          {/* Notifications */}
          <DropdownMenu>
            <DropdownMenuTrigger
              aria-label="Notifications"
              className={cn(
                buttonVariants({ variant: "ghost", size: "icon" }),
                "relative hover:bg-primary/10 hover:text-primary",
              )}
            >
              <motion.span
                whileHover={{ rotate: [0, 14, -14, 10, -10, 0] }}
                transition={{ duration: 0.6 }}
                className="inline-flex origin-top"
              >
                <Bell className="size-5" />
              </motion.span>
              <AnimatePresence>
                {unreadCount > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    className="absolute right-1.5 top-1.5 flex size-4 items-center justify-center"
                  >
                    <span className="absolute inline-flex size-full animate-ping rounded-full bg-primary opacity-60" />
                    <span className="relative flex size-4 items-center justify-center rounded-full bg-primary text-[10px] font-semibold text-primary-foreground">
                      {unreadCount}
                    </span>
                  </motion.span>
                )}
              </AnimatePresence>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              sideOffset={10}
              className="w-[calc(100vw-1.5rem)] max-w-80 p-1.5 sm:w-80"
            >
              <DropdownMenuLabel className="flex items-center justify-between">
                Notifications
                <Badge variant="secondary">
                  {unreadCount ? `${unreadCount} new` : "All caught up"}
                </Badge>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />

              <motion.div
                variants={listVariants}
                initial="hidden"
                animate="show"
              >
                {NOTIFICATIONS.map((n) => {
                  const Icon = NOTIFICATION_ICONS[n.type] ?? Bell;
                  const isRead = readIds.includes(n.id);
                  return (
                    <DropdownMenuItem
                      key={n.id}
                      onSelect={() => {
                        markRead(n.id);
                        router.push(n.href);
                      }}
                      className={menuItemClass}
                    >
                      <motion.div
                        variants={itemVariants}
                        className="flex w-full items-center gap-3"
                      >
                        <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground transition-all duration-200 group-focus:scale-110 group-focus:bg-primary group-focus:text-primary-foreground group-data-[highlighted]:scale-110 group-data-[highlighted]:bg-primary group-data-[highlighted]:text-primary-foreground">
                          <Icon className="size-4 text-current" />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span
                            className={cn(
                              "block truncate text-sm",
                              isRead ? "font-normal" : "font-semibold",
                            )}
                          >
                            {n.title}
                          </span>
                          <span className="block text-xs text-muted-foreground transition-colors group-focus:text-primary/70 group-data-[highlighted]:text-primary/70">
                            {n.time}
                          </span>
                        </span>
                        {!isRead && (
                          <span className="size-2 shrink-0 rounded-full bg-primary transition-opacity group-focus:opacity-0 group-data-[highlighted]:opacity-0" />
                        )}
                        <ArrowRight className="absolute right-3 size-4 -translate-x-2 text-current opacity-0 transition-all duration-200 group-focus:translate-x-0 group-focus:opacity-100 group-data-[highlighted]:translate-x-0 group-data-[highlighted]:opacity-100" />
                      </motion.div>
                    </DropdownMenuItem>
                  );
                })}
              </motion.div>

              <DropdownMenuSeparator />
              <DropdownMenuItem
                onSelect={(e) => {
                  e.preventDefault();
                  markAllRead();
                }}
                className="group flex cursor-pointer items-center justify-center gap-2 rounded-lg py-2 text-sm font-medium outline-none transition-colors focus:bg-primary/10 focus:text-primary data-[highlighted]:bg-primary/10 data-[highlighted]:text-primary"
              >
                <CheckCheck className="size-4 transition-transform group-data-[highlighted]:scale-110" />
                Mark all as read
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Browse courses */}
          <motion.div whileTap={{ scale: 0.96 }}>
            <Link
              href="/courses"
              className={cn(
                buttonVariants({ variant: "default", size: "sm" }),
                "group relative overflow-hidden transition-shadow hover:shadow-lg hover:shadow-primary/30",
              )}
            >
              <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/25 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
              <BookOpen className="size-4" />
              <span className="hidden lg:inline">Browse courses</span>
              <ArrowRight className="hidden size-4 transition-transform group-hover:translate-x-1 lg:inline" />
            </Link>
          </motion.div>

          {/* User menu */}
          <DropdownMenu>
            <DropdownMenuTrigger
              aria-label="User menu"
              className="relative flex size-10 items-center justify-center rounded-full outline-none ring-offset-background transition-transform hover:scale-105 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              {/* Daily goal ring */}
              <svg
                viewBox="0 0 40 40"
                className="absolute inset-0 size-full -rotate-90"
                aria-hidden
              >
                <circle
                  cx="20"
                  cy="20"
                  r="18"
                  fill="none"
                  strokeWidth="2.5"
                  className="stroke-muted"
                />
                <motion.circle
                  cx="20"
                  cy="20"
                  r="18"
                  fill="none"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  className="stroke-primary"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: dailyGoal / 100 }}
                  transition={{ duration: 1, ease: "easeOut", delay: 0.4 }}
                />
              </svg>
              <Avatar className="size-8">
                <AvatarImage src={person?.photoURL} alt={name} />
                <AvatarFallback>{name.charAt(0).toUpperCase()}</AvatarFallback>
              </Avatar>
              <span className="absolute bottom-0 right-0 size-2.5 rounded-full border-2 border-background bg-green-500" />
            </DropdownMenuTrigger>

            <DropdownMenuContent
              align="end"
              sideOffset={10}
              className="w-[calc(100vw-1.5rem)] max-w-80 overflow-hidden p-0 sm:w-80"
            >
              {/* Profile banner */}
              <div className="relative overflow-hidden bg-gradient-to-br from-primary/20 via-primary/10 to-transparent p-4">
                <motion.div
                  aria-hidden
                  animate={{ scale: [1, 1.2, 1], opacity: [0.4, 0.7, 0.4] }}
                  transition={{ duration: 4, repeat: Infinity }}
                  className="pointer-events-none absolute -right-8 -top-8 size-28 rounded-full bg-primary/20 blur-2xl"
                />
                <div className="relative flex items-center gap-3">
                  <Avatar className="size-12 ring-2 ring-background">
                    <AvatarImage src={person?.photoURL} alt={name} />
                    <AvatarFallback>
                      {name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <p className="text-xs text-muted-foreground">{greeting},</p>
                    <p className="truncate text-sm font-semibold">
                      {firstName} 👋
                    </p>
                    {person?.email && (
                      <p className="truncate text-xs text-muted-foreground">
                        {person.email}
                      </p>
                    )}
                  </div>
                </div>

                {/* Level progress */}
                <div className="relative mt-4">
                  <div className="mb-1.5 flex items-center justify-between text-xs">
                    <span className="font-medium">Level {level}</span>
                    <span className="text-muted-foreground">
                      {xp % XP_PER_LEVEL} / {XP_PER_LEVEL} XP
                    </span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-background/70">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${levelProgress}%` }}
                      transition={{
                        duration: 0.8,
                        ease: "easeOut",
                        delay: 0.15,
                      }}
                      className="h-full rounded-full bg-gradient-to-r from-primary to-primary/60"
                    />
                  </div>
                </div>

                {/* Daily goal */}
                <div className="relative mt-3">
                  <div className="mb-1.5 flex items-center justify-between text-xs">
                    <span className="font-medium">Daily goal</span>
                    <span className="text-muted-foreground">{dailyGoal}%</span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-background/70">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${dailyGoal}%` }}
                      transition={{
                        duration: 0.8,
                        ease: "easeOut",
                        delay: 0.3,
                      }}
                      className="h-full rounded-full bg-gradient-to-r from-green-500 to-emerald-400"
                    />
                  </div>
                </div>

                {/* Quick stats */}
                <div className="relative mt-4 grid grid-cols-3 gap-2">
                  {[
                    {
                      icon: Flame,
                      color: "text-orange-500",
                      value: streak,
                      label: "Streak",
                    },
                    {
                      icon: Trophy,
                      color: "text-yellow-500",
                      value: xp,
                      label: "Total XP",
                    },
                    {
                      icon: GraduationCap,
                      color: "text-primary",
                      value: coursesCount,
                      label: "Courses",
                    },
                  ].map((s, i) => (
                    <motion.div
                      key={s.label}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 + i * 0.06 }}
                      whileHover={{ y: -2 }}
                      className="rounded-lg border bg-background/80 px-2 py-2 text-center transition-colors hover:border-primary/40"
                    >
                      <s.icon className={cn("mx-auto size-4", s.color)} />
                      <p className="mt-1 text-sm font-semibold leading-none">
                        {s.value}
                      </p>
                      <p className="mt-1 text-[10px] text-muted-foreground">
                        {s.label}
                      </p>
                    </motion.div>
                  ))}
                </div>
              </div>

              <DropdownMenuSeparator className="my-0" />

              {/* Menu items */}
              <motion.div
                variants={listVariants}
                initial="hidden"
                animate="show"
                className="p-1.5"
              >
                {USER_MENU.map((item) => {
                  const Icon = ICONS[item.icon];
                  return (
                    <DropdownMenuItem
                      key={item.href}
                      onSelect={() => router.push(item.href)}
                      className={menuItemClass}
                    >
                      <motion.div
                        variants={itemVariants}
                        className="flex w-full items-center gap-3"
                      >
                        <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground transition-all duration-200 group-focus:scale-110 group-focus:bg-primary group-focus:text-primary-foreground group-data-[highlighted]:scale-110 group-data-[highlighted]:bg-primary group-data-[highlighted]:text-primary-foreground">
                          <Icon className="size-4 text-current" />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="flex items-center gap-2 text-sm font-medium">
                            {item.label}
                            {item.badge && (
                              <Badge className="h-4 px-1.5 text-[10px]">
                                {item.badge}
                              </Badge>
                            )}
                          </span>
                          <span className="block truncate text-xs text-muted-foreground transition-colors group-focus:text-primary/70 group-data-[highlighted]:text-primary/70">
                            {item.description}
                          </span>
                        </span>
                        <ArrowRight className="size-4 shrink-0 -translate-x-2 text-current opacity-0 transition-all duration-200 group-focus:translate-x-0 group-focus:opacity-100 group-data-[highlighted]:translate-x-0 group-data-[highlighted]:opacity-100" />
                      </motion.div>
                    </DropdownMenuItem>
                  );
                })}
              </motion.div>

              <DropdownMenuSeparator className="my-0" />

              {/* Upgrade card */}
              <div className="p-2">
                <DropdownMenuItem
                  onSelect={() => router.push("/pricing")}
                  className="group relative cursor-pointer overflow-hidden rounded-xl bg-gradient-to-r from-primary to-primary/70 p-3 text-primary-foreground outline-none focus:bg-primary focus:text-primary-foreground data-[highlighted]:bg-primary data-[highlighted]:text-primary-foreground"
                >
                  <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/25 to-transparent transition-transform duration-700 group-focus:translate-x-full group-data-[highlighted]:translate-x-full" />
                  <div className="relative flex w-full items-center gap-3">
                    <Crown className="size-5 shrink-0 text-current" />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold">Upgrade to Pro</p>
                      <p className="text-xs opacity-80">
                        Unlock all tech courses
                      </p>
                    </div>
                    <ArrowRight className="size-4 shrink-0 text-current transition-transform group-focus:translate-x-1 group-data-[highlighted]:translate-x-1" />
                  </div>
                </DropdownMenuItem>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Mobile expandable search */}
      <AnimatePresence initial={false}>
        {mobileSearch && (
          <motion.form
            onSubmit={handleSearch}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden border-t md:hidden"
          >
            <div className="px-3 pb-3 pt-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-primary" />
                <Input
                  autoFocus
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search courses, skills..."
                  className="h-10 rounded-full bg-muted/50 pl-9"
                />
              </div>
              <motion.div
                variants={listVariants}
                initial="hidden"
                animate="show"
                className="mt-3 flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none]"
              >
                {SEARCH_SUGGESTIONS.map((s) => (
                  <motion.button
                    key={s.label}
                    type="button"
                    variants={itemVariants}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => goSearch(s.label)}
                    className="shrink-0 rounded-full border bg-muted/50 px-3 py-1.5 text-xs font-medium transition-colors hover:border-primary hover:bg-primary hover:text-primary-foreground"
                  >
                    {s.label}
                  </motion.button>
                ))}
              </motion.div>
            </div>
          </motion.form>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
