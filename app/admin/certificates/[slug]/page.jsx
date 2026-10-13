// app/admin/certificates/[slug]/page.jsx
import Link from "next/link";
import { notFound } from "next/navigation";
import { FiArrowLeft, FiExternalLink, FiSearch } from "react-icons/fi";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card } from "@/components/ui/card";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { CertificateControls } from "@/components/admin/certificates/CertificateControls";
import { CopyLinkButton } from "@/components/admin/certificates/CopyLinkButton";
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
  // Falls back to a site-relative path if the env variable is missing
  // (the original printed "undefined/verify/..." in that case)
  const verifyPath = `/verify/${c.verificationCode}`;
  const verify = `${process.env.NEXT_PUBLIC_SITE_URL || ""}${verifyPath}`;
  return (
    <>
      <Link
        href="/admin/certificates"
        className="mb-4 inline-flex min-h-9 items-center gap-1.5 rounded-md text-sm text-muted-foreground outline-none transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none"
      >
        <FiArrowLeft aria-hidden="true" className="size-4" />
        Back to certificates
      </Link>
      <AdminPageHeader
        title={c.courseTitle}
        description={`Certificate ${c.certificateNumber}`}
        actions={<StatusBadge status={status} />}
      />

      {c.revokeReason && (
        <Alert variant="destructive" className="mb-6">
          <AlertTitle>This certificate has been revoked</AlertTitle>
          <AlertDescription>{c.revokeReason}</AlertDescription>
        </Alert>
      )}

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
            {c.verificationCode && (
              <div className="sm:col-span-2">
                <dt className="text-xs text-muted-foreground">
                  Verification code
                </dt>
                <dd className="break-all font-mono">{c.verificationCode}</dd>
              </div>
            )}
            <div className="sm:col-span-2">
              <dt className="text-xs text-muted-foreground">
                Public verification link
              </dt>
              <dd className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-2">
                <Link
                  href={verifyPath}
                  target="_blank"
                  rel="noopener"
                  className="inline-flex min-w-0 items-center gap-1.5 break-all text-primary hover:underline focus-visible:rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  {verify}
                  <FiExternalLink
                    aria-hidden="true"
                    className="size-3.5 shrink-0"
                  />
                  <span className="sr-only">(opens in a new tab)</span>
                </Link>
                <CopyLinkButton value={verify} />
              </dd>
            </div>
          </dl>
        </Card>
        <aside className="space-y-6">
          {can(user.role, P.CERTIFICATES_REVOKE) && (
            <CertificateControls slug={c.slug} status={status} />
          )}
          {can(user.role, P.STUDENTS_READ) && (
            <Link
              href={`/admin/students?q=${encodeURIComponent(c.studentName)}`}
              className="inline-flex min-h-9 items-center gap-1.5 rounded-md text-sm text-primary outline-none hover:underline focus-visible:ring-2 focus-visible:ring-ring"
            >
              <FiSearch aria-hidden="true" className="size-4" />
              Find this student
            </Link>
          )}
        </aside>
      </div>
    </>
  );
}
