// app/student/courses/[slug]/page.jsx: enrolled course home; also the Stripe success_url
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import {
  BookOpen,
  CheckCircle2,
  Layers,
  Trophy,
  ArrowRight,
} from "lucide-react";
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

// Key-press: solid bottom edge that flattens on click
const keyPress =
  "transition-[transform,box-shadow] duration-100 active:translate-y-[3px] active:shadow-none motion-reduce:transition-none motion-reduce:active:translate-y-0";

// Full class strings stay literal so Tailwind can detect them.
const TONES = {
  primary:
    "bg-primary/10 text-primary ring-primary/20 shadow-[0_2px_0_0_color-mix(in_oklab,var(--primary)_25%,transparent)]",
  violet:
    "bg-violet-500/10 text-violet-600 ring-violet-500/25 shadow-[0_2px_0_0_rgb(139_92_246/0.25)] dark:text-violet-400",
  yellow:
    "bg-yellow-400/15 text-yellow-700 ring-yellow-400/35 shadow-[0_2px_0_0_rgb(250_204_21/0.35)] dark:text-yellow-400",
};

function Stat({ icon: Icon, label, value, tone = "primary", index }) {
  return (
    <li className="[perspective:700px]">
      <div
        className={cn(
          "flex h-full items-center gap-3 rounded-xl border bg-card p-3.5 shadow-[0_3px_0_0_var(--border)]",
          "transition-transform duration-200 hover:[transform:rotateX(6deg)_rotateY(-6deg)_translateY(-2px)]",
          "motion-reduce:transition-none motion-reduce:hover:[transform:none]",
          enter,
        )}
        style={delay(index + 1)}
      >
        <span
          className={cn(
            "grid size-10 shrink-0 place-items-center rounded-lg ring-1 ring-inset",
            TONES[tone],
          )}
        >
          <Icon aria-hidden="true" className="size-5" />
        </span>
        <div className="min-w-0">
          <p className="truncate text-xl font-semibold leading-none tracking-tight tabular-nums">
            {value}
          </p>
          <p className="mt-1.5 truncate text-xs text-muted-foreground">
            {label}
          </p>
        </div>
      </div>
    </li>
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

  // Counts come from real data. Change the field names here if yours differ.
  const totalLessons = sections.reduce(
    (n, s) => n + (s.lessons?.length ?? 0),
    0,
  );
  const doneLessons = completedIds?.length ?? completedIds?.size ?? 0;
  const pct = Math.max(0, Math.min(100, Math.round(percent ?? 0)));
  const lessonsLeft = Math.max(0, totalLessons - doneLessons);

  const primaryLabel = done
    ? "Review lessons"
    : percent > 0
      ? "Continue learning"
      : "Start learning";

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_22rem] lg:gap-8">
      <div className="min-w-0 space-y-6">
        {/* Hero */}
        <header className={cn("[perspective:1000px]", enter)}>
          <div className="rounded-2xl border bg-primary/[0.05] p-5 shadow-[0_4px_0_0_var(--border)] transition-transform duration-300 hover:[transform:rotateX(2deg)_rotateY(-2deg)] motion-reduce:transition-none motion-reduce:hover:[transform:none] sm:p-8">
            <div className="space-y-4">
              <Badge
                variant={done ? "default" : "secondary"}
                className="gap-1.5 px-2.5 py-1"
              >
                {done ? (
                  <CheckCircle2 aria-hidden="true" className="size-3.5" />
                ) : (
                  <BookOpen aria-hidden="true" className="size-3.5" />
                )}
                {done ? "Completed" : "In progress"}
              </Badge>
              <h1 className="max-w-3xl text-balance text-3xl font-semibold leading-[1.1] tracking-tight sm:text-4xl">
                {course.title}
              </h1>
              {course.instructor && (
                <p className="text-sm text-muted-foreground">
                  Taught by{" "}
                  <span className="font-medium text-foreground">
                    {course.instructor}
                  </span>
                </p>
              )}
            </div>
          </div>
        </header>

        {/* Stats */}
        <ul
          aria-label="Course summary"
          className="grid grid-cols-2 gap-3 sm:grid-cols-4"
        >
          <Stat index={0} icon={Trophy} label="Progress" value={`${pct}%`} />
          <Stat
            index={1}
            tone="violet"
            icon={CheckCircle2}
            label="Lessons done"
            value={
              totalLessons ? `${doneLessons}/${totalLessons}` : doneLessons
            }
          />
          <Stat
            index={2}
            tone="yellow"
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
        </ul>

        {/* Progress + actions */}
        <Card
          className={cn(
            "gap-5 p-5 shadow-[0_3px_0_0_var(--border)] sm:p-6",
            enter,
          )}
          style={delay(5)}
        >
          <div className="space-y-2">
            <CourseProgress
              value={percent}
              label={done ? "Completed" : "Your progress"}
            />
            {!done && totalLessons > 0 && (
              <p className="text-sm text-muted-foreground">
                {lessonsLeft === 0
                  ? "All lessons viewed."
                  : `${lessonsLeft} ${
                      lessonsLeft === 1 ? "lesson" : "lessons"
                    } left to finish this course.`}
              </p>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-2.5">
            <Link
              href={`/student/learning/${slug}`}
              className={cn(
                buttonVariants({ size: "lg" }),
                "group gap-2 shadow-[0_3px_0_0_color-mix(in_oklab,var(--primary)_55%,black)]",
                keyPress,
              )}
            >
              {primaryLabel}
              <ArrowRight
                aria-hidden="true"
                className="size-4 transition-transform group-hover:translate-x-0.5 motion-reduce:transition-none motion-reduce:group-hover:translate-x-0"
              />
            </Link>
            {done && (
              <Link
                href="/student/certificates"
                className={cn(
                  buttonVariants({ variant: "outline", size: "lg" }),
                  "shadow-[0_3px_0_0_var(--border)]",
                  keyPress,
                )}
              >
                View certificate
              </Link>
            )}
            <Link
              href={`/courses/${slug}`}
              className={buttonVariants({ variant: "ghost", size: "lg" })}
            >
              Public course page
            </Link>
          </div>
        </Card>

        {course.shortDescription && (
          <section aria-labelledby="about-c" className={enter} style={delay(6)}>
            <h2
              id="about-c"
              className="mb-3 text-xl font-semibold tracking-tight"
            >
              About this course
            </h2>
            <div className="max-w-prose leading-relaxed">
              <Paragraphs
                text={course.description || course.shortDescription}
              />
            </div>
          </section>
        )}
      </div>

      <aside
        aria-labelledby="content-c"
        className={cn("lg:sticky lg:top-6 lg:self-start", enter)}
        style={delay(3)}
      >
        <div className="mb-3 flex items-baseline justify-between gap-3">
          <h2 id="content-c" className="text-lg font-semibold tracking-tight">
            Course content
          </h2>
          {sections.length > 0 && (
            <p className="text-xs tabular-nums text-muted-foreground">
              {sections.length} {sections.length === 1 ? "section" : "sections"}
              {totalLessons > 0 &&
                `, ${totalLessons} ${totalLessons === 1 ? "lesson" : "lessons"}`}
            </p>
          )}
        </div>
        <Card className="p-3 shadow-[0_3px_0_0_var(--border)]">
          {sections.length ? (
            <LessonList
              courseSlug={slug}
              sections={sections}
              completed={completedIds}
            />
          ) : (
            <p className="p-3 text-sm leading-relaxed text-muted-foreground">
              Lessons are being added. Check back soon.
            </p>
          )}
        </Card>
      </aside>
    </div>
  );
}
