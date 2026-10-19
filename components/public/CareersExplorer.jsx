// components/public/CareersExplorer.jsx
"use client";

import { useId, useMemo, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  FiChevronDown,
  FiCompass,
  FiGrid,
  FiList,
  FiRotateCcw,
  FiSearch,
  FiX,
} from "react-icons/fi";

import { cn } from "@/lib/utils";
import { CareerCard } from "@/components/public/CareerCard";
import { EmptyState } from "@/components/shared/EmptyState";
import {
  getCareerCategory,
  getCareerSkills,
  getCareerText,
  getCareerTitle,
} from "@/components/public/careerUtils";

const EASE = [0.22, 1, 0.36, 1];

const FOCUS_RING =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background";

const SORTS = [
  { value: "default", label: "Recommended" },
  { value: "az", label: "A to Z" },
  { value: "skills", label: "Most skills" },
];

const VIEWS = [
  { id: "grid", label: "Grid view", Icon: FiGrid },
  { id: "list", label: "List view", Icon: FiList },
];

export function CareersExplorer({ careers = [] }) {
  const reduce = useReducedMotion();
  const uid = useId();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [sort, setSort] = useState("default");
  const [view, setView] = useState("grid");

  const categories = useMemo(() => {
    const counts = new Map();
    careers.forEach((c) => {
      const cat = getCareerCategory(c);
      counts.set(cat, (counts.get(cat) || 0) + 1);
    });
    return [
      { name: "All", count: careers.length },
      ...[...counts.entries()]
        .sort((a, b) => b[1] - a[1])
        .map(([name, count]) => ({ name, count })),
    ];
  }, [careers]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();

    let list = careers.filter((c) => {
      if (category !== "All" && getCareerCategory(c) !== category) return false;
      if (!q) return true;
      const haystack = [
        getCareerTitle(c),
        getCareerText(c),
        getCareerCategory(c),
        ...getCareerSkills(c),
      ]
        .join(" ")
        .toLowerCase();
      return haystack.includes(q);
    });

    if (sort === "az") {
      list = [...list].sort((a, b) =>
        getCareerTitle(a).localeCompare(getCareerTitle(b)),
      );
    } else if (sort === "skills") {
      list = [...list].sort(
        (a, b) => getCareerSkills(b).length - getCareerSkills(a).length,
      );
    }
    return list;
  }, [careers, query, category, sort]);

  const trimmedQuery = query.trim();
  const hasFilters =
    trimmedQuery !== "" || category !== "All" || sort !== "default";

  function clearFilters() {
    setQuery("");
    setCategory("All");
    setSort("default");
  }

  if (!careers.length) {
    return (
      <EmptyState
        icon={FiCompass}
        title="Career guides are on the way"
        description="Run the seed script or add guides from the admin."
      />
    );
  }

  // Real categories, offered as quick picks when a search returns nothing.
  const suggestions = categories.filter((c) => c.name !== "All").slice(0, 3);

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
              placeholder="Search roles or skills, e.g. React, Python, DevOps"
              aria-label="Search career paths"
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

          <div className="flex items-center gap-3">
            {/* Sort */}
            <div className="flex flex-1 items-center gap-2 md:flex-none">
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

            {/* Layout toggle (hidden on phones, where one column is used anyway) */}
            <div
              role="group"
              aria-label="Layout"
              className="hidden items-center gap-1 rounded-xl border bg-background p-1 sm:flex"
            >
              {VIEWS.map(({ id, label, Icon }) => {
                const on = view === id;
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setView(id)}
                    aria-label={label}
                    aria-pressed={on}
                    className={cn(
                      "relative grid size-9 place-items-center rounded-lg transition-colors",
                      FOCUS_RING,
                      on
                        ? "text-primary-foreground"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground",
                    )}
                  >
                    {on && (
                      <motion.span
                        layoutId={`${uid}-view-pill`}
                        aria-hidden="true"
                        className="absolute inset-0 rounded-lg bg-primary"
                        transition={
                          reduce
                            ? { duration: 0 }
                            : { type: "spring", stiffness: 420, damping: 34 }
                        }
                      />
                    )}
                    <Icon aria-hidden="true" className="relative z-10 size-4" />
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Category chips */}
        <div
          className="-mx-1 mt-4 flex gap-2 overflow-x-auto px-1 py-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          role="group"
          aria-label="Filter by category"
        >
          {categories.map((c) => {
            const active = category === c.name;
            return (
              <button
                key={c.name}
                type="button"
                onClick={() => setCategory(c.name)}
                aria-pressed={active}
                className={cn(
                  "inline-flex shrink-0 items-center gap-2 rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors duration-200",
                  FOCUS_RING,
                  active
                    ? "border-primary bg-primary text-primary-foreground shadow-sm"
                    : "bg-background text-muted-foreground hover:border-primary/40 hover:text-foreground",
                )}
              >
                {c.name}
                <span
                  className={cn(
                    "rounded-full px-1.5 text-xs tabular-nums",
                    active
                      ? "bg-primary-foreground/20"
                      : "bg-muted text-muted-foreground",
                  )}
                >
                  {c.count}
                </span>
              </button>
            );
          })}
        </div>
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
            of <span className="tabular-nums">{careers.length}</span> career
            paths
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
          {category !== "All" && (
            <button
              type="button"
              onClick={() => setCategory("All")}
              aria-label={`Remove category filter: ${category}`}
              className={cn(
                "inline-flex max-w-[14rem] items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary transition-colors hover:bg-primary/15",
                FOCUS_RING,
              )}
            >
              <span className="truncate">{category}</span>
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
        <ul
          className={cn(
            "mt-5 grid gap-5",
            view === "grid" ? "sm:grid-cols-2 lg:grid-cols-3" : "grid-cols-1",
          )}
        >
          <AnimatePresence mode="popLayout">
            {results.map((career, i) => (
              <motion.li
                key={career.id ?? career.slug ?? i}
                layout={!reduce}
                initial={reduce ? false : { opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.96 }}
                transition={{
                  duration: 0.3,
                  ease: EASE,
                  delay: reduce ? 0 : Math.min(i * 0.04, 0.3),
                }}
                className="min-w-0"
              >
                <CareerCard career={career} />
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
            No roles match your search
          </h3>
          <p className="mx-auto mt-1.5 max-w-md text-sm leading-relaxed text-muted-foreground">
            {trimmedQuery
              ? `Nothing found for “${trimmedQuery}”${
                  category !== "All" ? ` in ${category}` : ""
                }. Try a different keyword or pick another category.`
              : "Try a different keyword or pick another category."}
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
                    setCategory(s.name);
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
