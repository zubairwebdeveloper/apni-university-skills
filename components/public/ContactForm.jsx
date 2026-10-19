// components/public/ContactForm.jsx
"use client";

import { useEffect, useRef, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { toast } from "sonner";
import { FiCheckCircle, FiLoader, FiSend } from "react-icons/fi";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CONTACT_SUBJECTS, contactSchema } from "@/lib/validations/contact";
import { submitContact } from "@/app/actions/contact";

const EASE = [0.22, 1, 0.36, 1];
const MAX_MESSAGE = 2000;

export function ContactForm() {
  const reduce = useReducedMotion();
  const [sent, setSent] = useState(false);
  const successRef = useRef(null);

  const form = useForm({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      name: "",
      email: "",
      subject: undefined,
      message: "",
      website: "",
    },
  });
  const message = form.watch("message") ?? "";
  const remaining = MAX_MESSAGE - message.length;

  // Move focus to the confirmation so keyboard and screen reader users land on it.
  useEffect(() => {
    if (sent) successRef.current?.focus();
  }, [sent]);

  async function onSubmit(values) {
    try {
      const res = await submitContact(values);
      if (res?.ok) {
        toast.success("Message sent. We'll get back to you by email.");
        form.reset();
        setSent(true);
      } else {
        toast.error(res?.error ?? "Something went wrong. Please try again.");
      }
    } catch {
      toast.error(
        "We couldn't send your message. Check your connection and try again.",
      );
    }
  }

  const submitting = form.formState.isSubmitting;

  return (
    <AnimatePresence mode="wait" initial={false}>
      {sent ? (
        <motion.div
          key="sent"
          ref={successRef}
          tabIndex={-1}
          role="status"
          initial={reduce ? false : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={reduce ? undefined : { opacity: 0, y: -8 }}
          transition={{ duration: 0.35, ease: EASE }}
          className="rounded-2xl border border-primary/20 bg-primary/5 p-6 text-center outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background sm:p-8"
        >
          <span
            aria-hidden="true"
            className="mx-auto grid size-12 place-items-center rounded-xl border border-primary/20 bg-primary/10 text-primary"
          >
            <FiCheckCircle className="size-6" />
          </span>
          <h3 className="mt-4 font-sans text-lg font-semibold tracking-tight">
            Message sent
          </h3>
          <p className="mx-auto mt-1.5 max-w-sm text-sm leading-relaxed text-muted-foreground">
            Thanks for getting in touch. We&apos;ll get back to you by email.
          </p>
          <Button
            type="button"
            variant="outline"
            className="mt-5"
            onClick={() => setSent(false)}
          >
            Send another message
          </Button>
        </motion.div>
      ) : (
        <motion.form
          key="form"
          onSubmit={form.handleSubmit(onSubmit)}
          noValidate
          aria-busy={submitting}
          initial={reduce ? false : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={reduce ? undefined : { opacity: 0, y: -8 }}
          transition={{ duration: 0.3, ease: EASE }}
          className="relative"
        >
          <div className="mb-8 space-y-5 mt-12">
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3.5 py-2 text-sm font-medium text-foreground shadow-sm">
              <span className="relative flex size-2">
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-500 opacity-60" />
                <span className="relative inline-flex size-2 rounded-full bg-emerald-500" />
              </span>
              We’re here to help
            </div>

            <div className="space-y-3">
              <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
                Let’s start a{" "}
                <span className="text-primary">conversation.</span>
              </h2>

              <p className="max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">
                Have a question about our courses, need technical support, or
                want to share feedback? Send us a message. Our team will review
                your request and get back to you by email.
              </p>
            </div>

            <div className="grid gap-3 pt-2 sm:grid-cols-3">
              <div className="rounded-xl border border-border bg-card p-4 transition-colors hover:border-primary/40">
                <p className="text-sm font-semibold text-foreground">
                  Student Support
                </p>
                <p className="mt-1 text-xs leading-5 text-muted-foreground">
                  Get help with courses and learning.
                </p>
              </div>

              <div className="rounded-xl border border-border bg-card p-4 transition-colors hover:border-primary/40">
                <p className="text-sm font-semibold text-foreground">
                  Technical Help
                </p>
                <p className="mt-1 text-xs leading-5 text-muted-foreground">
                  Let us know if something isn’t working.
                </p>
              </div>

              <div className="rounded-xl border border-border bg-card p-4 transition-colors hover:border-primary/40">
                <p className="text-sm font-semibold text-foreground">
                  Share Feedback
                </p>
                <p className="mt-1 text-xs leading-5 text-muted-foreground">
                  Help us improve your experience.
                </p>
              </div>
            </div>
          </div>

          <FieldGroup>
            <div className="grid gap-5 sm:grid-cols-2">
              <Controller
                name="name"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="c-name">Name</FieldLabel>
                    <Input
                      {...field}
                      id="c-name"
                      autoComplete="name"
                      placeholder="Your full name"
                      disabled={submitting}
                      aria-invalid={fieldState.invalid}
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
              <Controller
                name="email"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="c-email">Email</FieldLabel>
                    <Input
                      {...field}
                      id="c-email"
                      type="email"
                      autoComplete="email"
                      placeholder="you@example.com"
                      disabled={submitting}
                      aria-invalid={fieldState.invalid}
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
            </div>

            <Controller
              name="subject"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="c-subject">Subject</FieldLabel>
                  <Select
                    value={field.value ?? ""}
                    onValueChange={field.onChange}
                    disabled={submitting}
                  >
                    <SelectTrigger
                      id="c-subject"
                      ref={field.ref}
                      onBlur={field.onBlur}
                      className="w-full"
                      aria-invalid={fieldState.invalid}
                    >
                      <SelectValue placeholder="Choose a subject" />
                    </SelectTrigger>
                    <SelectContent>
                      {CONTACT_SUBJECTS.map((s) => (
                        <SelectItem key={s.value} value={s.value}>
                          {s.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            <Controller
              name="message"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="c-message">Message</FieldLabel>
                  <Textarea
                    {...field}
                    id="c-message"
                    rows={6}
                    maxLength={MAX_MESSAGE}
                    placeholder="How can we help? The more detail you share, the easier it is to reply."
                    disabled={submitting}
                    aria-invalid={fieldState.invalid}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                        e.preventDefault();
                        form.handleSubmit(onSubmit)();
                      }
                    }}
                  />
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </div>
                    <span
                      aria-hidden="true"
                      className={cn(
                        "shrink-0 text-xs tabular-nums transition-colors",
                        remaining <= 100
                          ? "font-medium text-foreground"
                          : "text-muted-foreground",
                      )}
                    >
                      {message.length}/{MAX_MESSAGE}
                    </span>
                  </div>
                </Field>
              )}
            />

            {/* Honeypot: hidden from people and assistive tech, and bots tend to fill it */}
            <div
              aria-hidden="true"
              className="absolute -left-[9999px] h-0 w-0 overflow-hidden"
            >
              <label>
                Website
                <input
                  type="text"
                  tabIndex={-1}
                  autoComplete="off"
                  {...form.register("website")}
                />
              </label>
            </div>

            <div className="flex flex-col gap-3 border-t pt-5 sm:flex-row sm:items-center sm:justify-between">
              <Button
                type="submit"
                size="lg"
                disabled={submitting}
                className="group w-full sm:w-fit"
              >
                {submitting ? (
                  <>
                    <FiLoader
                      aria-hidden="true"
                      className="mr-2 size-4 motion-safe:animate-spin"
                    />
                    Sending…
                  </>
                ) : (
                  <>
                    Send message
                    <FiSend
                      aria-hidden="true"
                      className="ml-2 size-4 transition-transform duration-300 motion-safe:group-hover:translate-x-0.5 motion-safe:group-hover:-translate-y-0.5"
                    />
                  </>
                )}
              </Button>
              <p className="hidden text-xs text-muted-foreground sm:block">
                Tip: press{" "}
                <kbd className="rounded border bg-muted px-1.5 py-0.5 font-sans text-[11px] font-medium text-foreground">
                  Ctrl
                </kbd>{" "}
                or{" "}
                <kbd className="rounded border bg-muted px-1.5 py-0.5 font-sans text-[11px] font-medium text-foreground">
                  ⌘
                </kbd>{" "}
                +{" "}
                <kbd className="rounded border bg-muted px-1.5 py-0.5 font-sans text-[11px] font-medium text-foreground">
                  Enter
                </kbd>{" "}
                to send
              </p>
            </div>
          </FieldGroup>
        </motion.form>
      )}
    </AnimatePresence>
  );
}
