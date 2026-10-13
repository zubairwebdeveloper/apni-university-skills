// components/student/MyCoursesView.jsx
"use client";

import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import {
  AnimatePresence,
  animate,
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from "framer-motion";
import {
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  Brain,
  CheckCircle2,
  Cloud,
  Code2,
  Database,
  LayoutGrid,
  Lightbulb,
  List,
  PlayCircle,
  Search,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Target,
  TrendingUp,
  Users,
  X,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { EmptyState } from "@/components/shared/EmptyState";
import { EnrolledCourseCard } from "@/components/student/EnrolledCourseCard";
import { cn } from "@/lib/utils";
import {
  EXPLORE_CATEGORIES,
  SORT_OPTIONS,
  STUDY_TIPS,
} from "@/lib/my-courses-data";

/* ---------------- Helpers (edit to match your data) ---------------- */
const getTitle = (i) => i.title ?? i.course?.title ?? "Untitled course";
const getProgress = (i) =>
  Math.max(0, Math.min(100, Math.round(i.progress ?? 0)));
const getHref = (i) => `/student/courses/${i.courseId ?? i.id}`;

const subscribeToView = (callback) => {
  window.addEventListener("storage", callback);
  window.addEventListener("my-courses-view-change", callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener("my-courses-view-change", callback);
  };
};
const getSavedView = () => {
  try {
    const saved = window.localStorage.getItem(VIEW_KEY);
    return saved === "grid" || saved === "list" ? saved : "grid";
  } catch {
    return "grid";
  }
};
const getServerView = () => "grid";

const toMs = (v) => {
  if (!v) return 0;
  if (typeof v === "number") return v;
  if (typeof v === "string") return Date.parse(v) || 0;
  const s = v.seconds ?? v._seconds;
  return s ? s * 1000 : 0;
};
const getLastAccess = (i) => toMs(i.lastAccessedAt ?? i.enrolledAt);

const SORTERS = {
  recent: (a, b) => getLastAccess(b) - getLastAccess(a),
  "progress-desc": (a, b) => getProgress(b) - getProgress(a),
  "progress-asc": (a, b) => getProgress(a) - getProgress(b),
  title: (a, b) => getTitle(a).localeCompare(getTitle(b)),
};

const ICONS = {
  brain: Brain,
  code: Code2,
  cloud: Cloud,
  shield: ShieldCheck,
  database: Database,
  phone: Smartphone,
  target: Target,
  users: Users,
};

const VIEW_KEY = "my-courses:view";
const SPRING = { stiffness: 200, damping: 18, mass: 0.6 };

const listVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

const isEditable = (t) =>
  t instanceof HTMLElement &&
  (t.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(t.tagName));

const keyPress =
  "transition-[transform,box-shadow] duration-100 active:translate-y-[3px] active:shadow-none motion-reduce:transition-none motion-reduce:active:translate-y-0";

/* ---------------- Small building blocks ---------------- */

// Mouse ke saath halka 3D tilt. Reduced motion mein sirf wrapper rehta hai.
function Tilt({ children, className, max = 6, lift = true }) {
  const reduce = useReducedMotion();
  const px = useMotionValue(0);
  const py = useMotionValue(0);
  const sx = useSpring(px, SPRING);
  const sy = useSpring(py, SPRING);
  const rotateY = useTransform(sx, [-0.5, 0.5], [-max, max]);
  const rotateX = useTransform(sy, [-0.5, 0.5], [max, -max]);

  function onMove(e) {
    if (reduce) return;
    const r = e.currentTarget.getBoundingClientRect();
    px.set((e.clientX - r.left) / r.width - 0.5);
    py.set((e.clientY - r.top) / r.height - 0.5);
  }
  function onLeave() {
    px.set(0);
    py.set(0);
  }

  return (
    <div
      className="h-full [perspective:900px]"
      onPointerMove={onMove}
      onPointerLeave={onLeave}
    >
      <motion.div
        style={reduce ? undefined : { rotateX, rotateY }}
        whileHover={reduce || !lift ? undefined : { y: -3 }}
        className={cn("h-full [transform-style:preserve-3d]", className)}
      >
        {children}
      </motion.div>
    </div>
  );
}

function AnimatedNumber({ value, suffix = "" }) {
  const reduce = useReducedMotion();
  const mv = useMotionValue(reduce ? value : 0);
  const rounded = useTransform(mv, (v) => Math.round(v));

  useEffect(() => {
    if (reduce) {
      mv.set(value);
      return;
    }
    const controls = animate(mv, value, { duration: 1, ease: "easeOut" });
    return () => controls.stop();
  }, [value, mv, reduce]);

  return (
    <>
      <motion.span>{rounded}</motion.span>
      {suffix}
    </>
  );
}

function ProgressBar({ value, className }) {
  const reduce = useReducedMotion();
  return (
    <div
      className={cn("h-2 overflow-hidden rounded-full bg-muted", className)}
      role="progressbar"
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <motion.div
        initial={reduce ? false : { width: 0 }}
        animate={{ width: `${value}%` }}
        transition={{ duration: reduce ? 0 : 0.8, ease: "easeOut", delay: 0.1 }}
        className="h-full rounded-full bg-gradient-to-r from-primary to-primary/60"
      />
    </div>
  );
}

// Gol progress ring (hero ke liye bada, list ke liye chhota)
function Ring({ value, size = "lg", label }) {
  const reduce = useReducedMotion();
  const r = 42;
  const big = size === "lg";
  return (
    <div
      className={cn(
        "relative shrink-0",
        big ? "size-32 sm:size-36" : "size-11",
      )}
    >
      {big && (
        <div
          aria-hidden="true"
          className="absolute inset-3 translate-y-3 rounded-full bg-primary/30 blur-xl"
        />
      )}
      <svg
        viewBox="0 0 100 100"
        className="relative size-full -rotate-90"
        aria-hidden="true"
      >
        <circle
          cx="50"
          cy="50"
          r={r}
          fill="none"
          strokeWidth={big ? 8 : 10}
          className="stroke-muted"
        />
        <motion.circle
          cx="50"
          cy="50"
          r={r}
          fill="none"
          strokeWidth={big ? 8 : 10}
          strokeLinecap="round"
          className="stroke-primary"
          initial={reduce ? false : { pathLength: 0 }}
          animate={{ pathLength: value / 100 }}
          transition={{
            duration: reduce ? 0 : 1.2,
            ease: "easeOut",
            delay: 0.2,
          }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span
          className={cn(
            "font-bold tabular-nums",
            big ? "text-2xl sm:text-3xl" : "text-[10px]",
          )}
        >
          {big ? <AnimatedNumber value={value} suffix="%" /> : `${value}%`}
        </span>
        {label ? (
          <span className="text-[11px] text-muted-foreground">{label}</span>
        ) : null}
      </div>
    </div>
  );
}

/* ---------------- Compact row for list view ---------------- */
function CourseRow({ item }) {
  const progress = getProgress(item);
  const completed = item.status === "completed";
  return (
    <Link
      href={getHref(item)}
      className="group flex items-center gap-4 rounded-xl border bg-card p-4 shadow-[0_3px_0_0_var(--border)] outline-none transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none motion-reduce:hover:translate-y-0"
    >
      {completed ? (
        <span className="grid size-11 shrink-0 place-items-center rounded-full bg-primary/10 text-primary ring-1 ring-inset ring-primary/20">
          <CheckCircle2 aria-hidden="true" className="size-5" />
        </span>
      ) : (
        <Ring value={progress} size="sm" />
      )}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="truncate text-sm font-semibold transition-colors group-hover:text-primary">
            {getTitle(item)}
          </p>
          <Badge
            variant={completed ? "default" : "secondary"}
            className="shrink-0"
          >
            {completed ? "Completed" : "In progress"}
          </Badge>
        </div>
        <div className="mt-2 flex items-center gap-3">
          <ProgressBar value={progress} className="h-1.5 flex-1" />
          <span className="w-10 text-right text-xs tabular-nums text-muted-foreground">
            {progress}%
          </span>
        </div>
      </div>
      <span className="hidden shrink-0 items-center gap-1 text-xs font-medium text-primary sm:flex">
        {completed ? "Review" : "Resume"}
        <ArrowRight
          aria-hidden="true"
          className="size-4 -translate-x-1 opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-100 motion-reduce:transition-none"
        />
      </span>
    </Link>
  );
}

/* ---------------- Explore categories (also used on empty page) ---------------- */
export function ExploreSection() {
  return (
    <section aria-labelledby="explore-title" className="mt-12">
      <div className="mb-5 flex items-end justify-between gap-4">
        <div>
          <h2
            id="explore-title"
            className="text-xl font-semibold tracking-tight"
          >
            Explore tech categories
          </h2>
          <p className="text-sm text-muted-foreground">
            Pick your next skill from our most popular learning paths.
          </p>
        </div>
        <Link
          href="/courses"
          className="group hidden items-center gap-1 rounded-sm text-sm font-medium text-primary outline-none focus-visible:ring-2 focus-visible:ring-ring sm:flex"
        >
          View all
          <ArrowRight
            aria-hidden="true"
            className="size-4 transition-transform group-hover:translate-x-1 motion-reduce:transition-none"
          />
        </Link>
      </div>

      <motion.div
        variants={listVariants}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-60px" }}
        className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3"
      >
        {EXPLORE_CATEGORIES.map((c) => {
          const Icon = ICONS[c.icon] ?? BookOpen;
          return (
            <motion.div key={c.title} variants={itemVariants}>
              <Tilt max={6} lift={false}>
                <Link
                  href={c.href}
                  className="group relative flex h-full flex-col gap-3 overflow-hidden rounded-xl border bg-card p-5 shadow-[0_3px_0_0_var(--border)] outline-none transition-colors hover:border-primary/40 focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute -right-6 -top-6 size-24 rounded-full bg-primary/10 opacity-0 blur-2xl transition-opacity group-hover:opacity-100"
                  />
                  <span className="relative flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary shadow-[0_3px_0_0_color-mix(in_oklab,var(--primary)_25%,transparent)] ring-1 ring-inset ring-primary/20 transition-colors [transform:translateZ(16px)] group-hover:bg-primary group-hover:text-primary-foreground">
                    <Icon aria-hidden="true" className="size-5" />
                  </span>
                  <div className="flex-1">
                    <h3 className="font-semibold transition-colors group-hover:text-primary">
                      {c.title}
                    </h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {c.description}
                    </p>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">{c.count}</span>
                    <ArrowUpRight
                      aria-hidden="true"
                      className="size-4 text-primary opacity-0 transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:opacity-100 motion-reduce:transition-none"
                    />
                  </div>
                </Link>
              </Tilt>
            </motion.div>
          );
        })}
      </motion.div>
    </section>
  );
}

/* ---------------- Study tips ---------------- */
function StudyTipsSection() {
  return (
    <section aria-labelledby="tips-title" className="mt-12">
      <div className="mb-5 flex items-center gap-2">
        <Lightbulb aria-hidden="true" className="size-5 text-primary" />
        <h2 id="tips-title" className="text-xl font-semibold tracking-tight">
          Study smarter
        </h2>
      </div>
      <motion.div
        variants={listVariants}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-60px" }}
        className="grid gap-4 md:grid-cols-3"
      >
        {STUDY_TIPS.map((t, i) => {
          const Icon = ICONS[t.icon] ?? Lightbulb;
          return (
            <motion.div key={t.title} variants={itemVariants}>
              <Tilt max={5}>
                <div className="h-full rounded-xl border bg-gradient-to-br from-muted/60 to-transparent p-5">
                  <div className="mb-3 flex items-center gap-3">
                    <span className="flex size-9 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary shadow-[0_2px_0_0_color-mix(in_oklab,var(--primary)_25%,transparent)] [transform:translateZ(12px)]">
                      {i + 1}
                    </span>
                    <Icon
                      aria-hidden="true"
                      className="size-5 text-muted-foreground"
                    />
                  </div>
                  <h3 className="font-semibold">{t.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {t.description}
                  </p>
                </div>
              </Tilt>
            </motion.div>
          );
        })}
      </motion.div>
    </section>
  );
}

/* ---------------- Main view ---------------- */
export function MyCoursesView({ items }) {
  const reduce = useReducedMotion();
  const searchRef = useRef(null);
  const [tab, setTab] = useState("all");
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState("recent");
  const view = useSyncExternalStore(
    subscribeToView,
    getSavedView,
    getServerView,
  );

  const changeView = (next) => {
    try {
      window.localStorage.setItem(VIEW_KEY, next);
    } catch {
      // Optional hai
    }
    window.dispatchEvent(new Event("my-courses-view-change"));
  };

  // "/" se search par focus
  useEffect(() => {
    const onKey = (e) => {
      if (e.key !== "/" || e.metaKey || e.ctrlKey || e.altKey) return;
      if (isEditable(e.target)) return;
      e.preventDefault();
      searchRef.current?.focus();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const stats = useMemo(() => {
    const active = items.filter((i) => i.status === "active");
    const completed = items.filter((i) => i.status === "completed");
    const avg = items.length
      ? Math.round(
          items.reduce((sum, i) => sum + getProgress(i), 0) / items.length,
        )
      : 0;
    return { active: active.length, completed: completed.length, avg };
  }, [items]);

  const continueItem = useMemo(
    () =>
      items.filter((i) => i.status === "active").sort(SORTERS.recent)[0] ??
      null,
    [items],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items
      .filter(
        (i) =>
          (tab === "all" || i.status === tab) &&
          (!q || getTitle(i).toLowerCase().includes(q)),
      )
      .sort(SORTERS[sort]);
  }, [items, tab, query, sort]);

  const statCards = [
    { label: "Enrolled", value: items.length, icon: BookOpen },
    { label: "In progress", value: stats.active, icon: TrendingUp },
    { label: "Completed", value: stats.completed, icon: CheckCircle2 },
    { label: "Avg. progress", value: stats.avg, suffix: "%", icon: Target },
  ];

  const clearFilters = () => {
    setQuery("");
    setTab("all");
  };

  return (
    <div className="space-y-8">
      {/* Hero */}
      <motion.section
        aria-labelledby="hub-title"
        initial={reduce ? false : { opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <Tilt max={2.5} lift={false}>
          <div className="relative overflow-hidden rounded-2xl border bg-gradient-to-br from-primary/15 via-primary/5 to-transparent p-5 shadow-[0_4px_0_0_var(--border)] sm:p-8">
            {!reduce && (
              <motion.div
                aria-hidden="true"
                animate={{ scale: [1, 1.15, 1], opacity: [0.4, 0.7, 0.4] }}
                transition={{ duration: 6, repeat: Infinity }}
                className="pointer-events-none absolute -right-16 -top-16 size-64 rounded-full bg-primary/20 blur-3xl"
              />
            )}
            <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div className="min-w-0 flex-1">
                <Badge variant="secondary" className="gap-1">
                  <Sparkles aria-hidden="true" className="size-3" /> Your
                  learning hub
                </Badge>
                <h2
                  id="hub-title"
                  className="mt-3 text-2xl font-bold tracking-tight sm:text-3xl"
                >
                  Keep the momentum going
                </h2>
                <p className="mt-1 max-w-xl text-sm text-muted-foreground sm:text-base">
                  Every lesson you finish brings you closer to a career in tech.
                  Pick up right where you left off.
                </p>

                {continueItem ? (
                  <div className="mt-5 flex max-w-xl items-center gap-4 rounded-xl border bg-background/80 p-4 shadow-[0_3px_0_0_var(--border)] backdrop-blur">
                    <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary ring-1 ring-inset ring-primary/20">
                      <PlayCircle aria-hidden="true" className="size-6" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                        Continue learning
                      </p>
                      <p className="truncate text-sm font-semibold sm:text-base">
                        {getTitle(continueItem)}
                      </p>
                      <div className="mt-2 flex items-center gap-3">
                        <ProgressBar
                          value={getProgress(continueItem)}
                          className="h-1.5 flex-1"
                        />
                        <span className="text-xs tabular-nums text-muted-foreground">
                          {getProgress(continueItem)}%
                        </span>
                      </div>
                    </div>
                    <Link
                      href={getHref(continueItem)}
                      className={cn(
                        buttonVariants({ size: "sm" }),
                        "group shrink-0 shadow-[0_3px_0_0_color-mix(in_oklab,var(--primary)_55%,black)]",
                        keyPress,
                      )}
                    >
                      Resume
                      <ArrowRight
                        aria-hidden="true"
                        className="size-4 transition-transform group-hover:translate-x-1 motion-reduce:transition-none"
                      />
                    </Link>
                  </div>
                ) : (
                  <Link
                    href="/courses"
                    className={cn(
                      buttonVariants(),
                      "group mt-5 shadow-[0_3px_0_0_color-mix(in_oklab,var(--primary)_55%,black)]",
                      keyPress,
                    )}
                  >
                    Find your next course
                    <ArrowRight
                      aria-hidden="true"
                      className="size-4 transition-transform group-hover:translate-x-1 motion-reduce:transition-none"
                    />
                  </Link>
                )}
              </div>

              <div className="flex justify-center lg:justify-end">
                <Ring value={stats.avg} label="Overall" />
              </div>
            </div>
          </div>
        </Tilt>
      </motion.section>

      {/* Stats */}
      <motion.div
        variants={listVariants}
        initial={reduce ? false : "hidden"}
        animate="show"
        className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4"
      >
        {statCards.map((s) => (
          <motion.div key={s.label} variants={itemVariants}>
            <Tilt max={7}>
              <div className="flex items-center gap-3 rounded-xl border bg-card p-4 shadow-[0_3px_0_0_var(--border)] transition-colors hover:border-primary/40">
                <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary shadow-[0_3px_0_0_color-mix(in_oklab,var(--primary)_25%,transparent)] ring-1 ring-inset ring-primary/20 [transform:translateZ(14px)]">
                  <s.icon aria-hidden="true" className="size-5" />
                </span>
                <div>
                  <p className="text-2xl font-bold leading-none tabular-nums">
                    <AnimatedNumber value={s.value} suffix={s.suffix} />
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {s.label}
                  </p>
                </div>
              </div>
            </Tilt>
          </motion.div>
        ))}
      </motion.div>

      {/* Toolbar */}
      <div className="space-y-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <Tabs value={tab} onValueChange={setTab}>
            <TabsList>
              <TabsTrigger value="all">
                All
                <span className="ml-1.5 text-xs text-muted-foreground">
                  {items.length}
                </span>
              </TabsTrigger>
              <TabsTrigger value="active">
                In progress
                <span className="ml-1.5 text-xs text-muted-foreground">
                  {stats.active}
                </span>
              </TabsTrigger>
              <TabsTrigger value="completed">
                Completed
                <span className="ml-1.5 text-xs text-muted-foreground">
                  {stats.completed}
                </span>
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <div className="relative sm:w-64">
              <Search
                aria-hidden="true"
                className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
              />
              <Input
                ref={searchRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Escape") {
                    setQuery("");
                    e.currentTarget.blur();
                  }
                }}
                aria-label="Search your courses"
                placeholder="Search your courses (press /)"
                className="pl-9 pr-9"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  aria-label="Clear search"
                  className="absolute right-2 top-1/2 grid size-6 -translate-y-1/2 place-items-center rounded-sm text-muted-foreground outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <X aria-hidden="true" className="size-3.5" />
                </button>
              )}
            </div>

            <div className="flex items-center gap-2">
              <Select value={sort} onValueChange={setSort}>
                <SelectTrigger
                  className="w-full sm:w-44"
                  aria-label="Sort courses"
                >
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  {SORT_OPTIONS.map((o) => (
                    <SelectItem key={o.value} value={o.value}>
                      {o.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <div
                className="flex shrink-0 rounded-lg border p-0.5"
                role="group"
                aria-label="Change layout"
              >
                {[
                  { value: "grid", icon: LayoutGrid, label: "Grid view" },
                  { value: "list", icon: List, label: "List view" },
                ].map((v) => (
                  <button
                    key={v.value}
                    type="button"
                    onClick={() => changeView(v.value)}
                    aria-label={v.label}
                    aria-pressed={view === v.value}
                    className={cn(
                      "relative flex size-8 items-center justify-center rounded-md outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring",
                      view === v.value
                        ? "text-primary-foreground"
                        : "text-muted-foreground hover:text-primary",
                    )}
                  >
                    {view === v.value && (
                      <motion.span
                        layoutId="view-toggle-pill"
                        className="absolute inset-0 rounded-md bg-primary shadow-[0_2px_0_0_color-mix(in_oklab,var(--primary)_55%,black)]"
                        transition={
                          reduce
                            ? { duration: 0 }
                            : { type: "spring", stiffness: 380, damping: 30 }
                        }
                      />
                    )}
                    <v.icon
                      aria-hidden="true"
                      className="relative z-10 size-4"
                    />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <p className="text-sm text-muted-foreground" aria-live="polite">
          Showing {filtered.length} of {items.length} courses
        </p>

        {/* Results */}
        {filtered.length ? (
          <motion.div
            layout={!reduce}
            className={cn(
              view === "grid"
                ? "grid gap-5 sm:grid-cols-2 xl:grid-cols-3"
                : "flex flex-col gap-3",
            )}
          >
            <AnimatePresence mode="popLayout" initial={false}>
              {filtered.map((item, i) => (
                <motion.div
                  key={item.id}
                  layout={!reduce}
                  initial={reduce ? false : { opacity: 0, y: 16, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.95 }}
                  transition={{
                    duration: 0.25,
                    delay: reduce ? 0 : Math.min(i * 0.04, 0.3),
                  }}
                >
                  {view === "grid" ? (
                    <Tilt max={5}>
                      <EnrolledCourseCard item={item} />
                    </Tilt>
                  ) : (
                    <CourseRow item={item} />
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        ) : (
          <EmptyState
            icon={Search}
            title="No matching courses"
            description="Try a different keyword, or switch to another tab."
            action={
              <Button variant="outline" onClick={clearFilters}>
                Clear filters
              </Button>
            }
          />
        )}
      </div>

      <ExploreSection />
      <StudyTipsSection />
    </div>
  );
}
