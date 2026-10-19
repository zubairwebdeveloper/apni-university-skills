// components/public/TechnologyCard.jsx
"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { CategoryIcon } from "@/components/shared/CategoryIcon";

export function TechnologyCard({ technology: t }) {
  const reduce = useReducedMotion();

  return (
    <motion.div
      className="h-full"
      initial={reduce ? false : { opacity: 0, y: 16 }}
      whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
    >
      <Link
        href={`/technology/${t.slug}`}
        className="group block h-full rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      >
        <Card className="relative h-full gap-3 overflow-hidden border-border/60 p-6 transition-all duration-300 group-hover:-translate-y-0.5 group-hover:border-primary/40 group-hover:shadow-md">
          <div className="flex items-start justify-between">
            <span className="grid size-11 place-items-center rounded-lg bg-accent text-primary transition-transform duration-300 group-hover:scale-105">
              <CategoryIcon name={t.icon} className="size-5" />
            </span>
            <ArrowUpRight
              aria-hidden="true"
              className="size-4 -translate-x-1 translate-y-1 text-muted-foreground opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:translate-y-0 group-hover:text-primary group-hover:opacity-100"
            />
          </div>

          <h3 className="font-serif text-lg font-semibold leading-snug text-foreground">
            {t.title}
          </h3>

          <p className="line-clamp-3 text-sm leading-relaxed text-muted-foreground">
            {t.summary}
          </p>
        </Card>
      </Link>
    </motion.div>
  );
}
