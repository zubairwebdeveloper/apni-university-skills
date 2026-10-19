// components/public/InstructorCard.jsx
import Link from "next/link";
import { FiArrowRight, FiUsers } from "react-icons/fi";

import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { Rating } from "@/components/shared/Rating";
import { formatCompact } from "@/lib/utils/format";

export function InstructorCard({ instructor: i }) {
  const students = i.studentsCount ?? 0;
  const initial = i.name?.trim().charAt(0).toUpperCase();

  return (
    <Link
      href={`/instructors/${i.slug}`}
      className="group block h-full rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
    >
      <Card
        className={cn(
          "h-full items-center gap-4 p-6 text-center shadow-sm transition-[transform,box-shadow,border-color] duration-300 sm:p-7",
          "group-hover:border-primary/40 group-hover:shadow-xl",
          "motion-safe:group-hover:-translate-y-0.5",
        )}
      >
        {/* Avatar with a ring that picks up the accent color on hover */}
        <Avatar className="size-24 ring-4 ring-primary/10 ring-offset-2 ring-offset-card transition-shadow duration-300 group-hover:ring-primary/30">
          <AvatarImage src={i.avatar} alt="" className="object-cover" />
          <AvatarFallback className="bg-primary/10 font-serif text-2xl text-primary">
            {initial}
          </AvatarFallback>
        </Avatar>

        <div className="flex min-w-0 flex-col gap-1.5">
          <h3 className="font-serif text-lg font-semibold leading-snug tracking-tight transition-colors group-hover:text-primary sm:text-xl">
            {i.name}
          </h3>
          {i.designation && (
            <p className="line-clamp-2 text-sm leading-relaxed text-muted-foreground">
              {i.designation}
            </p>
          )}
        </div>

        {/* Footer: stats and profile cue */}
        <div className="mt-auto flex w-full flex-col items-center gap-3 border-t pt-4">
          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-xs text-muted-foreground">
            <Rating value={i.rating} count={i.reviewCount ?? i.studentsCount} />
            <span className="inline-flex items-center gap-1.5 tabular-nums">
              <FiUsers className="size-3.5" aria-hidden="true" />
              {formatCompact(students)}{" "}
              {students === 1 ? "student" : "students"}
            </span>
          </div>

          <span className="inline-flex items-center gap-1.5 text-sm font-medium text-primary">
            View profile
            <FiArrowRight
              aria-hidden="true"
              className="size-4 transition-transform duration-300 motion-safe:group-hover:translate-x-1"
            />
          </span>
        </div>
      </Card>
    </Link>
  );
}
