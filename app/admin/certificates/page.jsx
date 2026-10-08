// app/admin/certificates/page.jsx
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { DataTableToolbar } from "@/components/admin/table/DataTableToolbar";
import { CertificatesTable } from "@/components/admin/certificates/CertificatesTable";
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

export const metadata = { title: "Certificates" };

export default async function AdminCertificatesPage({ searchParams }) {
  const user = await requirePermission(P.CERTIFICATES_READ);
  const p = parseListParams(await searchParams, {
    sorts: CERT_SORTS,
    statuses: CERT_STATUSES,
  });
  const filters = [...rangeFilter(p.range, "issuedAt")];
  if (p.status && p.status !== "all") filters.push(["status", "==", p.status]);
  const ref = await refOrEmailFilter(p.q, {
    refPattern: /^au-[a-f0-9]{10}$/i,
    normalize: (s) => s.toUpperCase(),
    hint: "Search by a student's full email address or a certificate number (AU-…).",
  });
  filters.push(...ref.filters);
  const listing = ref.problem
    ? { items: [], nextCursor: null, total: 0 }
    : await certificateAdminRepository.list({
        filters,
        sort: p.sort,
        after: p.after,
      });
  const { after, keyword, ...linkParams } = p;
  return (
    <>
      <AdminPageHeader
        title="Certificates"
        description="Issued automatically when a student completes every lesson. Anyone can verify one with its public link."
      />
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
      {ref.problem && (
        <Alert className="mt-4">
          <AlertDescription>{ref.problem}</AlertDescription>
        </Alert>
      )}
      <div className="mt-4">
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
      </div>
    </>
  );
}

