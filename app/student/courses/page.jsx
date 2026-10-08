import Link from "next/link";
import { BookOpen } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/EmptyState";
import { StudentPageHeader } from "@/components/student/StudentPageHeader";
import {
  ExploreSection,
  MyCoursesView,
} from "@/components/student/MyCoursesView";
import { requireUser } from "@/lib/auth/session";
import { enrollmentService } from "@/services/enrollmentService";

export const metadata = { title: "My courses" };

export default async function MyCoursesPage() {
  const user = await requireUser();
  const items = await enrollmentService.getStudentCourses(user.uid);

  if (!items.length) {
    return (
      <>
        <StudentPageHeader title="My courses" />
        <EmptyState
          icon={BookOpen}
          title="No courses yet"
          description="Courses you enroll in will appear here. Start with one of our popular tech learning paths below."
          action={
            <Link href="/courses" className={buttonVariants()}>
              Browse courses
            </Link>
          }
        />
        <ExploreSection />
      </>
    );
  }

  return (
    <>
      <StudentPageHeader
        title="My courses"
        description={`${items.length} enrolled · keep learning, keep growing`}
      />
      <MyCoursesView items={items} />
    </>
  );
}
