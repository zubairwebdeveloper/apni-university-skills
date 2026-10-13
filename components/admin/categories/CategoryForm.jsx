// components/admin/categories/CategoryForm.jsx
"use client";
import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Textarea } from "@/components/ui/textarea";
import { TextField } from "@/components/shared/TextField";
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

  // Ctrl/Cmd+S saves. The ref keeps the listener pointing at the latest handler.
  const submitRef = useRef(null);
  submitRef.current = form.handleSubmit(onSubmit);
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

  const slug = form.watch("slug")?.trim();
  const description = form.watch("description");
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
