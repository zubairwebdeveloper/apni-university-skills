// app/admin/blog/page.jsx
import Link from "next/link";
import { z } from "zod";
import { FiFileText, FiPlus, FiStar, FiX } from "react-icons/fi";
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
import { cn } from "@/lib/utils";

export const metadata = { title: "Blog" };

const BASE = "/admin/blog";

/**
 * Builds a list URL from the raw search params, applying overrides.
 * An override of `null` removes the key. The cursor is always reset
 * so changing a filter never lands on a stale page.
 */
function href(sp, overrides = {}) {
  const q = new URLSearchParams();
  for (const [k, v] of Object.entries(sp)) {
    if (k === "after" || v == null) continue;
    if (Array.isArray(v)) v.forEach((x) => q.append(k, x));
    else q.set(k, v);
  }
  for (const [k, v] of Object.entries(overrides)) {
    if (v === null) q.delete(k);
    else q.set(k, v);
  }
  const s = q.toString();
  return s ? `${BASE}?${s}` : BASE;
}

function Pill({ to, active, children, icon: Icon }) {
  return (
    <Link
      href={to}
      scroll={false}
      aria-current={active ? "true" : undefined}
      className={cn(
        "inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        active
          ? "border-primary bg-primary text-primary-foreground"
          : "border-border bg-card text-muted-foreground hover:border-foreground/30 hover:text-foreground",
      )}
    >
      {Icon && <Icon className="size-3.5" aria-hidden />}
      {children}
    </Link>
  );
}

function Chip({ to, children }) {
  return (
    <Link
      href={to}
      scroll={false}
      className="group inline-flex items-center gap-1.5 rounded-md bg-muted px-2.5 py-1 text-xs font-medium text-foreground transition-colors hover:bg-destructive/10 hover:text-destructive focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      title="Remove this filter"
    >
      {children}
      <FiX className="size-3" aria-hidden />
      <span className="sr-only">Remove filter</span>
    </Link>
  );
}

export default async function AdminBlogPage({ searchParams }) {
  const user = await requirePermission(P.BLOG_READ);
  const sp = await searchParams;

  const p = parseListParams(sp, {
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
  const perms = permissionsFor(user.role);

  const searching = Boolean(keyword);
  const activeFilterCount = [p.status, p.topic, p.featured, p.range].filter(
    Boolean,
  ).length;
  const filtered = activeFilterCount > 0 || searching;

  // The search box's URL key isn't known here, so find it by its value.
  const searchKey = searching
    ? Object.keys(sp).find((k) => sp[k] === keyword)
    : null;

  const statusLabel = BLOG_STATUS_OPTIONS.find(
    (o) => o.value === p.status,
  )?.label;
  const rangeLabel = RANGE_OPTIONS.find((o) => o.value === p.range)?.label;

  const chips = [
    searching && {
      key: "q",
      label: `Search: ${keyword}`,
      to: href(sp, { [searchKey ?? "q"]: null }),
    },
    p.status && {
      key: "status",
      label: `Status: ${statusLabel ?? p.status}`,
      to: href(sp, { status: null }),
    },
    p.topic && {
      key: "topic",
      label: `Topic: ${topicLabel(p.topic)}`,
      to: href(sp, { topic: null }),
    },
    p.featured && {
      key: "featured",
      label: "Featured only",
      to: href(sp, { featured: null }),
    },
    p.range && {
      key: "range",
      label: `Created: ${rangeLabel ?? p.range}`,
      to: href(sp, { range: null }),
    },
  ].filter(Boolean);

  const summary = [
    {
      label: filtered ? "Matching posts" : "All posts",
      value: typeof total === "number" ? total : "–",
    },
    { label: "On this page", value: items.length },
    { label: "Filters applied", value: chips.length },
  ];

  return (
    <>
      <AdminPageHeader
        title="Blog"
        description="Write, schedule and publish articles."
        actions={
          canCreate && (
            <Link
              href={`${BASE}/create`}
              className={cn(buttonVariants(), "gap-2")}
            >
              <FiPlus aria-hidden />
              New post
            </Link>
          )
        }
      />

      {/* Status tabs: the main way to move around the list */}
      <nav
        aria-label="Filter posts by status"
        className="-mx-1 mb-3 flex gap-2 overflow-x-auto px-1 pb-1"
      >
        <Pill to={href(sp, { status: null })} active={!p.status}>
          All
        </Pill>
        {BLOG_STATUS_OPTIONS.map((o) => (
          <Pill
            key={o.value}
            to={href(sp, { status: o.value })}
            active={p.status === o.value}
          >
            {o.label}
          </Pill>
        ))}
        <span className="mx-1 my-1.5 w-px shrink-0 bg-border" aria-hidden />
        <Pill
          to={href(sp, { featured: p.featured ? null : "yes" })}
          active={!!p.featured}
          icon={FiStar}
        >
          Featured
        </Pill>
      </nav>

      {/* Topic shortcuts */}
      <nav
        aria-label="Filter posts by topic"
        className="-mx-1 mb-4 flex flex-wrap items-center gap-2 overflow-x-auto px-1 pb-1"
      >
        <span className="shrink-0 text-sm text-muted-foreground">Topic</span>
        <Pill to={href(sp, { topic: null })} active={!p.topic}>
          Any
        </Pill>
        {BLOG_TOPICS.map((t) => (
          <Pill
            key={t.slug}
            to={href(sp, { topic: t.slug })}
            active={p.topic === t.slug}
          >
            {t.label}
          </Pill>
        ))}
      </nav>

      {/* Read-out of the current view */}
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

      {/* Applied filters, each removable with one click */}
      {chips.length > 0 && (
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <span className="text-sm text-muted-foreground">Showing</span>
          {chips.map((c) => (
            <Chip key={c.key} to={c.to}>
              {c.label}
            </Chip>
          ))}
          <Link
            href={BASE}
            scroll={false}
            className="ml-1 text-sm font-medium text-primary underline-offset-4 hover:underline"
          >
            Clear all
          </Link>
        </div>
      )}

      <div className="mt-4">
        {items.length > 0 ? (
          <>
            <BlogTable rows={items} perms={perms} />
            <CursorPagination
              basePath={BASE}
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
                ? "Remove a filter or try a different search."
                : "Create your first article to get started."
            }
            action={
              filtered ? (
                <Link
                  href={BASE}
                  className={buttonVariants({ variant: "outline" })}
                >
                  Clear filters
                </Link>
              ) : (
                canCreate && (
                  <Link
                    href={`${BASE}/create`}
                    className={cn(buttonVariants(), "gap-2")}
                  >
                    <FiPlus aria-hidden />
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
