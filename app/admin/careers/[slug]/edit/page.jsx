// app/admin/careers/[slug]/edit/page.jsx
import Link from "next/link";
import { notFound } from "next/navigation";
import { FiArrowLeft } from "react-icons/fi";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { buttonVariants } from "@/components/ui/button";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { CareerForm } from "@/components/admin/careers/CareerForm";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { requirePermission } from "@/lib/auth/authorize";
import { PERMISSIONS as P } from "@/lib/constants/permissions";
import { adminSlug } from "@/lib/validations/common";
import { careerGuard } from "@/lib/admin/guards";
import { careerAdminRepository } from "@/repositories/admin/careerAdminRepository";
import { categoryAdminRepository } from "@/repositories/admin/categoryAdminRepository";

export const metadata = { title: "Edit career guide" };

function BackLink() {
  return (
    <Link
      href="/admin/careers"
      className="mb-4 inline-flex min-h-9 items-center gap-1.5 rounded-md text-sm text-muted-foreground outline-none transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none"
    >
      <FiArrowLeft aria-hidden="true" className="size-4" />
      Back to career guides
    </Link>
  );
}

export default async function EditCareerPage({ params }) {
  await requirePermission(P.CAREERS_UPDATE);
  const parsed = adminSlug.safeParse((await params).slug);
  if (!parsed.success) notFound();
  const record = await careerAdminRepository.findBySlug(parsed.data);
  if (!record) notFound();
  if (record.status === "deleted")
    return (
      <>
        <BackLink />
        <Alert variant="destructive">
          <AlertTitle>In trash</AlertTitle>
          <AlertDescription>
            <p>
              Restore this guide from the Careers list (Trash filter) to edit
              it.
            </p>
            <Link
              href="/admin/careers"
              className={buttonVariants({
                variant: "outline",
                size: "sm",
                className: "mt-3",
              })}
            >
              Go to career guides
            </Link>
          </AlertDescription>
        </Alert>
      </>
    );
  const [categories, blocker] = await Promise.all([
    categoryAdminRepository.options(),
    record.status !== "published" ? careerGuard("publish", record) : null,
  ]);
  return (
    <>
      <BackLink />
      <AdminPageHeader
        title={`Edit ${record.title}`}
        description={record.slug ? `Slug: ${record.slug}` : undefined}
        actions={<StatusBadge status={record.status} />}
      />
      {blocker && (
        <Alert className="mb-6">
          <AlertTitle>Not ready to publish</AlertTitle>
          <AlertDescription>{blocker}</AlertDescription>
        </Alert>
      )}
      <CareerForm
        key={record.updatedAt}
        record={record}
        categories={categories}
      />
    </>
  );
}
