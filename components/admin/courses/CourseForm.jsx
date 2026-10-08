// components/admin/courses/CourseForm.jsx
"use client";
import { useRouter } from "next/navigation";
import { useFieldArray, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { FiPlus, FiTrash2 } from "react-icons/fi";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { TextField } from "@/components/shared/TextField";
import {
  FormFooter,
  FormSection,
  LinesField,
  NumberField,
  SelectField,
  SwitchField,
  applyActionError,
} from "@/components/admin/forms/fields";
import { ImageField } from "@/components/admin/forms/ImageField";
import { LANGUAGES, LEVELS } from "@/config/courses";
import { SUPPORTED_CURRENCIES } from "@/config/currencies";
import { courseSchema } from "@/lib/validations/course";
import { createCourse, updateCourse } from "@/app/actions/admin/courses";

const defaults = (c) => ({
  title: c?.title ?? "",
  slug: c?.slug ?? "",
  shortDescription: c?.shortDescription ?? "",
  description: c?.description ?? "",
  categoryId: c?.categoryId ?? "",
  instructorId: c?.instructorId ?? "",
  thumbnail: c?.thumbnail ?? "",
  level: c?.level ?? "beginner",
  language: c?.language ?? "English",
  isFree: c?.isFree ?? false,
  price: c?.price ?? 0,
  salePrice: c?.salePrice ?? "",
  currency: c?.currency ?? "USD",
  duration: c?.duration ?? 0,
  featured: !!c?.featured,
  seoTitle: c?.seoTitle ?? "",
  seoDescription: c?.seoDescription ?? "",
  seoKeywords: (c?.seoKeywords ?? []).join("\n"),
  requirements: (c?.requirements ?? []).join("\n"),
  outcomes: (c?.outcomes ?? []).join("\n"),
  tags: (c?.tags ?? []).join("\n"),
  faqs: c?.faqs ?? [],
});
const label = (o) => ({
  value: o.id,
  label: o.status === "published" ? o.name : `${o.name} (${o.status})`,
});

export function CourseForm({ record = null, categories, instructors }) {
  const router = useRouter();
  const edit = !!record;
  const form = useForm({
    resolver: zodResolver(courseSchema),
    defaultValues: defaults(record),
  });
  const faqs = useFieldArray({ control: form.control, name: "faqs" });
  const isFree = useWatch({ control: form.control, name: "isFree" });

  async function onSubmit(values) {
    const res = edit
      ? await updateCourse({
          currentSlug: record.slug,
          ifUpdatedAt: record.updatedAt,
          values,
        })
      : await createCourse(values);
    if (!res.ok) return applyActionError(res, form, toast);
    toast.success(
      edit ? "Course updated successfully." : "Course created successfully.",
    );
    router.push(`/admin/courses/${res.data.slug}`);
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
        <TextField
          control={form.control}
          name="slug"
          label="Slug"
          autoComplete="off"
          description={
            edit
              ? "Changing the slug keeps the old URL working through a redirect."
              : "Leave blank to generate it from the title."
          }
        />
        <TextField
          control={form.control}
          name="shortDescription"
          label="Short description"
          component={Textarea}
          rows={2}
          description="10–200 characters. Shown on cards and in search results."
        />
        <TextField
          control={form.control}
          name="description"
          label="Description"
          component={Textarea}
          rows={8}
          description="Plain text. Separate paragraphs with a blank line."
        />
      </FormSection>

      <FormSection title="Classification">
        <div className="grid gap-5 sm:grid-cols-2">
          <SelectField
            control={form.control}
            name="categoryId"
            label="Category"
            placeholder="Choose a category"
            options={categories.map(label)}
            description="Must be published before the course can be."
          />
          <SelectField
            control={form.control}
            name="instructorId"
            label="Instructor"
            placeholder="Choose an instructor"
            options={instructors.map(label)}
            description="Must be published before the course can be."
          />
          <SelectField
            control={form.control}
            name="level"
            label="Level"
            options={LEVELS}
          />
          <SelectField
            control={form.control}
            name="language"
            label="Language"
            options={LANGUAGES.map((l) => ({ value: l, label: l }))}
          />
        </div>
        <LinesField
          control={form.control}
          name="tags"
          label="Tags"
          rows={3}
          description="One per line."
        />
      </FormSection>

      <FormSection title="Thumbnail">
        <ImageField
          control={form.control}
          name="thumbnail"
          label="Course thumbnail"
          kind="courses"
          description="16:9 works best. Required to publish."
        />
      </FormSection>

      <FormSection title="Pricing and duration">
        <SwitchField
          control={form.control}
          name="isFree"
          label="Free course"
          description="Students can enroll without paying."
        />
        <div className="grid gap-5 sm:grid-cols-3">
          <NumberField
            control={form.control}
            name="price"
            label="Price"
            disabled={isFree}
          />
          <NumberField
            control={form.control}
            name="salePrice"
            label="Sale price (optional)"
            disabled={isFree}
          />
          <SelectField
            control={form.control}
            name="currency"
            label="Currency"
            options={SUPPORTED_CURRENCIES.map((c) => ({ value: c, label: c }))}
          />
        </div>
        <NumberField
          control={form.control}
          name="duration"
          label="Duration (minutes)"
          step={1}
        />
      </FormSection>

      <FormSection title="Course content" description="One item per line.">
        <div className="grid gap-5 lg:grid-cols-2">
          <LinesField
            control={form.control}
            name="outcomes"
            label="What students will learn"
            rows={6}
          />
          <LinesField
            control={form.control}
            name="requirements"
            label="Requirements"
            rows={6}
          />
        </div>
        <div className="space-y-4">
          <p className="text-sm font-medium">Frequently asked questions</p>
          {faqs.fields.map((f, i) => (
            <div key={f.id} className="space-y-3 rounded-lg border p-4">
              <TextField
                control={form.control}
                name={`faqs.${i}.q`}
                label={`Question ${i + 1}`}
              />
              <TextField
                control={form.control}
                name={`faqs.${i}.a`}
                label="Answer"
                component={Textarea}
                rows={3}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => faqs.remove(i)}
              >
                <FiTrash2 aria-hidden="true" />
                Remove question {i + 1}
              </Button>
            </div>
          ))}
          {faqs.fields.length < 10 && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => faqs.append({ q: "", a: "" })}
            >
              <FiPlus aria-hidden="true" />
              Add question
            </Button>
          )}
        </div>
      </FormSection>

      <FormSection title="SEO">
        <TextField
          control={form.control}
          name="seoTitle"
          label="SEO title"
          description="Up to 70 characters. Defaults to the course title."
        />
        <TextField
          control={form.control}
          name="seoDescription"
          label="SEO description"
          component={Textarea}
          rows={2}
          description="Up to 160 characters. Defaults to the short description."
        />
        <LinesField
          control={form.control}
          name="seoKeywords"
          label="SEO keywords"
          rows={3}
          description="One per line, up to 10."
        />
      </FormSection>

      <FormSection title="Settings">
        <SwitchField
          control={form.control}
          name="featured"
          label="Featured"
          description="Shown first in the home page's featured courses."
        />
      </FormSection>
      <FormFooter
        submitting={form.formState.isSubmitting}
        cancelHref={edit ? `/admin/courses/${record.slug}` : "/admin/courses"}
        submitLabel={edit ? "Save changes" : "Create course"}
      />
    </form>
  );
}

