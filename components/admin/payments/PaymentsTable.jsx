// components/admin/payments/PaymentsTable.jsx
"use client";
import Link from "next/link";
import { FiCreditCard, FiEye } from "react-icons/fi";
import { EmptyState } from "@/components/shared/EmptyState";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { DataTable } from "@/components/admin/table/DataTable";
import { RowActions } from "@/components/admin/table/RowActions";
import { formatDateTime, formatPrice } from "@/lib/utils/format";

export function PaymentsTable({ rows, perms }) {
  const columns = [
    {
      key: "ref",
      header: "Reference",
      cell: (r) => (
        <Link
          href={`/admin/payments/${r.slug}`}
          className="font-mono text-sm font-medium hover:underline"
        >
          {r.slug}
        </Link>
      ),
    },
    {
      key: "student",
      header: "Student",
      className: "min-w-40",
      cell: (r) => (
        <div className="min-w-0">
          {perms.includes("students.read") && r.student?.slug ? (
            <Link
              href={`/admin/students/${r.student.slug}`}
              className="hover:underline"
            >
              {r.student.name}
            </Link>
          ) : (
            (r.student?.name ?? "Unknown")
          )}
          <p className="truncate text-xs text-muted-foreground">
            {r.student?.email}
          </p>
        </div>
      ),
    },
    {
      key: "course",
      header: "Course",
      className: "min-w-44",
      cell: (r) => r.courseTitle,
    },
    {
      key: "amount",
      header: "Amount",
      className: "whitespace-nowrap",
      cell: (r) => (
        <div>
          {formatPrice(r.amount, r.currency)}
          {r.couponCode && (
            <p className="text-xs text-muted-foreground">
              Coupon {r.couponCode}
            </p>
          )}
        </div>
      ),
    },
    {
      key: "status",
      header: "Status",
      cell: (r) => <StatusBadge status={r.status} />,
    },
    {
      key: "date",
      header: "Date",
      className: "whitespace-nowrap text-muted-foreground",
      cell: (r) => formatDateTime(r.createdAt),
    },
    {
      key: "actions",
      header: "Actions",
      srOnlyHeader: true,
      className: "w-12",
      cell: (r) => (
        <RowActions
          label={r.slug}
          items={[
            {
              key: "view",
              label: "View",
              icon: FiEye,
              href: `/admin/payments/${r.slug}`,
            },
          ]}
        />
      ),
    },
  ];
  return (
    <DataTable
      columns={columns}
      rows={rows}
      caption="Payments"
      minWidth="min-w-[960px]"
      empty={
        <EmptyState
          icon={FiCreditCard}
          title="No payments match"
          description="Payments appear here when students buy paid courses."
        />
      }
    />
  );
}

