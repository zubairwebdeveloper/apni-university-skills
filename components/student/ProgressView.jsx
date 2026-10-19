"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  animate,
  motion,
  useMotionValue,
  useReducedMotion,
  useTransform,
} from "framer-motion";
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

/* Semantic tokens only. State is also spelled out in text, never colour alone. */
const STATE_META = {
  completed: {
    icon: CheckCircle2,
    tone: "bg-primary text-primary-foreground",
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

/* Shared entrance variants that collapse to no motion when the user asks for it */
function useMotionKit() {
  const reduce = useReducedMotion();
  return useMemo(
    () => ({
      reduce: !!reduce,
      list: {
        hidden: {},
        show: { transition: { staggerChildren: reduce ? 0 : 0.06 } },
      },
      item: {
        hidden: reduce ? { opacity: 1 } : { opacity: 0, y: 16 },
        show: {
          opacity: 1,
          y: 0,
          transition: { duration: reduce ? 0 : 0.3, ease: "easeOut" },
        },
      },
      lift: reduce ? undefined : { y: -3 },
    }),
    [reduce],
  );
}

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
  const reduce = useReducedMotion();
  const mv = useMotionValue(0);
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
      <motion.span className="tabular-nums">{rounded}</motion.span>
      {suffix}
    </>
  );
}

function ProgressRing({ value }) {
  const reduce = useReducedMotion();

  return (
    <div
      role="img"
      aria-label={`Average progress ${value} percent`}
      className="relative size-36 shrink-0 sm:size-44"
    >
      <svg viewBox="0 0 100 100" className="size-full -rotate-90" aria-hidden>
        <circle
          cx="50"
          cy="50"
          r="42"
          fill="none"
          strokeWidth="8"
          className="stroke-muted"
        />
        <motion.circle
          cx="50"
          cy="50"
          r="42"
          fill="none"
          strokeWidth="8"
          strokeLinecap="round"
          className="stroke-primary"
          initial={{ pathLength: reduce ? value / 100 : 0 }}
          animate={{ pathLength: value / 100 }}
          transition={{
            duration: reduce ? 0 : 1.2,
            ease: "easeOut",
            delay: reduce ? 0 : 0.3,
          }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-bold tracking-tight sm:text-4xl">
          <AnimatedNumber value={value} suffix="%" />
        </span>
        <span className="text-xs text-muted-foreground">Average progress</span>
      </div>
    </div>
  );
}

function MilestoneBar({ value }) {
  const reduce = useReducedMotion();

  return (
    <div className="relative pt-1">
      <div
        className="h-2.5 overflow-hidden rounded-full bg-muted"
        role="progressbar"
        aria-label="Course progress"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <motion.div
          initial={{ width: reduce ? `${value}%` : 0 }}
          whileInView={{ width: `${value}%` }}
          viewport={{ once: true }}
          transition={{ duration: reduce ? 0 : 0.9, ease: "easeOut" }}
          className="h-full rounded-full bg-primary"
        />
      </div>

      {/* Tick marks over the bar */}
      {MILESTONES.filter((m) => m > 0 && m < 100).map((m) => (
        <span
          key={m}
          aria-hidden="true"
          style={{ left: `${m}%` }}
          className="absolute top-1 h-2.5 w-px bg-background/80"
        />
      ))}

      {/* Labels */}
      <div className="relative mt-1.5 h-4 text-[11px] text-muted-foreground">
        {MILESTONES.map((m) => (
          <span
            key={m}
            style={{ left: `${m}%` }}
            className={cn(
              "absolute tabular-nums transition-colors motion-reduce:transition-none",
              m === 100
                ? "-translate-x-full"
                : m === 0
                  ? ""
                  : "-translate-x-1/2",
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
  const { reduce } = useMotionKit();
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
    <div
      className={cn(
        "group relative overflow-hidden rounded-2xl border border-border bg-card p-5 shadow-sm transition-[border-color,box-shadow,transform] duration-200 hover:border-primary/40 hover:shadow-md sm:p-6",
        !reduce && "hover:-translate-y-0.5",
      )}
    >
      <div className="flex items-start gap-4">
        <span
          aria-hidden="true"
          className={cn(
            "flex size-11 shrink-0 items-center justify-center rounded-xl",
            meta.tone,
          )}
        >
          <Icon className="size-5" />
        </span>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="break-words font-serif text-lg font-semibold leading-snug transition-colors group-hover:text-primary motion-reduce:transition-none">
              {item.courseTitle}
            </h3>
            <StatusBadge status={item.status} />
          </div>
          <p className="mt-1 text-sm text-muted-foreground">{message}</p>
        </div>

        <p className="shrink-0 text-2xl font-bold leading-none tracking-tight">
          <AnimatedNumber value={item.p} suffix="%" />
        </p>
      </div>

      <div className="mt-5">
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
          {item.state === "completed" && (
            <RotateCcw aria-hidden="true" className="size-4" />
          )}
          {meta.action}
          <ArrowRight
            aria-hidden="true"
            className="size-4 transition-transform group-hover/btn:translate-x-1 motion-reduce:transition-none motion-reduce:group-hover/btn:translate-x-0"
          />
        </Link>
      </div>
    </div>
  );
}

function StatusBreakdown({ stats, onSelect }) {
  const { reduce } = useMotionKit();
  const segments = [
    {
      key: "completed",
      label: "Completed",
      value: stats.completed,
      bar: "bg-primary",
    },
    {
      key: "in-progress",
      label: "In progress",
      value: stats.inProgress,
      bar: "bg-primary/45",
    },
    {
      key: "not-started",
      label: "Not started",
      value: stats.notStarted,
      bar: "bg-muted-foreground/35",
    },
  ];

  return (
    <section
      aria-labelledby="status-breakdown-title"
      className="rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-6"
    >
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2
          id="status-breakdown-title"
          className="text-base font-semibold tracking-tight"
        >
          Course status breakdown
        </h2>
        <span className="text-sm text-muted-foreground tabular-nums">
          {stats.total} {stats.total === 1 ? "course" : "courses"}
        </span>
      </div>

      <div
        aria-hidden="true"
        className="flex h-3 overflow-hidden rounded-full bg-muted"
      >
        {segments.map((s) => (
          <motion.div
            key={s.key}
            initial={{
              width: reduce
                ? `${stats.total ? (s.value / stats.total) * 100 : 0}%`
                : 0,
            }}
            animate={{
              width: `${stats.total ? (s.value / stats.total) * 100 : 0}%`,
            }}
            transition={{
              duration: reduce ? 0 : 0.9,
              ease: "easeOut",
              delay: reduce ? 0 : 0.2,
            }}
            className={cn("h-full", s.bar)}
          />
        ))}
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2 sm:gap-3">
        {segments.map((s) => (
          <button
            key={s.key}
            type="button"
            onClick={() => onSelect(s.key)}
            aria-label={`Show ${s.label.toLowerCase()} courses (${s.value})`}
            className="group rounded-xl border border-border p-3 text-left transition-colors hover:border-primary/40 hover:bg-primary/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background motion-reduce:transition-none"
          >
            <span className="flex items-center gap-2 text-xs text-muted-foreground transition-colors group-hover:text-primary motion-reduce:transition-none">
              <span
                aria-hidden="true"
                className={cn("size-2 shrink-0 rounded-full", s.bar)}
              />
              <span className="truncate">{s.label}</span>
            </span>
            <span className="mt-1 block text-xl font-bold tabular-nums">
              {s.value}
            </span>
          </button>
        ))}
      </div>
    </section>
  );
}

function AchievementsSection({ stats }) {
  const { list, item, lift } = useMotionKit();
  const unlockedCount = BADGES.filter((b) => b.check(stats)).length;

  return (
    <section aria-labelledby="achievements-title">
      <div className="mb-5 flex flex-wrap items-end justify-between gap-2">
        <div>
          <h2
            id="achievements-title"
            className="text-xl font-semibold tracking-tight"
          >
            Achievements
          </h2>
          <p className="text-sm text-muted-foreground">
            Unlock badges as you learn. Every milestone counts.
          </p>
        </div>
        <Badge variant="secondary">
          {unlockedCount} of {BADGES.length} unlocked
        </Badge>
      </div>

      <motion.div
        variants={list}
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
              variants={item}
              whileHover={unlocked ? lift : undefined}
              className={cn(
                "relative flex items-center gap-4 overflow-hidden rounded-2xl border p-4 transition-colors motion-reduce:transition-none",
                unlocked
                  ? "border-primary/30 bg-card shadow-sm hover:border-primary/50"
                  : "border-dashed border-border bg-muted/30",
              )}
            >
              <span
                aria-hidden="true"
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
                    <CheckCircle2
                      aria-hidden="true"
                      className="size-4 shrink-0 text-primary"
                    />
                  )}
                  <span className="sr-only">
                    {unlocked ? "(unlocked)" : "(locked)"}
                  </span>
                </p>
                <p className="text-sm text-muted-foreground">{b.description}</p>
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
  const { list, item, lift } = useMotionKit();

  return (
    <div className="mt-10 space-y-10">
      <section aria-labelledby="progress-guide-title">
        <h2
          id="progress-guide-title"
          className="mb-5 text-xl font-semibold tracking-tight"
        >
          How your progress works
        </h2>
        <motion.div
          variants={list}
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
                variants={item}
                whileHover={lift}
                className="rounded-2xl border border-border bg-card p-5 shadow-sm transition-colors hover:border-primary/40 motion-reduce:transition-none"
              >
                <div className="mb-3 flex items-center gap-3">
                  <span className="flex size-9 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary tabular-nums">
                    {i + 1}
                  </span>
                  <Icon
                    aria-hidden="true"
                    className="size-5 text-muted-foreground"
                  />
                </div>
                <h3 className="font-semibold">{g.title}</h3>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                  {g.description}
                </p>
              </motion.div>
            );
          })}
        </motion.div>
      </section>

      <section aria-labelledby="progress-tips-title">
        <div className="mb-5 flex items-center gap-2">
          <Lightbulb aria-hidden="true" className="size-5 text-primary" />
          <h2
            id="progress-tips-title"
            className="text-xl font-semibold tracking-tight"
          >
            Tips to keep moving forward
          </h2>
        </div>
        <motion.div
          variants={list}
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
                variants={item}
                whileHover={lift}
                className="rounded-2xl border border-border bg-muted/40 p-5"
              >
                <span
                  aria-hidden="true"
                  className="mb-3 grid size-9 place-items-center rounded-lg bg-primary/10 text-primary"
                >
                  <Icon className="size-5" />
                </span>
                <h3 className="font-semibold">{t.title}</h3>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
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
  const { reduce, list, item, lift } = useMotionKit();
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
    { label: "Enrolled", value: stats.total, icon: BookOpen },
    { label: "In progress", value: stats.inProgress, icon: TrendingUp },
    { label: "Completed", value: stats.completed, icon: CheckCircle2 },
    { label: "Not started", value: stats.notStarted, icon: Clock },
  ];

  return (
    <div className="space-y-8">
      {/* Hero */}
      <motion.section
        aria-labelledby="progress-hero-title"
        initial={reduce ? false : { opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: reduce ? 0 : 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="relative overflow-hidden rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-8 lg:p-10"
      >
        {/* hairline accent along the top edge */}
        <div
          aria-hidden="true"
          className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/60 to-transparent"
        />

        <div className="relative flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between lg:gap-12">
          <div className="min-w-0 flex-1">
            <Badge variant="secondary" className="gap-1">
              <Sparkles aria-hidden="true" className="size-3" /> Progress
              overview
            </Badge>
            <h2
              id="progress-hero-title"
              className="mt-4 text-3xl font-bold leading-tight tracking-tight sm:text-4xl"
            >
              {copy.title}
            </h2>
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground sm:text-base">
              {copy.text}
            </p>
            <p className="mt-3 text-sm font-medium tabular-nums">
              <span className="text-primary">{stats.completed}</span> of{" "}
              {stats.total} courses completed
            </p>

            {focus ? (
              <motion.div
                whileHover={lift}
                className="mt-6 flex max-w-xl flex-col gap-4 rounded-2xl border border-border bg-muted/40 p-4 sm:flex-row sm:items-center"
              >
                <div className="flex min-w-0 flex-1 items-center gap-3">
                  <span
                    aria-hidden="true"
                    className="grid size-11 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary"
                  >
                    <Zap className="size-5" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      Closest to the finish line
                    </p>
                    <p className="truncate text-sm font-semibold sm:text-base">
                      {focus.courseTitle}
                    </p>
                    <div className="mt-2 flex items-center gap-3">
                      <div
                        role="progressbar"
                        aria-label={`Progress in ${focus.courseTitle}`}
                        aria-valuenow={focus.p}
                        aria-valuemin={0}
                        aria-valuemax={100}
                        className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted"
                      >
                        <motion.div
                          initial={{ width: reduce ? `${focus.p}%` : 0 }}
                          animate={{ width: `${focus.p}%` }}
                          transition={{
                            duration: reduce ? 0 : 0.9,
                            ease: "easeOut",
                            delay: reduce ? 0 : 0.3,
                          }}
                          className="h-full rounded-full bg-primary"
                        />
                      </div>
                      <span className="text-xs text-muted-foreground tabular-nums">
                        {focus.p}%
                      </span>
                    </div>
                  </div>
                </div>
                <Link
                  href={getHref(focus)}
                  className={cn(
                    buttonVariants({ size: "sm" }),
                    "group w-full shrink-0 sm:w-auto",
                  )}
                >
                  Resume
                  <ArrowRight
                    aria-hidden="true"
                    className="size-4 transition-transform group-hover:translate-x-1 motion-reduce:transition-none motion-reduce:group-hover:translate-x-0"
                  />
                </Link>
              </motion.div>
            ) : (
              <Link
                href="/courses"
                className={cn(
                  buttonVariants({ size: "lg" }),
                  "group mt-6 w-full sm:w-auto",
                )}
              >
                Explore more courses
                <ArrowRight
                  aria-hidden="true"
                  className="size-4 transition-transform group-hover:translate-x-1 motion-reduce:transition-none motion-reduce:group-hover:translate-x-0"
                />
              </Link>
            )}
          </div>

          <div className="flex justify-center lg:justify-end">
            <div className="rounded-2xl border border-border bg-muted/40 p-6 sm:p-8">
              <ProgressRing value={stats.avg} />
            </div>
          </div>
        </div>
      </motion.section>

      {/* Stat cards */}
      <motion.ul
        aria-label="Course totals"
        variants={list}
        initial="hidden"
        animate="show"
        className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4"
      >
        {statCards.map((s) => (
          <motion.li
            key={s.label}
            variants={item}
            whileHover={lift}
            className="flex min-w-0 items-center gap-3 rounded-2xl border border-border bg-card p-4 shadow-sm transition-colors hover:border-primary/40 motion-reduce:transition-none sm:p-5"
          >
            <span
              aria-hidden="true"
              className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary"
            >
              <s.icon className="size-5" />
            </span>
            <div className="min-w-0">
              <p className="text-2xl font-bold leading-none tracking-tight">
                <AnimatedNumber value={s.value} />
              </p>
              <p className="mt-1 truncate text-xs text-muted-foreground">
                {s.label}
              </p>
            </div>
          </motion.li>
        ))}
      </motion.ul>

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
                    <span className="ml-1.5 text-xs text-muted-foreground tabular-nums">
                      {t.count}
                    </span>
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </div>

          <Select value={sort} onValueChange={setSort}>
            <SelectTrigger className="w-full sm:w-48" aria-label="Sort courses">
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

        <p
          className="text-sm text-muted-foreground tabular-nums"
          aria-live="polite"
        >
          Showing {filtered.length} of {stats.total} courses
        </p>

        {filtered.length ? (
          <motion.ul
            key={`${tab}-${sort}`}
            variants={list}
            initial="hidden"
            animate="show"
            className="space-y-4"
          >
            {filtered.map((it) => (
              <motion.li key={it.id} variants={item}>
                <CourseProgressCard item={it} />
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
