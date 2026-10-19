"use client";

import { useId, useMemo, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { FiGrid, FiRotateCcw, FiSearch, FiX } from "react-icons/fi";

import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { EmptyState } from "@/components/shared/EmptyState";
import { CategoryCard } from "@/components/public/CategoryCard";

const EASE = [0.22, 1, 0.36, 1];

const FOCUS_RING =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background";

const SORTS = [
  { id: "az", label: "A to Z" },
  { id: "popular", label: "Most courses" },
];

export function CategoriesExplorer({ categories = [] }) {
  const reduce = useReducedMotion();
  const uid = useId();
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState("az");

  // "Most courses" only makes sense if the data has a course count.
  const canSortByCount = categories.some(
    (c) => typeof c.courseCount === "number",
  );
  const sorts = canSortByCount ? SORTS : SORTS.slice(0, 1);
  // Falls back to A to Z if the count sort is selected but no longer valid.
  const activeSort = sorts.some((s) => s.id === sort) ? sort : "az";

  const trimmedQuery = query.trim();

  const visible = useMemo(() => {
    const q = trimmedQuery.toLowerCase();
    const list = categories.filter((c) =>
      q ? (c.name || "").toLowerCase().includes(q) : true,
    );
    return [...list].sort((a, b) =>
      activeSort === "popular"
        ? (b.courseCount || 0) - (a.courseCount || 0)
        : (a.name || "").localeCompare(b.name || ""),
    );
  }, [categories, trimmedQuery, activeSort]);

  if (!categories.length) {
    return (
      <EmptyState
        icon={FiGrid}
        title="No categories yet"
        description="Categories will show up here once they are added."
      />
    );
  }

  return (
    <div className="min-w-0">
      {/* Toolbar */}
      <div className="flex flex-col gap-3 rounded-2xl border bg-card p-3 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:p-4">
        <div className="relative w-full sm:max-w-sm">
          <FiSearch
            aria-hidden="true"
            className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Escape" && query) {
                e.preventDefault();
                setQuery("");
              }
            }}
            placeholder="Search categories..."
            aria-label="Search categories"
            className="h-10 bg-background pl-9 pr-9 [&::-webkit-search-cancel-button]:appearance-none"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              aria-label="Clear search"
              className={cn(
                "absolute right-2 top-1/2 grid size-6 -translate-y-1/2 cursor-pointer place-items-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
                FOCUS_RING,
              )}
            >
              <FiX aria-hidden="true" className="size-4" />
            </button>
          )}
        </div>

        {sorts.length > 1 && (
          <div className="flex items-center gap-3">
            <span className="hidden text-sm text-muted-foreground md:inline">
              Sort by
            </span>
            <div
              role="group"
              aria-label="Sort categories"
              className="flex w-fit max-w-full gap-1 overflow-x-auto rounded-full border bg-background p-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            >
              {sorts.map((s) => {
                const on = activeSort === s.id;
                return (
                  <button
                    key={s.id}
                    type="button"
                    aria-pressed={on}
                    onClick={() => setSort(s.id)}
                    className={cn(
                      "relative shrink-0 rounded-full px-4 py-1.5 text-sm font-medium transition-colors",
                      FOCUS_RING,
                      on
                        ? "text-primary-foreground"
                        : "text-muted-foreground hover:text-foreground",
                    )}
                  >
                    {on && (
                      <motion.span
                        layoutId={`${uid}-sort-pill`}
                        aria-hidden="true"
                        className="absolute inset-0 rounded-full bg-primary"
                        transition={
                          reduce
                            ? { duration: 0 }
                            : { type: "spring", stiffness: 420, damping: 34 }
                        }
                      />
                    )}
                    <span className="relative z-10">{s.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Result meta */}
      <div className="mt-5 flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
        <div className="flex min-w-0 flex-wrap items-center gap-2">
          <p
            role="status"
            aria-live="polite"
            className="text-sm text-muted-foreground"
          >
            Showing{" "}
            <span className="font-semibold tabular-nums text-foreground">
              {visible.length}
            </span>{" "}
            of <span className="tabular-nums">{categories.length}</span>{" "}
            categories
          </p>

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
        </div>

        {trimmedQuery && (
          <button
            type="button"
            onClick={() => setQuery("")}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-md text-sm font-medium text-primary underline-offset-4 hover:underline",
              FOCUS_RING,
            )}
          >
            <FiRotateCcw aria-hidden="true" className="size-3.5" />
            Clear search
          </button>
        )}
      </div>

      {/* Grid */}
      {visible.length ? (
        <ul className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          <AnimatePresence mode="popLayout" initial={false}>
            {visible.map((c, i) => (
              <motion.li
                key={c.id}
                layout={!reduce}
                initial={reduce ? false : { opacity: 0, y: 20, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={reduce ? undefined : { opacity: 0, scale: 0.95 }}
                transition={{
                  duration: 0.45,
                  delay: reduce ? 0 : Math.min(i, 8) * 0.05,
                  ease: EASE,
                }}
                whileHover={reduce ? undefined : { y: -4 }}
                className="min-w-0"
              >
                <CategoryCard category={c} />
              </motion.li>
            ))}
          </AnimatePresence>
        </ul>
      ) : (
        <div className="mt-8">
          <EmptyState
            icon={FiGrid}
            title="No categories found"
            description={`Nothing matches "${trimmedQuery}". Try a different word or clear the search.`}
          />
          <div className="mt-4 flex justify-center">
            <button
              type="button"
              onClick={() => setQuery("")}
              className={cn(
                "inline-flex items-center gap-2 rounded-lg border bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-muted",
                FOCUS_RING,
              )}
            >
              <FiRotateCcw aria-hidden="true" className="size-4" />
              Clear search
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
