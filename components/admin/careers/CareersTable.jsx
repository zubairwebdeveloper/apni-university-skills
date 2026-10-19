// components/admin/careers/CareersTable.jsx
"use client";
import Link from "next/link";
import { FiCompass } from "react-icons/fi";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { LifecycleTable } from "@/components/admin/table/LifecycleTable";
import { formatDate } from "@/lib/utils/format";
import { bulkCareerAction, runCareerAction } from "@/app/actions/admin/careers";

const FOCUS =
  "outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background";

const SHOWN_SKILLS = 3;

// Muted placeholder for empty cells, with a label for screen readers.
const Empty = ({ label }) => (
  <span className="text-muted-foreground" aria-label={label}>
    —
  </span>
);

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
            className={`rounded-sm font-medium text-foreground underline-offset-4 hover:text-primary hover:underline ${FOCUS}`}
          >
            {r.title}
          </Link>
          <p
            className="mt-0.5 max-w-xs truncate font-mono text-xs text-muted-foreground"
            title={r.slug}
          >
            {r.slug}
          </p>
        </div>
      ),
    },
    {
      key: "order",
      header: "Order",
      className: "tabular-nums",
      cell: (r) => r.order ?? <Empty label="No order set" />,
    },
    {
      key: "skills",
      header: "Skills",
      cell: (r) => {
        const skills = r.skills ?? [];
        if (!skills.length) return <Empty label="No skills" />;
        const extra = skills.length - SHOWN_SKILLS;
        return (
          <ul
            className="flex flex-wrap gap-1"
            // The full list is available on hover without widening the row.
            title={extra > 0 ? skills.join(", ") : undefined}
          >
            {skills.slice(0, SHOWN_SKILLS).map((s) => (
              <li
                key={s}
                className="rounded-md border border-border bg-muted px-1.5 py-0.5 text-xs text-foreground/80"
              >
                {s}
              </li>
            ))}
            {extra > 0 && (
              <li className="px-1 py-0.5 text-xs tabular-nums text-muted-foreground">
                <span aria-hidden="true">+{extra}</span>
                <span className="sr-only">and {extra} more</span>
              </li>
            )}
          </ul>
        );
      },
    },
    {
      key: "category",
      header: "Courses from",
      className: "text-muted-foreground",
      cell: (r) => r.categorySlug || <Empty label="No category" />,
    },
    {
      key: "status",
      header: "Status",
      cell: (r) => <StatusBadge status={r.status} />,
    },
    {
      key: "updated",
      header: "Updated",
      className: "whitespace-nowrap tabular-nums text-muted-foreground",
      cell: (r) => formatDate(r.updatedAt) || <Empty label="Not updated" />,
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
