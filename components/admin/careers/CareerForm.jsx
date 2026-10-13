// components/admin/careers/CareerForm.jsx
"use client";
import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { FiArrowDown, FiArrowUp, FiPlus, FiTrash2 } from "react-icons/fi";
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
  applyActionError,
} from "@/components/admin/forms/fields";
import { SKILLS } from "@/config/skills";
import { SUPPORTED_CURRENCIES } from "@/config/currencies";
import { careerSchema } from "@/lib/validations/career";
import { createCareer, updateCareer } from "@/app/actions/admin/careers";

const MAX_STEPS = 10;

const defaults = (c) => ({
  title: c?.title ?? "",
  slug: c?.slug ?? "",
  summary: c?.summary ?? "",
  description: c?.description ?? "",
  skills: (c?.skills ?? []).join("\n"),
  roadmap: c?.roadmap ?? [],
  interviewPrep: (c?.interviewPrep ?? []).join("\n"),
  portfolioIdeas: (c?.portfolioIdeas ?? []).join("\n"),
  jobRoles: (c?.jobRoles ?? []).join("\n"),
  freelanceNotes: c?.freelanceNotes ?? "",
  categorySlug: c?.categorySlug || "none",
  jobSkill: c?.jobSkill ?? "",
  salaryMin: c?.salary?.min ?? "",
  salaryMax: c?.salary?.max ?? "",
  salaryCurrency: c?.salary?.currency ?? "USD",
  salaryNote: c?.salary?.note ?? "",
  order: c?.order ?? 100,
  seoTitle: c?.seoTitle ?? "",
  seoDescription: c?.seoDescription ?? "",
});

// Live character count. Turns red only when a hard limit is broken.
function Count({ value, min, max }) {
  const n = value?.length ?? 0;
  const bad = n > 0 && ((min && n < min) || n > max);
  return (
    <span
      className={`ml-1 tabular-nums ${bad ? "font-medium text-destructive" : ""}`}
    >
      ({n}/{max})
    </span>
  );
}

export function CareerForm({ record = null, categories }) {
  const router = useRouter();
  const edit = !!record;
  const form = useForm({
    resolver: zodResolver(careerSchema),
    defaultValues: defaults(record),
  });
  const steps = useFieldArray({ control: form.control, name: "roadmap" });

  async function onSubmit(values) {
    const res = edit
      ? await updateCareer({
          currentSlug: record.slug,
          ifUpdatedAt: record.updatedAt,
          values,
        })
      : await createCareer(values);
    if (!res.ok) return applyActionError(res, form, toast);
    toast.success(
      edit
        ? "Career guide updated successfully."
        : "Career guide created successfully.",
    );
    router.push("/admin/careers");
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

  const summary = form.watch("summary");
  const seoTitle = form.watch("seoTitle");
  const seoDescription = form.watch("seoDescription");
  const salaryMin = form.watch("salaryMin");
  const salaryMax = form.watch("salaryMax");

  const minNum = Number(salaryMin);
  const maxNum = Number(salaryMax);
  const salaryOutOfOrder =
    salaryMin !== "" &&
    salaryMax !== "" &&
    Number.isFinite(minNum) &&
    Number.isFinite(maxNum) &&
    minNum > maxNum;

  return (
    <form
      onSubmit={form.handleSubmit(onSubmit)}
      noValidate
      className="space-y-6"
    >
      {isDirty && !isSubmitting && (
        <p
          role="status"
          className="rounded-md border border-primary/30 bg-primary/5 px-3 py-2 text-sm text-foreground"
        >
          You have unsaved changes. Press Ctrl+S (Cmd+S on Mac) to save.
        </p>
      )}

      <FormSection title="Basics">
        <TextField
          control={form.control}
          name="title"
          label="Title"
          description="e.g. Frontend Developer"
          autoComplete="off"
        />
        <div className="grid gap-5 sm:grid-cols-2">
          <TextField
            control={form.control}
            name="slug"
            label="Slug"
            autoComplete="off"
            description={
              edit
                ? "Changing it keeps the old URL working via redirect."
                : "Leave blank to generate from the title."
            }
          />
          <NumberField
            control={form.control}
            name="order"
            label="Display order"
            step={1}
            description="Lower numbers appear first."
          />
        </div>
        <TextField
          control={form.control}
          name="summary"
          label="Summary"
          component={Textarea}
          rows={2}
          description={
            <>
              20–250 characters. Shown on cards.
              <Count value={summary} min={20} max={250} />
            </>
          }
        />
        <TextField
          control={form.control}
          name="description"
          label="What this role does"
          component={Textarea}
          rows={6}
          description="Plain text. Separate paragraphs with a blank line."
        />
      </FormSection>

      <FormSection title="Skills and roles" description="One item per line.">
        <div className="grid gap-5 sm:grid-cols-2">
          <LinesField
            control={form.control}
            name="skills"
            label="Key skills"
            rows={5}
          />
          <LinesField
            control={form.control}
            name="jobRoles"
            label="Job titles to look for"
            rows={5}
          />
        </div>
      </FormSection>

      <FormSection
        title="Roadmap"
        description={`Ordered steps, shown as a numbered path. ${steps.fields.length} of ${MAX_STEPS} steps used.`}
      >
        {steps.fields.map((f, i) => (
          <div key={f.id} className="space-y-3 rounded-lg border bg-card p-4">
            <div className="flex items-center gap-3">
              <span
                aria-hidden="true"
                className="grid size-7 shrink-0 place-items-center rounded-full bg-primary/10 text-sm font-semibold text-primary"
              >
                {i + 1}
              </span>
              <span aria-hidden="true" className="h-px flex-1 bg-border" />
            </div>
            <TextField
              control={form.control}
              name={`roadmap.${i}.title`}
              label={`Step ${i + 1} title`}
            />
            <TextField
              control={form.control}
              name={`roadmap.${i}.text`}
              label="Description"
              component={Textarea}
              rows={2}
            />
            <div className="flex flex-wrap gap-1">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                disabled={i === 0}
                onClick={() => steps.move(i, i - 1)}
              >
                <FiArrowUp aria-hidden="true" />
                <span className="sr-only">Move step {i + 1} up</span>
                <span aria-hidden="true">Up</span>
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                disabled={i === steps.fields.length - 1}
                onClick={() => steps.move(i, i + 1)}
              >
                <FiArrowDown aria-hidden="true" />
                <span className="sr-only">Move step {i + 1} down</span>
                <span aria-hidden="true">Down</span>
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="text-destructive hover:text-destructive"
                onClick={() => steps.remove(i)}
              >
                <FiTrash2 aria-hidden="true" />
                <span className="sr-only">Remove step {i + 1}</span>
                <span aria-hidden="true">Remove</span>
              </Button>
            </div>
          </div>
        ))}
        {steps.fields.length < MAX_STEPS && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="w-fit"
            onClick={() => steps.append({ title: "", text: "" })}
          >
            <FiPlus aria-hidden="true" />
            Add step
          </Button>
        )}
      </FormSection>

      <FormSection title="Preparation">
        <div className="grid gap-5 lg:grid-cols-2">
          <LinesField
            control={form.control}
            name="interviewPrep"
            label="Interview preparation"
            rows={5}
          />
          <LinesField
            control={form.control}
            name="portfolioIdeas"
            label="Portfolio ideas"
            rows={5}
          />
        </div>
        <TextField
          control={form.control}
          name="freelanceNotes"
          label="Freelancing and remote work"
          component={Textarea}
          rows={3}
        />
      </FormSection>

      <FormSection
        title="Related content"
        description="The public page finds related courses by category and related jobs by skill."
      >
        <div className="grid gap-5 sm:grid-cols-2">
          <SelectField
            control={form.control}
            name="categorySlug"
            label="Related courses category"
            options={[
              { value: "none", label: "None" },
              ...categories.map((c) => ({ value: c.slug, label: c.name })),
            ]}
          />
          <TextField
            control={form.control}
            name="jobSkill"
            label="Related jobs skill"
            list="skill-options"
            autoComplete="off"
            description="Jobs listing this skill are shown. Casing is normalized."
          />
        </div>
        <datalist id="skill-options">
          {SKILLS.map((s) => (
            <option key={s} value={s} />
          ))}
        </datalist>
      </FormSection>

      <FormSection
        title="Salary information (optional)"
        description="Annual range. Always say where the figures come from, because they vary by country and year."
      >
        <div className="grid gap-5 sm:grid-cols-3">
          <NumberField
            control={form.control}
            name="salaryMin"
            label="Minimum"
          />
          <NumberField
            control={form.control}
            name="salaryMax"
            label="Maximum"
          />
          <SelectField
            control={form.control}
            name="salaryCurrency"
            label="Currency"
            options={SUPPORTED_CURRENCIES.map((c) => ({ value: c, label: c }))}
          />
        </div>
        {salaryOutOfOrder && (
          <p role="alert" className="text-sm font-medium text-destructive">
            The minimum is higher than the maximum. Check the two values.
          </p>
        )}
        <TextField
          control={form.control}
          name="salaryNote"
          label="Source note"
          description="e.g. “Entry to senior, US, 2026, from public job postings”."
        />
      </FormSection>

      <FormSection title="SEO">
        <TextField
          control={form.control}
          name="seoTitle"
          label="SEO title"
          description={
            <>
              Defaults to “{"{title}"} career path”. Around 60 characters or
              fewer displays best in search results.
              <span className="ml-1 tabular-nums">
                ({seoTitle?.length ?? 0})
              </span>
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
              Defaults to the summary. Around 160 characters or fewer displays
              best.
              <span className="ml-1 tabular-nums">
                ({seoDescription?.length ?? 0})
              </span>
            </>
          }
        />
      </FormSection>
      <FormFooter
        submitting={form.formState.isSubmitting}
        cancelHref="/admin/careers"
        submitLabel={edit ? "Save changes" : "Create guide"}
      />
    </form>
  );
}
