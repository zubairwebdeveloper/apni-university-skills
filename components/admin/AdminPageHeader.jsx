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
  - className    extra classes for the wrapper
*/
export function AdminPageHeader({
  title,
  description,
  actions,
  eyebrow,
  badge,
  back,
  className,
}) {
  return (
    <header
      className={cn(
        "mb-6 animate-in fade-in slide-in-from-bottom-1 space-y-4 duration-300 motion-reduce:animate-none",
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
