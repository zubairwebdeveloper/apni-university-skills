// components/student/EnrolledCourseCard.jsx: title and button are separate sibling links (no nesting)
import Image from "next/image";
import Link from "next/link";
import { FiBookOpen } from "react-icons/fi";
import { buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CourseProgress } from "./CourseProgress";

export function EnrolledCourseCard({ item }) {
  const { course, courseSlug, courseTitle, progress, status } = item;
  const done = status === "completed";
  return (
    <Card className="gap-0 overflow-hidden py-0">
      <div className="relative aspect-video bg-muted">
        {course?.thumbnail ? (
          <Image
            src={course.thumbnail}
            alt=""
            fill
            sizes="(min-width:1280px) 25vw, (min-width:640px) 50vw, 100vw"
            className="object-cover"
          />
        ) : (
          <div className="grid h-full place-items-center text-muted-foreground">
            <FiBookOpen className="size-8" aria-hidden="true" />
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-3 p-4">
        <h3 className="line-clamp-2 font-serif text-lg font-semibold leading-snug">
          <Link
            href={`/student/courses/${courseSlug}`}
            className="hover:underline"
          >
            {courseTitle}
          </Link>
        </h3>
        <CourseProgress
          value={progress}
          label={done ? "Completed" : "Progress"}
        />
        <Link
          href={`/student/learning/${courseSlug}`}
          className={buttonVariants({
            variant: done ? "outline" : "default",
            className: "mt-auto",
          })}
        >
          {done
            ? "Review lessons"
            : progress > 0
              ? "Continue learning"
              : "Start learning"}
        </Link>
      </div>
    </Card>
  );
}

