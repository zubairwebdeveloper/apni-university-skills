// app/admin/jobs/page.jsx
import Link from "next/link";
import { z } from "zod";
import { FiBriefcase } from "react-icons/fi";
import { buttonVariants } from "@/components/ui/button";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { DataTableToolbar } from "@/components/admin/table/DataTableToolbar";
import { JobsTable } from "@/components/admin/jobs/JobsTable";
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
import { EMPLOYMENT_TYPES, EXPERIENCE_LEVELS } from "@/config/jobs";
import { parseListParams, rangeFilter } from "@/lib/admin/listParams";
import {
  JOB_SORTS,
  jobAdminRepository,
} from "@/repositories/admin/jobAdminRepository";

export const metadata = { title: "Jobs" };

export default async function AdminJobsPage({ searchParams }) {
  const user = await requirePermission(P.JOBS_READ);
  const p = parseListParams(await searchParams, {
    sorts: JOB_SORTS,
    filters: {
      type: z.enum(EMPLOYMENT_TYPES.map((t) => t.value)),
      level: z.enum(EXPERIENCE_LEVELS.map((l) => l.value)),
      remote: z.literal("yes"),
      featured: z.literal("yes"),
    },
  });
  const filters = [...rangeFilter(p.range)];
  if (p.type) filters.push(["employmentType", "==", p.type]);
  if (p.level) filters.push(["experienceLevel", "==", p.level]);
  if (p.remote) filters.push(["remote", "==", true]);
  if (p.featured) filters.push(["featured", "==", true]);
  const { items, nextCursor, total } = await jobAdminRepository.list({
    status: p.status,
    keyword: p.keyword,
    sort: p.sort,
    after: p.after,
    filters,
  });
  const { after, keyword, ...linkParams } = p;

  const canCreate = can(user.role, P.JOBS_CREATE);

  // What is narrowing the list right now (status, type, level, remote, featured, date range, search)
  const activeFilterCount = [
    p.status,
    p.type,
    p.level,
    p.remote,
    p.featured,
    p.range,
  ].filter(Boolean).length;
  const searching = Boolean(keyword);
  const filtered = activeFilterCount > 0 || searching;

  const summary = [
    {
      label: filtered ? "Matching jobs" : "All jobs",
      value: typeof total === "number" ? total : "–",
    },
    { label: "On this page", value: items.length },
    {
      label: "Filters applied",
      value: activeFilterCount + (searching ? 1 : 0),
    },
  ];

  return (
    <>
      <AdminPageHeader
        title="Jobs"
        description="Listings link to the employer's own application page. Expired jobs are archived automatically."
        actions={
          canCreate && (
            <Link href="/admin/jobs/create" className={buttonVariants()}>
              Post a job
            </Link>
          )
        }
      />

      {/* Summary: a compact read-out of the current view */}
      <dl className="mb-4 grid grid-cols-3 divide-x divide-border rounded-xl border bg-card">
        {summary.map((s) => (
          <div
            key={s.label}
            className="flex flex-col-reverse items-center gap-0.5 px-3 py-3 text-center sm:flex-row sm:justify-center sm:gap-3"
          >
            <dt className="text-xs text-muted-foreground sm:text-sm">
              {s.label}
            </dt>
            <dd className="font-serif text-xl font-semibold tabular-nums text-foreground sm:text-2xl">
              {s.value}
            </dd>
          </div>
        ))}
      </dl>

      <DataTableToolbar
        searchPlaceholder="Search by title, company, location or skill…"
        total={total}
        sorts={sortOptions(JOB_SORTS)}
        filters={[
          {
            key: "status",
            label: "Status",
            allLabel: "All (not in trash)",
            options: CONTENT_STATUS_OPTIONS,
          },
          {
            key: "type",
            label: "Job type",
            allLabel: "All types",
            options: EMPLOYMENT_TYPES,
          },
          {
            key: "level",
            label: "Experience",
            allLabel: "All levels",
            options: EXPERIENCE_LEVELS,
          },
          {
            key: "remote",
            label: "Remote",
            allLabel: "All",
            options: [{ value: "yes", label: "Remote only" }],
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

      <div className="mt-4">
        {items.length > 0 ? (
          <>
            <JobsTable rows={items} perms={permissionsFor(user.role)} />
            <CursorPagination
              basePath="/admin/jobs"
              params={linkParams}
              after={after}
              nextCursor={nextCursor}
            />
          </>
        ) : (
          <EmptyState
            icon={FiBriefcase}
            title={filtered ? "No jobs match this view" : "No jobs yet"}
            description={
              filtered
                ? "Try removing a filter or searching for something else."
                : "Post your first job to get started."
            }
            action={
              filtered ? (
                <Link
                  href="/admin/jobs"
                  className={buttonVariants({ variant: "outline" })}
                >
                  Clear filters
                </Link>
              ) : (
                canCreate && (
                  <Link href="/admin/jobs/create" className={buttonVariants()}>
                    Post a job
                  </Link>
                )
              )
            }
          />
        )}
      </div>
    </>
  );
}
