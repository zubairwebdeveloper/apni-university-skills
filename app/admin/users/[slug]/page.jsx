// app/admin/users/[slug]/page.jsx
import Link from "next/link";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import {
  ActiveCard,
  InstructorLinkCard,
  RoleCard,
} from "@/components/admin/people/AccountControls";
import { requirePermission } from "@/lib/auth/authorize";
import {
  can,
  PERMISSIONS as P,
  permissionsFor,
} from "@/lib/constants/permissions";
import { ROLE_LABELS } from "@/lib/constants/roles";
import { adminSlug } from "@/lib/validations/common";
import { userAdminRepository } from "@/repositories/admin/userAdminRepository";
import { instructorAdminRepository } from "@/repositories/admin/instructorAdminRepository";
import { formatDateTime } from "@/lib/utils/format";

export const metadata = { title: "User" };

export default async function AdminUserPage({ params }) {
  const me = await requirePermission(P.USERS_READ);
  const parsed = adminSlug.safeParse((await params).slug);
  if (!parsed.success) notFound();
  const u = await userAdminRepository.findBySlug(parsed.data);
  if (!u) notFound();
  const isSelf = u.id === me.uid;
  const grouped = Object.entries(
    Object.groupBy(permissionsFor(u.role), (p) => p.split(".")[0]),
  );
  const instructors =
    u.role === "instructor" && can(me.role, P.USERS_ROLES)
      ? (await instructorAdminRepository.options()).filter(
          (i) => i.status !== "deleted",
        )
      : [];

  return (
    <>
      <AdminPageHeader
        title={u.displayName}
        description={u.email}
        actions={
          <>
            <Badge variant="outline">{ROLE_LABELS[u.role] ?? u.role}</Badge>
            {u.role === "student" && can(me.role, P.STUDENTS_READ) && (
              <Link
                href={`/admin/students/${u.slug}`}
                className={buttonVariants({ variant: "outline", size: "sm" })}
              >
                Student view
              </Link>
            )}
            {can(me.role, P.AUDIT_READ) && (
              <Link
                href={`/admin/audit?actor=${u.id}`}
                className={buttonVariants({ variant: "outline", size: "sm" })}
              >
                Their admin activity
              </Link>
            )}
          </>
        }
      />
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="space-y-6">
          {can(me.role, P.USERS_ROLES) && (
            <RoleCard slug={u.slug} role={u.role} isSelf={isSelf} />
          )}
          {can(me.role, P.USERS_UPDATE) && (
            <ActiveCard
              slug={u.slug}
              isActive={u.isActive !== false}
              isSelf={isSelf}
            />
          )}
          {u.role === "instructor" && can(me.role, P.USERS_ROLES) && (
            <InstructorLinkCard
              slug={u.slug}
              instructorId={u.instructorId ?? null}
              instructors={instructors}
            />
          )}
        </div>
        <aside className="space-y-6">
          <Card className="gap-1.5 p-5 text-xs text-muted-foreground">
            <p>
              Reference:{" "}
              <span className="font-mono text-foreground">{u.slug}</span>
            </p>
            <p>Email {u.emailVerified ? "verified" : "not verified"}</p>
            <p>Joined {formatDateTime(u.createdAt)}</p>
            <p>Last login {formatDateTime(u.lastLoginAt) || "—"}</p>
          </Card>
          <Card className="gap-3 p-5">
            <h2 className="text-lg">What {ROLE_LABELS[u.role]} can do</h2>
            {grouped.length ? (
              <dl className="space-y-2 text-xs">
                {grouped.map(([resource, perms]) => (
                  <div key={resource}>
                    <dt className="font-medium capitalize">{resource}</dt>
                    <dd className="text-muted-foreground">
                      {perms.map((p) => p.split(".")[1]).join(", ")}
                    </dd>
                  </div>
                ))}
              </dl>
            ) : (
              <p className="text-sm text-muted-foreground">
                No admin permissions. This role uses the student area only.
              </p>
            )}
            <p className="text-xs text-muted-foreground">
              Permissions come from the role and are checked on the server for
              every action.
            </p>
          </Card>
        </aside>
      </div>
    </>
  );
}
