// app/admin/courses/create/page.jsx
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { CourseForm } from "@/components/admin/courses/CourseForm";
import { requirePermission } from "@/lib/auth/authorize";
import { PERMISSIONS as P } from "@/lib/constants/permissions";
import { categoryAdminRepository } from "@/repositories/admin/categoryAdminRepository";
import { instructorAdminRepository } from "@/repositories/admin/instructorAdminRepository";

export const metadata = { title: "New course" };

export default async function CreateCoursePage() {
  await requirePermission(P.COURSES_CREATE);
  const [categories, instructors] = await Promise.all([
    categoryAdminRepository.options(),
    instructorAdminRepository.options(),
  ]);
  return (
    <>
      <AdminPageHeader
        title="New course"
        description="Saved as a draft. Publish it from the course page when it's ready."
      />
      <CourseForm categories={categories} instructors={instructors} />
    </>
  );
}

