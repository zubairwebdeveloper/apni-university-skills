// components/admin/analytics/ExportCsvButton.jsx
"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Download } from "lucide-react";
import { Button } from "@/components/ui/button";

// Spreadsheet apps treat a cell starting with one of these as a formula.
// Text (never numbers) is prefixed with an apostrophe so exported data
// cannot run as a formula when someone opens the file in Excel or Sheets.
const FORMULA_START = /^[=+\-@\t\r]/;

function toCsv(rows) {
  const esc = (v) => {
    let s = String(v ?? "");
    if (typeof v === "string" && FORMULA_START.test(s)) s = `'${s}`;
    return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  // CRLF line endings are what the CSV spec and Excel expect.
  return rows.map((row) => row.map(esc).join(",")).join("\r\n");
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
  const [done, setDone] = useState(false);
  const timeoutRef = useRef(null);

  useEffect(() => () => clearTimeout(timeoutRef.current), []);

  function handleExport() {
    // The BOM makes Excel read the file as UTF-8, so non-English text survives.
    const csv = `\uFEFF${toCsv([headers, ...rows])}`;
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename.endsWith(".csv") ? filename : `${filename}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);

    setDone(true);
    clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => setDone(false), 2000);
  }

  if (!rows?.length) return null;

  const count = `${rows.length} ${rows.length === 1 ? "row" : "rows"}`;

  return (
    <>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={handleExport}
        title={`${label} (${count})`}
        className="min-h-9 gap-1.5 text-xs font-medium text-foreground/80 hover:border-primary/60 hover:text-foreground"
      >
        {done ? (
          <Check aria-hidden="true" className="size-3.5 text-primary" />
        ) : (
          <Download aria-hidden="true" className="size-3.5" />
        )}
        {done ? "Exported" : label}
        <span className="sr-only"> ({count})</span>
      </Button>

      {/* Announces the result to screen readers; invisible otherwise. */}
      <span className="sr-only" role="status" aria-live="polite">
        {done ? `Exported ${count} to ${filename}` : ""}
      </span>
    </>
  );
}
