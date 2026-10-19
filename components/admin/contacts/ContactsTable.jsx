// components/admin/contacts/ContactsTable.jsx
"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  FiCheck,
  FiCopy,
  FiDownload,
  FiEye,
  FiMail,
  FiX,
} from "react-icons/fi";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/EmptyState";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { DataTable } from "@/components/admin/table/DataTable";
import { RowActions } from "@/components/admin/table/RowActions";
import { contactItems } from "./contactItems";
import { subjectLabel } from "@/lib/admin/contactSubjects";
import { formatDateTime } from "@/lib/utils/format";
import { runContactAction } from "@/app/actions/admin/contacts";
import { cn } from "@/lib/utils";

function initials(name) {
  const parts = String(name ?? "")
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (!parts.length) return "?";
  return (
    parts[0][0] + (parts.length > 1 ? parts[parts.length - 1][0] : "")
  ).toUpperCase();
}

/* ---------- CSV export ---------- */

// Quotes the value and neutralises spreadsheet formulas (=, +, -, @)
const csvCell = (value) => {
  let s = String(value ?? "");
  if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`;
  return `"${s.replace(/"/g, '""')}"`;
};

function downloadCsv(rows) {
  const header = ["Name", "Email", "Subject", "Status", "Received", "Message"];
  const lines = rows.map((r) =>
    [
      r.name,
      r.email,
      subjectLabel(r.subject),
      r.status,
      formatDateTime(r.createdAt),
      r.message,
    ]
      .map(csvCell)
      .join(","),
  );
  const csv = "\uFEFF" + [header.map(csvCell).join(","), ...lines].join("\r\n");
  const url = URL.createObjectURL(
    new Blob([csv], { type: "text/csv;charset=utf-8" }),
  );
  const a = document.createElement("a");
  a.href = url;
  a.download = `messages-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 0);
}

/* ---------- Select-all checkbox (supports the indeterminate state) ---------- */

function SelectAllCheckbox({ checked, indeterminate, onChange }) {
  const ref = useRef(null);

  useEffect(() => {
    if (ref.current) ref.current.indeterminate = indeterminate;
  }, [indeterminate]);

  return (
    <input
      ref={ref}
      type="checkbox"
      checked={checked}
      onChange={onChange}
      className="size-4 cursor-pointer rounded accent-primary"
    />
  );
}

export function ContactsTable({ rows, perms }) {
  const [selected, setSelected] = useState(() => new Set());
  const [copyState, setCopyState] = useState("idle");
  const lastIndex = useRef(null);
  const copyTimer = useRef(null);

  useEffect(() => () => clearTimeout(copyTimer.current), []);

  // Only rows on the current page count, so old selections never linger
  const selectedRows = useMemo(
    () => rows.filter((r) => selected.has(r.slug)),
    [rows, selected],
  );
  const count = selectedRows.length;
  const allSelected = rows.length > 0 && count === rows.length;
  const someSelected = count > 0 && !allSelected;

  const toggleAll = () =>
    setSelected(allSelected ? new Set() : new Set(rows.map((r) => r.slug)));

  const clearSelection = () => {
    setSelected(new Set());
    lastIndex.current = null;
  };

  // Click selects one row; Shift + click selects the whole range
  const toggleRow = (index, shiftKey) => {
    setSelected((previous) => {
      const next = new Set(previous);
      const willSelect = !previous.has(rows[index].slug);
      const from =
        shiftKey && lastIndex.current != null
          ? Math.min(lastIndex.current, index)
          : index;
      const to =
        shiftKey && lastIndex.current != null
          ? Math.max(lastIndex.current, index)
          : index;
      for (let i = from; i <= to; i += 1) {
        if (willSelect) next.add(rows[i].slug);
        else next.delete(rows[i].slug);
      }
      return next;
    });
    lastIndex.current = index;
  };

  const copyEmails = async () => {
    const emails = [
      ...new Set(selectedRows.map((r) => r.email).filter(Boolean)),
    ];
    clearTimeout(copyTimer.current);
    try {
      await navigator.clipboard.writeText(emails.join(", "));
      setCopyState("copied");
    } catch {
      setCopyState("failed");
    }
    copyTimer.current = setTimeout(() => setCopyState("idle"), 1800);
  };

  const columns = [
    {
      key: "select",
      header: "Select",
      srOnlyHeader: true,
      className: "w-10",
      cell: (r) => {
        const index = rows.findIndex((x) => x.slug === r.slug);
        return (
          <input
            type="checkbox"
            checked={selected.has(r.slug)}
            // Selection is handled in onClick so Shift can be detected
            onChange={() => {}}
            onClick={(event) => toggleRow(index, event.shiftKey)}
            aria-label={`Select message from ${r.name}`}
            className="size-4 cursor-pointer rounded accent-primary"
          />
        );
      },
    },
    {
      key: "msg",
      header: "Message",
      className: "min-w-72",
      cell: (r) => {
        const unread = r.status === "new";
        return (
          <div className="flex min-w-0 items-start gap-2.5">
            {/* Unread marker; the Status column already states it in text */}
            <span
              aria-hidden="true"
              className={cn(
                "mt-2 size-2 shrink-0 rounded-full",
                unread ? "bg-[#FACC15]" : "bg-transparent",
              )}
            />
            <div className="min-w-0">
              <Link
                href={`/admin/contacts/${r.slug}`}
                className={cn(
                  "rounded-sm text-sm leading-snug underline-offset-4 outline-none hover:underline focus-visible:ring-2 focus-visible:ring-ring/60",
                  unread
                    ? "font-semibold text-foreground"
                    : "font-medium text-muted-foreground",
                )}
              >
                {subjectLabel(r.subject)}
              </Link>
              <p className="mt-0.5 line-clamp-1 max-w-md text-xs leading-relaxed text-muted-foreground">
                {r.message}
              </p>
            </div>
          </div>
        );
      },
    },
    {
      key: "from",
      header: "From",
      cell: (r) => (
        <div className="flex min-w-0 items-center gap-3">
          <span
            aria-hidden="true"
            className="grid size-8 shrink-0 place-items-center rounded-full bg-primary/10 text-xs font-semibold text-primary ring-1 ring-primary/15"
          >
            {initials(r.name)}
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium leading-snug">
              {r.name}
            </p>
            <p className="truncate text-xs text-muted-foreground">{r.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: "status",
      header: "Status",
      cell: (r) => <StatusBadge status={r.status} />,
    },
    {
      key: "date",
      header: "Received",
      className: "whitespace-nowrap text-sm tabular-nums text-muted-foreground",
      cell: (r) => formatDateTime(r.createdAt),
    },
    {
      key: "actions",
      header: "Actions",
      srOnlyHeader: true,
      className: "w-12",
      cell: (r) => (
        <RowActions
          label={`message from ${r.name}`}
          items={[
            {
              key: "view",
              label: "View",
              icon: FiEye,
              href: `/admin/contacts/${r.slug}`,
            },
            ...contactItems({ row: r, perms, run: runContactAction }),
          ]}
        />
      ),
    },
  ];

  return (
    <>
      {rows.length > 0 && (
        <div
          className={cn(
            "mb-3 flex flex-wrap items-center gap-x-4 gap-y-2 rounded-xl border px-3 py-2.5 transition-colors",
            count > 0 ? "border-primary/30 bg-primary/5" : "bg-muted/30",
          )}
        >
          <label className="flex cursor-pointer items-center gap-2.5 text-sm font-medium">
            <SelectAllCheckbox
              checked={allSelected}
              indeterminate={someSelected}
              onChange={toggleAll}
            />
            <span>
              {count > 0 ? `${count} selected` : "Select all on this page"}
            </span>
          </label>

          {count > 0 && (
            <div className="flex flex-wrap items-center gap-2 sm:ml-auto">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="gap-2"
                onClick={copyEmails}
              >
                {copyState === "copied" ? (
                  <FiCheck
                    className="size-4 text-emerald-600 dark:text-emerald-400"
                    aria-hidden="true"
                  />
                ) : (
                  <FiCopy className="size-4" aria-hidden="true" />
                )}
                {copyState === "copied"
                  ? "Copied"
                  : copyState === "failed"
                    ? "Couldn't copy"
                    : "Copy emails"}
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="gap-2"
                onClick={() => downloadCsv(selectedRows)}
              >
                <FiDownload className="size-4" aria-hidden="true" />
                Export CSV
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="gap-2 text-muted-foreground"
                onClick={clearSelection}
              >
                <FiX className="size-4" aria-hidden="true" />
                Clear
              </Button>
            </div>
          )}

          <span role="status" className="sr-only">
            {count > 0 ? `${count} of ${rows.length} messages selected` : ""}
          </span>
        </div>
      )}

      <DataTable
        columns={columns}
        rows={rows}
        caption="Contact messages"
        minWidth="min-w-[860px]"
        empty={
          <EmptyState
            icon={FiMail}
            title="No messages yet"
            description="Messages sent through the contact form will appear here."
          />
        }
      />
    </>
  );
}
