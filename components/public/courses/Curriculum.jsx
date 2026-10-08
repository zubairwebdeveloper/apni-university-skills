// components/public/courses/Curriculum.jsx
"use client";
import { useState } from "react";
import { FiLock, FiPlayCircle } from "react-icons/fi";
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
import { formatDuration } from "@/lib/utils/format";

export function Curriculum({ sections, courseTitle }) {
  const [preview, setPreview] = useState(null);
  if (!sections.length)
    return (
      <p className="text-sm text-muted-foreground">
        The curriculum is being prepared.
      </p>
    );

  const lessonCount = sections.reduce((n, s) => n + s.lessons.length, 0);
  const minutes = sections.reduce((n, s) => n + s.duration, 0);

  return (
    <>
      <p className="mb-4 text-sm text-muted-foreground">
        {sections.length} sections · {lessonCount} lessons ·{" "}
        {formatDuration(minutes)}
      </p>
      <Accordion
        type="multiple"
        defaultValue={["s-0"]}
        className="rounded-xl border bg-card"
      >
        {sections.map((s, i) => (
          <AccordionItem
            key={`${s.order}-${s.title}`}
            value={`s-${i}`}
            className="px-4 last:border-b-0"
          >
            <AccordionTrigger className="gap-3 text-left hover:no-underline">
              <span className="flex-1 font-medium">{s.title}</span>
              <span className="text-xs font-normal text-muted-foreground">
                {s.lessons.length} lessons · {formatDuration(s.duration)}
              </span>
            </AccordionTrigger>
            <AccordionContent>
              <ul className="divide-y">
                {s.lessons.map((l) => (
                  <li
                    key={l.id}
                    className="flex items-center gap-3 py-2.5 text-sm"
                  >
                    {l.isPreview ? (
                      <FiPlayCircle
                        className="size-4 shrink-0 text-primary"
                        aria-hidden="true"
                      />
                    ) : (
                      <FiLock
                        className="size-4 shrink-0 text-muted-foreground"
                        aria-hidden="true"
                      />
                    )}
                    <span className="min-w-0 flex-1">
                      {l.title}
                      <span className="sr-only">
                        {l.isPreview
                          ? " (free preview)"
                          : " (locked until enrolled)"}
                      </span>
                    </span>
                    {l.isPreview && l.videoUrl && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setPreview(l)}
                      >
                        Preview
                      </Button>
                    )}
                    <span className="shrink-0 text-xs text-muted-foreground">
                      {formatDuration(l.duration)}
                    </span>
                  </li>
                ))}
              </ul>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>

      <Dialog
        open={!!preview}
        onOpenChange={(open) => !open && setPreview(null)}
      >
        <DialogContent className="sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>{preview?.title}</DialogTitle>
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

