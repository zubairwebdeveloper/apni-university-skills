// components/admin/table/DataTable.jsx
// Columns: { key, header, cell(row), className?, headerClassName?, srOnlyHeader? }
// Pass this from a client component (cell functions can't cross the server/client boundary).
"use client";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

export function DataTable({
  columns,
  rows,
  caption,
  selectable = false,
  selected,
  onSelectedChange,
  empty = null,
  minWidth = "min-w-[820px]",
}) {
  if (!rows.length) return empty;
  const ids = rows.map((r) => r.id);
  const allSelected = ids.every((id) => selected?.has(id));
  const someSelected = ids.some((id) => selected?.has(id));
  const toggleAll = (v) => onSelectedChange(new Set(v === true ? ids : []));
  const toggleOne = (id, v) => {
    const n = new Set(selected);
    if (v === true) n.add(id);
    else n.delete(id);
    onSelectedChange(n);
  };

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
      <Table className={minWidth}>
        <TableCaption className="sr-only">{caption}</TableCaption>
        <TableHeader>
          <TableRow className="border-b border-border bg-muted/40 hover:bg-muted/40">
            {selectable && (
              <TableHead scope="col" className="h-11 w-12 pl-4 pr-0">
                <Checkbox
                  checked={
                    allSelected ? true : someSelected ? "indeterminate" : false
                  }
                  onCheckedChange={toggleAll}
                  aria-label="Select all rows on this page"
                />
              </TableHead>
            )}
            {columns.map((c) => (
              <TableHead
                key={c.key}
                scope="col"
                className={cn(
                  "h-11 whitespace-nowrap px-4 text-xs font-medium uppercase tracking-wide text-muted-foreground",
                  c.headerClassName,
                )}
              >
                {c.srOnlyHeader ? (
                  <span className="sr-only">{c.header}</span>
                ) : (
                  c.header
                )}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row) => (
            <TableRow
              key={row.id}
              data-state={selected?.has(row.id) ? "selected" : undefined}
              className="border-border transition-colors hover:bg-muted/40 data-[state=selected]:bg-violet-500/[0.07] data-[state=selected]:hover:bg-violet-500/10 motion-reduce:transition-none"
            >
              {selectable && (
                <TableCell className="w-12 pl-4 pr-0 align-middle">
                  <Checkbox
                    checked={selected?.has(row.id) ?? false}
                    onCheckedChange={(v) => toggleOne(row.id, v)}
                    aria-label={`Select ${
                      row.title ||
                      row.name ||
                      row.displayName ||
                      row.slug ||
                      "row"
                    }`}
                  />
                </TableCell>
              )}
              {columns.map((c) => (
                <TableCell
                  key={c.key}
                  className={cn("px-4 py-3.5 align-middle", c.className)}
                >
                  {c.cell(row)}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
