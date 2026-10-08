"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { animate, motion, useMotionValue, useTransform } from "framer-motion";
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Clock,
  Crown,
  Flag,
  Layers,
  Lightbulb,
  Lock,
  PlayCircle,
  RotateCcw,
  Rocket,
  Search,
  Sparkles,
  Target,
  TrendingUp,
  Trophy,
  Zap,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { EmptyState } from "@/components/shared/EmptyState";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { cn } from "@/lib/utils";
import {
  BADGES,
  MILESTONES,
  PROGRESS_GUIDE,
  PROGRESS_SORTS,
  PROGRESS_TIPS,
} from "@/lib/progress-data";

/* ---------------- Helpers ---------------- */
const getProgress = (i) =>
  Math.max(0, Math.min(100, Math.round(i.progress ?? 0)));

const getState = (i) => {
  const p = getProgress(i);
  if (i.status === "completed" || p >= 100) return "completed";
  if (p === 0) return "not-started";
  return "in-progress";
};

const getHref = (i) => `/student/learning/${i.courseSlug}`;
const nextMilestone = (p) => MILESTONES.find((m) => m > p) ?? 100;

const SORTERS = {
  "progress-desc": (a, b) => b.p - a.p,
  "progress-asc": (a, b) => a.p - b.p,
  title: (a, b) => (a.courseTitle ?? "").localeCompare(b.courseTitle ?? ""),
};

const ICONS = {
  rocket: Rocket,
  play: PlayCircle,
  flag: Flag,
  trophy: Trophy,
  layers: Layers,
  crown: Crown,
  target: Target,
  book: BookOpen,
  zap: Zap,
};

const STATE_META = {
  completed: {
    icon: CheckCircle2,
    tone: "bg-green-500/10 text-green-600",
    action: "Review",
  },
  "in-progress": {
    icon: PlayCircle,
    tone: "bg-primary/10 text-primary",
    action: "Continue",
  },
  "not-started": {
    icon: Clock,
    tone: "bg-muted text-muted-foreground",
    action: "Start learning",
  },
};

const listVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

function heroCopy(s) {
  if (!s.total)
    return {
      title: "Your learning journey starts here",
      text: "Enroll in a course and every lesson you finish will be tracked right here.",
    };
  if (s.completed === s.total)
    return {
      title: "Outstanding — every course completed!",
      text: "You have finished everything you enrolled in. Time to pick your next challenge.",
    };
  if (s.avg >= 50)
    return {
      title: "You're making great progress",
      text: "You are past the halfway mark on average. Keep going and finish strong.",
    };
  if (s.avg > 0)
    return {
      title: "Great start — keep it going",
      text: "Every lesson counts. A little progress each day adds up quickly.",
    };
  return {
    title: "Ready when you are",
    text: "You are enrolled and set up. Start your first lesson to begin tracking progress.",
  };
}

/* ---------------- Building blocks ---------------- */
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

function ProgressRing({ value }) {
  return (
    <div className="relative size-32 shrink-0 sm:size-40">
      <svg viewBox="0 0 100 100" className="size-full -rotate-90" aria-hidden>
        <circle
          cx="50"
          cy="50"
          r="42"
          fill="none"
          strokeWidth="8"
          className="stroke-background/80"
        />
        <motion.circle
          cx="50"
          cy="50"
          r="42"
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
        <span className="text-3xl font-bold sm:text-4xl">
          <AnimatedNumber value={value} suffix="%" />
        </span>
        <span className="text-[11px] text-muted-foreground">
          Average progress
        </span>
      </div>
    </div>
  );
}

function MilestoneBar({ value }) {
  return (
    <div className="relative pt-1">
      <div
        className="h-2.5 overflow-hidden rounded-full bg-muted"
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <motion.div
          initial={{ width: 0 }}
          whileInView={{ width: `${value}%` }}
          viewport={{ once: true }}
          transition={{ duration: 0.9, ease: "easeOut" }}
          className="h-full rounded-full bg-gradient-to-r from-primary to-primary/60"
        />
      </div>

      {/* Tick marks over the bar */}
      {MILESTONES.filter((m) => m < 100).map((m) => (
        <span
          key={m}
          style={{ left: `${m}%` }}
          className="absolute top-1 h-2.5 w-px bg-background/80"
        />
      ))}

      {/* Labels */}
      <div className="relative mt-1.5 h-4 text-[10px] text-muted-foreground">
        {MILESTONES.map((m) => (
          <span
            key={m}
            style={{ left: `${m}%` }}
            className={cn(
              "absolute transition-colors",
              m === 100 ? "-translate-x-full" : "-translate-x-1/2",
              value >= m && "font-semibold text-primary",
            )}
          >
            {m}%
          </span>
        ))}
      </div>
    </div>
  );
}

function CourseProgressCard({ item }) {
  const meta = STATE_META[item.state];
  const Icon = meta.icon;
  const next = nextMilestone(item.p);

  const message =
    item.state === "completed"
      ? "Course completed — great work!"
      : item.state === "not-started"
        ? "Not started yet. Your first lesson is waiting."
        : `${next - item.p}% to your next milestone (${next}%)`;

  return (
    <div className="group relative overflow-hidden rounded-xl border bg-card p-5 transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5">
      <div className="flex items-start gap-4">
        <span
          className={cn(
            "flex size-11 shrink-0 items-center justify-center rounded-lg transition-transform group-hover:scale-110",
            meta.tone,
          )}
        >
          <Icon className="size-5" />
        </span>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-serif text-lg font-semibold transition-colors group-hover:text-primary">
              {item.courseTitle}
            </h3>
            <StatusBadge status={item.status} />
          </div>
          <p className="mt-1 text-xs text-muted-foreground">{message}</p>
        </div>

        <p className="shrink-0 text-2xl font-bold leading-none">
          <AnimatedNumber value={item.p} suffix="%" />
        </p>
      </div>

      <div className="mt-4">
        <MilestoneBar value={item.p} />
      </div>

      <div className="mt-4 flex justify-end">
        <Link
          href={getHref(item)}
          className={cn(
            buttonVariants({
              variant: item.state === "in-progress" ? "default" : "outline",
              size: "sm",
            }),
            "group/btn",
          )}
        >
          {item.state === "completed" && <RotateCcw className="size-4" />}
          {meta.action}
          <ArrowRight className="size-4 transition-transform group-hover/btn:translate-x-1" />
        </Link>
      </div>
    </div>
  );
}

function StatusBreakdown({ stats, onSelect }) {
  const segments = [
    {
      key: "completed",
      label: "Completed",
      value: stats.completed,
      bar: "bg-green-500",
    },
    {
      key: "in-progress",
      label: "In progress",
      value: stats.inProgress,
      bar: "bg-primary",
    },
    {
      key: "not-started",
      label: "Not started",
      value: stats.notStarted,
      bar: "bg-muted-foreground/40",
    },
  ];

  return (
    <div className="rounded-xl border bg-card p-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="font-semibold">Course status breakdown</h2>
        <span className="text-xs text-muted-foreground">
          {stats.total} {stats.total === 1 ? "course" : "courses"}
        </span>
      </div>

      <div className="flex h-3 overflow-hidden rounded-full bg-muted">
        {segments.map((s) => (
          <motion.div
            key={s.key}
            initial={{ width: 0 }}
            animate={{ width: `${(s.value / stats.total) * 100}%` }}
            transition={{ duration: 0.9, ease: "easeOut", delay: 0.2 }}
            className={cn("h-full", s.bar)}
          />
        ))}
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2">
        {segments.map((s) => (
          <button
            key={s.key}
            type="button"
            onClick={() => onSelect(s.key)}
            className="group rounded-lg border p-3 text-left transition-colors hover:border-primary/40 hover:bg-primary/5"
          >
            <span className="flex items-center gap-2 text-xs text-muted-foreground transition-colors group-hover:text-primary">
              <span className={cn("size-2 rounded-full", s.bar)} />
              {s.label}
            </span>
            <span className="mt-1 block text-xl font-bold">{s.value}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

function AchievementsSection({ stats }) {
  const unlockedCount = BADGES.filter((b) => b.check(stats)).length;

  return (
    <section>
      <div className="mb-5 flex flex-wrap items-end justify-between gap-2">
        <div>
          <h2 className="text-xl font-semibold tracking-tight">Achievements</h2>
          <p className="text-sm text-muted-foreground">
            Unlock badges as you learn. Every milestone counts.
          </p>
        </div>
        <Badge variant="secondary">
          {unlockedCount} of {BADGES.length} unlocked
        </Badge>
      </div>

      <motion.div
        variants={listVariants}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-60px" }}
        className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
      >
        {BADGES.map((b) => {
          const unlocked = b.check(stats);
          const Icon = ICONS[b.icon];
          return (
            <motion.div
              key={b.id}
              variants={itemVariants}
              whileHover={unlocked ? { y: -3 } : undefined}
              className={cn(
                "relative flex items-center gap-4 overflow-hidden rounded-xl border p-4 transition-colors",
                unlocked
                  ? "bg-gradient-to-br from-primary/10 to-transparent hover:border-primary/40"
                  : "bg-card opacity-70",
              )}
            >
              <span
                className={cn(
                  "flex size-12 shrink-0 items-center justify-center rounded-full",
                  unlocked
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground",
                )}
              >
                {unlocked ? (
                  <Icon className="size-5" />
                ) : (
                  <Lock className="size-4" />
                )}
              </span>
              <div className="min-w-0">
                <p className="flex items-center gap-2 text-sm font-semibold">
                  {b.title}
                  {unlocked && (
                    <CheckCircle2 className="size-4 text-green-600" />
                  )}
                </p>
                <p className="text-xs text-muted-foreground">{b.description}</p>
              </div>
            </motion.div>
          );
        })}
      </motion.div>
    </section>
  );
}

/* ---------------- Guide + tips (also used on the empty page) ---------------- */
export function ProgressGuide() {
  return (
    <div className="mt-10 space-y-10">
      <section>
        <h2 className="mb-5 text-xl font-semibold tracking-tight">
          How your progress works
        </h2>
        <motion.div
          variants={listVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-60px" }}
          className="grid gap-4 md:grid-cols-3"
        >
          {PROGRESS_GUIDE.map((g, i) => {
            const Icon = ICONS[g.icon];
            return (
              <motion.div
                key={g.title}
                variants={itemVariants}
                whileHover={{ y: -3 }}
                className="rounded-xl border bg-card p-5 transition-colors hover:border-primary/40"
              >
                <div className="mb-3 flex items-center gap-3">
                  <span className="flex size-9 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                    {i + 1}
                  </span>
                  <Icon className="size-5 text-muted-foreground" />
                </div>
                <h3 className="font-semibold">{g.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  {g.description}
                </p>
              </motion.div>
            );
          })}
        </motion.div>
      </section>

      <section>
        <div className="mb-5 flex items-center gap-2">
          <Lightbulb className="size-5 text-yellow-500" />
          <h2 className="text-xl font-semibold tracking-tight">
            Tips to keep moving forward
          </h2>
        </div>
        <motion.div
          variants={listVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-60px" }}
          className="grid gap-4 md:grid-cols-3"
        >
          {PROGRESS_TIPS.map((t) => {
            const Icon = ICONS[t.icon];
            return (
              <motion.div
                key={t.title}
                variants={itemVariants}
                whileHover={{ y: -3 }}
                className="rounded-xl border bg-gradient-to-br from-muted/60 to-transparent p-5"
              >
                <Icon className="mb-3 size-5 text-primary" />
                <h3 className="font-semibold">{t.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  {t.description}
                </p>
              </motion.div>
            );
          })}
        </motion.div>
      </section>
    </div>
  );
}

/* ---------------- Main view ---------------- */
export function ProgressView({ items }) {
  const [tab, setTab] = useState("all");
  const [sort, setSort] = useState("progress-desc");

  const enriched = useMemo(
    () => items.map((i) => ({ ...i, p: getProgress(i), state: getState(i) })),
    [items],
  );

  const stats = useMemo(() => {
    const total = enriched.length;
    const completed = enriched.filter((i) => i.state === "completed").length;
    const inProgress = enriched.filter((i) => i.state === "in-progress").length;
    const notStarted = enriched.filter((i) => i.state === "not-started").length;
    const avg = total
      ? Math.round(enriched.reduce((n, i) => n + i.p, 0) / total)
      : 0;
    const best = enriched.reduce((m, i) => Math.max(m, i.p), 0);
    return {
      total,
      completed,
      inProgress,
      notStarted,
      started: total - notStarted,
      best,
      avg,
    };
  }, [enriched]);

  const focus = useMemo(
    () =>
      enriched
        .filter((i) => i.state === "in-progress")
        .sort((a, b) => b.p - a.p)[0] ?? null,
    [enriched],
  );

  const filtered = useMemo(() => {
    const list = enriched.filter((i) => tab === "all" || i.state === tab);
    return [...list].sort(SORTERS[sort]);
  }, [enriched, tab, sort]);

  const copy = heroCopy(stats);

  const statCards = [
    {
      label: "Enrolled",
      value: stats.total,
      icon: BookOpen,
      tone: "text-primary bg-primary/10",
    },
    {
      label: "In progress",
      value: stats.inProgress,
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
      label: "Not started",
      value: stats.notStarted,
      icon: Clock,
      tone: "text-violet-500 bg-violet-500/10",
    },
  ];

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
              <Sparkles className="size-3" /> Progress overview
            </Badge>
            <h2 className="mt-3 text-2xl font-bold tracking-tight sm:text-3xl">
              {copy.title}
            </h2>
            <p className="mt-1 max-w-xl text-sm text-muted-foreground sm:text-base">
              {copy.text}
            </p>
            <p className="mt-2 text-sm font-medium">
              {stats.completed} of {stats.total} courses completed
            </p>

            {focus ? (
              <motion.div
                whileHover={{ y: -2 }}
                className="mt-5 flex max-w-xl flex-col gap-3 rounded-xl border bg-background/80 p-4 backdrop-blur sm:flex-row sm:items-center"
              >
                <div className="flex min-w-0 flex-1 items-center gap-3">
                  <Zap className="size-9 shrink-0 text-primary" />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      Closest to the finish line
                    </p>
                    <p className="truncate text-sm font-semibold sm:text-base">
                      {focus.courseTitle}
                    </p>
                    <div className="mt-2 flex items-center gap-3">
                      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${focus.p}%` }}
                          transition={{
                            duration: 0.9,
                            ease: "easeOut",
                            delay: 0.3,
                          }}
                          className="h-full rounded-full bg-gradient-to-r from-primary to-primary/60"
                        />
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {focus.p}%
                      </span>
                    </div>
                  </div>
                </div>
                <Link
                  href={getHref(focus)}
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
                Explore more courses
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
              </Link>
            )}
          </div>

          <div className="flex justify-center lg:justify-end">
            <ProgressRing value={stats.avg} />
          </div>
        </div>
      </motion.section>

      {/* Stat cards */}
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
                <AnimatedNumber value={s.value} />
              </p>
              <p className="mt-1 text-xs text-muted-foreground">{s.label}</p>
            </div>
          </motion.div>
        ))}
      </motion.div>

      <StatusBreakdown stats={stats} onSelect={setTab} />

      {/* Course progress list */}
      <section className="space-y-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="-mx-1 overflow-x-auto px-1">
            <Tabs value={tab} onValueChange={setTab}>
              <TabsList className="w-max">
                {[
                  { value: "all", label: "All", count: stats.total },
                  {
                    value: "in-progress",
                    label: "In progress",
                    count: stats.inProgress,
                  },
                  {
                    value: "completed",
                    label: "Completed",
                    count: stats.completed,
                  },
                  {
                    value: "not-started",
                    label: "Not started",
                    count: stats.notStarted,
                  },
                ].map((t) => (
                  <TabsTrigger key={t.value} value={t.value}>
                    {t.label}
                    <span className="ml-1.5 text-xs text-muted-foreground">
                      {t.count}
                    </span>
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </div>

          <Select value={sort} onValueChange={setSort}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              {PROGRESS_SORTS.map((o) => (
                <SelectItem key={o.value} value={o.value}>
                  {o.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <p className="text-sm text-muted-foreground" aria-live="polite">
          Showing {filtered.length} of {stats.total} courses
        </p>

        {filtered.length ? (
          <motion.ul
            key={`${tab}-${sort}`}
            variants={listVariants}
            initial="hidden"
            animate="show"
            className="space-y-4"
          >
            {filtered.map((item) => (
              <motion.li key={item.id} variants={itemVariants}>
                <CourseProgressCard item={item} />
              </motion.li>
            ))}
          </motion.ul>
        ) : (
          <EmptyState
            icon={Search}
            title="Nothing here yet"
            description="No courses match this filter. Switch to another tab to see the rest."
            action={
              <Button variant="outline" onClick={() => setTab("all")}>
                Show all courses
              </Button>
            }
          />
        )}
      </section>

      <AchievementsSection stats={stats} />
      <ProgressGuide />
    </div>
  );
}
