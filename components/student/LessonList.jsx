// components/student/LessonList.jsx
"use client";
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
  return (
    <Accordion type="multiple" defaultValue={[`s-${open}`]} className="w-full">
      {sections.map((s, i) => {
        const done = s.lessons.filter((l) => completed.includes(l.id)).length;
        return (
          <AccordionItem key={`${s.order}-${s.title}`} value={`s-${i}`}>
            <AccordionTrigger className="gap-2 text-left text-sm hover:no-underline">
              <span className="flex-1 font-medium">{s.title}</span>
              <span className="text-xs font-normal text-muted-foreground">
                {done}/{s.lessons.length}
              </span>
            </AccordionTrigger>
            <AccordionContent className="pb-2">
              <ul>
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
                          "flex items-start gap-2.5 rounded-md px-2 py-2 text-sm hover:bg-accent",
                          current && "bg-accent font-medium",
                        )}
                      >
                        <Icon
                          className={cn(
                            "mt-0.5 size-4 shrink-0",
                            isDone ? "text-primary" : "text-muted-foreground",
                          )}
                          aria-hidden="true"
                        />
                        <span className="min-w-0 flex-1">
                          {l.title}
                          {isDone && (
                            <span className="sr-only"> (completed)</span>
                          )}
                        </span>
                        <span className="shrink-0 text-xs text-muted-foreground">
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

