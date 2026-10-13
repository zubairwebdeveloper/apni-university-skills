"use client";

import { useState } from "react";
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

import { Badge } from "@/components/ui/badge";
import { Tilt } from "./Reveal";

const MATURITY = {
  established: {
    label: "Established",
    hint: "Mature tools and stable practices.",
  },
  emerging: {
    label: "Emerging",
    hint: "Growing quickly; tools and best practices still change.",
  },
  experimental: {
    label: "Experimental",
    hint: "Active research and early products; expect rapid change.",
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

/** Filterable overview that separates established fields from developing ones. */
export function AreasMap() {
  const [filter, setFilter] = useState("all");
  const shown =
    filter === "all" ? AREAS : AREAS.filter((a) => a.maturity === filter);

  return (
    <div>
      <div
        role="group"
        aria-label="Filter by maturity"
        className="flex flex-wrap justify-center gap-2"
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
              className={`rounded-full border px-4 py-1.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                on
                  ? "border-primary bg-primary text-primary-foreground"
                  : "bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground"
              }`}
            >
              {f.label}
              <span className="ml-1.5 opacity-80">{count}</span>
            </button>
          );
        })}
      </div>

      <p
        className="mt-3 text-center text-sm text-muted-foreground"
        aria-live="polite"
      >
        {filter === "all"
          ? "Showing every area."
          : `${MATURITY[filter].label}: ${MATURITY[filter].hint}`}
      </p>

      <ul className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {shown.map(({ icon: Icon, title, maturity, text, build, prereq }) => (
          <li key={title} className="min-w-0">
            <Tilt className="h-full" max={4}>
              <article className="flex h-full flex-col rounded-2xl border bg-card p-5 transition-colors hover:border-primary/40">
                <div className="mb-4 flex items-center justify-between gap-3">
                  <span className="grid size-11 place-items-center rounded-xl bg-primary/10 text-primary">
                    <Icon aria-hidden="true" className="size-5" />
                  </span>
                  <Badge
                    variant={
                      maturity === "established" ? "secondary" : "outline"
                    }
                  >
                    {MATURITY[maturity].label}
                  </Badge>
                </div>
                <h3 className="font-sans text-base font-semibold">{title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{text}</p>
                <dl className="mt-4 space-y-2 border-t pt-4 text-sm">
                  <div>
                    <dt className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      You can build
                    </dt>
                    <dd className="mt-0.5">{build}</dd>
                  </div>
                  <div>
                    <dt className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      Good to know first
                    </dt>
                    <dd className="mt-0.5">{prereq}</dd>
                  </div>
                </dl>
              </article>
            </Tilt>
          </li>
        ))}
      </ul>

      <p className="mx-auto mt-6 max-w-2xl text-center text-xs text-muted-foreground">
        This is a general overview of the fields. The guides and courses on this
        platform may cover only some of them.
      </p>
    </div>
  );
}
