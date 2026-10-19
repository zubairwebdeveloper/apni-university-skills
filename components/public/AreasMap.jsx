"use client";

import { useId, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  FiBox,
  FiCloud,
  FiCpu,
  FiDatabase,
  FiGitBranch,
  FiGlobe,
  FiShield,
  FiTool,
  FiWifi,
  FiZap,
} from "react-icons/fi";

import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Tilt } from "./Reveal";

const EASE = [0.22, 1, 0.36, 1];

const FOCUS_RING =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background";

const MATURITY = {
  established: {
    label: "Established",
    hint: "Mature tools and stable practices.",
    level: 3,
  },
  emerging: {
    label: "Emerging",
    hint: "Growing quickly; tools and best practices still change.",
    level: 2,
  },
  experimental: {
    label: "Experimental",
    hint: "Active research and early products; expect rapid change.",
    level: 1,
  },
};

// General overview of the fields, not a list of what this platform has published.
const AREAS = [
  {
    icon: FiCpu,
    title: "Generative AI and AI agents",
    maturity: "emerging",
    text: "Models that write, reason and act, and agents that use tools to finish multi-step tasks.",
    build: "A retrieval-based assistant or a tool-using agent.",
    prereq: "Python or JavaScript basics, working with APIs.",
  },
  {
    icon: FiDatabase,
    title: "Machine learning",
    maturity: "established",
    text: "Training models from data to predict, classify or recommend.",
    build: "A classifier or recommender on a real dataset.",
    prereq: "Python and basic statistics.",
  },
  {
    icon: FiZap,
    title: "Workflow automation",
    maturity: "established",
    text: "Connecting apps and services so repetitive work runs on its own.",
    build: "An automated intake, reporting or notification flow.",
    prereq: "APIs and webhooks basics.",
  },
  {
    icon: FiGlobe,
    title: "Full-stack web and SaaS",
    maturity: "established",
    text: "The frontend, backend and database work behind modern web products.",
    build: "A multi-user web app with authentication and a database.",
    prereq: "HTML, CSS and JavaScript.",
  },
  {
    icon: FiCloud,
    title: "Cloud and serverless",
    maturity: "established",
    text: "Running applications on managed infrastructure that scales on demand.",
    build: "A serverless API deployed to the cloud.",
    prereq: "Command line and one backend language.",
  },
  {
    icon: FiShield,
    title: "Cybersecurity and privacy",
    maturity: "established",
    text: "Protecting systems, data and users from misuse.",
    build: "A threat model and a hardened web app.",
    prereq: "Networking and web fundamentals.",
  },
  {
    icon: FiDatabase,
    title: "Data engineering and analytics",
    maturity: "established",
    text: "Collecting, cleaning and modelling data so people can make decisions.",
    build: "A data pipeline feeding a dashboard.",
    prereq: "SQL and one scripting language.",
  },
  {
    icon: FiGitBranch,
    title: "DevOps and platform engineering",
    maturity: "established",
    text: "Automating how software is built, tested, released and operated.",
    build: "A CI/CD pipeline with automated tests.",
    prereq: "Git and Linux basics.",
  },
  {
    icon: FiWifi,
    title: "IoT and edge computing",
    maturity: "emerging",
    text: "Connected devices that sense and process data close to where it is produced.",
    build: "A sensor node that reports to a live dashboard.",
    prereq: "Basic electronics and programming.",
  },
  {
    icon: FiBox,
    title: "AR/VR and spatial computing",
    maturity: "emerging",
    text: "Immersive 3D interfaces on headsets and phones.",
    build: "An interactive 3D or AR experience.",
    prereq: "JavaScript or C#, plus 3D basics.",
  },
  {
    icon: FiTool,
    title: "Robotics and physical AI",
    maturity: "experimental",
    text: "AI that perceives and acts in the physical world; many capabilities are still in research.",
    build: "A simulated robot completing a navigation task.",
    prereq: "Python and basic linear algebra.",
  },
];

const FILTERS = [
  { id: "all", label: "All" },
  ...Object.entries(MATURITY).map(([id, m]) => ({ id, label: m.label })),
];

/* Three small bars showing how settled a field is. Decorative: the
   maturity badge next to it carries the same information as text. */
function MaturityMeter({ level }) {
  return (
    <span aria-hidden="true" className="flex items-end gap-0.5">
      {[1, 2, 3].map((n) => (
        <span
          key={n}
          className={cn(
            "w-1 rounded-full",
            n === 1 ? "h-2" : n === 2 ? "h-3" : "h-4",
            n <= level ? "bg-primary" : "bg-border",
          )}
        />
      ))}
    </span>
  );
}

/** Filterable overview that separates established fields from developing ones. */
export function AreasMap() {
  const reduce = useReducedMotion();
  const uid = useId();
  const [filter, setFilter] = useState("all");
  const shown =
    filter === "all" ? AREAS : AREAS.filter((a) => a.maturity === filter);

  return (
    <div>
      {/* Filters */}
      <div
        role="group"
        aria-label="Filter by maturity"
        className="mx-auto flex w-fit max-w-full flex-wrap justify-center gap-1 rounded-3xl border bg-card p-1 sm:rounded-full"
      >
        {FILTERS.map((f) => {
          const count =
            f.id === "all"
              ? AREAS.length
              : AREAS.filter((a) => a.maturity === f.id).length;
          const on = filter === f.id;
          return (
            <button
              key={f.id}
              type="button"
              aria-pressed={on}
              onClick={() => setFilter(f.id)}
              className={cn(
                "relative rounded-full px-4 py-2 text-sm font-medium transition-colors",
                FOCUS_RING,
                on
                  ? "text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {on && (
                <motion.span
                  layoutId={`${uid}-pill`}
                  aria-hidden="true"
                  className="absolute inset-0 rounded-full bg-primary"
                  transition={
                    reduce
                      ? { duration: 0 }
                      : { type: "spring", stiffness: 420, damping: 34 }
                  }
                />
              )}
              <span className="relative z-10 flex items-center gap-2">
                {f.label}
                <span
                  className={cn(
                    "rounded-full px-1.5 text-[11px] tabular-nums",
                    on
                      ? "bg-primary-foreground/20"
                      : "bg-muted text-muted-foreground",
                  )}
                >
                  {count}
                </span>
              </span>
            </button>
          );
        })}
      </div>

      {/* Context line for the active filter (announced to screen readers) */}
      <div className="mx-auto mt-4 flex min-h-10 max-w-xl flex-col items-center gap-1 text-center">
        <p className="text-sm text-muted-foreground" aria-live="polite">
          {filter === "all"
            ? "Showing every area."
            : `${MATURITY[filter].label}: ${MATURITY[filter].hint}`}
        </p>
        <p className="text-xs tabular-nums text-muted-foreground/80">
          {shown.length} of {AREAS.length} areas
        </p>
      </div>

      {/* Cards */}
      <ul className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <AnimatePresence mode="popLayout" initial={false}>
          {shown.map(
            ({ icon: Icon, title, maturity, text, build, prereq }, n) => (
              <motion.li
                key={title}
                layout={!reduce}
                initial={reduce ? false : { opacity: 0, y: 12, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={reduce ? undefined : { opacity: 0, scale: 0.96 }}
                transition={{
                  duration: 0.35,
                  ease: EASE,
                  delay: reduce ? 0 : Math.min(n, 8) * 0.04,
                }}
                className="min-w-0"
              >
                <Tilt className="h-full" max={4}>
                  <article className="group flex h-full flex-col rounded-2xl border bg-card p-5 shadow-sm transition-[border-color,box-shadow] duration-200 hover:border-primary/40 hover:shadow-lg sm:p-6">
                    <div className="mb-5 flex items-start justify-between gap-3">
                      <span className="grid size-12 place-items-center rounded-xl border border-primary/20 bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                        <Icon aria-hidden="true" className="size-5" />
                      </span>
                      <div className="flex items-center gap-2">
                        <MaturityMeter level={MATURITY[maturity].level} />
                        <Badge
                          variant={
                            maturity === "established" ? "secondary" : "outline"
                          }
                        >
                          {MATURITY[maturity].label}
                        </Badge>
                      </div>
                    </div>

                    <h3 className="font-sans text-lg font-semibold leading-snug tracking-tight">
                      {title}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                      {text}
                    </p>

                    <dl className="mt-5 space-y-3 border-t pt-5 text-sm">
                      <div>
                        <dt className="text-xs font-medium uppercase tracking-wider text-primary">
                          You can build
                        </dt>
                        <dd className="mt-1 leading-relaxed">{build}</dd>
                      </div>
                      <div>
                        <dt className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                          Good to know first
                        </dt>
                        <dd className="mt-1 leading-relaxed text-muted-foreground">
                          {prereq}
                        </dd>
                      </div>
                    </dl>
                  </article>
                </Tilt>
              </motion.li>
            ),
          )}
        </AnimatePresence>
      </ul>

      <p className="mx-auto mt-8 max-w-2xl text-center text-xs leading-relaxed text-muted-foreground">
        This is a general overview of the fields. The guides and courses on this
        platform may cover only some of them.
      </p>
    </div>
  );
}
