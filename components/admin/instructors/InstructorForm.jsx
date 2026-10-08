// components/admin/instructors/InstructorForm.jsx
"use client";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Textarea } from "@/components/ui/textarea";
import { TextField } from "@/components/shared/TextField";
import {
  FormFooter,
  FormSection,
  LinesField,
  SwitchField,
  applyActionError,
} from "@/components/admin/forms/fields";
import { ImageField } from "@/components/admin/forms/ImageField";
import { instructorSchema } from "@/lib/validations/instructor";
import {
  createInstructor,
  updateInstructor,
} from "@/app/actions/admin/instructors";

const SOCIALS = [
  ["linkedin", "LinkedIn"],
  ["github", "GitHub"],
  ["x", "X"],
  ["youtube", "YouTube"],
  ["website", "Website"],
];
const defaults = (i) => ({
  name: i?.name ?? "",
  slug: i?.slug ?? "",
  email: i?.email ?? "",
  designation: i?.designation ?? "",
  shortBio: i?.shortBio ?? "",
  bio: i?.bio ?? "",
  avatar: i?.avatar ?? "",
  coverImage: i?.coverImage ?? "",
  expertise: (i?.expertise ?? []).join("\n"),
  skills: (i?.skills ?? []).join("\n"),
  socialLinks: Object.fromEntries(
    SOCIALS.map(([k]) => [k, i?.socialLinks?.[k] ?? ""]),
  ),
  featured: !!i?.featured,
});

export function InstructorForm({ record = null }) {
  const router = useRouter();
  const edit = !!record;
  const form = useForm({
    resolver: zodResolver(instructorSchema),
    defaultValues: defaults(record),
  });

  async function onSubmit(values) {
    const res = edit
      ? await updateInstructor({
          currentSlug: record.slug,
          ifUpdatedAt: record.updatedAt,
          values,
        })
      : await createInstructor(values);
    if (!res.ok) return applyActionError(res, form, toast);
    toast.success(
      edit
        ? "Instructor updated successfully."
        : "Instructor created successfully.",
    );
    router.push(`/admin/instructors/${res.data.slug}`);
    router.refresh();
  }

  return (
    <form
      onSubmit={form.handleSubmit(onSubmit)}
      noValidate
      className="space-y-6"
    >
      <FormSection title="Profile">
        <div className="grid gap-5 sm:grid-cols-2">
          <TextField
            control={form.control}
            name="name"
            label="Name"
            autoComplete="off"
          />
          <TextField
            control={form.control}
            name="designation"
            label="Designation"
            description="e.g. Senior Full Stack Engineer"
          />
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
          <TextField
            control={form.control}
            name="slug"
            label="Slug"
            description={
              edit
                ? "Changing it keeps the old URL working via redirect."
                : "Leave blank to generate from the name."
            }
            autoComplete="off"
          />
          <TextField
            control={form.control}
            name="email"
            label="Email (private)"
            type="email"
            description="For admin use only. Never shown publicly."
            autoComplete="off"
          />
        </div>
        <TextField
          control={form.control}
          name="shortBio"
          label="Short bio"
          component={Textarea}
          rows={2}
          description="Up to 200 characters. Shown on cards."
        />
        <TextField
          control={form.control}
          name="bio"
          label="Full bio"
          component={Textarea}
          rows={6}
        />
      </FormSection>
      <FormSection title="Images">
        <ImageField
          control={form.control}
          name="avatar"
          label="Avatar"
          kind="instructors"
          aspect="aspect-square"
          previewClassName="w-40"
        />
        <ImageField
          control={form.control}
          name="coverImage"
          label="Cover image (optional)"
          kind="instructors"
          aspect="aspect-[3/1]"
        />
      </FormSection>
      <FormSection title="Expertise" description="One item per line.">
        <div className="grid gap-5 sm:grid-cols-2">
          <LinesField
            control={form.control}
            name="expertise"
            label="Areas of expertise"
          />
          <LinesField control={form.control} name="skills" label="Skills" />
        </div>
      </FormSection>
      <FormSection
        title="Social links"
        description="Full https:// links. Leave blank to hide."
      >
        <div className="grid gap-5 sm:grid-cols-2">
          {SOCIALS.map(([k, label]) => (
            <TextField
              key={k}
              control={form.control}
              name={`socialLinks.${k}`}
              label={label}
              type="url"
            />
          ))}
        </div>
      </FormSection>
      <FormSection title="Settings">
        <SwitchField
          control={form.control}
          name="featured"
          label="Featured"
          description="Eligible for the home page instructor section."
        />
      </FormSection>
      <FormFooter
        submitting={form.formState.isSubmitting}
        cancelHref="/admin/instructors"
        submitLabel={edit ? "Save changes" : "Create instructor"}
      />
    </form>
  );
}

