"use client";

import { useState, useTransition } from "react";
import { FiBell } from "react-icons/fi";
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
  const [saved, setSaved] = useState(false);
  const [pending, startTransition] = useTransition();

  function save() {
    startTransition(async () => {
      await updateNotificationPrefs(prefs);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    });
  }

  return (
    <Card id="notifications" className="scroll-mt-24 gap-4 p-6">
      <SectionTitle icon={FiBell} title="Notifications" />
      <ul className="divide-y">
        {OPTIONS.map(({ key, label, hint }) => (
          <li
            key={key}
            className="flex items-center justify-between gap-4 py-3"
          >
            <div>
              <p className="text-sm font-medium">{label}</p>
              <p className="text-xs text-muted-foreground">{hint}</p>
            </div>
            <Switch
              checked={prefs[key]}
              onCheckedChange={(v) => setPrefs((p) => ({ ...p, [key]: v }))}
              aria-label={label}
            />
          </li>
        ))}
      </ul>
      <div className="flex items-center gap-3">
        <Button onClick={save} disabled={pending} size="sm">
          {pending ? "Saving…" : "Save preferences"}
        </Button>
        {saved && <span className="text-sm text-emerald-600">Saved ✓</span>}
      </div>
    </Card>
  );
}
