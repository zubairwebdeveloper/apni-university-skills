// app/student/courses/page.jsx
import Link from "next/link";
import {
  BookOpen,
  BookOpenCheck,
  CircleCheckBig,
  Gauge,
  ArrowRight,
} from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/EmptyState";
import { StudentPageHeader } from "@/components/student/StudentPageHeader";
import {
  ExploreSection,
  MyCoursesView,
} from "@/components/student/MyCoursesView";
import { requireUser } from "@/lib/auth/session";
import { enrollmentService } from "@/services/enrollmentService";
import { cn } from "@/lib/utils";

export const metadata = { title: "My courses" };

const enter =
  "animate-in fade-in slide-in-from-bottom-2 fill-mode-both duration-500 motion-reduce:animate-none";

// Full class strings stay literal so Tailwind can detect them.
const TONES = {
  primary:
    "bg-primary/10 text-primary ring-primary/20 shadow-[0_3px_0_0_color-mix(in_oklab,var(--primary)_25%,transparent)]",
  violet:
    "bg-violet-500/10 text-violet-600 ring-violet-500/25 shadow-[0_3px_0_0_rgb(139_92_246/0.25)] dark:text-violet-400",
  yellow:
    "bg-yellow-400/15 text-yellow-700 ring-yellow-400/35 shadow-[0_3px_0_0_rgb(250_204_21/0.35)] dark:text-yellow-400",
};

function StatTile({ icon: Icon, label, value, hint, tone = "primary", index }) {
  return (
    <li className="[perspective:700px]">
      <div
        className={cn(
          "flex h-full items-start gap-3.5 rounded-2xl border bg-card p-4 shadow-[0_3px_0_0_var(--border)] sm:p-5",
          "transition-transform duration-200 hover:shadow-md",
          "hover:[transform:rotateX(6deg)_rotateY(-6deg)_translateY(-2px)]",
          "motion-reduce:transition-none motion-reduce:hover:[transform:none]",
          enter,
        )}
        style={{ animationDelay: `${index * 80}ms` }}
      >
        <span
          className={cn(
            "grid size-11 shrink-0 place-items-center rounded-xl ring-1 ring-inset",
            TONES[tone],
          )}
        >
          <Icon aria-hidden="true" className="size-5" />
        </span>
        <div className="min-w-0">
          <p className="text-xs font-medium text-muted-foreground">{label}</p>
          <p className="mt-0.5 truncate text-xl font-semibold leading-tight tracking-tight tabular-nums">
            {value}
          </p>
          {hint ? (
            <p className="mt-1 line-clamp-1 text-xs text-muted-foreground">
              {hint}
            </p>
          ) : null}
        </div>
      </div>
    </li>
  );
}

function Stats({ enrolled, inProgress, completed, averageProgress }) {
  return (
    <ul
      aria-label="Learning summary"
      className="mb-8 grid gap-3 sm:grid-cols-3 sm:gap-4"
    >
      <StatTile
        index={0}
        icon={BookOpenCheck}
        label="In progress"
        value={inProgress}
        hint={`of ${enrolled} enrolled ${enrolled === 1 ? "course" : "courses"}`}
      />
      <StatTile
        index={1}
        tone="violet"
        icon={CircleCheckBig}
        label="Completed"
        value={completed}
        hint={
          completed
            ? "Certificates are issued on completion"
            : "Finish every lesson to complete a course"
        }
      />
      <StatTile
        index={2}
        tone="yellow"
        icon={Gauge}
        label="Average progress"
        value={`${averageProgress}%`}
        hint="Across all enrolled courses"
      />
    </ul>
  );
}

export default async function MyCoursesPage() {
  const user = await requireUser();
  const items = await enrollmentService.getStudentCourses(user.uid);

  if (!items.length) {
    return (
      <>
        <StudentPageHeader
          title="My courses"
          description="Everything you are enrolled in will live here."
        />
        <div className={enter}>
          <EmptyState
            icon={BookOpen}
            title="No courses yet"
            description="Courses you enroll in will appear here. Start with one of our popular tech learning paths below."
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
        </div>
        <ExploreSection />
      </>
    );
  }

  // Same field names used on the certificates page (status, progress)
  const completed = items.filter((e) => e.status === "completed").length;
  const inProgress = items.filter(
    (e) => e.status !== "completed" && (e.progress ?? 0) > 0,
  ).length;
  const averageProgress = Math.round(
    items.reduce(
      (sum, e) =>
        sum +
        (e.status === "completed"
          ? 100
          : Math.max(0, Math.min(100, e.progress ?? 0))),
      0,
    ) / items.length,
  );

  return (
    <>
      <StudentPageHeader
        title="My courses"
        description={`${items.length} ${
          items.length === 1 ? "course" : "courses"
        } enrolled. Keep learning, keep growing.`}
      />
      <Stats
        enrolled={items.length}
        inProgress={inProgress}
        completed={completed}
        averageProgress={averageProgress}
      />
      <MyCoursesView items={items} />
    </>
  );
}
