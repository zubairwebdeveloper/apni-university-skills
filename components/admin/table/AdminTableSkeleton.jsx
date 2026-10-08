// components/admin/table/AdminTableSkeleton.jsx: for each resource's loading.jsx
import { Skeleton } from "@/components/ui/skeleton";
export function AdminTableSkeleton({ rows = 8 }) {
  return (
    <div className="space-y-4" aria-busy="true">
      <div className="flex items-end justify-between">
        <Skeleton className="h-9 w-56" />
        <Skeleton className="h-9 w-32" />
      </div>
      <Skeleton className="h-10 w-full" />
      <div className="space-y-2 rounded-xl border bg-card p-4">
        {Array.from({ length: rows }, (_, i) => (
          <Skeleton key={i} className="h-10 w-full" />
        ))}
      </div>
    </div>
  );
}

