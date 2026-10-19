import Link from "next/link";
import {
  ArrowRight,
  BellRing,
  CalendarClock,
  CheckCheck,
  CircleDot,
  Plus,
  Send,
  Sparkles,
} from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { DataTableToolbar } from "@/components/admin/table/DataTableToolbar";
import { NotificationsTable } from "@/components/admin/notifications/NotificationsTable";
import { CursorPagination } from "@/components/shared/CursorPagination";

import { requirePermission } from "@/lib/auth/authorize";
import { can, PERMISSIONS as P } from "@/lib/constants/permissions";

import { RANGE_OPTIONS, sortOptions } from "@/config/adminTable";
import { parseListParams, rangeFilter } from "@/lib/admin/listParams";

import {
  NOTIFICATION_SORTS,
  NOTIFICATION_STATUSES,
  notificationAdminRepository,
} from "@/repositories/admin/notificationAdminRepository";

export const metadata = {
  title: "Notifications",
};

function SummaryCard({ icon: Icon, label, value, description, accent }) {
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-border bg-card p-5 transition-all duration-300 hover:-translate-y-0.5 hover:border-foreground/15 hover:shadow-lg hover:shadow-black/[0.03]">
      <div
        className={`mb-5 flex size-11 items-center justify-center rounded-xl border ${accent}`}
      >
        <Icon className="size-5" aria-hidden="true" />
      </div>

      <p className="text-sm font-medium text-muted-foreground">{label}</p>

      <p className="mt-2 text-3xl font-bold tracking-tight text-foreground tabular-nums">
        {value}
      </p>

      <p className="mt-1 text-xs leading-5 text-muted-foreground">
        {description}
      </p>

      <ArrowRight
        className="absolute right-5 top-5 size-4 text-muted-foreground/50 transition-all duration-300 group-hover:translate-x-1 group-hover:text-foreground"
        aria-hidden="true"
      />
    </div>
  );
}

export default async function AdminNotificationsPage({ searchParams }) {
  const user = await requirePermission(P.NOTIFICATIONS_READ);

  const p = parseListParams(await searchParams, {
    sorts: NOTIFICATION_SORTS,
    statuses: NOTIFICATION_STATUSES,
  });

  const filters = [...rangeFilter(p.range)];

  if (p.status && p.status !== "all") {
    filters.push(["status", "==", p.status]);
  }

  const { items, nextCursor, total } = await notificationAdminRepository.list({
    filters,
    sort: p.sort,
    after: p.after,
  });

  const { after, keyword, q, ...linkParams } = p;

  const canCreate = can(user.role, P.NOTIFICATIONS_CREATE);

  const statusOptions = NOTIFICATION_STATUSES.map((status) => ({
    value: status,
    label: status.charAt(0).toUpperCase() + status.slice(1),
  }));

  const hasStatusFilter = Boolean(p.status && p.status !== "all");
  const hasRangeFilter = Boolean(p.range);
  const activeFilters = Number(hasStatusFilter) + Number(hasRangeFilter);

  return (
    <div className="space-y-6">
      {/* Page introduction */}
      <section className="rounded-2xl border border-border bg-card p-5 sm:p-7">
        <div className="mb-5 flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-2 rounded-full border border-yellow-500/25 bg-yellow-400/10 px-3 py-1.5 text-xs font-semibold text-yellow-700 dark:text-yellow-300">
            <BellRing className="size-3.5" aria-hidden="true" />
            Communication center
          </span>

          <span className="inline-flex items-center gap-2 rounded-full border border-purple-500/20 bg-purple-500/10 px-3 py-1.5 text-xs font-semibold text-purple-700 dark:text-purple-300">
            <Sparkles className="size-3.5" aria-hidden="true" />
            Student announcements
          </span>
        </div>

        <AdminPageHeader
          title="Notifications"
          description="Manage announcements delivered to students' in-app inbox. Keep learners informed about courses, updates and important news."
          actions={
            canCreate ? (
              <Link
                href="/admin/notifications/create"
                className={buttonVariants({
                  size: "default",
                  className:
                    "border border-yellow-400 bg-yellow-400 font-semibold text-black shadow-sm transition-all hover:bg-yellow-300 hover:shadow-md",
                })}
              >
                <Plus className="mr-2 size-4" />
                New notification
              </Link>
            ) : null
          }
        />
      </section>

      {/* Overview cards */}
      <section
        aria-label="Notification overview"
        className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3"
      >
        <SummaryCard
          icon={BellRing}
          label="Matching notifications"
          value={typeof total === "number" ? total : "–"}
          description="Results for the selected filters"
          accent="border-yellow-500/20 bg-yellow-400/10 text-yellow-600 dark:text-yellow-400"
        />

        <SummaryCard
          icon={Send}
          label="On this page"
          value={items.length}
          description="Notifications in this result set"
          accent="border-purple-500/20 bg-purple-500/10 text-purple-600 dark:text-purple-400"
        />

        <SummaryCard
          icon={CalendarClock}
          label="Active filters"
          value={activeFilters}
          description={
            activeFilters
              ? "Status or creation date filters applied"
              : "Showing notifications without extra filters"
          }
          accent="border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
        />
      </section>

      {/* Filters and results */}
      <section className="overflow-hidden rounded-2xl border border-border bg-card">
        <div className="flex flex-col gap-3 border-b border-border p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
          <div className="flex items-start gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-purple-500/20 bg-purple-500/10 text-purple-600 dark:text-purple-400">
              <CircleDot className="size-5" aria-hidden="true" />
            </div>

            <div>
              <h2 className="font-semibold tracking-tight text-foreground">
                Notification activity
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Review and manage your student announcements.
              </p>
            </div>
          </div>

          <span className="inline-flex w-fit items-center gap-2 rounded-full border border-border bg-muted/50 px-3 py-1.5 text-xs font-medium text-muted-foreground">
            <span className="size-2 rounded-full bg-yellow-400" />
            {typeof total === "number" ? total : items.length} results
          </span>
        </div>

        <div className="p-4 sm:p-5">
          <DataTableToolbar
            searchable={false}
            total={total}
            sorts={sortOptions(NOTIFICATION_SORTS)}
            filters={[
              {
                key: "status",
                label: "Status",
                allLabel: "All statuses",
                options: statusOptions,
              },
              {
                key: "range",
                label: "Created",
                allLabel: "Any time",
                options: RANGE_OPTIONS,
              },
            ]}
          />
        </div>

        {items.length > 0 ? (
          <>
            <div className="border-t border-border">
              <NotificationsTable rows={items} />
            </div>

            <div className="flex flex-col gap-2 border-t border-border bg-muted/20 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5">
              <p className="text-xs text-muted-foreground">
                Showing the notifications returned by the current query.
              </p>

              <p className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                <CheckCheck
                  className="size-3.5 text-emerald-600 dark:text-emerald-400"
                  aria-hidden="true"
                />
                Manage announcements from this workspace
              </p>
            </div>
          </>
        ) : (
          <div className="border-t border-border px-5 py-12 text-center sm:py-16">
            <div className="mx-auto flex size-14 items-center justify-center rounded-2xl border border-purple-500/20 bg-purple-500/10 text-purple-600 dark:text-purple-400">
              <BellRing className="size-6" aria-hidden="true" />
            </div>

            <h3 className="mt-4 text-base font-semibold text-foreground">
              No notifications found
            </h3>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted-foreground">
              There are no notifications matching your current filters. Try
              another status or creation date range.
            </p>

            {canCreate && (
              <Link
                href="/admin/notifications/create"
                className={buttonVariants({
                  size: "sm",
                  className:
                    "mt-5 border border-yellow-400 bg-yellow-400 font-semibold text-black hover:bg-yellow-300",
                })}
              >
                <Plus className="mr-2 size-4" />
                Create notification
              </Link>
            )}
          </div>
        )}
      </section>

      {/* Cursor-based pagination */}
      <CursorPagination
        basePath="/admin/notifications"
        params={linkParams}
        after={after}
        nextCursor={nextCursor}
      />
    </div>
  );
}
