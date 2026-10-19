import Link from "next/link";
import {
  ArrowRight,
  GraduationCap,
  Plus,
  Search,
  Sparkles,
  Users,
  UserRoundPlus,
  UserSearch,
} from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { DataTableToolbar } from "@/components/admin/table/DataTableToolbar";
import { InstructorsTable } from "@/components/admin/instructors/InstructorsTable";
import { EmptyState } from "@/components/shared/EmptyState";
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

import { parseListParams, rangeFilter } from "@/lib/admin/listParams";

import {
  INSTRUCTOR_SORTS,
  instructorAdminRepository,
} from "@/repositories/admin/instructorAdminRepository";

export const metadata = {
  title: "Instructors",
  description:
    "Manage instructors, teaching profiles, and educational expertise.",
};

export default async function AdminInstructorsPage({ searchParams }) {
  const user = await requirePermission(P.INSTRUCTORS_READ);

  const p = parseListParams(await searchParams, {
    sorts: INSTRUCTOR_SORTS,
  });

  const { items, nextCursor, total } = await instructorAdminRepository.list({
    status: p.status,
    keyword: p.keyword,
    sort: p.sort,
    after: p.after,
    filters: rangeFilter(p.range),
  });

  const { after, keyword, ...linkParams } = p;

  const canCreate = can(user.role, P.INSTRUCTORS_CREATE);

  // Reflect only the filters and search applied to the current view.
  const activeFilterCount = [p.status, p.range].filter(Boolean).length;
  const searching = Boolean(keyword);
  const filtered = activeFilterCount > 0 || searching;

  const filterCount = activeFilterCount + (searching ? 1 : 0);

  const summary = [
    {
      label: filtered ? "Matching instructors" : "All instructors",
      value: typeof total === "number" ? total : "–",
      icon: Users,
      accent: "text-violet-500",
      surface: "bg-violet-500/10",
    },
    {
      label: "On this page",
      value: items.length,
      icon: GraduationCap,
      accent: "text-yellow-600 dark:text-yellow-400",
      surface: "bg-yellow-400/10",
    },
    {
      label: "Filters applied",
      value: filterCount,
      icon: Search,
      accent: "text-sky-500",
      surface: "bg-sky-500/10",
    },
  ];

  return (
    <main className="min-w-0 space-y-6 pb-8 text-foreground">
      {/* Page header */}
      <section className="overflow-hidden rounded-2xl border border-border bg-card">
        <div className="relative">
          <div className="pointer-events-none absolute -right-12 -top-16 h-52 w-52 rounded-full bg-yellow-400/[0.07] blur-3xl" />
          <div className="pointer-events-none absolute -bottom-20 right-1/4 h-44 w-44 rounded-full bg-violet-500/[0.06] blur-3xl" />

          <div className="relative p-5 sm:p-7">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-border bg-background/70 px-3 py-1.5 text-xs font-semibold tracking-wide text-muted-foreground">
              <Sparkles className="h-3.5 w-3.5 text-violet-500" />
              PEOPLE & EDUCATION
            </div>

            <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex min-w-0 items-start gap-3">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-yellow-500/20 bg-yellow-400/10 text-yellow-600 dark:text-yellow-400">
                  <GraduationCap className="h-6 w-6" />
                </div>

                <div className="min-w-0">
                  <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                    Instructor management
                  </h1>

                  <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">
                    Manage teaching profiles, organize your educators, and
                    maintain a high-quality learning experience across your
                    course catalog.
                  </p>
                </div>
              </div>

              {canCreate && (
                <Link
                  href="/admin/instructors/create"
                  className={buttonVariants({
                    className:
                      "h-11 w-full shrink-0 gap-2 rounded-xl bg-yellow-400 px-5 font-semibold text-zinc-950 shadow-sm transition-all hover:bg-yellow-300 hover:shadow-md focus-visible:ring-2 focus-visible:ring-yellow-400 focus-visible:ring-offset-2 sm:w-auto",
                  })}
                >
                  <Plus className="h-4 w-4" />
                  Add instructor
                  <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              )}
            </div>

            <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-muted-foreground sm:text-sm">
              <span className="inline-flex items-center gap-2">
                <Users className="h-4 w-4 text-violet-500" />
                Educator directory
              </span>

              <span className="hidden h-1 w-1 rounded-full bg-border sm:block" />

              <span className="inline-flex items-center gap-2">
                <GraduationCap className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                Teaching profiles
              </span>
            </div>
          </div>

          <div className="h-px bg-border" />

          <div className="relative flex flex-wrap items-center justify-between gap-3 px-5 py-3.5 sm:px-7">
            <p className="text-sm text-muted-foreground">Educator directory</p>

            <p className="text-sm text-muted-foreground">
              <span className="font-semibold tabular-nums text-foreground">
                {typeof total === "number" ? total.toLocaleString() : "–"}
              </span>{" "}
              {total === 1 ? "instructor" : "instructors"}
              {filtered ? " matching your selection" : " in this view"}
            </p>
          </div>
        </div>
      </section>

      {/* Overview cards */}
      <section aria-label="Instructor overview" className="space-y-3">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-base font-semibold tracking-tight">
              Directory overview
            </h2>

            <p className="mt-1 text-sm text-muted-foreground">
              A quick summary of your current instructor listing.
            </p>
          </div>

          <span className="rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-medium text-muted-foreground">
            Current view
          </span>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {summary.map((stat) => {
            const Icon = stat.icon;

            return (
              <div
                key={stat.label}
                className="group relative overflow-hidden rounded-2xl border border-border bg-card p-4 transition-colors duration-200 hover:border-violet-500/30 sm:p-5"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-muted-foreground">
                      {stat.label}
                    </p>

                    <p className="mt-3 text-3xl font-bold tracking-tight tabular-nums">
                      {typeof stat.value === "number"
                        ? stat.value.toLocaleString()
                        : stat.value}
                    </p>
                  </div>

                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${stat.surface} ${stat.accent}`}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                </div>

                <div className="mt-4 h-1 overflow-hidden rounded-full bg-muted">
                  <div
                    className={`h-full w-1/3 rounded-full transition-all duration-300 group-hover:w-1/2 ${
                      stat.label === "On this page"
                        ? "bg-yellow-400"
                        : stat.label === "Filters applied"
                          ? "bg-sky-500"
                          : "bg-violet-500"
                    }`}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Search and filters */}
      <section
        aria-label="Search and filter instructors"
        className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm"
      >
        <div className="flex flex-col gap-3 border-b border-border px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
          <div>
            <h2 className="text-base font-semibold tracking-tight">
              Find instructors
            </h2>

            <p className="mt-1 text-sm text-muted-foreground">
              Search educator profiles and narrow the directory.
            </p>
          </div>

          <div className="inline-flex w-fit items-center gap-2 rounded-lg border border-border bg-background px-3 py-2 text-xs font-medium text-muted-foreground">
            <UserSearch className="h-3.5 w-3.5 text-violet-500" />
            Directory filters
          </div>
        </div>

        <div className="p-3 sm:p-5">
          <DataTableToolbar
            searchPlaceholder="Search by name, designation or skill…"
            total={total}
            sorts={sortOptions(INSTRUCTOR_SORTS)}
            filters={[
              {
                key: "status",
                label: "Status",
                allLabel: "All (not in trash)",
                options: CONTENT_STATUS_OPTIONS,
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

      {/* Instructor directory */}
      <section className="min-w-0 space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold tracking-tight">
              Instructor directory
            </h2>

            <p className="mt-1 text-sm text-muted-foreground">
              Review educator information and manage available actions.
            </p>
          </div>

          <div className="inline-flex w-fit items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-sm">
            <Users className="h-4 w-4 text-violet-500" />

            <span className="font-medium tabular-nums">{items.length}</span>

            <span className="text-muted-foreground">
              {items.length === 1
                ? "instructor on this page"
                : "instructors on this page"}
            </span>
          </div>
        </div>

        {items.length > 0 ? (
          <>
            <div className="min-w-0 overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
              <div className="min-w-0 p-2 sm:p-4">
                <InstructorsTable
                  rows={items}
                  perms={permissionsFor(user.role)}
                />
              </div>
            </div>

            <div className="rounded-xl border border-border bg-card px-3 py-3 sm:px-4">
              <CursorPagination
                basePath="/admin/instructors"
                params={linkParams}
                after={after}
                nextCursor={nextCursor}
              />
            </div>
          </>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-border bg-card p-4 sm:p-8">
            <EmptyState
              icon={UserRoundPlus}
              title={
                filtered
                  ? "No instructors match this view"
                  : "Your instructor directory is ready to grow"
              }
              description={
                filtered
                  ? "No instructors match the current search or filters. Clear your filters or try a different search."
                  : "Add your first instructor to build your teaching team and organize the educators behind your courses."
              }
              action={
                filtered ? (
                  <Link
                    href="/admin/instructors"
                    className={buttonVariants({
                      variant: "outline",
                      className: "gap-2 rounded-xl",
                    })}
                  >
                    <Search className="h-4 w-4" />
                    Clear filters
                  </Link>
                ) : (
                  canCreate && (
                    <Link
                      href="/admin/instructors/create"
                      className={buttonVariants({
                        className:
                          "gap-2 rounded-xl bg-yellow-400 font-semibold text-zinc-950 hover:bg-yellow-300",
                      })}
                    >
                      <Plus className="h-4 w-4" />
                      Add your first instructor
                    </Link>
                  )
                )
              }
            />
          </div>
        )}
      </section>

      {/* Helpful footer */}
      <footer className="flex items-start gap-3 rounded-xl border border-border bg-muted/30 p-4">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-violet-500/20 bg-violet-500/10 text-violet-500">
          <GraduationCap className="h-4 w-4" />
        </div>

        <div className="min-w-0">
          <h3 className="text-sm font-semibold">
            Build a stronger learning experience
          </h3>

          <p className="mt-1 text-sm leading-6 text-muted-foreground">
            Keep instructor profiles accurate and up to date so students can
            discover the educators behind your learning catalog.
          </p>
        </div>
      </footer>
    </main>
  );
}
