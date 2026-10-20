"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Quote } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { Rating } from "@/components/shared/Rating";

export function ReviewCard({ review: r }) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      className="h-full w-full"
      initial={reduceMotion ? false : { opacity: 0, y: 16 }}
      whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
    >
      <Card className="group relative flex h-full w-full flex-col gap-4 overflow-hidden border-border/60 p-4 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-lg focus-within:-translate-y-0.5 focus-within:border-primary/40 focus-within:shadow-lg sm:gap-5 sm:p-6">
        {/* Decorative quote mark, purely visual */}
        <Quote
          aria-hidden="true"
          className="pointer-events-none absolute -right-2 -top-2 size-14 text-primary/5 transition-colors duration-300 group-hover:text-primary/10 sm:size-20"
          strokeWidth={1}
        />

        <div className="relative flex items-center justify-between gap-3">
          <Rating value={r.rating} count={1} />
        </div>

        {r.title && (
          <h3 className="relative font-serif text-base font-semibold leading-snug text-foreground sm:text-lg">
            {r.title}
          </h3>
        )}

        <blockquote className="relative line-clamp-4 text-sm leading-relaxed text-muted-foreground sm:line-clamp-5">
          {r.comment}
        </blockquote>

        <div className="relative mt-auto flex items-center gap-3 border-t border-border/60 pt-3 sm:pt-4">
          <Avatar className="size-8 shrink-0 ring-1 ring-border sm:size-9">
            <AvatarImage src={r.studentPhotoURL} alt="" />
            <AvatarFallback className="text-xs font-medium">
              {r.studentName?.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 text-sm">
            <p className="truncate font-medium text-foreground">
              {r.studentName}
            </p>
            {r.courseTitle && (
              <p className="truncate text-xs text-muted-foreground">
                {r.courseTitle}
              </p>
            )}
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
