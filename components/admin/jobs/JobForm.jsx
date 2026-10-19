// components/admin/jobs/JobForm.jsx
"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion, useReducedMotion } from "framer-motion";
import { AlertCircle } from "lucide-react";
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

const DAY_MS = 24 * 60 * 60 * 1000;

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

// Number of non-empty lines in a "one per line" field
const lineCount = (text) =>
  (text ?? "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean).length;

const itemsLabel = (n) => `${n} ${n === 1 ? "item" : "items"}`;

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

  // "Now" is read after mount so server and client render the same markup
  const [now, setNow] = useState(null);
  useEffect(() => setNow(Date.now()), []);

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

  // Expiry: the listing is archived at the end of the chosen day (UTC)
  const expiresAt = form.watch("expiresAt");
  let expiryNote = null;
  let expiryPassed = false;
  if (expiresAt && now !== null) {
    const end = Date.parse(`${expiresAt}T23:59:59Z`);
    if (Number.isFinite(end)) {
      const days = Math.ceil((end - now) / DAY_MS);
      expiryPassed = end < now;
      expiryNote = expiryPassed
        ? "This date has already passed."
        : days === 1
          ? "About 1 day from now."
          : `About ${days} days from now.`;
    }
  }

  // Show where candidates will actually land
  const applyUrl = form.watch("applyUrl")?.trim();
  let applyHost = null;
  if (applyUrl) {
    try {
      const u = new URL(applyUrl);
      if (u.protocol === "http:" || u.protocol === "https:")
        applyHost = u.hostname;
    } catch {
      applyHost = null;
    }
  }

  const slugValue = form.watch("slug")?.trim();
  const responsibilities = form.watch("responsibilities");
  const requirements = form.watch("requirements");
  const skills = form.watch("skills");

  return (
    <form
      onSubmit={form.handleSubmit(onSubmit)}
      noValidate
      className="space-y-6"
    >
      <Reveal index={0}>
        <FormSection
          title="Role"
          description="The title, URL and type of position being advertised."
        >
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
              <>
                {edit
                  ? "Changing it keeps the old URL working via redirect."
                  : "Leave blank to generate from the title and company."}
                {slugValue && (
                  <span className="mt-1 block break-all font-mono text-xs">
                    Public URL: /jobs/{slugValue}
                  </span>
                )}
              </>
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
      </Reveal>

      <Reveal index={1}>
        <FormSection
          title="Company and location"
          description="Who is hiring and where the work happens."
        >
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
      </Reveal>

      <Reveal index={2}>
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
              options={SUPPORTED_CURRENCIES.map((c) => ({
                value: c,
                label: c,
              }))}
            />
          </div>
          {salaryOutOfOrder && (
            <p
              role="alert"
              className="flex items-start gap-2 rounded-lg border border-destructive/40 bg-destructive/5 px-3.5 py-2.5 text-sm font-medium text-destructive"
            >
              <AlertCircle
                className="mt-0.5 size-4 shrink-0"
                aria-hidden="true"
              />
              The minimum is higher than the maximum. Check the two values.
            </p>
          )}
        </FormSection>
      </Reveal>

      <Reveal index={3}>
        <FormSection
          title="Details"
          description="What the role involves and what candidates need."
        >
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
              description={`One per line. ${itemsLabel(lineCount(responsibilities))}.`}
            />
            <LinesField
              control={form.control}
              name="requirements"
              label="Requirements"
              rows={6}
              description={`One per line. ${itemsLabel(lineCount(requirements))}.`}
            />
          </div>
          <LinesField
            control={form.control}
            name="skills"
            label="Skills"
            rows={4}
            description={`One per line. Known skills use standard casing, e.g. ${SKILLS.slice(0, 4).join(", ")}. ${itemsLabel(lineCount(skills))}.`}
          />
        </FormSection>
      </Reveal>

      <Reveal index={4}>
        <FormSection
          title="Application and visibility"
          description="Where candidates apply and how long the listing stays live."
        >
          <TextField
            control={form.control}
            name="applyUrl"
            label="Application link"
            type="url"
            description={
              <>
                Candidates apply on this external page.
                {applyHost && (
                  <span className="mt-1 block text-xs">
                    Candidates will be sent to{" "}
                    <span className="font-mono font-medium text-foreground">
                      {applyHost}
                    </span>
                    .
                  </span>
                )}
              </>
            }
          />
          <div className="grid gap-5 sm:grid-cols-2 sm:items-end">
            <DateField
              control={form.control}
              name="expiresAt"
              label="Expires on (optional)"
              description={
                <>
                  The listing is archived automatically at the end of this day
                  (UTC).
                  {expiryNote && (
                    <span
                      className={
                        expiryPassed
                          ? "mt-1 block text-xs font-medium text-destructive"
                          : "mt-1 block text-xs"
                      }
                    >
                      {expiryNote}
                    </span>
                  )}
                </>
              }
            />
            <SwitchField
              control={form.control}
              name="featured"
              label="Featured"
            />
          </div>
        </FormSection>
      </Reveal>

      <FormFooter
        submitting={form.formState.isSubmitting}
        dirty={isDirty}
        cancelHref="/admin/jobs"
        submitLabel={edit ? "Save changes" : "Create job"}
      />
    </form>
  );
}
