// components/admin/contacts/ContactsTable.jsx
"use client";
import Link from "next/link";
import { FiEye, FiMail } from "react-icons/fi";
import { EmptyState } from "@/components/shared/EmptyState";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { DataTable } from "@/components/admin/table/DataTable";
import { RowActions } from "@/components/admin/table/RowActions";
import { contactItems } from "./contactItems";
import { CONTACT_SUBJECTS } from "@/lib/validations/contact";
import { formatDateTime } from "@/lib/utils/format";
import { runContactAction } from "@/app/actions/admin/contacts";

export const subjectLabel = (v) =>
  CONTACT_SUBJECTS.find((s) => s.value === v)?.label ?? v;

export function ContactsTable({ rows, perms }) {
  const columns = [
    {
      key: "msg",
      header: "Message",
      className: "min-w-72",
      cell: (r) => (
        <div className="min-w-0">
          <Link
            href={`/admin/contacts/${r.slug}`}
            className={`font-medium hover:underline ${r.status === "new" ? "" : "text-muted-foreground"}`}
          >
            {subjectLabel(r.subject)}
          </Link>
          <p className="line-clamp-1 text-xs text-muted-foreground">
            {r.message}
          </p>
        </div>
      ),
    },
    {
      key: "from",
      header: "From",
      cell: (r) => (
        <div>
          <p>{r.name}</p>
          <p className="text-xs text-muted-foreground">{r.email}</p>
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
      header: "Received",
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
          label={`message from ${r.name}`}
          items={[
            {
              key: "view",
              label: "View",
              icon: FiEye,
              href: `/admin/contacts/${r.slug}`,
            },
            ...contactItems({ row: r, perms, run: runContactAction }),
          ]}
        />
      ),
    },
  ];
  return (
    <DataTable
      columns={columns}
      rows={rows}
      caption="Contact messages"
      minWidth="min-w-[860px]"
      empty={
        <EmptyState
          icon={FiMail}
          title="No messages"
          description="Messages from the contact form appear here."
        />
      }
    />
  );
}

