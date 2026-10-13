"use client";

import { Component, useEffect, useRef, useState } from "react";
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
  BriefcaseBusiness,
  Check,
  Cloud,
  Code2,
  Cpu,
  Globe2,
  Layers3,
  LayoutDashboard,
  Server,
  ShieldCheck,
  Target,
  TrendingUp,
  UsersRound,
} from "lucide-react";
import Container from "@/components/layout/Container";
import { mediaConfig } from "@/config/media";
import { formatCompact } from "@/lib/utils/format";

// Browser-only WebGL scene: never rendered on the server.
const HeroScene = dynamic(() => import("./HeroScene"), {
  ssr: false,
  loading: () => null,
});

const EASE = [0.22, 1, 0.36, 1];

// Design tokens (kept local so the redesign does not touch global CSS).
const BORDER = "border-border/80";
const TEXT_MUTED = "text-muted-foreground";
const FOCUS =
  "outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background";
const LABEL =
  "font-mono text-[11px] font-medium uppercase tracking-[0.18em] text-primary";

// Apne asal role names ke hisaab se adjust karein
const DASHBOARD_BY_ROLE = {
  student: "/student",
  instructor: "/instructor",
  admin: "/admin",
};

const getDashboardHref = (user) => DASHBOARD_BY_ROLE[user?.role] ?? "/student";
const getFirstName = (user) =>
  (user?.name ?? "").trim().split(/\s+/)[0] || "learner";

const paths = [
  {
    id: "web",
    label: "Full-Stack Web",
    icon: Globe2,
    study:
      "React, Next.js, APIs and databases, from the interface to deployment.",
    why: "Most digital products, from SaaS dashboards to marketplaces, start as web applications.",
    build: "A deployed full-stack app with authentication and real data.",
    background: "Basic HTML and JavaScript help, but beginners can start here.",
    tools: ["React", "Next.js", "Node.js", "Tailwind"],
  },
  {
    id: "ai",
    label: "AI & Automation",
    icon: Cpu,
    study:
      "Generative AI, LLM-powered apps, AI agents, workflow automation and machine learning fundamentals.",
    why: "AI features and automation are becoming a standard layer of modern software.",
    build: "An LLM-powered app or an agent that automates a real workflow.",
    background: "Some Python or JavaScript is useful.",
    tools: ["Python", "TensorFlow", "LangChain", "Prompting"],
  },
  {
    id: "cloud",
    label: "Cloud",
    icon: Cloud,
    study:
      "Cloud computing and serverless systems: functions, storage, managed databases and APIs.",
    why: "It lets small teams ship and scale without running their own servers.",
    build: "A serverless backend with storage and a public API.",
    background: "Basic programming knowledge is enough to begin.",
    tools: ["Firebase", "Serverless", "Storage", "APIs"],
  },
  {
    id: "security",
    label: "Cybersecurity",
    icon: ShieldCheck,
    study:
      "Cybersecurity and digital privacy: OWASP risks, secure coding, networking and Linux.",
    why: "Every application that handles user data needs to be defended.",
    build: "An application where common vulnerabilities are found and fixed.",
    background: "Comfort with the command line and web basics.",
    tools: ["OWASP", "Linux", "Networking", "Pen testing"],
  },
  {
    id: "devops",
    label: "DevOps",
    icon: Server,
    study:
      "DevOps and platform engineering: Git, CI/CD, containers, testing and infrastructure as code.",
    why: "Reliable testing and releases keep teams shipping without breaking things.",
    build: "A CI/CD pipeline that tests and deploys a containerised app.",
    background: "Git and basic Linux skills help.",
    tools: ["Docker", "Kubernetes", "CI/CD", "Git"],
  },
];

// Hero mein har 4 second baad type hone wala content + uska button
const rotating = [
  {
    text: "Build full-stack apps with React, Next.js and real databases.",
    label: "Full-Stack Web",
    href: "/courses?category=web",
  },
  {
    text: "Create LLM-powered apps and agents that automate real work.",
    label: "AI & Automation",
    href: "/courses?category=ai",
  },
  {
    text: "Ship serverless backends with storage and public APIs.",
    label: "Cloud",
    href: "/courses?category=cloud",
  },
  {
    text: "Find and fix real vulnerabilities in live applications.",
    label: "Cybersecurity",
    href: "/courses?category=security",
  },
  {
    text: "Automate testing and deploys with CI/CD and containers.",
    label: "DevOps",
    href: "/courses?category=devops",
  },
];

const terminalLines = [
  "$ npx create-next-app my-project",
  "$ pip install langchain",
  "$ docker compose up -d",
  "✓ Your project is live",
];

const perks = ["Project-based", "Beginner friendly", "Learn at your pace"];

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
    text: "Choose web, AI, cloud, security or DevOps and get a clear roadmap.",
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
// loading = true: abhi check ho raha hai | user = null: logged out | user = object: logged in
function useCurrentUser() {
  const [state, setState] = useState({ user: null, loading: true });

  useEffect(() => {
    let cancelled = false;
    const controller = new AbortController();
    // 4 second mein jawab na aaye to logged-out maan lo
    const timeoutId = setTimeout(() => controller.abort(), 4000);

    fetch("/api/auth/me", {
      credentials: "same-origin",
      cache: "no-store",
      signal: controller.signal,
    })
      .then(async (res) => {
        if (!res.ok) return null;
        const data = await res.json();
        return (
          data?.user ?? (data?.uid || data?.id || data?.email ? data : null)
        );
      })
      .catch(() => null)
      .then((user) => {
        clearTimeout(timeoutId);
        if (!cancelled) setState({ user, loading: false });
      });

    return () => {
      cancelled = true;
      clearTimeout(timeoutId);
      controller.abort();
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
/* Auth CTA: login ke hisaab se button badalta hai                      */
/* ------------------------------------------------------------------ */
function AuthCta({ user, loading = false, className = "" }) {
  const base = `inline-flex min-h-12 cursor-pointer items-center justify-center gap-2 rounded-lg bg-primary px-6 text-sm font-semibold text-primary-foreground transition-transform duration-200 hover:-translate-y-0.5 motion-reduce:transform-none motion-reduce:transition-none ${FOCUS} ${className}`;

  // Auth resolve hone tak placeholder, taake button flicker na kare
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
    <Link href="/courses" className={base}>
      Explore More Courses
      <ArrowRight className="size-4" aria-hidden="true" />
    </Link>
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
/* Type rotator: har 4 second baad naya text type hota hai + button     */
/* ------------------------------------------------------------------ */
function TypeRotator({ reduce }) {
  const ref = useRef(null);
  const inView = useInView(ref);
  const [index, setIndex] = useState(0);
  const item = rotating[index];
  const [length, setLength] = useState(reduce ? item.text.length : 0);

  // Har 4 second baad agla content
  useEffect(() => {
    if (reduce || !inView) return;

    const intervalId = setInterval(() => {
      setIndex((current) => (current + 1) % rotating.length);
      setLength(0);
    }, 4000);

    return () => clearInterval(intervalId);
  }, [reduce, inView]);

  // Typing: ek ek character
  useEffect(() => {
    if (reduce || !inView || length >= item.text.length) return;

    const timeoutId = setTimeout(() => setLength((l) => l + 1), 35);
    return () => clearTimeout(timeoutId);
  }, [reduce, inView, length, item.text.length]);

  const visibleLength = reduce ? item.text.length : length;

  return (
    <div ref={ref} className="mt-6 max-w-xl">
      {/* Screen readers ko poora text milta hai, typing nahi */}
      <p className="sr-only">{item.text}</p>

      {/* min-h se layout shift nahi hota */}
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
function PathSwitcher({ reduce }) {
  const [activeId, setActiveId] = useState(paths[0].id);
  const [autoRotate, setAutoRotate] = useState(true);
  const activePath = paths.find((path) => path.id === activeId);

  useEffect(() => {
    if (!autoRotate || reduce) return;

    const intervalId = setInterval(() => {
      setActiveId((currentId) => {
        const currentIndex = paths.findIndex((path) => path.id === currentId);
        return paths[(currentIndex + 1) % paths.length].id;
      });
    }, 6000);

    return () => clearInterval(intervalId);
  }, [autoRotate, reduce]);

  const details = [
    ["Study", activePath.study],
    ["Why it matters", activePath.why],
    ["You can build", activePath.build],
    ["Helpful background", activePath.background],
  ];

  return (
    <div id="learning-paths" className="mt-10 scroll-mt-24">
      <div className="mb-3 flex items-center justify-between gap-3">
        <p className={LABEL}>Learning paths</p>
        <span className={`hidden text-xs sm:block ${TEXT_MUTED}`}>
          Pick one to see what it covers
        </span>
      </div>

      <ul
        className="flex max-w-full snap-x gap-2 overflow-x-auto pb-2 [scrollbar-width:none] sm:flex-wrap sm:overflow-visible [&::-webkit-scrollbar]:hidden"
        aria-label="Learning paths"
      >
        {paths.map((path) => {
          const Icon = path.icon;
          const isActive = path.id === activeId;

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
                <Icon className="size-4" aria-hidden="true" />
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
              key={activeId}
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
                    <dt className="font-mono text-[10px] uppercase tracking-[0.16em] text-primary/80">
                      {term}
                    </dt>
                    <dd className="mt-1 text-sm leading-6 text-foreground/90">
                      {description}
                    </dd>
                  </div>
                ))}
              </dl>

              <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
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
                <Link
                  href={`/courses?category=${activePath.id}`}
                  className={`inline-flex min-h-9 cursor-pointer items-center gap-1 rounded-sm text-sm font-medium text-primary hover:underline ${FOCUS}`}
                >
                  Browse courses
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
function Stage({ reduce, src, featuredCourse, scrollProgress }) {
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
      {/* CSS fallback / ambient light behind the canvas keeps layout stable. */}
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
            {gifFailed ? (
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

      <Float delay={1.2} className="absolute right-[2%] top-[10%]">
        <div
          className={`flex items-center gap-2.5 rounded-xl border ${BORDER} bg-card/90 p-2.5 backdrop-blur sm:p-3`}
        >
          <span className="grid size-8 place-items-center rounded-lg bg-amber-400/15 text-amber-700 dark:text-amber-400 sm:size-9">
            <Cpu className="size-4 sm:size-5" aria-hidden="true" />
          </span>
          <p className="text-sm">
            <span className="block font-medium">AI learning paths</span>
            <span className={`hidden text-xs sm:block ${TEXT_MUTED}`}>
              Agents &amp; automation
            </span>
          </p>
        </div>
      </Float>

      <Float delay={0.8} className="absolute left-0 top-[12%] hidden lg:block">
        <Terminal reduce={reduce} />
      </Float>

      {featuredCourse && (
        <Float
          delay={2}
          className="absolute bottom-[8%] right-[2%] hidden sm:block"
        >
          <Link
            href={`/courses/${featuredCourse.slug}`}
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
function SectionHeading({ reduce, eyebrow, title, text }) {
  return (
    <motion.div {...reveal(reduce)} className="max-w-2xl">
      <p className={LABEL}>{eyebrow}</p>
      <h2
        style={{ fontSize: "clamp(1.75rem, 1.3rem + 1.8vw, 2.75rem)" }}
        className="mt-3 text-balance font-semibold leading-[1.1] tracking-[-0.025em]"
      >
        {title}
      </h2>
      <p className={`mt-4 max-w-xl leading-7 ${TEXT_MUTED}`}>{text}</p>
    </motion.div>
  );
}

function Highlights({ reduce }) {
  return (
    <div className={`border-t ${BORDER} bg-muted/20 py-16 sm:py-24`}>
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
              className={`group rounded-2xl border ${BORDER} bg-card p-5 transition-colors duration-300 hover:border-primary/40 motion-reduce:transition-none`}
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

function Journey({ reduce, user, loading }) {
  const ref = useRef(null);
  const ctaRef = useRef(null);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 80%", "end 60%"],
  });
  const progress = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 24,
    mass: 0.4,
  });

  // CTA card scroll karne par neeche se seedha hota hai (3D)
  const { scrollYProgress: ctaProgress } = useScroll({
    target: ctaRef,
    offset: ["start 95%", "start 60%"],
  });
  const ctaRotate = useTransform(ctaProgress, [0, 1], [18, 0]);
  const ctaScale = useTransform(ctaProgress, [0, 1], [0.94, 1]);

  return (
    <div className={`border-t ${BORDER} bg-muted/20 py-16 sm:py-24`}>
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

        <div className="mt-14 [perspective:1000px]">
          <motion.div
            ref={ctaRef}
            style={
              reduce
                ? undefined
                : {
                    rotateX: ctaRotate,
                    scale: ctaScale,
                    transformOrigin: "50% 100%",
                  }
            }
            className={`flex flex-col items-center justify-between gap-5 rounded-2xl border ${BORDER} bg-card p-6 text-center sm:flex-row sm:text-left sm:p-8`}
          >
            <div>
              <p className="text-xl font-semibold tracking-tight">
                {user
                  ? `Welcome back, ${getFirstName(user)}!`
                  : "Ready to start building?"}
              </p>
              <p className={`mt-1 text-sm ${TEXT_MUTED}`}>
                Head to your dashboard and continue where you left off.
              </p>
            </div>
            <AuthCta
              user={user}
              loading={loading}
              className="w-full sm:w-auto"
            />
          </motion.div>
        </div>
      </Container>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Hero                                                                */
/* ------------------------------------------------------------------ */
export function HeroSection({ stats = [], featuredCourse = null, gifSrc }) {
  const reduce = useReducedMotion();
  const heroRef = useRef(null);

  const { user, loading } = useCurrentUser();

  const safeStats = Array.isArray(stats) ? stats : [];

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
              Apni University · Technology-first learning
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

            {/* Har 4 second baad type hone wala content + uska button */}
            <motion.div {...enter(0.3)}>
              <TypeRotator reduce={reduce} />
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
                href="/courses"
                className={`inline-flex min-h-12 cursor-pointer items-center justify-center rounded-lg border ${BORDER} bg-foreground/[0.03] px-6 text-sm font-semibold text-foreground transition-colors duration-200 hover:border-primary/50 motion-reduce:transition-none ${FOCUS}`}
              >
                Explore Courses
              </Link>
            </motion.div>

            <motion.ul
              {...enter(0.44)}
              className={`mt-6 flex flex-wrap gap-x-5 gap-y-2 text-sm ${TEXT_MUTED}`}
            >
              {perks.map((perk) => (
                <li key={perk} className="flex items-center gap-1.5">
                  <Check className="size-4 text-primary" aria-hidden="true" />
                  {perk}
                </li>
              ))}
            </motion.ul>

            <motion.div {...enter(0.5)}>
              <PathSwitcher reduce={reduce} />
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
              scrollProgress={scrollYProgress}
            />
          </motion.div>
        </Container>
      </div>

      <Highlights reduce={reduce} />
      <Journey reduce={reduce} user={user} loading={loading} />
    </section>
  );
}
