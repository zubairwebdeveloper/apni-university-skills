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

// Same rules as priceLabel, laid out as a sale price with the old price struck through
function PriceCell({ c }) {
  if (c.isFree) {
    return (
      <span className="inline-flex rounded-md border border-emerald-500/25 bg-emerald-500/10 px-2 py-0.5 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
        Free
      </span>
    );
  }
  if (c.salePrice != null && c.salePrice < c.price) {
    return (
      <div className="leading-tight">
        <p className="text-sm font-semibold tabular-nums">
          {formatPrice(c.salePrice, c.currency)}
        </p>
        <p className="text-xs tabular-nums text-muted-foreground">
          <span className="sr-only">Was </span>
          <span className="line-through">
            {formatPrice(c.price, c.currency)}
          </span>
        </p>
      </div>
    );
  }
  return (
    <p className="text-sm font-semibold tabular-nums">
      {formatPrice(c.price, c.currency)}
    </p>
  );
}

export function CoursesTable({ rows, perms }) {
  const { selected, setSelected, clear, ids } = useSelection(rows);
  const columns = [
    {
      key: "thumb",
      header: "Thumbnail",
      className: "w-24",
      cell: (r) => (
        <div className="relative h-10 w-[4.5rem] overflow-hidden rounded-md bg-muted ring-1 ring-border">
          {r.thumbnail ? (
            <Image
              src={r.thumbnail}
              alt=""
              fill
              sizes="72px"
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
      className: "min-w-64",
      cell: (r) => (
        <div className="min-w-0">
          <Link
            href={`/admin/courses/${r.slug}`}
            className="line-clamp-2 rounded-sm text-sm font-semibold leading-snug underline-offset-4 outline-none hover:underline focus-visible:ring-2 focus-visible:ring-ring/60"
          >
            {r.title}
          </Link>
          <p className="mt-0.5 max-w-64 truncate font-mono text-xs text-muted-foreground">
            {r.slug}
          </p>
        </div>
      ),
    },
    {
      key: "category",
      header: "Category",
      className: "text-sm text-muted-foreground",
      cell: (r) => (
        <span className="block max-w-40 truncate">{r.category || "—"}</span>
      ),
    },
    {
      key: "instructor",
      header: "Instructor",
      className: "text-sm text-muted-foreground",
      cell: (r) => (
        <span className="block max-w-40 truncate">{r.instructor || "—"}</span>
      ),
    },
    {
      key: "price",
      header: "Price",
      className: "whitespace-nowrap",
      cell: (r) => <PriceCell c={r} />,
    },
    {
      key: "students",
      header: "Students",
      className: "text-sm tabular-nums",
      cell: (r) => formatCompact(r.studentsCount ?? 0),
    },
    {
      key: "rating",
      header: "Rating",
      className: "whitespace-nowrap text-sm tabular-nums",
      cell: (r) =>
        r.reviewCount ? (
          <span className="inline-flex items-center gap-1.5">
            <FiStar
              className="size-3.5 fill-current text-highlight"
              aria-hidden="true"
            />
            <span className="font-medium">
              {Number(r.rating ?? 0).toFixed(1)}
            </span>
            <span className="text-xs text-muted-foreground">
              ({r.reviewCount})
            </span>
          </span>
        ) : (
          <span className="text-muted-foreground">—</span>
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
