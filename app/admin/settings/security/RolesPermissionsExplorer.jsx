"use client";

import { useMemo, useState } from "react";
import { Download, Search, X } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

/**
 * Props (all serialisable, built on the server):
 *  roles:     [{ id, label, total, byResource: { [resource]: string[] } }]
 *  resources: string[]
 *  available: { [resource]: string[] }   // every action that exists per resource
 */

const ACTION_STYLES = {
  read: "bg-sky-500/10 text-sky-700 ring-sky-500/20 dark:text-sky-300",
  create:
    "bg-emerald-500/10 text-emerald-700 ring-emerald-500/20 dark:text-emerald-300",
  update:
    "bg-amber-500/10 text-amber-700 ring-amber-500/20 dark:text-amber-300",
  delete: "bg-red-500/10 text-red-700 ring-red-500/20 dark:text-red-300",
};
const FALLBACK_STYLE =
  "bg-violet-500/10 text-violet-700 ring-violet-500/20 dark:text-violet-300";

const label = (s) => s.replace(/[-_]/g, " ");

function ActionChip({ action, granted = true }) {
  if (!granted) {
    return (
      <span
        className="inline-flex items-center rounded-md px-2 py-0.5 text-xs text-muted-foreground/60 ring-1 ring-inset ring-dashed ring-border line-through decoration-muted-foreground/30"
        title={`Not granted: ${label(action)}`}
      >
        {label(action)}
      </span>
    );
  }
  return (
    <span
      className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${
        ACTION_STYLES[action] ?? FALLBACK_STYLE
      }`}
    >
      {label(action)}
    </span>
  );
}

function CoverageBar({ value, max }) {
  const pct = max ? Math.round((value / max) * 100) : 0;
  return (
    <div className="flex items-center gap-2">
      <div
        className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted"
        role="progressbar"
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Permission coverage"
      >
        <div
          className="h-full rounded-full bg-primary transition-[width] duration-300"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="w-14 text-right text-xs tabular-nums text-muted-foreground">
        {value}/{max}
      </span>
    </div>
  );
}

function Segmented({ value, onChange, options }) {
  return (
    <div className="inline-flex rounded-lg border bg-muted/40 p-0.5">
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          aria-pressed={value === o.value}
          onClick={() => onChange(o.value)}
          className={`rounded-md px-3 py-1.5 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
            value === o.value
              ? "bg-background font-medium shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

export function RolesPermissionsExplorer({ roles, resources, available }) {
  const [view, setView] = useState("role");
  const [query, setQuery] = useState("");
  const [showStudent, setShowStudent] = useState(false);
  const [hoverRole, setHoverRole] = useState(null);

  const visibleRoles = useMemo(
    () => roles.filter((r) => showStudent || r.id !== "student"),
    [roles, showStudent],
  );

  const [activeId, setActiveId] = useState(
    () => roles.find((r) => r.id !== "student")?.id ?? roles[0]?.id,
  );
  const activeRole =
    visibleRoles.find((r) => r.id === activeId) ?? visibleRoles[0];

  const totalAvailable = useMemo(
    () => resources.reduce((n, r) => n + (available[r]?.length ?? 0), 0),
    [resources, available],
  );

  const filteredResources = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return resources;
    return resources.filter(
      (r) =>
        r.toLowerCase().includes(q) ||
        (available[r] ?? []).some((a) => a.toLowerCase().includes(q)),
    );
  }, [query, resources, available]);

  function exportCsv() {
    const header = ["Area", ...visibleRoles.map((r) => r.label)];
    const rows = resources.map((res) => [
      res,
      ...visibleRoles.map((r) => (r.byResource[res] ?? []).join(" ")),
    ]);
    const csv = [header, ...rows]
      .map((row) =>
        row.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(","),
      )
      .join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = "roles-and-permissions.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3">
        <Segmented
          value={view}
          onChange={setView}
          options={[
            { value: "role", label: "By role" },
            { value: "matrix", label: "Compare all" },
          ]}
        />

        <div className="relative min-w-[200px] flex-1 sm:max-w-xs">
          <Search
            className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Filter by area or action"
            aria-label="Filter permissions by area or action"
            className="h-9 w-full rounded-lg border bg-background pl-8 pr-8 text-sm outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              aria-label="Clear filter"
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-0.5 text-muted-foreground hover:text-foreground"
            >
              <X className="size-4" />
            </button>
          )}
        </div>

        <label className="flex cursor-pointer items-center gap-2 text-sm text-muted-foreground">
          <input
            type="checkbox"
            checked={showStudent}
            onChange={(e) => setShowStudent(e.target.checked)}
            className="size-4 rounded border accent-[hsl(var(--primary))]"
          />
          Show students
        </label>

        <button
          type="button"
          onClick={exportCsv}
          className="ml-auto inline-flex h-9 items-center gap-2 rounded-lg border px-3 text-sm transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <Download className="size-4" aria-hidden="true" />
          Export CSV
        </button>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-muted-foreground">
        <span>Actions:</span>
        {["read", "create", "update", "delete"].map((a) => (
          <ActionChip key={a} action={a} />
        ))}
        <span className="inline-flex items-center gap-2">
          <ActionChip action="other" granted={false} />
          not granted
        </span>
      </div>

      {filteredResources.length === 0 ? (
        <div className="rounded-lg border border-dashed p-10 text-center">
          <p className="text-sm font-medium">
            Nothing matches &ldquo;{query}&rdquo;
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Try an area such as courses, or an action such as update.
          </p>
          <button
            type="button"
            onClick={() => setQuery("")}
            className="mt-3 text-sm underline underline-offset-4"
          >
            Clear filter
          </button>
        </div>
      ) : view === "role" ? (
        <div className="grid gap-4 md:grid-cols-[240px_1fr]">
          {/* Role list */}
          <div
            className="flex gap-2 overflow-x-auto md:flex-col md:overflow-visible"
            role="list"
            aria-label="Roles"
          >
            {visibleRoles.map((r) => {
              const active = r.id === activeRole?.id;
              return (
                <button
                  key={r.id}
                  type="button"
                  role="listitem"
                  aria-pressed={active}
                  onClick={() => setActiveId(r.id)}
                  className={`min-w-[170px] rounded-lg border p-3 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring md:min-w-0 ${
                    active
                      ? "border-primary/40 bg-primary/5"
                      : "hover:bg-muted/60"
                  }`}
                >
                  <span className="block text-sm font-medium">{r.label}</span>
                  <span className="mt-2 block">
                    <CoverageBar value={r.total} max={totalAvailable} />
                  </span>
                </button>
              );
            })}
          </div>

          {/* Role detail */}
          <div className="rounded-lg border">
            <div className="flex items-center justify-between border-b px-4 py-3">
              <div>
                <h3 className="text-base font-medium">{activeRole?.label}</h3>
                <p className="text-xs text-muted-foreground">
                  {activeRole?.total} of {totalAvailable} permissions across{" "}
                  {
                    resources.filter(
                      (r) => (activeRole?.byResource[r] ?? []).length > 0,
                    ).length
                  }{" "}
                  areas
                </p>
              </div>
            </div>
            <ul className="divide-y">
              {filteredResources.map((res) => {
                const granted = activeRole?.byResource[res] ?? [];
                const all = available[res] ?? [];
                return (
                  <li
                    key={res}
                    className="flex flex-col gap-2 px-4 py-3 sm:flex-row sm:items-start sm:gap-4"
                  >
                    <div className="sm:w-40 sm:shrink-0">
                      <p className="text-sm font-medium capitalize">{res}</p>
                      <p className="text-xs tabular-nums text-muted-foreground">
                        {granted.length}/{all.length} actions
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {all.map((a) => (
                        <ActionChip
                          key={a}
                          action={a}
                          granted={granted.includes(a)}
                        />
                      ))}
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border">
          <Table className="min-w-[640px]">
            <TableHeader>
              <TableRow>
                <TableHead
                  scope="col"
                  className="sticky left-0 z-10 bg-background"
                >
                  Area
                </TableHead>
                {visibleRoles.map((r) => (
                  <TableHead
                    key={r.id}
                    scope="col"
                    className={hoverRole === r.id ? "bg-muted/60" : ""}
                  >
                    {r.label}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredResources.map((res) => (
                <TableRow key={res}>
                  <TableCell className="sticky left-0 z-10 bg-background font-medium capitalize">
                    {res}
                  </TableCell>
                  {visibleRoles.map((r) => {
                    const granted = r.byResource[res] ?? [];
                    return (
                      <TableCell
                        key={r.id}
                        onMouseEnter={() => setHoverRole(r.id)}
                        onMouseLeave={() => setHoverRole(null)}
                        className={hoverRole === r.id ? "bg-muted/60" : ""}
                      >
                        {granted.length ? (
                          <div className="flex flex-wrap gap-1">
                            {granted.map((a) => (
                              <ActionChip key={a} action={a} />
                            ))}
                          </div>
                        ) : (
                          <span
                            className="text-muted-foreground"
                            aria-label="No access"
                          >
                            —
                          </span>
                        )}
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
