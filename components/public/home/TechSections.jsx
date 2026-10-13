"use client";
import { useState } from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { FiArrowRight, FiClock } from "react-icons/fi";
import {
  SiDocker,
  SiFirebase,
  SiNextdotjs,
  SiNodedotjs,
  SiPython,
  SiReact,
  SiTailwindcss,
  SiTensorflow,
} from "react-icons/si";
import { Section } from "@/components/layout/Container";
import { SectionHeader } from "@/components/shared/SectionHeader";

const EASE = [0.22, 1, 0.36, 1];

const FOCUS =
  "outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background";

// Shared tech list (names match the courses search, e.g. /courses?q=React).
export const technologies = [
  { name: "Next.js", icon: SiNextdotjs, color: null },
  { name: "React", icon: SiReact, color: "#149ECA" },
  { name: "Tailwind CSS", icon: SiTailwindcss, color: "#06B6D4" },
  { name: "Node.js", icon: SiNodedotjs, color: "#5FA04E" },
  { name: "Firebase", icon: SiFirebase, color: "#F5A100" },
  { name: "Python", icon: SiPython, color: "#3776AB" },
  { name: "TensorFlow", icon: SiTensorflow, color: "#FF6F00" },
  { name: "Docker", icon: SiDocker, color: "#2496ED" },
];

const byName = Object.fromEntries(technologies.map((t) => [t.name, t]));

const paths = [
  {
    id: "frontend",
    label: "Frontend developer",
    summary: "Design and build the part of an app people see and touch.",
    steps: [
      {
        tech: "Tailwind CSS",
        weeks: 2,
        what: "Style responsive layouts quickly and consistently.",
      },
      {
        tech: "React",
        weeks: 5,
        what: "Turn designs into interactive, reusable components.",
      },
      {
        tech: "Next.js",
        weeks: 6,
        what: "Add routing, data fetching and fast server rendering.",
      },
    ],
  },
  {
    id: "fullstack",
    label: "Full-stack developer",
    summary: "Own an app from the screen to the database to the server.",
    steps: [
      {
        tech: "React",
        weeks: 5,
        what: "Build the interface with components and state.",
      },
      {
        tech: "Node.js",
        weeks: 5,
        what: "Create APIs with login, validation and error handling.",
      },
      {
        tech: "Firebase",
        weeks: 3,
        what: "Add real-time data, auth and hosting.",
      },
      {
        tech: "Docker",
        weeks: 3,
        what: "Package the whole app and deploy it anywhere.",
      },
    ],
  },
  {
    id: "ai",
    label: "AI & data",
    summary: "Automate work, analyze data and train your first models.",
    steps: [
      {
        tech: "Python",
        weeks: 4,
        what: "Write scripts that clean data and call APIs.",
      },
      {
        tech: "TensorFlow",
        weeks: 6,
        what: "Train a neural network and classify images.",
      },
      {
        tech: "Docker",
        weeks: 3,
        what: "Ship your model as a container other people can run.",
      },
    ],
  },
];

export function LearningPaths() {
  const reduce = useReducedMotion();
  const [active, setActive] = useState(paths[0].id);
  const path = paths.find((p) => p.id === active);
  const totalWeeks = path.steps.reduce((sum, s) => sum + s.weeks, 0);

  return (
    <Section labelledBy="paths-title">
      <SectionHeader
        id="paths-title"
        eyebrow="Roadmaps"
        title="Choose a path, learn one technology at a time"
        description="Each path lists the technologies in the order we recommend learning them."
        href="/courses"
        hrefLabel="Browse all courses"
      />

      <motion.div
        {...(reduce
          ? {}
          : {
              initial: { opacity: 0, y: 16 },
              whileInView: { opacity: 1, y: 0 },
              viewport: { once: true, margin: "-60px" },
              transition: { duration: 0.55, ease: EASE },
            })}
        className="grid gap-6 lg:grid-cols-[18rem_1fr]"
      >
        {/* Path picker */}
        <ul
          className="-mx-1 flex snap-x flex-row gap-2 overflow-x-auto px-1 pb-2 [scrollbar-width:none] lg:mx-0 lg:flex-col lg:overflow-visible lg:px-0 lg:pb-0 [&::-webkit-scrollbar]:hidden"
          aria-label="Learning paths"
        >
          {paths.map((p) => {
            const on = p.id === active;
            return (
              <li key={p.id} className="shrink-0 snap-start lg:shrink">
                <button
                  type="button"
                  aria-pressed={on}
                  onClick={() => setActive(p.id)}
                  className={`relative min-h-12 w-full rounded-xl border border-border bg-card p-4 text-left shadow-sm transition-colors duration-200 hover:border-primary/50 active:bg-muted/60 motion-reduce:transition-none ${FOCUS}`}
                >
                  {on && (
                    <motion.span
                      layoutId="path-active"
                      aria-hidden="true"
                      className="absolute inset-0 rounded-xl border-2 border-primary bg-primary/5"
                      transition={
                        reduce
                          ? { duration: 0 }
                          : { type: "spring", stiffness: 380, damping: 32 }
                      }
                    />
                  )}
                  <span className="relative block font-medium text-card-foreground">
                    {p.label}
                  </span>
                  <span className="relative mt-1 hidden text-sm leading-5 text-muted-foreground lg:block">
                    {p.summary}
                  </span>
                  <span className="relative mt-2 hidden font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground lg:block">
                    {p.steps.length} technologies
                  </span>
                </button>
              </li>
            );
          })}
        </ul>

        {/* Timeline */}
        <div
          className="rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-7"
          aria-live="polite"
        >
          <div className="mb-6 flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm text-muted-foreground lg:hidden">
              {path.summary}
            </p>
            <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <FiClock aria-hidden="true" />
              About {totalWeeks} weeks, {path.steps.length} technologies
            </p>
          </div>

          <ol key={path.id} className="relative flex flex-col gap-4">
            {/* The line draws itself each time the path changes. */}
            <motion.span
              aria-hidden="true"
              className="absolute bottom-6 left-5 top-6 w-px origin-top bg-border"
              initial={reduce ? false : { scaleY: 0 }}
              animate={{ scaleY: 1 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            />
            {path.steps.map((s, i) => {
              const t = byName[s.tech];
              const Icon = t.icon;
              return (
                <motion.li
                  key={s.tech}
                  initial={reduce ? false : { opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: reduce ? 0 : 0.12 * i, duration: 0.35 }}
                  style={{ "--brand": t.color ?? "var(--primary)" }}
                  className="relative flex gap-4"
                >
                  <span className="relative z-10 mt-2 grid size-10 shrink-0 place-items-center rounded-full border border-border bg-card text-[color:var(--brand)] shadow-sm ring-4 ring-card">
                    <Icon className="size-5" aria-hidden="true" />
                  </span>
                  <div className="-my-0.5 flex-1 rounded-xl border border-transparent p-3 transition-colors duration-200 hover:border-border hover:bg-muted/40 motion-reduce:transition-none">
                    <p
                      aria-hidden="true"
                      className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground"
                    >
                      Step {String(i + 1).padStart(2, "0")}
                    </p>
                    <div className="mt-1 flex flex-wrap items-center justify-between gap-2">
                      <h3 className="font-semibold text-card-foreground">
                        <span className="sr-only">Step {i + 1}: </span>
                        {s.tech}
                      </h3>
                      <span className="text-xs text-muted-foreground">
                        {s.weeks} weeks
                      </span>
                    </div>
                    <p className="mt-1 text-sm leading-6 text-muted-foreground">
                      {s.what}
                    </p>
                    <Link
                      href={`/courses?q=${encodeURIComponent(s.tech)}`}
                      className={`group mt-2 inline-flex min-h-9 items-center gap-1 rounded-sm text-sm font-medium text-primary hover:underline ${FOCUS}`}
                    >
                      See {s.tech} courses
                      <FiArrowRight
                        aria-hidden="true"
                        className="transition-transform duration-200 group-hover:translate-x-0.5 motion-reduce:transform-none motion-reduce:transition-none"
                      />
                    </Link>
                  </div>
                </motion.li>
              );
            })}
          </ol>
        </div>
      </motion.div>
    </Section>
  );
}

// A slow, continuous row of technologies. Pauses on hover or focus.
export function TechMarquee() {
  const reduce = useReducedMotion();
  const [paused, setPaused] = useState(false);

  const row = (hidden) => (
    <ul
      className="flex shrink-0 items-center gap-3 pr-3"
      aria-hidden={hidden || undefined}
    >
      {technologies.map((t) => {
        const Icon = t.icon;
        return (
          <li key={t.name}>
            <Link
              href={`/courses?q=${encodeURIComponent(t.name)}`}
              tabIndex={hidden ? -1 : undefined}
              style={{ "--brand": t.color ?? "var(--primary)" }}
              className={`flex min-h-10 items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm text-muted-foreground transition-colors duration-200 hover:border-[color:var(--brand)] hover:text-foreground active:bg-muted/60 motion-reduce:transition-none ${FOCUS}`}
            >
              <Icon
                className="size-4 text-[color:var(--brand)]"
                aria-hidden="true"
              />
              {t.name}
            </Link>
          </li>
        );
      })}
    </ul>
  );

  // Reduced motion: a static, wrapped list instead of a moving row.
  if (reduce) {
    return (
      <div className="border-y border-border bg-secondary/40 py-6">
        <div className="mx-auto flex max-w-5xl flex-wrap justify-center gap-3 px-4">
          {row(false)}
        </div>
      </div>
    );
  }

  return (
    <div
      className="overflow-hidden border-y border-border bg-secondary/40 py-6"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      style={{
        maskImage:
          "linear-gradient(to right, transparent, black 8%, black 92%, transparent)",
        WebkitMaskImage:
          "linear-gradient(to right, transparent, black 8%, black 92%, transparent)",
      }}
    >
      <div
        className="flex w-max animate-[tech-marquee_30s_linear_infinite]"
        style={{ animationPlayState: paused ? "paused" : "running" }}
      >
        {row(false)}
        {row(true)}
      </div>
      <style>{`@keyframes tech-marquee { to { transform: translateX(-50%); } }`}</style>
    </div>
  );
}
