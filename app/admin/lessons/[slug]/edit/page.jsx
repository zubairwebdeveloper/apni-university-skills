// app/admin/lessons/[slug]/edit/page.jsx
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { FiArrowLeft } from "react-icons/fi";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { LessonForm } from "@/components/admin/lessons/LessonForm";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { requirePermission } from "@/lib/auth/authorize";
import { PERMISSIONS as P } from "@/lib/constants/permissions";
import { adminSlug } from "@/lib/validations/common";
import { courseAdminRepository } from "@/repositories/admin/courseAdminRepository";
import { lessonAdminRepository } from "@/repositories/admin/lessonAdminRepository";

export const metadata = { title: "Edit lesson" };

export default async function EditLessonPage({ params, searchParams }) {
  await requirePermission(P.LESSONS_UPDATE);
  const slug = adminSlug.safeParse((await params).slug);
  const cs = adminSlug.safeParse((await searchParams).course);
  if (!slug.success || !cs.success) notFound();
  const course = await courseAdminRepository.findBySlug(cs.data);
  if (!course) notFound();
  const record = await lessonAdminRepository.findBySlug(course.id, slug.data);
  if (!record) notFound();
  if (record.status === "deleted")
    redirect(`/admin/lessons?course=${course.slug}`);
  const all = await lessonAdminRepository.listByCourse(course.id);
  const titles = [
    ...new Set(
      all
        .filter((l) => l.status !== "deleted")
        .map((l) => l.sectionTitle)
        .filter(Boolean),
    ),
  ];
  return (
    <>
      {/* Back to this course's lessons, not the generic list */}
      <Link
        href={`/admin/lessons?course=${encodeURIComponent(course.slug)}`}
        className="mb-4 inline-flex min-h-9 items-center gap-1.5 rounded-md text-sm text-muted-foreground outline-none transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none"
      >
        <FiArrowLeft aria-hidden="true" className="size-4" />
        Back to lessons
      </Link>
      <AdminPageHeader
        title={`Edit ${record.title}`}
        description={course.title}
        actions={<StatusBadge status={record.status} />}
      />
      <LessonForm
        key={record.updatedAt}
        course={{ slug: course.slug }}
        record={record}
        sectionTitles={titles}
      />
    </>
  );
}
