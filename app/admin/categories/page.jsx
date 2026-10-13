// app/admin/categories/page.jsx
import Link from "next/link";
import { FiGrid } from "react-icons/fi";
import { buttonVariants } from "@/components/ui/button";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { DataTableToolbar } from "@/components/admin/table/DataTableToolbar";
import { CategoriesTable } from "@/components/admin/categories/CategoriesTable";
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
  CATEGORY_SORTS,
  categoryAdminRepository,
} from "@/repositories/admin/categoryAdminRepository";

export const metadata = { title: "Categories" };

export default async function AdminCategoriesPage({ searchParams }) {
  const user = await requirePermission(P.CATEGORIES_READ);
  const p = parseListParams(await searchParams, { sorts: CATEGORY_SORTS });
  const { items, nextCursor, total } = await categoryAdminRepository.list({
    status: p.status,
    keyword: p.keyword,
    sort: p.sort,
    after: p.after,
    filters: rangeFilter(p.range),
  });
  const { after, keyword, ...linkParams } = p;

  const canCreate = can(user.role, P.CATEGORIES_CREATE);

  // What is narrowing the list right now (status, date range, search)
  const activeFilterCount = [p.status, p.range].filter(Boolean).length;
  const searching = Boolean(keyword);
  const filtered = activeFilterCount > 0 || searching;

  const summary = [
    {
      label: filtered ? "Matching categories" : "All categories",
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
        title="Categories"
        description="Group courses into fields. A category page shows only its own published courses."
        actions={
          canCreate && (
            <Link href="/admin/categories/create" className={buttonVariants()}>
              New category
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
        searchPlaceholder="Search categories…"
        total={total}
        sorts={sortOptions(CATEGORY_SORTS)}
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
            <CategoriesTable rows={items} perms={permissionsFor(user.role)} />
            <CursorPagination
              basePath="/admin/categories"
              params={linkParams}
              after={after}
              nextCursor={nextCursor}
            />
          </>
        ) : (
          <EmptyState
            icon={FiGrid}
            title={
              filtered ? "No categories match this view" : "No categories yet"
            }
            description={
              filtered
                ? "Try removing a filter or searching for something else."
                : "Create your first category to start grouping courses."
            }
            action={
              filtered ? (
                <Link
                  href="/admin/categories"
                  className={buttonVariants({ variant: "outline" })}
                >
                  Clear filters
                </Link>
              ) : (
                canCreate && (
                  <Link
                    href="/admin/categories/create"
                    className={buttonVariants()}
                  >
                    New category
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
