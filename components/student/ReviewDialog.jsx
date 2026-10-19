// components/student/ReviewDialog.jsx
"use client";
import { useId, useState } from "react";
import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Loader2, PenLine, Send, ShieldCheck, Star } from "lucide-react";
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
import { cn } from "@/lib/utils";
import { reviewSchema } from "@/lib/validations/review";
import { submitReview } from "@/app/actions/student";

const RATING_HINTS = {
  1: "Poor",
  2: "Fair",
  3: "Good",
  4: "Very good",
  5: "Excellent",
};

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

  const { isSubmitting } = form.formState;
  const titleLength = (form.watch("title") ?? "").length;
  const commentLength = (form.watch("comment") ?? "").length;

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
        <PenLine aria-hidden="true" className="size-4" />
        {label}
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90dvh] overflow-y-auto rounded-2xl sm:max-w-lg">
          <DialogHeader>
            <div className="flex items-start gap-3">
              <span
                aria-hidden="true"
                className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary"
              >
                <Star className="size-5" />
              </span>
              <div className="min-w-0 space-y-1.5 text-left">
                <DialogTitle className="break-words text-lg font-semibold leading-snug tracking-tight">
                  Review: {courseTitle}
                </DialogTitle>
                <DialogDescription className="flex items-start gap-1.5">
                  <ShieldCheck
                    aria-hidden="true"
                    className="mt-0.5 size-4 shrink-0 text-primary"
                  />
                  Reviews are checked by our team before they appear publicly.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <form onSubmit={form.handleSubmit(onSubmit)} noValidate>
            <FieldGroup>
              <Controller
                name="rating"
                control={form.control}
                render={({ field, fieldState }) => {
                  const selected = Number(field.value) || 0;
                  return (
                    <FieldSet data-invalid={fieldState.invalid}>
                      <FieldLegend variant="label">Rating</FieldLegend>
                      <RadioGroup
                        value={String(field.value ?? "")}
                        onValueChange={field.onChange}
                        className="flex flex-wrap gap-2"
                      >
                        {[1, 2, 3, 4, 5].map((n) => {
                          const filled = n <= selected;
                          return (
                            <Field
                              key={n}
                              orientation="horizontal"
                              className="relative w-auto"
                            >
                              <RadioGroupItem
                                value={String(n)}
                                id={`${uid}-r${n}`}
                                className="peer sr-only"
                              />
                              <FieldLabel
                                htmlFor={`${uid}-r${n}`}
                                className={cn(
                                  "grid size-11 cursor-pointer place-items-center rounded-xl border font-normal transition-colors peer-focus-visible:ring-2 peer-focus-visible:ring-ring peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-background motion-reduce:transition-none",
                                  filled
                                    ? "border-primary/40 bg-primary/10 text-primary"
                                    : "border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-primary",
                                )}
                              >
                                <Star
                                  aria-hidden="true"
                                  className={cn(
                                    "size-5",
                                    filled && "fill-current",
                                  )}
                                />
                                <span className="sr-only">
                                  {n} {n === 1 ? "star" : "stars"}
                                </span>
                              </FieldLabel>
                            </Field>
                          );
                        })}
                      </RadioGroup>
                      <p
                        aria-live="polite"
                        className="text-sm text-muted-foreground"
                      >
                        {selected
                          ? `${selected} of 5 stars · ${RATING_HINTS[selected]}`
                          : "Select a rating from 1 to 5 stars."}
                      </p>
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </FieldSet>
                  );
                }}
              />
              <TextField
                control={form.control}
                name="title"
                id={`${uid}-title`}
                label="Title (optional)"
                component={Input}
                maxLength={80}
                description={`${titleLength}/80`}
              />
              <TextField
                control={form.control}
                name="comment"
                id={`${uid}-comment`}
                label="Your review"
                component={Textarea}
                rows={5}
                maxLength={1000}
                description={`${commentLength}/1000`}
              />
            </FieldGroup>
            <DialogFooter className="mt-6 gap-2 sm:gap-2">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2
                      aria-hidden="true"
                      className="size-4 animate-spin motion-reduce:animate-none"
                    />
                    Submitting…
                  </>
                ) : (
                  <>
                    <Send aria-hidden="true" className="size-4" />
                    Submit review
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
