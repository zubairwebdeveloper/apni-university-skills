// components/public/courses/EnrollmentCard.jsx (server component; only CourseActions/ShareButton are client)
import Image from "next/image";
import {
  FiAward,
  FiBarChart2,
  FiBookOpen,
  FiBookmark,
  FiClock,
  FiGlobe,
  FiBook,
} from "react-icons/fi";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { CourseActions } from "./CourseActions";
import { ShareButton } from "./ShareButton";
import { formatDuration, formatPrice } from "@/lib/utils/format";
import { levelLabel } from "@/config/courses";

export function EnrollmentCard({ course, lessonCount, shareUrl }) {
  const onSale =
    !course.isFree &&
    course.salePrice != null &&
    course.salePrice < course.price;
  const current = onSale ? course.salePrice : course.price;
  const off = onSale
    ? Math.round((1 - course.salePrice / course.price) * 100)
    : 0;
  const facts = [
    { icon: FiBook, text: `${lessonCount} lessons` },
    { icon: FiClock, text: formatDuration(course.duration) },
    { icon: FiBarChart2, text: levelLabel(course.level) },
    { icon: FiGlobe, text: course.language },
    { icon: FiAward, text: "Certificate of completion" },
  ].filter((f) => f.text);

  return (
    <Card className="gap-0 overflow-hidden py-0 shadow-md">
      <div className="relative aspect-video bg-muted">
        {course.thumbnail ? (
          <Image
            src={course.thumbnail}
            alt=""
            fill
            priority
            sizes="(min-width:1024px) 384px, 100vw"
            className="object-cover"
          />
        ) : (
          <div className="grid h-full place-items-center text-muted-foreground">
            <FiBookOpen className="size-8" aria-hidden="true" />
          </div>
        )}
      </div>
      <div className="space-y-5 p-5">
        <div className="flex flex-wrap items-baseline gap-2">
          {course.isFree ? (
            <>
              <span className="font-serif text-3xl font-semibold">Free</span>
              <Badge className="bg-highlight text-highlight-foreground">
                Free course
              </Badge>
            </>
          ) : (
            <>
              <span className="font-serif text-3xl font-semibold">
                {formatPrice(current, course.currency)}
              </span>
              {onSale && (
                <>
                  <span className="text-muted-foreground line-through">
                    {formatPrice(course.price, course.currency)}
                  </span>
                  <Badge variant="secondary">{off}% off</Badge>
                </>
              )}
            </>
          )}
        </div>
        <CourseActions
          course={{
            slug: course.slug,
            isFree: !!course.isFree,
            currency: course.currency,
          }}
        />

        <Separator />
        <ul className="space-y-2.5 text-sm">
          {facts.map(({ icon: Icon, text }) => (
            <li
              key={text}
              className="flex items-center gap-2.5 text-muted-foreground"
            >
              <Icon className="size-4 shrink-0" aria-hidden="true" />
              {text}
            </li>
          ))}
        </ul>
        <ShareButton url={shareUrl} title={course.title} />
      </div>
    </Card>
  );
}

