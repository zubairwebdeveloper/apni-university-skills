// app/admin/coupons/page.jsx
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { StatusSummaryCards } from "@/components/admin/StatusSummaryCards";
import { DataTableToolbar } from "@/components/admin/table/DataTableToolbar";
import { CouponsTable } from "@/components/admin/coupons/CouponsTable";
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
  COUPON_SORTS,
  couponAdminRepository,
} from "@/repositories/admin/couponAdminRepository";

export const metadata = { title: "Coupons" };

// Keeps sort / range / search in the link, swaps only the status.
function hrefFor(params, status) {
  const qs = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (k === "status" || v == null || v === "") continue;
    qs.set(k, String(v));
  }
  if (status) qs.set("status", status);
  const s = qs.toString();
  return `/admin/coupons${s ? `?${s}` : ""}`;
}

export default async function AdminCouponsPage({ searchParams }) {
  const user = await requirePermission(P.COUPONS_READ);
  const p = parseListParams(await searchParams, { sorts: COUPON_SORTS });
  const range = rangeFilter(p.range);
  const { after, keyword, ...linkParams } = p;

  // One count per status option, limited to the selected "Created" range.
  const [{ items, nextCursor, total }, ...counts] = await Promise.all([
    couponAdminRepository.list({
      status: p.status,
      keyword: p.keyword,
      sort: p.sort,
      after: p.after,
      filters: range,
    }),
    ...CONTENT_STATUS_OPTIONS.map((o) =>
      couponAdminRepository.list({
        status: o.value,
        sort: p.sort,
        filters: range,
      }),
    ),
  ]);

  const summary = CONTENT_STATUS_OPTIONS.map((o, i) => ({
    key: o.value,
    label: o.label,
    count: counts[i].total,
    href: hrefFor(linkParams, o.value),
    active: p.status === o.value,
  }));

  return (
    <>
      <AdminPageHeader
        title="Coupons"
        description="Published coupons are active. Unpublish to pause one without losing its history."
        actions={
          can(user.role, P.COUPONS_CREATE) && (
            <Link href="/admin/coupons/create" className={buttonVariants()}>
              New coupon
            </Link>
          )
        }
      />
      <StatusSummaryCards items={summary} ariaLabel="Coupons by status" />
      <div className="mt-6">
        <DataTableToolbar
          searchPlaceholder="Search by code or note…"
          total={total}
          sorts={sortOptions(COUPON_SORTS)}
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
      <div className="mt-4">
        <CouponsTable rows={items} perms={permissionsFor(user.role)} />
        <CursorPagination
          basePath="/admin/coupons"
          params={linkParams}
          after={after}
          nextCursor={nextCursor}
        />
      </div>
    </>
  );
}
