// app/admin/payments/page.jsx
import { z } from "zod";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { DataTableToolbar } from "@/components/admin/table/DataTableToolbar";
import { PaymentsTable } from "@/components/admin/payments/PaymentsTable";
import { CursorPagination } from "@/components/shared/CursorPagination";
import { requirePermission } from "@/lib/auth/authorize";
import { PERMISSIONS as P, permissionsFor } from "@/lib/constants/permissions";
import { RANGE_OPTIONS, sortOptions } from "@/config/adminTable";
import { parseListParams, rangeFilter } from "@/lib/admin/listParams";
import { refOrEmailFilter } from "@/lib/admin/refSearch";
import {
  PAYMENT_SORTS,
  PAYMENT_STATUSES,
  paymentAdminRepository,
} from "@/repositories/admin/paymentAdminRepository";
import { userAdminRepository } from "@/repositories/admin/userAdminRepository";
import { courseAdminRepository } from "@/repositories/admin/courseAdminRepository";

export const metadata = { title: "Payments" };

export default async function AdminPaymentsPage({ searchParams }) {
  const user = await requirePermission(P.PAYMENTS_READ);
  const p = parseListParams(await searchParams, {
    sorts: PAYMENT_SORTS,
    statuses: PAYMENT_STATUSES,
    filters: { course: z.string().regex(/^[a-z0-9-]{1,120}$/) },
  });
  const filters = [...rangeFilter(p.range)];
  if (p.status && p.status !== "all") filters.push(["status", "==", p.status]);
  if (p.course) filters.push(["courseSlug", "==", p.course]);
  const ref = await refOrEmailFilter(p.q, {
    refPattern: /^pay-[a-z0-9]{6}$/i,
    hint: "Search by a student's full email address or a payment reference (pay-…).",
  });
  filters.push(...ref.filters);

  const [listing, courses] = await Promise.all([
    ref.problem
      ? { items: [], nextCursor: null, total: 0 }
      : paymentAdminRepository.list({ filters, sort: p.sort, after: p.after }),
    courseAdminRepository
      .list({ status: "published", limit: 100, sort: "name-asc" })
      .catch(() => ({ items: [] })),
  ]);
  const names = await userAdminRepository.namesByIds(
    listing.items.map((i) => i.studentId),
  );
  const rows = listing.items.map((i) => ({
    ...i,
    student: names[i.studentId] ?? null,
  }));
  const { after, keyword, ...linkParams } = p;
  return (
    <>
      <AdminPageHeader
        title="Payments"
        description="Read-only. Stripe is the source of truth, and status changes arrive by webhook."
      />
      <DataTableToolbar
        searchPlaceholder="Student email or pay-…"
        searchHint="Exact student email or a payment reference."
        total={ref.problem ? 0 : listing.total}
        sorts={sortOptions(PAYMENT_SORTS)}
        filters={[
          {
            key: "status",
            label: "Status",
            allLabel: "All statuses",
            options: PAYMENT_STATUSES.map((s) => ({
              value: s,
              label: s.charAt(0).toUpperCase() + s.slice(1),
            })),
          },
          {
            key: "course",
            label: "Course",
            allLabel: "All courses",
            options: courses.items.map((c) => ({
              value: c.slug,
              label: c.title,
            })),
          },
          {
            key: "range",
            label: "Date",
            allLabel: "Any time",
            options: RANGE_OPTIONS,
          },
        ]}
      />
      {ref.problem && (
        <Alert className="mt-4">
          <AlertDescription>{ref.problem}</AlertDescription>
        </Alert>
      )}
      <div className="mt-4">
        <PaymentsTable rows={rows} perms={permissionsFor(user.role)} />
        <CursorPagination
          basePath="/admin/payments"
          params={linkParams}
          after={after}
          nextCursor={listing.nextCursor}
        />
      </div>
    </>
  );
}

