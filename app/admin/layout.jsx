import { notFound } from "next/navigation";
import { AdminShell } from "@/components/admin/AdminShell";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { requirePermission } from "@/lib/auth/authorize";
import { PERMISSIONS, permissionsFor } from "@/lib/constants/permissions";
import { userService } from "@/services/userService";
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

  // One check is enough: it also returns the signed-in user
  const user = await requirePermission(PERMISSIONS.ADMIN_ACCESS);
  const profile = await userService.getProfile(user.uid);

  const person = {
    name: profile?.displayName || user.email || "Admin",
    email: user.email || "",
    photoURL: profile?.photoURL ?? null,
  };

  const permissions = permissionsFor(user.role);

  return (
    <>
      <div className="max-w-7xl mx-auto">
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
        </AdminShell>

        {/* Outside the shell so scroll containers never clip it */}
        <Toaster richColors closeButton position="top-right" />
      </div>
    </>
  );
}
