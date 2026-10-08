// components/public/TechnologyExplorer.jsx
"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { FiCpu, FiSearch, FiX } from "react-icons/fi";

import { TechnologyCard } from "@/components/public/TechnologyCard";
import { EmptyState } from "@/components/shared/EmptyState";
import {
  getTechCategory,
  getTechName,
  getTechTags,
  getTechText,
} from "@/components/public/technologyUtils";

const SORTS = [
  { value: "default", label: "Recommended" },
  { value: "az", label: "A to Z" },
];

export function TechnologyExplorer({ items = [] }) {
  const reduce = useReducedMotion();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [sort, setSort] = useState("default");

  const categories = useMemo(() => {
    const counts = new Map();
    items.forEach((t) => {
      const c = getTechCategory(t);
      if (c) counts.set(c, (counts.get(c) || 0) + 1);
    });
    return [
      { name: "All", count: items.length },
      ...[...counts.entries()]
        .sort((a, b) => b[1] - a[1])
        .map(([name, count]) => ({ name, count })),
    ];
  }, [items]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();

    let list = items.filter((t) => {
      if (category !== "All" && getTechCategory(t) !== category) return false;
      if (!q) return true;
      return [
        getTechName(t),
        getTechText(t),
        getTechCategory(t),
        ...getTechTags(t),
      ]
        .join(" ")
        .toLowerCase()
        .includes(q);
    });

    if (sort === "az") {
      list = [...list].sort((a, b) =>
        getTechName(a).localeCompare(getTechName(b)),
      );
    }
    return list;
  }, [items, query, category, sort]);

  const hasFilters = query.trim() !== "" || category !== "All";

  function clearFilters() {
    setQuery("");
    setCategory("All");
    setSort("default");
  }

  if (!items.length) {
    return <EmptyState icon={FiCpu} title="More guides are on the way" />;
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
              placeholder="Search technologies, e.g. cloud, security, data"
              aria-label="Search technologies"
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
            <label className="sr-only" htmlFor="tech-sort">
              Sort technologies
            </label>
            <select
              id="tech-sort"
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

        {categories.length > 2 && (
          <div
            className="mt-4 flex gap-2 overflow-x-auto pb-1 [scrollbar-width:thin]"
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
                  className={`inline-flex shrink-0 items-center gap-2 rounded-full border px-3.5 py-1.5 text-sm font-medium transition-all duration-200 ${
                    active
                      ? "border-primary bg-primary text-primary-foreground shadow-sm"
                      : "bg-background text-muted-foreground hover:border-primary/40 hover:text-foreground"
                  }`}
                >
                  {c.name}
                  <span
                    className={`rounded-full px-1.5 text-xs ${
                      active ? "bg-primary-foreground/20" : "bg-muted"
                    }`}
                  >
                    {c.count}
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
          of {items.length} technologies
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
          className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3"
        >
          <AnimatePresence mode="popLayout">
            {results.map((t, i) => (
              <motion.div
                key={t.id ?? t.slug ?? i}
                layout={!reduce}
                initial={reduce ? false : { opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3, delay: Math.min(i * 0.04, 0.3) }}
                className="min-w-0"
              >
                <TechnologyCard technology={t} />
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
            No technologies match your search
          </h3>
          <p className="mx-auto mt-1 max-w-md text-sm text-muted-foreground">
            Try a different keyword or pick another category.
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
