// components/public/InstructorsExplorer.jsx
"use client";

import { useId, useMemo, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  FiChevronDown,
  FiRotateCcw,
  FiSearch,
  FiUsers,
  FiX,
} from "react-icons/fi";

import { cn } from "@/lib/utils";
import { InstructorCard } from "@/components/public/InstructorCard";
import { EmptyState } from "@/components/shared/EmptyState";
import {
  getInstructorBio,
  getInstructorName,
  getInstructorRole,
  getInstructorSkills,
  getInstructorStudents,
} from "@/components/public/instructorUtils";

const EASE = [0.22, 1, 0.36, 1];

const FOCUS_RING =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background";

const SORTS = [
  { value: "students", label: "Most students" },
  { value: "az", label: "A to Z" },
];

export function InstructorsExplorer({ instructors = [] }) {
  const reduce = useReducedMotion();
  const uid = useId();
  const [query, setQuery] = useState("");
  const [skill, setSkill] = useState("All");
  const [sort, setSort] = useState("students");

  const skills = useMemo(() => {
    const counts = new Map();
    instructors.forEach((i) =>
      getInstructorSkills(i).forEach((s) =>
        counts.set(s, (counts.get(s) || 0) + 1),
      ),
    );
    return [
      { name: "All", count: instructors.length },
      ...[...counts.entries()]
        .sort((a, b) => b[1] - a[1])
        .slice(0, 8)
        .map(([name, count]) => ({ name, count })),
    ];
  }, [instructors]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();

    let list = instructors.filter((i) => {
      if (skill !== "All" && !getInstructorSkills(i).includes(skill))
        return false;
      if (!q) return true;
      const haystack = [
        getInstructorName(i),
        getInstructorRole(i),
        getInstructorBio(i),
        ...getInstructorSkills(i),
      ]
        .join(" ")
        .toLowerCase();
      return haystack.includes(q);
    });

    list = [...list].sort((a, b) =>
      sort === "az"
        ? getInstructorName(a).localeCompare(getInstructorName(b))
        : getInstructorStudents(b) - getInstructorStudents(a),
    );
    return list;
  }, [instructors, query, skill, sort]);

  const trimmedQuery = query.trim();
  const hasFilters =
    trimmedQuery !== "" || skill !== "All" || sort !== "students";

  function clearFilters() {
    setQuery("");
    setSkill("All");
    setSort("students");
  }

  if (!instructors.length) {
    return (
      <EmptyState
        icon={FiUsers}
        title="Instructors joining soon"
        description="We're onboarding our first instructors."
      />
    );
  }

  // Real expertise areas from the data, offered when a search returns nothing.
  const suggestions = skills.filter((s) => s.name !== "All").slice(0, 3);

  return (
    <div>
      {/* Toolbar */}
      <div className="rounded-2xl border bg-card p-4 shadow-sm sm:p-5">
        <div className="flex flex-col gap-3 md:flex-row md:items-center">
          {/* Search */}
          <div className="relative flex-1">
            <FiSearch
              aria-hidden="true"
              className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
            />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Escape" && query) {
                  e.preventDefault();
                  setQuery("");
                }
              }}
              placeholder="Search by name or skill, e.g. React, Python, Cloud"
              aria-label="Search instructors"
              className={cn(
                "h-11 w-full rounded-xl border bg-background pl-10 pr-10 text-sm transition-colors placeholder:text-muted-foreground hover:border-primary/30 focus-visible:border-primary/50",
                "[&::-webkit-search-cancel-button]:appearance-none",
                FOCUS_RING,
              )}
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery("")}
                aria-label="Clear search"
                className={cn(
                  "absolute right-2.5 top-1/2 grid size-7 -translate-y-1/2 place-items-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
                  FOCUS_RING,
                )}
              >
                <FiX aria-hidden="true" className="size-4" />
              </button>
            )}
          </div>

          {/* Sort */}
          <div className="flex items-center gap-2">
            <label
              htmlFor={`${uid}-sort`}
              className="sr-only text-sm text-muted-foreground lg:not-sr-only lg:whitespace-nowrap"
            >
              Sort by
            </label>
            <div className="relative flex-1 md:flex-none">
              <select
                id={`${uid}-sort`}
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className={cn(
                  "h-11 w-full appearance-none rounded-xl border bg-background pl-3.5 pr-9 text-sm transition-colors hover:border-primary/30 md:w-auto",
                  FOCUS_RING,
                )}
              >
                {SORTS.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
              <FiChevronDown
                aria-hidden="true"
                className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
              />
            </div>
          </div>
        </div>

        {/* Expertise chips */}
        {skills.length > 1 && (
          <div
            className="-mx-1 mt-4 flex gap-2 overflow-x-auto px-1 py-1 [scrollbar-width:none] sm:flex-wrap sm:overflow-visible [&::-webkit-scrollbar]:hidden"
            role="group"
            aria-label="Filter by expertise"
          >
            {skills.map((s) => {
              const active = skill === s.name;
              return (
                <button
                  key={s.name}
                  type="button"
                  onClick={() => setSkill(s.name)}
                  aria-pressed={active}
                  className={cn(
                    "inline-flex shrink-0 items-center gap-2 rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors duration-200",
                    FOCUS_RING,
                    active
                      ? "border-primary bg-primary text-primary-foreground shadow-sm"
                      : "bg-background text-muted-foreground hover:border-primary/40 hover:text-foreground",
                  )}
                >
                  {s.name}
                  <span
                    className={cn(
                      "rounded-full px-1.5 text-xs tabular-nums",
                      active
                        ? "bg-primary-foreground/20"
                        : "bg-muted text-muted-foreground",
                    )}
                  >
                    {s.count}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Result meta */}
      <div className="mt-6 flex flex-wrap items-center justify-between gap-x-4 gap-y-3">
        <div className="flex min-w-0 flex-wrap items-center gap-2">
          <p
            role="status"
            aria-live="polite"
            className="text-sm text-muted-foreground"
          >
            Showing{" "}
            <span className="font-semibold tabular-nums text-foreground">
              {results.length}
            </span>{" "}
            of <span className="tabular-nums">{instructors.length}</span>{" "}
            instructors
          </p>

          {/* Removable chips for the active filters */}
          {trimmedQuery && (
            <button
              type="button"
              onClick={() => setQuery("")}
              aria-label={`Remove search filter: ${trimmedQuery}`}
              className={cn(
                "inline-flex max-w-[14rem] items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary transition-colors hover:bg-primary/15",
                FOCUS_RING,
              )}
            >
              <span className="truncate">&ldquo;{trimmedQuery}&rdquo;</span>
              <FiX aria-hidden="true" className="size-3 shrink-0" />
            </button>
          )}
          {skill !== "All" && (
            <button
              type="button"
              onClick={() => setSkill("All")}
              aria-label={`Remove expertise filter: ${skill}`}
              className={cn(
                "inline-flex max-w-[14rem] items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary transition-colors hover:bg-primary/15",
                FOCUS_RING,
              )}
            >
              <span className="truncate">{skill}</span>
              <FiX aria-hidden="true" className="size-3 shrink-0" />
            </button>
          )}
        </div>

        {hasFilters && (
          <button
            type="button"
            onClick={clearFilters}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-md text-sm font-medium text-primary underline-offset-4 hover:underline",
              FOCUS_RING,
            )}
          >
            <FiRotateCcw aria-hidden="true" className="size-3.5" />
            Clear filters
          </button>
        )}
      </div>

      {/* Results */}
      {results.length ? (
        <ul className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <AnimatePresence mode="popLayout">
            {results.map((instructor, i) => (
              <motion.li
                key={instructor.id ?? instructor.slug ?? i}
                layout={!reduce}
                initial={reduce ? false : { opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.95 }}
                transition={{
                  duration: 0.3,
                  ease: EASE,
                  delay: reduce ? 0 : Math.min(i * 0.04, 0.3),
                }}
                className="min-w-0"
              >
                <InstructorCard instructor={instructor} />
              </motion.li>
            ))}
          </AnimatePresence>
        </ul>
      ) : (
        <div className="mt-5 rounded-2xl border border-dashed bg-card/50 px-6 py-12 text-center sm:py-14">
          <span className="mx-auto grid size-12 place-items-center rounded-xl border border-primary/20 bg-primary/10 text-primary">
            <FiSearch aria-hidden="true" className="size-5" />
          </span>
          <h3 className="mt-4 font-sans text-lg font-semibold tracking-tight">
            No instructors match your search
          </h3>
          <p className="mx-auto mt-1.5 max-w-md text-sm leading-relaxed text-muted-foreground">
            {trimmedQuery
              ? `Nothing found for “${trimmedQuery}”${
                  skill !== "All" ? ` in ${skill}` : ""
                }. Try a different name or pick another expertise.`
              : "Try a different name or pick another expertise."}
          </p>

          {suggestions.length > 0 && (
            <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
              <span className="text-xs text-muted-foreground">Browse:</span>
              {suggestions.map((s) => (
                <button
                  key={s.name}
                  type="button"
                  onClick={() => {
                    setQuery("");
                    setSkill(s.name);
                  }}
                  className={cn(
                    "rounded-full border bg-background px-3 py-1 text-xs font-medium text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground",
                    FOCUS_RING,
                  )}
                >
                  {s.name}
                </button>
              ))}
            </div>
          )}

          <button
            type="button"
            onClick={clearFilters}
            className={cn(
              "mt-5 inline-flex items-center gap-2 rounded-lg border bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-muted",
              FOCUS_RING,
            )}
          >
            <FiRotateCcw aria-hidden="true" className="size-4" />
            Reset filters
          </button>
        </div>
      )}
    </div>
  );
}
