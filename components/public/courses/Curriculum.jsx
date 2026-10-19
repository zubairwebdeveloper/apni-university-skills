// components/public/courses/Curriculum.jsx
"use client";
import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import {
  BookOpen,
  ChevronsDownUp,
  ChevronsUpDown,
  Clock,
  Layers3,
  Lock,
  Play,
  PlayCircle,
} from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { VideoPlayer } from "@/components/shared/VideoPlayer";
import { cn } from "@/lib/utils";
import { formatDuration } from "@/lib/utils/format";

const plural = (n, one, many) => `${n} ${n === 1 ? one : many}`;

function Stat({ icon: Icon, children }) {
  return (
    <li className="flex items-center gap-1.5">
      <Icon className="size-4 text-primary" aria-hidden="true" />
      <span>{children}</span>
    </li>
  );
}

export function Curriculum({ sections, courseTitle }) {
  const reduce = useReducedMotion();
  const [preview, setPreview] = useState(null);
  const [openItems, setOpenItems] = useState(["s-0"]);

  if (!sections.length)
    return (
      <div className="flex items-center gap-3 rounded-xl border border-dashed bg-card p-5">
        <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-muted text-muted-foreground">
          <BookOpen className="size-5" aria-hidden="true" />
        </span>
        <div>
          <p className="text-sm font-medium text-foreground">
            The curriculum is being prepared.
          </p>
          <p className="text-sm text-muted-foreground">
            Sections and lessons will appear here once they are published.
          </p>
        </div>
      </div>
    );

  const lessonCount = sections.reduce((n, s) => n + s.lessons.length, 0);
  const minutes = sections.reduce((n, s) => n + s.duration, 0);
  const previewCount = sections.reduce(
    (n, s) => n + s.lessons.filter((l) => l.isPreview).length,
    0,
  );

  const allValues = sections.map((_, i) => `s-${i}`);
  const allOpen = openItems.length === allValues.length;

  return (
    <>
      <motion.div
        initial={reduce ? false : { opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="mb-4 flex flex-wrap items-center justify-between gap-3"
      >
        <ul className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-muted-foreground">
          <Stat icon={Layers3}>
            <span className="font-semibold text-foreground">
              {sections.length}
            </span>{" "}
            {sections.length === 1 ? "section" : "sections"}
          </Stat>
          <Stat icon={BookOpen}>
            <span className="font-semibold text-foreground">{lessonCount}</span>{" "}
            {lessonCount === 1 ? "lesson" : "lessons"}
          </Stat>
          <Stat icon={Clock}>
            <span className="font-semibold text-foreground">
              {formatDuration(minutes)}
            </span>{" "}
            total
          </Stat>
          {previewCount > 0 && (
            <Stat icon={PlayCircle}>
              <span className="font-semibold text-foreground">
                {previewCount}
              </span>{" "}
              free {previewCount === 1 ? "preview" : "previews"}
            </Stat>
          )}
        </ul>

        {sections.length > 1 && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setOpenItems(allOpen ? [] : allValues)}
          >
            {allOpen ? (
              <ChevronsDownUp className="size-4" aria-hidden="true" />
            ) : (
              <ChevronsUpDown className="size-4" aria-hidden="true" />
            )}
            {allOpen ? "Collapse all" : "Expand all"}
          </Button>
        )}
      </motion.div>

      <Accordion
        type="multiple"
        value={openItems}
        onValueChange={setOpenItems}
        className="overflow-hidden rounded-xl border bg-card"
      >
        {sections.map((s, i) => {
          const sectionPreviews = s.lessons.filter((l) => l.isPreview).length;

          return (
            <AccordionItem
              key={`${s.order}-${s.title}`}
              value={`s-${i}`}
              className="px-0 last:border-b-0"
            >
              <AccordionTrigger className="gap-3 px-4 py-4 text-left transition-colors hover:bg-muted/40 hover:no-underline data-[state=open]:bg-muted/30">
                <span className="flex min-w-0 flex-1 items-start gap-3">
                  <span className="mt-0.5 font-mono text-xs tabular-nums text-primary">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="min-w-0">
                    <span className="block font-medium leading-snug">
                      {s.title}
                    </span>
                    <span className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs font-normal text-muted-foreground">
                      <span>
                        {plural(s.lessons.length, "lesson", "lessons")}
                      </span>
                      <span>{formatDuration(s.duration)}</span>
                      {sectionPreviews > 0 && (
                        <span className="font-medium text-primary">
                          {plural(
                            sectionPreviews,
                            "free preview",
                            "free previews",
                          )}
                        </span>
                      )}
                    </span>
                  </span>
                </span>
              </AccordionTrigger>

              <AccordionContent className="px-4 pb-3">
                <ul className="divide-y divide-border/60">
                  {s.lessons.map((l) => (
                    <li
                      key={l.id}
                      className={cn(
                        "flex min-h-12 items-center gap-3 rounded-md px-2 py-2 text-sm transition-colors",
                        l.isPreview && "hover:bg-muted/50",
                      )}
                    >
                      <span
                        className={cn(
                          "grid size-8 shrink-0 place-items-center rounded-lg",
                          l.isPreview
                            ? "bg-primary/10 text-primary"
                            : "bg-muted text-muted-foreground",
                        )}
                      >
                        {l.isPreview ? (
                          <PlayCircle className="size-4" aria-hidden="true" />
                        ) : (
                          <Lock className="size-4" aria-hidden="true" />
                        )}
                      </span>

                      <span className="min-w-0 flex-1">
                        <span className="block leading-snug">{l.title}</span>
                        {l.isPreview ? (
                          <span className="text-xs font-medium text-primary">
                            Free preview
                          </span>
                        ) : (
                          <span className="sr-only">
                            {" "}
                            (locked until enrolled)
                          </span>
                        )}
                      </span>

                      {l.isPreview && l.videoUrl && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setPreview(l)}
                          aria-label={`Preview: ${l.title}`}
                        >
                          <Play className="size-3.5" aria-hidden="true" />
                          Preview
                        </Button>
                      )}

                      <span className="shrink-0 text-xs tabular-nums text-muted-foreground">
                        {formatDuration(l.duration)}
                      </span>
                    </li>
                  ))}
                </ul>
              </AccordionContent>
            </AccordionItem>
          );
        })}
      </Accordion>

      <Dialog
        open={!!preview}
        onOpenChange={(open) => !open && setPreview(null)}
      >
        <DialogContent className="sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle className="pr-6">{preview?.title}</DialogTitle>
            <DialogDescription>Free preview · {courseTitle}</DialogDescription>
          </DialogHeader>
          {preview && (
            <VideoPlayer url={preview.videoUrl} title={preview.title} />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
