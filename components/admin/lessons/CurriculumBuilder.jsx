// components/admin/lessons/CurriculumBuilder.jsx
"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { MotionConfig, Reorder, useDragControls } from "framer-motion";
import {
  FiAlertCircle,
  FiArrowDown,
  FiArrowUp,
  FiBookOpen,
  FiChevronDown,
  FiChevronRight,
  FiEdit2,
  FiEye,
  FiLoader,
  FiMenu,
  FiPlus,
  FiTrash2,
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
const minutesOf = (lessons) =>
  lessons.reduce((n, l) => n + (Number(l.duration) || 0), 0);

function LessonRow({
  lesson,
  index,
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
      whileDrag={{
        scale: 1.01,
        boxShadow: "0 10px 28px -10px rgb(0 0 0 / 0.35)",
      }}
      className="relative flex flex-wrap items-center gap-2 rounded-lg border bg-card p-2.5 motion-safe:transition-colors motion-safe:duration-150 hover:bg-muted/30"
    >
      {canEdit && (
        <button
          type="button"
          className="cursor-grab touch-none rounded-md p-1.5 text-muted-foreground outline-none hover:bg-accent hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/60 active:cursor-grabbing"
          aria-label={`Drag to reorder ${lesson.title}`}
          onPointerDown={(e) => controls.start(e)}
        >
          <FiMenu aria-hidden="true" />
        </button>
      )}
      <span
        aria-hidden="true"
        className="grid size-6 shrink-0 place-items-center rounded-md bg-muted text-xs font-medium tabular-nums text-muted-foreground"
      >
        {index + 1}
      </span>
      <div className="min-w-0 flex-1 basis-48">
        <p className="truncate text-sm font-medium leading-snug">
          {lesson.title}
        </p>
        <p className="text-xs tabular-nums text-muted-foreground">
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
  const [collapsed, setCollapsed] = useState(() => new Set());
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

  const toggleSection = (key) =>
    setCollapsed((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
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

  // Warn before closing or reloading the tab with an unsaved order.
  // (In-app link clicks are not intercepted by the browser event.)
  useEffect(() => {
    if (!dirty || saving) return undefined;
    const warn = (event) => {
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty, saving]);

  // Ctrl/Cmd+S saves the order when there is something to save.
  // The ref keeps the listener pointing at the latest state.
  const saveRef = useRef(null);
  saveRef.current = canEdit && dirty && !saving ? save : null;
  useEffect(() => {
    const onKey = (event) => {
      if (
        (event.metaKey || event.ctrlKey) &&
        event.key.toLowerCase() === "s" &&
        saveRef.current
      ) {
        event.preventDefault();
        saveRef.current();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  if (!sections.length && !trash.length)
    return (
      <Card className="items-center gap-4 p-10 text-center shadow-sm">
        <span
          aria-hidden="true"
          className="grid size-12 place-items-center rounded-full bg-muted text-muted-foreground"
        >
          <FiBookOpen className="size-5" />
        </span>
        <div className="space-y-1">
          <h2 className="text-lg font-semibold tracking-tight">
            No lessons yet
          </h2>
          <p className="text-sm text-muted-foreground">
            Add the first lesson to start building the curriculum.
          </p>
        </div>
        {perms.includes("lessons.create") && (
          <Link
            href={`/admin/lessons/create?course=${course.slug}`}
            className={buttonVariants()}
          >
            <FiPlus aria-hidden="true" />
            Add lesson
          </Link>
        )}
      </Card>
    );

  // Course-level read-out and a check for repeated section names
  const allLessons = sections.flatMap((s) => s.lessons);
  const totalMinutes = minutesOf(allLessons);
  const previewCount = allLessons.filter((l) => l.isPreview).length;
  const names = sections
    .map((s) => s.title.trim().toLowerCase())
    .filter(Boolean);
  const hasDuplicateNames = new Set(names).size !== names.length;
  const allCollapsed =
    sections.length > 0 && sections.every((s) => collapsed.has(s.key));

  return (
    <MotionConfig reducedMotion="user">
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-sm tabular-nums text-muted-foreground">
            <span className="font-medium text-foreground">
              {sections.length}
            </span>{" "}
            {sections.length === 1 ? "section" : "sections"}
            <span aria-hidden="true"> · </span>
            <span className="font-medium text-foreground">
              {allLessons.length}
            </span>{" "}
            {allLessons.length === 1 ? "lesson" : "lessons"}
            {totalMinutes > 0 && (
              <>
                <span aria-hidden="true"> · </span>
                {formatDuration(totalMinutes)}
              </>
            )}
            {previewCount > 0 && (
              <>
                <span aria-hidden="true"> · </span>
                {previewCount} free{" "}
                {previewCount === 1 ? "preview" : "previews"}
              </>
            )}
          </p>
          {sections.length > 1 && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() =>
                setCollapsed(
                  allCollapsed
                    ? new Set()
                    : new Set(sections.map((s) => s.key)),
                )
              }
            >
              {allCollapsed ? "Expand all" : "Collapse all"}
            </Button>
          )}
        </div>

        {canEdit && (
          <div
            className={cn(
              "flex flex-wrap items-center gap-3 rounded-lg border p-3 text-sm shadow-sm motion-safe:transition-colors motion-safe:duration-200",
              dirty ? "border-[#FACC15]/50 bg-[#FACC15]/5" : "bg-card",
            )}
            role="status"
          >
            <span
              aria-hidden="true"
              className={cn(
                "size-2 shrink-0 rounded-full",
                dirty ? "bg-[#FACC15]" : "bg-muted-foreground/40",
              )}
            />
            <p className="min-w-0 flex-1 basis-60 text-muted-foreground">
              {dirty
                ? "You have unsaved order changes. Lesson actions are hidden until you save or discard. Press Ctrl+S (Cmd+S on Mac) to save."
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
              aria-busy={saving}
              onClick={save}
            >
              {saving && (
                <FiLoader
                  className="motion-safe:animate-spin"
                  aria-hidden="true"
                />
              )}
              {saving ? "Saving…" : "Save order"}
            </Button>
          </div>
        )}

        {canEdit && hasDuplicateNames && (
          <p
            role="alert"
            className="flex items-start gap-2 rounded-lg border border-destructive/40 bg-destructive/5 px-3.5 py-2.5 text-sm font-medium text-destructive"
          >
            <FiAlertCircle
              className="mt-0.5 size-4 shrink-0"
              aria-hidden="true"
            />
            Two sections have the same name. Lessons in sections that share a
            name are grouped together, so give each section its own name.
          </p>
        )}

        {sections.map((s, si) => {
          const isCollapsed = collapsed.has(s.key);
          const sectionMinutes = minutesOf(s.lessons);
          return (
            <Card key={s.key} className="gap-4 p-4 shadow-sm sm:p-5">
              <div
                className={cn(
                  "flex flex-wrap items-center gap-2",
                  !isCollapsed && "border-b pb-4",
                )}
              >
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="size-8"
                  aria-expanded={!isCollapsed}
                  aria-label={`${isCollapsed ? "Expand" : "Collapse"} section ${s.title || si + 1}`}
                  onClick={() => toggleSection(s.key)}
                >
                  {isCollapsed ? (
                    <FiChevronRight aria-hidden="true" />
                  ) : (
                    <FiChevronDown aria-hidden="true" />
                  )}
                </Button>
                <span
                  aria-hidden="true"
                  className="grid size-7 shrink-0 place-items-center rounded-md bg-primary/10 text-xs font-semibold tabular-nums text-primary ring-1 ring-primary/15"
                >
                  {si + 1}
                </span>
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
                  <h2 className="min-w-0 flex-1 truncate text-base font-semibold tracking-tight">
                    {s.title}
                  </h2>
                )}
                <span className="text-xs tabular-nums text-muted-foreground">
                  {s.lessons.length}{" "}
                  {s.lessons.length === 1 ? "lesson" : "lessons"}
                  {sectionMinutes > 0 && (
                    <>
                      <span aria-hidden="true"> · </span>
                      {formatDuration(sectionMinutes)}
                    </>
                  )}
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
              {!isCollapsed && s.lessons.length === 0 && (
                <p className="rounded-lg border border-dashed bg-muted/30 px-4 py-5 text-center text-sm text-muted-foreground">
                  No lessons in this section. It is removed when you save.
                </p>
              )}
              {!isCollapsed && s.lessons.length > 0 && (
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
                      index={li}
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
              {!isCollapsed && perms.includes("lessons.create") && !dirty && (
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
          );
        })}

        {trash.length > 0 && !dirty && (
          <Card className="gap-3 p-4 shadow-sm sm:p-5">
            <div className="flex items-center gap-2 border-b pb-3">
              <FiTrash2
                className="size-4 text-muted-foreground"
                aria-hidden="true"
              />
              <h2 className="text-base font-semibold tracking-tight">Trash</h2>
              <span className="text-xs tabular-nums text-muted-foreground">
                ({trash.length})
              </span>
            </div>
            <ul className="space-y-2">
              {trash.map((l) => (
                <li
                  key={l.id}
                  className="flex items-center gap-3 rounded-lg border bg-muted/20 p-2.5 text-sm"
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
    </MotionConfig>
  );
}
