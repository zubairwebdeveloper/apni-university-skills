// app/admin/certificates/[slug]/page.jsx
import Link from "next/link";
import { notFound } from "next/navigation";
import { Card } from "@/components/ui/card";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { CertificateControls } from "@/components/admin/certificates/CertificateControls";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { requirePermission } from "@/lib/auth/authorize";
import { can, PERMISSIONS as P } from "@/lib/constants/permissions";
import { adminSlug } from "@/lib/validations/common";
import { certificateAdminRepository } from "@/repositories/admin/certificateAdminRepository";
import { formatDateTime } from "@/lib/utils/format";

export const metadata = { title: "Certificate" };

export default async function AdminCertificatePage({ params }) {
  const user = await requirePermission(P.CERTIFICATES_READ);
  const parsed = adminSlug.safeParse((await params).slug);
  if (!parsed.success) notFound();
  const c = await certificateAdminRepository.findBySlug(parsed.data);
  if (!c) notFound();
  const status = c.status ?? "valid";
  const verify = `${process.env.NEXT_PUBLIC_SITE_URL}/verify/${c.verificationCode}`;
  return (
    <>
      <AdminPageHeader
        title={c.courseTitle}
        description={`Certificate ${c.certificateNumber}`}
        actions={<StatusBadge status={status} />}
      />
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <Card className="gap-4 p-5">
          <dl className="grid gap-x-6 gap-y-3 text-sm sm:grid-cols-2">
            {[
              ["Awarded to", c.studentName],
              ["Course", c.courseTitle],
              ["Issued", formatDateTime(c.issuedAt)],
              ["Number", c.certificateNumber],
            ].map(([k, v]) => (
              <div key={k}>
                <dt className="text-xs text-muted-foreground">{k}</dt>
                <dd className="font-medium">{v}</dd>
              </div>
            ))}
            <div className="sm:col-span-2">
              <dt className="text-xs text-muted-foreground">
                Public verification link
              </dt>
              <dd className="break-all">
                <Link
                  href={`/verify/${c.verificationCode}`}
                  target="_blank"
                  rel="noopener"
                  className="text-primary hover:underline"
                >
                  {verify}
                </Link>
              </dd>
            </div>
            {c.revokeReason && (
              <div className="sm:col-span-2">
                <dt className="text-xs text-muted-foreground">
                  Revocation reason
                </dt>
                <dd>{c.revokeReason}</dd>
              </div>
            )}
          </dl>
        </Card>
        <aside className="space-y-6">
          {can(user.role, P.CERTIFICATES_REVOKE) && (
            <CertificateControls slug={c.slug} status={status} />
          )}
          {can(user.role, P.STUDENTS_READ) && (
            <Link
              href={`/admin/students?q=${encodeURIComponent(c.studentName)}`}
              className="text-sm text-primary hover:underline"
            >
              Find this student
            </Link>
          )}
        </aside>
      </div>
    </>
  );
}
