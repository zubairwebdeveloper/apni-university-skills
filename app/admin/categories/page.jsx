// app/admin/categories/page.jsx
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { DataTableToolbar } from "@/components/admin/table/DataTableToolbar";
import { CategoriesTable } from "@/components/admin/categories/CategoriesTable";
import { CursorPagination } from "@/components/shared/CursorPagination";
import { requirePermission } from "@/lib/auth/authorize";
import { can, PERMISSIONS as P, permissionsFor } from "@/lib/constants/permissions";
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

  return (
    <>
      <AdminPageHeader
        title="Categories"
        description="Group courses into fields. A category page shows only its own published courses."
        actions={
          can(user.role, P.CATEGORIES_CREATE) && (
            <Link href="/admin/categories/create" className={buttonVariants()}>
              New category
            </Link>
          )
        }
      />
      <DataTableToolbar
        searchPlaceholder="Search categories…"
        total={total}
        sorts={sortOptions(
          CATEGORY_SORTS.map((s) => (s === "order" ? "order" : s)),
        )}
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
        <CategoriesTable rows={items} perms={permissionsFor(user.role)} />
        <CursorPagination
          basePath="/admin/categories"
          params={linkParams}
          after={after}
          nextCursor={nextCursor}
        />
      </div>
    </>
  );
}

