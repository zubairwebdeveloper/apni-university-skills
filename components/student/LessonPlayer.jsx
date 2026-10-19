// components/student/LessonPlayer.jsx
// Lesson view for enrolled students

"use client";

import { useState, useTransition } from "react";

import Link from "next/link";
import { useRouter } from "next/navigation";

import {
  FiCheckCircle,
  FiChevronLeft,
  FiChevronRight,
  FiDownload,
  FiEdit3,
  FiExternalLink,
  FiList,
  FiVideoOff,
} from "react-icons/fi";
import { toast } from "sonner";

import { setLessonCompleted } from "@/app/actions/student";
import { Paragraphs } from "@/components/shared/Paragraphs";
import { VideoPlayer } from "@/components/shared/VideoPlayer";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

import { CourseProgress } from "./CourseProgress";
import { LessonList } from "./LessonList";

const formatSize = (bytes) => {
  if (!Number.isFinite(bytes)) return "";
  return bytes >= 1024 * 1024
    ? `${(bytes / 1024 / 1024).toFixed(1)} MB`
    : `${Math.max(1, Math.round(bytes / 1024))} KB`;
};

const LINK_ROW =
  "group flex items-center justify-between gap-3 rounded-lg border px-3.5 py-2.5 text-sm font-medium transition-colors hover:border-primary/40 hover:bg-primary/5 motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

function EmptyNote({ children }) {
  return <p className="text-sm text-muted-foreground">{children}</p>;
}

export function LessonPlayer({
  course,
  sections,
  lesson,
  prev,
  next,
  completed,
  percent,
}) {
  const router = useRouter();

  const [pending, start] = useTransition();
  const [sheetOpen, setSheetOpen] = useState(false);

  const isDone = completed.includes(lesson.id);

  const href = (l) => `/student/learning/${course.slug}?lesson=${l.slug}`;

  function toggle() {
    start(async () => {
      const res = await setLessonCompleted({
        courseSlug: course.slug,
        lessonSlug: lesson.slug,
        completed: !isDone,
      });

      if (!res.ok) {
        toast.error(res.error);
        return;
      }

      toast.success(
        res.courseCompleted
          ? "Course completed! Your certificate is ready."
          : !isDone
            ? "Lesson marked complete"
            : "Marked as not complete",
      );

      router.refresh();
    });
  }

  const curriculum = (
    <LessonList
      courseSlug={course.slug}
      sections={sections}
      currentId={lesson.id}
      completed={completed}
      onNavigate={() => setSheetOpen(false)}
    />
  );

  const hasResources = lesson.resources.length > 0;
  const hasAttachments = lesson.attachments?.length > 0;

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
      <div className="min-w-0 space-y-5">
        {/* Video */}
        {lesson.videoUrl ? (
          <VideoPlayer url={lesson.videoUrl} title={lesson.title} />
        ) : (
          <div className="grid aspect-video place-items-center rounded-xl bg-muted text-sm text-muted-foreground">
            <div className="flex flex-col items-center gap-2">
              <FiVideoOff className="size-6" aria-hidden="true" />
              This lesson has no video.
            </div>
          </div>
        )}

        {/* Lesson Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
          <div className="min-w-0">
            <p className="text-sm text-muted-foreground">
              {lesson.sectionTitle}
            </p>

            <h1 className="mt-1 text-balance font-serif text-2xl font-semibold leading-tight tracking-tight sm:text-3xl">
              {lesson.title}
            </h1>
          </div>

          <Button
            type="button"
            variant={isDone ? "secondary" : "default"}
            onClick={toggle}
            disabled={pending}
            aria-pressed={isDone}
            className="shrink-0"
          >
            <FiCheckCircle aria-hidden="true" />

            {pending ? "Saving…" : isDone ? "Completed" : "Mark as complete"}
          </Button>
        </div>

        {/* Lesson Navigation */}
        <div className="flex items-center justify-between gap-3 border-y py-3">
          {prev ? (
            <Link
              href={href(prev)}
              aria-label={`Previous lesson: ${prev.title}`}
              className={buttonVariants({
                variant: "outline",
              })}
            >
              <FiChevronLeft aria-hidden="true" />
              Previous
            </Link>
          ) : (
            <Button type="button" variant="outline" disabled>
              <FiChevronLeft aria-hidden="true" />
              Previous
            </Button>
          )}

          {/* Mobile Course Content */}
          <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
            <SheetTrigger
              className={cn(
                buttonVariants({
                  variant: "ghost",
                }),
                "lg:hidden",
              )}
            >
              <FiList aria-hidden="true" />
              Course content
            </SheetTrigger>

            <SheetContent side="right" className="w-[90vw] max-w-sm gap-0 p-0">
              <SheetHeader className="border-b p-4">
                <SheetTitle>Course content</SheetTitle>

                <SheetDescription className="line-clamp-1">
                  {course.title}
                </SheetDescription>
              </SheetHeader>

              <ScrollArea className="h-[calc(100dvh-5.5rem)] p-3">
                {curriculum}
              </ScrollArea>
            </SheetContent>
          </Sheet>

          {next ? (
            <Link
              href={href(next)}
              aria-label={`Next lesson: ${next.title}`}
              className={buttonVariants()}
            >
              Next
              <FiChevronRight aria-hidden="true" />
            </Link>
          ) : (
            <Button type="button" disabled>
              Next
              <FiChevronRight aria-hidden="true" />
            </Button>
          )}
        </div>

        {/* Lesson Information */}
        <Tabs defaultValue="overview">
          {/* Scrolls sideways on narrow screens instead of overflowing */}
          <div className="max-w-full overflow-x-auto">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>

              <TabsTrigger value="resources">
                Resources
                {lesson.resources.length > 0 && ` (${lesson.resources.length})`}
              </TabsTrigger>

              <TabsTrigger value="transcript">Transcript</TabsTrigger>

              <TabsTrigger value="notes">Notes</TabsTrigger>
            </TabsList>
          </div>

          {/* Overview */}
          <TabsContent value="overview" className="pt-5">
            {lesson.description ? (
              <Paragraphs text={lesson.description} />
            ) : (
              <EmptyNote>No description for this lesson.</EmptyNote>
            )}
          </TabsContent>

          {/* Resources */}
          <TabsContent value="resources" className="space-y-6 pt-5">
            {!hasResources && !hasAttachments && (
              <EmptyNote>No resources for this lesson.</EmptyNote>
            )}

            {hasResources && (
              <section aria-label="Links">
                <ul className="space-y-2">
                  {lesson.resources.map((resource) => (
                    <li key={resource.url}>
                      <a
                        href={resource.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={cn(LINK_ROW, "text-primary")}
                      >
                        <span className="min-w-0 truncate">
                          {resource.title}
                          <span className="sr-only"> (opens in a new tab)</span>
                        </span>

                        <FiExternalLink
                          className="size-4 shrink-0"
                          aria-hidden="true"
                        />
                      </a>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {/* Attachments */}
            {hasAttachments && (
              <section aria-label="Files">
                <ul className="space-y-2">
                  {lesson.attachments.map((attachment) => (
                    <li key={attachment.url}>
                      <a
                        href={attachment.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={cn(LINK_ROW, "text-primary")}
                      >
                        <span className="flex min-w-0 items-center gap-2">
                          <FiDownload
                            className="size-4 shrink-0"
                            aria-hidden="true"
                          />
                          <span className="truncate">
                            {attachment.name}
                            <span className="sr-only">
                              {" "}
                              (opens in a new tab)
                            </span>
                          </span>
                        </span>

                        <span className="shrink-0 text-xs font-normal tabular-nums text-muted-foreground">
                          {formatSize(attachment.size)}
                        </span>
                      </a>
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </TabsContent>

          {/* Transcript */}
          <TabsContent value="transcript" className="pt-5">
            {lesson.transcript ? (
              <Paragraphs text={lesson.transcript} />
            ) : (
              <EmptyNote>No transcript for this lesson.</EmptyNote>
            )}
          </TabsContent>

          {/* Notes */}
          <TabsContent value="notes" className="pt-5">
            {/* Placeholder.
                Planned storage:
                notes/{studentId}_{lessonId}
                {
                  studentId,
                  courseId,
                  lessonId,
                  text,
                  updatedAt
                }
                Written by a server action.
            */}
            <div className="flex items-center gap-3 rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
              <FiEdit3 className="size-4 shrink-0" aria-hidden="true" />
              Personal lesson notes are coming soon.
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Desktop Course Content */}
      <aside aria-label="Course content" className="hidden lg:block">
        <Card className="sticky top-24 gap-4 p-4">
          <CourseProgress value={percent} label="Course progress" />

          <ScrollArea className="h-[calc(100dvh-16rem)] pr-3">
            {curriculum}
          </ScrollArea>
        </Card>
      </aside>
    </div>
  );
}
