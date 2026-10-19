// app/admin/contacts/[slug]/page.jsx
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Mail } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { ContactRecordActions } from "@/components/admin/contacts/ContactRecordActions";
import { ContactMessageView } from "@/components/admin/contacts/ContactMessageView";
import { subjectLabel } from "@/lib/admin/contactSubjects";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { adminSlug } from "@/lib/validations/common";
import { contactAdminRepository } from "@/repositories/admin/contactAdminRepository";
import { formatDateTime } from "@/lib/utils/format";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { requirePermission } from "@/lib/auth/authorize";
import { PERMISSIONS as P, permissionsFor } from "@/lib/constants/permissions";
import { cn } from "@/lib/utils";

export default async function AdminContactPage({ params }) {
  const user = await requirePermission(P.CONTACTS_READ);
  const parsed = adminSlug.safeParse((await params).slug);
  if (!parsed.success) notFound();
  const m = await contactAdminRepository.findBySlug(parsed.data);
  if (!m) notFound();

  const reply = `mailto:${m.email}?subject=${encodeURIComponent(`Re: ${subjectLabel(m.subject)}`)}`;

  return (
    <>
      <Link
        href="/admin/contacts"
        className="mb-4 inline-flex items-center gap-1.5 rounded-md text-sm font-medium text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      >
        <ArrowLeft className="size-4" aria-hidden="true" />
        All messages
      </Link>

      <AdminPageHeader
        title={subjectLabel(m.subject)}
        description={`From ${m.name} · ${m.email}`}
        actions={
          <>
            <StatusBadge status={m.status} />
            <a
              href={reply}
              className={cn(buttonVariants({ size: "sm" }), "gap-2")}
            >
              <Mail className="size-4" aria-hidden="true" />
              Reply by email
            </a>
            <ContactRecordActions
              record={m}
              perms={permissionsFor(user.role)}
            />
          </>
        }
      />

      <ContactMessageView
        name={m.name}
        email={m.email}
        message={m.message}
        slug={m.slug}
        receivedAt={formatDateTime(m.createdAt)}
      />
    </>
  );
}
