// components/student/StudyStreak.jsx
"use client";

import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { CalendarDays, Check, Trophy, Zap } from "lucide-react";

import { cn } from "@/lib/utils";

const STORAGE_KEY = "student-study-days";
const CHANGE_EVENT = "student-study-days-change";
const DAY_MS = 86_400_000;
const MILESTONES = [3, 7, 14, 30, 60, 100];

/* Design tokens: yellow = progress / key action, violet = today / selected */
const FOCUS =
  "outline-none focus-visible:ring-2 focus-visible:ring-[#8B5CF6] focus-visible:ring-offset-2 focus-visible:ring-offset-background";

/* -------------------------------------------------------------------------- */
/* localStorage external store                                                */
/* -------------------------------------------------------------------------- */

function subscribe(onChange) {
  if (typeof window === "undefined") {
    return () => {};
  }

  window.addEventListener("storage", onChange);
  window.addEventListener(CHANGE_EVENT, onChange);

  return () => {
    window.removeEventListener("storage", onChange);
    window.removeEventListener(CHANGE_EVENT, onChange);
  };
}

function getSnapshot() {
  if (typeof window === "undefined") {
    return "[]";
  }

  try {
    return window.localStorage.getItem(STORAGE_KEY) || "[]";
  } catch {
    return "[]";
  }
}

function getServerSnapshot() {
  return "[]";
}

/* -------------------------------------------------------------------------- */
/* Mounted state                                                              */
/* -------------------------------------------------------------------------- */

const emptySubscribe = () => () => {};

function useMounted() {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  );
}

/* -------------------------------------------------------------------------- */
/* Date helpers                                                               */
/* -------------------------------------------------------------------------- */

function pad(value) {
  return String(value).padStart(2, "0");
}

function formatDate(date) {
  return [
    date.getFullYear(),
    pad(date.getMonth() + 1),
    pad(date.getDate()),
  ].join("-");
}

function getToday() {
  return formatDate(new Date());
}

/* -------------------------------------------------------------------------- */
/* Streak calculations                                                        */
/* -------------------------------------------------------------------------- */

function currentStreak(daysSet) {
  let streak = 0;
  const date = new Date();

  // If today isn't completed yet, allow yesterday to keep the streak alive.
  if (!daysSet.has(formatDate(date))) {
    date.setDate(date.getDate() - 1);
  }

  while (daysSet.has(formatDate(date))) {
    streak += 1;
    date.setDate(date.getDate() - 1);
  }

  return streak;
}

function bestStreak(days) {
  const sorted = [...new Set(days)].sort();

  let best = 0;
  let run = 0;
  let previous = null;

  for (const value of sorted) {
    const [year, month, day] = value.split("-").map(Number);
    const current = new Date(year, month - 1, day);

    if (
      previous &&
      Math.round((current.getTime() - previous.getTime()) / DAY_MS) === 1
    ) {
      run += 1;
    } else {
      run = 1;
    }

    best = Math.max(best, run);
    previous = current;
  }

  return best;
}

/* -------------------------------------------------------------------------- */
/* UI copy                                                                    */
/* -------------------------------------------------------------------------- */

function getMessage(streak, doneToday) {
  if (doneToday) {
    if (streak >= 30) {
      return "A full month. Outstanding.";
    }

    if (streak >= 7) {
      return "One week or more. Keep it going.";
    }

    return "Nice work. Come back tomorrow.";
  }

  if (streak > 0) {
    return `Study today to keep your ${streak}-day streak.`;
  }

  return "Start your streak with a short study session today.";
}

/* -------------------------------------------------------------------------- */
/* Small pieces                                                               */
/* -------------------------------------------------------------------------- */

function StatTile({ icon: Icon, label, value, iconClass }) {
  return (
    <div className="flex items-center gap-2.5 rounded-xl border border-border/70 bg-muted/40 px-3 py-2.5">
      <span
        className={cn(
          "grid size-7 shrink-0 place-items-center rounded-lg bg-background",
          iconClass,
        )}
      >
        <Icon aria-hidden="true" className="size-3.5" />
      </span>
      <span className="min-w-0">
        <span className="block text-sm font-bold leading-none tabular-nums">
          {value}
        </span>
        <span className="mt-1 block truncate text-[10px] font-medium text-muted-foreground">
          {label}
        </span>
      </span>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Component                                                                  */
/* -------------------------------------------------------------------------- */

export function StudyStreak() {
  const reduceMotion = useReducedMotion();
  const mounted = useMounted();
  const [, setTick] = useState(0);

  const savedDays = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  );

  const days = useMemo(() => {
    try {
      const parsed = JSON.parse(savedDays);

      if (!Array.isArray(parsed)) {
        return [];
      }

      return parsed.filter(
        (value) =>
          typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value),
      );
    } catch {
      return [];
    }
  }, [savedDays]);

  const daysSet = useMemo(() => new Set(days), [days]);

  /*
   * Date-based values are only calculated after hydration.
   * This keeps the server and client output consistent.
   */
  const today = mounted ? getToday() : "";

  const doneToday = mounted ? daysSet.has(today) : false;

  const streak = mounted ? currentStreak(daysSet) : 0;

  const best = mounted ? bestStreak(days) : 0;

  /* Re-evaluate when the day changes while the page stays open
     (at midnight, or when the tab regains focus). */
  useEffect(() => {
    if (!mounted) return undefined;

    const bump = () => setTick((value) => value + 1);
    const onVisible = () => {
      if (document.visibilityState === "visible") bump();
    };

    const now = new Date();
    const nextMidnight = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate() + 1,
      0,
      0,
      1,
    );
    const timer = window.setTimeout(
      bump,
      nextMidnight.getTime() - now.getTime(),
    );

    window.addEventListener("focus", bump);
    document.addEventListener("visibilitychange", onVisible);

    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("focus", bump);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [mounted, today]);

  /* ---------------------------------------------------------------------- */
  /* Last 7 days                                                            */
  /* ---------------------------------------------------------------------- */

  const week = useMemo(() => {
    if (!mounted) {
      return Array.from({ length: 7 }, (_, index) => ({
        key: `placeholder-${index}`,
        label: "",
        full: "",
        isToday: false,
      }));
    }

    const result = [];

    for (let index = 6; index >= 0; index -= 1) {
      const date = new Date();

      date.setDate(date.getDate() - index);

      result.push({
        key: formatDate(date),
        label: date.toLocaleDateString(undefined, {
          weekday: "narrow",
        }),
        full: date.toLocaleDateString(undefined, {
          weekday: "long",
        }),
        isToday: index === 0,
      });
    }

    return result;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mounted, today]);

  const thisWeek = mounted
    ? week.filter((day) => daysSet.has(day.key)).length
    : 0;

  /* Next milestone, derived from the real streak */
  const nextMilestone = MILESTONES.find((value) => value > streak) ?? null;
  const milestoneProgress = nextMilestone
    ? Math.min(100, (streak / nextMilestone) * 100)
    : 100;

  /* Status badge */
  const status = !mounted
    ? null
    : doneToday
      ? {
          label: "Done today",
          tone: "border-emerald-500/25 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
        }
      : streak > 0
        ? {
            label: "At risk today",
            tone: "border-[#FACC15]/40 bg-[#FACC15]/10 text-amber-700 dark:text-[#FACC15]",
          }
        : {
            label: "Not started",
            tone: "border-border bg-muted/60 text-muted-foreground",
          };

  /* ---------------------------------------------------------------------- */
  /* Toggle today's study status                                            */
  /* ---------------------------------------------------------------------- */

  function toggleToday() {
    if (!mounted) {
      return;
    }

    const current = getToday();

    const nextDays = days.includes(current)
      ? days.filter((day) => day !== current)
      : [...days, current].sort().slice(-120);

    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextDays));
    } catch {
      // Ignore localStorage failures.
    }

    window.dispatchEvent(new Event(CHANGE_EVENT));
  }

  return (
    <motion.section
      aria-label="Study streak"
      initial={
        reduceMotion
          ? false
          : {
              opacity: 0,
              y: 12,
            }
      }
      animate={{
        opacity: 1,
        y: 0,
      }}
      transition={{
        delay: 0.3,
        duration: 0.35,
      }}
      className="rounded-2xl border border-border bg-card p-4"
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2.5">
          <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-[#FACC15] text-[#111318]">
            <Zap aria-hidden="true" className="size-4" />
          </span>
          <div className="min-w-0">
            <p className="text-sm font-bold leading-tight tracking-tight">
              Study streak
            </p>
            {status && (
              <span
                className={cn(
                  "mt-1 inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-bold leading-none",
                  status.tone,
                )}
              >
                {status.label}
              </span>
            )}
          </div>
        </div>

        <p className="flex shrink-0 items-baseline gap-1" aria-live="polite">
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.span
              key={streak}
              initial={
                reduceMotion
                  ? false
                  : {
                      y: 8,
                      opacity: 0,
                      scale: 0.8,
                    }
              }
              animate={{
                y: 0,
                opacity: 1,
                scale: 1,
              }}
              exit={{
                y: -8,
                opacity: 0,
              }}
              transition={{
                type: "spring",
                stiffness: 500,
                damping: 28,
              }}
              className="text-3xl font-extrabold leading-none tabular-nums tracking-tight text-amber-600 dark:text-[#FACC15]"
            >
              {streak}
            </motion.span>
          </AnimatePresence>

          <span className="text-xs font-medium text-muted-foreground">
            {streak === 1 ? "day" : "days"}
            <span className="sr-only"> current streak</span>
          </span>
        </p>
      </div>

      {/* Last 7 days */}
      <ul className="mt-4 flex justify-between" aria-label="Last 7 days">
        {week.map((day, index) => {
          const done = mounted && daysSet.has(day.key);

          return (
            <li key={day.key} className="flex flex-col items-center gap-1.5">
              <motion.span
                initial={
                  reduceMotion
                    ? false
                    : {
                        scale: 0,
                      }
                }
                animate={{
                  scale: 1,
                }}
                transition={{
                  delay: 0.4 + index * 0.05,
                  type: "spring",
                  stiffness: 400,
                  damping: 20,
                }}
                className={cn(
                  "grid size-8 place-items-center rounded-full border transition-colors duration-300",
                  done
                    ? "border-[#FACC15] bg-[#FACC15] text-[#111318]"
                    : "border-border bg-muted/60 text-transparent",
                  day.isToday &&
                    !done &&
                    "border-dashed border-[#8B5CF6] bg-[#8B5CF6]/5",
                  day.isToday &&
                    done &&
                    "ring-2 ring-[#8B5CF6]/50 ring-offset-2 ring-offset-card",
                )}
              >
                <Check aria-hidden="true" className="size-4" strokeWidth={3} />

                {day.full && (
                  <span className="sr-only">
                    {day.full}: {done ? "studied" : "not studied"}
                  </span>
                )}
              </motion.span>

              <span
                aria-hidden="true"
                className={cn(
                  "text-[10px] font-medium text-muted-foreground",
                  day.isToday &&
                    "font-bold text-violet-700 dark:text-violet-300",
                )}
              >
                {day.label || "\u00a0"}
              </span>
            </li>
          );
        })}
      </ul>

      {/* Stats */}
      <div className="mt-4 grid grid-cols-2 gap-2">
        <StatTile
          icon={CalendarDays}
          label="This week"
          value={`${thisWeek}/7`}
          iconClass="text-[#8B5CF6]"
        />
        <StatTile
          icon={Trophy}
          label="Best streak"
          value={`${best} ${best === 1 ? "day" : "days"}`}
          iconClass="text-amber-600 dark:text-[#FACC15]"
        />
      </div>

      {/* Next milestone */}
      <div className="mt-4">
        <div className="flex items-center justify-between gap-2 text-[11px]">
          <span className="font-semibold text-foreground">
            {nextMilestone
              ? `Next milestone: ${nextMilestone} days`
              : "All milestones reached"}
          </span>
          {nextMilestone && (
            <span className="tabular-nums text-muted-foreground">
              {streak}/{nextMilestone}
            </span>
          )}
        </div>
        <div
          role="progressbar"
          aria-label="Progress to next streak milestone"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(milestoneProgress)}
          className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-border"
        >
          <motion.div
            initial={reduceMotion ? false : { width: 0 }}
            animate={{ width: `${milestoneProgress}%` }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="h-full rounded-full bg-[#FACC15]"
          />
        </div>
      </div>

      {/* Message */}
      <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
        {getMessage(streak, doneToday)}
      </p>

      {/* Action */}
      <motion.button
        type="button"
        onClick={toggleToday}
        aria-pressed={doneToday}
        whileTap={
          reduceMotion
            ? undefined
            : {
                scale: 0.97,
              }
        }
        className={cn(
          "mt-3 inline-flex min-h-10 w-full cursor-pointer items-center justify-center gap-2 rounded-xl px-3 py-2 text-xs font-bold transition-colors",
          FOCUS,
          doneToday
            ? "border border-border bg-background text-muted-foreground hover:border-[#8B5CF6]/50 hover:text-foreground"
            : "bg-[#FACC15] text-[#111318] hover:bg-[#EAB308]",
        )}
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.span
            key={doneToday ? "done" : "todo"}
            initial={
              reduceMotion
                ? false
                : {
                    opacity: 0,
                    y: 6,
                  }
            }
            animate={{
              opacity: 1,
              y: 0,
            }}
            exit={{
              opacity: 0,
              y: -6,
            }}
            transition={{
              duration: 0.12,
            }}
            className="inline-flex items-center gap-2"
          >
            {doneToday ? (
              <>
                <Check
                  aria-hidden="true"
                  className="size-4 text-emerald-600 dark:text-emerald-400"
                />
                Done for today (undo)
              </>
            ) : (
              <>
                <Zap aria-hidden="true" className="size-4" />I studied today
              </>
            )}
          </motion.span>
        </AnimatePresence>
      </motion.button>
    </motion.section>
  );
}

export default StudyStreak;
