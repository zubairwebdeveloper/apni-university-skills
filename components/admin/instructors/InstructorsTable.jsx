// components/admin/instructors/InstructorsTable.jsx
"use client";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import {
  FiBookOpen,
  FiEdit2,
  FiEye,
  FiMail,
  FiStar,
  FiUsers,
} from "react-icons/fi";
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
import { cn } from "@/lib/utils";
import {
  bulkInstructorAction,
  runInstructorAction,
} from "@/app/actions/admin/instructors";

const linkClass =
  "rounded-sm underline-offset-4 outline-none hover:underline focus-visible:ring-2 focus-visible:ring-ring/60";

function initials(name) {
  const parts = String(name ?? "")
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (!parts.length) return "?";
  return (
    parts[0][0] + (parts.length > 1 ? parts[parts.length - 1][0] : "")
  ).toUpperCase();
}

function Stat({ icon: Icon, value, label }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-sm tabular-nums">
      <Icon className="size-3.5 text-muted-foreground" aria-hidden="true" />
      <span className="font-medium">{value}</span>
      <span className="sr-only">{label}</span>
    </span>
  );
}

function FeaturedStar() {
  const reduce = useReducedMotion();
  return (
    <motion.span
      className="inline-flex"
      initial={reduce ? false : { scale: 0.5, rotate: -20 }}
      animate={{ scale: 1, rotate: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 14 }}
    >
      <FiStar
        className="size-4 fill-current text-highlight"
        aria-hidden="true"
      />
      <span className="sr-only">Featured</span>
    </motion.span>
  );
}

export function InstructorsTable({ rows, perms }) {
  const { selected, setSelected, clear, ids } = useSelection(rows);
  const columns = [
    {
      key: "name",
      header: "Instructor",
      className: "min-w-60",
      cell: (r) => (
        <div className="flex min-w-0 items-center gap-3">
          <Avatar className="size-10 shrink-0 ring-1 ring-border">
            <AvatarImage src={r.avatar || undefined} alt="" />
            <AvatarFallback className="bg-primary/10 text-xs font-semibold text-primary">
              {initials(r.name)}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <Link
              href={`/admin/instructors/${r.slug}`}
              className={cn(
                "block truncate text-sm font-semibold leading-snug",
                linkClass,
              )}
            >
              {r.name}
            </Link>
            <p className="max-w-56 truncate text-xs text-muted-foreground">
              {r.designation}
            </p>
          </div>
        </div>
      ),
    },
    {
      key: "email",
      header: "Email",
      className: "text-sm text-muted-foreground",
      cell: (r) =>
        r.email ? (
          <a
            href={`mailto:${r.email}`}
            className={cn(
              "inline-flex max-w-full items-center gap-1.5 hover:text-foreground",
              linkClass,
            )}
          >
            <FiMail className="size-3.5 shrink-0" aria-hidden="true" />
            <span className="max-w-48 truncate">{r.email}</span>
          </a>
        ) : (
          <span aria-label="No email">—</span>
        ),
    },
    {
      key: "courses",
      header: "Courses",
      cell: (r) => (
        <Stat icon={FiBookOpen} value={r.coursesCount ?? 0} label="courses" />
      ),
    },
    {
      key: "students",
      header: "Students",
      cell: (r) => (
        <Stat
          icon={FiUsers}
          value={formatCompact(r.studentsCount ?? 0)}
          label="students"
        />
      ),
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
          <FeaturedStar />
        ) : (
          <span className="text-muted-foreground" aria-label="Not featured">
            —
          </span>
        ),
    },
    {
      key: "updated",
      header: "Updated",
      className: "whitespace-nowrap text-sm tabular-nums text-muted-foreground",
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
