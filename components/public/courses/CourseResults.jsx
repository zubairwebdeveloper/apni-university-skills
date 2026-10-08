// components/public/courses/CourseResults.jsx
import Link from "next/link";
import { FiSearch } from "react-icons/fi";
import { buttonVariants } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/EmptyState";
import { CursorPagination } from "@/components/shared/CursorPagination";
import { CourseCard } from "@/components/public/CourseCard";

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
      <EmptyState
        icon={FiSearch}
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
              className={buttonVariants({ variant: "outline" })}
            >
              Clear filters
            </Link>
          ) : null
        }
      />
    );
  }
  return (
    <>
      <p className="mb-4 text-sm text-muted-foreground" aria-live="polite">
        {items.length} {items.length === 1 ? "course" : "courses"} on this page
      </p>
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {items.map((c, i) => (
          <CourseCard key={c.id} course={c} priority={i < 4} />
        ))}
      </div>
      <CursorPagination
        basePath={basePath}
        params={linkParams}
        after={after}
        nextCursor={nextCursor}
      />
    </>
  );
}

