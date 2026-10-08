// components/student/ReviewDialog.jsx
"use client";
import { useId, useState } from "react";
import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
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
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "@/components/ui/field";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { TextField } from "@/components/shared/TextField";
import { reviewSchema } from "@/lib/validations/review";
import { submitReview } from "@/app/actions/student";

export function ReviewDialog({
  courseSlug,
  courseTitle,
  existing = null,
  label = "Write a review",
}) {
  const router = useRouter();
  const uid = useId();
  const [open, setOpen] = useState(false);
  const form = useForm({
    resolver: zodResolver(reviewSchema),
    defaultValues: {
      courseSlug,
      rating: existing ? String(existing.rating) : "",
      title: existing?.title ?? "",
      comment: existing?.comment ?? "",
    },
  });

  async function onSubmit(v) {
    const res = await submitReview(v);
    if (!res.ok) return toast.error(res.error);
    toast.success("Thanks! Your review will appear after moderation.");
    setOpen(false);
    router.refresh();
  }

  return (
    <>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => setOpen(true)}
      >
        {label}
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Review: {courseTitle}</DialogTitle>
            <DialogDescription>
              Reviews are checked by our team before they appear publicly.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={form.handleSubmit(onSubmit)} noValidate>
            <FieldGroup>
              <Controller
                name="rating"
                control={form.control}
                render={({ field, fieldState }) => (
                  <FieldSet data-invalid={fieldState.invalid}>
                    <FieldLegend variant="label">Rating</FieldLegend>
                    <RadioGroup
                      value={String(field.value ?? "")}
                      onValueChange={field.onChange}
                      className="flex flex-wrap gap-4"
                    >
                      {[1, 2, 3, 4, 5].map((n) => (
                        <Field
                          key={n}
                          orientation="horizontal"
                          className="w-auto"
                        >
                          <RadioGroupItem
                            value={String(n)}
                            id={`${uid}-r${n}`}
                          />
                          <FieldLabel
                            htmlFor={`${uid}-r${n}`}
                            className="font-normal"
                          >
                            {n} {n === 1 ? "star" : "stars"}
                          </FieldLabel>
                        </Field>
                      ))}
                    </RadioGroup>
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </FieldSet>
                )}
              />
              <TextField
                control={form.control}
                name="title"
                id={`${uid}-title`}
                label="Title (optional)"
                component={Input}
                maxLength={80}
              />
              <TextField
                control={form.control}
                name="comment"
                id={`${uid}-comment`}
                label="Your review"
                component={Textarea}
                rows={5}
                maxLength={1000}
              />
            </FieldGroup>
            <DialogFooter className="mt-6">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? "Submitting…" : "Submit review"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}

