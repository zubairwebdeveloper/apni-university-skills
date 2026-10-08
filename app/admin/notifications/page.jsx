// app/admin/notifications/page.jsx
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { DataTableToolbar } from "@/components/admin/table/DataTableToolbar";
import { NotificationsTable } from "@/components/admin/notifications/NotificationsTable";
import { CursorPagination } from "@/components/shared/CursorPagination";
import { requirePermission } from "@/lib/auth/authorize";
import { can, PERMISSIONS as P } from "@/lib/constants/permissions";
import { RANGE_OPTIONS, sortOptions } from "@/config/adminTable";
import { parseListParams, rangeFilter } from "@/lib/admin/listParams";
import { NOTIFICATION_SORTS, NOTIFICATION_STATUSES, notificationAdminRepository } from "@/repositories/admin/notificationAdminRepository";

export const metadata = { title: "Notifications" };

export default async function AdminNotificationsPage({ searchParams }) {
  const user = await requirePermission(P.NOTIFICATIONS_READ);
  const p = parseListParams(await searchParams, { sorts: NOTIFICATION_SORTS, statuses: NOTIFICATION_STATUSES });
  const filters = [...rangeFilter(p.range)];
  if (p.status && p.status !== "all") filters.push(["status", "==", p.status]);
  const { items, nextCursor, total } = await notificationAdminRepository.list({ filters, sort: p.sort, after: p.after });
  const { after, keyword, q, ...linkParams } = p;
  return (
    <>
      <AdminPageHeader title="Notifications" description="Announcements delivered to students' in-app inbox."
        actions={can(user.role, P.NOTIFICATIONS_CREATE) && <Link href="/admin/notifications/create" className={buttonVariants()}>New notification</Link>} />
      <DataTableToolbar searchable={false} total={total} sorts={sortOptions(NOTIFICATION_SORTS)}
        filters={[{ key: "status", label: "Status", allLabel: "All statuses", options: NOTIFICATION_STATUSES.map((s) => ({ value: s, label: s.charAt(0).toUpperCase() + s.slice(1) })) }, { key: "range", label: "Created", allLabel: "Any time", options: RANGE_OPTIONS }]} />
      <div className="mt-4"><NotificationsTable rows={items} /><CursorPagination basePath="/admin/notifications" params={linkParams} after={after} nextCursor={nextCursor} /></div>
    </>
  );
}

