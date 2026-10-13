import Link from "next/link";
import { TrendingUp } from "lucide-react";
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

export const metadata = { title: "Progress" };

export default async function ProgressPage() {
  const user = await requireUser();
  const enrollments = await enrollmentService.getStudentCourses(user.uid);

  if (!enrollments.length) {
    return (
      <MotionRoot>
        <div className="relative isolate">
          <ProgressBackdrop />
          <StudentPageHeader title="Progress" />
          <Reveal>
            <EmptyState
              icon={TrendingUp}
              title="No progress to show yet"
              description="Enroll in a course and your progress will be tracked here."
              action={
                <Link href="/courses" className={buttonVariants()}>
                  Browse courses
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
          description="How you're doing across all your courses."
        />

        <ContinueLearning
          next={next}
          total={total}
          completed={completed}
          average={average}
        />

        <div id="all-progress" className="scroll-mt-24">
          <Reveal>
            <ProgressView items={items} />
          </Reveal>
        </div>
      </div>
    </MotionRoot>
  );
}
