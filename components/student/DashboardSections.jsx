// components/student/DashboardSections.jsx
"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import {
  AnimatePresence,
  animate,
  motion,
  useReducedMotion,
} from "framer-motion";
import {
  FiArrowRight,
  FiAward,
  FiBookOpen,
  FiCheck,
  FiCheckCircle,
  FiCompass,
  FiGift,
  FiHelpCircle,
  FiLayers,
  FiMessageSquare,
  FiPercent,
  FiRefreshCw,
  FiTrendingUp,
  FiZap,
} from "react-icons/fi";

// ---------------------------------------------------------------
// Routes: apne project ke hisaab se yahan badal lein.
// ---------------------------------------------------------------
const ROUTES = {
  browse: "/courses",
  free: "/courses?price=free",
  myCourses: "/student/courses", // ASSUMED
  certificates: "/student/certificates", // ASSUMED
  faq: "/faq",
  contact: "/contact",
};

const TIPS = [
  {
    title: "Study in short bursts",
    body: "25 focused minutes beat two distracted hours. Take a 5-minute break, then go again.",
  },
  {
    title: "Pick a fixed time",
    body: "Study at the same time every day. A routine removes the daily decision of when to start.",
  },
  {
    title: "Teach it back",
    body: "Explain a lesson to a friend in your own words. The gaps in your explanation show what to review.",
  },
  {
    title: "Finish before you switch",
    body: "One completed course is worth more than five half-finished ones. Stay with it until the end.",
  },
  {
    title: "Review before sleep",
    body: "A five-minute recap before bed helps the day's lessons stick.",
  },
  {
    title: "Write notes by hand",
    body: "Writing slows you down just enough to understand. Keep a small notebook for each course.",
  },
];

// ---------------------------------------------------------------
// Animation helpers (children server se aate hain)
// ---------------------------------------------------------------
const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};
const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" } },
};

export function Reveal({ children, className, delay = 0 }) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={reduce ? false : { opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.4, delay, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
}

export function StaggerGrid({ children, className }) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={className}
      variants={container}
      initial={reduce ? "show" : "hidden"}
      whileInView="show"
      viewport={{ once: true, margin: "-40px" }}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({ children, className }) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={className}
      variants={reduce ? undefined : item}
      whileHover={reduce ? undefined : { y: -4 }}
      transition={{ type: "spring", stiffness: 300, damping: 24 }}
    >
      {children}
    </motion.div>
  );
}

function AnimatedNumber({ value, suffix = "" }) {
  const reduce = useReducedMotion();
  const [n, setN] = useState(reduce ? value : 0);
  useEffect(() => {
    if (reduce) {
      setN(value);
      return;
    }
    const controls = animate(0, value, {
      duration: 0.9,
      ease: "easeOut",
      onUpdate: (v) => setN(Math.round(v)),
    });
    return () => controls.stop();
  }, [value, reduce]);
  return (
    <>
      {n}
      {suffix}
    </>
  );
}

// ---------------------------------------------------------------
// Hero
// ---------------------------------------------------------------
function ProgressRing({ pct }) {
  const reduce = useReducedMotion();
  return (
    <div className="relative size-28 shrink-0 sm:size-36">
      <svg viewBox="0 0 100 100" className="size-full -rotate-90">
        <circle
          cx="50"
          cy="50"
          r="42"
          fill="none"
          strokeWidth="8"
          stroke="currentColor"
          className="text-primary-foreground/20"
        />
        <motion.circle
          cx="50"
          cy="50"
          r="42"
          fill="none"
          strokeWidth="8"
          strokeLinecap="round"
          stroke="currentColor"
          className="text-primary-foreground"
          initial={reduce ? false : { pathLength: 0 }}
          animate={{ pathLength: pct / 100 }}
          transition={{ duration: 1.1, ease: "easeOut", delay: 0.2 }}
        />
      </svg>
      <div className="absolute inset-0 grid place-items-center text-center">
        <div>
          <p className="text-2xl font-bold leading-none sm:text-3xl">
            <AnimatedNumber value={pct} suffix="%" />
          </p>
          <p className="mt-1 text-[11px] text-primary-foreground/75 sm:text-xs">
            completed
          </p>
        </div>
      </div>
    </div>
  );
}

export function DashboardHero({ first, total, active, completed }) {
  const reduce = useReducedMotion();
  // useSyncExternalStore keeps the server and hydration render identical,
  // then reads the browser-local date without setting state in an effect.
  const greeting = useSyncExternalStore(
    () => () => {},
    () => {
      const hour = new Date().getHours();
      return hour < 12
        ? "Good morning"
        : hour < 18
          ? "Good afternoon"
          : "Good evening";
    },
    () => "Welcome back",
  );
  const today = useSyncExternalStore(
    () => () => {},
    () =>
      new Date().toLocaleDateString(undefined, {
        weekday: "long",
        day: "numeric",
        month: "long",
      }),
    () => "",
  );

  const pct = total ? Math.round((completed / total) * 100) : 0;
  const message = active
    ? `You have ${active} ${active === 1 ? "course" : "courses"} in progress. Keep the momentum going.`
    : total
      ? "You have finished every course. Pick your next one and keep growing."
      : "Start your journey at Apni University with a free course today.";

  return (
    <motion.section
      initial={reduce ? false : { opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: "easeOut" }}
      className="relative overflow-hidden rounded-3xl bg-primary p-5 text-primary-foreground shadow-lg sm:p-8"
    >
      {/* Decorative rings */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -right-20 -top-20 size-64 rounded-full border border-primary-foreground/10"
      />
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -right-8 -top-8 size-40 rounded-full border border-primary-foreground/10"
      />
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-24 left-1/3 size-64 rounded-full bg-primary-foreground/5"
      />

      <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="max-w-xl">
          <p className="text-sm font-medium text-primary-foreground/75">
            {today || "Apni University"}
          </p>
          <h1 className="mt-1 text-2xl font-bold leading-tight sm:text-4xl">
            {greeting}, {first}
          </h1>
          <p className="mt-2 text-sm text-primary-foreground/85 sm:text-base">
            {message}
          </p>

          <div className="mt-5 flex flex-col gap-3 sm:flex-row">
            {active ? (
              <a
                href="#continue"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary-foreground px-5 py-2.5 text-sm font-semibold text-primary transition-transform hover:scale-[1.03] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-foreground focus-visible:ring-offset-2 focus-visible:ring-offset-primary"
              >
                Continue learning
                <FiArrowRight aria-hidden="true" />
              </a>
            ) : (
              <Link
                href={total ? ROUTES.browse : ROUTES.free}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary-foreground px-5 py-2.5 text-sm font-semibold text-primary transition-transform hover:scale-[1.03] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-foreground focus-visible:ring-offset-2 focus-visible:ring-offset-primary"
              >
                {total ? "Browse courses" : "Explore free courses"}
                <FiArrowRight aria-hidden="true" />
              </Link>
            )}
            <Link
              href={ROUTES.browse}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-primary-foreground/30 px-5 py-2.5 text-sm font-semibold transition-colors hover:bg-primary-foreground/10"
            >
              <FiCompass aria-hidden="true" />
              Discover courses
            </Link>
          </div>
        </div>

        <div className="flex items-center gap-4 sm:flex-col sm:gap-2">
          <ProgressRing pct={pct} />
          <p className="text-sm text-primary-foreground/80 sm:text-center">
            {completed} of {total} courses
            <br className="hidden sm:block" /> finished
          </p>
        </div>
      </div>
    </motion.section>
  );
}

// ---------------------------------------------------------------
// Stats
// ---------------------------------------------------------------
export function StatsRow({ total, active, completed }) {
  const rate = total ? Math.round((completed / total) * 100) : 0;
  const stats = [
    { label: "Enrolled", value: total, icon: FiBookOpen },
    { label: "In progress", value: active, icon: FiTrendingUp },
    { label: "Completed", value: completed, icon: FiCheckCircle },
    { label: "Completion rate", value: rate, suffix: "%", icon: FiPercent },
  ];
  return (
    <StaggerGrid className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
      {stats.map(({ label, value, suffix, icon: Icon }) => (
        <StaggerItem
          key={label}
          className="rounded-2xl border bg-card p-4 shadow-sm transition-shadow hover:shadow-md sm:p-5"
        >
          <span className="grid size-10 place-items-center rounded-xl bg-primary/10 text-primary">
            <Icon aria-hidden="true" className="size-5" />
          </span>
          <p className="mt-3 text-3xl font-bold tabular-nums">
            <AnimatedNumber value={value} suffix={suffix} />
          </p>
          <p className="text-sm text-muted-foreground">{label}</p>
        </StaggerItem>
      ))}
    </StaggerGrid>
  );
}

// ---------------------------------------------------------------
// Quick actions
// ---------------------------------------------------------------
export function QuickActions() {
  const actions = [
    {
      href: ROUTES.browse,
      icon: FiCompass,
      title: "Browse courses",
      text: "Find your next course",
    },
    {
      href: ROUTES.myCourses,
      icon: FiLayers,
      title: "My courses",
      text: "See everything you joined",
    },
    {
      href: ROUTES.certificates,
      icon: FiAward,
      title: "Certificates",
      text: "View and download",
    },
    {
      href: ROUTES.faq,
      icon: FiHelpCircle,
      title: "Help center",
      text: "Answers to common questions",
    },
  ];
  return (
    <StaggerGrid className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
      {actions.map(({ href, icon: Icon, title, text }) => (
        <StaggerItem key={title}>
          <Link
            href={href}
            className="group flex h-full items-start gap-3 rounded-2xl border bg-card p-4 transition-colors hover:border-primary/40 hover:bg-primary/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-muted text-foreground transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
              <Icon aria-hidden="true" className="size-5" />
            </span>
            <span className="min-w-0">
              <span className="flex items-center gap-1 text-sm font-semibold">
                {title}
                <FiArrowRight
                  aria-hidden="true"
                  className="size-3.5 -translate-x-1 opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-100"
                />
              </span>
              <span className="mt-0.5 block text-xs text-muted-foreground">
                {text}
              </span>
            </span>
          </Link>
        </StaggerItem>
      ))}
    </StaggerGrid>
  );
}

// ---------------------------------------------------------------
// Milestones (data se automatically unlock hote hain)
// ---------------------------------------------------------------
export function Milestones({ total, completed }) {
  const reduce = useReducedMotion();
  const list = [
    {
      title: "First step",
      hint: "Enroll in your first course",
      done: total >= 1,
      icon: FiGift,
    },
    {
      title: "Finisher",
      hint: "Complete your first course",
      done: completed >= 1,
      icon: FiCheckCircle,
    },
    {
      title: "Scholar",
      hint: "Complete 3 courses",
      done: completed >= 3,
      icon: FiAward,
    },
  ];
  const doneCount = list.filter((m) => m.done).length;

  return (
    <div className="rounded-2xl border bg-card p-5 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-base font-semibold">Your milestones</h2>
        <span className="text-sm text-muted-foreground">
          {doneCount}/{list.length}
        </span>
      </div>

      <div
        className="mt-3 h-2 overflow-hidden rounded-full bg-muted"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={list.length}
        aria-valuenow={doneCount}
        aria-label="Milestones unlocked"
      >
        <motion.div
          className="h-full rounded-full bg-primary"
          initial={reduce ? false : { width: 0 }}
          whileInView={{ width: `${(doneCount / list.length) * 100}%` }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />
      </div>

      <ul className="mt-4 space-y-3">
        {list.map(({ title, hint, done, icon: Icon }, i) => (
          <motion.li
            key={title}
            initial={reduce ? false : { opacity: 0, x: -10 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 * i, duration: 0.3 }}
            className="flex items-center gap-3"
          >
            <span
              className={`relative grid size-10 shrink-0 place-items-center rounded-full transition-colors ${
                done
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              <Icon aria-hidden="true" className="size-4" />
              {done && (
                <motion.span
                  initial={reduce ? false : { scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", delay: 0.4 + 0.1 * i }}
                  className="absolute -bottom-0.5 -right-0.5 grid size-4 place-items-center rounded-full bg-card text-primary ring-2 ring-card"
                >
                  <FiCheck aria-hidden="true" className="size-3" />
                </motion.span>
              )}
            </span>
            <div className="min-w-0">
              <p
                className={`text-sm font-medium ${done ? "" : "text-foreground/80"}`}
              >
                {title}
              </p>
              <p className="text-xs text-muted-foreground">{hint}</p>
            </div>
          </motion.li>
        ))}
      </ul>
    </div>
  );
}

// ---------------------------------------------------------------
// Study tip (roz badalta hai, button se agla tip)
// ---------------------------------------------------------------
export function TipCard() {
  const reduce = useReducedMotion();
  const [index, setIndex] = useState(() => {
    const day = Math.floor(Date.now() / 86_400_000);
    return day % TIPS.length;
  });

  const tip = TIPS[index];
  return (
    <div className="rounded-2xl border bg-card p-5 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <h2 className="flex items-center gap-2 text-base font-semibold">
          <span className="grid size-8 place-items-center rounded-lg bg-primary/10 text-primary">
            <FiZap aria-hidden="true" className="size-4" />
          </span>
          Study tip
        </h2>
        <button
          type="button"
          onClick={() => setIndex((i) => (i + 1) % TIPS.length)}
          className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <FiRefreshCw aria-hidden="true" className="size-3.5" />
          Next tip
        </button>
      </div>

      <div className="mt-3 min-h-[6.5rem]" aria-live="polite">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={index}
            initial={reduce ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
          >
            <p className="text-sm font-semibold">{tip.title}</p>
            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
              {tip.body}
            </p>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------
// Help strip
// ---------------------------------------------------------------
export function HelpCard() {
  return (
    <div className="flex flex-col gap-4 rounded-2xl border bg-primary/5 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
      <div className="flex items-start gap-4">
        <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-primary text-primary-foreground">
          <FiMessageSquare aria-hidden="true" className="size-5" />
        </span>
        <div>
          <h2 className="text-base font-semibold sm:text-lg">
            Need help with your courses?
          </h2>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Check the help center first. If you still need us, the Apni
            University team is one message away.
          </p>
        </div>
      </div>
      <div className="flex flex-col gap-2 sm:flex-row">
        <Link
          href={ROUTES.faq}
          className="inline-flex items-center justify-center gap-2 rounded-lg border bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-muted"
        >
          Help center
        </Link>
        <Link
          href={ROUTES.contact}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
        >
          Contact us
          <FiArrowRight aria-hidden="true" />
        </Link>
      </div>
    </div>
  );
}
