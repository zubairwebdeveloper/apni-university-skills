// components/admin/courses/CoursesTable.jsx
"use client";
import Image from "next/image";
import Link from "next/link";
import { FiBookOpen, FiCopy, FiEdit2, FiEye, FiStar } from "react-icons/fi";
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
import { formatCompact, formatDate, formatPrice } from "@/lib/utils/format";
import {
  bulkCourseAction,
  duplicateCourse,
  runCourseAction,
  setCourseFeatured,
} from "@/app/actions/admin/courses";

export const priceLabel = (c) =>
  c.isFree
    ? "Free"
    : c.salePrice != null && c.salePrice < c.price
      ? `${formatPrice(c.salePrice, c.currency)} (was ${formatPrice(c.price, c.currency)})`
      : formatPrice(c.price, c.currency);

export function CoursesTable({ rows, perms }) {
  const { selected, setSelected, clear, ids } = useSelection(rows);
  const columns = [
    {
      key: "thumb",
      header: "Thumbnail",
      className: "w-20",
      cell: (r) => (
        <div className="relative h-9 w-16 overflow-hidden rounded bg-muted">
          {r.thumbnail ? (
            <Image
              src={r.thumbnail}
              alt=""
              fill
              sizes="64px"
              className="object-cover"
            />
          ) : (
            <FiBookOpen
              className="absolute inset-0 m-auto size-4 text-muted-foreground"
              aria-hidden="true"
            />
          )}
        </div>
      ),
    },
    {
      key: "title",
      header: "Title",
      className: "min-w-56",
      cell: (r) => (
        <div className="min-w-0">
          <Link
            href={`/admin/courses/${r.slug}`}
            className="line-clamp-2 font-medium hover:underline"
          >
            {r.title}
          </Link>
          <p className="font-mono text-xs text-muted-foreground">{r.slug}</p>
        </div>
      ),
    },
    {
      key: "category",
      header: "Category",
      className: "text-muted-foreground",
      cell: (r) => r.category || "—",
    },
    {
      key: "instructor",
      header: "Instructor",
      className: "text-muted-foreground",
      cell: (r) => r.instructor || "—",
    },
    {
      key: "price",
      header: "Price",
      className: "whitespace-nowrap",
      cell: priceLabel,
    },
    {
      key: "students",
      header: "Students",
      className: "tabular-nums",
      cell: (r) => formatCompact(r.studentsCount ?? 0),
    },
    {
      key: "rating",
      header: "Rating",
      className: "whitespace-nowrap tabular-nums",
      cell: (r) =>
        r.reviewCount ? `${r.rating.toFixed(1)} (${r.reviewCount})` : "—",
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
          label={r.title}
          items={[
            {
              key: "view",
              label: "View",
              icon: FiEye,
              href: `/admin/courses/${r.slug}`,
            },
            {
              key: "edit",
              label: "Edit",
              icon: FiEdit2,
              href: `/admin/courses/${r.slug}/edit`,
              hidden:
                !perms.includes("courses.update") || r.status === "deleted",
            },
            {
              key: "duplicate",
              label: "Duplicate",
              icon: FiCopy,
              hidden:
                !perms.includes("courses.create") || r.status === "deleted",
              run: () => duplicateCourse({ slug: r.slug }),
              success: "Course duplicated as a draft.",
            },
            {
              key: "feature",
              label: r.featured ? "Remove featured" : "Feature",
              icon: FiStar,
              hidden:
                !perms.includes("courses.update") || r.status === "deleted",
              run: () =>
                setCourseFeatured({ slug: r.slug, featured: !r.featured }),
              success: r.featured
                ? "Course is no longer featured."
                : "Course featured successfully.",
            },
            ...lifecycleItems({
              row: r,
              perms,
              prefix: "courses",
              noun: "Course",
              run: runCourseAction,
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
        caption="Courses"
        selectable
        selected={selected}
        onSelectedChange={setSelected}
        minWidth="min-w-[1100px]"
        empty={
          <EmptyState
            icon={FiBookOpen}
            title="No courses match"
            description="Try a different search or filter, or create a course."
          />
        }
      />
      <BulkActionBar
        selectedIds={ids}
        onClear={clear}
        run={(action, selectedIds) =>
          bulkCourseAction({ action, ids: selectedIds })
        }
        actions={lifecycleBulkActions(perms, "courses", "courses")}
      />
    </>
  );
}

