import { z } from "zod";
import {
  ArrowRight,
  Award,
  BookOpen,
  CalendarClock,
  MessageSquareText,
  ShieldCheck,
  Sparkles,
  Star,
} from "lucide-react";

import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { DataTableToolbar } from "@/components/admin/table/DataTableToolbar";
import { ReviewsTable } from "@/components/admin/reviews/ReviewsTable";
import { CursorPagination } from "@/components/shared/CursorPagination";

import { requirePermission } from "@/lib/auth/authorize";
import { PERMISSIONS as P, permissionsFor } from "@/lib/constants/permissions";

import {
  RANGE_OPTIONS,
  REVIEW_STATUS_OPTIONS,
  REVIEW_STATUSES,
  sortOptions,
} from "@/config/adminTable";

import { parseListParams, rangeFilter } from "@/lib/admin/listParams";

import {
  REVIEW_SORTS,
  reviewAdminRepository,
} from "@/repositories/admin/reviewAdminRepository";

import { courseAdminRepository } from "@/repositories/admin/courseAdminRepository";

export const metadata = {
  title: "Reviews",
};

function SummaryCard({ icon: Icon, label, value, description, accent }) {
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-border bg-card p-5 transition-all duration-300 hover:-translate-y-0.5 hover:border-foreground/15 hover:shadow-lg hover:shadow-black/[0.03]">
      <div
        className={`mb-5 flex size-11 items-center justify-center rounded-xl border ${accent}`}
      >
        <Icon className="size-5" aria-hidden="true" />
      </div>

      <p className="text-sm font-medium text-muted-foreground">{label}</p>

      <p className="mt-2 text-3xl font-bold tracking-tight text-foreground tabular-nums">
        {value}
      </p>

      <p className="mt-1 text-xs leading-5 text-muted-foreground">
        {description}
      </p>

      <ArrowRight
        className="absolute right-5 top-5 size-4 text-muted-foreground/50 transition-all duration-300 group-hover:translate-x-1 group-hover:text-foreground"
        aria-hidden="true"
      />
    </div>
  );
}

export default async function AdminReviewsPage({ searchParams }) {
  const user = await requirePermission(P.REVIEWS_READ);

  const p = parseListParams(await searchParams, {
    sorts: REVIEW_SORTS,
    statuses: REVIEW_STATUSES,
    filters: {
      course: z.string().regex(/^[a-z0-9-]{1,120}$/),
      rating: z.enum(["1", "2", "3", "4", "5"]),
    },
  });

  // Avoid requiring an additional composite index for rating equality + rating sorting.
  if (p.rating && p.sort.startsWith("rating")) {
    p.sort = "newest";
  }

  const filters = [...rangeFilter(p.range)];

  if (p.course) {
    filters.push(["courseSlug", "==", p.course]);
  }

  if (p.rating) {
    filters.push(["rating", "==", Number(p.rating)]);
  }

  const [{ items, nextCursor, total }, courses] = await Promise.all([
    reviewAdminRepository.list({
      status: p.status,
      sort: p.sort,
      after: p.after,
      filters,
    }),

    courseAdminRepository
      .list({
        status: "published",
        limit: 100,
        sort: "name-asc",
      })
      .catch(() => ({ items: [] })),
  ]);

  const { after, keyword, q, ...linkParams } = p;

  const activeFilters = [
    Boolean(p.status && p.status !== "all"),
    Boolean(p.course),
    Boolean(p.rating),
    Boolean(p.range),
  ].filter(Boolean).length;

  return (
    <div className="space-y-6">
      {/* Page introduction */}
      <section className="rounded-2xl border border-border bg-card p-5 sm:p-7">
        <div className="mb-5 flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-2 rounded-full border border-yellow-500/25 bg-yellow-400/10 px-3 py-1.5 text-xs font-semibold text-yellow-700 dark:text-yellow-300">
            <Star className="size-3.5 fill-current" aria-hidden="true" />
            Student feedback
          </span>

          <span className="inline-flex items-center gap-2 rounded-full border border-purple-500/20 bg-purple-500/10 px-3 py-1.5 text-xs font-semibold text-purple-700 dark:text-purple-300">
            <ShieldCheck className="size-3.5" aria-hidden="true" />
            Review moderation
          </span>
        </div>

        <AdminPageHeader
          title="Reviews"
          description="Manage student feedback and maintain the quality of your learning platform. Approved reviews appear publicly and contribute to course and instructor ratings."
        />
      </section>

      {/* Overview cards */}
      <section
        aria-label="Review overview"
        className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3"
      >
        <SummaryCard
          icon={MessageSquareText}
          label="Matching reviews"
          value={typeof total === "number" ? total : "–"}
          description="Reviews matching the selected filters"
          accent="border-yellow-500/20 bg-yellow-400/10 text-yellow-600 dark:text-yellow-400"
        />

        <SummaryCard
          icon={BookOpen}
          label="On this page"
          value={items.length}
          description="Review records in the current result set"
          accent="border-purple-500/20 bg-purple-500/10 text-purple-600 dark:text-purple-400"
        />

        <SummaryCard
          icon={CalendarClock}
          label="Active filters"
          value={activeFilters}
          description={
            activeFilters
              ? "Status, course, rating or date filters applied"
              : "Showing reviews without extra filters"
          }
          accent="border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
        />
      </section>

      {/* Moderation guidance */}
      <section className="flex flex-col gap-4 rounded-2xl border border-purple-500/20 bg-purple-500/[0.04] p-4 sm:flex-row sm:items-start sm:p-5">
        <div className="flex size-11 shrink-0 items-center justify-center rounded-xl border border-purple-500/20 bg-purple-500/10 text-purple-600 dark:text-purple-400">
          <Award className="size-5" aria-hidden="true" />
        </div>

        <div className="min-w-0 flex-1">
          <h2 className="font-semibold text-foreground">
            Keep student feedback trustworthy
          </h2>

          <p className="mt-1 text-sm leading-6 text-muted-foreground">
            Only approved reviews appear publicly. Approving or removing a
            review can update the associated course and instructor ratings
            through your existing review workflow.
          </p>
        </div>

        <span className="inline-flex w-fit shrink-0 items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-medium text-muted-foreground">
          <Sparkles
            className="size-3.5 text-yellow-600 dark:text-yellow-400"
            aria-hidden="true"
          />
          Quality first
        </span>
      </section>

      {/* Filters and results */}
      <section className="overflow-hidden rounded-2xl border border-border bg-card">
        <div className="flex flex-col gap-3 border-b border-border p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
          <div className="flex items-start gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-yellow-500/20 bg-yellow-400/10 text-yellow-700 dark:text-yellow-300">
              <Star className="size-5" aria-hidden="true" />
            </div>

            <div>
              <h2 className="font-semibold tracking-tight text-foreground">
                Review management
              </h2>

              <p className="mt-1 text-sm text-muted-foreground">
                Filter feedback by status, course, star rating and submission
                date.
              </p>
            </div>
          </div>

          <span className="inline-flex w-fit items-center gap-2 rounded-full border border-border bg-muted/50 px-3 py-1.5 text-xs font-medium text-muted-foreground">
            <span className="size-2 rounded-full bg-purple-500" />
            {typeof total === "number" ? total : items.length} results
          </span>
        </div>

        <div className="p-4 sm:p-5">
          <DataTableToolbar
            searchable={false}
            total={total}
            sorts={sortOptions(REVIEW_SORTS)}
            filters={[
              {
                key: "status",
                label: "Status",
                allLabel: "All (not in trash)",
                options: REVIEW_STATUS_OPTIONS,
              },
              {
                key: "course",
                label: "Course",
                allLabel: "All courses",
                options: courses.items.map((course) => ({
                  value: course.slug,
                  label: course.title,
                })),
              },
              {
                key: "rating",
                label: "Rating",
                allLabel: "Any rating",
                options: [5, 4, 3, 2, 1].map((rating) => ({
                  value: String(rating),
                  label: `${rating} ${rating === 1 ? "star" : "stars"}`,
                })),
              },
              {
                key: "range",
                label: "Submitted",
                allLabel: "Any time",
                options: RANGE_OPTIONS,
              },
            ]}
          />
        </div>

        {items.length > 0 ? (
          <>
            <div className="border-t border-border">
              <ReviewsTable rows={items} perms={permissionsFor(user.role)} />
            </div>

            <div className="flex flex-col gap-2 border-t border-border bg-muted/20 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5">
              <p className="text-xs text-muted-foreground">
                Review actions follow your existing permission and moderation
                rules.
              </p>

              <p className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                <ShieldCheck
                  className="size-3.5 text-emerald-600 dark:text-emerald-400"
                  aria-hidden="true"
                />
                Moderated feedback
              </p>
            </div>
          </>
        ) : (
          <div className="border-t border-border px-5 py-12 text-center sm:py-16">
            <div className="mx-auto flex size-14 items-center justify-center rounded-2xl border border-purple-500/20 bg-purple-500/10 text-purple-600 dark:text-purple-400">
              <MessageSquareText className="size-6" aria-hidden="true" />
            </div>

            <h3 className="mt-4 text-base font-semibold text-foreground">
              No reviews found
            </h3>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted-foreground">
              No reviews match your current filters. Try a different course,
              star rating, status or submission date range.
            </p>
          </div>
        )}
      </section>

      {/* Cursor pagination */}
      <CursorPagination
        basePath="/admin/reviews"
        params={linkParams}
        after={after}
        nextCursor={nextCursor}
      />
    </div>
  );
}
