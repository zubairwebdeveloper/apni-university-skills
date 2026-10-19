// components/student/LessonList.jsx
"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { FiCheckCircle, FiCircle, FiPlayCircle } from "react-icons/fi";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { formatDuration } from "@/lib/utils/format";
import { cn } from "@/lib/utils";

export function LessonList({
  courseSlug,
  sections,
  currentId = null,
  completed = [],
  onNavigate,
}) {
  const open = Math.max(
    0,
    sections.findIndex((s) => s.lessons.some((l) => l.id === currentId)),
  );

  // Controlled so the section holding the current lesson opens when the
  // learner moves on to the next section. Sections they opened stay open.
  const [openItems, setOpenItems] = useState([`s-${open}`]);
  useEffect(() => {
    setOpenItems((prev) =>
      prev.includes(`s-${open}`) ? prev : [...prev, `s-${open}`],
    );
  }, [open]);

  return (
    <Accordion
      type="multiple"
      value={openItems}
      onValueChange={setOpenItems}
      className="w-full"
    >
      {sections.map((s, i) => {
        const done = s.lessons.filter((l) => completed.includes(l.id)).length;
        const sectionDone = s.lessons.length > 0 && done === s.lessons.length;
        return (
          <AccordionItem key={`${s.order}-${s.title}`} value={`s-${i}`}>
            <AccordionTrigger className="gap-2 text-left text-sm hover:no-underline">
              <span className="min-w-0 flex-1 font-medium leading-snug">
                {s.title}
              </span>
              <span
                className={cn(
                  "inline-flex shrink-0 items-center gap-1 text-xs font-normal tabular-nums",
                  sectionDone ? "text-primary" : "text-muted-foreground",
                )}
              >
                {sectionDone && (
                  <FiCheckCircle className="size-3.5" aria-hidden="true" />
                )}
                {done}/{s.lessons.length}
                <span className="sr-only"> lessons completed</span>
              </span>
            </AccordionTrigger>
            <AccordionContent className="pb-2">
              <ul className="space-y-0.5">
                {s.lessons.map((l) => {
                  const isDone = completed.includes(l.id);
                  const current = l.id === currentId;
                  const Icon = isDone
                    ? FiCheckCircle
                    : current
                      ? FiPlayCircle
                      : FiCircle;
                  return (
                    <li key={l.id}>
                      <Link
                        href={`/student/learning/${courseSlug}?lesson=${l.slug}`}
                        onClick={onNavigate}
                        aria-current={current ? "page" : undefined}
                        className={cn(
                          "relative flex items-start gap-2.5 rounded-md px-2.5 py-2 text-sm transition-colors hover:bg-accent motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                          current &&
                            "bg-accent font-medium before:absolute before:inset-y-1.5 before:left-0 before:w-0.5 before:rounded-full before:bg-primary",
                        )}
                      >
                        <Icon
                          className={cn(
                            "mt-0.5 size-4 shrink-0",
                            isDone || current
                              ? "text-primary"
                              : "text-muted-foreground",
                          )}
                          aria-hidden="true"
                        />
                        <span className="min-w-0 flex-1 leading-snug">
                          {l.title}
                          {isDone && (
                            <span className="sr-only"> (completed)</span>
                          )}
                        </span>
                        <span className="shrink-0 text-xs tabular-nums text-muted-foreground">
                          {formatDuration(l.duration)}
                        </span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </AccordionContent>
          </AccordionItem>
        );
      })}
    </Accordion>
  );
}
