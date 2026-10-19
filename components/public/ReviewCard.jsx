// components/public/ReviewCard.jsx: denormalized studentName/courseTitle are stored on the review at creation
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
      className="h-full"
      initial={reduceMotion ? false : { opacity: 0, y: 16 }}
      whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
    >
      <Card className="group relative flex h-full flex-col gap-5 overflow-hidden border-border/60 p-6 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-lg focus-within:-translate-y-0.5 focus-within:border-primary/40 focus-within:shadow-lg">
        {/* Decorative quote mark, purely visual */}
        <Quote
          aria-hidden="true"
          className="pointer-events-none absolute -right-2 -top-2 size-20 text-primary/5 transition-colors duration-300 group-hover:text-primary/10"
          strokeWidth={1}
        />

        <div className="relative flex items-center justify-between gap-3">
          <Rating value={r.rating} count={1} />
        </div>

        {r.title && (
          <h3 className="relative font-serif text-lg font-semibold leading-snug text-foreground">
            {r.title}
          </h3>
        )}

        <blockquote className="relative line-clamp-5 text-sm leading-relaxed text-muted-foreground">
          {r.comment}
        </blockquote>

        <div className="relative mt-auto flex items-center gap-3 border-t border-border/60 pt-4">
          <Avatar className="size-9 ring-1 ring-border">
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
