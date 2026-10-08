// components/public/InstructorsExplorer.jsx
"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { FiSearch, FiUsers, FiX } from "react-icons/fi";

import { InstructorCard } from "@/components/public/InstructorCard";
import { EmptyState } from "@/components/shared/EmptyState";
import {
  getInstructorBio,
  getInstructorName,
  getInstructorRole,
  getInstructorSkills,
  getInstructorStudents,
} from "@/components/public/instructorUtils";

const SORTS = [
  { value: "students", label: "Most students" },
  { value: "az", label: "A to Z" },
];

export function InstructorsExplorer({ instructors = [] }) {
  const reduce = useReducedMotion();
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

  const hasFilters = query.trim() !== "" || skill !== "All";

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

  return (
    <div>
      {/* Toolbar */}
      <div className="rounded-2xl border bg-card p-4 shadow-sm sm:p-5">
        <div className="flex flex-col gap-3 md:flex-row md:items-center">
          <div className="relative flex-1">
            <FiSearch
              aria-hidden="true"
              className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
            />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by name or skill, e.g. React, Python, Cloud"
              aria-label="Search instructors"
              className="h-11 w-full rounded-xl border bg-background pl-10 pr-10 text-sm outline-none transition-shadow placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery("")}
                aria-label="Clear search"
                className="absolute right-2.5 top-1/2 grid size-7 -translate-y-1/2 place-items-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                <FiX aria-hidden="true" className="size-4" />
              </button>
            )}
          </div>

          <div>
            <label className="sr-only" htmlFor="instructor-sort">
              Sort instructors
            </label>
            <select
              id="instructor-sort"
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="h-11 w-full rounded-xl border bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring md:w-auto"
            >
              {SORTS.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {skills.length > 1 && (
          <div
            className="mt-4 flex gap-2 overflow-x-auto pb-1 [scrollbar-width:thin]"
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
                  className={`inline-flex shrink-0 items-center gap-2 rounded-full border px-3.5 py-1.5 text-sm font-medium transition-all duration-200 ${
                    active
                      ? "border-primary bg-primary text-primary-foreground shadow-sm"
                      : "bg-background text-muted-foreground hover:border-primary/40 hover:text-foreground"
                  }`}
                >
                  {s.name}
                  <span
                    className={`rounded-full px-1.5 text-xs ${
                      active ? "bg-primary-foreground/20" : "bg-muted"
                    }`}
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
      <div
        className="mt-6 flex flex-wrap items-center justify-between gap-3"
        aria-live="polite"
      >
        <p className="text-sm text-muted-foreground">
          Showing{" "}
          <span className="font-semibold text-foreground">
            {results.length}
          </span>{" "}
          of {instructors.length} instructors
        </p>
        {hasFilters && (
          <button
            type="button"
            onClick={clearFilters}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-primary underline-offset-4 hover:underline"
          >
            <FiX aria-hidden="true" className="size-3.5" />
            Clear filters
          </button>
        )}
      </div>

      {/* Results */}
      {results.length ? (
        <motion.div
          layout={!reduce}
          className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-4"
        >
          <AnimatePresence mode="popLayout">
            {results.map((instructor, i) => (
              <motion.div
                key={instructor.id ?? instructor.slug ?? i}
                layout={!reduce}
                initial={reduce ? false : { opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3, delay: Math.min(i * 0.04, 0.3) }}
                className="min-w-0"
              >
                <InstructorCard instructor={instructor} />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      ) : (
        <div className="mt-5 rounded-2xl border border-dashed bg-card/50 p-10 text-center">
          <span className="mx-auto grid size-12 place-items-center rounded-xl bg-primary/10 text-primary">
            <FiSearch aria-hidden="true" className="size-5" />
          </span>
          <h3 className="mt-4 font-sans text-lg font-semibold">
            No instructors match your search
          </h3>
          <p className="mx-auto mt-1 max-w-md text-sm text-muted-foreground">
            Try a different name or pick another expertise.
          </p>
          <button
            type="button"
            onClick={clearFilters}
            className="mt-4 inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium transition-colors hover:bg-muted"
          >
            Reset filters
          </button>
        </div>
      )}
    </div>
  );
}
