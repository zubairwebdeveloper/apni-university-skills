// components/public/courses/EnrollmentCard.jsx (server component; only CourseActions/ShareButton are client)
import Image from "next/image";
import {
  Award,
  BookOpen,
  Clock,
  Gauge,
  Globe,
  ListVideo,
  Tag,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { CourseActions } from "./CourseActions";
import { ShareButton } from "./ShareButton";
import { formatDuration, formatPrice } from "@/lib/utils/format";
import { levelLabel } from "@/config/courses";

// CSS-only entrance (tw-animate-css), so this stays a Server Component.
// `motion-safe:` means nothing animates for people who prefer reduced motion.
const REVEAL =
  "motion-safe:animate-in motion-safe:fade-in-0 motion-safe:slide-in-from-bottom-3 motion-safe:duration-500";

export function EnrollmentCard({ course, lessonCount, shareUrl }) {
  const onSale =
    !course.isFree &&
    course.salePrice != null &&
    course.salePrice < course.price;
  const current = onSale ? course.salePrice : course.price;
  const off = onSale
    ? Math.round((1 - course.salePrice / course.price) * 100)
    : 0;
  const saved = onSale ? course.price - course.salePrice : 0;

  const facts = [
    {
      icon: ListVideo,
      label: "Lessons",
      value: lessonCount != null ? String(lessonCount) : "",
    },
    { icon: Clock, label: "Duration", value: formatDuration(course.duration) },
    { icon: Gauge, label: "Level", value: levelLabel(course.level) },
    { icon: Globe, label: "Language", value: course.language },
  ].filter((f) => f.value);

  return (
    <Card
      className={`group gap-0 overflow-hidden py-0 shadow-md transition-shadow duration-300 hover:shadow-lg motion-reduce:transition-none ${REVEAL}`}
    >
      <div className="relative aspect-video overflow-hidden bg-muted">
        {course.thumbnail ? (
          <Image
            src={course.thumbnail}
            alt=""
            fill
            priority
            sizes="(min-width:1024px) 384px, 100vw"
            className="object-cover transition-transform duration-500 group-hover:scale-[1.03] motion-reduce:transition-none"
          />
        ) : (
          <div className="grid h-full place-items-center text-muted-foreground">
            <BookOpen className="size-8" aria-hidden="true" />
          </div>
        )}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-black/5 dark:ring-white/10"
        />
      </div>

      <div className="space-y-5 p-5">
        <div className="space-y-1.5">
          <div className="flex flex-wrap items-baseline gap-x-2.5 gap-y-1">
            {course.isFree ? (
              <>
                <span className="font-serif text-3xl font-semibold tracking-tight">
                  Free
                </span>
                <Badge className="bg-highlight text-highlight-foreground">
                  Free course
                </Badge>
              </>
            ) : (
              <>
                <span className="font-serif text-3xl font-semibold tracking-tight">
                  <span className="sr-only">Price: </span>
                  {formatPrice(current, course.currency)}
                </span>
                {onSale && (
                  <>
                    <del className="text-muted-foreground">
                      <span className="sr-only">Original price: </span>
                      {formatPrice(course.price, course.currency)}
                    </del>
                    <Badge variant="secondary">{off}% off</Badge>
                  </>
                )}
              </>
            )}
          </div>

          {onSale && (
            <p className="flex items-center gap-1.5 text-sm font-medium text-emerald-600 dark:text-emerald-400">
              <Tag className="size-3.5" aria-hidden="true" />
              You save {formatPrice(saved, course.currency)}
            </p>
          )}
        </div>

        <CourseActions
          course={{
            id: course.id,
            slug: course.slug,
            isFree: !!course.isFree,
            currency: course.currency,
          }}
        />

        <Separator />

        <div>
          <h3 className="mb-3 text-sm font-semibold tracking-tight text-foreground">
            This course includes
          </h3>

          <dl className="space-y-2.5 text-sm">
            {facts.map(({ icon: Icon, label, value }) => (
              <div key={label} className="flex items-center gap-2.5">
                <dt className="flex items-center gap-2.5 text-muted-foreground">
                  <Icon className="size-4 shrink-0" aria-hidden="true" />
                  {label}
                </dt>
                <dd className="ml-auto text-right font-medium text-foreground">
                  {value}
                </dd>
              </div>
            ))}
          </dl>

          <p className="mt-4 flex items-center gap-2.5 rounded-lg bg-muted/50 px-3 py-2.5 text-sm text-foreground">
            <Award
              className="size-4 shrink-0 text-primary"
              aria-hidden="true"
            />
            Certificate of completion
          </p>
        </div>

        <ShareButton url={shareUrl} title={course.title} />
      </div>
    </Card>
  );
}
