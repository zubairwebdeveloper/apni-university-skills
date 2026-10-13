// app/student/courses/[slug]/page.jsx: enrolled course home; also the Stripe success_url
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { BookOpen, CheckCircle2, Layers, Trophy } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CourseProgress } from "@/components/student/CourseProgress";
import { LessonList } from "@/components/student/LessonList";
import { PaymentConfirming } from "@/components/student/PaymentConfirming";
import { Paragraphs } from "@/components/shared/Paragraphs";
import { requireUser } from "@/lib/auth/session";
import { learningService } from "@/services/learningService";
import { cn } from "@/lib/utils";

export const metadata = { title: "Course" };

const enter =
  "animate-in fade-in slide-in-from-bottom-2 fill-mode-both duration-500 motion-reduce:animate-none";
const delay = (i) => ({ animationDelay: `${i * 80}ms` });

// Key-press: neeche solid edge, click par dab jata hai
const keyPress =
  "transition-[transform,box-shadow] duration-100 active:translate-y-[3px] active:shadow-none motion-reduce:transition-none motion-reduce:active:translate-y-0";

function Stat({ icon: Icon, label, value, index }) {
  return (
    <div className="[perspective:700px]">
      <div
        className={cn(
          "flex items-center gap-3 rounded-xl border bg-card p-3 shadow-[0_3px_0_0_var(--border)]",
          "transition-transform duration-200 hover:[transform:rotateX(6deg)_rotateY(-6deg)_translateY(-2px)]",
          "motion-reduce:transition-none motion-reduce:hover:[transform:none]",
          enter,
        )}
        style={delay(index + 1)}
      >
        <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary shadow-[0_2px_0_0_color-mix(in_oklab,var(--primary)_25%,transparent)] ring-1 ring-inset ring-primary/20">
          <Icon aria-hidden="true" className="size-5" />
        </span>
        <div className="min-w-0">
          <p className="truncate text-lg font-semibold leading-none tabular-nums">
            {value}
          </p>
          <p className="mt-1 truncate text-xs text-muted-foreground">{label}</p>
        </div>
      </div>
    </div>
  );
}

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

  // Asli data se counts. Field alag ho to yahan badal den.
  const totalLessons = sections.reduce(
    (n, s) => n + (s.lessons?.length ?? 0),
    0,
  );
  const doneLessons = completedIds?.length ?? completedIds?.size ?? 0;
  const pct = Math.max(0, Math.min(100, Math.round(percent ?? 0)));

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
      <div className="space-y-6">
        {/* Hero */}
        <div className={cn("[perspective:1000px]", enter)}>
          <div className="group relative overflow-hidden rounded-2xl border bg-gradient-to-br from-primary/15 via-primary/5 to-transparent p-5 shadow-[0_4px_0_0_var(--border)] transition-transform duration-300 hover:[transform:rotateX(2deg)_rotateY(-2deg)] motion-reduce:transition-none motion-reduce:hover:[transform:none] sm:p-7">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -right-16 -top-16 size-56 rounded-full bg-primary/20 blur-3xl"
            />
            <div className="relative space-y-3">
              <Badge variant={done ? "default" : "secondary"} className="gap-1">
                {done ? (
                  <CheckCircle2 aria-hidden="true" className="size-3" />
                ) : (
                  <BookOpen aria-hidden="true" className="size-3" />
                )}
                {done ? "Completed" : "In progress"}
              </Badge>
              <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                {course.title}
              </h1>
              {course.instructor && (
                <p className="text-sm text-muted-foreground">
                  by {course.instructor}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Stat index={0} icon={Trophy} label="Progress" value={`${pct}%`} />
          <Stat
            index={1}
            icon={CheckCircle2}
            label="Lessons done"
            value={
              totalLessons ? `${doneLessons}/${totalLessons}` : doneLessons
            }
          />
          <Stat
            index={2}
            icon={Layers}
            label="Sections"
            value={sections.length}
          />
          <Stat
            index={3}
            icon={BookOpen}
            label="Status"
            value={done ? "Done" : "Active"}
          />
        </div>

        {/* Progress + actions */}
        <Card
          className={cn("gap-4 p-5 shadow-[0_3px_0_0_var(--border)]", enter)}
          style={delay(5)}
        >
          <CourseProgress
            value={percent}
            label={done ? "Completed" : "Your progress"}
          />
          <div className="flex flex-wrap gap-2">
            <Link
              href={`/student/learning/${slug}`}
              className={cn(
                buttonVariants(),
                "shadow-[0_3px_0_0_color-mix(in_oklab,var(--primary)_55%,black)]",
                keyPress,
              )}
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
                className={cn(
                  buttonVariants({ variant: "outline" }),
                  "shadow-[0_3px_0_0_var(--border)]",
                  keyPress,
                )}
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
          <section aria-labelledby="about-c" className={enter} style={delay(6)}>
            <h2 id="about-c" className="mb-3 text-xl">
              About this course
            </h2>
            <Paragraphs text={course.description || course.shortDescription} />
          </section>
        )}
      </div>

      <aside
        aria-labelledby="content-c"
        className={cn("lg:sticky lg:top-6 lg:self-start", enter)}
        style={delay(3)}
      >
        <h2 id="content-c" className="mb-3 text-lg">
          Course content
        </h2>
        <Card className="p-3 shadow-[0_3px_0_0_var(--border)]">
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
