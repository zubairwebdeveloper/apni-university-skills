// app/admin/lessons/create/page.jsx
import { notFound, redirect } from "next/navigation";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { LessonForm } from "@/components/admin/lessons/LessonForm";
import { requirePermission } from "@/lib/auth/authorize";
import { PERMISSIONS as P } from "@/lib/constants/permissions";
import { adminSlug } from "@/lib/validations/common";
import { courseAdminRepository } from "@/repositories/admin/courseAdminRepository";
import { lessonAdminRepository } from "@/repositories/admin/lessonAdminRepository";

export const metadata = { title: "New lesson" };

export default async function CreateLessonPage({ searchParams }) {
  await requirePermission(P.LESSONS_CREATE);
  const sp = await searchParams;
  const parsed = adminSlug.safeParse(sp.course);
  if (!parsed.success) redirect("/admin/lessons");
  const course = await courseAdminRepository.findBySlug(parsed.data);
  if (!course || course.status === "deleted") notFound();
  const lessons = await lessonAdminRepository.listByCourse(course.id);
  const titles = [
    ...new Set(
      lessons
        .filter((l) => l.status !== "deleted")
        .map((l) => l.sectionTitle)
        .filter(Boolean),
    ),
  ];
  const section = typeof sp.section === "string" ? sp.section.slice(0, 80) : "";
  return (
    <>
      <AdminPageHeader
        title="New lesson"
        description={`In ${course.title}. Saved as a draft.`}
      />
      <LessonForm
        course={{ slug: course.slug }}
        sectionTitles={titles}
        defaultSection={section}
      />
    </>
  );
}

