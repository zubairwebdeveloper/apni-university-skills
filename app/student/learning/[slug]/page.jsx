// app/student/learning/[slug]/page.jsx
import { notFound, redirect } from "next/navigation";
import { FiFilm } from "react-icons/fi";
import { EmptyState } from "@/components/shared/EmptyState";
import { LessonPlayer } from "@/components/student/LessonPlayer";
import { requireUser } from "@/lib/auth/session";
import { learningService } from "@/services/learningService";

export const metadata = { title: "Learning" };

export default async function LearningPage({ params, searchParams }) {
  const [{ slug }, sp] = await Promise.all([params, searchParams]);
  if (!/^[a-z0-9-]{1,120}$/.test(slug)) notFound();
  const user = await requireUser();

  const data = await learningService.getLesson({
    user,
    courseSlug: slug,
    lessonSlug: typeof sp.lesson === "string" ? sp.lesson : undefined,
  });
  if (!data) redirect(`/courses/${slug}`); // not enrolled: send them to the public page where they can enroll or buy
  if (!data.lesson)
    return (
      <EmptyState
        icon={FiFilm}
        title="Lessons are being added"
        description="This course doesn't have published lessons yet. Check back soon."
      />
    );

  return (
    <LessonPlayer
      course={{ slug, title: data.course.title }}
      sections={data.sections}
      lesson={data.lesson}
      prev={data.prev}
      next={data.next}
      completed={data.completedIds}
      percent={data.percent}
    />
  );
}
