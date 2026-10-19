// components/public/CourseCard.jsx
import Image from "next/image";
import Link from "next/link";
import { FiBookOpen, FiClock } from "react-icons/fi";

import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Rating } from "@/components/shared/Rating";
import { formatDuration, formatPrice } from "@/lib/utils/format";

export function CourseCard({ course, priority = false }) {
  const onSale =
    !course.isFree &&
    course.salePrice != null &&
    course.salePrice < course.price;
  const current = onSale ? course.salePrice : course.price;
  const percentOff = onSale
    ? Math.round((1 - course.salePrice / course.price) * 100)
    : 0;

  // Avoids a dangling separator when category or level is missing.
  const meta = [course.category, course.level].filter(Boolean);
  const instructor = course.instructor?.trim();
  const initial = instructor ? instructor.charAt(0).toUpperCase() : null;

  return (
    <Link
      href={`/courses/${course.slug}`}
      className="group block h-full rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
    >
      <Card
        className={cn(
          "h-full gap-0 overflow-hidden py-0 shadow-sm transition-[transform,box-shadow,border-color] duration-300",
          "group-hover:border-primary/40 group-hover:shadow-xl",
          "motion-safe:group-hover:-translate-y-0.5",
        )}
      >
        {/* Cover */}
        <div className="relative aspect-video overflow-hidden bg-muted">
          {course.thumbnail ? (
            <Image
              src={course.thumbnail}
              alt=""
              fill
              priority={priority}
              sizes="(min-width:1280px) 25vw, (min-width:640px) 50vw, 100vw"
              className="object-cover transition-transform duration-500 motion-safe:group-hover:scale-[1.04]"
            />
          ) : (
            <div className="grid h-full place-items-center text-muted-foreground/50">
              <FiBookOpen
                className="size-10"
                strokeWidth={1.25}
                aria-hidden="true"
              />
            </div>
          )}
          <div
            aria-hidden="true"
            className="absolute inset-x-0 bottom-0 h-px bg-border"
          />

          {course.isFree && (
            <Badge className="absolute left-3 top-3 bg-highlight text-highlight-foreground shadow-sm">
              Free
            </Badge>
          )}
          {onSale && percentOff > 0 && (
            <Badge className="absolute left-3 top-3 bg-primary text-primary-foreground tabular-nums shadow-sm">
              {percentOff}% off
            </Badge>
          )}
        </div>

        {/* Body */}
        <div className="flex flex-1 flex-col gap-3 p-4 sm:p-5">
          {meta.length > 0 && (
            <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
              {course.category && (
                <span className="font-medium text-primary">
                  {course.category}
                </span>
              )}
              {course.category && course.level && (
                <span
                  aria-hidden="true"
                  className="size-1 rounded-full bg-border"
                />
              )}
              {course.level && <span>{course.level}</span>}
            </p>
          )}

          <h3 className="line-clamp-2 font-serif text-lg font-semibold leading-snug tracking-tight transition-colors group-hover:text-primary">
            {course.title}
          </h3>

          {instructor && (
            <div className="flex min-w-0 items-center gap-2">
              <span
                aria-hidden="true"
                className="grid size-6 shrink-0 place-items-center rounded-full border border-primary/20 bg-primary/10 text-[11px] font-semibold text-primary"
              >
                {initial}
              </span>
              <p className="truncate text-sm text-muted-foreground">
                {instructor}
              </p>
            </div>
          )}

          <Rating value={course.rating} count={course.reviewCount} />

          {/* Footer: duration and price */}
          <div className="mt-auto flex items-end justify-between gap-3 border-t pt-4 text-sm">
            <span className="inline-flex items-center gap-1.5 text-muted-foreground">
              <FiClock className="size-4" aria-hidden="true" />
              {formatDuration(course.duration)}
            </span>

            <span className="text-right font-semibold tabular-nums">
              {course.isFree ? (
                <span className="text-base text-primary">Free</span>
              ) : (
                <>
                  {onSale && (
                    <>
                      <span className="sr-only">
                        Original price{" "}
                        {formatPrice(course.price, course.currency)}. Sale price
                      </span>
                      <del
                        aria-hidden="true"
                        className="mr-1.5 text-xs font-normal text-muted-foreground"
                      >
                        {formatPrice(course.price, course.currency)}
                      </del>
                    </>
                  )}
                  <span className="text-base">
                    {formatPrice(current, course.currency)}
                  </span>
                </>
              )}
            </span>
          </div>
        </div>
      </Card>
    </Link>
  );
}
