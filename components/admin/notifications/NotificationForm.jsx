// components/admin/notifications/NotificationForm.jsx
"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Textarea } from "@/components/ui/textarea";
import { TextField } from "@/components/shared/TextField";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import {
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

export function NotificationForm({ courses }) {
  const router = useRouter();
  const [pending, setPending] = useState(null);
  const [minimumScheduledTime] = useState(() =>
    toDateTimeInput(Date.now() + 5 * 60e3),
  );
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
  const [audience, mode] = useWatch({
    control: form.control,
    name: ["audience", "mode"],
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
      <FormSection title="Message">
        <TextField control={c} name="title" label="Title" autoComplete="off" />
        <TextField
          control={c}
          name="body"
          label="Message"
          component={Textarea}
          rows={4}
          description="Plain text, up to 1000 characters."
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
      <FormSection title="Audience">
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
            options={courses.map((x) => ({ value: x.slug, label: x.title }))}
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
      <FormSection title="Delivery">
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
            description={`Your time zone: ${Intl.DateTimeFormat().resolvedOptions().timeZone}. Delivery runs every few minutes.`}
          />
        )}
      </FormSection>
      <FormFooter
        submitting={form.formState.isSubmitting}
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

