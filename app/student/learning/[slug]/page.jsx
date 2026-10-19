// app/student/learning/[slug]/page.jsx
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { FiFilm } from "react-icons/fi";
import { ArrowLeft } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/EmptyState";
import { LessonPlayer } from "@/components/student/LessonPlayer";
import { LearningBackdrop } from "@/components/student/LearningBackdrop";
import { LearningHeader } from "@/components/student/LearningHeader";
import { requireUser } from "@/lib/auth/session";
import { learningService } from "@/services/learningService";
import { cn } from "@/lib/utils";

export const metadata = { title: "Learning" };

const enter =
  "animate-in fade-in slide-in-from-bottom-2 fill-mode-both duration-500 motion-reduce:animate-none";

function Shell({ children }) {
  return (
    <div className="relative isolate">
      <LearningBackdrop />
      <div className="mx-auto w-full max-w-7xl px-4 py-5 sm:px-6 sm:py-6 lg:px-8">
        {children}
      </div>
    </div>
  );
}

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
      <Shell>
        <div className={cn("space-y-5", enter)}>
          <Link
            href={`/student/courses/${slug}`}
            className={cn(
              buttonVariants({ variant: "ghost", size: "sm" }),
              "group -ml-2 gap-1.5 text-muted-foreground",
            )}
          >
            <ArrowLeft
              aria-hidden="true"
              className="size-4 transition-transform group-hover:-translate-x-0.5 motion-reduce:transition-none motion-reduce:group-hover:translate-x-0"
            />
            Back to course
          </Link>
          <EmptyState
            icon={FiFilm}
            title="Lessons are being added"
            description="This course doesn't have published lessons yet. Check back soon."
          />
        </div>
      </Shell>
    );

  return (
    <Shell>
      <LearningHeader
        slug={slug}
        title={data.course.title}
        percent={data.percent}
        completedCount={data.completedIds?.length ?? 0}
      />
      <LessonPlayer
        course={{ slug, title: data.course.title }}
        sections={data.sections}
        lesson={data.lesson}
        prev={data.prev}
        next={data.next}
        completed={data.completedIds}
        percent={data.percent}
      />
    </Shell>
  );
}
