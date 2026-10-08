"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { FiGrid, FiSearch, FiX } from "react-icons/fi";

import { Input } from "@/components/ui/input";
import { buttonVariants } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/EmptyState";
import { CategoryCard } from "@/components/public/CategoryCard";

const EASE = [0.22, 1, 0.36, 1];

const SORTS = [
  { id: "az", label: "A to Z" },
  { id: "popular", label: "Most courses" },
];

export function CategoriesExplorer({ categories }) {
  const reduce = useReducedMotion();
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState("az");

  // "Most courses" only makes sense if the data has a course count.
  const canSortByCount = categories.some(
    (c) => typeof c.courseCount === "number",
  );
  const sorts = canSortByCount ? SORTS : SORTS.slice(0, 1);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = categories.filter((c) =>
      q ? (c.name || "").toLowerCase().includes(q) : true,
    );
    return [...list].sort((a, b) =>
      sort === "popular"
        ? (b.courseCount || 0) - (a.courseCount || 0)
        : (a.name || "").localeCompare(b.name || ""),
    );
  }, [categories, query, sort]);

  return (
    <div className="min-w-0">
      {/* Toolbar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-sm">
          <FiSearch
            aria-hidden="true"
            className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search categories..."
            aria-label="Search categories"
            className="bg-card/70 pl-9 pr-9 backdrop-blur"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              aria-label="Clear search"
              className="absolute right-2 top-1/2 grid size-6 -translate-y-1/2 cursor-pointer place-items-center rounded-full text-muted-foreground outline-none transition-colors hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
            >
              <FiX aria-hidden="true" className="size-4" />
            </button>
          )}
        </div>

        {sorts.length > 1 && (
          <div
            role="group"
            aria-label="Sort categories"
            className="flex gap-2 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {sorts.map((s) => (
              <button
                key={s.id}
                type="button"
                aria-pressed={sort === s.id}
                onClick={() => setSort(s.id)}
                className={buttonVariants({
                  size: "sm",
                  variant: sort === s.id ? "default" : "outline",
                  className: "shrink-0 rounded-full",
                })}
              >
                {s.label}
              </button>
            ))}
          </div>
        )}
      </div>

      <p className="mt-4 text-sm text-muted-foreground" aria-live="polite">
        Showing{" "}
        <span className="font-medium text-foreground">{visible.length}</span> of{" "}
        {categories.length} categories
      </p>

      {/* Grid */}
      {visible.length ? (
        <motion.div
          layout={!reduce}
          className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
        >
          <AnimatePresence mode="popLayout" initial={false}>
            {visible.map((c, i) => (
              <motion.div
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
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      ) : (
        <div className="mt-8">
          <EmptyState
            icon={FiGrid}
            title="No categories found"
            description={`Nothing matches "${query}". Try a different word or clear the search.`}
          />
        </div>
      )}
    </div>
  );
}
