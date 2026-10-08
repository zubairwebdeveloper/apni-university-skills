// components/admin/coupons/CouponsTable.jsx
"use client";
import Link from "next/link";
import { FiTag } from "react-icons/fi";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { LifecycleTable } from "@/components/admin/table/LifecycleTable";
import { describeCoupon } from "@/lib/utils/coupon";
import { formatDate } from "@/lib/utils/format";
import { bulkCouponAction, runCouponAction } from "@/app/actions/admin/coupons";

export function CouponsTable({ rows, perms }) {
  const columns = [
    {
      key: "code",
      header: "Code",
      cell: (r) => (
        <div>
          <Link
            href={`/admin/coupons/${r.slug}/edit`}
            className="font-mono font-medium hover:underline"
          >
            {r.code}
          </Link>
          {r.description && (
            <p className="max-w-56 truncate text-xs text-muted-foreground">
              {r.description}
            </p>
          )}
        </div>
      ),
    },
    {
      key: "discount",
      header: "Discount",
      className: "whitespace-nowrap",
      cell: describeCoupon,
    },
    {
      key: "usage",
      header: "Used",
      className: "whitespace-nowrap tabular-nums",
      cell: (r) =>
        `${r.redeemed ?? 0}${r.usageLimit ? ` / ${r.usageLimit}` : ""}${r.reserved ? ` (+${r.reserved} pending)` : ""}`,
    },
    {
      key: "valid",
      header: "Valid",
      className: "whitespace-nowrap text-muted-foreground",
      cell: (r) =>
        r.startsAt || r.expiresAt
          ? `${formatDate(r.startsAt) || "Now"} → ${formatDate(r.expiresAt) || "No end"}`
          : "Always",
    },
    {
      key: "status",
      header: "Status",
      cell: (r) => <StatusBadge status={r.status} />,
    },
    {
      key: "updated",
      header: "Updated",
      className: "whitespace-nowrap text-muted-foreground",
      cell: (r) => formatDate(r.updatedAt),
    },
  ];
  return (
    <LifecycleTable
      rows={rows}
      perms={perms}
      prefix="coupons"
      noun="Coupon"
      plural="coupons"
      caption="Coupons"
      columns={columns}
      basePath="/admin/coupons"
      titleKey="code"
      hasView={false}
      run={runCouponAction}
      bulk={bulkCouponAction}
      emptyIcon={FiTag}
      emptyTitle="No coupons match"
      minWidth="min-w-[900px]"
    />
  );
}

