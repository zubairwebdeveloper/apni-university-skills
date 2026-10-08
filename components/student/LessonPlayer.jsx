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
  FiExternalLink,
  FiList,
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

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
      <div className="min-w-0 space-y-5">
        {/* Video */}
        {lesson.videoUrl ? (
          <VideoPlayer url={lesson.videoUrl} title={lesson.title} />
        ) : (
          <div className="grid aspect-video place-items-center rounded-xl bg-muted text-sm text-muted-foreground">
            This lesson has no video.
          </div>
        )}

        {/* Lesson Header */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <p className="text-xs text-muted-foreground">
              {lesson.sectionTitle}
            </p>

            <h1 className="text-2xl sm:text-3xl">{lesson.title}</h1>
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
        <div className="flex items-center justify-between gap-3">
          {prev ? (
            <Link
              href={href(prev)}
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
            <Link href={href(next)} className={buttonVariants()}>
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
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>

            <TabsTrigger value="resources">
              Resources
              {lesson.resources.length > 0 && ` (${lesson.resources.length})`}
            </TabsTrigger>

            <TabsTrigger value="transcript">Transcript</TabsTrigger>

            <TabsTrigger value="notes">Notes</TabsTrigger>
          </TabsList>

          {/* Overview */}
          <TabsContent value="overview" className="pt-4">
            {lesson.description ? (
              <Paragraphs text={lesson.description} />
            ) : (
              <p className="text-sm text-muted-foreground">
                No description for this lesson.
              </p>
            )}
          </TabsContent>

          {/* Resources */}
          <TabsContent value="resources" className="pt-4">
            {lesson.resources.length > 0 ? (
              <ul className="space-y-2">
                {lesson.resources.map((resource) => (
                  <li key={resource.url}>
                    <a
                      href={resource.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-sm font-medium text-primary underline-offset-4 hover:underline"
                    >
                      {resource.title}

                      <FiExternalLink className="size-3.5" aria-hidden="true" />
                    </a>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">
                No resources for this lesson.
              </p>
            )}

            {/* Attachments */}
            {lesson.attachments?.length > 0 && (
              <ul className="mt-4 space-y-2 border-t pt-4">
                {lesson.attachments.map((attachment) => (
                  <li key={attachment.url}>
                    <a
                      href={attachment.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-sm font-medium text-primary underline-offset-4 hover:underline"
                    >
                      {attachment.name}

                      <span className="text-xs font-normal text-muted-foreground">
                        {Math.max(1, Math.round(attachment.size / 1024))} KB
                      </span>
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </TabsContent>

          {/* Transcript */}
          <TabsContent value="transcript" className="pt-4">
            {lesson.transcript ? (
              <Paragraphs text={lesson.transcript} />
            ) : (
              <p className="text-sm text-muted-foreground">
                No transcript for this lesson.
              </p>
            )}
          </TabsContent>

          {/* Notes */}
          <TabsContent value="notes" className="pt-4">
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
            <p className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
              Personal lesson notes are coming soon.
            </p>
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

