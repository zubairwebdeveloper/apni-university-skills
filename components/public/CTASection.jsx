// components/public/CTASection.jsx  (put it where your current CTASection lives)
"use client";

import { useEffect, useId, useRef, useState } from "react";
import Link from "next/link";
import {
  AnimatePresence,
  animate,
  motion,
  useAnimationFrame,
  useInView,
  useMotionTemplate,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from "framer-motion";
import {
  FiArrowRight,
  FiAward,
  FiBookOpen,
  FiCheck,
  FiGrid,
  FiHeart,
  FiLayers,
  FiPause,
  FiPlay,
  FiPlayCircle,
  FiTool,
  FiTrendingUp,
  FiUserPlus,
  FiZap,
} from "react-icons/fi";

import { Container } from "@/components/ui/container";
import { Reveal } from "@/components/motion/Reveal";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { cn } from "@/lib/utils";

const EASE = [0.22, 1, 0.36, 1];

const FOCUS =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgb(var(--cta-a))] focus-visible:ring-offset-2 focus-visible:ring-offset-background";

/* ------------------------------------------------------------------ */
/* Content (edit to match your platform)                               */
/* ------------------------------------------------------------------ */

// Role to dashboard route. Anything unknown falls back to /student.
const DASHBOARD_BY_ROLE = {
  student: "/student",
  instructor: "/instructor",
  admin: "/admin",
};

const getDashboardHref = (user) => DASHBOARD_BY_ROLE[user?.role] ?? "/student";
const getFirstName = (user) =>
  (user?.name ?? "").trim().split(/\s+/)[0] || "learner";

// Make sure each of these is true for your platform before shipping.
const guestHighlights = [
  { icon: FiCheck, text: "No credit card required" },
  { icon: FiZap, text: "Start learning in minutes" },
  { icon: FiTrendingUp, text: "Learn at your own pace" },
  { icon: FiHeart, text: "Backed by a free support community" },
];

const memberHighlights = [
  { icon: FiPlayCircle, text: "Continue from your dashboard" },
  { icon: FiCheck, text: "Your progress is saved" },
  { icon: FiTrendingUp, text: "Learn at your own pace" },
  { icon: FiHeart, text: "Backed by a free support community" },
];

const guestSteps = [
  {
    icon: FiUserPlus,
    title: "Create your account",
    text: "It takes less than a minute, and it's free.",
    detail:
      "Sign up with your email, confirm it, and your learner dashboard is ready.",
  },
  {
    icon: FiBookOpen,
    title: "Pick a course",
    text: "Start with a free one and move at your own speed.",
    detail:
      "Browse by technology, open any free course, and pick up where you left off whenever you like.",
  },
  {
    icon: FiTool,
    title: "Build real projects",
    text: "Finish with work you can show to employers.",
    detail:
      "Apply each lesson in a hands-on project, so your portfolio grows while you learn.",
  },
];

const memberSteps = [
  {
    icon: FiGrid,
    title: "Open your dashboard",
    text: "Everything you've started is in one place.",
    detail:
      "See your courses, your progress and what to do next, without searching for it.",
  },
  {
    icon: FiBookOpen,
    title: "Continue learning",
    text: "Pick up exactly where you stopped.",
    detail:
      "Jump back into your last lesson, or start another course whenever you're ready.",
  },
  {
    icon: FiAward,
    title: "Show your skills",
    text: "Finish projects and earn certificates.",
    detail:
      "Complete hands-on projects and build a portfolio you can share with employers.",
  },
];

// Learning paths shown as quick links under the buttons.
const PATH_LINKS = [
  { id: "web", label: "Full-Stack Web" },
  { id: "ai", label: "AI & Automation" },
  { id: "cloud", label: "Cloud" },
  { id: "security", label: "Cybersecurity" },
  { id: "devops", label: "DevOps" },
  { id: "data", label: "Data Science" },
];

// Technology topics shown in the scrolling strip (edit freely).
const DEFAULT_TOPICS = [
  "Artificial Intelligence",
  "Web Development",
  "Cloud Computing",
  "Automation",
  "Python",
  "React & Next.js",
  "Firebase",
  "Docker",
  "Machine Learning",
  "UI/UX Design",
  "TypeScript",
  "Git & GitHub",
];

const STEP_MS = 4500;

/* ------------------------------------------------------------------ */
/* Small pieces                                                        */
/* ------------------------------------------------------------------ */

// A divided sub-section inside the card, with an optional small label.
function Block({ label, children }) {
  return (
    <div className="relative mx-auto mt-12 max-w-3xl border-t pt-8">
      {label && (
        <p className="mb-5 text-xs font-medium uppercase tracking-wider text-muted-foreground">
          {label}
        </p>
      )}
      {children}
    </div>
  );
}

// Number that counts up once it scrolls into view
function CountUp({ to, suffix = "", decimals = 0 }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  const reduce = useReducedMotion();

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const fmt = (v) =>
      v.toLocaleString("en-US", {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      }) + suffix;

    // Reduced motion: show the final number straight away, in view or not.
    if (reduce) {
      node.textContent = fmt(to);
      return;
    }
    if (!inView) return;

    const controls = animate(0, to, {
      duration: 1.8,
      ease: "easeOut",
      onUpdate: (v) => {
        if (ref.current) ref.current.textContent = fmt(v);
      },
    });
    return () => controls.stop();
  }, [inView, reduce, to, suffix, decimals]);

  return <span ref={ref}>{`0${suffix}`}</span>;
}

// Five stars; the last one can be partly filled (e.g. 4.8). Decorative only.
function Stars({ value = 5 }) {
  const reduce = useReducedMotion();
  const path =
    "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z";

  return (
    <span
      className="flex items-center gap-0.5 text-[rgb(var(--cta-a))]"
      aria-hidden="true"
    >
      {Array.from({ length: 5 }).map((_, i) => {
        const fill = Math.max(0, Math.min(1, value - i)) * 100;
        return (
          <motion.span
            key={i}
            className="relative inline-flex"
            initial={reduce ? false : { scale: 0.4, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.3, delay: 0.2 + i * 0.07 }}
          >
            <svg
              viewBox="0 0 24 24"
              className="size-3.5 opacity-30"
              fill="currentColor"
            >
              <path d={path} />
            </svg>
            <svg
              viewBox="0 0 24 24"
              className="absolute inset-0 size-3.5"
              fill="currentColor"
              style={{ clipPath: `inset(0 ${100 - fill}% 0 0)` }}
            >
              <path d={path} />
            </svg>
          </motion.span>
        );
      })}
    </span>
  );
}

// Wraps a button so it leans slightly towards a mouse cursor (never touch or pen)
function Magnetic({ children, className }) {
  const reduce = useReducedMotion();
  const ref = useRef(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 220, damping: 16, mass: 0.4 });
  const sy = useSpring(y, { stiffness: 220, damping: 16, mass: 0.4 });

  return (
    <motion.div
      ref={ref}
      style={{ x: sx, y: sy }}
      className={className}
      onPointerMove={(e) => {
        if (reduce || e.pointerType !== "mouse" || !ref.current) return;
        const r = ref.current.getBoundingClientRect();
        x.set((e.clientX - (r.left + r.width / 2)) * 0.18);
        y.set((e.clientY - (r.top + r.height / 2)) * 0.25);
      }}
      onPointerLeave={() => {
        x.set(0);
        y.set(0);
      }}
    >
      {children}
    </motion.div>
  );
}

// Headline whose words fade in one after another.
// `key` on the caller forces a replay when the text changes (guest -> member).
function AnimatedTitle({ id, text }) {
  const reduce = useReducedMotion();
  const words = String(text).split(" ");

  return (
    <h2
      id={id}
      className="relative mx-auto max-w-2xl text-balance text-[clamp(2rem,4vw,3.25rem)] font-semibold leading-[1.1] tracking-tight"
    >
      {words.map((w, i) => (
        <motion.span
          key={`${w}-${i}`}
          className="mr-[0.25em] inline-block"
          initial={reduce ? false : { opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{
            duration: 0.5,
            delay: 0.08 + i * 0.06,
            ease: EASE,
          }}
        >
          {w}
        </motion.span>
      ))}
    </h2>
  );
}

function TopicChip({ children }) {
  return (
    <li className="shrink-0 pr-2">
      <span className="block whitespace-nowrap rounded-full border bg-background px-3.5 py-1.5 text-xs text-muted-foreground transition-colors hover:border-[rgb(var(--cta-a)/0.5)] hover:text-foreground">
        {children}
      </span>
    </li>
  );
}

// Scrolling strip of technology topics. It pauses on hover, and is a static
// wrapped list for reduced motion. The position is driven manually so the
// loop is seamless and a pause never causes a jump.
function TopicStrip({ topics, live, reduce }) {
  const x = useMotionValue(0);
  const firstRef = useRef(null);
  const paused = useRef(false);

  useAnimationFrame((_, delta) => {
    if (!live || paused.current) return;
    const width = firstRef.current?.offsetWidth;
    if (!width) return;
    let next = x.get() - (width / 32) * (delta / 1000); // one loop per 32s
    if (next <= -width) next += width;
    x.set(next);
  });

  if (!topics.length) return null;

  if (reduce) {
    return (
      <ul
        aria-label="Technologies you can learn"
        className="relative flex flex-wrap justify-center gap-2"
      >
        {topics.map((t) => (
          <li
            key={t}
            className="rounded-full border bg-background px-3.5 py-1.5 text-xs text-muted-foreground"
          >
            {t}
          </li>
        ))}
      </ul>
    );
  }

  return (
    <div
      onPointerEnter={() => {
        paused.current = true;
      }}
      onPointerLeave={() => {
        paused.current = false;
      }}
      className="relative overflow-hidden [mask-image:linear-gradient(90deg,transparent,black_15%,black_85%,transparent)] [-webkit-mask-image:linear-gradient(90deg,transparent,black_15%,black_85%,transparent)]"
    >
      <motion.div className="flex w-max will-change-transform" style={{ x }}>
        <ul
          ref={firstRef}
          aria-label="Technologies you can learn"
          className="flex shrink-0"
        >
          {topics.map((t) => (
            <TopicChip key={t}>{t}</TopicChip>
          ))}
        </ul>
        {/* Duplicate for the seamless loop, hidden from assistive tech */}
        <ul aria-hidden="true" className="flex shrink-0">
          {topics.map((t) => (
            <TopicChip key={`${t}-copy`}>{t}</TopicChip>
          ))}
        </ul>
      </motion.div>
    </div>
  );
}

// Interactive steps: click a step to read more. Auto-advances while visible,
// pauses on hover and focus, and has an explicit pause button.
function StepTabs({ steps, live, reduce }) {
  const uid = useId();
  const [active, setActive] = useState(0);
  const [hoverPaused, setHoverPaused] = useState(false);
  const [manualPause, setManualPause] = useState(false);

  const auto = live && !hoverPaused && !manualPause;

  useEffect(() => {
    if (!auto) return;
    const t = setTimeout(
      () => setActive((a) => (a + 1) % steps.length),
      STEP_MS,
    );
    return () => clearTimeout(t);
  }, [active, auto, steps.length]);

  function onKeyDown(e) {
    const n = steps.length;
    let next;
    if (e.key === "ArrowRight" || e.key === "ArrowDown")
      next = (active + 1) % n;
    else if (e.key === "ArrowLeft" || e.key === "ArrowUp")
      next = (active - 1 + n) % n;
    else if (e.key === "Home") next = 0;
    else if (e.key === "End") next = n - 1;
    else return;
    e.preventDefault();
    setActive(next);
    document.getElementById(`${uid}-tab-${next}`)?.focus();
  }

  return (
    <div
      className="relative mx-auto max-w-3xl"
      onPointerEnter={() => setHoverPaused(true)}
      onPointerLeave={() => setHoverPaused(false)}
      onFocus={() => setHoverPaused(true)}
      onBlur={() => setHoverPaused(false)}
    >
      <div
        role="tablist"
        aria-label="How it works"
        className="grid gap-3 md:grid-cols-3"
      >
        {steps.map(({ icon: Icon, title: t, text: d }, i) => {
          const on = i === active;
          return (
            <button
              key={t}
              type="button"
              role="tab"
              id={`${uid}-tab-${i}`}
              aria-selected={on}
              aria-controls={`${uid}-panel`}
              tabIndex={on ? 0 : -1}
              onClick={() => setActive(i)}
              onKeyDown={onKeyDown}
              className={cn(
                "relative cursor-pointer overflow-hidden rounded-2xl border bg-background p-4 text-left transition-[border-color,box-shadow] duration-300 motion-reduce:transition-none",
                FOCUS,
                on
                  ? "border-[rgb(var(--cta-a)/0.6)] shadow-lg shadow-[rgb(var(--cta-a)/0.12)]"
                  : "border-border hover:border-[rgb(var(--cta-b)/0.45)]",
              )}
            >
              <span className="flex items-center gap-3">
                <span
                  className={cn(
                    "grid size-9 shrink-0 place-items-center rounded-xl ring-1 transition-colors duration-300 motion-reduce:transition-none",
                    on
                      ? "bg-[rgb(var(--cta-a))] text-[rgb(var(--cta-on))] ring-transparent"
                      : "bg-[rgb(var(--cta-a)/0.12)] text-[rgb(var(--cta-a))] ring-[rgb(var(--cta-a)/0.2)]",
                  )}
                >
                  <Icon className="size-4" aria-hidden="true" />
                </span>
                <span className="min-w-0">
                  <span className="block text-xs text-muted-foreground">
                    Step {i + 1}
                  </span>
                  <span className="block text-sm font-semibold">{t}</span>
                </span>
              </span>
              <span className="mt-2 block text-sm leading-relaxed text-muted-foreground">
                {d}
              </span>

              {/* progress bar for the active step */}
              <span
                aria-hidden="true"
                className="absolute inset-x-0 bottom-0 h-0.5 bg-border/60"
              >
                {on && (
                  <motion.span
                    key={`${active}-${auto}`}
                    className="block h-full origin-left bg-gradient-to-r from-[rgb(var(--cta-a))] to-[rgb(var(--cta-b))]"
                    initial={{ scaleX: auto && !reduce ? 0 : 1 }}
                    animate={{ scaleX: 1 }}
                    transition={{
                      duration: auto && !reduce ? STEP_MS / 1000 : 0,
                      ease: "linear",
                    }}
                  />
                )}
              </span>
            </button>
          );
        })}
      </div>

      {/* Announced politely only when it is not auto-advancing */}
      <div
        id={`${uid}-panel`}
        role="tabpanel"
        aria-labelledby={`${uid}-tab-${active}`}
        aria-live={auto ? "off" : "polite"}
        className="mt-3 min-h-[3.25rem] rounded-xl border border-dashed bg-background px-4 py-3 text-left text-sm leading-relaxed text-foreground/85"
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.p
            key={active}
            initial={reduce ? false : { opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduce ? undefined : { opacity: 0, y: -6 }}
            transition={{ duration: 0.2 }}
          >
            {steps[active].detail}
          </motion.p>
        </AnimatePresence>
      </div>

      {!reduce && (
        <div className="mt-2 flex justify-end">
          <button
            type="button"
            onClick={() => setManualPause((p) => !p)}
            aria-pressed={manualPause}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs text-muted-foreground transition-colors hover:text-foreground",
              FOCUS,
            )}
          >
            {manualPause ? (
              <FiPlay aria-hidden="true" className="size-3" />
            ) : (
              <FiPause aria-hidden="true" className="size-3" />
            )}
            {manualPause ? "Resume steps" : "Pause steps"}
          </button>
        </div>
      )}
    </div>
  );
}

// Small chip that floats gently beside the card content (wide screens)
function FloatChip({ icon: Icon, children, className, delay = 0, live }) {
  return (
    <motion.div
      className={cn(
        "absolute hidden items-center gap-2 rounded-xl border bg-background px-3 py-2 text-xs font-medium shadow-lg shadow-black/[0.05] xl:flex",
        className,
      )}
      animate={live ? { y: [0, -8, 0] } : undefined}
      transition={{ duration: 6, delay, repeat: Infinity, ease: "easeInOut" }}
    >
      <span className="grid size-6 place-items-center rounded-lg bg-[rgb(var(--cta-a)/0.14)] text-[rgb(var(--cta-a))]">
        <Icon className="size-3.5" aria-hidden="true" />
      </span>
      {children}
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/* 3D background                                                       */
/* Pure CSS 3D + framer-motion (no WebGL, no extra dependencies).      */
/* Everything animates transform/opacity only and only while the card  */
/* is on screen and reduced motion is off (`live`).                    */
/* ------------------------------------------------------------------ */

// Wireframe cube built from six CSS-3D faces
function Cube({ size = 72, live, duration = 26, className, from = [-25, 35] }) {
  const h = size / 2;
  const faces = [
    `rotateY(0deg) translateZ(${h}px)`,
    `rotateY(90deg) translateZ(${h}px)`,
    `rotateY(180deg) translateZ(${h}px)`,
    `rotateY(-90deg) translateZ(${h}px)`,
    `rotateX(90deg) translateZ(${h}px)`,
    `rotateX(-90deg) translateZ(${h}px)`,
  ];

  return (
    <div
      className={className}
      style={{ width: size, height: size, perspective: 700 }}
    >
      <motion.div
        className="relative size-full"
        style={{ transformStyle: "preserve-3d" }}
        initial={{ rotateX: from[0], rotateY: from[1] }}
        animate={
          live
            ? {
                rotateX: [from[0], from[0] + 360],
                rotateY: [from[1], from[1] + 360],
              }
            : undefined
        }
        transition={{ duration, repeat: Infinity, ease: "linear" }}
      >
        {faces.map((transform, i) => (
          <span
            key={i}
            className="absolute inset-0 border border-[rgb(var(--cta-a)/0.55)] bg-[rgb(var(--cta-a)/0.06)]"
            style={{ transform, backfaceVisibility: "visible" }}
          />
        ))}
        {/* glowing core */}
        <span
          className="absolute left-1/2 top-1/2 size-1/4 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[rgb(var(--cta-b))]"
          style={{ boxShadow: "0 0 24px 6px rgb(var(--cta-b) / 0.55)" }}
        />
      </motion.div>
    </div>
  );
}

// Tilted orbit ring with a glowing dot travelling around it
function OrbitRing({ size, live, duration, reverse, dotClass, className }) {
  return (
    <div
      className={className}
      style={{ width: size, height: size, transform: "rotateX(72deg)" }}
    >
      <motion.div
        className="relative size-full rounded-full border border-[rgb(var(--cta-b)/0.28)]"
        animate={live ? { rotate: reverse ? -360 : 360 } : undefined}
        transition={{ duration, repeat: Infinity, ease: "linear" }}
      >
        <span
          className={cn(
            "absolute left-1/2 top-0 size-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full",
            dotClass,
          )}
          style={{ boxShadow: "0 0 16px 4px currentColor" }}
        />
      </motion.div>
    </div>
  );
}

function Backdrop({ live, px, py }) {
  // gentle parallax of the whole 3D stage following the cursor
  const rotY = useTransform(px, [-0.5, 0.5], [-7, 7]);
  const rotX = useTransform(py, [-0.5, 0.5], [6, -6]);

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
    >
      {/* Soft base wash: pink to rose */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(135deg, rgb(var(--cta-a) / 0.08), transparent 45%, rgb(var(--cta-b) / 0.08))",
        }}
      />

      {/* Dot grid texture, fades out towards the bottom */}
      <div
        className="absolute inset-0 opacity-[0.3] [mask-image:linear-gradient(to_bottom,black_30%,transparent_85%)] [-webkit-mask-image:linear-gradient(to_bottom,black_30%,transparent_85%)]"
        style={{
          backgroundImage:
            "radial-gradient(rgb(var(--cta-a) / 0.35) 1px, transparent 1px)",
          backgroundSize: "22px 22px",
        }}
      />

      {/* Aurora glows */}
      <motion.div
        className="absolute -left-1/4 -top-1/2 h-[130%] w-3/4 will-change-transform"
        style={{
          background:
            "radial-gradient(closest-side, rgb(var(--cta-a) / 0.2), transparent)",
        }}
        animate={
          live
            ? { x: [0, 70, 0], y: [0, 36, 0], scale: [1, 1.1, 1] }
            : undefined
        }
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute -bottom-1/2 -right-1/4 h-[130%] w-3/4 will-change-transform"
        style={{
          background:
            "radial-gradient(closest-side, rgb(var(--cta-b) / 0.2), transparent)",
        }}
        animate={
          live
            ? { x: [0, -60, 0], y: [0, -30, 0], scale: [1, 1.08, 1] }
            : undefined
        }
        transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* 3D stage */}
      <div className="absolute inset-0" style={{ perspective: 1000 }}>
        <motion.div
          className="absolute inset-0"
          style={{
            rotateX: rotX,
            rotateY: rotY,
            transformStyle: "preserve-3d",
          }}
        >
          {/* Perspective grid floor that scrolls towards the viewer */}
          <div
            className="absolute inset-x-0 bottom-0 h-[62%] overflow-hidden text-[rgb(var(--cta-a))] [mask-image:linear-gradient(to_top,black_25%,transparent)] [-webkit-mask-image:linear-gradient(to_top,black_25%,transparent)]"
            style={{ perspective: 480 }}
          >
            <div
              className="absolute inset-x-[-60%] -top-[40%] h-[220%] origin-center opacity-[0.3]"
              style={{ transform: "rotateX(64deg)" }}
            >
              <motion.div
                className="absolute inset-x-0 -top-12 bottom-0 will-change-transform"
                style={{
                  backgroundImage:
                    "linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)",
                  backgroundSize: "56px 56px",
                }}
                animate={live ? { y: [0, 56] } : undefined}
                transition={{ duration: 3.2, repeat: Infinity, ease: "linear" }}
              />
            </div>
          </div>

          {/* Orbit rings (centre, behind the text) */}
          <div
            className="absolute left-1/2 top-1/2 hidden -translate-x-1/2 -translate-y-1/2 sm:block"
            style={{ transformStyle: "preserve-3d" }}
          >
            <OrbitRing
              size={560}
              live={live}
              duration={26}
              className="absolute -left-[280px] -top-[280px] text-[rgb(var(--cta-a))]"
              dotClass="bg-[rgb(var(--cta-a))]"
            />
            <OrbitRing
              size={820}
              live={live}
              duration={38}
              reverse
              className="absolute -left-[410px] -top-[410px] text-[rgb(var(--cta-b))]"
              dotClass="bg-[rgb(var(--cta-b))]"
            />
          </div>

          {/* Floating wireframe cubes */}
          <div className="absolute left-[5%] top-[14%] hidden md:block">
            <Cube size={84} live={live} duration={30} />
          </div>
          <div className="absolute bottom-[18%] right-[6%] hidden md:block">
            <Cube size={58} live={live} duration={22} from={[40, -20]} />
          </div>
          <div className="absolute right-[14%] top-[10%] hidden lg:block">
            <Cube size={34} live={live} duration={18} from={[10, 60]} />
          </div>
        </motion.div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Section                                                             */
/* Logged out: "Create free account" -> /register                      */
/* Logged in:  "Go to dashboard"     -> role dashboard (or /student)   */
/* ------------------------------------------------------------------ */

// `rating`, `learners` and `stats` are optional: they only render when you
// pass real values (never placeholder numbers).
// stats example: [{ value: 40, suffix: "+", label: "Courses" }]
export function CTASection({
  title = "Start building your future today",
  text = "Create a free account, explore free courses, and take your first step toward a career in technology.",
  memberText = "Your dashboard is ready. Continue a course, start a new one, or build your next project.",
  rating, // e.g. "4.8/5 from 120 reviews" (real data only)
  ratingValue, // drives the stars, e.g. 4.8
  learners, // real learner count, e.g. 1200
  stats = [], // extra real numbers
  topics = DEFAULT_TOPICS,
  eyebrow = "Free to start",
  primaryHref = "/courses",
  secondaryHref = "/courses",
  dashboardHref, // optional override; defaults to the role dashboard or /student
}) {
  const reduce = useReducedMotion();
  const cardRef = useRef(null);
  const inView = useInView(cardRef, { margin: "150px" });
  const live = inView && !reduce;

  const { user, loading } = useCurrentUser();
  const dashboard = dashboardHref ?? getDashboardHref(user);

  const heading = user ? `Welcome back, ${getFirstName(user)}` : title;
  const body = user ? memberText : text;
  const badge = user ? "Signed in" : eyebrow;
  const highlights = user ? memberHighlights : guestHighlights;
  const steps = user ? memberSteps : guestSteps;

  // Cursor spotlight + 3D parallax (mouse only)
  const mx = useMotionValue(-400);
  const my = useMotionValue(-400);
  const pxRaw = useMotionValue(0);
  const pyRaw = useMotionValue(0);
  const px = useSpring(pxRaw, { stiffness: 60, damping: 18 });
  const py = useSpring(pyRaw, { stiffness: 60, damping: 18 });
  const spotlight = useMotionTemplate`radial-gradient(360px circle at ${mx}px ${my}px, rgb(var(--cta-a) / 0.14), transparent 70%)`;

  const showRating = Boolean(rating);
  const allStats = [
    ...(Number(learners) > 0
      ? [{ value: Number(learners), suffix: "+", label: "Learners" }]
      : []),
    ...stats.filter((s) => Number(s?.value) > 0),
  ];

  return (
    <section
      className="pb-16 sm:pb-20 lg:pb-24"
      aria-labelledby="final-cta"
      aria-busy={loading ? true : undefined}
    >
      <Container>
        <Reveal>
          {/* Outer shell draws the animated gradient border */}
          <div
            ref={cardRef}
            onPointerMove={(e) => {
              if (e.pointerType !== "mouse" || reduce) return;
              const r = e.currentTarget.getBoundingClientRect();
              mx.set(e.clientX - r.left);
              my.set(e.clientY - r.top);
              pxRaw.set((e.clientX - r.left) / r.width - 0.5);
              pyRaw.set((e.clientY - r.top) / r.height - 0.5);
            }}
            onPointerLeave={() => {
              mx.set(-400);
              my.set(-400);
              pxRaw.set(0);
              pyRaw.set(0);
            }}
            // Two pink tones per theme (RGB triplets), plus the text color used
            // on top of them (white on the deep pink, dark on the lighter pink).
            className="relative isolate overflow-hidden rounded-3xl bg-border p-px shadow-xl [--cta-a:219_39_119] [--cta-b:244_63_94] [--cta-on:255_255_255] dark:[--cta-a:244_114_182] dark:[--cta-b:251_113_133] dark:[--cta-on:35_10_24]"
          >
            {/* Slowly rotating conic highlight that travels around the edge */}
            <motion.div
              aria-hidden="true"
              className="pointer-events-none absolute left-1/2 top-1/2 aspect-square w-[180%] -translate-x-1/2 -translate-y-1/2 will-change-transform"
              style={{
                background:
                  "conic-gradient(from 0deg, transparent 0deg, rgb(var(--cta-a) / 0.9) 60deg, rgb(var(--cta-b) / 0.9) 120deg, transparent 180deg, transparent 360deg)",
              }}
              animate={live ? { rotate: 360 } : undefined}
              transition={{ duration: 9, repeat: Infinity, ease: "linear" }}
            />

            <div className="relative isolate overflow-hidden rounded-[calc(1.5rem-1px)] bg-card px-5 py-14 text-center text-card-foreground sm:px-10 sm:py-16 lg:px-16 lg:py-20">
              <Backdrop live={live} px={px} py={py} />

              {!reduce && (
                <motion.div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 -z-10"
                  style={{ background: spotlight }}
                />
              )}

              {/* Floating chips (wide screens only) */}
              <FloatChip
                icon={FiLayers}
                live={live}
                className="bottom-[22%] left-[3%]"
              >
                Project-based courses
              </FloatChip>
              <FloatChip
                icon={FiAward}
                live={live}
                delay={1.4}
                className="right-[3%] top-[34%]"
              >
                Certificates to share
              </FloatChip>
              <FloatChip
                icon={FiHeart}
                live={live}
                delay={2.6}
                className="left-[6%] top-[8%]"
              >
                Mentor support included
              </FloatChip>

              {/* ---------- Content ---------- */}

              <div className="relative mx-auto mb-6 flex flex-wrap items-center justify-center gap-2">
                {badge && (
                  <span className="inline-flex items-center gap-2 rounded-full border border-[rgb(var(--cta-a)/0.35)] bg-[rgb(var(--cta-a)/0.10)] px-3.5 py-1.5 text-xs font-medium">
                    <span className="relative flex size-2">
                      {!reduce && (
                        <span className="absolute inline-flex size-full animate-ping rounded-full bg-[rgb(var(--cta-a))] opacity-60" />
                      )}
                      <span className="relative inline-flex size-2 rounded-full bg-[rgb(var(--cta-a))]" />
                    </span>
                    {badge}
                  </span>
                )}
                {showRating && (
                  <span className="inline-flex items-center gap-2 rounded-full border bg-background px-4 py-1.5 text-xs font-medium">
                    {Number(ratingValue) > 0 && (
                      <Stars value={Number(ratingValue)} />
                    )}
                    <span className="text-muted-foreground">{rating}</span>
                  </span>
                )}
              </div>

              {/* key replays the word animation once auth resolves */}
              <AnimatedTitle key={heading} id="final-cta" text={heading} />

              <p className="relative mx-auto mt-5 max-w-xl text-pretty text-base leading-relaxed text-muted-foreground sm:text-lg">
                {body}
              </p>

              {/* Primary / secondary actions */}
              <div className="relative mx-auto mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <Magnetic>
                  <Link
                    href={user ? dashboard : "/register"}
                    className={cn(
                      "group inline-flex min-h-12 items-center gap-2 rounded-full bg-[rgb(var(--cta-a))] px-7 text-sm font-semibold text-[rgb(var(--cta-on))] shadow-lg shadow-[rgb(var(--cta-a)/0.35)] transition-transform hover:scale-[1.03] motion-reduce:transition-none motion-reduce:hover:scale-100",
                      FOCUS,
                    )}
                  >
                    {user ? "Go to dashboard" : "Create free account"}
                    <FiArrowRight
                      className="size-4 transition-transform duration-300 motion-safe:group-hover:translate-x-0.5"
                      aria-hidden="true"
                    />
                  </Link>
                </Magnetic>
                <Link
                  href={user ? secondaryHref : primaryHref}
                  className={cn(
                    "inline-flex min-h-12 items-center gap-2 rounded-full border border-[rgb(var(--cta-a)/0.4)] bg-background px-7 text-sm font-semibold text-foreground transition-colors hover:border-[rgb(var(--cta-a)/0.7)] motion-reduce:transition-none",
                    FOCUS,
                  )}
                >
                  Browse courses
                </Link>
              </div>

              {/* Trust highlights */}
              <ul
                key={user ? "member" : "guest"}
                className="relative mx-auto mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2"
              >
                {highlights.map(({ icon: Icon, text: h }, i) => (
                  <motion.li
                    key={h}
                    initial={reduce ? false : { opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: reduce ? 0 : 0.3 + i * 0.1 }}
                    className="flex items-center gap-1.5 text-sm text-foreground/85"
                  >
                    <Icon
                      className="size-4 text-[rgb(var(--cta-a))]"
                      aria-hidden="true"
                    />
                    {h}
                  </motion.li>
                ))}
              </ul>

              {/* Quick links to the learning paths */}
              <nav
                aria-label="Learning paths"
                className="relative mx-auto mt-6 flex max-w-2xl flex-wrap items-center justify-center gap-2 text-xs"
              >
                <span className="text-muted-foreground">Jump to a path:</span>
                {PATH_LINKS.map((p) => (
                  <Link
                    key={p.id}
                    href={`/courses?category=${p.id}`}
                    className={cn(
                      "rounded-full border bg-background px-3 py-1 font-medium text-foreground/85 transition-colors hover:border-[rgb(var(--cta-a)/0.6)] hover:text-foreground motion-reduce:transition-none",
                      FOCUS,
                    )}
                  >
                    {p.label}
                  </Link>
                ))}
              </nav>

              {/* How it works (interactive); remounts when the steps change */}
              <Block label="How it works">
                <StepTabs
                  key={user ? "member-steps" : "guest-steps"}
                  steps={steps}
                  live={live}
                  reduce={reduce}
                />
              </Block>

              {/* Technology topics */}
              {topics.length > 0 && (
                <Block label="Technologies you can learn">
                  <TopicStrip topics={topics} live={live} reduce={reduce} />
                </Block>
              )}

              {/* Real numbers only */}
              {allStats.length > 0 && (
                <Block>
                  <dl className="relative flex flex-wrap items-stretch justify-center gap-3">
                    {allStats.map((s) => (
                      <div
                        key={s.label}
                        className="min-w-[8.5rem] flex-1 rounded-2xl border bg-background px-4 py-3"
                      >
                        <dt className="text-xs text-muted-foreground">
                          {s.label}
                        </dt>
                        <dd className="mt-0.5 text-2xl font-semibold tabular-nums text-[rgb(var(--cta-a))]">
                          <CountUp
                            to={Number(s.value)}
                            suffix={s.suffix || ""}
                            decimals={s.decimals || 0}
                          />
                        </dd>
                      </div>
                    ))}
                  </dl>
                </Block>
              )}
            </div>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
