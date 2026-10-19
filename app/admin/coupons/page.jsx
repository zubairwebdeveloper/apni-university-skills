// app/admin/coupons/page.jsx
import Link from "next/link";
import { FiTag } from "react-icons/fi";
import { buttonVariants } from "@/components/ui/button";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { StatusSummaryCards } from "@/components/admin/StatusSummaryCards";
import { DataTableToolbar } from "@/components/admin/table/DataTableToolbar";
import { CouponsTable } from "@/components/admin/coupons/CouponsTable";
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
  COUPON_SORTS,
  couponAdminRepository,
} from "@/repositories/admin/couponAdminRepository";
import { cn } from "@/lib/utils";

export const metadata = { title: "Coupons" };

// Shared entrance-animation classes/delays — same pattern used on the other
// admin pages (fade + slide-up, respects prefers-reduced-motion).
const ENTRANCE =
  "animate-in fade-in slide-in-from-bottom-2 duration-500 motion-reduce:animate-none";
const delay = (ms) => ({
  animationDelay: `${ms}ms`,
  animationFillMode: "backwards",
});

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

  // hrefFor's own comment says it keeps search in the link — that only
  // holds if `keyword` survives, so this strips just `after` (the page
  // cursor must still reset on a status change). `linkParams` above drops
  // `keyword` too, but that's fine there: it's only used by CursorPagination.
  const { after: _after, ...statusLinkParams } = p;

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
    href: hrefFor(statusLinkParams, o.value),
    active: p.status === o.value,
  }));

  const canCreate = can(user.role, P.COUPONS_CREATE);
  const activeFilterCount = [p.status, p.range].filter(Boolean).length;
  const searching = Boolean(keyword);
  const filtered = activeFilterCount > 0 || searching;

  return (
    <>
      <div className={ENTRANCE} style={delay(0)}>
        <AdminPageHeader
          title="Coupons"
          description="Published coupons are active. Unpublish to pause one without losing its history."
          actions={
            canCreate && (
              <Link href="/admin/coupons/create" className={buttonVariants()}>
                New coupon
              </Link>
            )
          }
        />
      </div>

      <div className={ENTRANCE} style={delay(60)}>
        <StatusSummaryCards items={summary} ariaLabel="Coupons by status" />
      </div>

      <div className={cn("mt-6", ENTRANCE)} style={delay(120)}>
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

      <div className={cn("mt-4", ENTRANCE)} style={delay(180)}>
        {items.length > 0 ? (
          <>
            <CouponsTable rows={items} perms={permissionsFor(user.role)} />
            <CursorPagination
              basePath="/admin/coupons"
              params={linkParams}
              after={after}
              nextCursor={nextCursor}
            />
          </>
        ) : (
          <EmptyState
            icon={FiTag}
            title={filtered ? "No coupons match this view" : "No coupons yet"}
            description={
              filtered
                ? "Try removing a filter or searching for something else."
                : "Create your first coupon to offer a discount."
            }
            action={
              filtered ? (
                <Link
                  href="/admin/coupons"
                  className={buttonVariants({ variant: "outline" })}
                >
                  Clear filters
                </Link>
              ) : (
                canCreate && (
                  <Link
                    href="/admin/coupons/create"
                    className={buttonVariants()}
                  >
                    New coupon
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
