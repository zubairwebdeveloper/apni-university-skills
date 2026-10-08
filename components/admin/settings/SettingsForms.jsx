// components/admin/settings/SettingsForms.jsx
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
  NumberField,
  SwitchField,
} from "@/components/admin/forms/fields";
import { ImageField } from "@/components/admin/forms/ImageField";
import {
  generalSchema,
  notificationsSettingsSchema,
  securitySchema,
} from "@/lib/validations/settings";
import {
  updateGeneralSettings,
  updateNotificationSettings,
  updateSecuritySettings,
} from "@/app/actions/admin/settings";

function useSettingsForm({ schema, record, action, label }) {
  const router = useRouter();
  const { id, updatedAt, updatedBy, ...defaults } = record;
  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: defaults,
  });
  const submit = form.handleSubmit(async (values) => {
    const res = await action({ ifUpdatedAt: updatedAt, values });
    if (!res.ok) return toast.error(res.error);
    toast.success(`${label} settings saved successfully.`);
    router.refresh();
    form.reset(values);
  });
  return {
    form,
    submit,
    footer: (
      <FormFooter
        submitting={form.formState.isSubmitting}
        cancelHref="/admin/settings"
        submitLabel="Save settings"
      />
    ),
  };
}

export function GeneralSettingsForm({ record }) {
  const { form, submit, footer } = useSettingsForm({
    schema: generalSchema,
    record,
    action: updateGeneralSettings,
    label: "General",
  });
  const c = form.control;
  return (
    <form onSubmit={submit} noValidate className="space-y-6">
      <FormSection title="Site">
        <TextField control={c} name="siteName" label="Site name" />
        <TextField control={c} name="tagline" label="Tagline" />
        <TextField
          control={c}
          name="description"
          label="Description"
          component={Textarea}
          rows={3}
        />
        <ImageField
          control={c}
          name="logo"
          label="Logo (square)"
          kind="settings"
          aspect="aspect-square"
          previewClassName="w-28"
          description="Shown in the site header and footer. PNG, JPG or WebP."
        />
      </FormSection>
      <FormSection
        title="Contact"
        description="Shown publicly in the footer and on the contact page."
      >
        <div className="grid gap-5 sm:grid-cols-2">
          <TextField
            control={c}
            name="contactEmail"
            label="Contact email"
            type="email"
          />
          <TextField control={c} name="phone" label="Phone" type="tel" />
        </div>
        <TextField control={c} name="address" label="Address" />
      </FormSection>
      <FormSection
        title="Social links"
        description="Full https:// links. Leave blank to hide."
      >
        <div className="grid gap-5 sm:grid-cols-2">
          {["linkedin", "x", "youtube", "github"].map((k) => (
            <TextField
              key={k}
              control={c}
              name={`social.${k}`}
              label={k === "x" ? "X" : k.charAt(0).toUpperCase() + k.slice(1)}
              type="url"
            />
          ))}
        </div>
      </FormSection>
      <FormSection
        title="SEO defaults"
        description="Used when a page doesn't define its own."
      >
        <TextField control={c} name="seoTitle" label="Default title" />
        <TextField
          control={c}
          name="seoDescription"
          label="Default description"
          component={Textarea}
          rows={2}
        />
        <ImageField
          control={c}
          name="ogImage"
          label="Default social image"
          kind="settings"
          description="Shown when links are shared. 1200×630 works best."
        />
      </FormSection>
      {footer}
    </form>
  );
}

export function SecuritySettingsForm({ record }) {
  const { form, submit, footer } = useSettingsForm({
    schema: securitySchema,
    record,
    action: updateSecuritySettings,
    label: "Security",
  });
  return (
    <form onSubmit={submit} noValidate className="space-y-6">
      <FormSection
        title="Sessions"
        description="How long a login lasts before the person has to sign in again. The change applies to new logins. Existing sessions keep their length."
      >
        <div className="grid gap-5 sm:grid-cols-2">
          <NumberField
            control={form.control}
            name="sessionDays"
            label="Students (days)"
            step={1}
            description="1–14."
          />
          <NumberField
            control={form.control}
            name="staffSessionDays"
            label="Staff: admin, editor, instructor (days)"
            step={1}
            description="Shorter is safer for accounts that can change content."
          />
        </div>
      </FormSection>
      {footer}
    </form>
  );
}

export function NotificationSettingsForm({ record }) {
  const { form, submit, footer } = useSettingsForm({
    schema: notificationsSettingsSchema,
    record,
    action: updateNotificationSettings,
    label: "Notification",
  });
  const c = form.control;
  return (
    <form onSubmit={submit} noValidate className="space-y-6">
      <FormSection
        title="Email"
        description="Verification and password-reset emails are sent by Firebase and aren't affected by these switches."
      >
        <SwitchField
          control={c}
          name="emailsEnabled"
          label="Send emails"
          description="Master switch. Off means no email leaves the platform."
        />
        {[
          ["welcome", "Welcome email"],
          ["enrollment", "Enrollment confirmation"],
          ["payment", "Payment confirmation"],
          ["completion", "Course completion"],
          ["certificate", "Certificate issued"],
        ].map(([k, l]) => (
          <SwitchField key={k} control={c} name={k} label={l} />
        ))}
      </FormSection>
      <FormSection title="Admin alerts">
        <SwitchField
          control={c}
          name="notifyOnContact"
          label="Email me when a contact message arrives"
        />
        <TextField
          control={c}
          name="adminAlertEmail"
          label="Alert address"
          type="email"
        />
      </FormSection>
      {footer}
    </form>
  );
}

