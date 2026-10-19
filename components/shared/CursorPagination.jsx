// components/shared/CursorPagination.jsx: Link + buttonVariants (shadcn's numbered Pagination doesn't fit cursors)
import Link from "next/link";
import { FiArrowRight, FiCornerUpLeft } from "react-icons/fi";
import { buttonVariants } from "@/components/ui/button";
import { buildQuery } from "@/lib/utils/url";
import { cn } from "@/lib/utils";

export function CursorPagination({ basePath, params, after, nextCursor }) {
  if (!after && !nextCursor) return null;
  return (
    <nav
      aria-label="Pagination"
      className="mt-10 flex flex-wrap items-center justify-center gap-3"
    >
      {after && (
        <Link
          href={buildQuery(basePath, params)}
          className={cn(
            buttonVariants({ variant: "outline" }),
            "group gap-2 transition-colors hover:border-primary/40 hover:text-primary",
          )}
        >
          <FiCornerUpLeft
            aria-hidden="true"
            className="size-4 transition-transform duration-200 group-hover:-translate-x-0.5"
          />
          Back to first page
        </Link>
      )}
      {nextCursor && (
        <Link
          href={buildQuery(basePath, { ...params, after: nextCursor })}
          className={cn(buttonVariants(), "group gap-2")}
        >
          Next page
          <FiArrowRight
            aria-hidden="true"
            className="size-4 transition-transform duration-200 group-hover:translate-x-0.5"
          />
        </Link>
      )}
    </nav>
  );
}
