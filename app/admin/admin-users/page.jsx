// app/admin/admin-users/page.jsx
import Link from "next/link";
import { Plus } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { AdminUsersTable } from "@/components/admin/admin-users/AdminUsersTable";
import { requirePermission } from "@/lib/auth/authorize";
import { PERMISSIONS as P } from "@/lib/constants/permissions";

export const metadata = { title: "Admin users" };

export default async function AdminUsersPage() {
  await requirePermission(P.ADMIN_ACCESS);

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between animate-in fade-in slide-in-from-bottom-2 duration-500">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">Admin users</h1>
          <p className="text-sm text-muted-foreground">
            Jin emails ko dashboard ka access hai.
          </p>
        </div>
        <Link href="/admin/admin-users/create" className={buttonVariants()}>
          <Plus className="mr-2 size-4" /> Add admin
        </Link>
      </div>

      <AdminUsersTable />
    </div>
  );
}
