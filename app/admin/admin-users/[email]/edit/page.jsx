// app/admin/admin-users/[email]/edit/page.jsx
import Link from "next/link";
import { ChevronRight } from "lucide-react";

import { EditAdminLoader } from "@/components/admin/admin-users/EditAdminLoader";
import { requirePermission } from "@/lib/auth/authorize";
import { PERMISSIONS as P } from "@/lib/constants/permissions";

export const metadata = { title: "Edit admin" };

export default async function EditAdminPage({ params }) {
  await requirePermission(P.USERS_ROLES);
  const { email } = await params;
  const clean = decodeURIComponent(email).toLowerCase();

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
          <span className="font-medium text-foreground">Edit</span>
        </nav>
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            Edit admin
          </h1>
          <p className="text-sm leading-6 text-muted-foreground sm:text-base">
            Update the name, photo or role for{" "}
            <span className="font-medium text-foreground">{clean}</span>.
          </p>
        </div>
      </div>

      <EditAdminLoader email={clean} />
    </div>
  );
}
