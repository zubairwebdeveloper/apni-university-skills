"use client";

import {
  MotionConfig,
  animate,
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from "framer-motion";
import { useEffect } from "react";
import {
  FiBarChart2,
  FiEdit3,
  FiMessageSquare,
  FiStar,
  FiTrendingUp,
} from "react-icons/fi";
import { Card } from "@/components/ui/card";
import { Rating } from "@/components/shared/Rating";
import { cn } from "@/lib/utils";

/* Respects the OS "reduce motion" setting for every motion child below */
export function MotionRoot({ children }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}

/* ------------------------------ helpers ------------------------------ */
function AnimatedNumber({ value, decimals = 0 }) {
  const reduce = useReducedMotion();
  const target = Number(value) || 0;
  const mv = useMotionValue(0);
  const text = useTransform(mv, (v) => v.toFixed(decimals));

  useEffect(() => {
    if (reduce) {
      mv.set(target);
      return;
    }
    const controls = animate(mv, target, { duration: 0.9, ease: "easeOut" });
    return () => controls.stop();
  }, [target, mv, reduce]);

  return <motion.span className="tabular-nums">{text}</motion.span>;
}

/* Gentle pointer tilt. Mouse only, off for reduced motion. */
export function TiltCard({ children, className, max = 3 }) {
  const reduce = useReducedMotion();
  const rx = useMotionValue(0);
  const ry = useMotionValue(0);
  const sx = useSpring(rx, { stiffness: 140, damping: 18 });
  const sy = useSpring(ry, { stiffness: 140, damping: 18 });

  const onMove = (e) => {
    if (reduce || e.pointerType !== "mouse") return;
    const r = e.currentTarget.getBoundingClientRect();
    ry.set(((e.clientX - r.left) / r.width - 0.5) * max * 2);
    rx.set(-((e.clientY - r.top) / r.height - 0.5) * max * 2);
  };
  const reset = () => {
    rx.set(0);
    ry.set(0);
  };

  return (
    <div style={{ perspective: 900 }} className={className}>
      <motion.div
        onPointerMove={onMove}
        onPointerLeave={reset}
        style={{ rotateX: sx, rotateY: sy, transformStyle: "preserve-3d" }}
      >
        {children}
      </motion.div>
    </div>
  );
}

/* ----------------------------- backdrop ------------------------------ */
export function ReviewsBackdrop() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
    >
      <div className="absolute -top-40 left-1/2 h-[380px] w-[760px] -translate-x-1/2 rounded-full bg-primary/10 blur-3xl dark:bg-primary/15" />
      <div
        className="absolute inset-0 opacity-[0.35] dark:opacity-[0.22]"
        style={{
          backgroundImage:
            "radial-gradient(hsl(var(--border)) 1px, transparent 1px)",
          backgroundSize: "26px 26px",
          maskImage:
            "radial-gradient(ellipse 70% 50% at 50% 0%, #000 25%, transparent 75%)",
          WebkitMaskImage:
            "radial-gradient(ellipse 70% 50% at 50% 0%, #000 25%, transparent 75%)",
        }}
      />
    </div>
  );
}

/* --------------------------- 3D star scene --------------------------- */
function StarScene() {
  const reduce = useReducedMotion();
  const rx = useMotionValue(0);
  const ry = useMotionValue(0);
  const sx = useSpring(rx, { stiffness: 120, damping: 16 });
  const sy = useSpring(ry, { stiffness: 120, damping: 16 });

  const onMove = (e) => {
    if (reduce || e.pointerType !== "mouse") return;
    const r = e.currentTarget.getBoundingClientRect();
    ry.set(((e.clientX - r.left) / r.width - 0.5) * 30);
    rx.set(-((e.clientY - r.top) / r.height - 0.5) * 30);
  };
  const reset = () => {
    rx.set(0);
    ry.set(0);
  };

  const orbiters = [
    { r: 82, dur: 14, delay: 0, size: "size-4" },
    { r: 82, dur: 14, delay: -7, size: "size-3" },
    { r: 58, dur: 9, delay: -3, size: "size-3" },
  ];

  return (
    <div
      aria-hidden="true"
      onPointerMove={onMove}
      onPointerLeave={reset}
      className="relative mx-auto size-48 sm:size-56"
      style={{ perspective: 800 }}
    >
      <motion.div
        className="absolute inset-0"
        style={{ rotateX: sx, rotateY: sy, transformStyle: "preserve-3d" }}
      >
        <div
          className="absolute inset-4 rounded-full bg-amber-400/25 blur-2xl"
          style={{ transform: "translateZ(-50px)" }}
        />
        <div
          className="absolute inset-3 rounded-full border border-border bg-card shadow-lg"
          style={{ transform: "translateZ(0)" }}
        />

        {/* orbit rings */}
        {[0.92, 0.66].map((s, i) => (
          <motion.div
            key={s}
            className="absolute left-1/2 top-1/2 aspect-square -translate-x-1/2 -translate-y-1/2 rounded-full border border-primary/30"
            style={{
              width: `${s * 100}%`,
              rotateX: 66,
              translateZ: 10 + i * 10,
            }}
            animate={reduce ? undefined : { rotate: i % 2 ? -360 : 360 }}
            transition={{
              duration: 22 - i * 8,
              repeat: Infinity,
              ease: "linear",
            }}
          />
        ))}

        {/* hero star on its own depth layer */}
        <motion.div
          className="absolute inset-0 grid place-items-center"
          style={{ transform: "translateZ(46px)" }}
          animate={reduce ? undefined : { y: [0, -6, 0] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        >
          <FiStar className="size-16 fill-amber-400 text-amber-500 drop-shadow-[0_0_18px_rgba(245,184,46,0.55)] sm:size-20" />
        </motion.div>

        {/* small orbiting stars */}
        {orbiters.map((o, i) => (
          <motion.div
            key={i}
            className="absolute left-1/2 top-1/2 size-0"
            style={{ transform: "translateZ(30px)" }}
            animate={reduce ? undefined : { rotate: 360 }}
            transition={{
              duration: o.dur,
              repeat: Infinity,
              ease: "linear",
              delay: o.delay,
            }}
          >
            <FiStar
              className={cn(
                "absolute -translate-x-1/2 -translate-y-1/2 fill-primary/70 text-primary",
                o.size,
              )}
              style={{ left: o.r }}
            />
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}

/* ------------------------------- hero -------------------------------- */
export function ReviewsHero({
  reviewCount = 0,
  toReviewCount = 0,
  action = null,
}) {
  const title =
    toReviewCount > 0
      ? `${toReviewCount} course${toReviewCount === 1 ? "" : "s"} waiting for your feedback`
      : reviewCount > 0
        ? "Thanks for sharing your feedback"
        : "Your voice helps other learners";

  return (
    <motion.section
      aria-labelledby="reviews-hero-title"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      className="relative overflow-hidden rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-8 lg:p-10"
    >
      {/* hairline accent along the top edge */}
      <div
        aria-hidden="true"
        className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/60 to-transparent"
      />

      <div className="grid items-center gap-8 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] lg:gap-12">
        <div className="min-w-0">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-muted/50 px-3 py-1 text-xs font-medium text-muted-foreground">
            <FiMessageSquare
              className="size-3.5 text-primary"
              aria-hidden="true"
            />
            Course feedback
          </span>
          <h2
            id="reviews-hero-title"
            className="mt-4 font-serif text-3xl font-semibold leading-tight tracking-tight text-foreground sm:text-4xl"
          >
            {title}
          </h2>
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground sm:text-base">
            Honest reviews help other students choose what to learn and help us
            improve every course.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-3">
            {action}
            {toReviewCount > 0 && (
              <a
                href="#courses-to-review"
                className="inline-flex min-h-10 items-center rounded-md text-sm font-medium text-primary underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              >
                See all courses
              </a>
            )}
            {reviewCount > 0 && (
              <a
                href="#my-reviews-list"
                className="inline-flex min-h-10 items-center rounded-md text-sm font-medium text-muted-foreground underline-offset-4 hover:text-foreground hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              >
                Your reviews
              </a>
            )}
          </div>
        </div>

        <div className="hidden rounded-2xl border border-border bg-muted/40 px-4 py-10 sm:block">
          <StarScene />
        </div>
      </div>
    </motion.section>
  );
}

/* ---------------------------- stat cards ----------------------------- */
export function StatCards({ total, average, waiting, completion }) {
  const reduce = useReducedMotion();
  const pct = Math.max(0, Math.min(100, Number(completion) || 0));

  const cards = [
    {
      label: "Your reviews",
      icon: FiMessageSquare,
      tone: "bg-primary/10 text-primary",
      value: <AnimatedNumber value={total} />,
      sub: total === 1 ? "course reviewed" : "courses reviewed",
    },
    {
      label: "Average rating",
      icon: FiStar,
      tone: "bg-amber-500/15 text-amber-700 dark:text-amber-300",
      value: average ? <AnimatedNumber value={average} decimals={1} /> : "—",
      sub: "out of 5",
    },
    {
      label: "Waiting for review",
      icon: FiEdit3,
      tone: "bg-primary/10 text-primary",
      value: <AnimatedNumber value={waiting} />,
      sub: waiting ? "ready for your feedback" : "all caught up",
    },
    {
      label: "Review progress",
      icon: FiTrendingUp,
      tone: "bg-primary/10 text-primary",
      value: (
        <>
          <AnimatedNumber value={pct} />%
        </>
      ),
      sub: "of enrolled courses reviewed",
      bar: pct,
    },
  ];

  return (
    <section
      aria-labelledby="review-overview"
      className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
    >
      <h2 id="review-overview" className="sr-only">
        Review overview
      </h2>
      {cards.map((c, i) => (
        <motion.div
          key={c.label}
          initial={reduce ? false : { opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: reduce ? 0 : 0.4,
            delay: reduce ? 0 : i * 0.06,
            ease: [0.22, 1, 0.36, 1],
          }}
        >
          <TiltCard>
            <Card className="group relative overflow-hidden rounded-2xl border-border p-5 shadow-sm transition-[box-shadow,border-color] duration-300 hover:border-primary/40 hover:shadow-md motion-reduce:transition-none">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    {c.label}
                  </p>
                  <p className="mt-3 text-3xl font-bold tracking-tight tabular-nums">
                    {c.value}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">{c.sub}</p>
                </div>
                <span
                  className={cn(
                    "grid size-10 shrink-0 place-items-center rounded-xl transition-transform duration-300 group-hover:scale-105 motion-reduce:transition-none motion-reduce:group-hover:scale-100",
                    c.tone,
                  )}
                >
                  <c.icon aria-hidden="true" className="size-5" />
                </span>
              </div>
              {c.bar !== undefined && (
                <div
                  role="progressbar"
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-valuenow={c.bar}
                  aria-label="Review progress"
                  className="mt-4 h-1.5 overflow-hidden rounded-full bg-muted"
                >
                  <motion.div
                    className="h-full rounded-full bg-primary"
                    initial={{ width: reduce ? `${c.bar}%` : 0 }}
                    animate={{ width: `${c.bar}%` }}
                    transition={{ duration: reduce ? 0 : 0.9, ease: "easeOut" }}
                  />
                </div>
              )}
            </Card>
          </TiltCard>
        </motion.div>
      ))}
    </section>
  );
}

/* ------------------------- rating distribution ----------------------- */
export function RatingSummary({ average, total, distribution = {} }) {
  const reduce = useReducedMotion();

  return (
    <section aria-labelledby="rating-summary">
      <Card className="overflow-hidden rounded-2xl border-border shadow-sm">
        <div className="border-b border-border p-5 sm:px-6">
          <div className="flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-xl bg-amber-500/15 text-amber-700 dark:text-amber-300">
              <FiBarChart2 aria-hidden="true" className="size-5" />
            </span>
            <div>
              <h2
                id="rating-summary"
                className="text-base font-semibold leading-none tracking-tight"
              >
                Your rating summary
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                A quick look at the ratings you&apos;ve given.
              </p>
            </div>
          </div>
        </div>

        <div className="grid gap-6 p-5 sm:p-6 md:grid-cols-[200px_minmax(0,1fr)] md:items-center">
          <div className="flex flex-col items-center justify-center rounded-2xl border border-border bg-muted/40 p-5 text-center">
            <span className="text-5xl font-bold tracking-tight tabular-nums">
              <AnimatedNumber value={average} decimals={1} />
            </span>
            <div className="mt-2">
              <Rating value={average} count={1} showCount={false} />
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              Based on {total} {total === 1 ? "review" : "reviews"}
            </p>
          </div>

          <motion.ul
            aria-label="Rating distribution"
            className="space-y-3"
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-40px" }}
            variants={{
              hidden: {},
              show: { transition: { staggerChildren: reduce ? 0 : 0.08 } },
            }}
          >
            {[5, 4, 3, 2, 1].map((rating) => {
              const count = distribution[rating] ?? 0;
              const percentage =
                total > 0 ? Math.round((count / total) * 100) : 0;
              return (
                <li key={rating} className="flex items-center gap-3">
                  <span className="flex w-9 shrink-0 items-center gap-1 text-sm font-medium tabular-nums">
                    {rating}
                    <FiStar
                      aria-hidden="true"
                      className="size-3.5 fill-amber-400 text-amber-500"
                    />
                    <span className="sr-only">
                      {rating === 1 ? "star" : "stars"}
                    </span>
                  </span>
                  <div
                    aria-hidden="true"
                    className="h-2.5 flex-1 overflow-hidden rounded-full bg-muted"
                  >
                    <motion.div
                      className="h-full rounded-full bg-amber-400"
                      variants={{
                        hidden: { width: reduce ? `${percentage}%` : 0 },
                        show: {
                          width: `${percentage}%`,
                          transition: {
                            duration: reduce ? 0 : 0.8,
                            ease: "easeOut",
                          },
                        },
                      }}
                    />
                  </div>
                  <span className="w-16 shrink-0 text-right text-sm text-muted-foreground tabular-nums">
                    {count}
                    <span className="ml-1 text-xs">({percentage}%)</span>
                  </span>
                </li>
              );
            })}
          </motion.ul>
        </div>
      </Card>
    </section>
  );
}
