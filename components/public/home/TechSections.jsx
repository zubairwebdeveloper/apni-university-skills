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

      <div className="grid gap-6 lg:grid-cols-[18rem_1fr]">
        {/* Path picker */}
        <ul className="flex flex-row gap-2 overflow-x-auto pb-1 lg:flex-col lg:overflow-visible">
          {paths.map((p) => {
            const on = p.id === active;
            return (
              <li key={p.id} className="shrink-0 lg:shrink">
                <button
                  type="button"
                  aria-pressed={on}
                  onClick={() => setActive(p.id)}
                  className="relative w-full rounded-xl border bg-card p-4 text-left outline-none transition-colors hover:border-primary/50 focus-visible:ring-2 focus-visible:ring-ring"
                >
                  {on && (
                    <motion.span
                      layoutId="path-active"
                      className="absolute inset-0 rounded-xl border-2 border-primary bg-primary/5"
                      transition={
                        reduce
                          ? { duration: 0 }
                          : { type: "spring", stiffness: 380, damping: 32 }
                      }
                    />
                  )}
                  <span className="relative block font-medium">{p.label}</span>
                  <span className="relative mt-1 hidden text-sm text-muted-foreground lg:block">
                    {p.summary}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>

        {/* Timeline */}
        <div
          className="rounded-2xl border bg-card p-5 sm:p-6"
          aria-live="polite"
        >
          <div className="mb-5 flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm text-muted-foreground lg:hidden">
              {path.summary}
            </p>
            <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <FiClock aria-hidden="true" />
              About {totalWeeks} weeks, {path.steps.length} technologies
            </p>
          </div>

          <ol key={path.id} className="relative flex flex-col gap-6">
            {/* The line draws itself each time the path changes. */}
            <motion.span
              aria-hidden="true"
              className="absolute bottom-4 left-5 top-4 w-px origin-top bg-border"
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
                  transition={{ delay: 0.12 * i, duration: 0.35 }}
                  style={{ "--brand": t.color ?? "var(--primary)" }}
                  className="relative flex gap-4"
                >
                  <span className="relative z-10 grid size-10 shrink-0 place-items-center rounded-full border bg-card text-[color:var(--brand)]">
                    <Icon className="size-5" aria-hidden="true" />
                  </span>
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <h3 className="font-semibold">
                        <span className="sr-only">Step {i + 1}: </span>
                        {s.tech}
                      </h3>
                      <span className="text-xs text-muted-foreground">
                        {s.weeks} weeks
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {s.what}
                    </p>
                    <Link
                      href={`/courses?q=${encodeURIComponent(s.tech)}`}
                      className="mt-2 inline-flex items-center gap-1 text-sm font-medium text-[color:var(--brand)] outline-none hover:underline focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      See {s.tech} courses
                      <FiArrowRight aria-hidden="true" />
                    </Link>
                  </div>
                </motion.li>
              );
            })}
          </ol>
        </div>
      </div>
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
              className="flex items-center gap-2 rounded-full border bg-card px-4 py-2 text-sm text-muted-foreground outline-none transition-colors hover:border-[color:var(--brand)] hover:text-[color:var(--brand)] focus-visible:ring-2 focus-visible:ring-ring"
            >
              <Icon className="size-4" aria-hidden="true" />
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
      <div className="border-y bg-secondary/40 py-6">
        <div className="mx-auto flex max-w-5xl flex-wrap justify-center gap-3 px-4">
          {row(false)}
        </div>
      </div>
    );
  }

  return (
    <div
      className="overflow-hidden border-y bg-secondary/40 py-6"
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
