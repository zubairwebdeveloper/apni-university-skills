// app/admin/contacts/page.jsx
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { DataTableToolbar } from "@/components/admin/table/DataTableToolbar";
import { ContactsTable } from "@/components/admin/contacts/ContactsTable";
import { CursorPagination } from "@/components/shared/CursorPagination";
import { requirePermission } from "@/lib/auth/authorize";
import { PERMISSIONS as P, permissionsFor } from "@/lib/constants/permissions";
import { RANGE_OPTIONS, sortOptions } from "@/config/adminTable";
import { parseListParams, rangeFilter } from "@/lib/admin/listParams";
import { CONTACT_SORTS, CONTACT_STATUS_OPTIONS, contactAdminRepository } from "@/repositories/admin/contactAdminRepository";

export const metadata = { title: "Messages" };

export default async function AdminContactsPage({ searchParams }) {
  const user = await requirePermission(P.CONTACTS_READ);
  const p = parseListParams(await searchParams, { sorts: CONTACT_SORTS, statuses: CONTACT_STATUS_OPTIONS.map((o) => o.value) });
  const { items, nextCursor, total } = await contactAdminRepository.list({ status: p.status, keyword: p.keyword, sort: p.sort, after: p.after, filters: rangeFilter(p.range) });
  const { after, keyword, ...linkParams } = p;
  return (
    <>
      <AdminPageHeader title="Messages" description="Contact form submissions." />
      <DataTableToolbar searchPlaceholder="Search by name, email or subject…" total={total} sorts={sortOptions(CONTACT_SORTS)}
        filters={[{ key: "status", label: "Status", allLabel: "All (not in trash)", options: CONTACT_STATUS_OPTIONS }, { key: "range", label: "Received", allLabel: "Any time", options: RANGE_OPTIONS }]} />
      <div className="mt-4"><ContactsTable rows={items} perms={permissionsFor(user.role)} /><CursorPagination basePath="/admin/contacts" params={linkParams} after={after} nextCursor={nextCursor} /></div>
    </>
  );
}

