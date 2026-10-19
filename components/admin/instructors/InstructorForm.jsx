// components/admin/instructors/InstructorForm.jsx
"use client";
import { useRouter } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion, useReducedMotion } from "framer-motion";
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
import { InstructorPreview } from "@/components/admin/instructors/InstructorPreview";
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

export function InstructorForm({ record = null }) {
  const router = useRouter();
  const edit = !!record;
  const form = useForm({
    resolver: zodResolver(instructorSchema),
    defaultValues: defaults(record),
  });
  const watched = useWatch({ control: form.control });

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
      {/* The preview has its own entrance animation, so it is not wrapped in Reveal */}
      <InstructorPreview values={watched} />

      <Reveal index={0}>
        <FormSection
          title="Profile"
          description="Who the instructor is and how they are introduced to students."
        >
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
      </Reveal>

      <Reveal index={1}>
        <FormSection
          title="Images"
          description="A square avatar and an optional wide cover for the profile page."
        >
          <div className="grid items-start gap-6 lg:grid-cols-[auto_minmax(0,1fr)]">
            <ImageField
              control={form.control}
              name="avatar"
              label="Avatar"
              kind="instructors"
              aspect="aspect-square"
              previewClassName="w-40"
            />
            <div className="min-w-0">
              <ImageField
                control={form.control}
                name="coverImage"
                label="Cover image (optional)"
                kind="instructors"
                aspect="aspect-[3/1]"
              />
            </div>
          </div>
        </FormSection>
      </Reveal>

      <Reveal index={2}>
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
      </Reveal>

      <Reveal index={3}>
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
      </Reveal>

      <Reveal index={4}>
        <FormSection
          title="Settings"
          description="Visibility options for this instructor."
        >
          <SwitchField
            control={form.control}
            name="featured"
            label="Featured"
            description="Eligible for the home page instructor section."
          />
        </FormSection>
      </Reveal>

      <FormFooter
        submitting={form.formState.isSubmitting}
        dirty={form.formState.isDirty}
        cancelHref="/admin/instructors"
        submitLabel={edit ? "Save changes" : "Create instructor"}
      />
    </form>
  );
}
