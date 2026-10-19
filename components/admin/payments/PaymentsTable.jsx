// components/admin/payments/PaymentsTable.jsx
"use client";
import { useMemo } from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { FiCreditCard, FiEye, FiHash, FiTag } from "react-icons/fi";
import { EmptyState } from "@/components/shared/EmptyState";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { DataTable } from "@/components/admin/table/DataTable";
import { RowActions } from "@/components/admin/table/RowActions";
import { formatDateTime, formatPrice } from "@/lib/utils/format";

const focusRing =
  "rounded-sm outline-none focus-visible:ring-2 focus-visible:ring-yellow-400/70 focus-visible:ring-offset-2 focus-visible:ring-offset-background";

function getInitials(name) {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  const first = parts[0][0] ?? "";
  const last = parts.length > 1 ? (parts[parts.length - 1][0] ?? "") : "";
  return (first + last).toUpperCase() || "?";
}

function StudentAvatar({ name }) {
  return (
    <span
      aria-hidden="true"
      className="flex size-9 shrink-0 items-center justify-center rounded-full border border-violet-500/20 bg-violet-500/10 text-xs font-semibold tracking-wide text-violet-600 dark:text-violet-300"
    >
      {getInitials(name)}
    </span>
  );
}

export function PaymentsTable({ rows, perms }) {
  const reduceMotion = useReducedMotion();

  const columns = useMemo(
    () => [
      {
        key: "ref",
        header: "Reference",
        cell: (r) => (
          <Link
            href={`/admin/payments/${r.slug}`}
            className={`group/ref inline-flex items-center gap-1.5 rounded-md border border-border bg-muted/40 px-2 py-1 font-mono text-xs font-medium text-foreground transition-colors hover:border-yellow-400/60 hover:bg-yellow-400/10 ${focusRing}`}
          >
            <FiHash
              aria-hidden="true"
              className="size-3 text-muted-foreground transition-colors group-hover/ref:text-yellow-600 dark:group-hover/ref:text-yellow-400"
            />
            <span className="truncate">{r.slug}</span>
          </Link>
        ),
      },
      {
        key: "student",
        header: "Student",
        className: "min-w-52",
        cell: (r) => {
          const name = r.student?.name ?? "Unknown";
          const canLink = perms.includes("students.read") && r.student?.slug;
          return (
            <div className="flex min-w-0 items-center gap-3">
              <StudentAvatar name={r.student?.name} />
              <div className="min-w-0">
                {canLink ? (
                  <Link
                    href={`/admin/students/${r.student.slug}`}
                    className={`block truncate text-sm font-medium leading-5 text-foreground transition-colors hover:text-violet-600 hover:underline dark:hover:text-violet-300 ${focusRing}`}
                  >
                    {name}
                  </Link>
                ) : (
                  <span
                    className={`block truncate text-sm font-medium leading-5 ${
                      r.student?.name
                        ? "text-foreground"
                        : "text-muted-foreground"
                    }`}
                  >
                    {name}
                  </span>
                )}
                {r.student?.email && (
                  <p className="truncate text-xs leading-5 text-muted-foreground">
                    {r.student.email}
                  </p>
                )}
              </div>
            </div>
          );
        },
      },
      {
        key: "course",
        header: "Course",
        className: "min-w-44",
        cell: (r) => (
          <span className="line-clamp-2 text-sm font-medium leading-5 text-foreground">
            {r.courseTitle}
          </span>
        ),
      },
      {
        key: "amount",
        header: "Amount",
        className: "whitespace-nowrap",
        cell: (r) => (
          <div className="flex flex-col items-start gap-1">
            <span className="text-sm font-semibold tabular-nums tracking-tight text-foreground">
              {formatPrice(r.amount, r.currency)}
            </span>
            {r.couponCode && (
              <span className="inline-flex items-center gap-1 rounded-full border border-yellow-400/30 bg-yellow-400/10 px-2 py-0.5 text-[11px] font-medium leading-4 text-yellow-700 dark:text-yellow-300">
                <FiTag aria-hidden="true" className="size-3" />
                <span className="sr-only">Coupon </span>
                <span className="font-mono">{r.couponCode}</span>
              </span>
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
        className:
          "whitespace-nowrap text-sm tabular-nums text-muted-foreground",
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
    ],
    [perms],
  );

  return (
    <motion.div
      initial={reduceMotion ? false : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="w-full min-w-0"
    >
      <DataTable
        columns={columns}
        rows={rows}
        caption="Payments"
        minWidth="min-w-[960px]"
        empty={
          <EmptyState
            icon={FiCreditCard}
            title="No payments match"
            description="Payments appear here when students buy paid courses. If you expected results, try adjusting your filters."
          />
        }
      />
    </motion.div>
  );
}
