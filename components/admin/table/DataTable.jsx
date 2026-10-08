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
    v === true ? n.add(id) : n.delete(id);
    onSelectedChange(n);
  };

  return (
    <div className="rounded-xl border bg-card">
      <Table className={minWidth}>
        <TableCaption className="sr-only">{caption}</TableCaption>
        <TableHeader>
          <TableRow>
            {selectable && (
              <TableHead scope="col" className="w-10">
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
              <TableHead key={c.key} scope="col" className={c.headerClassName}>
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
            >
              {selectable && (
                <TableCell>
                  <Checkbox
                    checked={selected?.has(row.id) ?? false}
                    onCheckedChange={(v) => toggleOne(row.id, v)}
                    aria-label={`Select ${row.title ?? row.name ?? row.slug}`}
                  />
                </TableCell>
              )}
              {columns.map((c) => (
                <TableCell key={c.key} className={cn(c.className)}>
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

