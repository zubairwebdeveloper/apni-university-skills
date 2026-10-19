// components/admin/categories/CategoryForm.jsx
"use client";
import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Textarea } from "@/components/ui/textarea";
import { TextField } from "@/components/shared/TextField";
import { CategoryIcon } from "@/components/shared/CategoryIcon";
import {
  CharCount,
  FormFooter,
  FormSection,
  LinesField,
  NumberField,
  SelectField,
  SwitchField,
  applyActionError,
} from "@/components/admin/forms/fields";
import { ImageField } from "@/components/admin/forms/ImageField";
import { ACCENTS, CATEGORY_ICONS } from "@/config/categories";
import { categorySchema } from "@/lib/validations/category";
import { createCategory, updateCategory } from "@/app/actions/admin/categories";

const defaults = (c) => ({
  name: c?.name ?? "",
  slug: c?.slug ?? "",
  description: c?.description ?? "",
  icon: c?.icon ?? "code",
  accent: c?.accent ?? "blue",
  image: c?.image ?? "",
  order: c?.order ?? 100,
  featured: !!c?.featured,
  seoTitle: c?.seoTitle ?? "",
  seoDescription: c?.seoDescription ?? "",
});

// Full class strings so Tailwind can see them (same palette the public cards use).
const ACCENT_CLASSES = {
  rose: "bg-rose-500/10 text-rose-600 dark:text-rose-400",
  blue: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  sky: "bg-sky-500/10 text-sky-600 dark:text-sky-400",
  emerald: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  green: "bg-green-500/10 text-green-600 dark:text-green-400",
  amber: "bg-amber-500/10 text-amber-700 dark:text-amber-400",
  orange: "bg-orange-500/10 text-orange-600 dark:text-orange-400",
  violet: "bg-violet-500/10 text-violet-600 dark:text-violet-400",
  purple: "bg-purple-500/10 text-purple-600 dark:text-purple-400",
  indigo: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400",
  pink: "bg-pink-500/10 text-pink-600 dark:text-pink-400",
  teal: "bg-teal-500/10 text-teal-600 dark:text-teal-400",
  cyan: "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400",
};
const accentClass = (name) =>
  ACCENT_CLASSES[String(name ?? "").toLowerCase()] ??
  "bg-primary/10 text-primary";

// A rough picture of how the category appears on cards, updating as you edit
// the name, description, icon and accent.
function CategoryPreview({ name, description, icon, accent }) {
  return (
    <div
      className="rounded-lg border border-border bg-card p-4"
      role="group"
      aria-label="Card preview"
    >
      <p className="text-xs font-medium text-muted-foreground">Card preview</p>
      <div className="mt-3 flex items-start gap-3">
        <span
          className={`grid size-10 shrink-0 place-items-center rounded-lg ${accentClass(accent)}`}
        >
          <CategoryIcon name={icon} className="size-5" />
        </span>
        <div className="min-w-0">
          <p className="truncate font-medium text-foreground">
            {name || "Category name"}
          </p>
          <p className="mt-0.5 line-clamp-2 text-sm leading-6 text-muted-foreground">
            {description || "The description appears here."}
          </p>
        </div>
      </div>
    </div>
  );
}

// How the page will read in search results, using the same fallbacks as the
// live page (SEO title -> "{name} courses", SEO description -> description).
function SeoPreview({ title, description, slug }) {
  return (
    <div
      className="rounded-lg border border-border bg-card p-4"
      role="group"
      aria-label="Search result preview"
    >
      <p className="text-xs font-medium text-muted-foreground">
        Search result preview
      </p>
      <p className="mt-2 truncate text-xs text-muted-foreground">
        /categories/{slug || "category-slug"}
      </p>
      <p className="mt-0.5 line-clamp-2 text-base font-medium leading-snug text-primary">
        {title || "Page title appears here"}
      </p>
      <p className="mt-1 line-clamp-2 text-sm leading-6 text-muted-foreground">
        {description ||
          "The SEO description, or the description, appears here."}
      </p>
    </div>
  );
}

export function CategoryForm({ record = null }) {
  const router = useRouter();
  const edit = !!record;
  const form = useForm({
    resolver: zodResolver(categorySchema),
    defaultValues: defaults(record),
  });

  async function onSubmit(values) {
    const res = edit
      ? await updateCategory({
          currentSlug: record.slug,
          ifUpdatedAt: record.updatedAt,
          values,
        })
      : await createCategory(values);
    if (!res.ok) return applyActionError(res, form, toast);
    toast.success(
      edit
        ? "Category updated successfully."
        : "Category created successfully.",
    );
    router.push("/admin/categories");
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

  // Ctrl/Cmd+S saves. The ref keeps the listener pointing at the latest handler,
  // and a save already in progress is not started twice.
  const submitRef = useRef(null);
  submitRef.current = () => {
    if (form.formState.isSubmitting) return;
    return form.handleSubmit(onSubmit)();
  };
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

  const name = form.watch("name");
  const slug = form.watch("slug")?.trim();
  const description = form.watch("description");
  const icon = form.watch("icon");
  const accent = form.watch("accent");
  const seoTitle = form.watch("seoTitle");
  const seoDescription = form.watch("seoDescription");

  return (
    <form
      onSubmit={form.handleSubmit(onSubmit)}
      noValidate
      className="space-y-6"
    >
      <FormSection title="Basics">
        <TextField control={form.control} name="name" label="Name" />
        <TextField
          control={form.control}
          name="slug"
          label="Slug"
          description={
            <>
              {edit
                ? "Changing the slug keeps the old URL working through a redirect."
                : "Leave blank to generate it from the name."}
              {slug && (
                <span className="mt-1 block break-all font-mono text-xs">
                  Public URL: /categories/{slug}
                </span>
              )}
            </>
          }
          autoComplete="off"
        />
        <LinesField
          control={form.control}
          name="description"
          label="Description"
          rows={3}
          description={
            <>
              Shown at the top of the category page.
              <CharCount value={description} />
            </>
          }
        />
      </FormSection>
      <FormSection title="Appearance">
        <div className="grid gap-5 sm:grid-cols-2">
          <SelectField
            control={form.control}
            name="icon"
            label="Icon"
            options={CATEGORY_ICONS.map((v) => ({
              value: v,
              label: v.charAt(0).toUpperCase() + v.slice(1),
            }))}
          />
          <SelectField
            control={form.control}
            name="accent"
            label="Accent color"
            options={ACCENTS}
          />
        </div>
        <CategoryPreview
          name={name?.trim()}
          description={description?.trim()}
          icon={icon}
          accent={accent}
        />
        <ImageField
          control={form.control}
          name="image"
          label="Image (optional)"
          kind="categories"
        />
        <div className="grid gap-5 sm:grid-cols-2 sm:items-end">
          <NumberField
            control={form.control}
            name="order"
            label="Display order"
            step={1}
            description="Lower numbers appear first."
          />
          <SwitchField
            control={form.control}
            name="featured"
            label="Featured"
            description="Highlight on the home page."
          />
        </div>
      </FormSection>
      <FormSection title="SEO">
        <TextField
          control={form.control}
          name="seoTitle"
          label="SEO title"
          description={
            <>
              Up to 70 characters. Defaults to “{"{name}"} courses”.
              <CharCount value={seoTitle} max={70} />
            </>
          }
        />
        <TextField
          control={form.control}
          name="seoDescription"
          label="SEO description"
          component={Textarea}
          rows={2}
          description={
            <>
              Up to 160 characters.
              <CharCount value={seoDescription} max={160} />
            </>
          }
        />
        <SeoPreview
          title={
            seoTitle?.trim() || (name?.trim() ? `${name.trim()} courses` : "")
          }
          description={seoDescription?.trim() || description?.trim()}
          slug={slug}
        />
      </FormSection>
      <FormFooter
        submitting={form.formState.isSubmitting}
        dirty={isDirty}
        cancelHref="/admin/categories"
        submitLabel={edit ? "Save changes" : "Create category"}
      />
    </form>
  );
}
