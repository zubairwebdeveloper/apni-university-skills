// components/admin/certificates/CertificatesTable.jsx
"use client";
import Link from "next/link";
import { FiAward, FiEye } from "react-icons/fi";
import { EmptyState } from "@/components/shared/EmptyState";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { DataTable } from "@/components/admin/table/DataTable";
import { RowActions } from "@/components/admin/table/RowActions";
import { formatDate } from "@/lib/utils/format";
import { reinstateCertificate } from "@/app/actions/admin/certificates";

const FOCUS =
  "outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background";

// Muted placeholder for empty cells, with a label for screen readers.
const Empty = ({ label }) => (
  <span className="text-muted-foreground" aria-label={label}>
    —
  </span>
);

export function CertificatesTable({ rows, perms }) {
  const columns = [
    {
      key: "no",
      header: "Certificate",
      cell: (r) => (
        <Link
          href={`/admin/certificates/${r.slug}`}
          className={`whitespace-nowrap rounded-sm font-mono text-sm font-medium text-foreground underline-offset-4 hover:text-primary hover:underline ${FOCUS}`}
        >
          {r.certificateNumber}
        </Link>
      ),
    },
    {
      key: "student",
      header: "Student",
      className: "min-w-40",
      cell: (r) => r.studentName || <Empty label="No student name" />,
    },
    {
      key: "course",
      header: "Course",
      className: "min-w-48 text-muted-foreground",
      cell: (r) => r.courseTitle || <Empty label="No course" />,
    },
    {
      key: "status",
      header: "Status",
      cell: (r) => <StatusBadge status={r.status ?? "valid"} />,
    },
    {
      key: "issued",
      header: "Issued",
      className: "whitespace-nowrap tabular-nums text-muted-foreground",
      cell: (r) => formatDate(r.issuedAt) || <Empty label="No issue date" />,
    },
    {
      key: "actions",
      header: "Actions",
      srOnlyHeader: true,
      className: "w-12",
      cell: (r) => (
        <RowActions
          label={r.certificateNumber}
          items={[
            {
              key: "view",
              label: "View",
              icon: FiEye,
              href: `/admin/certificates/${r.slug}`,
            },
            {
              key: "reinstate",
              label: "Reinstate",
              hidden:
                !perms.includes("certificates.revoke") ||
                r.status !== "revoked",
              run: () => reinstateCertificate({ slug: r.slug }),
              success: "Certificate reinstated.",
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
      caption="Certificates"
      empty={
        <EmptyState
          icon={FiAward}
          title="No certificates match"
          description="Certificates are issued automatically when a student finishes a course."
        />
      }
    />
  );
}
