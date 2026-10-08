// components/admin/jobs/JobForm.jsx
"use client";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Textarea } from "@/components/ui/textarea";
import { TextField } from "@/components/shared/TextField";
import {
  DateField,
  FormFooter,
  FormSection,
  LinesField,
  NumberField,
  SelectField,
  SwitchField,
  applyActionError,
} from "@/components/admin/forms/fields";
import { ImageField } from "@/components/admin/forms/ImageField";
import { EMPLOYMENT_TYPES, EXPERIENCE_LEVELS } from "@/config/jobs";
import { SUPPORTED_CURRENCIES } from "@/config/currencies";
import { SKILLS } from "@/config/skills";
import { jobSchema } from "@/lib/validations/jobs";
import { utcDate } from "@/lib/utils/date";
import { createJob, updateJob } from "@/app/actions/admin/jobs";

const defaults = (j) => ({
  title: j?.title ?? "",
  slug: j?.slug ?? "",
  company: j?.company ?? "",
  companyLogo: j?.companyLogo ?? "",
  location: j?.location ?? "",
  remote: !!j?.remote,
  employmentType: j?.employmentType ?? "full-time",
  experienceLevel: j?.experienceLevel ?? "entry",
  salaryMin: j?.salaryMin ?? "",
  salaryMax: j?.salaryMax ?? "",
  currency: j?.currency ?? "USD",
  skills: (j?.skills ?? []).join("\n"),
  description: j?.description ?? "",
  requirements: (j?.requirements ?? []).join("\n"),
  responsibilities: (j?.responsibilities ?? []).join("\n"),
  applyUrl: j?.applyUrl ?? "",
  featured: !!j?.featured,
  expiresAt: utcDate(j?.expiresAt),
});

export function JobForm({ record = null }) {
  const router = useRouter();
  const edit = !!record;
  const form = useForm({
    resolver: zodResolver(jobSchema),
    defaultValues: defaults(record),
  });

  async function onSubmit(values) {
    const res = edit
      ? await updateJob({
          currentSlug: record.slug,
          ifUpdatedAt: record.updatedAt,
          values,
        })
      : await createJob(values);
    if (!res.ok) return applyActionError(res, form, toast);
    toast.success(
      edit ? "Job updated successfully." : "Job created successfully.",
    );
    router.push("/admin/jobs");
    router.refresh();
  }

  return (
    <form
      onSubmit={form.handleSubmit(onSubmit)}
      noValidate
      className="space-y-6"
    >
      <FormSection title="Role">
        <TextField
          control={form.control}
          name="title"
          label="Job title"
          autoComplete="off"
        />
        <TextField
          control={form.control}
          name="slug"
          label="Slug"
          autoComplete="off"
          description={
            edit
              ? "Changing it keeps the old URL working via redirect."
              : "Leave blank to generate from the title and company."
          }
        />
        <div className="grid gap-5 sm:grid-cols-2">
          <SelectField
            control={form.control}
            name="employmentType"
            label="Job type"
            options={EMPLOYMENT_TYPES}
          />
          <SelectField
            control={form.control}
            name="experienceLevel"
            label="Experience level"
            options={EXPERIENCE_LEVELS}
          />
        </div>
      </FormSection>

      <FormSection title="Company and location">
        <TextField
          control={form.control}
          name="company"
          label="Company"
          autoComplete="off"
        />
        <ImageField
          control={form.control}
          name="companyLogo"
          label="Company logo (optional)"
          kind="jobs"
          aspect="aspect-square"
          previewClassName="w-28"
        />
        <div className="grid gap-5 sm:grid-cols-2 sm:items-end">
          <TextField
            control={form.control}
            name="location"
            label="Location"
            description="City and country, or “Worldwide”."
          />
          <SwitchField
            control={form.control}
            name="remote"
            label="Remote"
            description="Can be done remotely."
          />
        </div>
      </FormSection>

      <FormSection
        title="Salary (optional)"
        description="Annual range. Leave both blank to omit."
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
            name="currency"
            label="Currency"
            options={SUPPORTED_CURRENCIES.map((c) => ({ value: c, label: c }))}
          />
        </div>
      </FormSection>

      <FormSection title="Details">
        <TextField
          control={form.control}
          name="description"
          label="About the role"
          component={Textarea}
          rows={8}
          description="Plain text. Separate paragraphs with a blank line."
        />
        <div className="grid gap-5 lg:grid-cols-2">
          <LinesField
            control={form.control}
            name="responsibilities"
            label="Responsibilities"
            rows={6}
            description="One per line."
          />
          <LinesField
            control={form.control}
            name="requirements"
            label="Requirements"
            rows={6}
            description="One per line."
          />
        </div>
        <LinesField
          control={form.control}
          name="skills"
          label="Skills"
          rows={4}
          description={`One per line. Known skills use standard casing, e.g. ${SKILLS.slice(0, 4).join(", ")}.`}
        />
      </FormSection>

      <FormSection title="Application and visibility">
        <TextField
          control={form.control}
          name="applyUrl"
          label="Application link"
          type="url"
          description="Candidates apply on this external page."
        />
        <div className="grid gap-5 sm:grid-cols-2 sm:items-end">
          <DateField
            control={form.control}
            name="expiresAt"
            label="Expires on (optional)"
            description="The listing is archived automatically at the end of this day (UTC)."
          />
          <SwitchField
            control={form.control}
            name="featured"
            label="Featured"
          />
        </div>
      </FormSection>
      <FormFooter
        submitting={form.formState.isSubmitting}
        cancelHref="/admin/jobs"
        submitLabel={edit ? "Save changes" : "Create job"}
      />
    </form>
  );
}

