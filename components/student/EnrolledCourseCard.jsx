// components/student/EnrolledCourseCard.jsx: title, thumbnail and button are separate sibling links (no nesting)
import Image from "next/image";
import Link from "next/link";
import { FiArrowRight, FiBookOpen, FiCheckCircle } from "react-icons/fi";
import { buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CourseProgress } from "./CourseProgress";

export function EnrolledCourseCard({ item }) {
  const { course, courseSlug, courseTitle, progress, status } = item;
  const done = status === "completed";
  const started = progress > 0;

  const badge = done
    ? {
        label: "Completed",
        className:
          "border-emerald-500/30 text-emerald-700 dark:text-emerald-400",
      }
    : started
      ? { label: "In progress", className: "border-primary/30 text-primary" }
      : { label: "Not started", className: "text-muted-foreground" };

  return (
    <Card className="group gap-0 overflow-hidden py-0 transition-colors hover:border-primary/40 motion-reduce:transition-none">
      {/* Decorative duplicate of the title link, so it is skipped by keyboard and screen readers */}
      <Link
        href={`/student/courses/${courseSlug}`}
        tabIndex={-1}
        aria-hidden="true"
        className="relative block aspect-video overflow-hidden bg-muted"
      >
        {course?.thumbnail ? (
          <Image
            src={course.thumbnail}
            alt=""
            fill
            sizes="(min-width:1280px) 25vw, (min-width:640px) 50vw, 100vw"
            className="object-cover transition-transform duration-300 motion-safe:group-hover:scale-[1.03] motion-reduce:transition-none"
          />
        ) : (
          <div className="grid h-full place-items-center text-muted-foreground">
            <FiBookOpen className="size-8" aria-hidden="true" />
          </div>
        )}

        <span
          className={`absolute left-3 top-3 inline-flex items-center gap-1 rounded-full border bg-background/95 px-2.5 py-0.5 text-xs font-medium shadow-sm ${badge.className}`}
        >
          {done && <FiCheckCircle className="size-3.5" aria-hidden="true" />}
          {badge.label}
        </span>
      </Link>

      <div className="flex flex-1 flex-col gap-4 p-4 sm:p-5">
        <h3 className="line-clamp-2 min-h-[3.1rem] text-balance font-serif text-lg font-semibold leading-snug">
          <Link
            href={`/student/courses/${courseSlug}`}
            className="rounded-sm hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            {courseTitle}
          </Link>
        </h3>

        <CourseProgress value={progress} label="Progress" />

        <Link
          href={`/student/learning/${courseSlug}`}
          className={buttonVariants({
            variant: done ? "outline" : "default",
            className: "mt-auto gap-2",
          })}
        >
          {done
            ? "Review lessons"
            : started
              ? "Continue learning"
              : "Start learning"}
          <FiArrowRight aria-hidden="true" className="size-4" />
        </Link>
      </div>
    </Card>
  );
}
