// components/admin/reviews/ReviewsTable.jsx
"use client";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import {
  FiCheck,
  FiEye,
  FiStar,
  FiTrash2,
  FiX,
  FiArchive,
} from "react-icons/fi";
import { EmptyState } from "@/components/shared/EmptyState";
import { Rating } from "@/components/shared/Rating";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { DataTable } from "@/components/admin/table/DataTable";
import { BulkActionBar } from "@/components/admin/table/BulkActionBar";
import { RowActions } from "@/components/admin/table/RowActions";
import { reviewItems } from "./reviewItems";
import { useSelection } from "@/hooks/useSelection";
import { formatDate } from "@/lib/utils/format";
import { bulkReviewAction, runReviewAction } from "@/app/actions/admin/reviews";

const focusRing =
  "rounded-sm outline-none focus-visible:ring-2 focus-visible:ring-yellow-400/70 focus-visible:ring-offset-2 focus-visible:ring-offset-background";

function getInitial(name) {
  return name?.trim()?.charAt(0)?.toUpperCase() || "?";
}

function TableReveal({ children }) {
  const reduceMotion = useReducedMotion();
  return (
    <motion.div
      initial={reduceMotion ? false : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="w-full min-w-0"
    >
      {children}
    </motion.div>
  );
}

export function ReviewsTable({ rows, perms }) {
  const { selected, setSelected, clear, ids } = useSelection(rows);
  const mod = perms.includes("reviews.moderate");
  const del = perms.includes("reviews.delete");

  const columns = [
    {
      key: "review",
      header: "Review",
      className: "min-w-72",
      cell: (r) => (
        <div className="min-w-0 max-w-md">
          <Link
            href={`/admin/reviews/${r.slug}`}
            className={`block truncate text-sm font-medium leading-5 transition-colors hover:text-violet-600 hover:underline dark:hover:text-violet-300 ${
              r.title ? "text-foreground" : "italic text-muted-foreground"
            } ${focusRing}`}
          >
            {r.title || "Untitled review"}
          </Link>
          {r.comment && (
            <p className="mt-0.5 line-clamp-2 text-xs leading-5 text-muted-foreground">
              {r.comment}
            </p>
          )}
        </div>
      ),
    },
    {
      key: "student",
      header: "Student",
      className: "min-w-40",
      cell: (r) => (
        <div className="flex min-w-0 items-center gap-2.5">
          <span
            aria-hidden="true"
            className="flex size-7 shrink-0 items-center justify-center rounded-full border border-violet-500/20 bg-violet-500/10 text-[11px] font-semibold text-violet-600 dark:text-violet-300"
          >
            {getInitial(r.studentName)}
          </span>
          <span className="truncate text-sm leading-5 text-foreground">
            {r.studentName}
          </span>
        </div>
      ),
    },
    {
      key: "course",
      header: "Course",
      className: "min-w-40",
      cell: (r) => (
        <span className="line-clamp-2 text-sm leading-5 text-foreground">
          {r.courseTitle}
        </span>
      ),
    },
    {
      key: "rating",
      header: "Rating",
      className: "whitespace-nowrap",
      cell: (r) => <Rating value={r.rating} count={1} showCount={false} />,
    },
    {
      key: "status",
      header: "Status",
      cell: (r) => <StatusBadge status={r.status} />,
    },
    {
      key: "date",
      header: "Submitted",
      className: "whitespace-nowrap text-sm tabular-nums text-muted-foreground",
      cell: (r) => formatDate(r.createdAt),
    },
    {
      key: "actions",
      header: "Actions",
      srOnlyHeader: true,
      className: "w-12",
      cell: (r) => (
        <RowActions
          label={`${r.studentName}'s review`}
          items={[
            {
              key: "view",
              label: "View",
              icon: FiEye,
              href: `/admin/reviews/${r.slug}`,
            },
            ...reviewItems({ row: r, perms, run: runReviewAction }),
          ]}
        />
      ),
    },
  ];

  const bulk = [
    mod && { key: "approve", label: "Approve", icon: FiCheck },
    mod && {
      key: "reject",
      label: "Reject",
      icon: FiX,
      confirm: {
        title: "Reject {n} reviews?",
        description:
          "They are hidden from the public site and removed from course ratings.",
      },
    },
    mod && {
      key: "archive",
      label: "Archive",
      icon: FiArchive,
      confirm: {
        title: "Archive {n} reviews?",
        description:
          "They are hidden from the public site and removed from course ratings.",
      },
    },
    del && {
      key: "delete",
      label: "Trash",
      icon: FiTrash2,
      destructive: true,
      confirm: {
        title: "Move {n} reviews to trash?",
        description:
          "Students can't edit them again. You can restore them from the Trash filter.",
        confirmLabel: "Move to trash",
      },
    },
  ].filter(Boolean);

  return (
    <>
      <TableReveal>
        <DataTable
          columns={columns}
          rows={rows}
          caption="Reviews"
          selectable={bulk.length > 0}
          selected={selected}
          onSelectedChange={setSelected}
          minWidth="min-w-[960px]"
          empty={
            <EmptyState
              icon={FiStar}
              title="No reviews match"
              description="Reviews appear here when enrolled students submit them. If you expected results, try adjusting your filters."
            />
          }
        />
      </TableReveal>
      <BulkActionBar
        selectedIds={ids}
        onClear={clear}
        run={(action, selectedIds) =>
          bulkReviewAction({ action, ids: selectedIds })
        }
        actions={bulk}
      />
    </>
  );
}
