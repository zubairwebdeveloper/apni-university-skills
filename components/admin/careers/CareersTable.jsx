// components/admin/careers/CareersTable.jsx
"use client";
import Link from "next/link";
import { FiCompass } from "react-icons/fi";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { LifecycleTable } from "@/components/admin/table/LifecycleTable";
import { formatDate } from "@/lib/utils/format";
import { bulkCareerAction, runCareerAction } from "@/app/actions/admin/careers";

export function CareersTable({ rows, perms }) {
  const columns = [
    {
      key: "title",
      header: "Guide",
      className: "min-w-56",
      cell: (r) => (
        <div className="min-w-0">
          <Link
            href={`/admin/careers/${r.slug}/edit`}
            className="font-medium hover:underline"
          >
            {r.title}
          </Link>
          <p className="font-mono text-xs text-muted-foreground">{r.slug}</p>
        </div>
      ),
    },
    {
      key: "order",
      header: "Order",
      className: "tabular-nums",
      cell: (r) => r.order ?? "—",
    },
    {
      key: "skills",
      header: "Skills",
      className: "text-muted-foreground",
      cell: (r) => (r.skills?.length ? r.skills.slice(0, 3).join(", ") : "—"),
    },
    {
      key: "category",
      header: "Courses from",
      className: "text-muted-foreground",
      cell: (r) => r.categorySlug || "—",
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
      prefix="careers"
      noun="Career guide"
      plural="guides"
      caption="Career guides"
      columns={columns}
      basePath="/admin/careers"
      hasView={false}
      run={runCareerAction}
      bulk={bulkCareerAction}
      emptyIcon={FiCompass}
      emptyTitle="No career guides match"
      minWidth="min-w-[860px]"
    />
  );
}

