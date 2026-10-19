// components/admin/categories/CategoriesTable.jsx
"use client";
import Link from "next/link";
import { FiEdit2, FiFolder, FiStar } from "react-icons/fi";
import { EmptyState } from "@/components/shared/EmptyState";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { DataTable } from "@/components/admin/table/DataTable";
import { BulkActionBar } from "@/components/admin/table/BulkActionBar";
import { RowActions } from "@/components/admin/table/RowActions";
import {
  lifecycleBulkActions,
  lifecycleItems,
} from "@/components/admin/table/lifecycle";
import { useSelection } from "@/hooks/useSelection";
import { formatDate } from "@/lib/utils/format";
import {
  bulkCategoryAction,
  runCategoryAction,
} from "@/app/actions/admin/categories";

const FOCUS =
  "outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background";

// Muted placeholder for empty cells, with a label for screen readers.
const Empty = ({ label }) => (
  <span className="text-muted-foreground" aria-label={label}>
    —
  </span>
);

export function CategoriesTable({ rows, perms }) {
  const { selected, setSelected, clear, ids } = useSelection(rows);
  const columns = [
    {
      key: "name",
      header: "Name",
      cell: (r) => (
        <div className="min-w-0">
          <Link
            href={`/admin/categories/${r.slug}/edit`}
            className={`rounded-sm font-medium text-foreground underline-offset-4 hover:text-primary hover:underline ${FOCUS}`}
          >
            {r.name}
          </Link>
          <p
            className="mt-0.5 max-w-xs truncate font-mono text-xs text-muted-foreground"
            title={r.slug}
          >
            {r.slug}
          </p>
        </div>
      ),
    },
    {
      key: "courses",
      header: "Courses",
      className: "tabular-nums",
      cell: (r) => {
        const count = r.coursesCount ?? 0;
        // A zero is dimmed so categories that still need courses stand out.
        return (
          <span className={count === 0 ? "text-muted-foreground" : undefined}>
            {count}
          </span>
        );
      },
    },
    {
      key: "order",
      header: "Order",
      className: "tabular-nums",
      cell: (r) => r.order ?? <Empty label="No order set" />,
    },
    {
      key: "status",
      header: "Status",
      cell: (r) => <StatusBadge status={r.status} />,
    },
    {
      key: "featured",
      header: "Featured",
      cell: (r) =>
        r.featured ? (
          <>
            <FiStar
              className="size-4 fill-current text-highlight"
              aria-hidden="true"
            />
            <span className="sr-only">Featured</span>
          </>
        ) : (
          <Empty label="Not featured" />
        ),
    },
    {
      key: "updated",
      header: "Updated",
      className: "whitespace-nowrap tabular-nums text-muted-foreground",
      cell: (r) => formatDate(r.updatedAt) || <Empty label="Not updated" />,
    },
    {
      key: "actions",
      header: "Actions",
      srOnlyHeader: true,
      className: "w-12",
      cell: (r) => (
        <RowActions
          label={r.name}
          items={[
            {
              key: "edit",
              label: "Edit",
              icon: FiEdit2,
              href: `/admin/categories/${r.slug}/edit`,
              hidden:
                !perms.includes("categories.update") || r.status === "deleted",
            },
            ...lifecycleItems({
              row: r,
              perms,
              prefix: "categories",
              noun: "Category",
              run: runCategoryAction,
            }),
          ]}
        />
      ),
    },
  ];
  return (
    <>
      <DataTable
        columns={columns}
        rows={rows}
        caption="Categories"
        selectable
        selected={selected}
        onSelectedChange={setSelected}
        empty={
          <EmptyState
            icon={FiFolder}
            title="No categories match"
            description="Try a different search or filter, or create a category."
          />
        }
      />
      <BulkActionBar
        selectedIds={ids}
        onClear={clear}
        run={(action, selectedIds) =>
          bulkCategoryAction({ action, ids: selectedIds })
        }
        actions={lifecycleBulkActions(perms, "categories", "categories")}
      />
    </>
  );
}
