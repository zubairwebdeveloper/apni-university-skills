import { AdminShell } from "@/components/admin/AdminShell";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { requirePermission } from "@/lib/auth/authorize";
import { getSessionUser } from "@/lib/auth/session";
import { PERMISSIONS, permissionsFor } from "@/lib/constants/permissions";
import { userService } from "@/services/userService";
import { notFound } from "next/navigation";
import { PERMISSIONS as P } from "@/lib/constants/permissions";
import { Toaster } from "@/components/ui/sonner";
export const metadata = {
  title: {
    default: "Admin",
    template: "%s | Admin | Apni University",
  },
  robots: {
    index: false,
    follow: false,
  },
};

export default async function AdminLayout({ children }) {
   if (process.env.ADMIN_ENABLED !== "true") notFound();
   await requirePermission(P.ADMIN_ACCESS);
  // Temporary admin authentication debug
  const dbg = await getSessionUser();

  console.log(
    "[admin-debug]",
    dbg && {
      role: dbg.role,
      verified: dbg.emailVerified,
    },
  );

  const user = await requirePermission(PERMISSIONS.ADMIN_ACCESS);
  const profile = await userService.getProfile(user.uid);

  const person = {
    name: profile?.displayName || user.email || "Admin",
    email: user.email || "",
    photoURL: profile?.photoURL ?? null,
  };

  const permissions = permissionsFor(user.role);

  return (
    <AdminShell
      permissions={permissions}
      header={
        <AdminHeader
          person={person}
          role={user.role}
          permissions={permissions}
        />
      }
    >
      {children}
      <Toaster richColors position="top-right" />
    </AdminShell>
  );
}
