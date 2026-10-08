// app/admin/audit/page.jsx
import { FiClipboard } from "react-icons/fi";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { DataTableToolbar } from "@/components/admin/table/DataTableToolbar";
import { CursorPagination } from "@/components/shared/CursorPagination";
import { EmptyState } from "@/components/shared/EmptyState";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { requirePermission } from "@/lib/auth/authorize";
import { PERMISSIONS as P } from "@/lib/constants/permissions";
import { AUDIT_RESOURCES, formatAuditAction } from "@/lib/constants/audit";
import { RANGE_OPTIONS } from "@/config/adminTable";
import { parseAuditParams } from "@/lib/validations/audit";
import { auditRepository } from "@/repositories/admin/auditRepository";
import { formatDateTime } from "@/lib/utils/format";

export const metadata = { title: "Audit log" };

const FILTERS = [
  {
    key: "resource",
    label: "Resource",
    allLabel: "All resources",
    options: AUDIT_RESOURCES.map((r) => ({
      value: r,
      label: r.charAt(0).toUpperCase() + r.slice(1),
    })),
  },
  {
    key: "range",
    label: "Date",
    allLabel: "Any time",
    options: RANGE_OPTIONS.map(({ value, label }) => ({ value, label })),
  },
];

export default async function AuditPage({ searchParams }) {
  await requirePermission(P.AUDIT_READ);
  const p = parseAuditParams(await searchParams);
  const { items, nextCursor, total } = await auditRepository.list(p);
  const { after, ...linkParams } = p;

  return (
    <>
      <AdminPageHeader
        title="Audit log"
        description="Every administrative change, newest first. Entries can't be edited or deleted."
      />
      <DataTableToolbar searchable={false} filters={FILTERS} total={total} />
      <div className="mt-4">
        {!items.length ? (
          <EmptyState
            icon={FiClipboard}
            title="No matching entries"
            description="Admin actions will appear here as they happen."
          />
        ) : (
          <div className="rounded-xl border bg-card">
            <Table className="min-w-[760px]">
              <TableHeader>
                <TableRow>
                  <TableHead scope="col">When</TableHead>
                  <TableHead scope="col">Who</TableHead>
                  <TableHead scope="col">Action</TableHead>
                  <TableHead scope="col">Resource</TableHead>
                  <TableHead scope="col">Details</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((a) => (
                  <TableRow key={a.id}>
                    <TableCell className="whitespace-nowrap text-muted-foreground">
                      {formatDateTime(a.createdAt)}
                    </TableCell>
                    <TableCell>
                      <p className="text-sm">{a.actorEmail ?? "system"}</p>
                      <Badge variant="outline" className="mt-1">
                        {a.actorRole}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-medium">
                      {formatAuditAction(a.action)}
                    </TableCell>
                    <TableCell>
                      <span className="capitalize">{a.resource}</span>
                      {a.resourceSlug && (
                        <p className="font-mono text-xs text-muted-foreground">
                          {a.resourceSlug}
                        </p>
                      )}
                    </TableCell>
                    <TableCell>
                      {a.metadata && Object.keys(a.metadata).length > 0 && (
                        <details>
                          <summary className="cursor-pointer text-xs text-primary">
                            View
                          </summary>
                          <pre className="mt-2 max-w-xs overflow-x-auto whitespace-pre-wrap break-words rounded bg-muted p-2 text-xs">
                            {JSON.stringify(a.metadata, null, 2)}
                          </pre>
                        </details>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
        <CursorPagination
          basePath="/admin/audit"
          params={linkParams}
          after={after}
          nextCursor={nextCursor}
        />
      </div>
    </>
  );
}

