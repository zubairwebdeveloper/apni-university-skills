// components/admin/blog/BlogTable.jsx
"use client";
import Link from "next/link";
import { FiClock, FiFileText, FiStar } from "react-icons/fi";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { LifecycleTable } from "@/components/admin/table/LifecycleTable";
import { formatDate, formatDateTime } from "@/lib/utils/format";
import {
  bulkPostAction,
  runPostAction,
  setPostFeatured,
} from "@/app/actions/admin/blog";

const FOCUS =
  "outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background";

// Muted placeholder for empty cells, hidden from screen readers' flow
// except for the label they need.
const Empty = ({ label }) => (
  <span className="text-muted-foreground" aria-label={label}>
    —
  </span>
);

export function BlogTable({ rows, perms }) {
  const columns = [
    {
      key: "title",
      header: "Title",
      className: "min-w-60",
      cell: (r) => (
        <div className="min-w-0">
          <Link
            href={`/admin/blog/${r.slug}`}
            className={`line-clamp-2 rounded-sm font-medium text-foreground underline-offset-4 hover:text-primary hover:underline ${FOCUS}`}
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
      key: "category",
      header: "Topic",
      cell: (r) =>
        r.category ? (
          <span className="inline-flex whitespace-nowrap rounded-full border border-border bg-muted px-2.5 py-0.5 text-xs font-medium text-foreground/80">
            {r.category}
          </span>
        ) : (
          <Empty label="No topic" />
        ),
    },
    {
      key: "author",
      header: "Author",
      className: "text-muted-foreground",
      cell: (r) => r.authorName || <Empty label="No author" />,
    },
    {
      key: "status",
      header: "Status",
      cell: (r) => (
        <div className="space-y-1">
          <StatusBadge status={r.status} />
          {r.status === "scheduled" && r.scheduledFor && (
            <p className="flex items-center gap-1 whitespace-nowrap text-xs tabular-nums text-muted-foreground">
              <FiClock aria-hidden="true" className="size-3" />
              {formatDateTime(r.scheduledFor)}
            </p>
          )}
        </div>
      ),
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
          <Empty label="Not featured" />
        ),
    },
    {
      key: "published",
      header: "Published",
      className: "whitespace-nowrap tabular-nums text-muted-foreground",
      cell: (r) => formatDate(r.publishedAt) || <Empty label="Not published" />,
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
      prefix="blog"
      noun="Post"
      plural="posts"
      caption="Blog posts"
      columns={columns}
      basePath="/admin/blog"
      run={runPostAction}
      bulk={bulkPostAction}
      emptyIcon={FiFileText}
      emptyTitle="No posts match"
      minWidth="min-w-[980px]"
      extraItems={(r) => [
        {
          key: "feature",
          label: r.featured ? "Remove featured" : "Feature",
          icon: FiStar,
          hidden: !perms.includes("blog.update") || r.status === "deleted",
          run: () => setPostFeatured({ slug: r.slug, featured: !r.featured }),
          success: r.featured
            ? "Post is no longer featured."
            : "Post featured successfully.",
        },
      ]}
    />
  );
}
