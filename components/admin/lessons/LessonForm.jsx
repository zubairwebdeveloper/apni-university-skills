// components/admin/lessons/LessonForm.jsx
"use client";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { FiPaperclip, FiPlus, FiTrash2 } from "react-icons/fi";
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

  return (
    <form
      onSubmit={form.handleSubmit(onSubmit)}
      noValidate
      className="space-y-6"
    >
      <FormSection title="Basics">
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

      <FormSection
        title="Video"
        description="Links must be https. YouTube and Vimeo embed. Other https links play in the browser's video player."
      >
        <TextField
          control={form.control}
          name="videoUrl"
          label="Video link"
          type="url"
        />
        <NumberField
          control={form.control}
          name="duration"
          label="Duration (minutes)"
          step={1}
        />
        <SwitchField
          control={form.control}
          name="isPreview"
          label="Free preview"
          description="Anyone can watch this lesson without enrolling. Its video link becomes public."
        />
      </FormSection>

      <FormSection
        title="Resources"
        description="External links students can open from the lesson."
      >
        {resources.fields.map((f, i) => (
          <div
            key={f.id}
            className="grid gap-3 rounded-lg border p-4 sm:grid-cols-[1fr_1.5fr_auto] sm:items-end"
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
              onClick={() => resources.remove(i)}
            >
              <FiTrash2 aria-hidden="true" />
              Remove resource {i + 1}
            </Button>
          </div>
        ))}
        {resources.fields.length < 10 && (
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

      <FormSection
        title="Attachments"
        description="Files are stored privately. Only enrolled students get a short-lived download link. PDF, ZIP, DOCX, PPTX, XLSX, PNG, JPG or TXT, up to 4 MB."
      >
        {attachments.fields.length > 0 && (
          <ul className="divide-y rounded-lg border">
            {attachments.fields.map((a, i) => (
              <li key={a.id} className="flex items-center gap-3 p-3 text-sm">
                <FiPaperclip
                  className="size-4 shrink-0 text-muted-foreground"
                  aria-hidden="true"
                />
                <span className="min-w-0 flex-1 truncate">{a.name}</span>
                <span className="shrink-0 text-xs text-muted-foreground">
                  {Math.max(1, Math.round(a.size / 1024))} KB
                </span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => attachments.remove(i)}
                >
                  Remove<span className="sr-only"> {a.name}</span>
                </Button>
              </li>
            ))}
          </ul>
        )}
        {attachments.fields.length < 10 && (
          <>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="w-fit"
              disabled={uploading}
              onClick={() => input.current?.click()}
            >
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
      </FormSection>

      <FormSection title="Transcript (optional)">
        <TextField
          control={form.control}
          name="transcript"
          label="Transcript"
          component={Textarea}
          rows={8}
          description="Plain text. Separate paragraphs with a blank line."
        />
      </FormSection>

      <FormFooter
        submitting={form.formState.isSubmitting || uploading}
        cancelHref={back}
        submitLabel={edit ? "Save changes" : "Create lesson"}
      />
    </form>
  );
}

