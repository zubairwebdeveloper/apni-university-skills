// app/student/courses/[slug]/page.jsx: enrolled course home; also the Stripe success_url
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CourseProgress } from "@/components/student/CourseProgress";
import { LessonList } from "@/components/student/LessonList";
import { PaymentConfirming } from "@/components/student/PaymentConfirming";
import { Paragraphs } from "@/components/shared/Paragraphs";
import { requireUser } from "@/lib/auth/session";
import { learningService } from "@/services/learningService";

export const metadata = { title: "Course" };

export default async function EnrolledCoursePage({ params, searchParams }) {
  const [{ slug }, { paid }] = await Promise.all([params, searchParams]);
  if (!/^[a-z0-9-]{1,120}$/.test(slug)) notFound();
  const user = await requireUser();

  const outline = await learningService.getOutline({ user, courseSlug: slug });
  if (!outline) {
    if (paid === "1") return <PaymentConfirming />; // webhook hasn't landed yet; poll until it does
    redirect(`/courses/${slug}`);
  }
  const { course, enrollment, sections, completedIds, percent } = outline;
  const done = enrollment.status === "completed";

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl">{course.title}</h1>
          {course.instructor && (
            <p className="mt-1 text-sm text-muted-foreground">
              by {course.instructor}
            </p>
          )}
        </div>
        <Card className="gap-4 p-5">
          <CourseProgress
            value={percent}
            label={done ? "Completed" : "Your progress"}
          />
          <div className="flex flex-wrap gap-2">
            <Link
              href={`/student/learning/${slug}`}
              className={buttonVariants()}
            >
              {done
                ? "Review lessons"
                : percent > 0
                  ? "Continue learning"
                  : "Start learning"}
            </Link>
            {done && (
              <Link
                href="/student/certificates"
                className={buttonVariants({ variant: "outline" })}
              >
                View certificate
              </Link>
            )}
            <Link
              href={`/courses/${slug}`}
              className={buttonVariants({ variant: "ghost" })}
            >
              Public course page
            </Link>
          </div>
        </Card>
        {course.shortDescription && (
          <section aria-labelledby="about-c">
            <h2 id="about-c" className="mb-3 text-xl">
              About this course
            </h2>
            <Paragraphs text={course.description || course.shortDescription} />
          </section>
        )}
      </div>
      <aside aria-labelledby="content-c">
        <h2 id="content-c" className="mb-3 text-lg">
          Course content
        </h2>
        <Card className="p-3">
          {sections.length ? (
            <LessonList
              courseSlug={slug}
              sections={sections}
              completed={completedIds}
            />
          ) : (
            <p className="p-2 text-sm text-muted-foreground">
              Lessons are being added.
            </p>
          )}
        </Card>
      </aside>
    </div>
  );
}
