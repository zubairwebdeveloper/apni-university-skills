// app/admin/courses/[slug]/edit/page.jsx
import { notFound, redirect } from "next/navigation";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { CourseForm } from "@/components/admin/courses/CourseForm";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { requirePermission } from "@/lib/auth/authorize";
import { PERMISSIONS as P } from "@/lib/constants/permissions";
import { adminSlug } from "@/lib/validations/common";
import { courseAdminRepository } from "@/repositories/admin/courseAdminRepository";
import { categoryAdminRepository } from "@/repositories/admin/categoryAdminRepository";
import { instructorAdminRepository } from "@/repositories/admin/instructorAdminRepository";

export const metadata = { title: "Edit course" };

export default async function EditCoursePage({ params }) {
  await requirePermission(P.COURSES_UPDATE);
  const parsed = adminSlug.safeParse((await params).slug);
  if (!parsed.success) notFound();
  const record = await courseAdminRepository.findBySlug(parsed.data);
  if (!record) notFound();
  if (record.status === "deleted") redirect(`/admin/courses/${record.slug}`);
  const [categories, instructors] = await Promise.all([
    categoryAdminRepository.options(),
    instructorAdminRepository.options(),
  ]);
  return (
    <>
      <AdminPageHeader
        title={`Edit ${record.title}`}
        actions={<StatusBadge status={record.status} />}
      />
      <CourseForm
        key={record.updatedAt}
        record={record}
        categories={categories}
        instructors={instructors}
      />
    </>
  );
}


