import Link from "next/link";
import { TrendingUp } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/EmptyState";
import { StudentPageHeader } from "@/components/student/StudentPageHeader";
import { ProgressGuide, ProgressView } from "@/components/student/ProgressView";
import { requireUser } from "@/lib/auth/session";
import { enrollmentService } from "@/services/enrollmentService";

export const metadata = { title: "Progress" };

export default async function ProgressPage() {
  const user = await requireUser();
  const enrollments = await enrollmentService.getStudentCourses(user.uid);

  if (!enrollments.length) {
    return (
      <>
        <StudentPageHeader title="Progress" />
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
        <ProgressGuide />
      </>
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

  return (
    <>
      <StudentPageHeader
        title="Progress"
        description="How you're doing across all your courses."
      />
      <ProgressView items={items} />
    </>
  );
}
