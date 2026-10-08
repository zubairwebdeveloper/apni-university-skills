// components/shared/CursorPagination.jsx: Link + buttonVariants (shadcn's numbered Pagination doesn't fit cursors)
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { buildQuery } from "@/lib/utils/url";

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
          className={buttonVariants({ variant: "outline" })}
        >
          Back to first page
        </Link>
      )}
      {nextCursor && (
        <Link
          href={buildQuery(basePath, { ...params, after: nextCursor })}
          className={buttonVariants()}
        >
          Next page
        </Link>
      )}
    </nav>
  );
}

