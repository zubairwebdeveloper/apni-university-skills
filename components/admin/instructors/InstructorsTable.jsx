// components/admin/instructors/InstructorsTable.jsx
"use client";
import Link from "next/link";
import { FiEdit2, FiEye, FiStar, FiUsers } from "react-icons/fi";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { EmptyState } from "@/components/shared/EmptyState";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { DataTable } from "@/components/admin/table/DataTable";
import { BulkActionBar } from "@/components/admin/table/BulkActionBar";
import { RowActions } from "@/components/admin/table/RowActions";
import {
  lifecycleBulkActions,
  lifecycleItems,
} from "@/components/admin/table/lifecycle";
import { useSelection } from "@/hooks/useSelection";
import { formatCompact, formatDate } from "@/lib/utils/format";
import {
  bulkInstructorAction,
  runInstructorAction,
} from "@/app/actions/admin/instructors";

export function InstructorsTable({ rows, perms }) {
  const { selected, setSelected, clear, ids } = useSelection(rows);
  const columns = [
    {
      key: "name",
      header: "Instructor",
      cell: (r) => (
        <div className="flex items-center gap-3">
          <Avatar className="size-9">
            <AvatarImage src={r.avatar || undefined} alt="" />
            <AvatarFallback>{r.name?.charAt(0)}</AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <Link
              href={`/admin/instructors/${r.slug}`}
              className="font-medium hover:underline"
            >
              {r.name}
            </Link>
            <p className="truncate text-xs text-muted-foreground">
              {r.designation}
            </p>
          </div>
        </div>
      ),
    },
    {
      key: "email",
      header: "Email",
      className: "text-muted-foreground",
      cell: (r) => r.email || "—",
    },
    {
      key: "courses",
      header: "Courses",
      className: "tabular-nums",
      cell: (r) => r.coursesCount ?? 0,
    },
    {
      key: "students",
      header: "Students",
      className: "tabular-nums",
      cell: (r) => formatCompact(r.studentsCount ?? 0),
    },
    {
      key: "status",
      header: "Status",
      cell: (r) => <StatusBadge status={r.status} />,
    },
    {
      key: "featured",
      header: "Featured",
      cell: (r) =>
        r.featured ? (
          <>
            <FiStar
              className="size-4 fill-current text-highlight"
              aria-hidden="true"
            />
            <span className="sr-only">Featured</span>
          </>
        ) : (
          <span className="text-muted-foreground" aria-label="Not featured">
            —
          </span>
        ),
    },
    {
      key: "updated",
      header: "Updated",
      className: "whitespace-nowrap text-muted-foreground",
      cell: (r) => formatDate(r.updatedAt),
    },
    {
      key: "actions",
      header: "Actions",
      srOnlyHeader: true,
      className: "w-12",
      cell: (r) => (
        <RowActions
          label={r.name}
          items={[
            {
              key: "view",
              label: "View",
              icon: FiEye,
              href: `/admin/instructors/${r.slug}`,
            },
            {
              key: "edit",
              label: "Edit",
              icon: FiEdit2,
              href: `/admin/instructors/${r.slug}/edit`,
              hidden:
                !perms.includes("instructors.update") || r.status === "deleted",
            },
            ...lifecycleItems({
              row: r,
              perms,
              prefix: "instructors",
              noun: "Instructor",
              run: runInstructorAction,
            }),
          ]}
        />
      ),
    },
  ];
  return (
    <>
      <DataTable
        columns={columns}
        rows={rows}
        caption="Instructors"
        selectable
        selected={selected}
        onSelectedChange={setSelected}
        empty={
          <EmptyState
            icon={FiUsers}
            title="No instructors match"
            description="Try a different search or filter, or add an instructor."
          />
        }
      />
      <BulkActionBar
        selectedIds={ids}
        onClear={clear}
        run={(action, selectedIds) =>
          bulkInstructorAction({ action, ids: selectedIds })
        }
        actions={lifecycleBulkActions(perms, "instructors", "instructors")}
      />
    </>
  );
}

