// components/admin/courses/CourseForm.jsx
"use client";
import { useRouter } from "next/navigation";
import { useFieldArray, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion, useReducedMotion } from "framer-motion";
import { FiHelpCircle, FiPlus, FiTrash2 } from "react-icons/fi";
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
import { CourseMediaPreview } from "@/components/admin/courses/CourseMediaPreview";
import { LANGUAGES, LEVELS } from "@/config/courses";
import { SUPPORTED_CURRENCIES } from "@/config/currencies";
import { courseSchema } from "@/lib/validations/course";
import { createCourse, updateCourse } from "@/app/actions/admin/courses";

const MAX_FAQS = 10;

const defaults = (c) => ({
  title: c?.title ?? "",
  slug: c?.slug ?? "",
  shortDescription: c?.shortDescription ?? "",
  description: c?.description ?? "",
  categoryId: c?.categoryId ?? "",
  instructorId: c?.instructorId ?? "",
  thumbnail: c?.thumbnail ?? "",
  videoId: c?.videoId ?? "",
  videoThumbnail: c?.videoThumbnail ?? "",
  externalUrl: c?.externalUrl ?? "",
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

// Read-only hint derived from the typed price and sale price
function SaleHint({ control }) {
  const [isFree, price, sale] = useWatch({
    control,
    name: ["isFree", "price", "salePrice"],
  });
  const p = Number(price);
  const s = Number(sale);
  if (
    isFree ||
    sale === "" ||
    !Number.isFinite(p) ||
    !Number.isFinite(s) ||
    p <= 0 ||
    s <= 0 ||
    s >= p
  )
    return null;
  const pct = Math.round((1 - s / p) * 100);
  return (
    <p
      role="status"
      className="flex items-center gap-2 rounded-lg border bg-muted/40 px-3.5 py-2.5 text-sm"
    >
      <span
        aria-hidden="true"
        className="h-4 w-1 shrink-0 rounded-full bg-[#FACC15]"
      />
      <span className="text-muted-foreground">
        The sale price is{" "}
        <span className="font-semibold tabular-nums text-foreground">
          {pct}%
        </span>{" "}
        below the regular price.
      </span>
    </p>
  );
}

export function CourseForm({ record = null, categories, instructors }) {
  const router = useRouter();
  const edit = !!record;
  const form = useForm({
    resolver: zodResolver(courseSchema),
    defaultValues: defaults(record),
  });
  const faqs = useFieldArray({ control: form.control, name: "faqs" });
  const isFree = useWatch({ control: form.control, name: "isFree" });
  const media = useWatch({
    control: form.control,
    name: ["videoId", "videoThumbnail", "externalUrl"],
  });

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
      <Reveal index={0}>
        <FormSection
          title="Basics"
          description="The title, URL and descriptions students see first."
        >
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
      </Reveal>

      <Reveal index={1}>
        <FormSection
          title="Classification"
          description="Where the course belongs and who teaches it."
        >
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
      </Reveal>

      <Reveal index={2}>
        <FormSection
          title="Thumbnail"
          description="The image shown on course cards and listings."
        >
          <ImageField
            control={form.control}
            name="thumbnail"
            label="Course thumbnail (optional)"
            kind="courses"
            description="16:9 works best. You can add it later."
          />
        </FormSection>
      </Reveal>

      <Reveal index={3}>
        <FormSection
          title="Video and links"
          description="Add a YouTube video and an optional online link for this course."
        >
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="min-w-0 space-y-5">
              <TextField
                control={form.control}
                name="videoId"
                label="YouTube video link or ID"
                autoComplete="off"
                description="Paste a YouTube link or the 11-character video ID. Only the ID is saved."
              />
              <TextField
                control={form.control}
                name="externalUrl"
                label="Online link (optional)"
                autoComplete="off"
                description="A full link starting with https://"
              />
              <ImageField
                control={form.control}
                name="videoThumbnail"
                label="Video image (optional)"
                kind="courses"
                description="Leave empty to use the YouTube thumbnail."
              />
            </div>
            <div className="min-w-0">
              <CourseMediaPreview
                videoUrl={media[0]}
                thumbnailUrl={media[1]}
                externalUrl={media[2]}
              />
            </div>
          </div>
        </FormSection>
      </Reveal>

      <Reveal index={4}>
        <FormSection
          title="Pricing and duration"
          description="Set the price students pay and how long the course runs."
        >
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
              options={SUPPORTED_CURRENCIES.map((c) => ({
                value: c,
                label: c,
              }))}
            />
          </div>
          <SaleHint control={form.control} />
          <NumberField
            control={form.control}
            name="duration"
            label="Duration (minutes)"
            step={1}
          />
        </FormSection>
      </Reveal>

      <Reveal index={5}>
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

          <div className="space-y-4 border-t pt-6">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span
                  aria-hidden="true"
                  className="h-4 w-1 rounded-full bg-[#FACC15]"
                />
                <h3 className="text-sm font-semibold tracking-tight">
                  Frequently asked questions
                </h3>
              </div>
              <p className="text-xs tabular-nums text-muted-foreground">
                {faqs.fields.length} of {MAX_FAQS}
              </p>
            </div>

            {faqs.fields.length === 0 && (
              <div className="flex min-h-28 flex-col items-center justify-center gap-2 rounded-lg border border-dashed bg-muted/30 px-4 py-6 text-center">
                <span className="grid size-9 place-items-center rounded-full bg-muted text-muted-foreground">
                  <FiHelpCircle className="size-4" aria-hidden="true" />
                </span>
                <p className="text-sm font-medium">No questions yet</p>
                <p className="text-xs text-muted-foreground">
                  Answer what students usually ask before they enroll.
                </p>
              </div>
            )}

            {faqs.fields.map((f, i) => (
              <div
                key={f.id}
                className="space-y-3 rounded-lg border bg-muted/20 p-4 sm:p-5"
              >
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
                  className="text-destructive hover:text-destructive"
                  onClick={() => faqs.remove(i)}
                >
                  <FiTrash2 aria-hidden="true" />
                  Remove question {i + 1}
                </Button>
              </div>
            ))}

            {faqs.fields.length < MAX_FAQS && (
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
      </Reveal>

      <Reveal index={6}>
        <FormSection
          title="SEO"
          description="How the course appears in search engines. Everything here has a sensible default."
        >
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
      </Reveal>

      <Reveal index={7}>
        <FormSection
          title="Settings"
          description="Visibility options for this course."
        >
          <SwitchField
            control={form.control}
            name="featured"
            label="Featured"
            description="Shown first in the home page's featured courses."
          />
        </FormSection>
      </Reveal>

      <FormFooter
        submitting={form.formState.isSubmitting}
        cancelHref={edit ? `/admin/courses/${record.slug}` : "/admin/courses"}
        submitLabel={edit ? "Save changes" : "Create course"}
      />
    </form>
  );
}
