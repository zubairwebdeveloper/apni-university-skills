// app/admin/audit/page.jsx
import { FiChevronRight, FiClipboard } from "react-icons/fi";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { DataTableToolbar } from "@/components/admin/table/DataTableToolbar";
import { CursorPagination } from "@/components/shared/CursorPagination";
import { EmptyState } from "@/components/shared/EmptyState";
import { ExportCsvButton } from "@/components/shared/ExportCsvButton";
import { CopyJsonButton } from "@/components/admin/audit/CopyJsonButton";
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
import { cn } from "@/lib/utils";

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

// Groups raw action strings into a meaning, not just a label, so the same
// blue/emerald/amber/rose vocabulary used elsewhere in admin (roles,
// completion rates) also applies here. Falls back to a neutral badge for
// anything it doesn't recognize, so new/unexpected actions never break.
function actionTone(action) {
  const a = String(action || "").toLowerCase();
  if (/(delete|remove|revoke|ban|suspend|reject)/.test(a))
    return "border-rose-500/30 bg-rose-500/10 text-rose-700 dark:text-rose-300";
  if (/(create|add|grant|approve|publish|restore|activate)/.test(a))
    return "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300";
  if (/(update|edit|change|rename|move)/.test(a))
    return "border-sky-500/30 bg-sky-500/10 text-sky-700 dark:text-sky-300";
  if (/(login|logout|session)/.test(a))
    return "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300";
  return "border-border bg-muted text-muted-foreground";
}

export default async function AuditPage({ searchParams }) {
  await requirePermission(P.AUDIT_READ);
  const p = parseAuditParams(await searchParams);
  const { items, nextCursor, total } = await auditRepository.list(p);
  const { after, ...linkParams } = p;

  return (
    <div className="ea-stagger">
      <style>{`
        @keyframes ea-fade-up { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        @media (prefers-reduced-motion: no-preference) {
          .ea-stagger > * { animation: ea-fade-up 0.45s cubic-bezier(0.22,1,0.36,1) both; }
          .ea-stagger > *:nth-child(1) { animation-delay: 0ms; }
          .ea-stagger > *:nth-child(2) { animation-delay: 60ms; }
          .ea-stagger > *:nth-child(3) { animation-delay: 120ms; }
        }
      `}</style>

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
          <>
            <div className="mb-3 flex justify-end">
              <ExportCsvButton
                filename={`audit-log-${p.range ?? "all"}`}
                headers={[
                  "When",
                  "Who",
                  "Role",
                  "Action",
                  "Resource",
                  "Resource ID",
                ]}
                rows={items.map((a) => [
                  formatDateTime(a.createdAt),
                  a.actorEmail ?? "system",
                  a.actorRole,
                  formatAuditAction(a.action),
                  a.resource,
                  a.resourceSlug ?? "",
                ])}
              />
            </div>
            <div className="overflow-x-auto rounded-xl border bg-card">
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
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={cn("font-medium", actionTone(a.action))}
                        >
                          {formatAuditAction(a.action)}
                        </Badge>
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
                          <details className="group">
                            <summary className="flex cursor-pointer select-none items-center gap-1 text-xs font-medium text-primary">
                              <FiChevronRight
                                aria-hidden="true"
                                className="size-3 transition-transform duration-200 group-open:rotate-90"
                              />
                              View details
                            </summary>
                            <div className="mt-2 max-w-xs space-y-1.5">
                              <div className="flex justify-end">
                                <CopyJsonButton data={a.metadata} />
                              </div>
                              <pre className="overflow-x-auto whitespace-pre-wrap break-words rounded-md border bg-muted p-2 text-xs">
                                {JSON.stringify(a.metadata, null, 2)}
                              </pre>
                            </div>
                          </details>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </>
        )}
        <CursorPagination
          basePath="/admin/audit"
          params={linkParams}
          after={after}
          nextCursor={nextCursor}
        />
      </div>
    </div>
  );
}
