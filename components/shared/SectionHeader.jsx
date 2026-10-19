// components/shared/SectionHeader.jsx
"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function SectionHeader({
  id,
  eyebrow,
  title,
  description,
  href,
  hrefLabel = "View all",
  center = false,
}) {
  const reduce = useReducedMotion();

  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y: 14 }}
      whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        "mb-10 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between",
        center && "items-center text-center sm:flex-col sm:items-center",
      )}
    >
      <div className="max-w-2xl">
        {eyebrow && (
          <p className="mb-2.5 text-sm font-semibold uppercase tracking-wide text-primary">
            {eyebrow}
          </p>
        )}
        <h2
          id={id}
          className="text-balance font-serif text-3xl font-semibold leading-tight text-foreground sm:text-4xl"
        >
          {title}
        </h2>
        {description && (
          <p className="mt-3 text-pretty leading-relaxed text-muted-foreground">
            {description}
          </p>
        )}
      </div>
      {href && (
        <Link
          href={href}
          className={cn(
            buttonVariants({ variant: "outline" }),
            "group shrink-0 gap-1.5 hover:border-primary/40 hover:text-primary",
          )}
        >
          {hrefLabel}
          <ArrowRight
            aria-hidden="true"
            className="size-4 transition-transform duration-200 group-hover:translate-x-0.5"
          />
        </Link>
      )}
    </motion.div>
  );
}
