// components/admin/reviews/ReviewsTable.jsx
"use client";
import Link from "next/link";
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

export function ReviewsTable({ rows, perms }) {
  const { selected, setSelected, clear, ids } = useSelection(rows);
  const mod = perms.includes("reviews.moderate"),
    del = perms.includes("reviews.delete");
  const columns = [
    {
      key: "review",
      header: "Review",
      className: "min-w-72",
      cell: (r) => (
        <div className="min-w-0">
          <Link
            href={`/admin/reviews/${r.slug}`}
            className="font-medium hover:underline"
          >
            {r.title || "Untitled review"}
          </Link>
          <p className="line-clamp-2 text-xs text-muted-foreground">
            {r.comment}
          </p>
        </div>
      ),
    },
    {
      key: "student",
      header: "Student",
      className: "text-muted-foreground",
      cell: (r) => r.studentName,
    },
    {
      key: "course",
      header: "Course",
      className: "min-w-40",
      cell: (r) => r.courseTitle,
    },
    {
      key: "rating",
      header: "Rating",
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
      className: "whitespace-nowrap text-muted-foreground",
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
            description="Reviews appear here when enrolled students submit them."
          />
        }
      />
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

