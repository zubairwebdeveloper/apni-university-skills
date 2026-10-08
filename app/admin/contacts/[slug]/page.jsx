// app/admin/contacts/[slug]/page.jsx
import { notFound } from "next/navigation";
import { buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ContactRecordActions } from "@/components/admin/contacts/ContactRecordActions";
import { subjectLabel } from "@/components/admin/contacts/ContactsTable";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { adminSlug } from "@/lib/validations/common";
import { contactAdminRepository } from "@/repositories/admin/contactAdminRepository";
import { formatDateTime } from "@/lib/utils/format";
// ...plus AdminPageHeader, requirePermission, PERMISSIONS, permissionsFor
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { requirePermission } from "@/lib/auth/authorize";
import { PERMISSIONS as P, permissionsFor } from "@/lib/constants/permissions";
export default async function AdminContactPage({ params }) {
  const user = await requirePermission(P.CONTACTS_READ);
  const parsed = adminSlug.safeParse((await params).slug);
  if (!parsed.success) notFound();
  const m = await contactAdminRepository.findBySlug(parsed.data);
  if (!m) notFound();
  const reply = `mailto:${m.email}?subject=${encodeURIComponent(`Re: ${subjectLabel(m.subject)}`)}`;
  return (
    <>
      <AdminPageHeader
        title={subjectLabel(m.subject)}
        description={`From ${m.name} · ${m.email}`}
        actions={
          <>
            <StatusBadge status={m.status} />
            <a href={reply} className={buttonVariants({ size: "sm" })}>
              Reply by email
            </a>
            <ContactRecordActions
              record={m}
              perms={permissionsFor(user.role)}
            />
          </>
        }
      />
      <Card className="max-w-3xl gap-4 p-6">
        <p className="whitespace-pre-line text-sm leading-relaxed">
          {m.message}
        </p>
        <p className="text-xs text-muted-foreground">
          Received {formatDateTime(m.createdAt)}. Reference{" "}
          <span className="font-mono">{m.slug}</span>. After replying from your
          mail app, mark it as replied from the actions menu.
        </p>
      </Card>
    </>
  );
}
