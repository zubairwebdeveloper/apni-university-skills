// app/admin/blog/page.jsx
import Link from "next/link";
import { z } from "zod";
import { FiFileText } from "react-icons/fi";
import { buttonVariants } from "@/components/ui/button";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { DataTableToolbar } from "@/components/admin/table/DataTableToolbar";
import { BlogTable } from "@/components/admin/blog/BlogTable";
import { EmptyState } from "@/components/shared/EmptyState";
import { CursorPagination } from "@/components/shared/CursorPagination";
import { requirePermission } from "@/lib/auth/authorize";
import {
  can,
  PERMISSIONS as P,
  permissionsFor,
} from "@/lib/constants/permissions";
import {
  BLOG_STATUS_OPTIONS,
  BLOG_STATUSES,
  RANGE_OPTIONS,
  sortOptions,
} from "@/config/adminTable";
import { BLOG_TOPICS, topicLabel } from "@/config/blog";
import { parseListParams, rangeFilter } from "@/lib/admin/listParams";
import {
  BLOG_SORTS,
  blogAdminRepository,
} from "@/repositories/admin/blogAdminRepository";

export const metadata = { title: "Blog" };

export default async function AdminBlogPage({ searchParams }) {
  const user = await requirePermission(P.BLOG_READ);
  const p = parseListParams(await searchParams, {
    sorts: BLOG_SORTS,
    statuses: BLOG_STATUSES,
    filters: {
      topic: z.enum(BLOG_TOPICS.map((t) => t.slug)),
      featured: z.literal("yes"),
    },
  });
  const filters = [...rangeFilter(p.range)];
  if (p.topic) filters.push(["category", "==", topicLabel(p.topic)]);
  if (p.featured) filters.push(["featured", "==", true]);
  const { items, nextCursor, total } = await blogAdminRepository.list({
    status: p.status,
    keyword: p.keyword,
    sort: p.sort,
    after: p.after,
    filters,
  });
  const { after, keyword, ...linkParams } = p;

  const canCreate = can(user.role, P.BLOG_CREATE);

  // What is narrowing the list right now (status, topic, featured, date range, search)
  const activeFilterCount = [p.status, p.topic, p.featured, p.range].filter(
    Boolean,
  ).length;
  const searching = Boolean(keyword);
  const filtered = activeFilterCount > 0 || searching;

  const summary = [
    {
      label: filtered ? "Matching posts" : "All posts",
      value: typeof total === "number" ? total : "–",
    },
    { label: "On this page", value: items.length },
    {
      label: "Filters applied",
      value: activeFilterCount + (searching ? 1 : 0),
    },
  ];

  return (
    <>
      <AdminPageHeader
        title="Blog"
        description="Write, schedule and publish articles."
        actions={
          canCreate && (
            <Link href="/admin/blog/create" className={buttonVariants()}>
              New post
            </Link>
          )
        }
      />

      {/* Summary: a compact read-out of the current view */}
      <dl className="mb-4 grid grid-cols-3 divide-x divide-border rounded-xl border bg-card">
        {summary.map((s) => (
          <div
            key={s.label}
            className="flex flex-col-reverse items-center gap-0.5 px-3 py-3 text-center sm:flex-row sm:justify-center sm:gap-3"
          >
            <dt className="text-xs text-muted-foreground sm:text-sm">
              {s.label}
            </dt>
            <dd className="font-serif text-xl font-semibold tabular-nums text-foreground sm:text-2xl">
              {s.value}
            </dd>
          </div>
        ))}
      </dl>

      <DataTableToolbar
        searchPlaceholder="Search by title, topic, author or tag…"
        total={total}
        sorts={sortOptions(BLOG_SORTS)}
        filters={[
          {
            key: "status",
            label: "Status",
            allLabel: "All (not in trash)",
            options: BLOG_STATUS_OPTIONS,
          },
          {
            key: "topic",
            label: "Topic",
            allLabel: "All topics",
            options: BLOG_TOPICS.map((t) => ({
              value: t.slug,
              label: t.label,
            })),
          },
          {
            key: "featured",
            label: "Featured",
            allLabel: "All",
            options: [{ value: "yes", label: "Featured only" }],
          },
          {
            key: "range",
            label: "Created",
            allLabel: "Any time",
            options: RANGE_OPTIONS,
          },
        ]}
      />

      <div className="mt-4">
        {items.length > 0 ? (
          <>
            <BlogTable rows={items} perms={permissionsFor(user.role)} />
            <CursorPagination
              basePath="/admin/blog"
              params={linkParams}
              after={after}
              nextCursor={nextCursor}
            />
          </>
        ) : (
          <EmptyState
            icon={FiFileText}
            title={filtered ? "No posts match this view" : "No posts yet"}
            description={
              filtered
                ? "Try removing a filter or searching for something else."
                : "Create your first article to get started."
            }
            action={
              filtered ? (
                <Link
                  href="/admin/blog"
                  className={buttonVariants({ variant: "outline" })}
                >
                  Clear filters
                </Link>
              ) : (
                canCreate && (
                  <Link href="/admin/blog/create" className={buttonVariants()}>
                    New post
                  </Link>
                )
              )
            }
          />
        )}
      </div>
    </>
  );
}
