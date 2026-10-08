// components/admin/careers/CareerForm.jsx
"use client";
import { useRouter } from "next/navigation";
import { useFieldArray, useForm } from "react-hook-form";
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
  applyActionError,
} from "@/components/admin/forms/fields";
import { SKILLS } from "@/config/skills";
import { SUPPORTED_CURRENCIES } from "@/config/currencies";
import { careerSchema } from "@/lib/validations/career";
import { createCareer, updateCareer } from "@/app/actions/admin/careers";

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
          description="20–250 characters. Shown on cards."
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
        description="Ordered steps, shown as a numbered path."
      >
        {steps.fields.map((f, i) => (
          <div key={f.id} className="space-y-3 rounded-lg border p-4">
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
            <div className="flex gap-1">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                disabled={i === 0}
                onClick={() => steps.move(i, i - 1)}
              >
                Move step {i + 1} up
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                disabled={i === steps.fields.length - 1}
                onClick={() => steps.move(i, i + 1)}
              >
                Move step {i + 1} down
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => steps.remove(i)}
              >
                <FiTrash2 aria-hidden="true" />
                Remove step {i + 1}
              </Button>
            </div>
          </div>
        ))}
        {steps.fields.length < 10 && (
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
          description="Defaults to “{title} career path”."
        />
        <TextField
          control={form.control}
          name="seoDescription"
          label="SEO description"
          component={Textarea}
          rows={2}
          description="Defaults to the summary."
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

