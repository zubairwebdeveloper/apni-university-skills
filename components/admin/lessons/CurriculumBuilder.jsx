// components/admin/lessons/CurriculumBuilder.jsx
"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Reorder, useDragControls } from "framer-motion";
import {
  FiArrowDown,
  FiArrowUp,
  FiEdit2,
  FiEye,
  FiMenu,
  FiPlus,
} from "react-icons/fi";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { VideoPlayer } from "@/components/shared/VideoPlayer";
import { RowActions } from "@/components/admin/table/RowActions";
import { lifecycleItems } from "@/components/admin/table/lifecycle";
import { formatDuration } from "@/lib/utils/format";
import { runLessonAction, saveCurriculum } from "@/app/actions/admin/lessons";
import { cn } from "@/lib/utils";

const swap = (a, i, j) => {
  const n = [...a];
  [n[i], n[j]] = [n[j], n[i]];
  return n;
};
const signature = (sections) =>
  JSON.stringify(sections.map((s) => [s.title, s.lessons.map((l) => l.id)]));

function LessonRow({
  lesson,
  courseSlug,
  perms,
  dirty,
  canEdit,
  first,
  last,
  otherSections,
  onUp,
  onDown,
  onMove,
  onPreview,
}) {
  const controls = useDragControls();
  const run = (a) => runLessonAction({ ...a, courseSlug });
  return (
    <Reorder.Item
      as="li"
      value={lesson}
      dragListener={false}
      dragControls={controls}
      className="flex flex-wrap items-center gap-2 rounded-lg border bg-card p-2"
    >
      {canEdit && (
        <button
          type="button"
          className="cursor-grab touch-none rounded p-1.5 text-muted-foreground hover:bg-accent active:cursor-grabbing"
          aria-label={`Drag to reorder ${lesson.title}`}
          onPointerDown={(e) => controls.start(e)}
        >
          <FiMenu aria-hidden="true" />
        </button>
      )}
      <div className="min-w-0 flex-1 basis-48">
        <p className="truncate text-sm font-medium">{lesson.title}</p>
        <p className="text-xs text-muted-foreground">
          {formatDuration(lesson.duration)}
        </p>
      </div>
      {lesson.isPreview && <Badge variant="secondary">Free preview</Badge>}
      <StatusBadge status={lesson.status} />
      {canEdit && (
        <>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-8"
            disabled={first}
            onClick={onUp}
            aria-label={`Move ${lesson.title} up`}
          >
            <FiArrowUp aria-hidden="true" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-8"
            disabled={last}
            onClick={onDown}
            aria-label={`Move ${lesson.title} down`}
          >
            <FiArrowDown aria-hidden="true" />
          </Button>
          {otherSections.length > 0 && (
            <Select value="" onValueChange={onMove}>
              <SelectTrigger
                className="h-8 w-36"
                aria-label={`Move ${lesson.title} to another section`}
              >
                <SelectValue placeholder="Move to…" />
              </SelectTrigger>
              <SelectContent>
                {otherSections.map((s) => (
                  <SelectItem key={s.key} value={s.key}>
                    {s.title || "Untitled section"}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </>
      )}
      {!dirty && (
        <RowActions
          label={lesson.title}
          items={[
            {
              key: "preview",
              label: "Preview",
              icon: FiEye,
              hidden: !lesson.videoUrl,
              run: async () => {
                onPreview(lesson);
                return { ok: true };
              },
              success: "",
            },
            {
              key: "edit",
              label: "Edit",
              icon: FiEdit2,
              href: `/admin/lessons/${lesson.slug}/edit?course=${courseSlug}`,
              hidden:
                !perms.includes("lessons.update") ||
                lesson.status === "deleted",
            },
            ...lifecycleItems({
              row: lesson,
              perms,
              prefix: "lessons",
              noun: "Lesson",
              run,
            }),
          ]}
        />
      )}
    </Reorder.Item>
  );
}

export function CurriculumBuilder({ course, initialSections, trash, perms }) {
  const router = useRouter();
  const canEdit = perms.includes("lessons.update");
  const [sections, setSections] = useState(initialSections);
  const [saving, setSaving] = useState(false);
  const [preview, setPreview] = useState(null);
  const dirty = signature(sections) !== signature(initialSections);

  const patch = (si, fn) =>
    setSections((all) => all.map((s, i) => (i === si ? fn(s) : s)));
  const moveLesson = (si, li, d) =>
    patch(si, (s) => ({ ...s, lessons: swap(s.lessons, li, li + d) }));
  const moveSection = (si, d) => setSections((all) => swap(all, si, si + d));
  const toSection = (si, li, targetKey) =>
    setSections((all) => {
      const lesson = all[si].lessons[li];
      return all.map((s, i) =>
        i === si
          ? { ...s, lessons: s.lessons.filter((_, k) => k !== li) }
          : s.key === targetKey
            ? { ...s, lessons: [...s.lessons, lesson] }
            : s,
      );
    });

  async function save() {
    const payload = sections
      .filter((s) => s.lessons.length)
      .map((s) => ({
        title: s.title.trim(),
        lessonIds: s.lessons.map((l) => l.id),
      }));
    if (payload.some((s) => !s.title))
      return toast.error("Every section needs a name.");
    setSaving(true);
    const res = await saveCurriculum({
      courseSlug: course.slug,
      sections: payload,
    });
    setSaving(false);
    if (!res.ok) return toast.error(res.error);
    toast.success("Lesson order saved successfully.");
    router.refresh();
  }

  if (!sections.length && !trash.length)
    return (
      <Card className="items-center gap-3 p-10 text-center">
        <h2 className="text-lg">No lessons yet</h2>
        <p className="text-sm text-muted-foreground">
          Add the first lesson to start building the curriculum.
        </p>
      </Card>
    );

  return (
    <div className="space-y-6">
      {canEdit && (
        <div
          className="flex flex-wrap items-center gap-2 rounded-lg border bg-card p-3 text-sm"
          role="status"
        >
          <p className="flex-1 text-muted-foreground">
            {dirty
              ? "You have unsaved order changes. Lesson actions are hidden until you save or discard."
              : "Drag the handle or use the arrows to reorder. Empty sections are removed when you save."}
          </p>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled={!dirty || saving}
            onClick={() => setSections(initialSections)}
          >
            Discard
          </Button>
          <Button
            type="button"
            size="sm"
            disabled={!dirty || saving}
            onClick={save}
          >
            {saving ? "Saving…" : "Save order"}
          </Button>
        </div>
      )}

      {sections.map((s, si) => (
        <Card key={s.key} className="gap-3 p-4">
          <div className="flex flex-wrap items-center gap-2">
            {canEdit ? (
              <Input
                value={s.title}
                onChange={(e) =>
                  patch(si, (x) => ({ ...x, title: e.target.value }))
                }
                maxLength={80}
                aria-label={`Section ${si + 1} name`}
                className="min-w-0 flex-1 basis-48 font-medium"
              />
            ) : (
              <h2 className="flex-1 text-base font-medium">{s.title}</h2>
            )}
            <span className="text-xs text-muted-foreground">
              {s.lessons.length} {s.lessons.length === 1 ? "lesson" : "lessons"}
            </span>
            {canEdit && (
              <>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="size-8"
                  disabled={si === 0}
                  onClick={() => moveSection(si, -1)}
                  aria-label={`Move section ${s.title} up`}
                >
                  <FiArrowUp aria-hidden="true" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="size-8"
                  disabled={si === sections.length - 1}
                  onClick={() => moveSection(si, 1)}
                  aria-label={`Move section ${s.title} down`}
                >
                  <FiArrowDown aria-hidden="true" />
                </Button>
              </>
            )}
          </div>
          {s.lessons.length > 0 && (
            <Reorder.Group
              as="ul"
              axis="y"
              values={s.lessons}
              onReorder={(v) => patch(si, (x) => ({ ...x, lessons: v }))}
              className="space-y-2"
            >
              {s.lessons.map((l, li) => (
                <LessonRow
                  key={l.id}
                  lesson={l}
                  courseSlug={course.slug}
                  perms={perms}
                  dirty={dirty}
                  canEdit={canEdit}
                  first={li === 0}
                  last={li === s.lessons.length - 1}
                  otherSections={sections.filter((o) => o.key !== s.key)}
                  onUp={() => moveLesson(si, li, -1)}
                  onDown={() => moveLesson(si, li, 1)}
                  onMove={(k) => toSection(si, li, k)}
                  onPreview={setPreview}
                />
              ))}
            </Reorder.Group>
          )}
          {perms.includes("lessons.create") && !dirty && (
            <Link
              href={`/admin/lessons/create?course=${course.slug}&section=${encodeURIComponent(s.title)}`}
              className={cn(
                buttonVariants({ variant: "ghost", size: "sm" }),
                "w-fit",
              )}
            >
              <FiPlus aria-hidden="true" />
              Add lesson to this section
            </Link>
          )}
        </Card>
      ))}

      {trash.length > 0 && !dirty && (
        <Card className="gap-3 p-4">
          <h2 className="text-base font-medium">Trash</h2>
          <ul className="space-y-2">
            {trash.map((l) => (
              <li
                key={l.id}
                className="flex items-center gap-3 rounded-lg border p-2 text-sm"
              >
                <span className="min-w-0 flex-1 truncate text-muted-foreground">
                  {l.title}
                </span>
                <RowActions
                  label={l.title}
                  items={lifecycleItems({
                    row: l,
                    perms,
                    prefix: "lessons",
                    noun: "Lesson",
                    run: (a) =>
                      runLessonAction({ ...a, courseSlug: course.slug }),
                  })}
                />
              </li>
            ))}
          </ul>
        </Card>
      )}

      <Dialog open={!!preview} onOpenChange={(o) => !o && setPreview(null)}>
        <DialogContent className="sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>{preview?.title}</DialogTitle>
            <DialogDescription>
              Admin preview of the video, regardless of publish state.
            </DialogDescription>
          </DialogHeader>
          {preview?.videoUrl && (
            <VideoPlayer url={preview.videoUrl} title={preview.title} />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

