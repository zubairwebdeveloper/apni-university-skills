// components/admin/settings/SettingsForms.jsx
"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { AlertTriangle, Check, Loader2, RotateCcw, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { TextField } from "@/components/shared/TextField";
import {
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

// Every social key the site can show. The footer reads these, so each one
// needs a field here (blank = hidden on the site).
const SOCIAL_FIELDS = [
  ["facebook", "Facebook"],
  ["instagram", "Instagram"],
  ["linkedin", "LinkedIn"],
  ["youtube", "YouTube"],
  ["x", "X"],
  ["github", "GitHub"],
];

const EMAIL_TOGGLES = [
  ["welcome", "Welcome email"],
  ["enrollment", "Enrollment confirmation"],
  ["payment", "Payment confirmation"],
  ["completion", "Course completion"],
  ["certificate", "Certificate issued"],
];

const SESSION_PRESETS = [
  { label: "Strict", student: 3, staff: 1, hint: "3 days / 1 day" },
  { label: "Balanced", student: 7, staff: 3, hint: "7 days / 3 days" },
  { label: "Relaxed", student: 14, staff: 7, hint: "14 days / 7 days" },
];

const SEO_TITLE_MAX = 60;
const SEO_DESCRIPTION_MAX = 160;

// Stored settings often come back with null/undefined for blank fields.
// Controlled inputs and z.string() both fail on that, and with noValidate the
// failure is invisible, so normalise to "" before the form sees it.
function normalizeDefaults(values) {
  const out = {};
  for (const [k, v] of Object.entries(values)) {
    out[k] = v === null || v === undefined ? "" : v;
  }
  const social = {};
  for (const [key] of SOCIAL_FIELDS) {
    const v = values.social?.[key];
    social[key] = typeof v === "string" ? v : "";
  }
  if ("social" in values || values.social === undefined) out.social = social;
  return out;
}

// Flattens react-hook-form errors into "field: message" so a rejected submit
// always tells the admin which field is the problem, even a field that
// isn't rendered on this page.
function firstError(errors) {
  const walk = (obj, path) => {
    for (const [k, v] of Object.entries(obj ?? {})) {
      if (k === "ref" || k === "type") continue;
      if (v && typeof v === "object") {
        if (typeof v.message === "string" && v.message)
          return [`${path}${k}`, v.message];
        const nested = walk(v, `${path}${k}.`);
        if (nested) return nested;
      }
    }
    return null;
  };
  return walk(errors, "");
}

// updatedAt can be a Date, a number, an ISO string or a { seconds } object.
function toDate(value) {
  if (!value) return null;
  const raw =
    typeof value === "object" && value !== null && "seconds" in value
      ? value.seconds * 1000
      : value;
  const d = new Date(raw);
  return Number.isNaN(d.getTime()) ? null : d;
}

function formatDays(n) {
  if (!Number.isFinite(n) || n <= 0) return "—";
  if (n === 1) return "1 day";
  if (n % 7 === 0) return n === 7 ? "1 week" : `${n / 7} weeks`;
  return `${n} days`;
}

/* ------------------------------------------------------------------ */
/* Shared UI pieces                                                    */
/* ------------------------------------------------------------------ */

function SaveBar({ dirty, submitting, onDiscard, cancelHref, updatedAt }) {
  // Formatted after mount so server and client markup match.
  const [savedLabel, setSavedLabel] = useState("");
  useEffect(() => {
    const d = toDate(updatedAt);
    setSavedLabel(
      d
        ? d.toLocaleString(undefined, {
            dateStyle: "medium",
            timeStyle: "short",
          })
        : "",
    );
  }, [updatedAt]);

  return (
    <div
      className="sticky bottom-4 z-20 flex flex-wrap items-center gap-3 rounded-xl border bg-background/95 px-4 py-3 shadow-lg backdrop-blur supports-[backdrop-filter]:bg-background/80"
      role="region"
      aria-label="Save settings"
    >
      <div
        className="flex min-w-0 flex-1 items-center gap-2 text-sm"
        aria-live="polite"
      >
        {dirty ? (
          <>
            <span
              className="size-2 shrink-0 rounded-full bg-amber-500"
              aria-hidden="true"
            />
            <span className="font-medium">Unsaved changes</span>
          </>
        ) : (
          <>
            <Check
              className="size-4 shrink-0 text-emerald-600"
              aria-hidden="true"
            />
            <span className="truncate text-muted-foreground">
              {savedLabel ? `Saved ${savedLabel}` : "All changes saved"}
            </span>
          </>
        )}
      </div>

      <span className="hidden text-xs text-muted-foreground md:inline">
        Press Ctrl/⌘ + S to save
      </span>

      <Button asChild variant="ghost" size="sm">
        <Link href={cancelHref}>Cancel</Link>
      </Button>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={onDiscard}
        disabled={!dirty || submitting}
      >
        <RotateCcw className="size-4" aria-hidden="true" />
        Discard changes
      </Button>
      <Button type="submit" size="sm" disabled={!dirty || submitting}>
        {submitting ? (
          <Loader2 className="size-4 animate-spin" aria-hidden="true" />
        ) : (
          <Save className="size-4" aria-hidden="true" />
        )}
        {submitting ? "Saving…" : "Save settings"}
      </Button>
    </div>
  );
}

function Counter({ value, max }) {
  const n = typeof value === "string" ? value.length : 0;
  const over = n > max;
  return (
    <p
      className={`-mt-2 text-right text-xs tabular-nums ${
        over ? "text-amber-600 dark:text-amber-400" : "text-muted-foreground"
      }`}
    >
      {n}/{max}
      {over ? " — may be cut off in search results" : ""}
    </p>
  );
}

function Notice({ tone = "info", children }) {
  const styles =
    tone === "warn"
      ? "border-amber-500/30 bg-amber-500/10 text-amber-900 dark:text-amber-200"
      : "border-border bg-muted/40 text-muted-foreground";
  return (
    <div className={`flex gap-2 rounded-lg border px-3 py-2 text-sm ${styles}`}>
      {tone === "warn" && (
        <AlertTriangle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
      )}
      <div>{children}</div>
    </div>
  );
}

function PreviewFrame({ title, children }) {
  return (
    <div className="space-y-2">
      <p className="text-sm font-medium">{title}</p>
      <div className="rounded-lg border bg-muted/30 p-4">{children}</div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Form hook                                                           */
/* ------------------------------------------------------------------ */

function useSettingsForm({ schema, record, action, label, normalize }) {
  const router = useRouter();
  const { id, updatedAt, updatedBy, ...rest } = record;
  const defaults = normalize ? normalize(rest) : rest;
  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: defaults,
  });

  const dirty = form.formState.isDirty;
  const submitting = form.formState.isSubmitting;

  // Warn before closing the tab with unsaved edits.
  useEffect(() => {
    if (!dirty) return;
    const handler = (e) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [dirty]);

  const onValid = async (values) => {
    let res;
    try {
      res = await action({ ifUpdatedAt: updatedAt, values });
    } catch (err) {
      console.error(`${label} settings: save threw`, err);
      return toast.error("Couldn't save settings. Please try again.");
    }
    if (!res?.ok) return toast.error(res?.error ?? "Couldn't save settings.");
    toast.success(`${label} settings saved successfully.`);
    router.refresh();
    form.reset(values);
  };

  const onInvalid = (errors) => {
    console.error(`${label} settings: validation failed`, errors);
    const first = firstError(errors);
    toast.error(
      first
        ? `Can't save — ${first[0]}: ${first[1]}`
        : "Can't save — please check the form for errors.",
    );
  };

  const submit = form.handleSubmit(onValid, onInvalid);

  // Ctrl/⌘ + S saves without leaving the keyboard.
  const onKeyDown = (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "s") {
      e.preventDefault();
      if (dirty && !submitting) submit();
    }
  };

  const discard = () => {
    form.reset(defaults);
    toast.message("Changes discarded.");
  };

  return {
    form,
    submit,
    onKeyDown,
    footer: (
      <SaveBar
        dirty={dirty}
        submitting={submitting}
        onDiscard={discard}
        cancelHref="/admin/settings"
        updatedAt={updatedAt}
      />
    ),
  };
}

/* ------------------------------------------------------------------ */
/* General                                                             */
/* ------------------------------------------------------------------ */

export function GeneralSettingsForm({ record }) {
  const { form, submit, onKeyDown, footer } = useSettingsForm({
    schema: generalSchema,
    record,
    action: updateGeneralSettings,
    label: "General",
    normalize: normalizeDefaults,
  });
  const c = form.control;

  const siteName = form.watch("siteName");
  const seoTitle = form.watch("seoTitle");
  const seoDescription = form.watch("seoDescription");
  const description = form.watch("description");
  const ogImage = form.watch("ogImage");
  const social = form.watch("social");

  const socialSet = SOCIAL_FIELDS.filter(
    ([key]) => typeof social?.[key] === "string" && social[key].trim() !== "",
  ).length;

  const previewTitle = seoTitle || siteName || "Your site title";
  const previewDescription =
    seoDescription || description || "Your default description appears here.";
  const ogSrc =
    typeof ogImage === "string" && /^(https?:\/\/|\/)/.test(ogImage)
      ? ogImage
      : null;

  return (
    <form
      onSubmit={submit}
      onKeyDown={onKeyDown}
      noValidate
      className="space-y-6"
    >
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
        description={`Full https:// links. Leave blank to hide. ${socialSet} of ${SOCIAL_FIELDS.length} shown on the site.`}
      >
        <div className="grid gap-5 sm:grid-cols-2">
          {SOCIAL_FIELDS.map(([key, label]) => (
            <TextField
              key={key}
              control={c}
              name={`social.${key}`}
              label={label}
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
        <Counter value={seoTitle} max={SEO_TITLE_MAX} />
        <TextField
          control={c}
          name="seoDescription"
          label="Default description"
          component={Textarea}
          rows={2}
        />
        <Counter value={seoDescription} max={SEO_DESCRIPTION_MAX} />
        <ImageField
          control={c}
          name="ogImage"
          label="Default social image"
          kind="settings"
          description="Shown when links are shared. 1200×630 works best."
        />

        <div className="grid gap-4 lg:grid-cols-2">
          <PreviewFrame title="Search result preview">
            <p className="truncate text-xs text-muted-foreground">
              {siteName || "yoursite.com"}
            </p>
            <p className="mt-0.5 line-clamp-1 text-base text-blue-700 dark:text-blue-400">
              {previewTitle}
            </p>
            <p className="mt-0.5 line-clamp-2 text-sm text-muted-foreground">
              {previewDescription}
            </p>
          </PreviewFrame>

          <PreviewFrame title="Shared link preview">
            <div className="overflow-hidden rounded-md border bg-background">
              <div className="aspect-[1200/630] bg-muted">
                {ogSrc ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={ogSrc} alt="" className="size-full object-cover" />
                ) : (
                  <div className="flex size-full items-center justify-center text-xs text-muted-foreground">
                    No social image yet
                  </div>
                )}
              </div>
              <div className="space-y-0.5 p-3">
                <p className="line-clamp-1 text-sm font-medium">
                  {previewTitle}
                </p>
                <p className="line-clamp-2 text-xs text-muted-foreground">
                  {previewDescription}
                </p>
              </div>
            </div>
          </PreviewFrame>
        </div>
      </FormSection>

      {footer}
    </form>
  );
}

/* ------------------------------------------------------------------ */
/* Security                                                            */
/* ------------------------------------------------------------------ */

export function SecuritySettingsForm({ record }) {
  const { form, submit, onKeyDown, footer } = useSettingsForm({
    schema: securitySchema,
    record,
    action: updateSecuritySettings,
    label: "Security",
  });

  const student = Number(form.watch("sessionDays"));
  const staff = Number(form.watch("staffSessionDays"));
  const staffLonger =
    Number.isFinite(student) && Number.isFinite(staff) && staff > student;

  const applyPreset = (p) => {
    form.setValue("sessionDays", p.student, {
      shouldDirty: true,
      shouldValidate: true,
    });
    form.setValue("staffSessionDays", p.staff, {
      shouldDirty: true,
      shouldValidate: true,
    });
  };

  return (
    <form
      onSubmit={submit}
      onKeyDown={onKeyDown}
      noValidate
      className="space-y-6"
    >
      <FormSection
        title="Sessions"
        description="How long a login lasts before the person has to sign in again. The change applies to new logins. Existing sessions keep their length."
      >
        <div className="space-y-2">
          <p className="text-sm font-medium">Quick presets</p>
          <div className="grid gap-2 sm:grid-cols-3">
            {SESSION_PRESETS.map((p) => {
              const active = student === p.student && staff === p.staff;
              return (
                <button
                  key={p.label}
                  type="button"
                  aria-pressed={active}
                  onClick={() => applyPreset(p)}
                  className={`rounded-lg border p-3 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                    active
                      ? "border-primary/40 bg-primary/5"
                      : "hover:bg-muted/60"
                  }`}
                >
                  <span className="block text-sm font-medium">{p.label}</span>
                  <span className="block text-xs text-muted-foreground">
                    Students / staff: {p.hint}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

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

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-lg border bg-muted/30 px-4 py-3">
            <p className="text-xs text-muted-foreground">
              Students stay signed in for
            </p>
            <p className="text-lg font-medium tabular-nums">
              {formatDays(student)}
            </p>
          </div>
          <div className="rounded-lg border bg-muted/30 px-4 py-3">
            <p className="text-xs text-muted-foreground">
              Staff stay signed in for
            </p>
            <p className="text-lg font-medium tabular-nums">
              {formatDays(staff)}
            </p>
          </div>
        </div>

        {staffLonger && (
          <Notice tone="warn">
            Staff sessions are longer than student sessions. Staff accounts can
            change content, so they usually get the shorter limit.
          </Notice>
        )}
      </FormSection>

      {footer}
    </form>
  );
}

/* ------------------------------------------------------------------ */
/* Notifications                                                       */
/* ------------------------------------------------------------------ */

export function NotificationSettingsForm({ record }) {
  const { form, submit, onKeyDown, footer } = useSettingsForm({
    schema: notificationsSettingsSchema,
    record,
    action: updateNotificationSettings,
    label: "Notification",
  });
  const c = form.control;

  const emailsEnabled = !!form.watch("emailsEnabled");
  const notifyOnContact = !!form.watch("notifyOnContact");
  const toggleValues = form.watch(EMAIL_TOGGLES.map(([k]) => k));
  const onCount = toggleValues.filter(Boolean).length;

  const setAll = (value) => {
    for (const [k] of EMAIL_TOGGLES) {
      form.setValue(k, value, { shouldDirty: true });
    }
  };

  return (
    <form
      onSubmit={submit}
      onKeyDown={onKeyDown}
      noValidate
      className="space-y-6"
    >
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

        {!emailsEnabled && (
          <Notice tone="warn">
            Emails are off. Students won&apos;t get enrollment, payment or
            certificate emails until you turn this back on.
          </Notice>
        )}

        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-sm text-muted-foreground" aria-live="polite">
            {onCount} of {EMAIL_TOGGLES.length} email types on
          </p>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={!emailsEnabled || onCount === EMAIL_TOGGLES.length}
              onClick={() => setAll(true)}
            >
              Turn all on
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={!emailsEnabled || onCount === 0}
              onClick={() => setAll(false)}
            >
              Turn all off
            </Button>
          </div>
        </div>

        <fieldset
          disabled={!emailsEnabled}
          className={`m-0 min-w-0 space-y-4 border-0 p-0 transition-opacity ${
            emailsEnabled ? "" : "opacity-50"
          }`}
        >
          <legend className="sr-only">Email types</legend>
          {EMAIL_TOGGLES.map(([k, l]) => (
            <SwitchField key={k} control={c} name={k} label={l} />
          ))}
        </fieldset>
      </FormSection>

      <FormSection
        title="Admin alerts"
        description="Get told when something needs a reply."
      >
        <SwitchField
          control={c}
          name="notifyOnContact"
          label="Email me when a contact message arrives"
        />
        <fieldset
          disabled={!notifyOnContact}
          className={`m-0 min-w-0 border-0 p-0 transition-opacity ${
            notifyOnContact ? "" : "opacity-50"
          }`}
        >
          <legend className="sr-only">Alert address</legend>
          <TextField
            control={c}
            name="adminAlertEmail"
            label="Alert address"
            type="email"
          />
        </fieldset>
      </FormSection>

      {footer}
    </form>
  );
}
