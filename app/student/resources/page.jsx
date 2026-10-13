"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
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

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.05 } },
};
const item = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" } },
};

export default function ResourcesPage() {
  const [activeType, setActiveType] = useState("all");
  const [difficulty, setDifficulty] = useState("All");
  const [query, setQuery] = useState("");
  const [saved, setSaved] = useState(new Set());
  const [recentlyViewed, setRecentlyViewed] = useState([]);

  const filtered = useMemo(() => {
    return RESOURCES.filter((r) => {
      const matchesType = activeType === "all" || r.type === activeType;
      const matchesDifficulty =
        difficulty === "All" || r.difficulty === difficulty;
      const matchesQuery = r.title.toLowerCase().includes(query.toLowerCase());
      return matchesType && matchesDifficulty && matchesQuery;
    });
  }, [activeType, difficulty, query]);

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

  return (
    <div className="min-h-screen bg-background">
      {/* 3D banner */}
      <div className="relative h-[240px] overflow-hidden sm:h-[300px]">
        <ResourcesScene className="absolute inset-0" />
        <div className="absolute inset-0 bg-gradient-to-b from-background/10 via-background/40 to-background" />
        <div className="relative mx-auto flex h-full max-w-7xl flex-col justify-end px-4 pb-8 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              Resources
            </h1>
            <p className="mt-2 max-w-xl text-sm text-muted-foreground sm:text-base">
              Cheat sheets, articles, videos, and tools curated to support what
              you&apos;re learning.
            </p>
          </motion.div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 pb-16 pt-8 sm:px-6 lg:px-8">
        {/* Recently viewed */}
        <AnimatePresence>
          {recentlyViewed.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-6 overflow-hidden"
            >
              <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                <History className="h-4 w-4 text-primary" />
                Recently Viewed
              </div>
              <div className="mt-3 flex gap-3 overflow-x-auto pb-2">
                {recentlyViewed.map((r) => (
                  <div
                    key={r.id}
                    className="w-56 shrink-0 rounded-xl border border-border bg-card p-3"
                  >
                    <p className="truncate text-sm font-medium text-card-foreground">
                      {r.title}
                    </p>
                    <p className="text-xs text-muted-foreground">{r.type}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search resources..."
            className="pl-9"
          />
        </div>

        {/* Type filters */}
        <div className="mt-5 flex flex-wrap gap-2">
          {RESOURCE_TYPES.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setActiveType(key)}
              className={`flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs font-medium transition-colors ${
                activeType === key
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-card text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              {label}
            </button>
          ))}
        </div>

        {/* Difficulty filter */}
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <span className="text-xs text-muted-foreground">Level:</span>
          {DIFFICULTIES.map((d) => (
            <button
              key={d}
              onClick={() => setDifficulty(d)}
              className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                difficulty === d
                  ? "bg-accent text-accent-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {d}
            </button>
          ))}
        </div>

        {/* Resources grid */}
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3"
        >
          {filtered.map((resource) => (
            <motion.div key={resource.id} variants={item}>
              <ResourceCard
                resource={resource}
                saved={saved.has(resource.id)}
                onToggleSave={() => toggleSave(resource.id)}
                onOpen={() => markViewed(resource)}
              />
            </motion.div>
          ))}
        </motion.div>

        {filtered.length === 0 && (
          <div className="mt-16 flex flex-col items-center justify-center rounded-2xl border border-dashed border-border py-16 text-center">
            <BookOpen className="h-8 w-8 text-muted-foreground" />
            <p className="mt-3 text-sm text-muted-foreground">
              No resources match that search yet.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function ResourceCard({ resource, saved, onToggleSave, onOpen }) {
  const isDownload = resource.action === "download";

  return (
    <motion.div whileHover={{ y: -4 }} transition={{ duration: 0.2 }}>
      <Card className="flex h-full flex-col justify-between border-border bg-card transition-shadow hover:shadow-lg">
        <CardContent className="space-y-3 p-5">
          <div className="flex items-center justify-between">
            <Badge
              variant="secondary"
              className="bg-accent text-accent-foreground"
            >
              {resource.category}
            </Badge>
            <button
              onClick={onToggleSave}
              aria-label={saved ? "Remove bookmark" : "Save resource"}
              className="text-muted-foreground transition-colors hover:text-primary"
            >
              {saved ? (
                <BookmarkCheck className="h-4 w-4 text-primary" />
              ) : (
                <Bookmark className="h-4 w-4" />
              )}
            </button>
          </div>

          <h3 className="text-base font-semibold leading-snug text-card-foreground">
            {resource.title}
          </h3>
          <p className="text-sm leading-relaxed text-muted-foreground">
            {resource.description}
          </p>

          <div className="flex items-center gap-2 pt-1">
            <span className="rounded-md bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
              {resource.difficulty}
            </span>
            <span className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
              {resource.type}
            </span>
          </div>
        </CardContent>

        <div className="px-5 pb-5">
          <Button variant="outline" className="w-full gap-2" onClick={onOpen}>
            {isDownload ? (
              <>
                <Download className="h-4 w-4" />
                Download
              </>
            ) : (
              <>
                <ExternalLink className="h-4 w-4" />
                Open
              </>
            )}
          </Button>
        </div>
      </Card>
    </motion.div>
  );
}
