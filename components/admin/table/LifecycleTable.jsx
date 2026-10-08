// components/admin/table/LifecycleTable.jsx: one table shell for every lifecycle-managed resource.
// Client components pass `columns`, `run` and `bulk`, because functions can't cross the server/client boundary.
"use client";
import { FiEdit2, FiEye } from "react-icons/fi";
import { EmptyState } from "@/components/shared/EmptyState";
import { DataTable } from "./DataTable";
import { BulkActionBar } from "./BulkActionBar";
import { RowActions } from "./RowActions";
import { lifecycleBulkActions, lifecycleItems } from "./lifecycle";
import { useSelection } from "@/hooks/useSelection";

export function LifecycleTable({
  rows,
  perms,
  prefix,
  noun,
  plural,
  caption,
  columns,
  run,
  bulk,
  basePath,
  titleKey = "title",
  extraItems,
  hasView = true,
  emptyIcon,
  emptyTitle,
  minWidth,
}) {
  const { selected, setSelected, clear, ids } = useSelection(rows);
  const all = [
    ...columns,
    {
      key: "actions",
      header: "Actions",
      srOnlyHeader: true,
      className: "w-12",
      cell: (r) => (
        <RowActions
          label={r[titleKey]}
          items={[
            {
              key: "view",
              label: "View",
              icon: FiEye,
              href: `${basePath}/${r.slug}`,
              hidden: !hasView,
            },
            {
              key: "edit",
              label: "Edit",
              icon: FiEdit2,
              href: `${basePath}/${r.slug}/edit`,
              hidden:
                !perms.includes(`${prefix}.update`) || r.status === "deleted",
            },
            ...(extraItems?.(r) ?? []),
            ...lifecycleItems({ row: r, perms, prefix, noun, run }),
          ]}
        />
      ),
    },
  ];
  return (
    <>
      <DataTable
        columns={all}
        rows={rows}
        caption={caption}
        selectable
        selected={selected}
        onSelectedChange={setSelected}
        minWidth={minWidth}
        empty={
          <EmptyState
            icon={emptyIcon}
            title={emptyTitle}
            description="Try a different search or filter, or create a new one."
          />
        }
      />
      <BulkActionBar
        selectedIds={ids}
        onClear={clear}
        run={(action, selectedIds) => bulk({ action, ids: selectedIds })}
        actions={lifecycleBulkActions(perms, prefix, plural)}
      />
    </>
  );
}

