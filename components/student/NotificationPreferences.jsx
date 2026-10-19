"use client";

import { useEffect, useState, useTransition } from "react";
import { FiBell, FiCheck } from "react-icons/fi";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { SectionTitle } from "@/components/student/SectionTitle";
import { updateNotificationPrefs } from "@/app/student/settings/actions";

const OPTIONS = [
  {
    key: "courseUpdates",
    label: "Course updates",
    hint: "New lessons and announcements from your instructors.",
  },
  {
    key: "paymentReceipts",
    label: "Payment receipts",
    hint: "Confirmation emails for purchases and refunds.",
  },
  {
    key: "jobAlerts",
    label: "Job alerts",
    hint: "Openings that match your learning.",
  },
  {
    key: "newsletter",
    label: "Newsletter & tips",
    hint: "Occasional tutorials and platform news.",
  },
];

export function NotificationPreferences({ initial = {} }) {
  const [prefs, setPrefs] = useState({
    courseUpdates: true,
    paymentReceipts: true,
    jobAlerts: false,
    newsletter: false,
    ...initial,
  });
  // The last version that was saved, used to tell whether anything changed.
  const [baseline, setBaseline] = useState(prefs);
  const [saved, setSaved] = useState(false);
  const [pending, startTransition] = useTransition();

  const dirty = OPTIONS.some(({ key }) => prefs[key] !== baseline[key]);

  // Hide the "Saved" message after a moment, and clean up if we unmount first.
  useEffect(() => {
    if (!saved) return;
    const t = setTimeout(() => setSaved(false), 2000);
    return () => clearTimeout(t);
  }, [saved]);

  function save() {
    startTransition(async () => {
      try {
        const res = await updateNotificationPrefs(prefs);
        if (res && res.ok === false) {
          toast.error(res.error || "Couldn't save your preferences.");
          return;
        }
        setBaseline(prefs);
        setSaved(true);
      } catch {
        toast.error("Couldn't save your preferences. Please try again.");
      }
    });
  }

  return (
    <Card id="notifications" className="scroll-mt-24 gap-4 p-6">
      <SectionTitle icon={FiBell} title="Notifications" />

      <p className="text-sm text-muted-foreground">
        Choose which updates you&apos;d like to receive.
      </p>

      <ul className="divide-y rounded-xl border">
        {OPTIONS.map(({ key, label, hint }) => (
          <li
            key={key}
            className="flex items-center justify-between gap-4 px-4 py-3.5"
          >
            <div className="min-w-0">
              <label
                htmlFor={`notif-${key}`}
                className="block cursor-pointer text-sm font-medium"
              >
                {label}
              </label>
              <p
                id={`notif-${key}-hint`}
                className="mt-0.5 text-xs leading-relaxed text-muted-foreground"
              >
                {hint}
              </p>
            </div>
            <Switch
              id={`notif-${key}`}
              checked={prefs[key]}
              onCheckedChange={(v) => setPrefs((p) => ({ ...p, [key]: v }))}
              disabled={pending}
              aria-describedby={`notif-${key}-hint`}
              className="shrink-0"
            />
          </li>
        ))}
      </ul>

      <div className="flex flex-wrap items-center gap-3">
        <Button onClick={save} disabled={pending || !dirty} size="sm">
          {pending ? "Saving…" : "Save preferences"}
        </Button>

        <p className="text-sm" role="status" aria-live="polite">
          {saved ? (
            <span className="inline-flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400">
              <FiCheck className="size-4" aria-hidden="true" />
              Preferences saved
            </span>
          ) : dirty && !pending ? (
            <span className="text-muted-foreground">
              You have unsaved changes
            </span>
          ) : null}
        </p>
      </div>
    </Card>
  );
}
