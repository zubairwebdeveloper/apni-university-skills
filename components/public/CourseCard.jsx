// components/public/CourseCard.jsx
import Image from "next/image";
import Link from "next/link";
import { FiBookOpen, FiClock } from "react-icons/fi";
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
  return (
    <Link
      href={`/courses/${course.slug}`}
      className="group block h-full rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
    >
      <Card className="h-full gap-0 overflow-hidden py-0 transition-shadow duration-200 group-hover:shadow-lg">
        <div className="relative aspect-video bg-muted">
          {course.thumbnail ? (
            <Image
              src={course.thumbnail}
              alt=""
              fill
              priority={priority}
              sizes="(min-width:1280px) 25vw, (min-width:640px) 50vw, 100vw"
              className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
            />
          ) : (
            <div className="grid h-full place-items-center text-muted-foreground">
              <FiBookOpen className="size-8" aria-hidden="true" />
            </div>
          )}
          {course.isFree && (
            <Badge className="absolute left-3 top-3 bg-highlight text-highlight-foreground">
              Free
            </Badge>
          )}
        </div>
        <div className="flex flex-1 flex-col gap-2.5 p-4">
          <p className="text-xs text-muted-foreground">
            <span className="font-medium text-primary">{course.category}</span>{" "}
            · {course.level}
          </p>
          <h3 className="line-clamp-2 font-serif text-lg font-semibold leading-snug">
            {course.title}
          </h3>
          <p className="text-sm text-muted-foreground">{course.instructor}</p>
          <Rating value={course.rating} count={course.reviewCount} />
          <div className="mt-auto flex items-center justify-between border-t pt-3 text-sm">
            <span className="inline-flex items-center gap-1.5 text-muted-foreground">
              <FiClock className="size-4" aria-hidden="true" />
              {formatDuration(course.duration)}
            </span>
            <span className="font-semibold">
              {course.isFree ? (
                "Free"
              ) : (
                <>
                  {onSale && (
                    <span className="mr-1.5 text-xs font-normal text-muted-foreground line-through">
                      {formatPrice(course.price, course.currency)}
                    </span>
                  )}
                  {formatPrice(current, course.currency)}
                </>
              )}
            </span>
          </div>
        </div>
      </Card>
    </Link>
  );
}

