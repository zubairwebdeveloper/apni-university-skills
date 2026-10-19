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

/* ------------------------------------------------------------------ */
/* Design tokens                                                       */
/* ------------------------------------------------------------------ */
// `apni-landing` activates the shared colour tokens (#111318 surface, #FACC15
// primary, violet accent). HeroSection and TechStrip already emit that CSS,
// so it is on the page whenever they are. If this file is used without them,
// move THEME_CSS (see HeroSection.jsx) into globals.css.
const SCOPE = "apni-landing bg-background text-foreground";
const VIOLET = "text-[color:var(--violet)]";
const FOCUS =
  "outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background";
const PILL =
  "rounded-full border border-border bg-muted px-2.5 py-0.5 text-xs tabular-nums text-muted-foreground";

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

const courseHref = (tech) => `/courses?q=${encodeURIComponent(tech)}`;

/* ------------------------------------------------------------------ */
/* Roadmaps                                                            */
/* ------------------------------------------------------------------ */
export function LearningPaths() {
  const reduce = useReducedMotion();
  const [active, setActive] = useState(paths[0].id);
  const path = paths.find((p) => p.id === active) ?? paths[0];
  const totalWeeks = path.steps.reduce((sum, s) => sum + s.weeks, 0);

  // Week range of each step, worked out from the durations above.
  const ranges = path.steps.reduce((acc, s) => {
    const start = acc.length ? acc[acc.length - 1].end + 1 : 1;
    acc.push({ start, end: start + s.weeks - 1 });
    return acc;
  }, []);

  const first = path.steps[0];

  return (
    <Section labelledBy="paths-title" className={SCOPE}>
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
        className="grid gap-6 lg:grid-cols-[19rem_1fr]"
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
                  className={`relative min-h-12 w-full cursor-pointer rounded-xl border border-border bg-card p-4 text-left shadow-sm transition-colors duration-200 hover:border-primary/60 active:bg-muted motion-reduce:transition-none ${FOCUS}`}
                >
                  {on && (
                    <motion.span
                      layoutId="path-active"
                      aria-hidden="true"
                      className="absolute inset-0 rounded-xl border-2 border-primary bg-primary/10"
                      transition={
                        reduce
                          ? { duration: 0 }
                          : { type: "spring", stiffness: 380, damping: 32 }
                      }
                    />
                  )}
                  <span className="relative block font-semibold text-card-foreground">
                    {p.label}
                  </span>
                  <span className="relative mt-1 hidden text-sm leading-5 text-muted-foreground lg:block">
                    {p.summary}
                  </span>
                  <span className="relative mt-3 hidden items-center justify-between gap-3 lg:flex">
                    <span
                      className="flex items-center gap-1.5"
                      aria-hidden="true"
                    >
                      {p.steps.map((s, i) => {
                        const t = byName[s.tech];
                        const StepIcon = t?.icon;
                        if (!StepIcon) return null;
                        return (
                          <span
                            key={`${s.tech}-${i}`}
                            style={{ "--brand": t.color ?? "var(--primary)" }}
                            className="grid size-6 place-items-center rounded-md border border-border bg-muted text-[color:var(--brand)]"
                          >
                            <StepIcon className="size-3.5" />
                          </span>
                        );
                      })}
                    </span>
                    <span className={PILL}>{p.steps.length} technologies</span>
                  </span>
                </button>
              </li>
            );
          })}
        </ul>

        {/* Timeline */}
        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-7">
          {/* Announces the new path to screen readers without re-reading it all. */}
          <p className="sr-only" role="status" aria-live="polite">
            {path.label}: about {totalWeeks} weeks, {path.steps.length}{" "}
            technologies.
          </p>

          <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm text-muted-foreground lg:hidden">
              {path.summary}
            </p>
            <p className="flex items-center gap-1.5 text-sm font-medium text-card-foreground">
              <FiClock className="text-primary" aria-hidden="true" />
              About {totalWeeks} weeks, {path.steps.length} technologies
            </p>
          </div>

          {/* Share of total time per step, in the same order as the list below. */}
          <div
            aria-hidden="true"
            className="mb-7 flex gap-1"
            key={`bar-${path.id}`}
          >
            {path.steps.map((s, i) => (
              <motion.span
                key={`${s.tech}-${i}`}
                initial={reduce ? false : { scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ delay: reduce ? 0 : 0.08 * i, duration: 0.4 }}
                style={{ flexGrow: s.weeks, flexBasis: 0 }}
                className={`h-1.5 origin-left rounded-full ${
                  i % 2 === 0 ? "bg-primary" : "bg-primary/45"
                }`}
              />
            ))}
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
              const Icon = t?.icon;
              const range = ranges[i];
              return (
                <motion.li
                  key={`${s.tech}-${i}`}
                  initial={reduce ? false : { opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: reduce ? 0 : 0.12 * i, duration: 0.35 }}
                  style={{ "--brand": t?.color ?? "var(--primary)" }}
                  className="relative flex gap-4"
                >
                  <span className="relative z-10 mt-2 grid size-10 shrink-0 place-items-center rounded-full border border-border bg-muted text-[color:var(--brand)] ring-4 ring-card">
                    {Icon && <Icon className="size-5" aria-hidden="true" />}
                  </span>
                  <div className="-my-0.5 min-w-0 flex-1 rounded-xl border border-transparent p-3 transition-colors duration-200 hover:border-border hover:bg-muted/50 motion-reduce:transition-none">
                    {/* A real sequence, so the step number stays. */}
                    <p
                      aria-hidden="true"
                      className={`font-mono text-xs tabular-nums ${VIOLET}`}
                    >
                      Step {String(i + 1).padStart(2, "0")}
                      <span className="text-muted-foreground">
                        {" · "}
                        {range.start === range.end
                          ? `Week ${range.start}`
                          : `Weeks ${range.start}–${range.end}`}
                      </span>
                    </p>
                    <div className="mt-1 flex flex-wrap items-center justify-between gap-2">
                      <h3 className="text-lg font-semibold tracking-tight text-card-foreground">
                        <span className="sr-only">Step {i + 1}: </span>
                        {s.tech}
                      </h3>
                      <span className={PILL}>{s.weeks} weeks</span>
                    </div>
                    <p className="mt-1.5 text-sm leading-6 text-muted-foreground">
                      {s.what}
                    </p>
                    <Link
                      href={courseHref(s.tech)}
                      className={`group mt-2 inline-flex min-h-10 items-center gap-1 rounded-sm text-sm font-medium text-primary underline-offset-4 hover:underline ${FOCUS}`}
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

          {/* Next step for the reader: begin at step one. */}
          <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-5">
            <p className="text-sm text-muted-foreground">
              Not sure where to begin? Start at step one.
            </p>
            <Link
              href={courseHref(first.tech)}
              className={`group inline-flex min-h-11 items-center gap-2 rounded-lg bg-primary px-5 text-sm font-semibold text-primary-foreground shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:brightness-110 motion-reduce:transform-none motion-reduce:transition-none ${FOCUS}`}
            >
              Start with {first.tech}
              <FiArrowRight
                aria-hidden="true"
                className="transition-transform duration-200 group-hover:translate-x-0.5 motion-reduce:transform-none motion-reduce:transition-none"
              />
            </Link>
          </div>
        </div>
      </motion.div>
    </Section>
  );
}

/* ------------------------------------------------------------------ */
/* Marquee                                                             */
/* ------------------------------------------------------------------ */
// A slow, continuous row of technologies. Pauses on hover or focus.
export function TechMarquee() {
  const reduce = useReducedMotion();
  const [paused, setPaused] = useState(false);

  const row = (hidden, wrap = false) => (
    <ul
      className={`flex items-center gap-3 ${
        wrap ? "flex-wrap justify-center" : "shrink-0 pr-3"
      }`}
      aria-hidden={hidden || undefined}
    >
      {technologies.map((t) => {
        const Icon = t.icon;
        return (
          <li key={t.name}>
            <Link
              href={courseHref(t.name)}
              tabIndex={hidden ? -1 : undefined}
              style={{ "--brand": t.color ?? "var(--primary)" }}
              className={`flex min-h-10 items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm font-medium text-muted-foreground transition-colors duration-200 hover:border-[color:var(--brand)] hover:text-foreground active:bg-muted motion-reduce:transition-none ${FOCUS}`}
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
      <div className={`${SCOPE} border-y border-border bg-muted/40 py-6`}>
        <div className="mx-auto max-w-5xl px-4">{row(false, true)}</div>
      </div>
    );
  }

  return (
    <div
      className={`${SCOPE} overflow-hidden border-y border-border bg-muted/40 py-6`}
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
        className="flex w-max animate-[tech-marquee_40s_linear_infinite]"
        style={{ animationPlayState: paused ? "paused" : "running" }}
      >
        {row(false)}
        {row(true)}
      </div>
      <style>{`@keyframes tech-marquee { to { transform: translateX(-50%); } }`}</style>
    </div>
  );
}
