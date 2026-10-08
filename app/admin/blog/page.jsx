// app/admin/blog/page.jsx
import Link from "next/link";
import { z } from "zod";
import { buttonVariants } from "@/components/ui/button";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { DataTableToolbar } from "@/components/admin/table/DataTableToolbar";
import { BlogTable } from "@/components/admin/blog/BlogTable";
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
  return (
    <>
      <AdminPageHeader
        title="Blog"
        description="Write, schedule and publish articles."
        actions={
          can(user.role, P.BLOG_CREATE) && (
            <Link href="/admin/blog/create" className={buttonVariants()}>
              New post
            </Link>
          )
        }
      />
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
        <BlogTable rows={items} perms={permissionsFor(user.role)} />
        <CursorPagination
          basePath="/admin/blog"
          params={linkParams}
          after={after}
          nextCursor={nextCursor}
        />
      </div>
    </>
  );
}

