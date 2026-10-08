// app/admin/instructors/page.jsx
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { DataTableToolbar } from "@/components/admin/table/DataTableToolbar";
import { InstructorsTable } from "@/components/admin/instructors/InstructorsTable";
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

export const metadata = { title: "Instructors" };

export default async function AdminInstructorsPage({ searchParams }) {
  const user = await requirePermission(P.INSTRUCTORS_READ);
  const p = parseListParams(await searchParams, { sorts: INSTRUCTOR_SORTS });
  const { items, nextCursor, total } = await instructorAdminRepository.list({
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
        title="Instructors"
        description="People who teach on the platform."
        actions={
          can(user.role, P.INSTRUCTORS_CREATE) && (
            <Link href="/admin/instructors/create" className={buttonVariants()}>
              Add instructor
            </Link>
          )
        }
      />
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
      <div className="mt-4">
        <InstructorsTable rows={items} perms={permissionsFor(user.role)} />
        <CursorPagination
          basePath="/admin/instructors"
          params={linkParams}
          after={after}
          nextCursor={nextCursor}
        />
      </div>
    </>
  );
}

