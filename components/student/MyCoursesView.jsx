"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  AnimatePresence,
  animate,
  motion,
  useMotionValue,
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
  List,
  PlayCircle,
  Search,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Target,
  TrendingUp,
  Users,
  Lightbulb,
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

const listVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

/* ---------------- Small building blocks ---------------- */
function AnimatedNumber({ value, suffix = "" }) {
  const mv = useMotionValue(0);
  const rounded = useTransform(mv, (v) => Math.round(v));

  useEffect(() => {
    const controls = animate(mv, value, { duration: 1, ease: "easeOut" });
    return () => controls.stop();
  }, [value, mv]);

  return (
    <>
      <motion.span>{rounded}</motion.span>
      {suffix}
    </>
  );
}

function ProgressBar({ value, className }) {
  return (
    <div
      className={cn("h-2 overflow-hidden rounded-full bg-muted", className)}
      role="progressbar"
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${value}%` }}
        transition={{ duration: 0.8, ease: "easeOut", delay: 0.1 }}
        className="h-full rounded-full bg-gradient-to-r from-primary to-primary/60"
      />
    </div>
  );
}

function ProgressRing({ value }) {
  const r = 42;
  return (
    <div className="relative size-32 shrink-0 sm:size-36">
      <svg viewBox="0 0 100 100" className="size-full -rotate-90" aria-hidden>
        <circle
          cx="50"
          cy="50"
          r={r}
          fill="none"
          strokeWidth="8"
          className="stroke-background/80"
        />
        <motion.circle
          cx="50"
          cy="50"
          r={r}
          fill="none"
          strokeWidth="8"
          strokeLinecap="round"
          className="stroke-primary"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: value / 100 }}
          transition={{ duration: 1.2, ease: "easeOut", delay: 0.3 }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-bold sm:text-3xl">
          <AnimatedNumber value={value} suffix="%" />
        </span>
        <span className="text-[11px] text-muted-foreground">Overall</span>
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
      className="group flex items-center gap-4 rounded-xl border bg-card p-4 transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md hover:shadow-primary/5"
    >
      <span
        className={cn(
          "flex size-11 shrink-0 items-center justify-center rounded-lg transition-colors",
          completed
            ? "bg-green-500/10 text-green-600"
            : "bg-primary/10 text-primary",
        )}
      >
        {completed ? (
          <CheckCircle2 className="size-5" />
        ) : (
          <BookOpen className="size-5" />
        )}
      </span>
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
          <span className="w-10 text-right text-xs text-muted-foreground">
            {progress}%
          </span>
        </div>
      </div>
      <ArrowRight className="size-4 shrink-0 -translate-x-2 text-primary opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-100" />
    </Link>
  );
}

/* ---------------- Explore categories (also used on empty page) ---------------- */
export function ExploreSection() {
  return (
    <section className="mt-12">
      <div className="mb-5 flex items-end justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold tracking-tight">
            Explore tech categories
          </h2>
          <p className="text-sm text-muted-foreground">
            Pick your next skill from our most popular learning paths.
          </p>
        </div>
        <Link
          href="/courses"
          className="group hidden items-center gap-1 text-sm font-medium text-primary sm:flex"
        >
          View all
          <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
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
          const Icon = ICONS[c.icon];
          return (
            <motion.div key={c.title} variants={itemVariants}>
              <Link
                href={c.href}
                className="group relative flex h-full flex-col gap-3 overflow-hidden rounded-xl border bg-card p-5 transition-all hover:-translate-y-1 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5"
              >
                <span className="pointer-events-none absolute -right-6 -top-6 size-24 rounded-full bg-primary/10 opacity-0 blur-2xl transition-opacity group-hover:opacity-100" />
                <span className="flex size-11 items-center justify-center rounded-lg bg-primary/10 text-primary transition-all group-hover:scale-110 group-hover:bg-primary group-hover:text-primary-foreground">
                  <Icon className="size-5" />
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
                  <ArrowUpRight className="size-4 text-primary opacity-0 transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:opacity-100" />
                </div>
              </Link>
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
    <section className="mt-12">
      <div className="mb-5 flex items-center gap-2">
        <Lightbulb className="size-5 text-yellow-500" />
        <h2 className="text-xl font-semibold tracking-tight">Study smarter</h2>
      </div>
      <motion.div
        variants={listVariants}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-60px" }}
        className="grid gap-4 md:grid-cols-3"
      >
        {STUDY_TIPS.map((t, i) => {
          const Icon = ICONS[t.icon];
          return (
            <motion.div
              key={t.title}
              variants={itemVariants}
              whileHover={{ y: -3 }}
              className="rounded-xl border bg-gradient-to-br from-muted/60 to-transparent p-5"
            >
              <div className="mb-3 flex items-center gap-3">
                <span className="flex size-9 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                  {i + 1}
                </span>
                <Icon className="size-5 text-muted-foreground" />
              </div>
              <h3 className="font-semibold">{t.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                {t.description}
              </p>
            </motion.div>
          );
        })}
      </motion.div>
    </section>
  );
}

/* ---------------- Main view ---------------- */
export function MyCoursesView({ items }) {
  const [tab, setTab] = useState("all");
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState("recent");
  const [view, setView] = useState("grid");

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
    {
      label: "Enrolled",
      value: items.length,
      icon: BookOpen,
      tone: "text-primary bg-primary/10",
    },
    {
      label: "In progress",
      value: stats.active,
      icon: TrendingUp,
      tone: "text-orange-500 bg-orange-500/10",
    },
    {
      label: "Completed",
      value: stats.completed,
      icon: CheckCircle2,
      tone: "text-green-600 bg-green-500/10",
    },
    {
      label: "Avg. progress",
      value: stats.avg,
      suffix: "%",
      icon: Target,
      tone: "text-violet-500 bg-violet-500/10",
    },
  ];

  const clearFilters = () => {
    setQuery("");
    setTab("all");
  };

  return (
    <div className="space-y-8">
      {/* Hero */}
      <motion.section
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="relative overflow-hidden rounded-2xl border bg-gradient-to-br from-primary/15 via-primary/5 to-transparent p-5 sm:p-8"
      >
        <motion.div
          aria-hidden
          animate={{ scale: [1, 1.15, 1], opacity: [0.4, 0.7, 0.4] }}
          transition={{ duration: 6, repeat: Infinity }}
          className="pointer-events-none absolute -right-16 -top-16 size-64 rounded-full bg-primary/20 blur-3xl"
        />
        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="min-w-0 flex-1">
            <Badge variant="secondary" className="gap-1">
              <Sparkles className="size-3" /> Your learning hub
            </Badge>
            <h2 className="mt-3 text-2xl font-bold tracking-tight sm:text-3xl">
              Keep the momentum going
            </h2>
            <p className="mt-1 max-w-xl text-sm text-muted-foreground sm:text-base">
              Every lesson you finish brings you closer to a career in tech.
              Pick up right where you left off.
            </p>

            {continueItem ? (
              <motion.div
                whileHover={{ y: -2 }}
                className="mt-5 flex max-w-xl items-center gap-4 rounded-xl border bg-background/80 p-4 backdrop-blur"
              >
                <PlayCircle className="size-10 shrink-0 text-primary" />
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
                    <span className="text-xs text-muted-foreground">
                      {getProgress(continueItem)}%
                    </span>
                  </div>
                </div>
                <Link
                  href={getHref(continueItem)}
                  className={cn(
                    buttonVariants({ size: "sm" }),
                    "group shrink-0",
                  )}
                >
                  Resume
                  <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </motion.div>
            ) : (
              <Link
                href="/courses"
                className={cn(buttonVariants(), "group mt-5")}
              >
                Find your next course
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
              </Link>
            )}
          </div>

          <div className="flex justify-center lg:justify-end">
            <ProgressRing value={stats.avg} />
          </div>
        </div>
      </motion.section>

      {/* Stats */}
      <motion.div
        variants={listVariants}
        initial="hidden"
        animate="show"
        className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4"
      >
        {statCards.map((s) => (
          <motion.div
            key={s.label}
            variants={itemVariants}
            whileHover={{ y: -3 }}
            className="flex items-center gap-3 rounded-xl border bg-card p-4 transition-colors hover:border-primary/40"
          >
            <span
              className={cn(
                "flex size-10 shrink-0 items-center justify-center rounded-lg",
                s.tone,
              )}
            >
              <s.icon className="size-5" />
            </span>
            <div>
              <p className="text-2xl font-bold leading-none">
                <AnimatedNumber value={s.value} suffix={s.suffix} />
              </p>
              <p className="mt-1 text-xs text-muted-foreground">{s.label}</p>
            </div>
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
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search your courses..."
                className="pl-9"
              />
            </div>

            <div className="flex items-center gap-2">
              <Select value={sort} onValueChange={setSort}>
                <SelectTrigger className="w-full sm:w-44">
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

              <div className="flex shrink-0 rounded-lg border p-0.5">
                {[
                  { value: "grid", icon: LayoutGrid, label: "Grid view" },
                  { value: "list", icon: List, label: "List view" },
                ].map((v) => (
                  <button
                    key={v.value}
                    type="button"
                    onClick={() => setView(v.value)}
                    aria-label={v.label}
                    aria-pressed={view === v.value}
                    className={cn(
                      "relative flex size-8 items-center justify-center rounded-md transition-colors",
                      view === v.value
                        ? "text-primary-foreground"
                        : "text-muted-foreground hover:text-primary",
                    )}
                  >
                    {view === v.value && (
                      <motion.span
                        layoutId="view-toggle-pill"
                        className="absolute inset-0 rounded-md bg-primary"
                        transition={{
                          type: "spring",
                          stiffness: 380,
                          damping: 30,
                        }}
                      />
                    )}
                    <v.icon className="relative z-10 size-4" />
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
            layout
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
                  layout
                  initial={{ opacity: 0, y: 16, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{
                    duration: 0.25,
                    delay: Math.min(i * 0.04, 0.3),
                  }}
                  whileHover={view === "grid" ? { y: -4 } : undefined}
                >
                  {view === "grid" ? (
                    <EnrolledCourseCard item={item} />
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
