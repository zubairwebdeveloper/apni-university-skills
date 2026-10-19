"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import {
  Search,
  FileText,
  Video,
  Wrench,
  BookOpen,
  Download,
  ExternalLink,
  Bookmark,
  BookmarkCheck,
  History,
  X,
} from "lucide-react";
import ResourcesScene from "@/components/three/scene-resources";

// ---------------------------------------------------------------------------
// TEMP DATA — replace with real resource documents from Firestore / storage
// (e.g. a `resources` collection with download URLs) once wired into the
// existing data-fetching pattern.
// ---------------------------------------------------------------------------
const RESOURCE_TYPES = [
  { key: "all", label: "All", icon: BookOpen },
  { key: "article", label: "Articles", icon: FileText },
  { key: "cheatsheet", label: "Cheat Sheets", icon: FileText },
  { key: "video", label: "Videos", icon: Video },
  { key: "tool", label: "Tools", icon: Wrench },
];

const DIFFICULTIES = ["All", "Beginner", "Intermediate", "Advanced"];

const RESOURCES = [
  {
    id: "r1",
    type: "cheatsheet",
    title: "Git Commands Cheat Sheet",
    description:
      "The commands you'll actually use day to day, grouped by workflow stage.",
    category: "Software Engineering",
    difficulty: "Beginner",
    action: "download",
  },
  {
    id: "r2",
    type: "article",
    title: "A Practical Guide to Prompt Engineering",
    description:
      "How to structure prompts for more reliable outputs, with before/after examples.",
    category: "AI & Machine Learning",
    difficulty: "Intermediate",
    action: "open",
  },
  {
    id: "r3",
    type: "video",
    title: "Docker in 20 Minutes",
    description:
      "A fast walkthrough of containers, images, and the commands you need to get started.",
    category: "Cloud Computing",
    difficulty: "Beginner",
    action: "open",
  },
  {
    id: "r4",
    type: "tool",
    title: "Regex101",
    description:
      "Test and debug regular expressions with real-time explanation.",
    category: "Software Engineering",
    difficulty: "Intermediate",
    action: "open",
  },
  {
    id: "r5",
    type: "cheatsheet",
    title: "Python Data Structures Quick Reference",
    description:
      "Lists, dicts, sets, and tuples — syntax and common operations in one page.",
    category: "Software Engineering",
    difficulty: "Beginner",
    action: "download",
  },
  {
    id: "r6",
    type: "article",
    title: "Reading a Job Description Like a Recruiter",
    description:
      "What's actually a requirement vs. a nice-to-have, and how to tailor your application.",
    category: "Career Advice",
    difficulty: "Beginner",
    action: "open",
  },
  {
    id: "r7",
    type: "article",
    title: "Designing Idempotent APIs",
    description:
      "Patterns for making retries safe in distributed systems, with real failure examples.",
    category: "Software Engineering",
    difficulty: "Advanced",
    action: "open",
  },
];

const TYPE_META = Object.fromEntries(
  RESOURCE_TYPES.filter((t) => t.key !== "all").map((t) => [
    t.key,
    {
      icon: t.icon,
      // Singular label for cards, e.g. "Cheat Sheets" -> "Cheat sheet"
      label: {
        article: "Article",
        cheatsheet: "Cheat sheet",
        video: "Video",
        tool: "Tool",
      }[t.key],
    },
  ]),
);

const LEVEL_INDEX = { Beginner: 1, Intermediate: 2, Advanced: 3 };

const focusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background";

export default function ResourcesPage() {
  const [activeType, setActiveType] = useState("all");
  const [difficulty, setDifficulty] = useState("All");
  const [query, setQuery] = useState("");
  const [saved, setSaved] = useState(new Set());
  const [recentlyViewed, setRecentlyViewed] = useState([]);
  const reduceMotion = useReducedMotion();

  const matchesQuery = (r) =>
    r.title.toLowerCase().includes(query.toLowerCase());
  const matchesDifficulty = (r) =>
    difficulty === "All" || r.difficulty === difficulty;

  const filtered = useMemo(() => {
    return RESOURCES.filter((r) => {
      const matchesType = activeType === "all" || r.type === activeType;
      const matchesDiff = difficulty === "All" || r.difficulty === difficulty;
      const matchesText = r.title.toLowerCase().includes(query.toLowerCase());
      return matchesType && matchesDiff && matchesText;
    });
  }, [activeType, difficulty, query]);

  // Counts reflect the other active filters so the numbers match what you get
  const typeCounts = useMemo(() => {
    const base = RESOURCES.filter(
      (r) => matchesDifficulty(r) && matchesQuery(r),
    );
    const counts = { all: base.length };
    base.forEach((r) => {
      counts[r.type] = (counts[r.type] ?? 0) + 1;
    });
    return counts;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [difficulty, query]);

  const hasFilters =
    activeType !== "all" || difficulty !== "All" || query.trim() !== "";

  function clearFilters() {
    setActiveType("all");
    setDifficulty("All");
    setQuery("");
  }

  function toggleSave(id) {
    setSaved((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function markViewed(resource) {
    setRecentlyViewed((prev) => {
      const withoutCurrent = prev.filter((r) => r.id !== resource.id);
      return [resource, ...withoutCurrent].slice(0, 6);
    });
  }

  const listVariants = {
    hidden: {},
    show: { transition: { staggerChildren: reduceMotion ? 0 : 0.05 } },
  };
  const itemVariants = {
    hidden: reduceMotion ? { opacity: 0 } : { opacity: 0, y: 14 },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: reduceMotion ? 0.01 : 0.35, ease: "easeOut" },
    },
    exit: { opacity: 0, transition: { duration: reduceMotion ? 0.01 : 0.15 } },
  };

  return (
    <div className="min-h-screen bg-background font-sans antialiased">
      {/* 3D banner */}
      <header className="relative h-[260px] overflow-hidden sm:h-[320px]">
        <ResourcesScene className="absolute inset-0" />
        <div className="absolute inset-0 bg-gradient-to-b from-background/10 via-background/50 to-background" />
        <div className="relative mx-auto flex h-full max-w-7xl flex-col justify-end px-4 pb-8 sm:px-6 lg:px-8">
          <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          >
            <h1 className="max-w-3xl text-balance text-4xl font-semibold leading-[1.05] tracking-tight text-foreground sm:text-5xl lg:text-6xl">
              Resources
            </h1>
            <p className="mt-3 max-w-xl text-pretty text-sm leading-relaxed text-muted-foreground sm:text-base">
              Cheat sheets, articles, videos, and tools curated to support what
              you&apos;re learning.
            </p>
          </motion.div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 pb-20 pt-6 sm:px-6 lg:px-8">
        {/* Recently viewed */}
        <AnimatePresence initial={false}>
          {recentlyViewed.length > 0 && (
            <motion.section
              aria-labelledby="recent-heading"
              initial={reduceMotion ? false : { opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: reduceMotion ? 0.01 : 0.25 }}
              className="mb-8 overflow-hidden"
            >
              <h2
                id="recent-heading"
                className="flex items-center gap-2 text-sm font-semibold text-foreground"
              >
                <History
                  className="h-4 w-4 text-violet-500"
                  aria-hidden="true"
                />
                Recently viewed
              </h2>
              <ul className="mt-3 flex gap-3 overflow-x-auto pb-2">
                {recentlyViewed.map((r) => {
                  const meta = TYPE_META[r.type];
                  const Icon = meta.icon;
                  return (
                    <li
                      key={r.id}
                      className="flex w-60 shrink-0 items-center gap-3 rounded-xl border border-border bg-card p-3"
                    >
                      <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-violet-500/10 text-violet-600 ring-1 ring-inset ring-violet-500/25 dark:text-violet-400">
                        <Icon className="h-4 w-4" aria-hidden="true" />
                      </span>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-card-foreground">
                          {r.title}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {meta.label}
                        </p>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </motion.section>
          )}
        </AnimatePresence>

        {/* Search */}
        <div className="relative max-w-md">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <Input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Search resources by title"
            placeholder="Search resources..."
            className="h-11 pl-9"
          />
        </div>

        {/* Type filters */}
        <div
          role="group"
          aria-label="Filter by resource type"
          className="mt-5 flex flex-wrap gap-2"
        >
          {RESOURCE_TYPES.map(({ key, label, icon: Icon }) => {
            const active = activeType === key;
            return (
              <button
                key={key}
                type="button"
                onClick={() => setActiveType(key)}
                aria-pressed={active}
                className={`inline-flex min-h-9 items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs font-medium transition-colors ${focusRing} ${
                  active
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-card text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                }`}
              >
                <Icon className="h-3.5 w-3.5" aria-hidden="true" />
                {label}
                <span
                  className={`tabular-nums ${
                    active
                      ? "text-primary-foreground/80"
                      : "text-muted-foreground/80"
                  }`}
                >
                  {typeCounts[key] ?? 0}
                </span>
              </button>
            );
          })}
        </div>

        {/* Difficulty filter */}
        <div
          role="group"
          aria-label="Filter by level"
          className="mt-3 flex flex-wrap items-center gap-1.5"
        >
          <span className="mr-1 text-xs text-muted-foreground">Level</span>
          {DIFFICULTIES.map((d) => (
            <button
              key={d}
              type="button"
              onClick={() => setDifficulty(d)}
              aria-pressed={difficulty === d}
              className={`min-h-8 rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${focusRing} ${
                difficulty === d
                  ? "bg-violet-500/10 text-violet-700 ring-1 ring-inset ring-violet-500/25 dark:text-violet-300"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              {d}
            </button>
          ))}
        </div>

        {/* Result summary */}
        <div
          aria-live="polite"
          className="mt-6 flex flex-wrap items-center justify-between gap-3 text-sm text-muted-foreground"
        >
          <p>
            <span className="font-medium tabular-nums text-foreground">
              {filtered.length}
            </span>{" "}
            {filtered.length === 1 ? "resource" : "resources"}
            {saved.size > 0 && (
              <>
                , <span className="tabular-nums">{saved.size}</span> saved
              </>
            )}
          </p>
          {hasFilters && (
            <button
              type="button"
              onClick={clearFilters}
              className={`inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-violet-600 hover:bg-violet-500/10 dark:text-violet-400 ${focusRing}`}
            >
              <X className="h-3 w-3" aria-hidden="true" />
              Clear filters
            </button>
          )}
        </div>

        {/* Resources grid */}
        {filtered.length > 0 ? (
          <motion.ul
            variants={listVariants}
            initial="hidden"
            animate="show"
            className="mt-4 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3"
          >
            <AnimatePresence mode="popLayout">
              {filtered.map((resource) => (
                <motion.li
                  key={resource.id}
                  variants={itemVariants}
                  exit="exit"
                  layout={!reduceMotion}
                >
                  <ResourceCard
                    resource={resource}
                    saved={saved.has(resource.id)}
                    onToggleSave={() => toggleSave(resource.id)}
                    onOpen={() => markViewed(resource)}
                    reduceMotion={reduceMotion}
                  />
                </motion.li>
              ))}
            </AnimatePresence>
          </motion.ul>
        ) : (
          <div className="mt-4 flex flex-col items-center justify-center rounded-2xl border border-dashed border-border px-6 py-16 text-center">
            <BookOpen
              className="h-8 w-8 text-muted-foreground"
              aria-hidden="true"
            />
            <p className="mt-3 text-sm font-semibold text-foreground">
              No resources match your filters
            </p>
            <p className="mt-1 max-w-sm text-sm text-muted-foreground">
              Try a different keyword, type or level.
            </p>
            <Button
              variant="outline"
              size="sm"
              className="mt-5"
              onClick={clearFilters}
            >
              Clear filters
            </Button>
          </div>
        )}
      </main>
    </div>
  );
}

function LevelDots({ difficulty }) {
  const filled = LEVEL_INDEX[difficulty] ?? 1;
  return (
    <span className="inline-flex items-center gap-1.5 rounded-md bg-muted px-2 py-1 text-[11px] font-medium text-muted-foreground">
      <span className="flex gap-0.5" aria-hidden="true">
        {[1, 2, 3].map((n) => (
          <span
            key={n}
            className={`h-1.5 w-1.5 rounded-full ${
              n <= filled ? "bg-yellow-500" : "bg-border"
            }`}
          />
        ))}
      </span>
      {difficulty}
    </span>
  );
}

function ResourceCard({ resource, saved, onToggleSave, onOpen, reduceMotion }) {
  const isDownload = resource.action === "download";
  const meta = TYPE_META[resource.type];
  const TypeIcon = meta.icon;

  return (
    <motion.article
      whileHover={reduceMotion ? undefined : { y: -4 }}
      transition={{ duration: 0.2 }}
      className="h-full"
    >
      <Card className="flex h-full flex-col justify-between border-border bg-card transition-[box-shadow,border-color] hover:border-violet-500/30 hover:shadow-lg">
        <CardContent className="space-y-3 p-5">
          <div className="flex items-center justify-between gap-2">
            <Badge
              variant="secondary"
              className="bg-violet-500/10 font-medium text-violet-700 hover:bg-violet-500/10 dark:text-violet-300"
            >
              {resource.category}
            </Badge>
            <button
              type="button"
              onClick={onToggleSave}
              aria-pressed={saved}
              aria-label={
                saved
                  ? `Remove bookmark for ${resource.title}`
                  : `Save ${resource.title}`
              }
              className={`-mr-2 grid size-9 place-items-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground ${focusRing}`}
            >
              {saved ? (
                <BookmarkCheck
                  className="h-4 w-4 text-violet-600 dark:text-violet-400"
                  aria-hidden="true"
                />
              ) : (
                <Bookmark className="h-4 w-4" aria-hidden="true" />
              )}
            </button>
          </div>

          <h3 className="text-pretty text-lg font-semibold leading-snug tracking-tight text-card-foreground">
            {resource.title}
          </h3>
          <p className="text-sm leading-relaxed text-muted-foreground">
            {resource.description}
          </p>

          <div className="flex flex-wrap items-center gap-2 pt-1">
            <LevelDots difficulty={resource.difficulty} />
            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
              <TypeIcon className="h-3.5 w-3.5" aria-hidden="true" />
              {meta.label}
            </span>
          </div>
        </CardContent>

        <div className="px-5 pb-5">
          <Button
            variant="outline"
            className="group min-h-11 w-full gap-2"
            onClick={onOpen}
          >
            {isDownload ? (
              <>
                <Download
                  className="h-4 w-4 transition-transform group-hover:translate-y-0.5 motion-reduce:transition-none motion-reduce:group-hover:translate-y-0"
                  aria-hidden="true"
                />
                Download
              </>
            ) : (
              <>
                <ExternalLink className="h-4 w-4" aria-hidden="true" />
                Open
              </>
            )}
          </Button>
        </div>
      </Card>
    </motion.article>
  );
}
