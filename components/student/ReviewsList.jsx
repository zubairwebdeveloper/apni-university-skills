"use client";

import { useMemo, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import {
  FiArrowDown,
  FiAward,
  FiCheckCircle,
  FiClock,
  FiInfo,
  FiMessageSquare,
  FiSearch,
  FiStar,
} from "react-icons/fi";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/EmptyState";
import { Rating } from "@/components/shared/Rating";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { ReviewDialog } from "@/components/student/ReviewDialog";
import { cn } from "@/lib/utils";

function getStatusMessage(status) {
  switch (status) {
    case "approved":
      return "Your review is live and visible to other students.";
    case "pending":
      return "Your review is waiting for moderation.";
    case "rejected":
      return "Your review needs attention before it can be published.";
    case "draft":
      return "This review is currently saved as a draft.";
    default:
      return "Your review has been saved.";
  }
}

function getStatusIcon(status) {
  switch (status) {
    case "approved":
      return FiCheckCircle;
    case "pending":
      return FiClock;
    case "rejected":
      return FiInfo;
    default:
      return FiMessageSquare;
  }
}

const SORTS = [
  { value: "default", label: "Default order" },
  { value: "high", label: "Highest rating" },
  { value: "low", label: "Lowest rating" },
];

function ReviewCard({ row }) {
  const { review, updatedLabel, createdLabel } = row;
  const StatusIcon = getStatusIcon(review.status);
  const needsAttention = review.status === "rejected";

  // Cursor spotlight: CSS variables only, no re-render
  const spot = (e) => {
    const r = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty("--mx", `${e.clientX - r.left}px`);
    e.currentTarget.style.setProperty("--my", `${e.clientY - r.top}px`);
  };

  return (
    <Card
      onMouseMove={spot}
      className="group relative overflow-hidden rounded-2xl border-border p-5 shadow-sm transition-[transform,border-color,box-shadow] duration-300 hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md motion-reduce:transition-none motion-reduce:hover:translate-y-0 sm:p-6"
    >
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100 motion-reduce:hidden"
        style={{
          background:
            "radial-gradient(260px circle at var(--mx, 50%) var(--my, 50%), hsl(var(--primary) / 0.08), transparent 70%)",
        }}
      />
      <div
        aria-hidden="true"
        className="absolute inset-y-0 left-0 w-1 bg-primary/25 transition-colors group-hover:bg-primary motion-reduce:transition-none"
      />

      <div className="relative space-y-4 pl-2">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <div className="flex items-start gap-2">
              <FiAward
                aria-hidden="true"
                className="mt-1.5 size-4 shrink-0 text-primary"
              />
              <h3 className="break-words font-serif text-lg font-semibold leading-snug">
                {review.courseTitle}
              </h3>
            </div>
            <p className="mt-1 text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Course feedback
            </p>
          </div>
          <StatusBadge status={review.status} />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Rating value={review.rating} count={1} showCount={false} />
          <span className="text-sm font-medium text-foreground tabular-nums">
            {review.rating}/5
          </span>
        </div>

        {review.title && (
          <h4 className="text-base font-semibold leading-snug">
            {review.title}
          </h4>
        )}

        <div className="rounded-xl border border-border bg-muted/40 p-4">
          <p className="break-words text-sm leading-6 text-muted-foreground">
            {review.comment}
          </p>
        </div>

        <div
          className={cn(
            "flex items-start gap-2.5 rounded-xl border p-3",
            needsAttention
              ? "border-destructive/30 bg-destructive/5"
              : "border-border bg-background",
          )}
        >
          <StatusIcon
            aria-hidden="true"
            className={cn(
              "mt-0.5 size-4 shrink-0",
              needsAttention ? "text-destructive" : "text-primary",
            )}
          />
          <p
            className={cn(
              "text-sm leading-5",
              needsAttention ? "text-foreground" : "text-muted-foreground",
            )}
          >
            {getStatusMessage(review.status)}
          </p>
        </div>

        <div className="flex flex-col gap-3 border-t border-border pt-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
            <span>Updated {updatedLabel}</span>
            {createdLabel && <span>Created {createdLabel}</span>}
          </div>
          <ReviewDialog
            courseSlug={review.courseSlug}
            courseTitle={review.courseTitle}
            existing={review}
            label="Edit review"
          />
        </div>
      </div>
    </Card>
  );
}

export function ReviewsList({ rows }) {
  const reduce = useReducedMotion();
  const [status, setStatus] = useState("all");
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState("default");

  const listVariants = useMemo(
    () => ({
      hidden: {},
      show: { transition: { staggerChildren: reduce ? 0 : 0.05 } },
    }),
    [reduce],
  );
  const itemVariants = useMemo(
    () => ({
      hidden: reduce ? { opacity: 1 } : { opacity: 0, y: 14 },
      show: {
        opacity: 1,
        y: 0,
        transition: { duration: reduce ? 0 : 0.28, ease: "easeOut" },
      },
    }),
    [reduce],
  );

  const statusCounts = useMemo(() => {
    const c = { all: rows.length };
    for (const r of rows) {
      const s = r.review.status ?? "saved";
      c[s] = (c[s] ?? 0) + 1;
    }
    return c;
  }, [rows]);

  const chips = useMemo(
    () => [
      { value: "all", label: "All" },
      ...Object.keys(statusCounts)
        .filter((k) => k !== "all")
        .map((k) => ({
          value: k,
          label: k.charAt(0).toUpperCase() + k.slice(1),
        })),
    ],
    [statusCounts],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = rows.filter((r) => {
      const s = r.review.status ?? "saved";
      if (status !== "all" && s !== status) return false;
      if (
        q &&
        !`${r.review.courseTitle} ${r.review.title ?? ""} ${r.review.comment ?? ""}`
          .toLowerCase()
          .includes(q)
      )
        return false;
      return true;
    });
    if (sort === "high")
      return [...list].sort((a, b) => b.review.rating - a.review.rating);
    if (sort === "low")
      return [...list].sort((a, b) => a.review.rating - b.review.rating);
    return list;
  }, [rows, status, query, sort]);

  const nextSort = () => {
    const i = SORTS.findIndex((s) => s.value === sort);
    setSort(SORTS[(i + 1) % SORTS.length].value);
  };

  const sortLabel = SORTS.find((s) => s.value === sort)?.label;

  return (
    <div className="space-y-4">
      {rows.length > 1 && (
        <div className="space-y-3">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div
              role="group"
              aria-label="Filter by status"
              className="-mx-1 flex gap-2 overflow-x-auto px-1 py-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            >
              {chips.map((c) => (
                <button
                  key={c.value}
                  type="button"
                  onClick={() => setStatus(c.value)}
                  aria-pressed={status === c.value}
                  className={cn(
                    "relative inline-flex min-h-9 shrink-0 items-center rounded-full border px-4 py-1.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background motion-reduce:transition-none",
                    status === c.value
                      ? "border-primary text-primary-foreground"
                      : "border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-primary",
                  )}
                >
                  {status === c.value && (
                    <motion.span
                      layoutId="review-status-pill"
                      className="absolute inset-0 rounded-full bg-primary"
                      transition={{
                        type: "spring",
                        stiffness: 380,
                        damping: 30,
                      }}
                    />
                  )}
                  <span className="relative z-10">
                    {c.label}
                    <span className="ml-1.5 tabular-nums opacity-80">
                      {statusCounts[c.value] ?? 0}
                    </span>
                  </span>
                </button>
              ))}
            </div>

            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <div className="relative sm:w-64">
                <FiSearch
                  aria-hidden="true"
                  className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                />
                <Input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search your reviews..."
                  aria-label="Search your reviews"
                  className="pl-9"
                />
              </div>
              <Button
                type="button"
                variant="outline"
                onClick={nextSort}
                aria-label={`Sort order: ${sortLabel}. Activate to change.`}
                className="justify-center"
              >
                <FiArrowDown aria-hidden="true" className="size-4" />
                {sortLabel}
              </Button>
            </div>
          </div>

          <p
            className="text-sm text-muted-foreground tabular-nums"
            aria-live="polite"
          >
            Showing {filtered.length} of {rows.length} reviews
          </p>
        </div>
      )}

      {filtered.length ? (
        <motion.ul
          key={`${status}-${sort}`}
          variants={listVariants}
          initial="hidden"
          animate="show"
          className="space-y-4"
        >
          {filtered.map((row) => (
            <motion.li key={row.review.id} variants={itemVariants}>
              <ReviewCard row={row} />
            </motion.li>
          ))}
        </motion.ul>
      ) : (
        <Card className="overflow-hidden rounded-2xl border-border shadow-sm">
          <EmptyState
            icon={FiStar}
            title="No matching reviews"
            description="Try a different keyword or another status."
            action={
              <Button
                variant="outline"
                onClick={() => {
                  setStatus("all");
                  setQuery("");
                }}
              >
                Clear filters
              </Button>
            }
          />
        </Card>
      )}
    </div>
  );
}
