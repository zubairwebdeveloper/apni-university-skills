// components/admin/blog/PostRecordActions.jsx: schedule dialog plus the same menu used in the table
"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { FiCalendar, FiStar } from "react-icons/fi";
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

export function PostRecordActions({ record, perms }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [when, setWhen] = useState(toDateTimeInput(record.scheduledFor));
  const [minScheduleTime, setMinScheduleTime] = useState("");
  const [busy, setBusy] = useState(false);
  const live = record.status !== "deleted";
  const canSchedule =
    perms.includes("blog.publish") &&
    ["draft", "pending", "scheduled"].includes(record.status);
  const zone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  async function submit() {
    if (!when) return toast.error("Choose a date and time.");
    setBusy(true);
    const res = await schedulePost({
      slug: record.slug,
      scheduledFor: localToISO(when),
    });
    setBusy(false);
    if (!res.ok) return toast.error(res.error);
    toast.success("Post scheduled successfully.");
    setOpen(false);
    router.refresh();
  }

  return (
    <>
      {canSchedule && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => {
            setMinScheduleTime(toDateTimeInput(Date.now() + 5 * 60e3));
            setOpen(true);
          }}
        >
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
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Schedule “{record.title}”</DialogTitle>
            <DialogDescription>
              It publishes automatically at this time. Publishing runs every few
              minutes, so expect a short delay.
            </DialogDescription>
          </DialogHeader>
          <Field>
            <FieldLabel htmlFor="schedule-at">Publish at</FieldLabel>
            <Input
              id="schedule-at"
              type="datetime-local"
              value={when}
              onChange={(e) => setWhen(e.target.value)}
              min={minScheduleTime}
            />
            <FieldDescription>Your time zone: {zone}</FieldDescription>
          </Field>
          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button type="button" onClick={submit} disabled={busy}>
              {busy ? "Scheduling…" : "Schedule"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

