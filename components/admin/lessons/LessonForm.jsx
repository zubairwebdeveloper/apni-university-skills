// components/admin/lessons/LessonForm.jsx
"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion, useReducedMotion } from "framer-motion";
import {
  FiAlertCircle,
  FiLink,
  FiLoader,
  FiPaperclip,
  FiPlus,
  FiTrash2,
  FiUploadCloud,
} from "react-icons/fi";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { TextField } from "@/components/shared/TextField";
import {
  FormFooter,
  FormSection,
  NumberField,
  SwitchField,
  applyActionError,
} from "@/components/admin/forms/fields";
import { lessonSchema } from "@/lib/validations/lesson";
import { createLesson, updateLesson } from "@/app/actions/admin/lessons";

const MAX_ITEMS = 10;
const MAX_ATTACHMENT_BYTES = 4 * 1024 * 1024;

const defaults = (l, section) => ({
  title: l?.title ?? "",
  slug: l?.slug ?? "",
  description: l?.description ?? "",
  videoUrl: l?.videoUrl ?? "",
  duration: l?.duration ?? 0,
  sectionTitle: l?.sectionTitle ?? section ?? "",
  isPreview: !!l?.isPreview,
  transcript: l?.transcript ?? "",
  resources: l?.resources ?? [],
  attachments: l?.attachments ?? [],
});

// Tells the editor how a video link will be played, before they save
function videoNote(url) {
  const value = url?.trim();
  if (!value) return null;
  try {
    const u = new URL(value);
    if (u.protocol !== "https:")
      return { warn: true, text: "Links must use https." };
    const host = u.hostname.replace(/^www\./, "");
    if (["youtube.com", "m.youtube.com", "youtu.be"].includes(host))
      return { text: "YouTube link: it will be embedded." };
    if (["vimeo.com", "player.vimeo.com"].includes(host))
      return { text: "Vimeo link: it will be embedded." };
    return {
      text: `Other https link (${host}): it plays in the browser's video player.`,
    };
  } catch {
    return { warn: true, text: "This doesn't look like a valid link." };
  }
}

function durationText(minutes) {
  const total = Number(minutes);
  if (!Number.isFinite(total) || total <= 0) return null;
  const h = Math.floor(total / 60);
  const m = Math.round(total % 60);
  if (h === 0) return `${m} min`;
  return m === 0 ? `${h} h` : `${h} h ${m} min`;
}

function formatSize(bytes) {
  return bytes >= 1024 * 1024
    ? `${(bytes / (1024 * 1024)).toFixed(1)} MB`
    : `${Math.max(1, Math.round(bytes / 1024))} KB`;
}

// Staggered fade-and-slide entrance; fully off under prefers-reduced-motion.
// Delay is capped so sections far down the page never wait.
function Reveal({ index = 0, children }) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.4,
        delay: reduce ? 0 : Math.min(index, 4) * 0.06,
        ease: [0.22, 1, 0.36, 1],
      }}
    >
      {children}
    </motion.div>
  );
}

function EmptyList({ icon: Icon, title, text }) {
  return (
    <div className="flex min-h-24 flex-col items-center justify-center gap-1.5 rounded-lg border border-dashed bg-muted/30 px-4 py-5 text-center">
      <span
        aria-hidden="true"
        className="grid size-9 place-items-center rounded-full bg-muted text-muted-foreground"
      >
        <Icon className="size-4" />
      </span>
      <p className="text-sm font-medium">{title}</p>
      <p className="text-xs text-muted-foreground">{text}</p>
    </div>
  );
}

export function LessonForm({
  course,
  record = null,
  sectionTitles = [],
  defaultSection = "",
}) {
  const router = useRouter();
  const edit = !!record;
  const input = useRef(null);
  const [uploading, setUploading] = useState(false);
  const form = useForm({
    resolver: zodResolver(lessonSchema),
    defaultValues: defaults(record, defaultSection),
  });
  const resources = useFieldArray({ control: form.control, name: "resources" });
  const attachments = useFieldArray({
    control: form.control,
    name: "attachments",
  });
  const back = `/admin/lessons?course=${course.slug}`;

  async function upload(e) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    // Quick check in the browser; the server still validates everything
    if (file.size > MAX_ATTACHMENT_BYTES)
      return toast.error("File must be under 4 MB.");
    setUploading(true);
    try {
      const fd = new FormData();
      fd.set("file", file);
      fd.set("course", course.slug);
      const res = await fetch("/api/admin/lesson-attachments", {
        method: "POST",
        body: fd,
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok)
        return toast.error(json.error ?? "Upload failed. Please try again.");
      attachments.append(json.attachment);
    } catch {
      toast.error("Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  }

  async function onSubmit(values) {
    const res = edit
      ? await updateLesson({
          courseSlug: course.slug,
          currentSlug: record.slug,
          ifUpdatedAt: record.updatedAt,
          values,
        })
      : await createLesson({ courseSlug: course.slug, values });
    if (!res.ok) return applyActionError(res, form, toast);
    toast.success(
      edit ? "Lesson updated successfully." : "Lesson created successfully.",
    );
    router.push(back);
    router.refresh();
  }

  const { isDirty, isSubmitting, isSubmitSuccessful } = form.formState;

  // Warn before closing or reloading the tab with unsaved edits.
  // (In-app link clicks are not intercepted by the browser event.)
  useEffect(() => {
    if (!isDirty || isSubmitting || isSubmitSuccessful) return undefined;
    const warn = (event) => {
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [isDirty, isSubmitting, isSubmitSuccessful]);

  // Ctrl/Cmd+S saves (not while a file is uploading). The ref keeps the listener
  // pointing at the latest handler and upload state.
  const submitRef = useRef(null);
  submitRef.current = uploading ? null : form.handleSubmit(onSubmit);
  useEffect(() => {
    const onKey = (event) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "s") {
        event.preventDefault();
        submitRef.current?.();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const video = videoNote(form.watch("videoUrl"));
  const length = durationText(form.watch("duration"));
  const transcript = form.watch("transcript");
  const transcriptWords = (transcript ?? "")
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;

  return (
    <form
      onSubmit={form.handleSubmit(onSubmit)}
      noValidate
      className="space-y-6"
    >
      <Reveal index={0}>
        <FormSection
          title="Basics"
          description="The lesson's title, where it sits in the curriculum and what it covers."
        >
          <TextField
            control={form.control}
            name="title"
            label="Title"
            autoComplete="off"
          />
          <div className="grid gap-5 sm:grid-cols-2">
            <TextField
              control={form.control}
              name="sectionTitle"
              label="Section"
              list="section-options"
              autoComplete="off"
              description="Pick an existing section or type a new name."
            />
            <TextField
              control={form.control}
              name="slug"
              label="Slug"
              autoComplete="off"
              description="Unique within this course. Leave blank to generate it from the title."
            />
          </div>
          <datalist id="section-options">
            {sectionTitles.map((s) => (
              <option key={s} value={s} />
            ))}
          </datalist>
          <TextField
            control={form.control}
            name="description"
            label="Description"
            component={Textarea}
            rows={4}
            description="Plain text, shown on the lesson page."
          />
        </FormSection>
      </Reveal>

      <Reveal index={1}>
        <FormSection
          title="Video"
          description="Links must be https. YouTube and Vimeo embed. Other https links play in the browser's video player."
        >
          <TextField
            control={form.control}
            name="videoUrl"
            label="Video link"
            type="url"
            description={
              video ? (
                <span
                  className={
                    video.warn
                      ? "inline-flex items-start gap-1.5 font-medium text-destructive"
                      : undefined
                  }
                >
                  {video.warn && (
                    <FiAlertCircle
                      className="mt-0.5 size-3.5 shrink-0"
                      aria-hidden="true"
                    />
                  )}
                  {video.text}
                </span>
              ) : undefined
            }
          />
          <NumberField
            control={form.control}
            name="duration"
            label="Duration (minutes)"
            step={1}
            description={length ? `That is ${length}.` : undefined}
          />
          <SwitchField
            control={form.control}
            name="isPreview"
            label="Free preview"
            description="Anyone can watch this lesson without enrolling. Its video link becomes public."
          />
        </FormSection>
      </Reveal>

      <Reveal index={2}>
        <FormSection
          title="Resources"
          description={`External links students can open from the lesson. ${resources.fields.length} of ${MAX_ITEMS} used.`}
        >
          {resources.fields.length === 0 && (
            <EmptyList
              icon={FiLink}
              title="No resources yet"
              text="Add helpful links such as docs, articles or source code."
            />
          )}
          {resources.fields.map((f, i) => (
            <div
              key={f.id}
              className="grid gap-3 rounded-lg border bg-muted/20 p-4 sm:grid-cols-[1fr_1.5fr_auto] sm:items-end"
            >
              <TextField
                control={form.control}
                name={`resources.${i}.title`}
                label="Title"
              />
              <TextField
                control={form.control}
                name={`resources.${i}.url`}
                label="Link"
                type="url"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="text-destructive hover:text-destructive"
                onClick={() => resources.remove(i)}
              >
                <FiTrash2 aria-hidden="true" />
                <span className="sr-only">Remove resource {i + 1}</span>
                <span aria-hidden="true">Remove</span>
              </Button>
            </div>
          ))}
          {resources.fields.length < MAX_ITEMS && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="w-fit"
              onClick={() => resources.append({ title: "", url: "" })}
            >
              <FiPlus aria-hidden="true" />
              Add resource
            </Button>
          )}
        </FormSection>
      </Reveal>

      <Reveal index={3}>
        <FormSection
          title="Attachments"
          description={`Files are stored privately. Only enrolled students get a short-lived download link. PDF, ZIP, DOCX, PPTX, XLSX, PNG, JPG or TXT, up to 4 MB. ${attachments.fields.length} of ${MAX_ITEMS} used.`}
        >
          {attachments.fields.length === 0 && (
            <EmptyList
              icon={FiPaperclip}
              title="No attachments yet"
              text="Upload slides, exercise files or other downloads."
            />
          )}
          {attachments.fields.length > 0 && (
            <ul className="divide-y rounded-lg border bg-muted/10">
              {attachments.fields.map((a, i) => (
                <li key={a.id} className="flex items-center gap-3 p-3 text-sm">
                  <span
                    aria-hidden="true"
                    className="grid size-8 shrink-0 place-items-center rounded-lg bg-muted text-muted-foreground"
                  >
                    <FiPaperclip className="size-4" />
                  </span>
                  <span className="min-w-0 flex-1 truncate font-medium">
                    {a.name}
                  </span>
                  <span className="shrink-0 text-xs tabular-nums text-muted-foreground">
                    {formatSize(a.size)}
                  </span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="text-destructive hover:text-destructive"
                    onClick={() => attachments.remove(i)}
                  >
                    Remove<span className="sr-only"> {a.name}</span>
                  </Button>
                </li>
              ))}
            </ul>
          )}
          {attachments.fields.length < MAX_ITEMS && (
            <>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="w-fit"
                disabled={uploading}
                aria-busy={uploading}
                onClick={() => input.current?.click()}
              >
                {uploading ? (
                  <FiLoader
                    className="motion-safe:animate-spin"
                    aria-hidden="true"
                  />
                ) : (
                  <FiUploadCloud aria-hidden="true" />
                )}
                {uploading ? "Uploading…" : "Upload file"}
              </Button>
              <input
                ref={input}
                type="file"
                className="hidden"
                accept=".pdf,.zip,.docx,.pptx,.xlsx,.png,.jpg,.jpeg,.txt"
                aria-label="Choose an attachment"
                onChange={upload}
              />
            </>
          )}
          <span role="status" className="sr-only">
            {uploading ? "Uploading file" : ""}
          </span>
          {isDirty && attachments.fields.length > 0 && (
            <p className="flex items-center gap-2 text-xs text-muted-foreground">
              <span
                aria-hidden="true"
                className="size-1.5 shrink-0 rounded-full bg-[#FACC15]"
              />
              Uploaded files are attached to this lesson only once you save.
            </p>
          )}
        </FormSection>
      </Reveal>

      <Reveal index={4}>
        <FormSection
          title="Transcript (optional)"
          description="A text version of the lesson for reading and search."
        >
          <TextField
            control={form.control}
            name="transcript"
            label="Transcript"
            component={Textarea}
            rows={8}
            description={
              <>
                Plain text. Separate paragraphs with a blank line.
                {transcriptWords > 0 && (
                  <span className="ml-1 tabular-nums">
                    ({transcriptWords.toLocaleString()} words)
                  </span>
                )}
              </>
            }
          />
        </FormSection>
      </Reveal>

      <FormFooter
        submitting={form.formState.isSubmitting || uploading}
        dirty={isDirty}
        cancelHref={back}
        submitLabel={edit ? "Save changes" : "Create lesson"}
      />
    </form>
  );
}
