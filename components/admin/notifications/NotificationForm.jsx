// components/admin/notifications/NotificationForm.jsx
"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion, useReducedMotion } from "framer-motion";
import { AlertTriangle, Info } from "lucide-react";
import { toast } from "sonner";
import { Textarea } from "@/components/ui/textarea";
import { TextField } from "@/components/shared/TextField";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import {
  CharCount,
  DateField,
  FormFooter,
  FormSection,
  LinesField,
  SelectField,
} from "@/components/admin/forms/fields";
import {
  AUDIENCES,
  NOTIFICATION_TYPES,
  SEND_MODES,
  notificationSchema,
} from "@/lib/validations/notification";
import { localToISO, toDateTimeInput } from "@/lib/utils/date";
import { createNotification } from "@/app/actions/admin/notifications";

const BODY_MAX = 1000;

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

// Plain-language note about what the chosen delivery mode will do
function ModeNote({ mode }) {
  if (mode === "now") {
    return (
      <p
        role="status"
        className="flex items-start gap-2 rounded-lg border border-destructive/40 bg-destructive/5 px-3.5 py-2.5 text-sm text-destructive"
      >
        <AlertTriangle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
        <span>
          It is delivered to the whole audience as soon as you confirm and
          can&apos;t be recalled.
        </span>
      </p>
    );
  }
  return (
    <p
      role="status"
      className="flex items-start gap-2 rounded-lg border bg-muted/40 px-3.5 py-2.5 text-sm text-muted-foreground"
    >
      <Info className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
      <span>
        {mode === "schedule"
          ? "It will be sent at the time you choose below."
          : "Nothing is sent. You can find the draft in the notifications list."}
      </span>
    </p>
  );
}

export function NotificationForm({ courses }) {
  const router = useRouter();
  const [pending, setPending] = useState(null);
  const [minimumScheduledTime] = useState(() =>
    toDateTimeInput(Date.now() + 5 * 60e3),
  );
  // Time zone is read after mount so server and client render the same markup
  const [timeZone, setTimeZone] = useState("");
  useEffect(() => {
    const timeout = window.setTimeout(
      () => setTimeZone(Intl.DateTimeFormat().resolvedOptions().timeZone),
      0,
    );
    return () => window.clearTimeout(timeout);
  }, []);
  const form = useForm({
    resolver: zodResolver(notificationSchema),
    defaultValues: {
      title: "",
      body: "",
      type: "announcement",
      link: "",
      audience: "all_students",
      courseSlug: "",
      userEmails: "",
      mode: "draft",
      scheduledFor: "",
    },
  });
  const [audience, mode, body] = useWatch({
    control: form.control,
    name: ["audience", "mode", "body"],
  });
  const c = form.control;

  async function submit(values) {
    const res = await createNotification({
      ...values,
      scheduledFor:
        values.mode === "schedule" ? localToISO(values.scheduledFor) : "",
    });
    if (!res.ok) return toast.error(res.error);
    toast.success(
      values.mode === "now"
        ? "Notification sent successfully."
        : values.mode === "schedule"
          ? "Notification scheduled successfully."
          : "Notification saved as a draft.",
    );
    router.push("/admin/notifications");
    router.refresh();
  }
  // The schema validates scheduledFor as an ISO date, so convert before validation runs
  const onSubmit = form.handleSubmit((values) =>
    values.mode === "now" ? setPending(values) : submit(values),
  );

  return (
    <form
      onSubmit={(e) => {
        const v = form.getValues();
        if (
          v.mode === "schedule" &&
          v.scheduledFor &&
          !v.scheduledFor.endsWith("Z")
        )
          form.setValue("scheduledFor", localToISO(v.scheduledFor));
        onSubmit(e);
      }}
      noValidate
      className="space-y-6"
    >
      <Reveal index={0}>
        <FormSection
          title="Message"
          description="What students see in their notification list."
        >
          <TextField
            control={c}
            name="title"
            label="Title"
            autoComplete="off"
          />
          <TextField
            control={c}
            name="body"
            label="Message"
            component={Textarea}
            rows={4}
            description={
              <>
                Plain text, up to 1000 characters.
                <CharCount value={body} max={BODY_MAX} />
              </>
            }
          />
          <div className="grid gap-5 sm:grid-cols-2">
            <SelectField
              control={c}
              name="type"
              label="Type"
              options={NOTIFICATION_TYPES.map((t) => ({
                value: t,
                label: t.charAt(0).toUpperCase() + t.slice(1),
              }))}
            />
            <TextField
              control={c}
              name="link"
              label="Link (optional)"
              description="A path on this site, e.g. /courses/my-course."
              autoComplete="off"
            />
          </div>
        </FormSection>
      </Reveal>

      <Reveal index={1}>
        <FormSection
          title="Audience"
          description="Who receives this notification."
        >
          <SelectField
            control={c}
            name="audience"
            label="Send to"
            options={AUDIENCES}
          />
          {audience === "course" && (
            <SelectField
              control={c}
              name="courseSlug"
              label="Course"
              placeholder="Choose a course"
              options={courses.map((x) => ({
                value: x.slug,
                label: x.title,
              }))}
              description="Students with an active or completed enrollment."
            />
          )}
          {audience === "users" && (
            <LinesField
              control={c}
              name="userEmails"
              label="Email addresses"
              rows={4}
              description="One per line, up to 50. Each must belong to an existing account."
            />
          )}
        </FormSection>
      </Reveal>

      <Reveal index={2}>
        <FormSection
          title="Delivery"
          description="Send it now, schedule it for later, or keep it as a draft."
        >
          <SelectField
            control={c}
            name="mode"
            label="When"
            options={SEND_MODES}
          />
          {mode === "schedule" && (
            <DateField
              control={c}
              name="scheduledFor"
              type="datetime-local"
              label="Send at"
              min={minimumScheduledTime}
              description={`${timeZone ? `Your time zone: ${timeZone}. ` : ""}Delivery runs every few minutes.`}
            />
          )}
          <ModeNote mode={mode} />
        </FormSection>
      </Reveal>

      <FormFooter
        submitting={form.formState.isSubmitting}
        dirty={form.formState.isDirty}
        cancelHref="/admin/notifications"
        submitLabel={
          mode === "now"
            ? "Send now"
            : mode === "schedule"
              ? "Schedule"
              : "Save draft"
        }
      />
      <ConfirmDialog
        open={!!pending}
        onOpenChange={(o) => !o && setPending(null)}
        title="Send this notification now?"
        description="It is delivered to the whole audience and can't be recalled."
        confirmLabel="Send now"
        onConfirm={() => submit(pending)}
      />
    </form>
  );
}
