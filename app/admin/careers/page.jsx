// app/admin/careers/page.jsx
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { DataTableToolbar } from "@/components/admin/table/DataTableToolbar";
import { CareersTable } from "@/components/admin/careers/CareersTable";
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
  CAREER_SORTS,
  careerAdminRepository,
} from "@/repositories/admin/careerAdminRepository";

export const metadata = { title: "Careers" };

export default async function AdminCareersPage({ searchParams }) {
  const user = await requirePermission(P.CAREERS_READ);
  const p = parseListParams(await searchParams, { sorts: CAREER_SORTS });
  const { items, nextCursor, total } = await careerAdminRepository.list({
    status: p.status,
    keyword: p.keyword,
    sort: p.sort,
    after: p.after,
    filters: rangeFilter(p.range),
  });
  const { after, keyword, ...linkParams } = p;
  return (
    <>
      <AdminPageHeader
        title="Careers"
        description="Role guides with roadmaps, skills, interview preparation and portfolio ideas."
        actions={
          can(user.role, P.CAREERS_CREATE) && (
            <Link href="/admin/careers/create" className={buttonVariants()}>
              New guide
            </Link>
          )
        }
      />
      <DataTableToolbar
        searchPlaceholder="Search by title, summary or skill…"
        total={total}
        sorts={sortOptions(CAREER_SORTS)}
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
      <div className="mt-4">
        <CareersTable rows={items} perms={permissionsFor(user.role)} />
        <CursorPagination
          basePath="/admin/careers"
          params={linkParams}
          after={after}
          nextCursor={nextCursor}
        />
      </div>
    </>
  );
}

