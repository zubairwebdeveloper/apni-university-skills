// app/admin/careers/[slug]/edit/page.jsx
import { notFound } from "next/navigation";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
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

export default async function EditCareerPage({ params }) {
  await requirePermission(P.CAREERS_UPDATE);
  const parsed = adminSlug.safeParse((await params).slug);
  if (!parsed.success) notFound();
  const record = await careerAdminRepository.findBySlug(parsed.data);
  if (!record) notFound();
  if (record.status === "deleted")
    return (
      <Alert variant="destructive">
        <AlertTitle>In trash</AlertTitle>
        <AlertDescription>
          Restore this guide from the Careers list (Trash filter) to edit it.
        </AlertDescription>
      </Alert>
    );
  const [categories, blocker] = await Promise.all([
    categoryAdminRepository.options(),
    record.status !== "published" ? careerGuard("publish", record) : null,
  ]);
  return (
    <>
      <AdminPageHeader
        title={`Edit ${record.title}`}
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
