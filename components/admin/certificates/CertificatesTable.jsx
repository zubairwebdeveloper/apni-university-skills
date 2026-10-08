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

export function CertificatesTable({ rows, perms }) {
  const columns = [
    {
      key: "no",
      header: "Certificate",
      cell: (r) => (
        <Link
          href={`/admin/certificates/${r.slug}`}
          className="font-mono text-sm font-medium hover:underline"
        >
          {r.certificateNumber}
        </Link>
      ),
    },
    { key: "student", header: "Student", cell: (r) => r.studentName },
    {
      key: "course",
      header: "Course",
      className: "min-w-48",
      cell: (r) => r.courseTitle,
    },
    {
      key: "status",
      header: "Status",
      cell: (r) => <StatusBadge status={r.status ?? "valid"} />,
    },
    {
      key: "issued",
      header: "Issued",
      className: "whitespace-nowrap text-muted-foreground",
      cell: (r) => formatDate(r.issuedAt),
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

