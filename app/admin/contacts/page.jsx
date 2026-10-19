// app/admin/contacts/page.jsx
import Link from "next/link";
import { Inbox, SearchX, X } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { StatusSummaryCards } from "@/components/admin/StatusSummaryCards";
import { DataTableToolbar } from "@/components/admin/table/DataTableToolbar";
import { ContactsTable } from "@/components/admin/contacts/ContactsTable";
import { EmptyState } from "@/components/shared/EmptyState";
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
import { cn } from "@/lib/utils";

export const metadata = { title: "Messages" };

// Shared entrance-animation classes/delays — same pattern used on the other
// admin pages (fade + slide-up, respects prefers-reduced-motion).
const ENTRANCE =
  "animate-in fade-in slide-in-from-bottom-2 duration-500 motion-reduce:animate-none";
const delay = (ms) => ({
  animationDelay: `${ms}ms`,
  animationFillMode: "backwards",
});

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

  // Status-tab links reset the page cursor but must keep the current
  // search term, so only `after` is removed here. `linkParams` above is for
  // CursorPagination, which needs neither `keyword` nor `after`.
  const statusLinkParams = { ...p };
  delete statusLinkParams.after;

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
    href: hrefFor(statusLinkParams, o.value),
    active: p.status === o.value,
  }));

  const activeFilterCount = [p.status, p.range].filter(Boolean).length;
  const searching = Boolean(keyword);
  const filtered = activeFilterCount > 0 || searching;

  return (
    <>
      <div className={ENTRANCE} style={delay(0)}>
        <AdminPageHeader
          title="Messages"
          description="Contact form submissions. Reply by email, then mark each message as replied."
        />
      </div>

      <section
        aria-label="Message status summary"
        className={ENTRANCE}
        style={delay(60)}
      >
        <StatusSummaryCards items={summary} ariaLabel="Messages by status" />
      </section>

      <div className={cn("mt-6", ENTRANCE)} style={delay(120)}>
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

      <section
        aria-label="Messages"
        className={cn("mt-4", ENTRANCE)}
        style={delay(180)}
      >
        {items.length > 0 ? (
          <>
            <ContactsTable rows={items} perms={permissionsFor(user.role)} />
            <CursorPagination
              basePath="/admin/contacts"
              params={linkParams}
              after={after}
              nextCursor={nextCursor}
            />
          </>
        ) : (
          <EmptyState
            icon={filtered ? SearchX : Inbox}
            title={filtered ? "No messages match this view" : "No messages yet"}
            description={
              filtered
                ? "Try removing a filter or searching for something else."
                : "When someone sends the contact form, their message will show up here."
            }
            action={
              filtered ? (
                <Link
                  href="/admin/contacts"
                  className={cn(
                    buttonVariants({ variant: "outline" }),
                    "gap-2",
                  )}
                >
                  <X className="size-4" aria-hidden="true" />
                  Clear filters
                </Link>
              ) : null
            }
          />
        )}
      </section>
    </>
  );
}
