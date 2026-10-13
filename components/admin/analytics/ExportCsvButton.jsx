// components/admin/analytics/ExportCsvButton.jsx
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
 * Small client boundary so the (server) analytics page can offer a
 * "download what you're looking at" action without becoming a Client
 * Component itself. Pass already-formatted, already-fetched rows — this
 * component does no data fetching of its own.
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
      variant="ghost"
      size="sm"
      onClick={handleExport}
      className="gap-1.5 text-xs text-muted-foreground"
    >
      <Download aria-hidden="true" className="size-3.5" />
      {label}
    </Button>
  );
}
