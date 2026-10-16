"use client";

import { Component, useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import {
  AnimatePresence,
  animate,
  motion,
  useInView,
  useMotionTemplate,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from "framer-motion";
import {
  ArrowRight,
  ArrowUpRight,
  Award,
  BookOpen,
  BriefcaseBusiness,
  Check,
  ChevronDown,
  Code2,
  Compass,
  GraduationCap,
  Layers3,
  LayoutDashboard,
  LogIn,
  Megaphone,
  Repeat2,
  Rocket,
  Star,
  Target,
  TrendingUp,
  UsersRound,
} from "lucide-react";
import Container from "@/components/layout/Container";
import { mediaConfig } from "@/config/media";
import { formatCompact } from "@/lib/utils/format";
// TODO: point this at the file where you saved useLandingData.js.
import {
  FALLBACK_CATEGORIES,
  matchesCategory,
  useLandingData,
} from "@/hooks/useLandingData";
import { onAuthStateChanged } from "firebase/auth";
// TODO: point this at the file that exports your initialised Firebase auth instance.
import { auth } from "@/lib/firebase/client/auth";
import { Card } from "@/components/ui/card";
import { CategoryIcon } from "@/components/shared/CategoryIcon";

// Browser-only WebGL scene: never rendered on the server.
const HeroScene = dynamic(() => import("./HeroScene"), {
  ssr: false,
  loading: () => null,
});

const EASE = [0.22, 1, 0.36, 1];

/* ------------------------------------------------------------------ */
/* Design tokens + routes (change routes here, nowhere else)           */
/* ------------------------------------------------------------------ */
const BORDER = "border-border/80";
const TEXT_MUTED = "text-muted-foreground";
const FOCUS =
  "outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background";
// Sentence case label (no all-caps) keeps the page calmer and easier to read.
const LABEL = "text-sm font-semibold tracking-wide text-primary";

const ROUTES = {
  login: "/signin",
  register: "/register",
  courses: "/courses",
  contact: "/contact",
};

// Logged-in users always go to the student dashboard.
const DASHBOARD_HREF = "/student";
const getDashboardHref = () => DASHBOARD_HREF;
const getFirstName = (user) => {
  const source =
    user?.displayName || user?.name || user?.email?.split("@")[0] || "";
  return source.trim().split(/\s+/)[0] || "learner";
};

// Category links go to /courses?category=<firebase-slug>, e.g.
// /courses?category=web-development. Only categories that really come from
// Firebase get the filter (their slug is the real one). The built-in fallback
// ones go to plain /courses, so a link never uses a slug that does not exist.
const categoryHref = (category) => category?.href || ROUTES.courses;

/* ------------------------------------------------------------------ */
/* Category helpers (icon + accent come from the Firestore doc)        */
/* ------------------------------------------------------------------ */
// Full class strings so Tailwind can see them.
const ACCENTS = {
  rose: "bg-rose-500/10 text-rose-600 dark:text-rose-400",
  blue: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  sky: "bg-sky-500/10 text-sky-600 dark:text-sky-400",
  emerald: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  green: "bg-green-500/10 text-green-600 dark:text-green-400",
  amber: "bg-amber-500/10 text-amber-700 dark:text-amber-400",
  orange: "bg-orange-500/10 text-orange-600 dark:text-orange-400",
  violet: "bg-violet-500/10 text-violet-600 dark:text-violet-400",
  purple: "bg-purple-500/10 text-purple-600 dark:text-purple-400",
  indigo: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400",
  pink: "bg-pink-500/10 text-pink-600 dark:text-pink-400",
  teal: "bg-teal-500/10 text-teal-600 dark:text-teal-400",
  cyan: "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400",
};

const accentClass = (name) =>
  ACCENTS[String(name ?? "").toLowerCase()] ?? "bg-primary/10 text-primary";

const shorten = (text, max = 120) => {
  const value = String(text ?? "").trim();
  if (value.length <= max) return value;
  return `${value.slice(0, max).replace(/\s+\S*$/, "")}…`;
};

/* ------------------------------------------------------------------ */
/* Static content                                                      */
/* ------------------------------------------------------------------ */
const terminalLines = [
  "$ npx create-next-app my-project",
  "$ pip install langchain",
  "$ docker compose up -d",
  "✓ Your project is live",
];

const perks = ["Project-based", "Beginner friendly", "Learn at your pace"];

const marqueeTools = [
  "React",
  "Next.js",
  "Node.js",
  "Python",
  "TensorFlow",
  "LangChain",
  "Firebase",
  "Figma",
  "Docker",
  "Kubernetes",
  "Linux",
  "Git",
  "OWASP",
  "Tailwind",
  "CI/CD",
];

const highlights = [
  {
    icon: UsersRound,
    title: "Live mentors",
    text: "Get unstuck fast with Q&A sessions and code reviews.",
  },
  {
    icon: Layers3,
    title: "Real projects",
    text: "Build a portfolio that others can actually open.",
  },
  {
    icon: Award,
    title: "Certificates",
    text: "Share proof of your skills on LinkedIn and your CV.",
  },
  {
    icon: BriefcaseBusiness,
    title: "Career support",
    text: "CV reviews, mock interviews and guidance.",
  },
];

const steps = [
  {
    icon: Target,
    title: "Pick your path",
    text: "Choose a learning path and get a clear roadmap.",
  },
  {
    icon: Code2,
    title: "Build real projects",
    text: "Learn by shipping. Every module ends with something you can show.",
  },
  {
    icon: TrendingUp,
    title: "Show your skills",
    text: "Earn certificates, polish your portfolio and start applying with confidence.",
  },
];

// `prefer` is the category KEY we would like to link to (web / ai / cloud).
// Firebase categories get this key automatically (see useLandingData.js),
// so it works even when the real slug is e.g. "web-development".
// Falls back to position when no category has that key.
const audienceDefs = [
  {
    icon: Compass,
    title: "Complete beginners",
    text: "Start from zero with guided lessons, small wins and a clear order to follow.",
    verb: "Start with",
    prefer: "web",
  },
  {
    icon: Repeat2,
    title: "Career switchers",
    text: "Turn the hours you have into a portfolio that shows what you can do now.",
    verb: "See",
    prefer: "ai",
  },
  {
    icon: Rocket,
    title: "Working developers",
    text: "Add cloud, security or DevOps depth and take on bigger responsibility.",
    verb: "Explore",
    prefer: "cloud",
  },
];

const defaultFaqs = [
  {
    q: "I have never coded. Can I start?",
    a: "Yes. Full-Stack Web and Cloud are built for beginners. If you want a gentler start, begin with web basics and move into other paths later.",
  },
  {
    q: "How do I choose the right path?",
    a: "Open the learning paths above and read what each one covers, what you will build and what background helps. If you are unsure, start with Full-Stack Web: its skills carry into every other path.",
  },
  {
    q: "Do I get a certificate?",
    a: "Yes. You earn certificates you can share on LinkedIn and add to your CV, backed by projects you can show.",
  },
  {
    q: "Can I learn at my own pace?",
    a: "Yes. Lessons are self-paced, and mentor Q&A sessions and code reviews are there when you need help.",
  },
  {
    q: "What does career support include?",
    a: "CV reviews, mock interviews and guidance on presenting your projects. It helps you prepare and apply with confidence; it is guidance, not a job guarantee.",
  },
  {
    q: "Who do I contact if I have a question?",
    a: "Reach us from the contact page and we will help you pick a course or sort out access.",
  },
];

/* ------------------------------------------------------------------ */
/* Motion helpers                                                      */
/* ------------------------------------------------------------------ */
function reveal(reduce, delay = 0) {
  if (reduce) return {};

  return {
    initial: { opacity: 0, y: 18 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: "-40px" },
    transition: { duration: 0.6, delay, ease: EASE },
  };
}

/* ------------------------------------------------------------------ */
/* Hooks                                                               */
/* ------------------------------------------------------------------ */

// Returns { user, loading }.
// loading = true: still checking | user = null: logged out | user = object: logged in
function useCurrentUser() {
  const [state, setState] = useState({ user: null, loading: true });

  useEffect(() => {
    // Firebase reports once whether someone is signed in (user object or null).
    const unsubscribe = onAuthStateChanged(
      auth,
      (firebaseUser) =>
        setState({
          // Anonymous Firebase sessions are not real members: treat as logged out.
          user: firebaseUser && !firebaseUser.isAnonymous ? firebaseUser : null,
          loading: false,
        }),
      () => setState({ user: null, loading: false }),
    );

    // If Firebase never answers, treat the visitor as logged out.
    const timeoutId = setTimeout(
      () => setState((s) => (s.loading ? { user: null, loading: false } : s)),
      4000,
    );

    return () => {
      clearTimeout(timeoutId);
      unsubscribe();
    };
  }, []);

  return state;
}

function useMediaQuery(query) {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(query);
    const update = () => setMatches(media.matches);

    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, [query]);

  return matches;
}

// If WebGL is unavailable the CSS fallback behind the canvas stays visible.
class SceneBoundary extends Component {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  render() {
    return this.state.failed ? null : this.props.children;
  }
}

/* ------------------------------------------------------------------ */
/* Auth-aware buttons                                                  */
/* ------------------------------------------------------------------ */
// Logged in  -> /student. Logged out -> create account. Loading -> placeholder.
function AuthCta({ user, loading = false, className = "" }) {
  const base = `inline-flex min-h-12 cursor-pointer items-center justify-center gap-2 rounded-lg bg-primary px-6 text-sm font-semibold text-primary-foreground transition-transform duration-200 hover:-translate-y-0.5 motion-reduce:transform-none motion-reduce:transition-none ${FOCUS} ${className}`;

  // Placeholder until auth resolves, so the button never flickers.
  if (loading) {
    return (
      <div
        className={`min-h-12 min-w-48 animate-pulse rounded-lg bg-muted ${className}`}
        aria-hidden="true"
      />
    );
  }

  if (user) {
    return (
      <Link href={getDashboardHref(user)} className={base}>
        <LayoutDashboard className="size-4" aria-hidden="true" />
        Go to dashboard
      </Link>
    );
  }

  return (
    <Link href={ROUTES.register} className={base}>
      <GraduationCap className="size-4" aria-hidden="true" />
      Create your account
    </Link>
  );
}

function LoginLink({ user, loading, className = "" }) {
  if (loading || user) return null;

  return (
    <Link
      href={ROUTES.login}
      className={`inline-flex min-h-10 cursor-pointer items-center gap-1.5 rounded-sm text-sm font-medium text-foreground/80 hover:text-primary hover:underline ${FOCUS} ${className}`}
    >
      <LogIn className="size-4" aria-hidden="true" />
      Already a member? Log in
    </Link>
  );
}

/* ------------------------------------------------------------------ */
/* Small UI pieces                                                     */
/* ------------------------------------------------------------------ */
function ScrollProgress({ reduce }) {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 140,
    damping: 28,
    mass: 0.3,
  });

  if (reduce) return null;

  return (
    <motion.div
      aria-hidden="true"
      style={{ scaleX }}
      className="fixed inset-x-0 top-0 z-50 h-0.5 origin-left bg-primary"
    />
  );
}

// Mobile-only bar that appears after the hero for logged-out visitors.
function StickyCta({ user, loading }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 640);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <AnimatePresence>
      {visible && !loading && !user && (
        <motion.div
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          transition={{ duration: 0.3, ease: EASE }}
          className={`fixed inset-x-3 bottom-3 z-40 flex items-center justify-between gap-3 rounded-2xl border ${BORDER} bg-card/95 p-3 shadow-xl shadow-black/10 backdrop-blur md:hidden`}
        >
          <p className="text-sm font-medium leading-5">
            Ready to build your first project?
          </p>
          <Link
            href={ROUTES.register}
            className={`inline-flex min-h-10 shrink-0 items-center rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground ${FOCUS}`}
          >
            Join now
          </Link>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ------------------------------------------------------------------ */
/* 3D helpers                                                          */
/* ------------------------------------------------------------------ */
function Tilt3D({ reduce, className = "", max = 7, children }) {
  const x = useMotionValue(0.5);
  const y = useMotionValue(0.5);
  const sx = useSpring(x, { stiffness: 200, damping: 22 });
  const sy = useSpring(y, { stiffness: 200, damping: 22 });

  const rotateX = useTransform(sy, [0, 1], [max, -max]);
  const rotateY = useTransform(sx, [0, 1], [-max, max]);
  const gx = useTransform(sx, (v) => `${v * 100}%`);
  const gy = useTransform(sy, (v) => `${v * 100}%`);
  const glare = useMotionTemplate`radial-gradient(260px circle at ${gx} ${gy}, color-mix(in oklab, var(--primary) 14%, transparent), transparent 70%)`;

  const onMove = (event) => {
    if (reduce || event.pointerType !== "mouse") return;

    const rect = event.currentTarget.getBoundingClientRect();
    if (!rect.width || !rect.height) return;

    x.set((event.clientX - rect.left) / rect.width);
    y.set((event.clientY - rect.top) / rect.height);
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
      {!reduce && (
        <motion.span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 rounded-[inherit]"
          style={{ background: glare }}
        />
      )}
    </motion.div>
  );
}

function TiltCard({ reduce, delay = 0, className, children }) {
  return (
    <motion.li {...reveal(reduce, delay)} className="[perspective:900px]">
      <Tilt3D reduce={reduce} className={className}>
        {children}
      </Tilt3D>
    </motion.li>
  );
}

function Float({ children, className, delay = 0 }) {
  const reduce = useReducedMotion();

  return (
    <motion.div
      className={className}
      animate={reduce ? undefined : { y: [0, -6, 0] }}
      transition={{
        duration: 7,
        delay,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    >
      {children}
    </motion.div>
  );
}

function CountUp({ value, reduce }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  const [count, setCount] = useState(reduce ? value : 0);

  useEffect(() => {
    if (!inView || reduce) return;

    const controls = animate(0, value, {
      duration: 1.4,
      ease: "easeOut",
      onUpdate: (nextValue) => setCount(Math.round(nextValue)),
    });

    return () => controls.stop();
  }, [inView, value, reduce]);

  return <span ref={ref}>{formatCompact(reduce ? value : count)}+</span>;
}

/* ------------------------------------------------------------------ */
/* Type rotator                                                        */
/* ------------------------------------------------------------------ */
function TypeRotator({ reduce, paths }) {
  const ref = useRef(null);
  const inView = useInView(ref);
  const [index, setIndex] = useState(0);

  // One line + one button per category, straight from Firebase.
  const items = useMemo(
    () =>
      paths.map((p) => ({
        text: shorten(p.tagline || p.study || p.label, 120),
        label: p.label,
        href: categoryHref(p),
      })),
    [paths],
  );

  const item = items[index % items.length];
  const [length, setLength] = useState(reduce ? item.text.length : 0);

  useEffect(() => {
    if (reduce || !inView || items.length < 2) return;

    const intervalId = setInterval(() => {
      setIndex((current) => (current + 1) % items.length);
      setLength(0);
    }, 4000);

    return () => clearInterval(intervalId);
  }, [reduce, inView, items.length]);

  useEffect(() => {
    if (reduce || !inView || length >= item.text.length) return;

    const timeoutId = setTimeout(() => setLength((l) => l + 1), 35);
    return () => clearTimeout(timeoutId);
  }, [reduce, inView, length, item.text.length]);

  const visibleLength = reduce ? item.text.length : length;

  return (
    <div ref={ref} className="mt-6 max-w-xl">
      {/* Screen readers get the full text, not the typing. */}
      <p className="sr-only">{item.text}</p>

      {/* min-h prevents layout shift while typing. */}
      <p
        aria-hidden="true"
        className={`min-h-[5.5rem] text-base leading-7 sm:min-h-[4rem] sm:text-lg sm:leading-8 ${TEXT_MUTED}`}
      >
        {item.text.slice(0, visibleLength)}
        {!reduce && (
          <span className="ml-0.5 inline-block h-5 w-0.5 translate-y-1 animate-pulse bg-primary motion-reduce:animate-none" />
        )}
      </p>

      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={item.href}
          initial={reduce ? false : { opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={reduce ? undefined : { opacity: 0, y: -6 }}
          transition={{ duration: 0.25 }}
        >
          <Link
            href={item.href}
            className={`inline-flex min-h-10 cursor-pointer items-center gap-1.5 rounded-lg border ${BORDER} bg-foreground/[0.03] px-4 text-sm font-medium text-primary transition-colors duration-200 hover:border-primary/50 motion-reduce:transition-none ${FOCUS}`}
          >
            Explore {item.label}
            <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Terminal                                                            */
/* ------------------------------------------------------------------ */
function Terminal({ reduce, className = "w-60" }) {
  const ref = useRef(null);
  const inView = useInView(ref);
  const fullText = terminalLines.join("\n");
  const [length, setLength] = useState(reduce ? fullText.length : 0);

  // Only types while visible, so it never burns frames off-screen.
  useEffect(() => {
    if (reduce || !inView) return;

    const intervalId = setInterval(() => {
      setLength((current) =>
        current >= fullText.length + 30 ? 0 : current + 1,
      );
    }, 55);

    return () => clearInterval(intervalId);
  }, [reduce, inView, fullText.length]);

  const visibleLength = reduce ? fullText.length : length;

  return (
    <div
      ref={ref}
      aria-hidden="true"
      className={`rounded-xl border ${BORDER} bg-card/90 p-3 shadow-lg shadow-black/[0.06] backdrop-blur ${className}`}
    >
      <div className="mb-2 flex gap-1.5">
        <span className="size-2 rounded-full bg-foreground/20" />
        <span className="size-2 rounded-full bg-foreground/20" />
        <span className="size-2 rounded-full bg-amber-400/80" />
      </div>
      <pre className="h-24 overflow-hidden whitespace-pre-wrap font-mono text-[11px] leading-5 text-foreground/90">
        {fullText.slice(0, visibleLength)}
        {!reduce && (
          <span className="ml-0.5 inline-block h-3 w-1.5 translate-y-0.5 animate-pulse bg-primary motion-reduce:animate-none" />
        )}
      </pre>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Path switcher                                                       */
/* ------------------------------------------------------------------ */
function PathSwitcher({ reduce, paths }) {
  const [activeId, setActiveId] = useState(paths[0].id);
  const [autoRotate, setAutoRotate] = useState(true);
  // If Firebase data replaces the fallback, the old id may not exist anymore.
  const activePath = paths.find((path) => path.id === activeId) ?? paths[0];

  useEffect(() => {
    if (!autoRotate || reduce || paths.length < 2) return;

    const intervalId = setInterval(() => {
      setActiveId((currentId) => {
        const currentIndex = paths.findIndex((path) => path.id === currentId);
        return paths[(currentIndex + 1) % paths.length].id;
      });
    }, 6000);

    return () => clearInterval(intervalId);
  }, [autoRotate, reduce, paths]);

  // Empty fields (not filled in Firestore yet) are simply hidden.
  const details = [
    ["What you study", activePath.study],
    ["Why it matters", activePath.why],
    ["What you build", activePath.build],
    ["Helpful background", activePath.background],
  ].filter(([, value]) => Boolean(value));

  return (
    <div id="learning-paths" className="mt-10 scroll-mt-24">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h2 className={LABEL}>Learning paths</h2>
        <span className={`hidden text-xs sm:block ${TEXT_MUTED}`}>
          Pick one to see what it covers
        </span>
      </div>

      <ul
        className="flex max-w-full snap-x gap-2 overflow-x-auto pb-2 [scrollbar-width:none] sm:flex-wrap sm:overflow-visible [&::-webkit-scrollbar]:hidden"
        aria-label="Learning paths"
      >
        {paths.map((path) => {
          const isActive = path.id === activePath.id;

          return (
            <li key={path.id} className="shrink-0 snap-start">
              <button
                type="button"
                aria-pressed={isActive}
                onClick={() => {
                  setAutoRotate(false);
                  setActiveId(path.id);
                }}
                className={`inline-flex min-h-9 cursor-pointer items-center gap-2 rounded-full border px-3.5 text-sm font-medium transition-colors duration-200 motion-reduce:transition-none ${FOCUS} ${
                  isActive
                    ? "border-primary bg-primary text-primary-foreground"
                    : `${BORDER} bg-foreground/[0.03] text-foreground/85 hover:border-primary/50 hover:text-foreground`
                }`}
              >
                <CategoryIcon name={path.icon} className="size-4" />
                {path.label}
              </button>
            </li>
          );
        })}
      </ul>

      <Tilt3D reduce={reduce} max={3} className="mt-2 rounded-2xl">
        <div
          className={`relative min-h-[21rem] overflow-hidden rounded-2xl border ${BORDER} bg-card/70 p-5 sm:min-h-[15rem] sm:p-6`}
        >
          {autoRotate && !reduce && (
            <motion.div
              key={activePath.id}
              aria-hidden="true"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 6, ease: "linear" }}
              className="absolute inset-x-0 top-0 h-px origin-left bg-primary"
            />
          )}

          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={activePath.id}
              initial={reduce ? false : { opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduce ? undefined : { opacity: 0, y: -6 }}
              transition={{ duration: 0.22 }}
            >
              <dl className="grid gap-x-6 gap-y-4 sm:grid-cols-2">
                {details.map(([term, description]) => (
                  <div key={term}>
                    <dt className="text-xs font-semibold text-primary/80">
                      {term}
                    </dt>
                    <dd className="mt-1 text-sm leading-6 text-foreground/90">
                      {description}
                    </dd>
                  </div>
                ))}
              </dl>

              <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
                {activePath.tools.length > 0 ? (
                  <ul className="flex flex-wrap gap-1.5">
                    {activePath.tools.map((tool) => (
                      <li
                        key={tool}
                        className={`rounded-md border ${BORDER} bg-foreground/[0.03] px-2 py-1 text-xs text-foreground/80`}
                      >
                        {tool}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <span />
                )}
                <Link
                  href={categoryHref(activePath)}
                  className={`inline-flex min-h-9 cursor-pointer items-center gap-1 rounded-sm text-sm font-medium text-primary hover:underline ${FOCUS}`}
                >
                  Browse {activePath.label} courses
                  <ArrowRight className="size-4" aria-hidden="true" />
                </Link>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </Tilt3D>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Hero stage                                                          */
/* ------------------------------------------------------------------ */
function Stage({ reduce, src, featuredCourse, spotlightPath, scrollProgress }) {
  const stageRef = useRef(null);
  const inView = useInView(stageRef, { margin: "120px" });
  const compact = useMediaQuery("(max-width: 767px)");
  const finePointer = useMediaQuery("(hover: hover) and (pointer: fine)");
  const [gifFailed, setGifFailed] = useState(false);

  return (
    <div
      ref={stageRef}
      className="relative mx-auto aspect-square w-full max-w-[34rem] lg:max-w-none"
    >
      <div
        aria-hidden="true"
        className="absolute inset-[8%] rounded-full bg-primary/10 blur-3xl"
      />

      <div aria-hidden="true" className="absolute inset-0">
        <SceneBoundary>
          <HeroScene
            scrollProgress={scrollProgress}
            reduce={!!reduce}
            compact={compact}
            active={inView}
            pointerEnabled={finePointer && !compact && !reduce}
          />
        </SceneBoundary>
      </div>

      <Float
        delay={0.4}
        className="absolute bottom-[4%] left-[2%] w-[56%] sm:w-[50%]"
      >
        <div
          className={`overflow-hidden rounded-xl border ${BORDER} bg-card/95 shadow-lg shadow-black/[0.06]`}
        >
          <div
            aria-hidden="true"
            className={`flex h-7 items-center gap-1.5 border-b ${BORDER} bg-foreground/[0.03] px-3`}
          >
            <span className="size-1.5 rounded-full bg-foreground/20" />
            <span className="size-1.5 rounded-full bg-foreground/20" />
            <span className="size-1.5 rounded-full bg-foreground/20" />
            <span className="ml-2 truncate text-[10px] text-muted-foreground">
              my-first-project / main
            </span>
          </div>
          <div className="relative aspect-[4/3] bg-muted/20">
            {gifFailed || !src ? (
              <div
                aria-hidden="true"
                className="absolute inset-0 grid place-items-center"
              >
                <Code2 className="size-10 text-primary/70" />
              </div>
            ) : (
              <Image
                src={src}
                alt="Learners building software projects"
                fill
                priority
                unoptimized
                sizes="(min-width: 1024px) 300px, 55vw"
                className="object-cover"
                onError={() => setGifFailed(true)}
              />
            )}
          </div>
        </div>
      </Float>

      {/* Featured category card: link uses the category slug from Firebase. */}
      {spotlightPath && (
        <Float delay={1.2} className="absolute right-[2%] top-[10%]">
          <Link
            href={categoryHref(spotlightPath)}
            className={`flex items-center gap-2.5 rounded-xl border ${BORDER} bg-card/90 p-2.5 backdrop-blur hover:border-primary/40 sm:p-3 ${FOCUS}`}
          >
            <span
              className={`grid size-8 place-items-center rounded-lg sm:size-9 ${accentClass(spotlightPath.accent)}`}
            >
              <CategoryIcon
                name={spotlightPath.icon}
                className="size-4 sm:size-5"
              />
            </span>
            <p className="text-sm">
              <span className="block font-medium">{spotlightPath.label}</span>
              <span className={`hidden text-xs sm:block ${TEXT_MUTED}`}>
                {spotlightPath.courseCount > 0
                  ? `${spotlightPath.courseCount} ${
                      spotlightPath.courseCount === 1 ? "course" : "courses"
                    }`
                  : "Explore courses"}
              </span>
            </p>
          </Link>
        </Float>
      )}

      <Float delay={0.8} className="absolute left-0 top-[12%] hidden lg:block">
        <Terminal reduce={reduce} />
      </Float>

      {featuredCourse?.slug && (
        <Float
          delay={2}
          className="absolute bottom-[8%] right-[2%] hidden sm:block"
        >
          <Link
            href={`${ROUTES.courses}/${featuredCourse.slug}`}
            className={`flex max-w-[14rem] cursor-pointer items-center gap-3 rounded-xl border ${BORDER} bg-card/95 p-3 backdrop-blur hover:border-primary/40 ${FOCUS}`}
          >
            <p className="text-sm">
              <span className={`block text-xs ${TEXT_MUTED}`}>
                Featured course
              </span>
              <span className="line-clamp-2 font-medium">
                {featuredCourse.title}
              </span>
            </p>
            <ArrowUpRight
              className="size-4 shrink-0 text-primary"
              aria-hidden="true"
            />
          </Link>
        </Float>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Sections                                                            */
/* ------------------------------------------------------------------ */
function SectionHeading({ reduce, eyebrow, title, text, id }) {
  return (
    <motion.div {...reveal(reduce)} className="max-w-2xl">
      <p className={LABEL}>{eyebrow}</p>
      <h2
        id={id}
        style={{ fontSize: "clamp(1.75rem, 1.3rem + 1.8vw, 2.75rem)" }}
        className="mt-3 text-balance font-semibold leading-[1.1] tracking-[-0.025em]"
      >
        {title}
      </h2>
      <p className={`mt-4 max-w-xl leading-7 ${TEXT_MUTED}`}>{text}</p>
    </motion.div>
  );
}

// Scrolling strip of technologies learners work with.
function ToolsMarquee({ reduce }) {
  const items = [...marqueeTools, ...marqueeTools];

  return (
    <div
      className={`border-y ${BORDER} bg-muted/20 py-4`}
      role="region"
      aria-label="Technologies you will learn"
    >
      <p className="sr-only">Technologies: {marqueeTools.join(", ")}</p>
      <div
        aria-hidden="true"
        className="overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_12%,black_88%,transparent)]"
      >
        <motion.ul
          className="flex w-max gap-3"
          animate={reduce ? undefined : { x: ["0%", "-50%"] }}
          transition={{ duration: 32, ease: "linear", repeat: Infinity }}
        >
          {items.map((tool, i) => (
            <li
              key={`${tool}-${i}`}
              className={`rounded-full border ${BORDER} bg-card px-4 py-1.5 text-sm font-medium text-foreground/80`}
            >
              {tool}
            </li>
          ))}
        </motion.ul>
      </div>
    </div>
  );
}

function Highlights({ reduce }) {
  return (
    <div className={`border-t ${BORDER} py-16 sm:py-24`}>
      <Container>
        <SectionHeading
          reduce={reduce}
          eyebrow="Why Apni University"
          title="A practical path from curiosity to capability"
          text="Hands-on lessons, real feedback and a clear sequence, all in one place."
        />

        <ul className="mt-10 grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-4">
          {highlights.map(({ icon: Icon, title, text }, index) => (
            <TiltCard
              key={title}
              reduce={reduce}
              delay={index * 0.07}
              className={`group h-full rounded-2xl border ${BORDER} bg-card p-5 transition-colors duration-300 hover:border-primary/40 motion-reduce:transition-none`}
            >
              <span
                style={reduce ? undefined : { transform: "translateZ(34px)" }}
                className="grid size-11 place-items-center rounded-xl bg-primary/10 text-primary transition-colors duration-200 group-hover:bg-primary group-hover:text-primary-foreground motion-reduce:transition-none"
              >
                <Icon className="size-5" aria-hidden="true" />
              </span>
              <h3 className="mt-4 text-base font-semibold tracking-tight">
                {title}
              </h3>
              <p className={`mt-1.5 text-sm leading-6 ${TEXT_MUTED}`}>{text}</p>
            </TiltCard>
          ))}
        </ul>
      </Container>
    </div>
  );
}

// One card per category (from Firebase), each linking to /courses?category=<slug>.
function Outcomes({ reduce, paths }) {
  return (
    <div className={`border-t ${BORDER} bg-muted/20 py-16 sm:py-24`}>
      <Container>
        <SectionHeading
          reduce={reduce}
          eyebrow="Your portfolio"
          title="Finish with projects you can open and share"
          text="Every path ends with a working project, not just a certificate. Pick the one you want to be able to show."
        />

        <ul className="mt-10 grid gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
          {paths.map((path, index) => {
            const heading = path.build || path.tagline || path.label;

            return (
              <motion.li
                key={path.id}
                {...reveal(reduce, index * 0.06)}
                className={index === 0 ? "lg:col-span-2" : ""}
              >
                <Link
                  href={categoryHref(path)}
                  className={`group flex h-full flex-col justify-between gap-6 rounded-2xl border ${BORDER} bg-card p-6 transition-colors duration-200 hover:border-primary/50 motion-reduce:transition-none ${FOCUS}`}
                >
                  <div>
                    <div className="flex items-center gap-2.5 text-sm font-medium">
                      <span
                        className={`grid size-8 place-items-center rounded-lg ${accentClass(path.accent)}`}
                      >
                        <CategoryIcon name={path.icon} className="size-4" />
                      </span>
                      <span className="text-primary">{path.label}</span>
                      {path.courseCount > 0 && (
                        <span className={`text-xs font-normal ${TEXT_MUTED}`}>
                          {path.courseCount}{" "}
                          {path.courseCount === 1 ? "course" : "courses"}
                        </span>
                      )}
                    </div>
                    <h3 className="mt-3 text-lg font-semibold leading-snug tracking-tight">
                      {heading}
                    </h3>
                    {path.why && (
                      <p className={`mt-2 text-sm leading-6 ${TEXT_MUTED}`}>
                        {path.why}
                      </p>
                    )}
                  </div>
                  <div className="flex flex-wrap items-end justify-between gap-3">
                    {path.tools.length > 0 ? (
                      <ul className="flex flex-wrap gap-1.5">
                        {path.tools.map((tool) => (
                          <li
                            key={tool}
                            className={`rounded-md border ${BORDER} px-2 py-1 text-xs text-foreground/75`}
                          >
                            {tool}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <span />
                    )}
                    <span className="inline-flex items-center gap-1 text-sm font-medium text-primary">
                      View courses
                      <ArrowUpRight
                        className="size-4 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 motion-reduce:transition-none"
                        aria-hidden="true"
                      />
                    </span>
                  </div>
                </Link>
              </motion.li>
            );
          })}
        </ul>
      </Container>
    </div>
  );
}

function JourneyStep({ step, index, progress, reduce }) {
  const Icon = step.icon;
  const start = index / steps.length;
  const emphasis = useTransform(
    progress,
    [start, start + 0.5 / steps.length],
    [0.45, 1],
  );

  return (
    <li className="relative pl-14 md:pl-0 md:pt-14">
      <motion.span
        whileHover={reduce ? undefined : { rotateY: 180, scale: 1.1 }}
        transition={{ duration: 0.5 }}
        style={
          reduce ? undefined : { opacity: emphasis, transformPerspective: 400 }
        }
        className="absolute left-0 top-0 grid size-10 cursor-pointer place-items-center rounded-full border border-primary/50 bg-muted/20 text-primary"
      >
        <Icon className="size-5" aria-hidden="true" />
      </motion.span>
      <motion.div style={reduce ? undefined : { opacity: emphasis }}>
        <h3 className="font-semibold tracking-tight">
          <span className="sr-only">Step {index + 1}: </span>
          <span
            aria-hidden="true"
            className="mr-2 font-mono text-amber-700 dark:text-amber-400"
          >
            0{index + 1}
          </span>
          {step.title}
        </h3>
        <p className={`mt-1.5 max-w-sm text-sm leading-6 ${TEXT_MUTED}`}>
          {step.text}
        </p>
      </motion.div>
    </li>
  );
}

function Journey({ reduce }) {
  const ref = useRef(null);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 80%", "end 60%"],
  });
  const progress = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 24,
    mass: 0.4,
  });

  return (
    <div className={`border-t ${BORDER} py-16 sm:py-24`}>
      <Container>
        <SectionHeading
          reduce={reduce}
          eyebrow="How it works"
          title="Three steps, one clear direction"
          text="Start with a path, build something real, then show what you can do."
        />

        <ol
          ref={ref}
          className="relative mt-12 grid gap-10 md:grid-cols-3 md:gap-8"
        >
          <span
            aria-hidden="true"
            className="absolute bottom-5 left-5 top-5 w-px bg-foreground/10 md:hidden"
          >
            <motion.span
              style={reduce ? undefined : { scaleY: progress }}
              className="block h-full w-full origin-top bg-primary"
            />
          </span>
          <span
            aria-hidden="true"
            className="absolute left-5 right-5 top-5 hidden h-px bg-foreground/10 md:block"
          >
            <motion.span
              style={reduce ? undefined : { scaleX: progress }}
              className="block h-full w-full origin-left bg-primary"
            />
          </span>

          {steps.map((step, index) => (
            <JourneyStep
              key={step.title}
              step={step}
              index={index}
              progress={progress}
              reduce={reduce}
            />
          ))}
        </ol>
      </Container>
    </div>
  );
}

function Audiences({ reduce, paths }) {
  // Prefer the category with the wanted KEY (web / ai / cloud); otherwise use
  // the path at that position. Firebase categories get their key automatically,
  // so this works even when the real slug is e.g. "web-development".
  const items = audienceDefs.map((def, index) => {
    const target =
      paths.find((p) => p.key === def.prefer || p.slug === def.prefer) ??
      paths[index] ??
      null;

    return {
      ...def,
      href: target ? categoryHref(target) : ROUTES.courses,
      cta: target ? `${def.verb} ${target.label}` : "Browse courses",
    };
  });

  return (
    <div className={`border-t ${BORDER} bg-muted/20 py-16 sm:py-24`}>
      <Container>
        <SectionHeading
          reduce={reduce}
          eyebrow="Who it's for"
          title="Wherever you are starting, there is a way in"
          text="Choose the route that matches your experience today. You can switch paths any time."
        />

        <ul className="mt-10 grid gap-3 md:grid-cols-3 sm:gap-4">
          {items.map(({ icon: Icon, title, text, cta, href }, index) => (
            <TiltCard
              key={title}
              reduce={reduce}
              delay={index * 0.07}
              className={`h-full rounded-2xl border ${BORDER} bg-card p-6`}
            >
              <Icon className="size-6 text-primary" aria-hidden="true" />
              <h3 className="mt-4 text-lg font-semibold tracking-tight">
                {title}
              </h3>
              <p className={`mt-2 text-sm leading-6 ${TEXT_MUTED}`}>{text}</p>
              <Link
                href={href}
                className={`mt-5 inline-flex min-h-10 items-center gap-1 rounded-sm text-sm font-medium text-primary hover:underline ${FOCUS}`}
              >
                {cta}
                <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
            </TiltCard>
          ))}
        </ul>
      </Container>
    </div>
  );
}

// Optional: renders only if real testimonials are passed in as a prop.
function Testimonials({ reduce, items }) {
  if (!items?.length) return null;

  return (
    <div className={`border-t ${BORDER} py-16 sm:py-24`}>
      <Container>
        <SectionHeading
          reduce={reduce}
          eyebrow="Learner stories"
          title="What learners say after building with us"
          text="Real feedback from people who finished a path."
        />
        <ul className="mt-10 grid gap-3 md:grid-cols-3 sm:gap-4">
          {items.map((item, index) => (
            <motion.li
              key={`${item.name}-${index}`}
              {...reveal(reduce, index * 0.07)}
              className={`flex h-full flex-col justify-between gap-5 rounded-2xl border ${BORDER} bg-card p-6`}
            >
              <blockquote className="text-sm leading-7 text-foreground/90">
                {item.quote}
              </blockquote>
              <figcaption className="text-sm">
                <span className="block font-medium">{item.name}</span>
                {item.role && (
                  <span className={`block text-xs ${TEXT_MUTED}`}>
                    {item.role}
                  </span>
                )}
              </figcaption>
            </motion.li>
          ))}
        </ul>
      </Container>
    </div>
  );
}

function Faq({ reduce, items }) {
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <div className={`border-t ${BORDER} bg-muted/20 py-16 sm:py-24`}>
      <Container>
        <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
          <SectionHeading
            reduce={reduce}
            eyebrow="Questions"
            title="Before you start"
            text="Short answers to what learners ask most. Still unsure? Talk to us."
          />

          <motion.div {...reveal(reduce, 0.1)}>
            <ul className={`divide-y divide-border/80 border-y ${BORDER}`}>
              {items.map((item, index) => {
                const open = openIndex === index;
                const panelId = `faq-panel-${index}`;

                return (
                  <li key={item.q}>
                    <h3>
                      <button
                        type="button"
                        aria-expanded={open}
                        aria-controls={panelId}
                        onClick={() => setOpenIndex(open ? -1 : index)}
                        className={`flex min-h-14 w-full cursor-pointer items-center justify-between gap-4 py-4 text-left text-base font-medium ${FOCUS}`}
                      >
                        {item.q}
                        <ChevronDown
                          className={`size-5 shrink-0 text-primary transition-transform duration-200 motion-reduce:transition-none ${
                            open ? "rotate-180" : ""
                          }`}
                          aria-hidden="true"
                        />
                      </button>
                    </h3>
                    <AnimatePresence initial={false}>
                      {open && (
                        <motion.div
                          id={panelId}
                          role="region"
                          initial={reduce ? false : { height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={reduce ? undefined : { height: 0, opacity: 0 }}
                          transition={{ duration: 0.25, ease: EASE }}
                          className="overflow-hidden"
                        >
                          <p
                            className={`max-w-xl pb-5 text-sm leading-7 ${TEXT_MUTED}`}
                          >
                            {item.a}
                          </p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </li>
                );
              })}
            </ul>

            <Link
              href={ROUTES.contact}
              className={`mt-6 inline-flex min-h-10 items-center gap-1 rounded-sm text-sm font-medium text-primary hover:underline ${FOCUS}`}
            >
              Ask us a question
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          </motion.div>
        </div>
      </Container>
    </div>
  );
}

// Closing call to action; the card straightens up as you scroll to it.
function FinalCta({ reduce, user, loading }) {
  const ctaRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ctaRef,
    offset: ["start 95%", "start 60%"],
  });
  const rotate = useTransform(scrollYProgress, [0, 1], [18, 0]);
  const scale = useTransform(scrollYProgress, [0, 1], [0.94, 1]);

  return (
    <div className={`border-t ${BORDER} py-16 sm:py-24`}>
      <Container>
        <div className="[perspective:1000px]">
          <motion.div
            ref={ctaRef}
            style={
              reduce
                ? undefined
                : { rotateX: rotate, scale, transformOrigin: "50% 100%" }
            }
            className={`relative overflow-hidden rounded-3xl border ${BORDER} bg-card p-8 sm:p-12`}
          >
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -right-24 -top-24 size-72 rounded-full bg-primary/15 blur-3xl"
            />
            <div className="relative flex flex-col items-start justify-between gap-8 lg:flex-row lg:items-center">
              <div className="max-w-xl">
                <h2
                  style={{
                    fontSize: "clamp(1.75rem, 1.3rem + 1.8vw, 2.75rem)",
                  }}
                  className="text-balance font-semibold leading-[1.1] tracking-[-0.025em]"
                >
                  {user
                    ? `Welcome back, ${getFirstName(user)}.`
                    : "Your first project starts today."}
                </h2>
                <p className={`mt-4 leading-7 ${TEXT_MUTED}`}>
                  {user
                    ? "Head to your dashboard and continue where you left off."
                    : "Create an account, pick a path and build something you can show by the end of your first module."}
                </p>
              </div>

              <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
                <AuthCta
                  user={user}
                  loading={loading}
                  className="w-full shadow-md shadow-primary/25 sm:w-auto"
                />
                <Link
                  href={ROUTES.courses}
                  className={`inline-flex min-h-12 items-center justify-center gap-2 rounded-lg border ${BORDER} bg-foreground/[0.03] px-6 text-sm font-semibold transition-colors duration-200 hover:border-primary/50 motion-reduce:transition-none ${FOCUS}`}
                >
                  Browse all courses
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </Container>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Announcement + featured courses (real data only)                    */
/* ------------------------------------------------------------------ */
// settings/landing -> announcement { text, href }
function AnnouncementBar({ announcement }) {
  if (!announcement?.text) return null;

  return (
    <div className={`border-b ${BORDER} bg-primary/5`}>
      <Container className="flex min-h-10 flex-wrap items-center justify-center gap-x-2 gap-y-1 py-2 text-center text-sm">
        <Megaphone
          className="size-4 shrink-0 text-primary"
          aria-hidden="true"
        />
        <p className="font-medium">{announcement.text}</p>
        {announcement.href && (
          <Link
            href={announcement.href}
            className={`inline-flex items-center gap-1 rounded-sm font-medium text-primary hover:underline ${FOCUS}`}
          >
            Learn more
            <ArrowRight className="size-3.5" aria-hidden="true" />
          </Link>
        )}
      </Container>
    </div>
  );
}

const formatPrice = (course) => {
  if (course.isFree) return "Free";
  if (course.price == null) return "";
  const amount = Number(course.price).toLocaleString();
  return course.currency ? `${course.currency} ${amount}` : amount;
};

// Latest published courses from Firestore; hidden when there are none.
function FeaturedCourses({ reduce, courses, paths }) {
  const items = (Array.isArray(courses) ? courses : []).slice(0, 6);
  if (!items.length) return null;

  return (
    <div className={`border-t ${BORDER} py-16 sm:py-24`}>
      <Container>
        <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
          <SectionHeading
            reduce={reduce}
            eyebrow="Latest courses"
            title="Courses you can start today"
            text="Fresh from our catalogue. Open any course to see what it covers."
          />
          <Link
            href={ROUTES.courses}
            className={`inline-flex min-h-10 shrink-0 items-center gap-1 rounded-sm text-sm font-medium text-primary hover:underline ${FOCUS}`}
          >
            View all courses
            <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </div>

        <ul className="mt-10 grid gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
          {items.map((course, index) => {
            const category = paths.find((p) => matchesCategory(course, p));
            const price = formatPrice(course);
            const meta = [
              course.level,
              course.duration,
              course.lessons != null ? `${course.lessons} lessons` : "",
            ].filter(Boolean);

            return (
              <motion.li key={course.id} {...reveal(reduce, index * 0.06)}>
                <Link
                  href={`${ROUTES.courses}/${course.slug}`}
                  className={`group block h-full rounded-xl ${FOCUS}`}
                >
                  <Card className="h-full gap-0 overflow-hidden py-0 transition-all group-hover:-translate-y-0.5 group-hover:shadow-md motion-reduce:transition-none">
                    <div className="relative aspect-video bg-muted/40">
                      {course.thumbnail ? (
                        <Image
                          src={course.thumbnail}
                          alt=""
                          fill
                          unoptimized
                          sizes="(min-width: 1024px) 380px, (min-width: 640px) 50vw, 100vw"
                          className="object-cover"
                        />
                      ) : (
                        <div
                          aria-hidden="true"
                          className="absolute inset-0 grid place-items-center"
                        >
                          <BookOpen className="size-8 text-primary/60" />
                        </div>
                      )}
                    </div>
                    <div className="flex flex-1 flex-col gap-2 p-5">
                      {category && (
                        <span className="text-xs font-medium text-primary">
                          {category.label}
                        </span>
                      )}
                      <h3 className="line-clamp-2 text-base font-semibold leading-snug tracking-tight">
                        {course.title}
                      </h3>
                      {course.instructor && (
                        <p className={`text-sm ${TEXT_MUTED}`}>
                          by {course.instructor}
                        </p>
                      )}
                      {meta.length > 0 && (
                        <p className={`text-xs ${TEXT_MUTED}`}>
                          {meta.join(" · ")}
                        </p>
                      )}
                      <div className="mt-auto flex items-center justify-between pt-3 text-sm">
                        <span className="inline-flex items-center gap-1">
                          {course.rating != null && (
                            <>
                              <Star
                                className="size-4 fill-amber-400 text-amber-400"
                                aria-hidden="true"
                              />
                              <span className="font-medium">
                                {course.rating.toFixed(1)}
                              </span>
                            </>
                          )}
                        </span>
                        {price && (
                          <span className="font-semibold">{price}</span>
                        )}
                      </div>
                    </div>
                  </Card>
                </Link>
              </motion.li>
            );
          })}
        </ul>
      </Container>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Hero + page                                                         */
/* ------------------------------------------------------------------ */
// categories / courses / faqs / testimonials / stats / announcement come from useLandingData().
export function HeroSection({
  categories = FALLBACK_CATEGORIES,
  courses = [],
  faqs,
  stats = [],
  featuredCourse = null,
  announcement = null,
  gifSrc,
  testimonials = [],
}) {
  const reduce = useReducedMotion();
  const heroRef = useRef(null);

  const { user, loading } = useCurrentUser();

  const safeStats = Array.isArray(stats) ? stats : [];

  // Firebase categories -> paths (icon name + slug-based links).
  const paths = useMemo(() => {
    const list =
      Array.isArray(categories) && categories.length
        ? categories
        : FALLBACK_CATEGORIES;
    return list;
  }, [categories]);

  const spotlightPath = paths.find((p) => p.featured) ?? paths[0];
  const faqItems = Array.isArray(faqs) && faqs.length ? faqs : defaultFaqs;

  // Source priority: prop > environment variable > local media config.
  const src =
    gifSrc || process.env.NEXT_PUBLIC_HERO_GIF_URL || mediaConfig.heroGif;

  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  const stageY = useTransform(scrollYProgress, [0, 1], [0, 70]);
  const glowY = useTransform(scrollYProgress, [0, 1], [0, -60]);

  const mouseX = useMotionValue(-600);
  const mouseY = useMotionValue(-600);
  const spotlight = useMotionTemplate`radial-gradient(480px circle at ${mouseX}px ${mouseY}px, color-mix(in oklab, var(--primary) 8%, transparent), transparent 70%)`;

  const handlePointerMove = (event) => {
    if (reduce || event.pointerType !== "mouse") return;

    const rect = event.currentTarget.getBoundingClientRect();
    mouseX.set(event.clientX - rect.left);
    mouseY.set(event.clientY - rect.top);
  };

  const enter = (delay = 0) => {
    if (reduce) return {};

    return {
      initial: { opacity: 0, y: 14 },
      animate: { opacity: 1, y: 0 },
      transition: { duration: 0.6, delay, ease: EASE },
    };
  };

  const line = (delay = 0) => {
    if (reduce) return {};

    return {
      initial: { y: "110%" },
      animate: { y: 0 },
      transition: { duration: 0.85, delay, ease: EASE },
    };
  };

  return (
    <section
      className="relative isolate max-w-full overflow-x-clip bg-background text-foreground"
      aria-labelledby="hero-title"
    >
      <ScrollProgress reduce={reduce} />
      <StickyCta user={user} loading={loading} />
      <AnnouncementBar announcement={announcement} />

      <div ref={heroRef} className="relative" onPointerMove={handlePointerMove}>
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -z-10 opacity-40 [background-image:radial-gradient(var(--border)_1px,transparent_1px)] [background-size:28px_28px] [mask-image:linear-gradient(to_bottom,black_50%,transparent)]"
        />
        <motion.div
          aria-hidden="true"
          style={{ background: spotlight }}
          className="pointer-events-none absolute inset-0 -z-10"
        />
        <motion.div
          aria-hidden="true"
          style={reduce ? undefined : { y: glowY }}
          className="pointer-events-none absolute -left-48 -top-40 -z-10 size-[30rem] rounded-full bg-primary/10 blur-3xl"
        />
        <motion.div
          aria-hidden="true"
          style={reduce ? undefined : { y: glowY }}
          className="pointer-events-none absolute -bottom-32 -right-40 -z-10 size-[26rem] rounded-full bg-amber-400/10 blur-3xl"
        />

        <Container className="grid grid-cols-1 items-center gap-12 py-14 sm:py-16 lg:grid-cols-[1.05fr_0.95fr] lg:gap-10 lg:py-24">
          <div className="min-w-0">
            <motion.p {...enter(0)} className={`mb-6 ${LABEL}`}>
              {user
                ? `Welcome back, ${getFirstName(user)}`
                : "Technology-first learning at Apni University"}
            </motion.p>

            <h1
              id="hero-title"
              style={{ fontSize: "clamp(2.5rem, 1.5rem + 4.4vw, 4.75rem)" }}
              className="max-w-3xl font-semibold leading-[1.02] tracking-[-0.035em]"
            >
              <span className="block overflow-hidden pb-[0.1em]">
                <motion.span className="block" {...line(0.05)}>
                  Build the Skills
                </motion.span>
              </span>
              <span className="block overflow-hidden pb-[0.1em]">
                <motion.span className="block" {...line(0.16)}>
                  That Shape <span className="text-primary">Tomorrow</span>
                  <span className="text-amber-500">.</span>
                </motion.span>
              </span>
            </h1>

            <motion.div {...enter(0.3)}>
              <TypeRotator reduce={reduce} paths={paths} />
            </motion.div>

            <motion.div
              {...enter(0.38)}
              className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap"
            >
              <AuthCta
                user={user}
                loading={loading}
                className="shadow-md shadow-primary/25"
              />
              <Link
                href="#learning-paths"
                className={`inline-flex min-h-12 cursor-pointer items-center justify-center gap-2 rounded-lg border ${BORDER} bg-foreground/[0.03] px-6 text-sm font-semibold text-foreground transition-colors duration-200 hover:border-primary/50 motion-reduce:transition-none ${FOCUS}`}
              >
                Explore Learning Paths
                <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
              <Link
                href={ROUTES.courses}
                className={`inline-flex min-h-12 cursor-pointer items-center justify-center rounded-lg border ${BORDER} bg-foreground/[0.03] px-6 text-sm font-semibold text-foreground transition-colors duration-200 hover:border-primary/50 motion-reduce:transition-none ${FOCUS}`}
              >
                Explore Courses
              </Link>
            </motion.div>

            <motion.div {...enter(0.44)} className="mt-5">
              <LoginLink user={user} loading={loading} />
            </motion.div>

            <motion.ul
              {...enter(0.48)}
              className={`mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm ${TEXT_MUTED}`}
            >
              {perks.map((perk) => (
                <li key={perk} className="flex items-center gap-1.5">
                  <Check className="size-4 text-primary" aria-hidden="true" />
                  {perk}
                </li>
              ))}
            </motion.ul>

            <motion.div {...enter(0.52)}>
              <PathSwitcher reduce={reduce} paths={paths} />
            </motion.div>

            {safeStats.length > 0 && (
              <motion.dl
                {...enter(0.56)}
                className="mt-8 grid grid-cols-3 gap-2.5 sm:gap-3"
              >
                {safeStats.map((stat) => (
                  <Tilt3D
                    key={stat.label}
                    reduce={reduce}
                    max={8}
                    className={`rounded-xl border ${BORDER} bg-foreground/[0.03] p-3 sm:p-4`}
                  >
                    <dt className={`text-xs sm:text-sm ${TEXT_MUTED}`}>
                      {stat.label}
                    </dt>
                    <dd className="mt-1 text-xl font-semibold tracking-tight sm:text-2xl">
                      <CountUp value={stat.value} reduce={reduce} />
                    </dd>
                  </Tilt3D>
                ))}
              </motion.dl>
            )}
          </div>

          <motion.div
            style={reduce ? undefined : { y: stageY }}
            className="min-w-0"
          >
            <Stage
              reduce={reduce}
              src={src}
              featuredCourse={featuredCourse}
              spotlightPath={spotlightPath}
              scrollProgress={scrollYProgress}
            />
          </motion.div>
        </Container>
      </div>

      <ToolsMarquee reduce={reduce} />
      <Highlights reduce={reduce} />
      <Outcomes reduce={reduce} paths={paths} />
      <FeaturedCourses reduce={reduce} courses={courses} paths={paths} />
      <Journey reduce={reduce} />
      <Audiences reduce={reduce} paths={paths} />
      <Testimonials reduce={reduce} items={testimonials} />
      <Faq reduce={reduce} items={faqItems} />
      <FinalCta reduce={reduce} user={user} loading={loading} />
    </section>
  );
}
