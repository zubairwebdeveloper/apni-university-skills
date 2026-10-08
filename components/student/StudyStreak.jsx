"use client";

import { useMemo, useSyncExternalStore } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { FiCheck, FiZap } from "react-icons/fi";

import { cn } from "@/lib/utils";

const ACCENT = "#ef07a2";
const ACCENT_2 = "#7c3aed";

const STORAGE_KEY = "student-study-days";
const CHANGE_EVENT = "student-study-days-change";
const DAY_MS = 86_400_000;

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
/* Component                                                                  */
/* -------------------------------------------------------------------------- */

export function StudyStreak() {
  const reduceMotion = useReducedMotion();
  const mounted = useMounted();

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
  }, [mounted]);

  /* ---------------------------------------------------------------------- */
  /* Toggle today's study status                                            */
  /* ---------------------------------------------------------------------- */

  function toggleToday() {
    if (!mounted || !today) {
      return;
    }

    const nextDays = days.includes(today)
      ? days.filter((day) => day !== today)
      : [...days, today].sort().slice(-120);

    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextDays));
    } catch {
      // Ignore localStorage failures.
    }

    window.dispatchEvent(new Event(CHANGE_EVENT));
  }

  return (
    <motion.div
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
      className="rounded-2xl border bg-card p-4"
    >
      {/* Header */}
      <div className="flex items-center justify-between gap-2">
        <p className="flex items-center gap-2 text-sm font-semibold">
          <span
            className="grid size-7 place-items-center rounded-lg text-white"
            style={{
              background: `linear-gradient(135deg, ${ACCENT}, ${ACCENT_2})`,
            }}
          >
            <FiZap aria-hidden="true" className="size-3.5" />
          </span>
          Study streak
        </p>

        <p className="flex items-baseline gap-1" aria-live="polite">
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
              className="text-xl font-bold tabular-nums"
              style={{
                color: ACCENT,
              }}
            >
              {streak}
            </motion.span>
          </AnimatePresence>

          <span className="text-xs text-muted-foreground">
            {streak === 1 ? "day" : "days"}
          </span>
        </p>
      </div>

      {/* Last 7 days */}
      <ul className="mt-3 flex justify-between" aria-label="Last 7 days">
        {week.map((day, index) => {
          const done = mounted && daysSet.has(day.key);

          return (
            <li key={day.key} className="flex flex-col items-center gap-1">
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
                  "grid size-7 place-items-center rounded-full border text-white transition-colors duration-300",
                  !done && "bg-muted/60 text-transparent",
                  day.isToday && !done && "border-dashed",
                )}
                style={
                  done
                    ? {
                        background: `linear-gradient(135deg, ${ACCENT}, ${ACCENT_2})`,
                        borderColor: "transparent",
                      }
                    : day.isToday
                      ? {
                          borderColor: ACCENT,
                        }
                      : undefined
                }
              >
                <FiCheck aria-hidden="true" className="size-3.5" />

                {day.full && (
                  <span className="sr-only">
                    {day.full}: {done ? "studied" : "not studied"}
                  </span>
                )}
              </motion.span>

              <span
                aria-hidden="true"
                className={cn(
                  "text-[10px] text-muted-foreground",
                  day.isToday && "font-semibold text-foreground",
                )}
              >
                {day.label || "\u00a0"}
              </span>
            </li>
          );
        })}
      </ul>

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
                scale: 0.96,
              }
        }
        className={cn(
          "mt-3 inline-flex w-full items-center justify-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold transition-all",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          doneToday
            ? "border bg-background text-muted-foreground hover:text-foreground"
            : "text-white shadow-sm hover:brightness-110",
        )}
        style={
          doneToday
            ? undefined
            : {
                background: `linear-gradient(90deg, ${ACCENT}, ${ACCENT_2})`,
              }
        }
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
                <FiCheck
                  aria-hidden="true"
                  className="size-4 text-emerald-600"
                />
                Done for today (undo)
              </>
            ) : (
              "I studied today"
            )}
          </motion.span>
        </AnimatePresence>
      </motion.button>

      {/* Best streak */}
      {best > 0 && (
        <p className="mt-2 text-center text-[11px] text-muted-foreground">
          Best streak: {best} {best === 1 ? "day" : "days"}
        </p>
      )}
    </motion.div>
  );
}
