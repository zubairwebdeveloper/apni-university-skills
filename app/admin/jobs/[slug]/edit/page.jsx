// app/admin/jobs/[slug]/edit/page.jsx
import Link from "next/link";
import { notFound } from "next/navigation";
import { FiArrowLeft } from "react-icons/fi";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { buttonVariants } from "@/components/ui/button";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { JobForm } from "@/components/admin/jobs/JobForm";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { requirePermission } from "@/lib/auth/authorize";
import { PERMISSIONS as P } from "@/lib/constants/permissions";
import { adminSlug } from "@/lib/validations/common";
import { jobGuard } from "@/lib/admin/guards";
import { jobAdminRepository } from "@/repositories/admin/jobAdminRepository";

export const metadata = { title: "Edit job" };

function BackLink() {
  return (
    <Link
      href="/admin/jobs"
      className="mb-4 inline-flex min-h-9 items-center gap-1.5 rounded-md text-sm text-muted-foreground outline-none transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none"
    >
      <FiArrowLeft aria-hidden="true" className="size-4" />
      Back to jobs
    </Link>
  );
}

export default async function EditJobPage({ params }) {
  await requirePermission(P.JOBS_UPDATE);
  const parsed = adminSlug.safeParse((await params).slug);
  if (!parsed.success) notFound();
  const record = await jobAdminRepository.findBySlug(parsed.data);
  if (!record) notFound();
  if (record.status === "deleted")
    return (
      <>
        <BackLink />
        <Alert variant="destructive">
          <AlertTitle>In trash</AlertTitle>
          <AlertDescription>
            <p>
              Restore this job from the Jobs list (Trash filter) to edit it.
            </p>
            <Link
              href="/admin/jobs"
              className={buttonVariants({
                variant: "outline",
                size: "sm",
                className: "mt-3",
              })}
            >
              Go to jobs
            </Link>
          </AlertDescription>
        </Alert>
      </>
    );
  const blocker =
    record.status !== "published" ? await jobGuard("publish", record) : null;
  // This server-rendered page needs the current time for its expiry check.
  // eslint-disable-next-line react-hooks/purity
  const expired = record.expiresAt && record.expiresAt < Date.now();
  return (
    <>
      <BackLink />
      <AdminPageHeader
        title={`Edit ${record.title}`}
        description={record.slug ? `Slug: ${record.slug}` : undefined}
        actions={<StatusBadge status={record.status} />}
      />
      {expired && (
        <Alert className="mb-6">
          <AlertTitle>Expired</AlertTitle>
          <AlertDescription>
            The expiry date has passed. Clear or extend it, save, then publish
            again.
          </AlertDescription>
        </Alert>
      )}
      {!expired && blocker && (
        <Alert className="mb-6">
          <AlertTitle>Not ready to publish</AlertTitle>
          <AlertDescription>{blocker}</AlertDescription>
        </Alert>
      )}
      <JobForm key={record.updatedAt} record={record} />
    </>
  );
}
