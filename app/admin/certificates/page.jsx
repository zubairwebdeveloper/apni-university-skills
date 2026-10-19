// app/admin/certificates/page.jsx
import Link from "next/link";
import { FiAward } from "react-icons/fi";
import { buttonVariants } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { DataTableToolbar } from "@/components/admin/table/DataTableToolbar";
import { CertificatesTable } from "@/components/admin/certificates/CertificatesTable";
import { CertificatesStats } from "@/components/admin/certificates/CertificatesStats";
import { EmptyState } from "@/components/shared/EmptyState";
import { CursorPagination } from "@/components/shared/CursorPagination";
import { requirePermission } from "@/lib/auth/authorize";
import { PERMISSIONS as P, permissionsFor } from "@/lib/constants/permissions";
import { RANGE_OPTIONS, sortOptions } from "@/config/adminTable";
import { parseListParams, rangeFilter } from "@/lib/admin/listParams";
import { refOrEmailFilter } from "@/lib/admin/refSearch";
import {
  CERT_SORTS,
  CERT_STATUSES,
  certificateAdminRepository,
} from "@/repositories/admin/certificateAdminRepository";
import { cn } from "@/lib/utils";

export const metadata = { title: "Certificates" };

// Shared entrance-animation classes/delays — same pattern used on the other
// admin pages (fade + slide-up, respects prefers-reduced-motion).
const ENTRANCE =
  "animate-in fade-in slide-in-from-bottom-2 duration-500 motion-reduce:animate-none";
const delay = (ms) => ({
  animationDelay: `${ms}ms`,
  animationFillMode: "backwards",
});

export default async function AdminCertificatesPage({ searchParams }) {
  const user = await requirePermission(P.CERTIFICATES_READ);
  const p = parseListParams(await searchParams, {
    sorts: CERT_SORTS,
    statuses: CERT_STATUSES,
  });
  const rangeFilters = [...rangeFilter(p.range, "issuedAt")];
  const filters = [...rangeFilters];
  if (p.status && p.status !== "all") filters.push(["status", "==", p.status]);
  const ref = await refOrEmailFilter(p.q, {
    refPattern: /^au-[a-f0-9]{10}$/i,
    normalize: (s) => s.toUpperCase(),
    hint: "Search by a student's full email address or a certificate number (AU-…).",
  });
  filters.push(...ref.filters);

  // Summary counts follow the "Issued" range only, so they stay stable
  // while the table is searched or filtered by status.
  const [listing, valid, revoked] = await Promise.all([
    ref.problem
      ? { items: [], nextCursor: null, total: 0 }
      : certificateAdminRepository.list({
          filters,
          sort: p.sort,
          after: p.after,
        }),
    certificateAdminRepository.list({
      filters: [...rangeFilters, ["status", "==", "valid"]],
      sort: p.sort,
    }),
    certificateAdminRepository.list({
      filters: [...rangeFilters, ["status", "==", "revoked"]],
      sort: p.sort,
    }),
  ]);

  const { after, keyword, ...linkParams } = p;

  // What is narrowing the list right now (status, date range, search)
  const activeFilterCount = [
    p.status && p.status !== "all" ? p.status : null,
    p.range,
  ].filter(Boolean).length;
  const searching = Boolean(p.q);
  const filtered = activeFilterCount > 0 || searching;

  return (
    <>
      <div className={ENTRANCE} style={delay(0)}>
        <AdminPageHeader
          title="Certificates"
          description="Issued automatically when a student completes every lesson. Anyone can verify one with its public link."
        />
      </div>

      <div className={ENTRANCE} style={delay(60)}>
        <CertificatesStats
          total={valid.total + revoked.total}
          valid={valid.total}
          revoked={revoked.total}
        />
      </div>

      <div className={cn("mt-6", ENTRANCE)} style={delay(120)}>
        <DataTableToolbar
          searchPlaceholder="Student email or AU-…"
          searchHint="Exact student email or certificate number."
          total={ref.problem ? 0 : listing.total}
          sorts={sortOptions(CERT_SORTS)}
          filters={[
            {
              key: "status",
              label: "Status",
              allLabel: "All statuses",
              options: [
                { value: "valid", label: "Valid" },
                { value: "revoked", label: "Revoked" },
              ],
            },
            {
              key: "range",
              label: "Issued",
              allLabel: "Any time",
              options: RANGE_OPTIONS,
            },
          ]}
        />
      </div>

      {ref.problem && (
        <Alert className="mt-4">
          <AlertDescription>{ref.problem}</AlertDescription>
        </Alert>
      )}

      <div className={cn("mt-4", ENTRANCE)} style={delay(180)}>
        {!ref.problem && listing.items.length > 0 ? (
          <>
            <CertificatesTable
              rows={listing.items}
              perms={permissionsFor(user.role)}
            />
            <CursorPagination
              basePath="/admin/certificates"
              params={linkParams}
              after={after}
              nextCursor={listing.nextCursor}
            />
          </>
        ) : !ref.problem ? (
          <EmptyState
            icon={FiAward}
            title={
              filtered
                ? "No certificates match this view"
                : "No certificates issued yet"
            }
            description={
              filtered
                ? "Try removing a filter or searching for something else."
                : "Certificates appear here automatically as students complete courses."
            }
            action={
              filtered ? (
                <Link
                  href="/admin/certificates"
                  className={buttonVariants({ variant: "outline" })}
                >
                  Clear filters
                </Link>
              ) : null
            }
          />
        ) : null}
      </div>
    </>
  );
}
