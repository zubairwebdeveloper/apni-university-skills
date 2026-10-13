"use client";

import { useEffect, useRef, useState } from "react";
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
/* Tilt3D: mouse ke saath 3D tilt + glare                              */
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
/* CountUp                                                             */
/* ------------------------------------------------------------------ */
function CountUp({ value }) {
  const [n, setN] = useState(0);

  useEffect(() => {
    const controls = animate(0, value, {
      duration: 1.1,
      ease: "easeOut",
      onUpdate: (v) => setN(Math.round(v)),
    });
    return () => controls.stop();
  }, [value]);

  return <>{n}</>;
}

/* ------------------------------------------------------------------ */
/* 3D Cube                                                             */
/* ------------------------------------------------------------------ */
function Cube({ size = 96 }) {
  const reduce = useReducedMotion();
  const half = size / 2;

  const faces = [
    "rotateY(0deg)",
    "rotateY(90deg)",
    "rotateY(180deg)",
    "rotateY(-90deg)",
    "rotateX(90deg)",
    "rotateX(-90deg)",
  ];

  return (
    <motion.div
      className="relative"
      style={{ width: size, height: size, transformStyle: "preserve-3d" }}
      animate={reduce ? undefined : { rotateX: [0, 360], rotateY: [0, 360] }}
      transition={{ duration: 24, repeat: Infinity, ease: "linear" }}
    >
      {faces.map((face) => (
        <span
          key={face}
          className="absolute inset-0 rounded-2xl border border-[#ef07a2]/50 bg-gradient-to-br from-[#ef07a2]/30 via-[#ef07a2]/10 to-transparent"
          style={{ transform: `${face} translateZ(${half}px)` }}
        />
      ))}
    </motion.div>
  );
}

function Ring({ size, duration, reverse = false, dashed = false }) {
  const reduce = useReducedMotion();

  return (
    <motion.span
      aria-hidden="true"
      className={`absolute left-1/2 top-1/2 rounded-full border ${
        dashed ? "border-dashed border-[#ef07a2]/40" : "border-[#ef07a2]/25"
      }`}
      style={{
        width: size,
        height: size,
        marginLeft: -size / 2,
        marginTop: -size / 2,
        rotateX: 72,
      }}
      animate={reduce ? undefined : { rotateZ: reverse ? [360, 0] : [0, 360] }}
      transition={{ duration, repeat: Infinity, ease: "linear" }}
    />
  );
}

function FloatChip({ icon: Icon, className, delay = 0 }) {
  const reduce = useReducedMotion();

  return (
    <motion.span
      aria-hidden="true"
      className={`absolute grid size-10 place-items-center rounded-xl border border-border bg-card/90 text-[#ef07a2] shadow-lg backdrop-blur ${className}`}
      animate={reduce ? undefined : { y: [0, -10, 0] }}
      transition={{ duration: 4, delay, repeat: Infinity, ease: "easeInOut" }}
      style={{ transform: "translateZ(60px)" }}
    >
      <Icon className="size-[18px]" />
    </motion.span>
  );
}

/* ------------------------------------------------------------------ */
/* Hero                                                                */
/* ------------------------------------------------------------------ */
export function HeroScene3D({ first, total, active, completed }) {
  const percent = total ? Math.round((completed / total) * 100) : 0;

  return (
    <section className="relative overflow-hidden rounded-3xl border border-border bg-card">
      {/* background glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-24 -top-24 size-72 rounded-full bg-[#ef07a2]/15 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-32 right-0 size-80 rounded-full bg-[#ef07a2]/10 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            "linear-gradient(currentColor 1px, transparent 1px), linear-gradient(90deg, currentColor 1px, transparent 1px)",
          backgroundSize: "36px 36px",
        }}
      />

      <div className="relative grid items-center gap-8 p-6 sm:p-8 lg:grid-cols-[1.2fr_1fr] lg:p-10">
        <div className="min-w-0">
          <p className="mb-3 inline-flex items-center gap-2 rounded-full border border-[#ef07a2]/25 bg-[#ef07a2]/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-[#ef07a2]">
            <FiZap className="size-3" />
            Student dashboard
          </p>

          <h1 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
            Welcome back, <span className="text-[#ef07a2]">{first}</span>
          </h1>

          <p className="mt-3 max-w-lg text-sm leading-6 text-muted-foreground sm:text-base">
            {active > 0
              ? `Aap ke ${active} course${active > 1 ? "s" : ""} chal rahe hain. Wahin se continue karein jahan chhora tha.`
              : "Naya course shuru karein aur apni learning journey aage barhayein."}
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 rounded-xl border border-border bg-background/60 px-3.5 py-2 text-sm backdrop-blur">
              <FiTrendingUp className="size-4 text-[#ef07a2]" />
              <span className="font-bold tabular-nums text-foreground">
                {percent}%
              </span>
              <span className="text-muted-foreground">completion rate</span>
            </div>

            <div className="flex items-center gap-2 rounded-xl border border-border bg-background/60 px-3.5 py-2 text-sm backdrop-blur">
              <FiLayers className="size-4 text-[#ef07a2]" />
              <span className="font-bold tabular-nums text-foreground">
                {total}
              </span>
              <span className="text-muted-foreground">enrolled</span>
            </div>
          </div>
        </div>

        {/* 3D scene */}
        <div className="relative mx-auto hidden h-64 w-full max-w-sm lg:block">
          <Tilt3D className="size-full" max={12} glare={false}>
            <div
              className="relative grid size-full place-items-center"
              style={{ perspective: 900, transformStyle: "preserve-3d" }}
            >
              <Ring size={230} duration={26} dashed />
              <Ring size={170} duration={18} reverse />
              <Cube size={92} />

              <FloatChip icon={FiBookOpen} className="left-2 top-4" />
              <FloatChip
                icon={FiAward}
                className="right-2 top-12"
                delay={0.8}
              />
              <FloatChip
                icon={FiStar}
                className="bottom-4 left-10"
                delay={1.6}
              />
            </div>
          </Tilt3D>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Stats (3D tilt cards + count up)                                    */
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
        <Tilt3D key={s.label} className="rounded-2xl">
          <div className="relative overflow-hidden rounded-2xl border border-border bg-card p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
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
                className="grid size-12 place-items-center rounded-2xl border border-[#ef07a2]/25 bg-[#ef07a2]/10 text-[#ef07a2]"
                style={{ transform: "translateZ(30px)" }}
              >
                <s.icon className="size-5" />
              </span>
            </div>
          </div>
        </Tilt3D>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Completion orb (circular progress)                                  */
/* ------------------------------------------------------------------ */
export function CompletionOrb({ total, completed }) {
  const percent = total ? Math.round((completed / total) * 100) : 0;
  const r = 44;
  const c = 2 * Math.PI * r;

  return (
    <Tilt3D className="rounded-2xl">
      <div className="rounded-2xl border border-border bg-card p-5">
        <div className="flex items-center gap-5">
          <div className="relative size-28 shrink-0">
            <svg viewBox="0 0 100 100" className="size-full -rotate-90">
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
                initial={{ strokeDashoffset: c }}
                animate={{ strokeDashoffset: c - (percent / 100) * c }}
                transition={{ duration: 1.2, ease: "easeOut" }}
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
              <FiFlag className="size-3.5" />
              {percent >= 100 ? "Sab complete!" : "Keep going"}
            </p>
          </div>
        </div>
      </div>
    </Tilt3D>
  );
}

/* ------------------------------------------------------------------ */
/* Achievements (3D flip badges)                                       */
/* ------------------------------------------------------------------ */
export function AchievementShelf({ total, active, completed }) {
  const badges = [
    {
      id: "start",
      title: "First step",
      desc: "Pehla course enroll karein",
      icon: FiBookOpen,
      unlocked: total >= 1,
    },
    {
      id: "roll",
      title: "On a roll",
      desc: "Koi course in progress ho",
      icon: FiZap,
      unlocked: active >= 1,
    },
    {
      id: "finish",
      title: "Finisher",
      desc: "Pehla course complete karein",
      icon: FiCheckCircle,
      unlocked: completed >= 1,
    },
    {
      id: "collect",
      title: "Collector",
      desc: "5 courses enroll karein",
      icon: FiLayers,
      unlocked: total >= 5,
    },
    {
      id: "master",
      title: "Master",
      desc: "5 courses complete karein",
      icon: FiAward,
      unlocked: completed >= 5,
    },
    {
      id: "star",
      title: "Rising star",
      desc: "3 courses complete karein",
      icon: FiStar,
      unlocked: completed >= 3,
    },
  ];

  const unlocked = badges.filter((b) => b.unlocked).length;

  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span className="grid size-9 place-items-center rounded-lg bg-[#ef07a2]/10 text-[#ef07a2]">
            <FiAward className="size-4" />
          </span>
          <div>
            <h3 className="text-sm font-bold text-foreground">Achievements</h3>
            <p className="text-xs text-muted-foreground">
              {unlocked} of {badges.length} unlocked
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {badges.map((b) => (
          <div
            key={b.id}
            className="group h-24 cursor-pointer"
            style={{ perspective: 600 }}
          >
            <div
              className="relative size-full transition-transform duration-500 group-hover:[transform:rotateY(180deg)]"
              style={{ transformStyle: "preserve-3d" }}
            >
              {/* front */}
              <div
                className={`absolute inset-0 flex flex-col items-center justify-center gap-1.5 rounded-xl border text-center ${
                  b.unlocked
                    ? "border-[#ef07a2]/30 bg-[#ef07a2]/10 text-[#ef07a2]"
                    : "border-border bg-muted/50 text-muted-foreground"
                }`}
                style={{ backfaceVisibility: "hidden" }}
              >
                {b.unlocked ? (
                  <b.icon className="size-5" />
                ) : (
                  <FiLock className="size-5" />
                )}
                <span className="px-1 text-[10px] font-bold leading-tight">
                  {b.title}
                </span>
              </div>

              {/* back */}
              <div
                className="absolute inset-0 grid place-items-center rounded-xl border border-border bg-background p-2 text-center"
                style={{
                  backfaceVisibility: "hidden",
                  transform: "rotateY(180deg)",
                }}
              >
                <span className="text-[10px] font-medium leading-snug text-muted-foreground">
                  {b.desc}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
