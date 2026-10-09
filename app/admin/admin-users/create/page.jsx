// app/admin/admin-users/create/page.jsx
import Link from "next/link";
import { ChevronRight } from "lucide-react";

import { AdminUserForm } from "@/components/admin/admin-users/AdminUserForm";
import { requirePermission } from "@/lib/auth/authorize";
import { PERMISSIONS as P } from "@/lib/constants/permissions";

export const metadata = { title: "Add admin" };

export default async function CreateAdminPage() {
  await requirePermission(P.USERS_ROLES);

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 sm:px-6 lg:px-8">
      <div className="animate-in fade-in slide-in-from-bottom-2 space-y-3 duration-500 motion-reduce:animate-none">
        <nav
          aria-label="Breadcrumb"
          className="flex items-center gap-1.5 text-sm text-muted-foreground"
        >
          <Link
            href="/admin/admin-users"
            className="transition-colors hover:text-foreground"
          >
            Admin users
          </Link>
          <ChevronRight aria-hidden="true" className="size-3.5" />
          <span className="font-medium text-foreground">Add admin</span>
        </nav>
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            Add a new admin
          </h1>
          <p className="max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">
            Give someone access to the dashboard. They will sign in with this
            email and see only what their role allows.
          </p>
        </div>
      </div>

      <AdminUserForm mode="create" />
    </div>
  );
}
