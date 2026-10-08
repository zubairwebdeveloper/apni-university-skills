// app/admin/jobs/page.jsx
import Link from "next/link";
import { z } from "zod";
import { buttonVariants } from "@/components/ui/button";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { DataTableToolbar } from "@/components/admin/table/DataTableToolbar";
import { JobsTable } from "@/components/admin/jobs/JobsTable";
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
  return (
    <>
      <AdminPageHeader
        title="Jobs"
        description="Listings link to the employer's own application page. Expired jobs are archived automatically."
        actions={
          can(user.role, P.JOBS_CREATE) && (
            <Link href="/admin/jobs/create" className={buttonVariants()}>
              Post a job
            </Link>
          )
        }
      />
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
        <JobsTable rows={items} perms={permissionsFor(user.role)} />
        <CursorPagination
          basePath="/admin/jobs"
          params={linkParams}
          after={after}
          nextCursor={nextCursor}
        />
      </div>
    </>
  );
}

