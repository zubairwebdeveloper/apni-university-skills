// app/admin/instructors/page.jsx
import Link from "next/link";
import { FiUsers } from "react-icons/fi";
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

  const canCreate = can(user.role, P.INSTRUCTORS_CREATE);

  // What is narrowing the list right now (status, date range, search)
  const activeFilterCount = [p.status, p.range].filter(Boolean).length;
  const searching = Boolean(keyword);
  const filtered = activeFilterCount > 0 || searching;

  const summary = [
    {
      label: filtered ? "Matching instructors" : "All instructors",
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
        title="Instructors"
        description="People who teach on the platform."
        actions={
          canCreate && (
            <Link href="/admin/instructors/create" className={buttonVariants()}>
              Add instructor
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
        {items.length > 0 ? (
          <>
            <InstructorsTable rows={items} perms={permissionsFor(user.role)} />
            <CursorPagination
              basePath="/admin/instructors"
              params={linkParams}
              after={after}
              nextCursor={nextCursor}
            />
          </>
        ) : (
          <EmptyState
            icon={FiUsers}
            title={
              filtered ? "No instructors match this view" : "No instructors yet"
            }
            description={
              filtered
                ? "Try removing a filter or searching for something else."
                : "Add your first instructor to start publishing courses."
            }
            action={
              filtered ? (
                <Link
                  href="/admin/instructors"
                  className={buttonVariants({ variant: "outline" })}
                >
                  Clear filters
                </Link>
              ) : (
                canCreate && (
                  <Link
                    href="/admin/instructors/create"
                    className={buttonVariants()}
                  >
                    Add instructor
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
