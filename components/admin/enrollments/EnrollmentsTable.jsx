// components/admin/enrollments/EnrollmentsTable.jsx
"use client";
import Link from "next/link";
import { FiEye, FiFolder, FiRotateCcw, FiSlash } from "react-icons/fi";
import { Progress } from "@/components/ui/progress";
import { EmptyState } from "@/components/shared/EmptyState";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { DataTable } from "@/components/admin/table/DataTable";
import { RowActions } from "@/components/admin/table/RowActions";
import { formatDate, formatPrice } from "@/lib/utils/format";
import {
  cancelEnrollment,
  reinstateEnrollment,
} from "@/app/actions/admin/enrollments";

export function EnrollmentsTable({ rows, perms }) {
  const canStudents = perms.includes("students.read");
  const canCourses = perms.includes("courses.read");
  const canEdit = perms.includes("enrollments.update");
  const columns = [
    {
      key: "student",
      header: "Student",
      className: "min-w-44",
      cell: (r) => (
        <div className="min-w-0">
          {r.student?.slug && canStudents ? (
            <Link
              href={`/admin/students/${r.student.slug}`}
              className="font-medium hover:underline"
            >
              {r.student.name}
            </Link>
          ) : (
            <span className="font-medium">
              {r.student?.name ?? "Unknown student"}
            </span>
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
      className: "min-w-48",
      cell: (r) =>
        canCourses ? (
          <Link
            href={`/admin/courses/${r.courseSlug}`}
            className="hover:underline"
          >
            {r.courseTitle}
          </Link>
        ) : (
          r.courseTitle
        ),
    },
    {
      key: "status",
      header: "Status",
      cell: (r) => <StatusBadge status={r.status} />,
    },
    {
      key: "progress",
      header: "Progress",
      className: "w-36",
      cell: (r) => (
        <div className="flex items-center gap-2">
          <Progress
            value={r.progress ?? 0}
            aria-label={`Progress ${r.progress ?? 0}%`}
            className="h-1.5"
          />
          <span className="w-9 text-xs tabular-nums text-muted-foreground">
            {r.progress ?? 0}%
          </span>
        </div>
      ),
    },
    {
      key: "paid",
      header: "Paid",
      className: "whitespace-nowrap",
      cell: (r) => (r.price > 0 ? formatPrice(r.price, r.currency) : "Free"),
    },
    {
      key: "enrolled",
      header: "Enrolled",
      className: "whitespace-nowrap text-muted-foreground",
      cell: (r) => formatDate(r.enrolledAt),
    },
    {
      key: "actions",
      header: "Actions",
      srOnlyHeader: true,
      className: "w-12",
      cell: (r) => (
        <RowActions
          label={`${r.student?.name ?? "student"} in ${r.courseTitle}`}
          items={[
            {
              key: "view",
              label: "View",
              icon: FiEye,
              href: `/admin/enrollments/${r.slug}`,
            },
            {
              key: "cancel",
              label: "Cancel enrollment",
              icon: FiSlash,
              destructive: true,
              separatorBefore: true,
              hidden: !canEdit || !["active", "completed"].includes(r.status),
              run: () => cancelEnrollment({ slug: r.slug }),
              success: "Enrollment cancelled successfully.",
              confirm: {
                title: "Cancel this enrollment?",
                description: `${r.student?.name ?? "The student"} loses access to “${r.courseTitle}” immediately. ${r.price > 0 ? "This does not refund their payment. Refunds are issued through Stripe." : ""}`,
                confirmLabel: "Cancel enrollment",
              },
            },
            {
              key: "reinstate",
              label: "Reinstate",
              icon: FiRotateCcw,
              hidden: !canEdit || r.status !== "cancelled",
              run: () => reinstateEnrollment({ slug: r.slug }),
              success: "Enrollment reinstated successfully.",
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
      caption="Enrollments"
      empty={
        <EmptyState
          icon={FiFolder}
          title="No enrollments match"
          description="Try a different filter."
        />
      }
    />
  );
}

