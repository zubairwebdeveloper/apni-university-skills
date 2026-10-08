// components/admin/blog/BlogTable.jsx
"use client";
import Link from "next/link";
import { FiFileText, FiStar } from "react-icons/fi";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { LifecycleTable } from "@/components/admin/table/LifecycleTable";
import { formatDate, formatDateTime } from "@/lib/utils/format";
import {
  bulkPostAction,
  runPostAction,
  setPostFeatured,
} from "@/app/actions/admin/blog";

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
      header: "Topic",
      className: "text-muted-foreground",
      cell: (r) => r.category || "—",
    },
    {
      key: "author",
      header: "Author",
      className: "text-muted-foreground",
      cell: (r) => r.authorName || "—",
    },
    {
      key: "status",
      header: "Status",
      cell: (r) => (
        <div className="space-y-1">
          <StatusBadge status={r.status} />
          {r.status === "scheduled" && r.scheduledFor && (
            <p className="text-xs text-muted-foreground">
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
          <span className="text-muted-foreground" aria-label="Not featured">
            —
          </span>
        ),
    },
    {
      key: "published",
      header: "Published",
      className: "whitespace-nowrap text-muted-foreground",
      cell: (r) => formatDate(r.publishedAt) || "—",
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

