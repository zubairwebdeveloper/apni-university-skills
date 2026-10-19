// components/shared/ExportCsvButton.jsx
"use client";

import { useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

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
  const [exported, setExported] = useState(false);
  const timer = useRef(null);

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

    setExported(true);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setExported(false), 1500);
  }

  if (!rows?.length) return null;

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={handleExport}
      className={cn(
        "gap-1.5 text-xs transition-colors",
        exported && "border-primary/40 text-primary",
      )}
    >
      <span className="relative inline-grid size-3.5 place-items-center">
        <AnimatePresence initial={false} mode="wait">
          {exported ? (
            <motion.span
              key="check"
              initial={{ opacity: 0, scale: 0.6 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.6 }}
              transition={{ duration: 0.15 }}
              className="absolute inset-0 grid place-items-center"
            >
              <Check aria-hidden="true" className="size-3.5" />
            </motion.span>
          ) : (
            <motion.span
              key="download"
              initial={{ opacity: 0, scale: 0.6 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.6 }}
              transition={{ duration: 0.15 }}
              className="absolute inset-0 grid place-items-center"
            >
              <Download aria-hidden="true" className="size-3.5" />
            </motion.span>
          )}
        </AnimatePresence>
      </span>
      {exported ? "Exported" : label}
      <span className="sr-only" aria-live="polite">
        {exported && "CSV downloaded"}
      </span>
    </Button>
  );
}
