// components/public/courses/CourseResults.jsx
import Link from "next/link";
import { BookOpen, SearchX, X } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/EmptyState";
import { CursorPagination } from "@/components/shared/CursorPagination";
import { CourseCard } from "@/components/public/CourseCard";

// CSS-only entrance (tw-animate-css utilities), so this stays a Server Component.
// `motion-safe:` means nothing animates for people who prefer reduced motion.
const REVEAL =
  "motion-safe:animate-in motion-safe:fade-in-0 motion-safe:slide-in-from-bottom-3 motion-safe:duration-500 motion-safe:fill-mode-backwards";

export function CourseResults({
  items,
  nextCursor,
  basePath,
  linkParams,
  after,
}) {
  const hasFilters = Object.values(linkParams).some(Boolean);

  if (!items.length) {
    return (
      <div className={REVEAL}>
        <EmptyState
          icon={hasFilters ? SearchX : BookOpen}
          title={
            hasFilters
              ? "No courses match your filters"
              : "No courses published yet"
          }
          description={
            hasFilters
              ? "Try removing a filter or searching for something broader."
              : "New courses are being prepared. Check back soon."
          }
          action={
            hasFilters ? (
              <Link
                href={basePath}
                className={buttonVariants({ variant: "default" })}
              >
                <X className="size-4" aria-hidden="true" />
                Clear filters
              </Link>
            ) : null
          }
        />
      </div>
    );
  }

  return (
    <section aria-labelledby="course-results-heading">
      <h2 id="course-results-heading" className="sr-only">
        Course results
      </h2>

      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground" aria-live="polite">
          <span className="font-semibold tabular-nums text-foreground">
            {items.length}
          </span>{" "}
          {items.length === 1 ? "course" : "courses"} on this page
        </p>

        {hasFilters && (
          <Link
            href={basePath}
            className={buttonVariants({ variant: "ghost", size: "sm" })}
          >
            <X className="size-4" aria-hidden="true" />
            Clear filters
          </Link>
        )}
      </div>

      <ul
        role="list"
        className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
      >
        {items.map((c, i) => (
          <li
            key={c.id}
            className={`flex [&>*]:h-full [&>*]:w-full ${REVEAL}`}
            // Gentle stagger for the first rows only, so long pages never feel slow.
            style={{ animationDelay: `${Math.min(i, 11) * 45}ms` }}
          >
            <CourseCard course={c} priority={i < 4} />
          </li>
        ))}
      </ul>

      <div className="mt-10 border-t border-border pt-6">
        <CursorPagination
          basePath={basePath}
          params={linkParams}
          after={after}
          nextCursor={nextCursor}
        />
      </div>
    </section>
  );
}
