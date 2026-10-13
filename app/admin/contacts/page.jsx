// app/admin/contacts/page.jsx
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { StatusSummaryCards } from "@/components/admin/StatusSummaryCards";
import { DataTableToolbar } from "@/components/admin/table/DataTableToolbar";
import { ContactsTable } from "@/components/admin/contacts/ContactsTable";
import { CursorPagination } from "@/components/shared/CursorPagination";
import { requirePermission } from "@/lib/auth/authorize";
import { PERMISSIONS as P, permissionsFor } from "@/lib/constants/permissions";
import { RANGE_OPTIONS, sortOptions } from "@/config/adminTable";
import { parseListParams, rangeFilter } from "@/lib/admin/listParams";
import {
  CONTACT_SORTS,
  CONTACT_STATUS_OPTIONS,
  contactAdminRepository,
} from "@/repositories/admin/contactAdminRepository";

export const metadata = { title: "Messages" };

function hrefFor(params, status) {
  const qs = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (k === "status" || v == null || v === "") continue;
    qs.set(k, String(v));
  }
  if (status) qs.set("status", status);
  const s = qs.toString();
  return `/admin/contacts${s ? `?${s}` : ""}`;
}

export default async function AdminContactsPage({ searchParams }) {
  const user = await requirePermission(P.CONTACTS_READ);
  const p = parseListParams(await searchParams, {
    sorts: CONTACT_SORTS,
    statuses: CONTACT_STATUS_OPTIONS.map((o) => o.value),
  });
  const range = rangeFilter(p.range);
  const { after, keyword, ...linkParams } = p;

  // One count per status option, limited to the selected "Received" range.
  const [{ items, nextCursor, total }, ...counts] = await Promise.all([
    contactAdminRepository.list({
      status: p.status,
      keyword: p.keyword,
      sort: p.sort,
      after: p.after,
      filters: range,
    }),
    ...CONTACT_STATUS_OPTIONS.map((o) =>
      contactAdminRepository.list({
        status: o.value,
        sort: p.sort,
        filters: range,
      }),
    ),
  ]);

  const summary = CONTACT_STATUS_OPTIONS.map((o, i) => ({
    key: o.value,
    label: o.label,
    count: counts[i].total,
    href: hrefFor(linkParams, o.value),
    active: p.status === o.value,
  }));

  return (
    <>
      <AdminPageHeader
        title="Messages"
        description="Contact form submissions."
      />
      <StatusSummaryCards items={summary} ariaLabel="Messages by status" />
      <div className="mt-6">
        <DataTableToolbar
          searchPlaceholder="Search by name, email or subject…"
          total={total}
          sorts={sortOptions(CONTACT_SORTS)}
          filters={[
            {
              key: "status",
              label: "Status",
              allLabel: "All (not in trash)",
              options: CONTACT_STATUS_OPTIONS,
            },
            {
              key: "range",
              label: "Received",
              allLabel: "Any time",
              options: RANGE_OPTIONS,
            },
          ]}
        />
      </div>
      <div className="mt-4">
        <ContactsTable rows={items} perms={permissionsFor(user.role)} />
        <CursorPagination
          basePath="/admin/contacts"
          params={linkParams}
          after={after}
          nextCursor={nextCursor}
        />
      </div>
    </>
  );
}
