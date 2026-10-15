// components/shared/AuditPagination.jsx
import Link from "next/link";
import { FiChevronLeft, FiChevronRight, FiChevronsLeft } from "react-icons/fi";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
} from "@/components/ui/pagination";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const FIRST = "_"; // placeholder for "no cursor" (first page) inside the trail

function buildHref(basePath, params, { after, trail }) {
  const qs = new URLSearchParams();
  Object.entries(params ?? {}).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== "") qs.set(k, String(v));
  });
  if (after) qs.set("after", after);
  if (trail?.length) qs.set("trail", trail.join(","));
  const s = qs.toString();
  return s ? `${basePath}?${s}` : basePath;
}

function NavItem({ href, disabled, label, children, className }) {
  const cls = cn(
    buttonVariants({ variant: "outline", size: "sm" }),
    "gap-1",
    className,
  );
  if (disabled || !href) {
    return (
      <span
        aria-disabled="true"
        aria-label={label}
        className={cn(cls, "pointer-events-none opacity-50")}
      >
        {children}
      </span>
    );
  }
  return (
    <Link href={href} aria-label={label} className={cls}>
      {children}
    </Link>
  );
}

/**
 * Cursor pagination styled with shadcn Pagination primitives.
 * Cursors are forward-only, so "Previous" works through a `trail` query param
 * that remembers the cursors of the pages already visited.
 */
export function AuditPagination({
  basePath,
  params,
  after,
  trail = [],
  nextCursor,
  shown,
  total,
}) {
  const page = trail.length + 1;
  const hasPrev = trail.length > 0;

  const firstHref = buildHref(basePath, params, {});
  const prevCursor = trail[trail.length - 1];
  const prevHref = buildHref(basePath, params, {
    after: prevCursor && prevCursor !== FIRST ? prevCursor : undefined,
    trail: trail.slice(0, -1),
  });
  const nextHref = nextCursor
    ? buildHref(basePath, params, {
        after: nextCursor,
        trail: [...trail, after || FIRST],
      })
    : null;

  if (!hasPrev && !nextCursor) {
    return total ? (
      <p className="mt-4 text-center text-xs text-muted-foreground">
        Showing all {shown} of {total} entries
      </p>
    ) : null;
  }

  return (
    <div className="mt-4 flex flex-col items-center justify-between gap-3 sm:flex-row">
      <p className="text-xs text-muted-foreground" aria-live="polite">
        Page {page} · {shown} entries shown
        {total ? ` · ${total} total` : ""}
      </p>
      <Pagination className="mx-0 w-auto justify-end">
        <PaginationContent>
          <PaginationItem>
            <NavItem href={firstHref} disabled={!hasPrev} label="First page">
              <FiChevronsLeft aria-hidden="true" className="size-4" />
              <span className="hidden sm:inline">Newest</span>
            </NavItem>
          </PaginationItem>
          <PaginationItem>
            <NavItem href={prevHref} disabled={!hasPrev} label="Previous page">
              <FiChevronLeft aria-hidden="true" className="size-4" />
              <span className="hidden sm:inline">Previous</span>
            </NavItem>
          </PaginationItem>
          <PaginationItem>
            <span
              aria-current="page"
              className={cn(
                buttonVariants({ variant: "default", size: "sm" }),
                "pointer-events-none min-w-9",
              )}
            >
              {page}
            </span>
          </PaginationItem>
          <PaginationItem>
            <NavItem href={nextHref} disabled={!nextCursor} label="Next page">
              <span className="hidden sm:inline">Next</span>
              <FiChevronRight aria-hidden="true" className="size-4" />
            </NavItem>
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
}
