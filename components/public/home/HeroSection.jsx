"use client";
import { useEffect, useRef, useState } from "react";
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
  useSpring,
  useTransform,
} from "framer-motion";
import {
  FiArrowRight,
  FiArrowUpRight,
  FiAward,
  FiBriefcase,
  FiCheck,
  FiCloud,
  FiCode,
  FiCpu,
  FiGlobe,
  FiLayers,
  FiServer,
  FiShield,
  FiStar,
  FiTarget,
  FiTrendingUp,
  FiUsers,
} from "react-icons/fi";
import {
  SiDocker,
  SiFirebase,
  SiGit,
  SiKubernetes,
  SiLinux,
  SiNextdotjs,
  SiPython,
  SiReact,
  SiTailwindcss,
  SiTensorflow,
} from "react-icons/si";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import Container from "@/components/layout/Container";
import { mediaConfig } from "@/config/media";
import { formatCompact } from "@/lib/utils/format";

const EASE = [0.22, 1, 0.36, 1];

/* ------------------------------ content ------------------------------ */

const paths = [
  {
    id: "web",
    label: "Web Development",
    icon: FiGlobe,
    blurb:
      "Build fast, accessible apps with React, Next.js and modern backends, then deploy them for real users.",
    tools: ["React", "Next.js", "Node.js", "Tailwind"],
    meta: "40+ lessons · 6 projects · Beginner to Pro",
  },
  {
    id: "ai",
    label: "AI & ML",
    icon: FiCpu,
    blurb:
      "Train models, build LLM-powered apps and ship AI agents that automate real work.",
    tools: ["Python", "TensorFlow", "LangChain", "Prompting"],
    meta: "35+ lessons · 5 projects · Some coding needed",
  },
  {
    id: "cloud",
    label: "Cloud",
    icon: FiCloud,
    blurb:
      "Deploy and scale with serverless, containers and managed databases without managing servers.",
    tools: ["Firebase", "Serverless", "Storage", "APIs"],
    meta: "30+ lessons · 4 projects · Beginner friendly",
  },
  {
    id: "security",
    label: "Cybersecurity",
    icon: FiShield,
    blurb:
      "Find and fix vulnerabilities, secure your apps and learn how attackers think.",
    tools: ["OWASP", "Linux", "Networking", "Pen testing"],
    meta: "30+ lessons · 4 labs · Intermediate",
  },
  {
    id: "devops",
    label: "DevOps",
    icon: FiServer,
    blurb:
      "Automate builds, tests and releases with CI/CD pipelines and infrastructure as code.",
    tools: ["Docker", "Kubernetes", "CI/CD", "Git"],
    meta: "30+ lessons · 5 projects · Intermediate",
  },
];

const roles = [
  "Web Developer",
  "AI Engineer",
  "Cloud Architect",
  "Security Expert",
  "DevOps Pro",
];

const stack = [
  { name: "React", icon: SiReact },
  { name: "Next.js", icon: SiNextdotjs },
  { name: "Python", icon: SiPython },
  { name: "TensorFlow", icon: SiTensorflow },
  { name: "Docker", icon: SiDocker },
  { name: "Kubernetes", icon: SiKubernetes },
  { name: "Firebase", icon: SiFirebase },
  { name: "Tailwind CSS", icon: SiTailwindcss },
  { name: "Git", icon: SiGit },
  { name: "Linux", icon: SiLinux },
];

const terminalLines = [
  "$ npx create-next-app my-project",
  "$ pip install langchain",
  "$ docker compose up -d",
  "✓ Your project is live",
];

const perks = ["Project-based", "Beginner friendly", "Learn at your pace"];

const avatars = [
  { letter: "A", className: "bg-primary text-primary-foreground" },
  { letter: "H", className: "bg-highlight text-highlight-foreground" },
  { letter: "S", className: "bg-accent text-accent-foreground" },
  { letter: "M", className: "bg-secondary text-secondary-foreground" },
];

const highlights = [
  {
    icon: FiUsers,
    title: "Live mentors",
    text: "Get unstuck fast with Q&A sessions and code reviews.",
  },
  {
    icon: FiLayers,
    title: "Real projects",
    text: "Build a portfolio that employers can actually open.",
  },
  {
    icon: FiAward,
    title: "Certificates",
    text: "Share proof of your skills on LinkedIn and your CV.",
  },
  {
    icon: FiBriefcase,
    title: "Career support",
    text: "CV reviews, mock interviews and job guidance.",
  },
];

const steps = [
  {
    icon: FiTarget,
    title: "Pick your path",
    text: "Choose web, AI, cloud, security or DevOps and get a clear roadmap.",
  },
  {
    icon: FiCode,
    title: "Build real projects",
    text: "Learn by shipping. Every module ends with something you can show.",
  },
  {
    icon: FiTrendingUp,
    title: "Launch your career",
    text: "Get certified, polish your portfolio and start applying with confidence.",
  },
];

/* ------------------------------ helpers ------------------------------ */

// Fade-up when scrolled into view.
const reveal = (reduce, delay = 0) =>
  reduce
    ? {}
    : {
        initial: { opacity: 0, y: 20 },
        whileInView: { opacity: 1, y: 0 },
        viewport: { once: true, margin: "-40px" },
        transition: { duration: 0.5, delay, ease: EASE },
      };

/* ----------------------------- small parts ---------------------------- */

function Float({ children, className, delay = 0 }) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={className}
      animate={reduce ? undefined : { y: [0, -8, 0] }}
      transition={{ duration: 6, delay, repeat: Infinity, ease: "easeInOut" }}
    >
      {children}
    </motion.div>
  );
}

// Counts up once when the stat scrolls into view.
function CountUp({ value, reduce }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  const [n, setN] = useState(reduce ? value : 0);

  useEffect(() => {
    if (!inView || reduce) return;
    const controls = animate(0, value, {
      duration: 1.4,
      ease: "easeOut",
      onUpdate: (v) => setN(Math.round(v)),
    });
    return () => controls.stop();
  }, [inView, value, reduce]);

  return <span ref={ref}>{formatCompact(reduce ? value : n)}+</span>;
}

// "Become a ___" with a word that slides in and out.
function RotatingRole({ reduce }) {
  const [i, setI] = useState(0);

  useEffect(() => {
    if (reduce) return;
    const id = setInterval(() => setI((c) => (c + 1) % roles.length), 2600);
    return () => clearInterval(id);
  }, [reduce]);

  return (
    <p className="mt-5 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xl font-medium sm:text-2xl">
      <span className="sr-only">Become a {roles.join(", ")}.</span>
      <span aria-hidden="true" className="text-foreground/70">
        Become a
      </span>
      <span
        aria-hidden="true"
        className="relative inline-flex h-9 overflow-hidden sm:h-10"
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.span
            key={roles[i]}
            initial={reduce ? false : { y: "100%", opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={reduce ? undefined : { y: "-100%", opacity: 0 }}
            transition={{ duration: 0.35, ease: EASE }}
            className="rounded-lg bg-primary/10 px-2.5 leading-9 text-primary sm:leading-10"
          >
            {roles[i]}
          </motion.span>
        </AnimatePresence>
      </span>
    </p>
  );
}

// Overlapping avatars + stars. Replace the numbers with real ones.
function SocialProof({ reduce }) {
  return (
    <motion.div
      {...(reduce
        ? {}
        : {
            initial: { opacity: 0, y: 12 },
            animate: { opacity: 1, y: 0 },
            transition: { duration: 0.5, delay: 0.32, ease: EASE },
          })}
      className="mt-6 flex items-center gap-3"
    >
      <ul className="flex -space-x-2" aria-hidden="true">
        {avatars.map((a) => (
          <li
            key={a.letter}
            className={`grid size-9 place-items-center rounded-full text-xs font-semibold ring-2 ring-background ${a.className}`}
          >
            {a.letter}
          </li>
        ))}
        <li className="grid size-9 place-items-center rounded-full bg-card text-[11px] font-semibold ring-2 ring-background">
          10K+
        </li>
      </ul>
      <div className="text-sm">
        <div
          className="flex items-center gap-0.5 text-highlight"
          role="img"
          aria-label="Rated 4.9 out of 5"
        >
          {Array.from({ length: 5 }).map((_, i) => (
            <FiStar
              key={i}
              className="size-3.5 fill-current"
              aria-hidden="true"
            />
          ))}
          <span className="ml-1.5 font-medium text-foreground">4.9/5</span>
        </div>
        <p className="text-xs text-muted-foreground">Loved by learners</p>
      </div>
    </motion.div>
  );
}

// Decorative typing terminal. Loops, and shows full text with reduced motion.
function Terminal({ reduce, className = "w-64" }) {
  const full = terminalLines.join("\n");
  const [len, setLen] = useState(0);

  useEffect(() => {
    if (reduce) return;
    const id = setInterval(
      () => setLen((l) => (l >= full.length + 30 ? 0 : l + 1)),
      55,
    );
    return () => clearInterval(id);
  }, [reduce, full.length]);

  const visibleLen = reduce ? full.length : len;

  return (
    <div
      aria-hidden="true"
      className={`rounded-xl border bg-card/95 p-3 shadow-lg backdrop-blur ${className}`}
    >
      <div className="mb-2 flex gap-1.5">
        <span className="size-2 rounded-full bg-destructive/60" />
        <span className="size-2 rounded-full bg-highlight/80" />
        <span className="size-2 rounded-full bg-primary/60" />
      </div>
      <pre className="h-24 overflow-hidden whitespace-pre-wrap font-mono text-[11px] leading-5 text-foreground/90">
        {full.slice(0, visibleLen)}
        <span className="ml-0.5 inline-block h-3 w-1.5 translate-y-0.5 animate-pulse bg-primary" />
      </pre>
    </div>
  );
}

function ProgressCard({ reduce }) {
  return (
    <div className="w-48 rounded-xl border bg-card p-3 shadow-lg">
      <div className="flex items-center justify-between text-xs">
        <span className="font-medium">Course progress</span>
        <span className="font-semibold text-primary">72%</span>
      </div>
      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted">
        <motion.div
          initial={reduce ? false : { width: 0 }}
          animate={{ width: "72%" }}
          transition={{ duration: 1.4, delay: 0.9, ease: EASE }}
          className="h-full rounded-full bg-primary"
        />
      </div>
      <p className="mt-2 text-[11px] text-muted-foreground">
        Next: Deploy to production
      </p>
    </div>
  );
}

function PathSwitcher({ reduce }) {
  const [activeId, setActiveId] = useState(paths[0].id);
  const [auto, setAuto] = useState(true);
  const active = paths.find((p) => p.id === activeId);

  // Auto-rotates until the visitor picks a path themselves.
  useEffect(() => {
    if (!auto || reduce) return;
    const id = setInterval(() => {
      setActiveId((cur) => {
        const i = paths.findIndex((p) => p.id === cur);
        return paths[(i + 1) % paths.length].id;
      });
    }, 5000);
    return () => clearInterval(id);
  }, [auto, reduce]);

  return (
    <div className="mt-8">
      {/* Mobile: one swipeable row. Larger screens: wraps normally. */}
      <ul
        className="flex max-w-full snap-x gap-2 overflow-x-auto pb-1 [scrollbar-width:none] sm:flex-wrap sm:overflow-visible [&::-webkit-scrollbar]:hidden"
        aria-label="Learning paths"
      >
        {paths.map((p) => {
          const isActive = p.id === activeId;
          return (
            <li key={p.id} className="shrink-0 snap-start">
              <button
                type="button"
                aria-pressed={isActive}
                onClick={() => {
                  setAuto(false);
                  setActiveId(p.id);
                }}
                className={buttonVariants({
                  size: "sm",
                  variant: isActive ? "default" : "outline",
                  className: "rounded-full",
                })}
              >
                <p.icon aria-hidden="true" />
                {p.label}
              </button>
            </li>
          );
        })}
      </ul>

      <div className="relative mt-3 min-h-36 overflow-hidden rounded-xl border bg-card/70 p-4 backdrop-blur">
        {/* Thin bar showing when the next path will show up */}
        {auto && !reduce && (
          <motion.div
            key={activeId}
            aria-hidden="true"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 5, ease: "linear" }}
            className="absolute inset-x-0 top-0 h-0.5 origin-left bg-primary"
          />
        )}

        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={active.id}
            initial={reduce ? false : { opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduce ? undefined : { opacity: 0, y: -6 }}
            transition={{ duration: 0.2 }}
          >
            <p className="text-sm text-muted-foreground">{active.blurb}</p>
            <ul className="mt-3 flex flex-wrap gap-1.5">
              {active.tools.map((t) => (
                <li key={t}>
                  <Badge variant="secondary">{t}</Badge>
                </li>
              ))}
            </ul>
            <p className="mt-3 text-xs text-muted-foreground">{active.meta}</p>
            <Link
              href={`/courses?category=${active.id}`}
              className="mt-2 inline-flex items-center gap-1 rounded-sm text-sm font-medium text-primary outline-none hover:underline focus-visible:ring-2 focus-visible:ring-ring"
            >
              Browse {active.label} courses
              <FiArrowRight aria-hidden="true" />
            </Link>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

/* ------------------------------ visual side --------------------------- */

function Visual({ reduce, src, featuredCourse }) {
  const [gifFailed, setGifFailed] = useState(false);

  // Gentle 3D tilt that follows the mouse (desktop only)
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [5, -5]), {
    stiffness: 120,
    damping: 16,
  });
  const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-5, 5]), {
    stiffness: 120,
    damping: 16,
  });

  const onMove = (e) => {
    if (reduce || e.pointerType !== "mouse") return;
    const r = e.currentTarget.getBoundingClientRect();
    x.set((e.clientX - r.left) / r.width - 0.5);
    y.set((e.clientY - r.top) / r.height - 0.5);
  };
  const onLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <div className="mx-auto w-full max-w-xl">
      <motion.div
        {...(reduce
          ? {}
          : {
              initial: { opacity: 0, scale: 0.97 },
              animate: { opacity: 1, scale: 1 },
              transition: { duration: 0.7, delay: 0.15 },
            })}
        onPointerMove={onMove}
        onPointerLeave={onLeave}
        style={
          reduce ? undefined : { rotateX, rotateY, transformPerspective: 1200 }
        }
        className="relative"
      >
        <div
          aria-hidden="true"
          className="absolute -right-4 -top-4 -z-10 size-28 rounded-full bg-highlight/70"
        />
        <div
          aria-hidden="true"
          className="absolute -bottom-6 -left-6 -z-10 size-32 rounded-full bg-primary/20 blur-2xl"
        />

        {/* Editor-style frame around the GIF */}
        <div className="relative overflow-hidden rounded-3xl border bg-muted shadow-xl">
          <div
            aria-hidden="true"
            className="flex h-9 items-center gap-1.5 border-b bg-card px-4"
          >
            <span className="size-2.5 rounded-full bg-destructive/60" />
            <span className="size-2.5 rounded-full bg-highlight/80" />
            <span className="size-2.5 rounded-full bg-primary/60" />
            <span className="ml-3 truncate rounded-md bg-muted px-3 py-0.5 text-xs text-muted-foreground">
              my-first-project / main
            </span>
          </div>

          <div className="relative aspect-[4/3]">
            {gifFailed ? (
              <div
                aria-hidden="true"
                className="absolute inset-0 grid place-items-center bg-gradient-to-br from-primary/15 via-accent to-highlight/20"
              >
                <FiCode className="size-16 text-primary/70" />
              </div>
            ) : (
              // unoptimized: Next.js doesn't optimize animated GIFs, and this keeps them animating
              <Image
                src={src}
                alt="Learners building software projects"
                fill
                priority
                unoptimized
                sizes="(min-width:1024px) 560px, 100vw"
                className="object-cover"
                onError={() => setGifFailed(true)}
              />
            )}
            <div
              aria-hidden="true"
              className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-background/50 to-transparent"
            />
          </div>
        </div>

        <Float className="absolute bottom-6 left-2 sm:-left-8 sm:bottom-8">
          {" "}
          <div className="flex items-center gap-3 rounded-xl border bg-card p-2.5 shadow-lg sm:p-3">
            <span className="grid size-9 place-items-center rounded-lg bg-accent text-primary sm:size-10">
              <FiCode aria-hidden="true" />
            </span>
            <p className="text-sm">
              <span className="block font-medium">Build real projects</span>
              <span className="hidden text-xs text-muted-foreground sm:block">
                Ship a portfolio
              </span>
            </p>
          </div>
        </Float>

        <Float
          delay={1.2}
          className="absolute right-2 top-12 sm:-right-6 sm:top-14"
        >
          {" "}
          <div className="flex items-center gap-3 rounded-xl border bg-card p-2.5 shadow-lg sm:p-3">
            <span className="grid size-9 place-items-center rounded-lg bg-highlight/30 text-highlight-foreground sm:size-10">
              <FiCpu aria-hidden="true" />
            </span>
            <p className="text-sm">
              <span className="block font-medium">AI learning paths</span>
              <span className="hidden text-xs text-muted-foreground sm:block">
                Agents & automation
              </span>
            </p>
          </div>
        </Float>

        <Float
          delay={1.8}
          className="absolute -right-4 top-44 hidden sm:block lg:-right-8"
        >
          <ProgressCard reduce={reduce} />
        </Float>

        <Float
          delay={0.6}
          className="absolute -left-6 top-24 hidden lg:block xl:-left-12"
        >
          <Terminal reduce={reduce} />
        </Float>

        {featuredCourse && (
          <Float
            delay={2.4}
            className="absolute -bottom-5 right-4 hidden sm:block"
          >
            <Link
              href={`/courses/${featuredCourse.slug}`}
              className="flex max-w-[15rem] items-center gap-3 rounded-xl border bg-card p-3 shadow-lg outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <p className="text-sm">
                <span className="block text-xs text-muted-foreground">
                  Featured course
                </span>
                <span className="line-clamp-2 font-medium">
                  {featuredCourse.title}
                </span>
              </p>
              <FiArrowUpRight className="shrink-0" aria-hidden="true" />
            </Link>
          </Float>
        )}
      </motion.div>

      {/* Mobile / tablet: the terminal sits under the image instead of floating */}
      <div className="mt-8 lg:hidden">
        <Terminal reduce={reduce} className="w-full" />
      </div>
    </div>
  );
}

/* --------------------------- extra content ---------------------------- */

function Highlights({ reduce }) {
  return (
    <div className="border-t bg-muted/20 py-12 sm:py-16">
      <Container>
        <motion.div
          {...reveal(reduce)}
          className="mx-auto max-w-2xl text-center"
        >
          <Badge variant="secondary" className="mb-3">
            Why ZT Skills Pro
          </Badge>
          <h2 className="text-2xl sm:text-3xl">
            Everything you need to go from beginner to job-ready
          </h2>
          <p className="mt-3 text-muted-foreground">
            Practical lessons, real feedback and a clear path, all in one place.
          </p>
        </motion.div>

        <ul className="mt-8 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          {highlights.map(({ icon: Icon, title, text }, i) => (
            <motion.li
              key={title}
              {...reveal(reduce, i * 0.08)}
              className="group rounded-2xl border bg-card p-4 transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-lg motion-reduce:transition-none motion-reduce:hover:translate-y-0 sm:p-5"
            >
              <span className="grid size-10 place-items-center rounded-xl bg-primary/10 text-primary transition-all duration-300 group-hover:rotate-6 group-hover:bg-primary group-hover:text-primary-foreground motion-reduce:transition-none motion-reduce:group-hover:rotate-0">
                <Icon aria-hidden="true" className="size-5" />
              </span>
              <h3 className="mt-3 font-sans text-sm font-semibold sm:text-base">
                {title}
              </h3>
              <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
                {text}
              </p>
            </motion.li>
          ))}
        </ul>

        {/* How it works */}
        <ol className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-3">
          {" "}
          {steps.map(({ icon: Icon, title, text }, i) => (
            <motion.li
              key={title}
              {...reveal(reduce, i * 0.1)}
              className="relative overflow-hidden rounded-2xl border bg-card/70 p-5 backdrop-blur"
            >
              <span
                aria-hidden="true"
                className="absolute -right-2 -top-4 font-serif text-7xl font-bold text-primary/10"
              >
                {i + 1}
              </span>
              <span className="relative grid size-10 place-items-center rounded-xl bg-highlight/30 text-highlight-foreground">
                <Icon aria-hidden="true" className="size-5" />
              </span>
              <h3 className="relative mt-3 font-sans text-base font-semibold">
                <span className="sr-only">Step {i + 1}: </span>
                {title}
              </h3>
              <p className="relative mt-1 text-sm text-muted-foreground">
                {text}
              </p>
            </motion.li>
          ))}
        </ol>

        <motion.div
          {...reveal(reduce, 0.1)}
          className="mt-10 flex flex-col items-center justify-between gap-4 rounded-2xl border bg-gradient-to-r from-primary/10 via-card to-highlight/20 p-6 text-center sm:flex-row sm:text-left"
        >
          <div>
            <p className="font-serif text-xl">Ready to start building?</p>
            <p className="text-sm text-muted-foreground">
              Create a free account and pick your first course today.
            </p>
          </div>
          <Link
            href="/register"
            className={buttonVariants({
              size: "lg",
              className: "w-full sm:w-auto",
            })}
          >
            Create free account
            <FiArrowRight aria-hidden="true" />
          </Link>
        </motion.div>
      </Container>
    </div>
  );
}

function TechMarquee({ reduce }) {
  const items = reduce ? stack : [...stack, ...stack];
  return (
    <div className="border-t bg-muted/30 py-5">
      <Container>
        <p className="mb-3 text-center text-sm text-muted-foreground">
          Tools you&apos;ll use in our courses
        </p>
        <div className="overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_12%,black_88%,transparent)]">
          <motion.ul
            className={
              reduce
                ? "flex flex-wrap justify-center gap-x-8 gap-y-3"
                : "flex w-max"
            }
            animate={reduce ? undefined : { x: ["0%", "-50%"] }}
            transition={{ duration: 35, repeat: Infinity, ease: "linear" }}
          >
            {items.map(({ name, icon: Icon }, idx) => (
              <li
                key={`${name}-${idx}`}
                aria-hidden={idx >= stack.length ? true : undefined}
                className={`flex items-center gap-2 text-muted-foreground ${
                  reduce ? "" : "pr-10"
                }`}
              >
                <Icon className="size-5" aria-hidden="true" />
                <span className="text-sm font-medium">{name}</span>
              </li>
            ))}
          </motion.ul>
        </div>
      </Container>
    </div>
  );
}

/* ------------------------------- section ------------------------------ */

export function HeroSection({ stats = [], featuredCourse = null, gifSrc }) {
  const reduce = useReducedMotion();

  // Online GIF: prop > env var > local config fallback.
  const src =
    gifSrc || process.env.NEXT_PUBLIC_HERO_GIF_URL || mediaConfig.heroGif;

  // Soft light that follows the mouse (desktop only)
  const mx = useMotionValue(-600);
  const my = useMotionValue(-600);
  const spotlight = useMotionTemplate`radial-gradient(480px circle at ${mx}px ${my}px, color-mix(in oklab, var(--primary) 14%, transparent), transparent 70%)`;

  const onMove = (e) => {
    if (reduce || e.pointerType !== "mouse") return;
    const r = e.currentTarget.getBoundingClientRect();
    mx.set(e.clientX - r.left);
    my.set(e.clientY - r.top);
  };

  const enter = (delay = 0) =>
    reduce
      ? {}
      : {
          initial: { opacity: 0, y: 16 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.55, delay, ease: EASE },
        };

  return (
    <section
      className="relative max-w-full overflow-x-clip border-b"
      aria-labelledby="hero-title"
      onPointerMove={onMove}
    >
      {/* Background: dots, spotlight and drifting glows */}
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 opacity-60 [background-image:radial-gradient(var(--border)_1px,transparent_1px)] [background-size:22px_22px] [mask-image:linear-gradient(to_bottom,black_60%,transparent)]"
      />
      <motion.div
        aria-hidden="true"
        style={{ background: spotlight }}
        className="pointer-events-none absolute inset-0 -z-10"
      />
      <motion.div
        aria-hidden="true"
        animate={reduce ? undefined : { x: [0, 40, 0], y: [0, 30, 0] }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -left-24 top-0 -z-10 size-96 rounded-full bg-primary/10 blur-3xl"
      />
      <motion.div
        aria-hidden="true"
        animate={reduce ? undefined : { x: [0, -40, 0], y: [0, -30, 0] }}
        transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -right-24 bottom-0 -z-10 size-96 rounded-full bg-highlight/20 blur-3xl"
      />

      <Container className="grid grid-cols-1 items-center gap-12 py-10 sm:py-16 lg:grid-cols-2 lg:py-24">
        <div className="min-w-0">
          <motion.div {...enter(0)}>
            <Badge variant="secondary" className="mb-5 gap-2">
              <span className="relative flex size-2">
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-primary/60 motion-reduce:animate-none" />
                <span className="relative inline-flex size-2 rounded-full bg-primary" />
              </span>
              Technology-first learning
            </Badge>
          </motion.div>

          <motion.h1
            id="hero-title"
            {...enter(0.08)}
            className="text-4xl leading-[1.05] sm:text-5xl lg:text-6xl"
          >
            Learn Skills.
            <br />
            <motion.span
              animate={
                reduce
                  ? undefined
                  : { backgroundPosition: ["0% 50%", "200% 50%"] }
              }
              transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
              className="inline-block bg-gradient-to-r from-primary via-highlight to-primary bg-[length:200%_100%] bg-clip-text text-transparent"
            >
              Build Your Future.
            </motion.span>
          </motion.h1>

          <motion.div {...enter(0.14)}>
            <RotatingRole reduce={reduce} />
          </motion.div>

          <motion.p
            {...enter(0.2)}
            className="mt-5 max-w-xl text-base text-muted-foreground sm:text-lg"
          >
            Master practical technology skills, build real projects, explore AI,
            and prepare for the future of work.
          </motion.p>

          <motion.div
            {...enter(0.26)}
            className="mt-8 flex flex-col gap-3 sm:flex-row"
          >
            <Link href="/courses" className={buttonVariants({ size: "lg" })}>
              Explore Courses
              <FiArrowRight aria-hidden="true" />
            </Link>
            <Link
              href="/register"
              className={buttonVariants({ size: "lg", variant: "outline" })}
            >
              Start Learning
            </Link>
          </motion.div>

          <motion.ul
            {...enter(0.3)}
            className="mt-5 flex flex-wrap gap-x-5 gap-y-1 text-sm text-muted-foreground"
          >
            {perks.map((p) => (
              <li key={p} className="flex items-center gap-1.5">
                <FiCheck className="text-primary" aria-hidden="true" />
                {p}
              </li>
            ))}
          </motion.ul>

          <SocialProof reduce={reduce} />

          <motion.div {...enter(0.4)}>
            <PathSwitcher reduce={reduce} />
          </motion.div>

          {stats.length > 0 && (
            <motion.dl
              {...enter(0.48)}
              className="mt-10 grid grid-cols-3 gap-3 sm:gap-4"
            >
              {stats.map((s) => (
                <div
                  key={s.label}
                  className="rounded-xl border bg-card/60 p-3 text-center backdrop-blur sm:p-4 sm:text-left"
                >
                  <dt className="text-xs text-muted-foreground sm:text-sm">
                    {s.label}
                  </dt>
                  <dd className="font-serif text-xl font-semibold sm:text-2xl">
                    <CountUp value={s.value} reduce={reduce} />
                  </dd>
                </div>
              ))}
            </motion.dl>
          )}
        </div>
        <div className="mx-auto w-full min-w-0 max-w-xl">
          <Visual reduce={reduce} src={src} featuredCourse={featuredCourse} />
        </div>
      </Container>

      <Highlights reduce={reduce} />
      <TechMarquee reduce={reduce} />
    </section>
  );
}
