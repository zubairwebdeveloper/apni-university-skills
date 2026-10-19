// components/admin/blog/PostRecordActions.jsx: schedule dialog plus the same menu used in the table
"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { FiAlertCircle, FiCalendar, FiClock, FiStar } from "react-icons/fi";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { RowActions } from "@/components/admin/table/RowActions";
import { lifecycleItems } from "@/components/admin/table/lifecycle";
import { localToISO, toDateTimeInput } from "@/lib/utils/date";
import {
  runPostAction,
  schedulePost,
  setPostFeatured,
} from "@/app/actions/admin/blog";

// Quick picks, computed when clicked so they are always relative to "now".
const PRESETS = [
  { label: "In 1 hour", at: () => Date.now() + 60 * 60e3 },
  {
    label: "Tomorrow, 9:00",
    at: () => {
      const d = new Date();
      d.setDate(d.getDate() + 1);
      d.setHours(9, 0, 0, 0);
      return d.getTime();
    },
  },
];

export function PostRecordActions({ record, perms }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [when, setWhen] = useState(toDateTimeInput(record.scheduledFor));
  const [minScheduleTime, setMinScheduleTime] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const live = record.status !== "deleted";
  const canSchedule =
    perms.includes("blog.publish") &&
    ["draft", "pending", "scheduled"].includes(record.status);
  const zone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  function openDialog() {
    setMinScheduleTime(toDateTimeInput(Date.now() + 5 * 60e3));
    // Start from the saved schedule (if any) each time, not from a stale edit.
    setWhen(toDateTimeInput(record.scheduledFor));
    setError("");
    setOpen(true);
  }

  function pick(value) {
    setWhen(value);
    setError("");
  }

  async function submit(event) {
    event?.preventDefault();
    if (busy) return;

    if (!when) {
      setError("Choose a date and time.");
      return toast.error("Choose a date and time.");
    }
    if (Date.parse(localToISO(when)) <= Date.now()) {
      setError("Pick a time in the future.");
      return;
    }

    setError("");
    setBusy(true);
    try {
      const res = await schedulePost({
        slug: record.slug,
        scheduledFor: localToISO(when),
      });
      if (!res.ok) {
        setError(res.error);
        return toast.error(res.error);
      }
      toast.success("Post scheduled successfully.");
      setOpen(false);
      router.refresh();
    } catch {
      // Network or server failure: never leave the button stuck on "Scheduling…".
      const message = "Couldn't schedule the post. Please try again.";
      setError(message);
      toast.error(message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      {canSchedule && (
        <Button type="button" variant="outline" size="sm" onClick={openDialog}>
          <FiCalendar aria-hidden="true" />
          {record.status === "scheduled" ? "Reschedule" : "Schedule"}
        </Button>
      )}
      <RowActions
        label={record.title}
        items={[
          {
            key: "feature",
            label: record.featured ? "Remove featured" : "Feature",
            icon: FiStar,
            hidden: !perms.includes("blog.update") || !live,
            run: () =>
              setPostFeatured({
                slug: record.slug,
                featured: !record.featured,
              }),
            success: record.featured
              ? "Post is no longer featured."
              : "Post featured successfully.",
          },
          ...lifecycleItems({
            row: record,
            perms,
            prefix: "blog",
            noun: "Post",
            run: runPostAction,
          }),
        ]}
      />
      {/* Can't be dismissed mid-request, so a result is never missed. */}
      <Dialog open={open} onOpenChange={(next) => !busy && setOpen(next)}>
        <DialogContent className="sm:max-w-md">
          <form onSubmit={submit} noValidate className="space-y-5">
            <DialogHeader>
              <DialogTitle>Schedule “{record.title}”</DialogTitle>
              <DialogDescription>
                It publishes automatically at this time. Publishing runs every
                few minutes, so expect a short delay.
              </DialogDescription>
            </DialogHeader>

            <Field>
              <FieldLabel htmlFor="schedule-at">Publish at</FieldLabel>
              <Input
                id="schedule-at"
                type="datetime-local"
                value={when}
                onChange={(e) => pick(e.target.value)}
                min={minScheduleTime}
                aria-invalid={error ? true : undefined}
                aria-describedby={error ? "schedule-error" : undefined}
              />
              <FieldDescription className="flex items-center gap-1.5">
                <FiClock aria-hidden="true" className="size-3.5" />
                Your time zone: {zone}
              </FieldDescription>
            </Field>

            <div
              className="flex flex-wrap gap-2"
              role="group"
              aria-label="Quick picks"
            >
              {PRESETS.map((preset) => (
                <Button
                  key={preset.label}
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => pick(toDateTimeInput(preset.at()))}
                >
                  {preset.label}
                </Button>
              ))}
            </div>

            {error && (
              <p
                id="schedule-error"
                role="alert"
                className="flex items-start gap-2 text-sm text-destructive"
              >
                <FiAlertCircle
                  aria-hidden="true"
                  className="mt-0.5 size-4 shrink-0"
                />
                {error}
              </p>
            )}

            <DialogFooter>
              <Button
                type="button"
                variant="ghost"
                disabled={busy}
                onClick={() => setOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={busy}>
                {busy ? "Scheduling…" : "Schedule"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
