// app/student/progress/page.jsx
import Link from "next/link";
import { TrendingUp, ArrowRight } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/EmptyState";
import { StudentPageHeader } from "@/components/student/StudentPageHeader";
import { ProgressGuide, ProgressView } from "@/components/student/ProgressView";
import {
  ContinueLearning,
  MotionRoot,
  ProgressBackdrop,
  Reveal,
} from "@/components/student/ProgressMotion";
import { requireUser } from "@/lib/auth/session";
import { enrollmentService } from "@/services/enrollmentService";
import { cn } from "@/lib/utils";

export const metadata = { title: "Progress" };

export default async function ProgressPage() {
  const user = await requireUser();
  const enrollments = await enrollmentService.getStudentCourses(user.uid);

  if (!enrollments.length) {
    return (
      <MotionRoot>
        <div className="relative isolate">
          <ProgressBackdrop />
          <StudentPageHeader
            title="Progress"
            description="Your progress across all courses will be tracked here."
          />
          <Reveal>
            <EmptyState
              icon={TrendingUp}
              title="No progress to show yet"
              description="Enroll in a course and your progress will be tracked here."
              action={
                <Link
                  href="/courses"
                  className={cn(
                    buttonVariants(),
                    "group gap-2 shadow-[0_3px_0_0_color-mix(in_oklab,var(--primary)_55%,black)] transition-[transform,box-shadow] duration-100",
                    "active:translate-y-[3px] active:shadow-none motion-reduce:transition-none motion-reduce:active:translate-y-0",
                  )}
                >
                  Browse courses
                  <ArrowRight
                    aria-hidden="true"
                    className="size-4 transition-transform group-hover:translate-x-0.5 motion-reduce:transition-none motion-reduce:group-hover:translate-x-0"
                  />
                </Link>
              }
            />
          </Reveal>
          <Reveal delay={0.1}>
            <ProgressGuide />
          </Reveal>
        </div>
      </MotionRoot>
    );
  }

  // Only plain, serializable fields go to the client component
  const items = enrollments.map((i) => ({
    id: i.id,
    courseTitle: i.courseTitle,
    courseSlug: i.courseSlug,
    progress: i.progress ?? 0,
    status: i.status,
  }));

  // Summary values come straight from the real enrollment data
  const total = items.length;
  const completed = items.filter((i) => i.progress >= 100).length;
  const average = items.reduce((sum, i) => sum + i.progress, 0) / total;
  const next =
    items
      .filter((i) => i.progress < 100)
      .sort((a, b) => b.progress - a.progress)[0] ?? null;

  return (
    <MotionRoot>
      <div className="relative isolate space-y-8">
        <ProgressBackdrop />

        <StudentPageHeader
          title="Progress"
          description={`${completed} of ${total} ${
            total === 1 ? "course" : "courses"
          } completed. Here is how you're doing across all your courses.`}
        />

        <ContinueLearning
          next={next}
          total={total}
          completed={completed}
          average={average}
        />

        <section
          id="all-progress"
          aria-label="Progress by course"
          className="scroll-mt-24"
        >
          <Reveal>
            <ProgressView items={items} />
          </Reveal>
        </section>
      </div>
    </MotionRoot>
  );
}
