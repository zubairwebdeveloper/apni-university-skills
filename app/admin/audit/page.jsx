// app/admin/audit/page.jsx
import {
  FiActivity,
  FiChevronRight,
  FiClipboard,
  FiEdit3,
  FiLogIn,
  FiPlusCircle,
  FiTrash2,
  FiUsers,
} from "react-icons/fi";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { DataTableToolbar } from "@/components/admin/table/DataTableToolbar";
import { AuditPagination } from "@/components/shared/AuditPagination";
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
import { Card, CardContent } from "@/components/ui/card";
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

// Raw action string -> a meaning (kind), so badge colour, row accent and the
// summary cards all share one vocabulary. Unknown actions fall back to
// "other" so new actions never break the page.
const KINDS = {
  destructive: {
    label: "Destructive",
    icon: FiTrash2,
    badge: "border-rose-500/30 bg-rose-500/10 text-rose-700 dark:text-rose-300",
    accent: "border-l-rose-500",
    iconWrap: "bg-rose-500/10 text-rose-600 dark:text-rose-300",
  },
  create: {
    label: "Created",
    icon: FiPlusCircle,
    badge:
      "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
    accent: "border-l-emerald-500",
    iconWrap: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-300",
  },
  update: {
    label: "Updated",
    icon: FiEdit3,
    badge: "border-sky-500/30 bg-sky-500/10 text-sky-700 dark:text-sky-300",
    accent: "border-l-sky-500",
    iconWrap: "bg-sky-500/10 text-sky-600 dark:text-sky-300",
  },
  session: {
    label: "Sessions",
    icon: FiLogIn,
    badge:
      "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300",
    accent: "border-l-amber-500",
    iconWrap: "bg-amber-500/10 text-amber-600 dark:text-amber-300",
  },
  other: {
    label: "Other",
    icon: FiActivity,
    badge: "border-border bg-muted text-muted-foreground",
    accent: "border-l-border",
    iconWrap: "bg-muted text-muted-foreground",
  },
};

function actionKind(action) {
  const a = String(action || "").toLowerCase();
  if (/(delete|remove|revoke|ban|suspend|reject)/.test(a)) return "destructive";
  if (/(create|add|grant|approve|publish|restore|activate)/.test(a))
    return "create";
  if (/(update|edit|change|rename|move)/.test(a)) return "update";
  if (/(login|logout|session)/.test(a)) return "session";
  return "other";
}

function timeAgo(date) {
  const t = new Date(date).getTime();
  if (Number.isNaN(t)) return "";
  const s = Math.max(0, Math.floor((Date.now() - t) / 1000));
  if (s < 60) return "just now";
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 30) return `${d}d ago`;
  return "";
}

function initials(email) {
  if (!email) return "SY";
  return email.split("@")[0].slice(0, 2).toUpperCase();
}

function parseTrail(raw) {
  if (typeof raw !== "string") return [];
  return raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 100);
}

function StatCard({ icon: Icon, label, value, iconWrap }) {
  return (
    <Card className="py-0">
      <CardContent className="flex items-center gap-3 p-4">
        <span
          className={cn(
            "grid size-10 shrink-0 place-items-center rounded-lg",
            iconWrap,
          )}
        >
          <Icon aria-hidden="true" className="size-5" />
        </span>
        <div className="min-w-0">
          <p className="text-2xl font-semibold leading-none tabular-nums">
            {value}
          </p>
          <p className="mt-1 truncate text-xs text-muted-foreground">{label}</p>
        </div>
      </CardContent>
    </Card>
  );
}

// Shared entrance-animation classes/delays — same pattern used on the other
// admin pages (fade + slide-up, respects prefers-reduced-motion). Applied
// directly to each real content block below instead of a bespoke <style>
// tag, since matching `.wrapper > *` previously counted the <style> element
// itself as a child and threw every delay off by one.
const ENTRANCE =
  "animate-in fade-in slide-in-from-bottom-2 duration-500 motion-reduce:animate-none";
const delay = (ms) => ({
  animationDelay: `${ms}ms`,
  animationFillMode: "backwards",
});

export default async function AuditPage({ searchParams }) {
  await requirePermission(P.AUDIT_READ);
  const sp = await searchParams;
  const p = parseAuditParams(sp);
  const trail = parseTrail(sp?.trail);
  const { items, nextCursor, total } = await auditRepository.list(p);
  const { after, ...linkParams } = p;

  // Quick insights computed from the current page only (no extra queries).
  const kinds = items.map((a) => actionKind(a.action));
  const countOf = (k) => kinds.filter((x) => x === k).length;
  const uniqueActors = new Set(items.map((a) => a.actorEmail ?? "system")).size;

  return (
    <div>
      <div className={ENTRANCE} style={delay(0)}>
        <AdminPageHeader
          title="Audit log"
          description="Every administrative change, newest first. Entries can't be edited or deleted."
        />
      </div>

      {items.length > 0 && (
        <div
          className={cn("mb-4 grid grid-cols-2 gap-3 lg:grid-cols-4", ENTRANCE)}
          style={delay(60)}
        >
          <StatCard
            icon={FiClipboard}
            label="Entries on this page"
            value={items.length}
            iconWrap="bg-primary/10 text-primary"
          />
          <StatCard
            icon={FiUsers}
            label="Unique actors"
            value={uniqueActors}
            iconWrap={KINDS.update.iconWrap}
          />
          <StatCard
            icon={KINDS.create.icon}
            label="Creations"
            value={countOf("create")}
            iconWrap={KINDS.create.iconWrap}
          />
          <StatCard
            icon={KINDS.destructive.icon}
            label="Destructive actions"
            value={countOf("destructive")}
            iconWrap={KINDS.destructive.iconWrap}
          />
        </div>
      )}

      <div className={ENTRANCE} style={delay(120)}>
        <DataTableToolbar searchable={false} filters={FILTERS} total={total} />
      </div>

      <div className={cn("mt-4", ENTRANCE)} style={delay(180)}>
        {!items.length ? (
          <EmptyState
            icon={FiClipboard}
            title="No matching entries"
            description="Admin actions will appear here as they happen."
          />
        ) : (
          <>
            <div className="mb-3 flex items-center justify-between gap-3">
              <p className="text-xs text-muted-foreground">
                Click “View details” to inspect or copy the raw metadata.
              </p>
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
                  {items.map((a, i) => {
                    const kind = KINDS[kinds[i]];
                    const KindIcon = kind.icon;
                    const ago = timeAgo(a.createdAt);
                    return (
                      <TableRow
                        key={a.id}
                        className={cn("border-l-2", kind.accent)}
                      >
                        <TableCell className="whitespace-nowrap">
                          <p className="text-sm">
                            {formatDateTime(a.createdAt)}
                          </p>
                          {ago && (
                            <p className="text-xs text-muted-foreground">
                              {ago}
                            </p>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2.5">
                            <span
                              aria-hidden="true"
                              className="grid size-8 shrink-0 place-items-center rounded-full bg-muted text-[11px] font-semibold text-muted-foreground"
                            >
                              {initials(a.actorEmail)}
                            </span>
                            <div className="min-w-0">
                              <p className="truncate text-sm">
                                {a.actorEmail ?? "system"}
                              </p>
                              <Badge variant="outline" className="mt-0.5">
                                {a.actorRole}
                              </Badge>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={cn("gap-1.5 font-medium", kind.badge)}
                          >
                            <KindIcon aria-hidden="true" className="size-3" />
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
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </>
        )}

        <AuditPagination
          basePath="/admin/audit"
          params={linkParams}
          after={after}
          trail={trail}
          nextCursor={nextCursor}
          shown={items.length}
          total={total}
        />
      </div>
    </div>
  );
}
