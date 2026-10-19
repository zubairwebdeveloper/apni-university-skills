import Link from "next/link";
import { z } from "zod";
import {
  ArrowRight,
  BookOpen,
  GraduationCap,
  Layers3,
  Plus,
  Sparkles,
} from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { StatusSummaryCards } from "@/components/admin/StatusSummaryCards";
import { DataTableToolbar } from "@/components/admin/table/DataTableToolbar";
import { CoursesTable } from "@/components/admin/courses/CoursesTable";
import { CursorPagination } from "@/components/shared/CursorPagination";

import { requirePermission } from "@/lib/auth/authorize";
import {
  can,
  PERMISSIONS as P,
  permissionsFor,
} from "@/lib/constants/permissions";

import {
  CONTENT_STATUS_OPTIONS,
  RANGE_OPTIONS,
  sortOptions,
} from "@/config/adminTable";

import { LEVELS } from "@/config/courses";
import { parseListParams, rangeFilter } from "@/lib/admin/listParams";

import {
  COURSE_SORTS,
  courseAdminRepository,
} from "@/repositories/admin/courseAdminRepository";

import { categoryAdminRepository } from "@/repositories/admin/categoryAdminRepository";
import { instructorAdminRepository } from "@/repositories/admin/instructorAdminRepository";

export const metadata = {
  title: "Courses",
  description:
    "Manage courses, publishing, pricing, and your learning catalog.",
};

const slugParam = z.string().regex(/^[a-z0-9-]{1,80}$/);

/**
 * Preserve the current filters, search and sorting while changing status.
 */
function hrefFor(params, status) {
  const qs = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (key === "status" || key === "after" || value == null || value === "") {
      continue;
    }

    qs.set(key, String(value));
  }

  if (status) {
    qs.set("status", status);
  }

  const query = qs.toString();

  return `/admin/courses${query ? `?${query}` : ""}`;
}

export default async function AdminCoursesPage({ searchParams }) {
  const user = await requirePermission(P.COURSES_READ);

  const p = parseListParams(await searchParams, {
    sorts: COURSE_SORTS,
    filters: {
      category: slugParam,
      instructor: slugParam,
      price: z.enum(["free", "paid"]),
      level: z.enum(LEVELS.map((level) => level.value)),
      featured: z.literal("yes"),
    },
  });

  const filters = [...rangeFilter(p.range)];

  if (p.category) {
    filters.push(["categorySlug", "==", p.category]);
  }

  if (p.instructor) {
    filters.push(["instructorSlug", "==", p.instructor]);
  }

  if (p.price) {
    filters.push(["isFree", "==", p.price === "free"]);
  }

  if (p.level) {
    filters.push(["level", "==", p.level]);
  }

  if (p.featured) {
    filters.push(["featured", "==", true]);
  }

  // Status totals use the selected filters, excluding status and search.
  const [{ items, nextCursor, total }, categories, instructors, ...counts] =
    await Promise.all([
      courseAdminRepository.list({
        status: p.status,
        keyword: p.keyword,
        sort: p.sort,
        after: p.after,
        filters,
      }),

      categoryAdminRepository.options(),
      instructorAdminRepository.options(),

      ...CONTENT_STATUS_OPTIONS.map((option) =>
        courseAdminRepository.list({
          status: option.value,
          sort: p.sort,
          filters,
        }),
      ),
    ]);

  // Keep search and filters when navigating between pages.
  const { after, ...linkParams } = p;

  const summary = CONTENT_STATUS_OPTIONS.map((option, index) => ({
    key: option.value,
    label: option.label,
    count: counts[index].total,
    href: hrefFor(linkParams, option.value),
    active: p.status === option.value,
  }));

  const canCreateCourse = can(user.role, P.COURSES_CREATE);

  return (
    <main className="min-w-0 space-y-6 pb-8 text-foreground">
      {/* Page heading */}
      <section className="relative overflow-hidden rounded-2xl border border-border bg-card">
        <div className="pointer-events-none absolute -right-12 -top-16 h-52 w-52 rounded-full bg-yellow-400/[0.07] blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 right-1/4 h-44 w-44 rounded-full bg-violet-500/[0.06] blur-3xl" />

        <div className="relative flex flex-col gap-5 p-5 sm:p-7 lg:flex-row lg:items-center lg:justify-between">
          <div className="min-w-0">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-border bg-background/70 px-3 py-1.5 text-xs font-semibold tracking-wide text-muted-foreground">
              <Layers3 className="h-3.5 w-3.5 text-violet-500" />
              CONTENT MANAGEMENT
            </div>

            <div className="flex items-start gap-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-yellow-500/20 bg-yellow-400/10 text-yellow-600 dark:text-yellow-400">
                <GraduationCap className="h-6 w-6" />
              </div>

              <div className="min-w-0">
                <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                  Course management
                </h1>

                <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">
                  Manage your learning catalog, organize courses, review
                  publishing status, and keep your educational content up to
                  date.
                </p>
              </div>
            </div>

            <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-muted-foreground sm:text-sm">
              <span className="inline-flex items-center gap-2">
                <BookOpen className="h-4 w-4" />
                Course catalog
              </span>

              <span className="hidden h-1 w-1 rounded-full bg-border sm:block" />

              <span className="inline-flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-violet-500" />
                Content operations
              </span>
            </div>
          </div>

          {canCreateCourse && (
            <div className="flex shrink-0 flex-col gap-2 sm:flex-row">
              <Link
                href="/admin/courses/create"
                className={buttonVariants({
                  className:
                    "h-11 w-full gap-2 rounded-xl bg-yellow-400 px-5 font-semibold text-zinc-950 shadow-sm transition-all hover:bg-yellow-300 hover:shadow-md focus-visible:ring-2 focus-visible:ring-yellow-400 focus-visible:ring-offset-2 sm:w-auto",
                })}
              >
                <Plus className="h-4 w-4" />
                Create course
                <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </div>
          )}
        </div>

        <div className="h-px bg-border" />

        <div className="relative flex flex-wrap items-center justify-between gap-3 px-5 py-3.5 sm:px-7">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span className="h-2 w-2 rounded-full bg-violet-500" />
            <span>Catalog overview</span>
          </div>

          <p className="text-sm text-muted-foreground">
            <span className="font-semibold tabular-nums text-foreground">
              {total.toLocaleString()}
            </span>{" "}
            {total === 1 ? "result" : "results"} matching your selection
          </p>
        </div>
      </section>

      {/* Status overview */}
      <section aria-label="Course status overview" className="space-y-3">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-base font-semibold tracking-tight">
              Content overview
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Review courses by their current publishing status.
            </p>
          </div>

          <span className="rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-medium text-muted-foreground">
            Status summary
          </span>
        </div>

        <div className="min-w-0">
          <StatusSummaryCards items={summary} ariaLabel="Courses by status" />
        </div>
      </section>

      {/* Search and filters */}
      <section
        aria-label="Search and filter courses"
        className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm"
      >
        <div className="flex flex-col gap-3 border-b border-border px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
          <div>
            <h2 className="text-base font-semibold tracking-tight">
              Find your courses
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Search, filter, and sort your catalog.
            </p>
          </div>

          <div className="inline-flex w-fit items-center gap-2 rounded-lg border border-border bg-background px-3 py-2 text-xs font-medium text-muted-foreground">
            <Layers3 className="h-3.5 w-3.5 text-violet-500" />
            Advanced filters
          </div>
        </div>

        <div className="p-3 sm:p-5">
          <DataTableToolbar
            searchPlaceholder="Search by title, category, instructor or tag…"
            total={total}
            sorts={sortOptions(COURSE_SORTS)}
            filters={[
              {
                key: "status",
                label: "Status",
                allLabel: "All (not in trash)",
                options: CONTENT_STATUS_OPTIONS,
              },
              {
                key: "category",
                label: "Category",
                allLabel: "All categories",
                options: categories.map((category) => ({
                  value: category.slug,
                  label: category.name,
                })),
              },
              {
                key: "instructor",
                label: "Instructor",
                allLabel: "All instructors",
                options: instructors.map((instructor) => ({
                  value: instructor.slug,
                  label: instructor.name,
                })),
              },
              {
                key: "price",
                label: "Price",
                allLabel: "Free & paid",
                options: [
                  { value: "free", label: "Free" },
                  { value: "paid", label: "Paid" },
                ],
              },
              {
                key: "level",
                label: "Level",
                allLabel: "All levels",
                options: LEVELS,
              },
              {
                key: "featured",
                label: "Featured",
                allLabel: "All",
                options: [{ value: "yes", label: "Featured only" }],
              },
              {
                key: "range",
                label: "Created",
                allLabel: "Any time",
                options: RANGE_OPTIONS,
              },
            ]}
          />
        </div>
      </section>

      {/* Course results */}
      <section className="min-w-0 space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold tracking-tight">
              Course catalog
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Manage course details and available actions from the table below.
            </p>
          </div>

          <div className="inline-flex w-fit items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-sm">
            <BookOpen className="h-4 w-4 text-violet-500" />
            <span className="font-medium tabular-nums">{items.length}</span>
            <span className="text-muted-foreground">
              {items.length === 1
                ? "course on this page"
                : "courses on this page"}
            </span>
          </div>
        </div>

        <div className="min-w-0 overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
          <div className="min-w-0 p-2 sm:p-4">
            <CoursesTable rows={items} perms={permissionsFor(user.role)} />
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card px-3 py-3 sm:px-4">
          <CursorPagination
            basePath="/admin/courses"
            params={linkParams}
            after={after}
            nextCursor={nextCursor}
          />
        </div>
      </section>
    </main>
  );
}
