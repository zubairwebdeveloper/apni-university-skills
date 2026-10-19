"use client";

import { memo } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Sparkles } from "lucide-react";

import { Container } from "./Container";
import { PageBreadcrumbs } from "./PageBreadcrumbs";
import { cn } from "@/lib/utils";

/* -------------------------------------------------------
   Motion presets
------------------------------------------------------- */

const headingVariants = {
  hidden: {
    opacity: 0,
    y: 12,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.45,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

const contentVariants = {
  hidden: {
    opacity: 0,
    y: 8,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      delay: 0.08,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

/* -------------------------------------------------------
   Page heading
------------------------------------------------------- */

export const PageHeader = memo(function PageHeader({
  id = "page-title",
  title,
  description,
  breadcrumbs,
  eyebrow,
  children,
  actions,
  className,
  contentClassName,
  titleClassName,
  descriptionClassName,
  centered = false,
  showAccent = true,
  showDivider = true,
  animate = true,
  compact = false,
}) {
  const reduce = useReducedMotion();
  const shouldAnimate = animate && !reduce;

  return (
    <header
      aria-labelledby={id}
      className={cn(
        "relative isolate overflow-hidden",
        "border-b border-border/70",
        "bg-secondary/30",
        className,
      )}
    >
      {/* Subtle decorative brand details */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
      >
        <div
          className={cn(
            "absolute -right-20 -top-24 size-64 rounded-full",
            "border border-purple-500/[0.08]",
          )}
        />

        <div
          className={cn(
            "absolute -right-8 -top-12 size-40 rounded-full",
            "border border-yellow-500/[0.12]",
          )}
        />

        <div
          className={cn(
            "absolute right-[12%] top-10 size-2 rounded-full",
            "bg-yellow-400/70",
          )}
        />

        <div
          className={cn(
            "absolute bottom-8 right-[7%] size-1.5 rounded-full",
            "bg-purple-500/50",
          )}
        />
      </div>

      <Container
        className={cn(
          "relative",
          compact ? "py-6 sm:py-8" : "py-8 sm:py-12 lg:py-14",
          contentClassName,
        )}
      >
        {/* Breadcrumb navigation */}
        {breadcrumbs?.length > 0 && (
          <div
            className={cn(
              "mb-5 min-w-0 sm:mb-6",
              centered && "flex justify-center",
            )}
          >
            <PageBreadcrumbs items={breadcrumbs} />
          </div>
        )}

        <div
          className={cn(
            "flex flex-col gap-5",
            centered && "items-center text-center",
            !centered && "sm:flex-row sm:items-end sm:justify-between",
          )}
        >
          {/* Heading content */}
          <motion.div
            initial={shouldAnimate ? "hidden" : false}
            animate={shouldAnimate ? "visible" : undefined}
            variants={headingVariants}
            className={cn("min-w-0 flex-1", centered && "mx-auto max-w-3xl")}
          >
            {/* Eyebrow label */}
            {eyebrow && (
              <div
                className={cn(
                  "mb-3 inline-flex max-w-full items-center gap-2",
                  "rounded-full border border-purple-500/15",
                  "bg-purple-500/[0.06] px-3 py-1.5",
                  "text-xs font-semibold tracking-wide",
                  "text-purple-700 dark:text-purple-300",
                )}
              >
                <Sparkles
                  aria-hidden="true"
                  className="size-3.5 shrink-0 text-purple-500"
                />

                <span className="truncate">{eyebrow}</span>

                <span
                  aria-hidden="true"
                  className="size-1.5 shrink-0 rounded-full bg-yellow-400"
                />
              </div>
            )}

            {/* Main title */}
            <h1
              id={id}
              className={cn(
                "text-balance font-bold tracking-tight text-foreground",
                "text-3xl leading-tight",
                "sm:text-4xl sm:leading-[1.12]",
                "lg:text-5xl lg:leading-[1.08]",
                compact && "sm:text-3xl lg:text-4xl",
                centered && "mx-auto",
                titleClassName,
              )}
            >
              {title}
            </h1>

            {/* Description */}
            {description && (
              <p
                className={cn(
                  "mt-3 max-w-2xl text-pretty",
                  "text-sm leading-7 text-muted-foreground",
                  "sm:mt-4 sm:text-base sm:leading-7",
                  centered && "mx-auto",
                  descriptionClassName,
                )}
              >
                {description}
              </p>
            )}

            {/* Optional additional content */}
            {children && (
              <motion.div
                initial={shouldAnimate ? "hidden" : false}
                animate={shouldAnimate ? "visible" : undefined}
                variants={contentVariants}
                className={cn(
                  "mt-5 min-w-0",
                  centered && "flex flex-col items-center",
                )}
              >
                {children}
              </motion.div>
            )}
          </motion.div>

          {/* Optional action buttons or controls */}
          {actions && (
            <motion.div
              initial={shouldAnimate ? "hidden" : false}
              animate={shouldAnimate ? "visible" : undefined}
              variants={contentVariants}
              className={cn(
                "flex shrink-0 flex-wrap items-center gap-2",
                centered && "justify-center",
                !centered && "sm:justify-end",
              )}
            >
              {actions}
            </motion.div>
          )}
        </div>

        {/* Brand divider */}
        {showDivider && showAccent && (
          <div
            aria-hidden="true"
            className={cn(
              "mt-7 flex h-1 w-16 overflow-hidden rounded-full",
              "sm:mt-8",
              centered && "mx-auto",
            )}
          >
            <span className="w-2/3 bg-purple-500" />
            <span className="w-1/3 bg-yellow-400" />
          </div>
        )}
      </Container>
    </header>
  );
});
