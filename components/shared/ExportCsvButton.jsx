// components/shared/ExportCsvButton.jsx
"use client";

import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";

function toCsv(rows) {
  const esc = (v) => {
    const s = String(v ?? "");
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  return rows.map((row) => row.map(esc).join(",")).join("\n");
}

/**
 * Small, generic client boundary for "download what I'm looking at" on an
 * otherwise server-rendered admin table. Pass already-fetched, already
 * display-formatted rows — this component does no data fetching of its own,
 * so it's safe to drop into any server-component page.
 */
export function ExportCsvButton({
  filename,
  headers,
  rows,
  label = "Export CSV",
}) {
  function handleExport() {
    const csv = toCsv([headers, ...rows]);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename.endsWith(".csv") ? filename : `${filename}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  if (!rows?.length) return null;

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={handleExport}
      className="gap-1.5 text-xs"
    >
      <Download aria-hidden="true" className="size-3.5" />
      {label}
    </Button>
  );
}
