import { z } from "zod";
import {
  AlertCircle,
  ArrowRight,
  BookOpen,
  CreditCard,
  GraduationCap,
  Layers3,
  Users,
} from "lucide-react";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { buttonVariants } from "@/components/ui/button";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { StatusSummaryCards } from "@/components/admin/StatusSummaryCards";
import { DataTableToolbar } from "@/components/admin/table/DataTableToolbar";
import { EnrollmentsTable } from "@/components/admin/enrollments/EnrollmentsTable";
import { CursorPagination } from "@/components/shared/CursorPagination";

import { requirePermission } from "@/lib/auth/authorize";
import { PERMISSIONS as P, permissionsFor } from "@/lib/constants/permissions";

import { RANGE_OPTIONS, sortOptions } from "@/config/adminTable";
import { parseListParams, rangeFilter } from "@/lib/admin/listParams";

import {
  ENROLLMENT_SORTS,
  ENROLLMENT_STATUSES,
  enrollmentAdminRepository,
} from "@/repositories/admin/enrollmentAdminRepository";

import { userAdminRepository } from "@/repositories/admin/userAdminRepository";
import { courseAdminRepository } from "@/repositories/admin/courseAdminRepository";

export const metadata = {
  title: "Enrollments",
  description:
    "Manage student enrollments, course access, and enrollment statuses.",
};

const cap = (value) => value.charAt(0).toUpperCase() + value.slice(1);

/**
 * Preserve existing filters and sorting when changing enrollment status.
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

  return `/admin/enrollments${query ? `?${query}` : ""}`;
}

export default async function AdminEnrollmentsPage({ searchParams }) {
  const user = await requirePermission(P.ENROLLMENTS_READ);

  const p = parseListParams(await searchParams, {
    sorts: ENROLLMENT_SORTS,
    statuses: ENROLLMENT_STATUSES,
    filters: {
      course: z.string().regex(/^[a-z0-9-]{1,120}$/),
    },
  });

  // Base filters are shared by every status summary.
  const baseFilters = [...rangeFilter(p.range, "enrolledAt")];

  if (p.course) {
    baseFilters.push(["courseSlug", "==", p.course]);
  }

  const filters = [...baseFilters];

  if (p.status && p.status !== "all") {
    filters.push(["status", "==", p.status]);
  }

  let problem = null;

  // Search accepts an enrollment reference or a student's exact email.
  if (p.q) {
    if (/^enr-[a-z0-9]{6}$/i.test(p.q)) {
      filters.push(["slug", "==", p.q.toLowerCase()]);
    } else if (p.q.includes("@")) {
      const student = await userAdminRepository.findByEmail(p.q.toLowerCase());

      if (student) {
        filters.push(["studentId", "==", student.id]);
      } else {
        problem = "No account uses that email.";
      }
    } else {
      problem =
        "Search by a student's full email address or an enrollment reference (enr-…).";
    }
  }

  const statuses = ENROLLMENT_STATUSES.filter((status) => status !== "all");

  const [listing, courses, ...counts] = await Promise.all([
    problem
      ? Promise.resolve({
          items: [],
          nextCursor: null,
          total: 0,
        })
      : enrollmentAdminRepository.list({
          filters,
          sort: p.sort,
          after: p.after,
        }),

    courseAdminRepository
      .list({
        status: "published",
        limit: 100,
        sort: "name-asc",
      })
      .catch(() => ({ items: [] })),

    ...statuses.map((status) =>
      enrollmentAdminRepository.list({
        filters: [...baseFilters, ["status", "==", status]],
        sort: p.sort,
      }),
    ),
  ]);

  const names = await userAdminRepository.namesByIds(
    listing.items.map((item) => item.studentId),
  );

  const rows = listing.items.map((item) => ({
    ...item,
    student: names[item.studentId] ?? null,
  }));

  const { after, keyword, ...linkParams } = p;

  const summary = statuses.map((status, index) => ({
    key: status,
    label: cap(status),
    count: counts[index].total,
    href: hrefFor(linkParams, status),
    active: p.status === status,
  }));

  const resultCount = problem ? 0 : listing.total;

  return (
    <main className="min-w-0 space-y-6 pb-8 text-foreground">
      {/* Enrollment management header */}
      <section className="overflow-hidden rounded-2xl border border-border bg-card">
        <div className="relative">
          <div className="pointer-events-none absolute -right-12 -top-16 h-52 w-52 rounded-full bg-yellow-400/[0.07] blur-3xl" />
          <div className="pointer-events-none absolute -bottom-16 right-1/4 h-44 w-44 rounded-full bg-violet-500/[0.06] blur-3xl" />

          <div className="relative p-5 sm:p-7">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-border bg-background/70 px-3 py-1.5 text-xs font-semibold tracking-wide text-muted-foreground">
              <Layers3 className="h-3.5 w-3.5 text-violet-500" />
              STUDENT OPERATIONS
            </div>

            <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex min-w-0 items-start gap-3">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-yellow-500/20 bg-yellow-400/10 text-yellow-600 dark:text-yellow-400">
                  <GraduationCap className="h-6 w-6" />
                </div>

                <div className="min-w-0">
                  <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                    Enrollment management
                  </h1>

                  <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">
                    Track student registrations, review enrollment statuses, and
                    manage access to your published courses.
                  </p>
                </div>
              </div>

              <div className="flex shrink-0 flex-wrap gap-2">
                <div className="inline-flex h-10 items-center gap-2 rounded-xl border border-border bg-background px-3 text-sm font-medium">
                  <Users className="h-4 w-4 text-violet-500" />
                  Student records
                </div>

                <div className="inline-flex h-10 items-center gap-2 rounded-xl border border-border bg-background px-3 text-sm font-medium">
                  <CreditCard className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                  Payment-aware
                </div>
              </div>
            </div>

            <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-muted-foreground sm:text-sm">
              <span className="inline-flex items-center gap-2">
                <BookOpen className="h-4 w-4" />
                Course registrations
              </span>

              <span className="hidden h-1 w-1 rounded-full bg-border sm:block" />

              <span className="inline-flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-violet-500" />
                Enrollment lifecycle
              </span>
            </div>
          </div>

          <div className="h-px bg-border" />

          <div className="relative flex flex-wrap items-center justify-between gap-3 px-5 py-3.5 sm:px-7">
            <p className="text-sm text-muted-foreground">Enrollment overview</p>

            <p className="text-sm text-muted-foreground">
              <span className="font-semibold tabular-nums text-foreground">
                {resultCount.toLocaleString()}
              </span>{" "}
              {resultCount === 1 ? "record" : "records"} matching your selection
            </p>
          </div>
        </div>
      </section>

      {/* Enrollment status overview */}
      <section aria-label="Enrollment status overview" className="space-y-3">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-base font-semibold tracking-tight">
              Enrollment overview
            </h2>

            <p className="mt-1 text-sm text-muted-foreground">
              Monitor registrations across the available enrollment statuses.
            </p>
          </div>

          <span className="rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-medium text-muted-foreground">
            Live repository data
          </span>
        </div>

        <div className="min-w-0">
          <StatusSummaryCards
            items={summary}
            ariaLabel="Enrollments by status"
          />
        </div>
      </section>

      {/* Search and filters */}
      <section
        aria-label="Search and filter enrollments"
        className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm"
      >
        <div className="flex flex-col gap-3 border-b border-border px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
          <div>
            <h2 className="text-base font-semibold tracking-tight">
              Find enrollments
            </h2>

            <p className="mt-1 text-sm text-muted-foreground">
              Locate a registration by student email, reference, or course.
            </p>
          </div>

          <div className="inline-flex w-fit items-center gap-2 rounded-lg border border-border bg-background px-3 py-2 text-xs font-medium text-muted-foreground">
            <Layers3 className="h-3.5 w-3.5 text-violet-500" />
            Search & filters
          </div>
        </div>

        <div className="p-3 sm:p-5">
          <DataTableToolbar
            searchPlaceholder="Student email or enr-…"
            searchHint="Enter a student's exact email address or an enrollment reference."
            total={resultCount}
            sorts={sortOptions(ENROLLMENT_SORTS)}
            filters={[
              {
                key: "status",
                label: "Status",
                allLabel: "All statuses",
                options: ENROLLMENT_STATUSES.map((status) => ({
                  value: status,
                  label: cap(status),
                })),
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
                key: "range",
                label: "Enrolled",
                allLabel: "Any time",
                options: RANGE_OPTIONS,
              },
            ]}
          />
        </div>
      </section>

      {/* Search validation and lookup feedback */}
      {problem && (
        <Alert className="rounded-xl border-amber-500/30 bg-amber-500/5">
          <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400" />

          <AlertDescription className="leading-6 text-foreground">
            {problem}
          </AlertDescription>
        </Alert>
      )}

      {/* Enrollment results */}
      <section className="min-w-0 space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold tracking-tight">
              Enrollment records
            </h2>

            <p className="mt-1 text-sm text-muted-foreground">
              Review student details and manage available enrollment actions.
            </p>
          </div>

          <div className="inline-flex w-fit items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-sm">
            <Users className="h-4 w-4 text-violet-500" />

            <span className="font-medium tabular-nums">{rows.length}</span>

            <span className="text-muted-foreground">
              {rows.length === 1
                ? "record on this page"
                : "records on this page"}
            </span>
          </div>
        </div>

        <div className="min-w-0 overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
          <div className="min-w-0 p-2 sm:p-4">
            <EnrollmentsTable rows={rows} perms={permissionsFor(user.role)} />
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card px-3 py-3 sm:px-4">
          <CursorPagination
            basePath="/admin/enrollments"
            params={linkParams}
            after={after}
            nextCursor={listing.nextCursor}
          />
        </div>
      </section>

      {/* Operational note */}
      <footer className="flex items-start gap-3 rounded-xl border border-border bg-muted/30 p-4">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-violet-500/20 bg-violet-500/10 text-violet-500">
          <CreditCard className="h-4 w-4" />
        </div>

        <div className="min-w-0">
          <h3 className="text-sm font-semibold">
            Enrollment and payment integrity
          </h3>

          <p className="mt-1 text-sm leading-6 text-muted-foreground">
            Payment confirmation and refunds remain controlled by your Stripe
            integration. Use the existing enrollment actions and server-side
            authorization for any changes to student access.
          </p>
        </div>

        <ArrowRight className="ml-auto mt-1 hidden h-4 w-4 shrink-0 text-muted-foreground sm:block" />
      </footer>
    </main>
  );
}
