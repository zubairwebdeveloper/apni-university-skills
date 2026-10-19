import { z } from "zod";
import {
  Activity,
  ArrowRight,
  BadgeCheck,
  BookOpen,
  CalendarClock,
  CreditCard,
  Database,
  ShieldCheck,
  Wallet,
} from "lucide-react";

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

export const metadata = {
  title: "Payments",
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

export default async function AdminPaymentsPage({ searchParams }) {
  const user = await requirePermission(P.PAYMENTS_READ);

  const p = parseListParams(await searchParams, {
    sorts: PAYMENT_SORTS,
    statuses: PAYMENT_STATUSES,
    filters: {
      course: z.string().regex(/^[a-z0-9-]{1,120}$/),
    },
  });

  const filters = [...rangeFilter(p.range)];

  if (p.status && p.status !== "all") {
    filters.push(["status", "==", p.status]);
  }

  if (p.course) {
    filters.push(["courseSlug", "==", p.course]);
  }

  const ref = await refOrEmailFilter(p.q, {
    refPattern: /^pay-[a-z0-9]{6}$/i,
    hint: "Search by a student's full email address or a payment reference (pay-…).",
  });

  filters.push(...ref.filters);

  const [listing, courses] = await Promise.all([
    ref.problem
      ? { items: [], nextCursor: null, total: 0 }
      : paymentAdminRepository.list({
          filters,
          sort: p.sort,
          after: p.after,
        }),

    courseAdminRepository
      .list({
        status: "published",
        limit: 100,
        sort: "name-asc",
      })
      .catch(() => ({ items: [] })),
  ]);

  const names = await userAdminRepository.namesByIds(
    listing.items.map((item) => item.studentId),
  );

  const rows = listing.items.map((item) => ({
    ...item,
    student: names[item.studentId] ?? null,
  }));

  const { after, keyword, ...linkParams } = p;

  const total = ref.problem ? 0 : listing.total;
  const activeFilters = [
    Boolean(p.status && p.status !== "all"),
    Boolean(p.course),
    Boolean(p.range),
    Boolean(p.q),
  ].filter(Boolean).length;

  const statusOptions = PAYMENT_STATUSES.map((status) => ({
    value: status,
    label: status.charAt(0).toUpperCase() + status.slice(1),
  }));

  return (
    <div className="space-y-6">
      {/* Page introduction */}
      <section className="rounded-2xl border border-border bg-card p-5 sm:p-7">
        <div className="mb-5 flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-2 rounded-full border border-yellow-500/25 bg-yellow-400/10 px-3 py-1.5 text-xs font-semibold text-yellow-700 dark:text-yellow-300">
            <Wallet className="size-3.5" aria-hidden="true" />
            Financial management
          </span>

          <span className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-300">
            <ShieldCheck className="size-3.5" aria-hidden="true" />
            Read-only access
          </span>
        </div>

        <AdminPageHeader
          title="Payments"
          description="Review student payment records, search transaction references, and monitor payment statuses synchronized through Stripe webhooks."
        />
      </section>

      {/* Overview cards */}
      <section
        aria-label="Payment overview"
        className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3"
      >
        <SummaryCard
          icon={CreditCard}
          label="Matching payments"
          value={typeof total === "number" ? total : "–"}
          description="Transactions matching your current filters"
          accent="border-yellow-500/20 bg-yellow-400/10 text-yellow-600 dark:text-yellow-400"
        />

        <SummaryCard
          icon={Database}
          label="On this page"
          value={rows.length}
          description="Payment records in this result set"
          accent="border-purple-500/20 bg-purple-500/10 text-purple-600 dark:text-purple-400"
        />

        <SummaryCard
          icon={CalendarClock}
          label="Active filters"
          value={activeFilters}
          description={
            activeFilters
              ? "Search or transaction filters applied"
              : "No additional filters applied"
          }
          accent="border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
        />
      </section>

      {/* Stripe source-of-truth notice */}
      <Alert className="overflow-hidden rounded-2xl border border-purple-500/20 bg-purple-500/[0.04] px-4 py-4 sm:px-5">
        <div className="flex items-start gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-purple-500/20 bg-purple-500/10 text-purple-600 dark:text-purple-400">
            <Activity className="size-5" aria-hidden="true" />
          </div>

          <div className="min-w-0 flex-1">
            <p className="font-semibold text-foreground">
              Stripe payment synchronization
            </p>

            <AlertDescription className="mt-1 text-sm leading-6 text-muted-foreground">
              This dashboard is read-only. Payment statuses are maintained
              through your existing Stripe webhook workflow. Review the
              transaction records here; do not manually change a payment&apos;s
              status from this page.
            </AlertDescription>
          </div>

          <BadgeCheck
            className="mt-1 size-5 shrink-0 text-emerald-600 dark:text-emerald-400"
            aria-hidden="true"
          />
        </div>
      </Alert>

      {/* Filters and payment records */}
      <section className="overflow-hidden rounded-2xl border border-border bg-card">
        <div className="flex flex-col gap-3 border-b border-border p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
          <div className="flex items-start gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-yellow-500/20 bg-yellow-400/10 text-yellow-700 dark:text-yellow-300">
              <CreditCard className="size-5" aria-hidden="true" />
            </div>

            <div>
              <h2 className="font-semibold tracking-tight text-foreground">
                Payment transactions
              </h2>

              <p className="mt-1 text-sm text-muted-foreground">
                Find payments by student email, reference, course, status or
                date.
              </p>
            </div>
          </div>

          <span className="inline-flex w-fit items-center gap-2 rounded-full border border-border bg-muted/50 px-3 py-1.5 text-xs font-medium text-muted-foreground">
            <span className="size-2 rounded-full bg-purple-500" />
            {typeof total === "number" ? total : rows.length} results
          </span>
        </div>

        <div className="p-4 sm:p-5">
          <DataTableToolbar
            searchPlaceholder="Student email or pay-…"
            searchHint="Enter an exact student email address or a payment reference."
            total={total}
            sorts={sortOptions(PAYMENT_SORTS)}
            filters={[
              {
                key: "status",
                label: "Status",
                allLabel: "All statuses",
                options: statusOptions,
              },
              {
                key: "course",
                label: "Course",
                allLabel: "All courses",
                options: courses.items.map((course) => ({
                  value: course.slug,
                  label: course.title,
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
        </div>

        {ref.problem ? (
          <div className="border-t border-border p-4 sm:p-5">
            <Alert variant="destructive" className="rounded-xl">
              <AlertDescription>{ref.problem}</AlertDescription>
            </Alert>
          </div>
        ) : null}

        {rows.length > 0 ? (
          <>
            <div className="border-t border-border">
              <PaymentsTable rows={rows} perms={permissionsFor(user.role)} />
            </div>

            <div className="flex flex-col gap-2 border-t border-border bg-muted/20 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5">
              <p className="text-xs text-muted-foreground">
                Payment information is displayed from the existing repository.
              </p>

              <p className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                <ShieldCheck
                  className="size-3.5 text-emerald-600 dark:text-emerald-400"
                  aria-hidden="true"
                />
                Payment status is managed by the Stripe workflow
              </p>
            </div>
          </>
        ) : (
          <div className="border-t border-border px-5 py-12 text-center sm:py-16">
            <div className="mx-auto flex size-14 items-center justify-center rounded-2xl border border-purple-500/20 bg-purple-500/10 text-purple-600 dark:text-purple-400">
              <CreditCard className="size-6" aria-hidden="true" />
            </div>

            <h3 className="mt-4 text-base font-semibold text-foreground">
              {ref.problem ? "Search needs attention" : "No payments found"}
            </h3>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted-foreground">
              {ref.problem
                ? "Check the search format and try again with an exact student email address or a valid payment reference."
                : "No payment records match the current search and filters. Try another status, course or date range."}
            </p>
          </div>
        )}
      </section>

      {/* Cursor pagination */}
      <CursorPagination
        basePath="/admin/payments"
        params={linkParams}
        after={after}
        nextCursor={listing.nextCursor}
      />
    </div>
  );
}
