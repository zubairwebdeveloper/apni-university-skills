// app/admin/instructors/[slug]/edit/page.jsx
import { notFound, redirect } from "next/navigation";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { InstructorForm } from "@/components/admin/instructors/InstructorForm";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { requirePermission } from "@/lib/auth/authorize";
import { PERMISSIONS as P } from "@/lib/constants/permissions";
import { adminSlug } from "@/lib/validations/common";
import { instructorAdminRepository } from "@/repositories/admin/instructorAdminRepository";

export const metadata = { title: "Edit instructor" };

export default async function EditInstructorPage({ params }) {
  await requirePermission(P.INSTRUCTORS_UPDATE);
  const parsed = adminSlug.safeParse((await params).slug);
  if (!parsed.success) notFound();
  const record = await instructorAdminRepository.findBySlug(parsed.data);
  if (!record) notFound();
  if (record.status === "deleted")
    redirect(`/admin/instructors/${record.slug}`);
  return (
    <>
      <AdminPageHeader
        title={`Edit ${record.name}`}
        actions={<StatusBadge status={record.status} />}
      />
      <InstructorForm key={record.updatedAt} record={record} />
    </>
  );
}
