"use client";

import { useEffect } from "react";
import {
  animate,
  motion,
  useMotionTemplate,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from "framer-motion";
import {
  FiAward,
  FiBookOpen,
  FiCheckCircle,
  FiFlag,
  FiLayers,
  FiLock,
  FiStar,
  FiTarget,
  FiTrendingUp,
  FiZap,
} from "react-icons/fi";

const BRAND = "#ef07a2";

/* ------------------------------------------------------------------ */
/* Tilt3D: pointer-driven 3D tilt + glare.                             */
/* Exported API is unchanged. It is no longer used inside this file,   */
/* so remove it if nothing else imports it.                            */
/* ------------------------------------------------------------------ */
export function Tilt3D({ children, className = "", max = 9, glare = true }) {
  const reduce = useReducedMotion();

  const x = useMotionValue(0.5);
  const y = useMotionValue(0.5);

  const sx = useSpring(x, { stiffness: 220, damping: 22 });
  const sy = useSpring(y, { stiffness: 220, damping: 22 });

  const rotateX = useTransform(sy, [0, 1], [max, -max]);
  const rotateY = useTransform(sx, [0, 1], [-max, max]);

  const gx = useTransform(sx, (v) => `${v * 100}%`);
  const gy = useTransform(sy, (v) => `${v * 100}%`);
  const glareBg = useMotionTemplate`radial-gradient(260px circle at ${gx} ${gy}, rgba(239,7,162,0.16), transparent 70%)`;

  const onMove = (e) => {
    if (reduce || e.pointerType !== "mouse") return;
    const rect = e.currentTarget.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    x.set((e.clientX - rect.left) / rect.width);
    y.set((e.clientY - rect.top) / rect.height);
  };

  const onLeave = () => {
    x.set(0.5);
    y.set(0.5);
  };

  return (
    <motion.div
      onPointerMove={onMove}
      onPointerLeave={onLeave}
      style={
        reduce
          ? undefined
          : {
              rotateX,
              rotateY,
              transformPerspective: 900,
              transformStyle: "preserve-3d",
            }
      }
      className={`relative will-change-transform ${className}`}
    >
      {children}
      {glare && !reduce && (
        <motion.span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 rounded-[inherit]"
          style={{ background: glareBg }}
        />
      )}
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/* CountUp: animates once, without re-rendering React every frame      */
/* ------------------------------------------------------------------ */
function CountUp({ value }) {
  const reduce = useReducedMotion();
  const mv = useMotionValue(reduce ? value : 0);
  const rounded = useTransform(mv, (v) => Math.round(v));

  useEffect(() => {
    if (reduce) {
      mv.set(value);
      return;
    }
    const controls = animate(mv, value, { duration: 1.1, ease: "easeOut" });
    return () => controls.stop();
  }, [value, mv, reduce]);

  return <motion.span>{rounded}</motion.span>;
}

/* ------------------------------------------------------------------ */
/* Hero                                                                */
/* ------------------------------------------------------------------ */
export function HeroScene3D({ first, total, active, completed }) {
  const percent = total ? Math.round((completed / total) * 100) : 0;

  return (
    <section className="rounded-3xl border border-border bg-card p-6 sm:p-8 lg:p-10">
      <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#ef07a2]/25 bg-[#ef07a2]/10 px-3 py-1 text-xs font-semibold text-[#ef07a2]">
        <FiZap className="size-3.5" aria-hidden="true" />
        Student dashboard
      </p>

      <h1 className="text-balance text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
        Welcome back, <span className="text-[#ef07a2]">{first}</span>
      </h1>

      <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground sm:text-base">
        {active > 0
          ? `You have ${active} course${active > 1 ? "s" : ""} in progress. Pick up right where you left off.`
          : "Start a new course and keep your learning journey moving."}
      </p>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 rounded-xl border border-border bg-background px-3.5 py-2 text-sm">
          <FiTrendingUp className="size-4 text-[#ef07a2]" aria-hidden="true" />
          <span className="font-bold tabular-nums text-foreground">
            {percent}%
          </span>
          <span className="text-muted-foreground">completion rate</span>
        </div>

        <div className="flex items-center gap-2 rounded-xl border border-border bg-background px-3.5 py-2 text-sm">
          <FiLayers className="size-4 text-[#ef07a2]" aria-hidden="true" />
          <span className="font-bold tabular-nums text-foreground">
            {total}
          </span>
          <span className="text-muted-foreground">enrolled</span>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Stats                                                               */
/* ------------------------------------------------------------------ */
export function Stats3D({ total, active, completed }) {
  const stats = [
    {
      label: "Total courses",
      value: total,
      icon: FiLayers,
      hint: "All enrollments",
    },
    {
      label: "In progress",
      value: active,
      icon: FiTarget,
      hint: "Currently learning",
      accent: true,
    },
    {
      label: "Completed",
      value: completed,
      icon: FiCheckCircle,
      hint: "Finished courses",
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-3">
      {stats.map((s) => (
        <div
          key={s.label}
          className="rounded-2xl border border-border bg-card p-5 transition-colors hover:border-[#ef07a2]/40 motion-reduce:transition-none"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-sm font-medium text-muted-foreground">
                {s.label}
              </p>
              <p
                className={`mt-2 text-4xl font-extrabold tabular-nums ${
                  s.accent ? "text-[#ef07a2]" : "text-foreground"
                }`}
              >
                <CountUp value={s.value} />
              </p>
              <p className="mt-1 text-xs text-muted-foreground">{s.hint}</p>
            </div>

            <span
              className="grid size-12 shrink-0 place-items-center rounded-2xl border border-[#ef07a2]/25 bg-[#ef07a2]/10 text-[#ef07a2]"
              aria-hidden="true"
            >
              <s.icon className="size-5" />
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Completion orb (circular progress)                                  */
/* ------------------------------------------------------------------ */
export function CompletionOrb({ total, completed }) {
  const reduce = useReducedMotion();
  const percent = total ? Math.round((completed / total) * 100) : 0;
  const r = 44;
  const c = 2 * Math.PI * r;
  const offset = c - (percent / 100) * c;

  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <div className="flex items-center gap-5">
        <div
          className="relative size-28 shrink-0"
          role="progressbar"
          aria-label="Overall progress"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={percent}
        >
          <svg
            viewBox="0 0 100 100"
            className="size-full -rotate-90"
            aria-hidden="true"
          >
            <circle
              cx="50"
              cy="50"
              r={r}
              fill="none"
              strokeWidth="8"
              className="stroke-muted"
            />
            <motion.circle
              cx="50"
              cy="50"
              r={r}
              fill="none"
              stroke={BRAND}
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={c}
              initial={{ strokeDashoffset: reduce ? offset : c }}
              animate={{ strokeDashoffset: offset }}
              transition={{ duration: reduce ? 0 : 1.2, ease: "easeOut" }}
            />
          </svg>

          <div className="absolute inset-0 grid place-items-center">
            <span className="text-2xl font-extrabold tabular-nums text-foreground">
              {percent}%
            </span>
          </div>
        </div>

        <div className="min-w-0">
          <h3 className="text-sm font-bold text-foreground">
            Overall progress
          </h3>
          <p className="mt-1 text-xs leading-5 text-muted-foreground">
            {completed} of {total} course{total === 1 ? "" : "s"} complete
          </p>
          <p className="mt-2 inline-flex items-center gap-1.5 text-xs font-bold text-[#ef07a2]">
            <FiFlag className="size-3.5" aria-hidden="true" />
            {percent >= 100 ? "All complete!" : "Keep going"}
          </p>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Achievements                                                        */
/* ------------------------------------------------------------------ */
export function AchievementShelf({ total, active, completed }) {
  const badges = [
    {
      id: "start",
      title: "First step",
      desc: "Enroll in your first course",
      icon: FiBookOpen,
      unlocked: total >= 1,
    },
    {
      id: "roll",
      title: "On a roll",
      desc: "Have a course in progress",
      icon: FiZap,
      unlocked: active >= 1,
    },
    {
      id: "finish",
      title: "Finisher",
      desc: "Complete your first course",
      icon: FiCheckCircle,
      unlocked: completed >= 1,
    },
    {
      id: "collect",
      title: "Collector",
      desc: "Enroll in 5 courses",
      icon: FiLayers,
      unlocked: total >= 5,
    },
    {
      id: "master",
      title: "Master",
      desc: "Complete 5 courses",
      icon: FiAward,
      unlocked: completed >= 5,
    },
    {
      id: "star",
      title: "Rising star",
      desc: "Complete 3 courses",
      icon: FiStar,
      unlocked: completed >= 3,
    },
  ];

  const unlocked = badges.filter((b) => b.unlocked).length;

  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <div className="mb-4 flex items-center gap-2.5">
        <span
          className="grid size-9 place-items-center rounded-lg bg-[#ef07a2]/10 text-[#ef07a2]"
          aria-hidden="true"
        >
          <FiAward className="size-4" />
        </span>
        <div>
          <h3 className="text-sm font-bold text-foreground">Achievements</h3>
          <p className="text-xs text-muted-foreground">
            {unlocked} of {badges.length} unlocked
          </p>
        </div>
      </div>

      <ul className="grid gap-3 min-[420px]:grid-cols-2 xl:grid-cols-3">
        {badges.map((b) => (
          <li
            key={b.id}
            className={`flex flex-col gap-2 rounded-xl border p-3.5 ${
              b.unlocked
                ? "border-[#ef07a2]/30 bg-[#ef07a2]/5"
                : "border-border bg-muted/40"
            }`}
          >
            <span
              className={`grid size-8 place-items-center rounded-lg ${
                b.unlocked
                  ? "bg-[#ef07a2]/10 text-[#ef07a2]"
                  : "bg-muted text-muted-foreground"
              }`}
              aria-hidden="true"
            >
              {b.unlocked ? (
                <b.icon className="size-4" />
              ) : (
                <FiLock className="size-4" />
              )}
            </span>
            <div>
              <p
                className={`text-sm font-semibold leading-tight ${
                  b.unlocked ? "text-foreground" : "text-muted-foreground"
                }`}
              >
                {b.title}
                <span className="sr-only">
                  {b.unlocked ? " (unlocked)" : " (locked)"}
                </span>
              </p>
              <p className="mt-0.5 text-xs leading-snug text-muted-foreground">
                {b.desc}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
