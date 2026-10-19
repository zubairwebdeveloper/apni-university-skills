"use client";

import { Fragment, memo } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
import { FiChevronRight, FiHome } from "react-icons/fi";

import { cn } from "@/lib/utils";

/* -------------------------------------------------------
   Breadcrumb item normalization
------------------------------------------------------- */

function normalizeItems(items) {
  if (!Array.isArray(items)) return [];

  return items
    .filter(
      (item) =>
        item && typeof item.label === "string" && item.label.trim().length > 0,
    )
    .map((item) => ({
      label: item.label.trim(),
      href:
        typeof item.href === "string" && item.href.trim()
          ? item.href.trim()
          : undefined,
    }));
}

/* -------------------------------------------------------
   Home breadcrumb
------------------------------------------------------- */

const BreadcrumbHome = memo(function BreadcrumbHome({ href = "/", reduce }) {
  return (
    <Link
      href={href}
      aria-label="Home"
      title="Home"
      className={cn(
        "group inline-flex size-8 shrink-0 items-center justify-center",
        "rounded-lg border border-transparent",
        "text-muted-foreground outline-none",
        "transition-colors duration-200",
        "hover:border-purple-500/20 hover:bg-purple-500/[0.07]",
        "hover:text-purple-700",
        "focus-visible:ring-2 focus-visible:ring-purple-500/60",
        "dark:hover:text-purple-300",
        "motion-reduce:transition-none",
      )}
    >
      <motion.span
        whileHover={reduce ? undefined : { scale: 1.08 }}
        whileTap={reduce ? undefined : { scale: 0.94 }}
        className="inline-flex"
      >
        <FiHome aria-hidden="true" className="size-4" />
      </motion.span>
    </Link>
  );
});

BreadcrumbHome.displayName = "BreadcrumbHome";

/* -------------------------------------------------------
   Breadcrumb separator
------------------------------------------------------- */

function BreadcrumbDivider() {
  return (
    <span
      aria-hidden="true"
      className="mx-0.5 inline-flex shrink-0 items-center text-border"
    >
      <FiChevronRight className="size-3.5" />
    </span>
  );
}

/* -------------------------------------------------------
   Breadcrumb link
------------------------------------------------------- */

const BreadcrumbLinkItem = memo(function BreadcrumbLinkItem({ item, reduce }) {
  return (
    <Link
      href={item.href}
      className={cn(
        "group relative inline-flex max-w-[10rem] items-center",
        "truncate rounded-md px-1.5 py-1",
        "text-sm font-medium text-muted-foreground",
        "outline-none transition-colors duration-200",
        "hover:text-purple-700",
        "focus-visible:ring-2 focus-visible:ring-purple-500/60",
        "sm:max-w-[13rem] md:max-w-[16rem]",
        "dark:hover:text-purple-300",
        "motion-reduce:transition-none",
      )}
    >
      <motion.span
        whileHover={reduce ? undefined : { y: -1 }}
        className="truncate"
      >
        {item.label}
      </motion.span>

      <span
        aria-hidden="true"
        className={cn(
          "absolute inset-x-1.5 bottom-0 h-px origin-left",
          "scale-x-0 bg-purple-500 transition-transform duration-200",
          "group-hover:scale-x-100",
          "group-focus-visible:scale-x-100",
          "motion-reduce:transition-none",
        )}
      />
    </Link>
  );
});

BreadcrumbLinkItem.displayName = "BreadcrumbLinkItem";

/* -------------------------------------------------------
   Current page
------------------------------------------------------- */

const BreadcrumbCurrentPage = memo(function BreadcrumbCurrentPage({ label }) {
  return (
    <span
      aria-current="page"
      title={label}
      className={cn(
        "inline-flex min-w-0 max-w-[12rem] items-center gap-2",
        "rounded-lg border border-purple-500/15",
        "bg-purple-500/[0.06] px-2.5 py-1.5",
        "text-sm font-semibold text-foreground",
        "sm:max-w-[16rem]",
      )}
    >
      <span
        aria-hidden="true"
        className="size-1.5 shrink-0 rounded-full bg-yellow-400 ring-2 ring-yellow-400/20"
      />

      <span className="truncate">{label}</span>
    </span>
  );
});

BreadcrumbCurrentPage.displayName = "BreadcrumbCurrentPage";

/* -------------------------------------------------------
   Page breadcrumbs
------------------------------------------------------- */

/**
 * Usage:
 *
 * <PageBreadcrumbs
 *   items={[
 *     { label: "Courses", href: "/courses" },
 *     { label: "Web Development", href: "/courses/web-development" },
 *     { label: "Course Details" },
 *   ]}
 * />
 *
 * Optional props:
 * - homeHref: custom home destination
 * - showHome: show/hide the home icon
 * - className: additional wrapper classes
 */

export const PageBreadcrumbs = memo(function PageBreadcrumbs({
  items = [],
  homeHref = "/",
  showHome = true,
  className,
}) {
  const pathname = usePathname();
  const reduce = useReducedMotion();

  const normalizedItems = normalizeItems(items);

  if (!showHome && normalizedItems.length === 0) {
    return null;
  }

  // If the last breadcrumb has a destination, keep it a link only
  // when a later item represents the current page.
  const lastIndex = normalizedItems.length - 1;

  return (
    <nav aria-label="Breadcrumb" className={cn("min-w-0", className)}>
      <ol
        className={cn(
          "flex min-w-0 flex-wrap items-center gap-x-1 gap-y-1",
          "text-sm",
        )}
      >
        {showHome ? (
          <li className="inline-flex shrink-0 items-center">
            <BreadcrumbHome href={homeHref} reduce={reduce} />
          </li>
        ) : null}

        {normalizedItems.map((item, index) => {
          const last = index === lastIndex;
          const current =
            last || (!item.href && index === normalizedItems.length - 1);

          return (
            <Fragment key={`${item.href || "page"}-${item.label}-${index}`}>
              {showHome || index > 0 ? (
                <li className="inline-flex shrink-0 items-center">
                  <BreadcrumbDivider />
                </li>
              ) : null}

              <li
                className={cn(
                  "inline-flex min-w-0 items-center",
                  current && "max-w-full",
                )}
              >
                {current ? (
                  <BreadcrumbCurrentPage label={item.label} />
                ) : item.href ? (
                  <BreadcrumbLinkItem item={item} reduce={Boolean(reduce)} />
                ) : (
                  <span
                    className="max-w-[10rem] truncate px-1.5 py-1 text-sm text-muted-foreground sm:max-w-[13rem]"
                    title={item.label}
                  >
                    {item.label}
                  </span>
                )}
              </li>
            </Fragment>
          );
        })}
      </ol>
    </nav>
  );
});
