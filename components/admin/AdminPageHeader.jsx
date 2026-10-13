// components/admin/AdminPageHeader.jsx
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

import { cn } from "@/lib/utils";

/*
  Props (all optional except title):
  - title        string | ReactNode
  - description  string | ReactNode
  - actions      ReactNode (buttons, links)
  - eyebrow      small label above the title, e.g. "People"
  - badge        ReactNode shown next to the title, e.g. <Badge>128 total</Badge>
  - back         { href: "/admin/students", label: "Students" }
  - sticky       pins the header to the top of its scroll container with a
                 blurred backdrop, for long pages. Pure CSS — no JS, no
                 client boundary. Defaults to false.
  - className    extra classes for the wrapper
*/
export function AdminPageHeader({
  title,
  description,
  actions,
  eyebrow,
  badge,
  back,
  sticky = false,
  className,
}) {
  return (
    <header
      className={cn(
        "mb-6 animate-in fade-in slide-in-from-bottom-1 space-y-4 duration-300 motion-reduce:animate-none",
        sticky &&
          "sticky top-0 z-20 bg-background/90 pb-4 pt-[inherit] backdrop-blur-sm supports-[backdrop-filter]:bg-background/75",
        className,
      )}
    >
      {back?.href ? (
        <Link
          href={back.href}
          className="group inline-flex items-center gap-1 rounded-md text-sm text-muted-foreground outline-none transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
        >
          <ChevronLeft
            aria-hidden="true"
            className="size-4 transition-transform duration-200 group-hover:-translate-x-0.5 motion-reduce:transition-none"
          />
          <span>Back{back.label ? ` to ${back.label}` : ""}</span>
        </Link>
      ) : null}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between sm:gap-6">
        <div className="min-w-0 space-y-1.5">
          {eyebrow ? (
            <p className="text-xs font-semibold uppercase tracking-wider text-primary">
              {eyebrow}
            </p>
          ) : null}

          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <h1 className="min-w-0 text-2xl font-semibold tracking-tight sm:text-3xl">
              {title}
            </h1>
            {badge ? <div className="shrink-0">{badge}</div> : null}
          </div>

          {description ? (
            <p className="max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">
              {description}
            </p>
          ) : null}
        </div>

        {actions ? (
          <div className="flex shrink-0 flex-wrap items-center gap-2">
            {actions}
          </div>
        ) : null}
      </div>

      <div
        aria-hidden="true"
        className="h-px w-full bg-gradient-to-r from-border via-border/60 to-transparent"
      />
    </header>
  );
}

/**
 * Matches AdminPageHeader's layout so a route's loading.jsx doesn't jump
 * when real content arrives. Pass the same shape of props you'll render
 * (withBack/withDescription/withBadge/withActions) so the skeleton's
 * proportions line up with what's coming.
 */
export function AdminPageHeaderSkeleton({
  withBack = false,
  withDescription = true,
  withBadge = false,
  withActions = true,
}) {
  return (
    <header className="mb-6 animate-pulse space-y-4" aria-hidden="true">
      {withBack && <div className="h-4 w-24 rounded bg-muted" />}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between sm:gap-6">
        <div className="min-w-0 flex-1 space-y-2">
          <div className="flex items-center gap-3">
            <div className="h-7 w-48 rounded bg-muted sm:h-8 sm:w-64" />
            {withBadge && <div className="h-5 w-16 rounded-full bg-muted" />}
          </div>
          {withDescription && (
            <div className="h-4 w-2/3 max-w-md rounded bg-muted" />
          )}
        </div>

        {withActions && (
          <div className="flex shrink-0 gap-2">
            <div className="h-8 w-20 rounded-md bg-muted" />
            <div className="h-8 w-24 rounded-md bg-muted" />
          </div>
        )}
      </div>

      <div className="h-px w-full bg-border" />
    </header>
  );
}
