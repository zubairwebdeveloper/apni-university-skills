// components/sections/Newsletter.jsx
// One file, two exports:
//   Newsletter      -> the full section (variant "card") or compact form (variant "inline")
//   NewsletterForm  -> the simple form that takes a server `action` prop
"use client";

import { useEffect, useId, useRef, useState, useTransition } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import {
  animate,
  AnimatePresence,
  motion,
  useInView,
  useReducedMotion,
} from "framer-motion";
import {
  FiArrowRight,
  FiBell,
  FiCheck,
  FiLoader,
  FiMail,
  FiSend,
  FiShield,
  FiTrendingUp,
  FiUsers,
  FiZap,
} from "react-icons/fi";
import { CheckCircle2, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { newsletterSchema } from "@/lib/validations/newsletter";
import { subscribeToNewsletter } from "@/app/actions/newsletter";
import { cn } from "@/lib/utils";

const FOCUS =
  "outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background";

/* ------------------------------------------------------------------ */
/* Content (edit to match your newsletter)                             */
/* ------------------------------------------------------------------ */

const BENEFITS = [
  { icon: FiZap, text: "One quick lesson you can use the same day" },
  { icon: FiTrendingUp, text: "Career advice and learning roadmaps" },
  { icon: FiBell, text: "Early news about new courses" },
  { icon: FiUsers, text: "Referrals and leads shared by the alumni network" },
];

// Example issue shown in the preview card (labelled "Example issue").
// Colours use theme tokens only, so they follow light and dark mode.
const SAMPLE = [
  {
    tag: "AI",
    color: "bg-primary text-primary-foreground",
    title: "5 AI tools worth trying this week",
  },
  {
    tag: "Web",
    color: "bg-primary/15 text-primary",
    title: "A simple roadmap for learning web development",
  },
  {
    tag: "Career",
    color: "bg-muted text-muted-foreground",
    title: "How to get ready for your first tech job",
  },
];

// Common typos in email domains
const TYPOS = {
  "gmial.com": "gmail.com",
  "gmai.com": "gmail.com",
  "gmil.com": "gmail.com",
  "gnail.com": "gmail.com",
  "gamil.com": "gmail.com",
  "gmail.con": "gmail.com",
  "gmail.co": "gmail.com",
  "hotmial.com": "hotmail.com",
  "hotmal.com": "hotmail.com",
  "yaho.com": "yahoo.com",
  "yahooo.com": "yahoo.com",
  "outlok.com": "outlook.com",
};

function suggestEmail(value) {
  const v = String(value ?? "").trim();
  const at = v.lastIndexOf("@");
  if (at < 1) return null;
  const fix = TYPOS[v.slice(at + 1).toLowerCase()];
  return fix ? `${v.slice(0, at)}@${fix}` : null;
}

// Confetti directions (fixed, no randomness). Theme colours only.
const CONFETTI = Array.from({ length: 16 }, (_, i) => ({
  angle: (i / 16) * Math.PI * 2,
  dist: 52 + (i % 4) * 14,
  color: [
    "bg-primary",
    "bg-primary/60",
    "bg-foreground/40",
    "bg-primary/35",
    "bg-muted-foreground/60",
  ][i % 5],
  size: 5 + (i % 3) * 2,
  rot: (i % 2 ? 1 : -1) * (120 + i * 20),
}));

/* ------------------------------------------------------------------ */
/* Small pieces                                                        */
/* ------------------------------------------------------------------ */

function CountUp({ to, suffix = "" }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const reduce = useReducedMotion();

  useEffect(() => {
    if (!inView || !ref.current) return;
    const fmt = (v) => Math.round(v).toLocaleString("en-US") + suffix;
    if (reduce) {
      ref.current.textContent = fmt(to);
      return;
    }
    const c = animate(0, to, {
      duration: 1.6,
      ease: "easeOut",
      onUpdate: (v) => {
        if (ref.current) ref.current.textContent = fmt(v);
      },
    });
    return () => c.stop();
  }, [inView, reduce, to, suffix]);

  return <span ref={ref}>{`0${suffix}`}</span>;
}

// Little burst of confetti around the button (not rendered when reduced motion is on)
function Confetti() {
  return (
    <span
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 grid place-items-center"
    >
      {CONFETTI.map((p, i) => (
        <motion.span
          key={i}
          className={cn("absolute rounded-[2px]", p.color)}
          style={{ width: p.size, height: p.size }}
          initial={{ x: 0, y: 0, scale: 0, opacity: 1, rotate: 0 }}
          animate={{
            x: Math.cos(p.angle) * p.dist,
            y: Math.sin(p.angle) * p.dist - 10,
            scale: [0, 1, 0.7],
            opacity: [1, 1, 0],
            rotate: p.rot,
          }}
          transition={{ duration: 0.9, ease: "easeOut" }}
        />
      ))}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/* Form used inside <Newsletter> (React Hook Form + zod)               */
/* ------------------------------------------------------------------ */

function SubscribeForm({ subscribers }) {
  const reduce = useReducedMotion();
  const emailId = useId();
  const [subscribed, setSubscribed] = useState(false);
  const [burst, setBurst] = useState(0);

  // Only show a count when a real, positive number is supplied.
  const showCount = Number(subscribers) > 0;

  const form = useForm({
    resolver: zodResolver(newsletterSchema),
    defaultValues: { email: "" },
  });

  const submitting = form.formState.isSubmitting;
  const email = form.watch("email") ?? "";
  const emailFix = suggestEmail(email);
  const looksValid = /\S+@\S+\.\S+/.test(email);

  async function onSubmit(values) {
    const res = await subscribeToNewsletter(values);
    if (res.ok) {
      toast.success("You're subscribed. Welcome aboard!");
      form.reset();
      setSubscribed(true);
      setBurst((n) => n + 1);
    } else {
      toast.error(res.error);
    }
  }

  // Return the button to normal after a few seconds (cleaned up on unmount)
  useEffect(() => {
    if (!subscribed) return;
    const t = setTimeout(() => setSubscribed(false), 4000);
    return () => clearTimeout(t);
  }, [subscribed]);

  // Remove the confetti once it has finished
  useEffect(() => {
    if (!burst) return;
    const t = setTimeout(() => setBurst(0), 1100);
    return () => clearTimeout(t);
  }, [burst]);

  return (
    <div className="w-full">
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        noValidate
        className="flex w-full flex-col gap-3 sm:flex-row sm:items-start"
      >
        <Controller
          name="email"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid} className="flex-1">
              <FieldLabel htmlFor={emailId} className="sr-only">
                Email address
              </FieldLabel>

              <div className="group relative">
                <FiMail
                  className="pointer-events-none absolute left-3 top-1/2 z-10 size-4 -translate-y-1/2 text-muted-foreground transition-colors duration-200 group-focus-within:text-primary motion-reduce:transition-none"
                  aria-hidden="true"
                />
                <Input
                  {...field}
                  id={emailId}
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  aria-invalid={fieldState.invalid}
                  className="h-11 bg-background pl-9 pr-12"
                />

                {/* "Enter" hint appears once the email looks right */}
                <AnimatePresence>
                  {looksValid && !submitting && (
                    <motion.kbd
                      aria-hidden="true"
                      initial={reduce ? false : { opacity: 0, scale: 0.7 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.7 }}
                      transition={{ duration: reduce ? 0 : 0.15 }}
                      className="absolute right-2.5 top-1/2 z-10 -translate-y-1/2 rounded border border-border bg-muted px-1.5 py-0.5 font-sans text-[10px] font-medium text-muted-foreground"
                    >
                      ↵
                    </motion.kbd>
                  )}
                </AnimatePresence>
              </div>

              {fieldState.invalid ? (
                <FieldError errors={[fieldState.error]} />
              ) : (
                <FieldDescription className="flex items-center gap-1">
                  <FiShield className="size-3" aria-hidden="true" />
                  No spam. Unsubscribe anytime.
                </FieldDescription>
              )}

              {/* "Did you mean gmail.com?" */}
              <AnimatePresence initial={false}>
                {emailFix && (
                  <motion.button
                    type="button"
                    key={emailFix}
                    initial={
                      reduce ? false : { opacity: 0, y: -6, scale: 0.96 }
                    }
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: reduce ? 0 : -6 }}
                    transition={{ duration: reduce ? 0 : 0.2 }}
                    onClick={() =>
                      form.setValue("email", emailFix, {
                        shouldValidate: true,
                        shouldDirty: true,
                      })
                    }
                    className="mt-1 inline-flex min-h-9 w-fit cursor-pointer items-center gap-1.5 rounded-full border border-primary/40 bg-primary/10 px-3 py-1 text-xs outline-none transition-colors duration-200 hover:bg-primary/15 focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none"
                  >
                    Did you mean{" "}
                    <span className="font-semibold text-primary">
                      {emailFix}
                    </span>
                    ?
                  </motion.button>
                )}
              </AnimatePresence>
            </Field>
          )}
        />

        <div className="relative sm:w-auto">
          {burst > 0 && !reduce && <Confetti key={burst} />}
          <Button
            type="submit"
            disabled={submitting}
            className={cn(
              "h-11 w-full cursor-pointer px-5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md active:translate-y-0 active:scale-95 disabled:cursor-not-allowed disabled:opacity-80 motion-reduce:transition-none motion-reduce:hover:translate-y-0 motion-reduce:active:scale-100 sm:w-auto",
              // Success state: green-700 + white keeps contrast in both themes
              subscribed &&
                "bg-green-700 text-white hover:bg-green-700 disabled:opacity-100",
            )}
          >
            {submitting ? (
              <span className="flex items-center gap-2">
                <FiLoader
                  className="size-4 motion-safe:animate-spin"
                  aria-hidden="true"
                />
                Subscribing…
              </span>
            ) : subscribed ? (
              <span className="flex items-center gap-2">
                <FiCheck className="size-4" aria-hidden="true" />
                Subscribed
              </span>
            ) : (
              <span className="group flex items-center gap-2">
                Subscribe
                <FiArrowRight
                  className="size-4 transition-transform duration-200 group-hover:translate-x-1 motion-reduce:transition-none motion-reduce:group-hover:translate-x-0"
                  aria-hidden="true"
                />
              </span>
            )}
          </Button>
        </div>
      </form>

      {/* Announces success to screen readers (the toast may be missed) */}
      <p className="sr-only" role="status" aria-live="polite">
        {subscribed ? "You are subscribed to the newsletter." : ""}
      </p>

      {/* Trust line: only with a real subscriber count, never a placeholder */}
      {showCount && (
        <p className="mt-3 text-center text-xs text-muted-foreground sm:text-left">
          Join{" "}
          <span className="font-semibold text-primary">
            <CountUp to={Number(subscribers)} suffix="+" />
          </span>{" "}
          learners getting weekly tips on AI, web dev, and careers.
        </p>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Sample issue preview                                                */
/* ------------------------------------------------------------------ */

function SamplePreview() {
  const reduce = useReducedMotion();

  return (
    <motion.div
      aria-hidden="true"
      initial={reduce ? false : { opacity: 0, x: 30, rotate: 5 }}
      whileInView={{ opacity: 1, x: 0, rotate: reduce ? 0 : 2 }}
      whileHover={reduce ? undefined : { rotate: 0, y: -4 }}
      viewport={{ once: true }}
      transition={{ type: "spring", stiffness: 160, damping: 18 }}
      className="hidden w-full max-w-xs justify-self-center lg:block"
    >
      <motion.div
        animate={reduce ? undefined : { y: [0, -6, 0] }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
        className="overflow-hidden rounded-2xl border border-border bg-background shadow-xl shadow-black/10"
      >
        <div className="flex items-center gap-2 border-b border-border bg-muted/50 px-4 py-2.5">
          <span className="grid size-6 place-items-center rounded-md bg-primary text-primary-foreground">
            <FiSend className="size-3" />
          </span>
          <div className="min-w-0 leading-tight">
            <p className="truncate text-xs font-semibold">This week in tech</p>
            <p className="text-[10px] text-muted-foreground">Example issue</p>
          </div>
        </div>

        <ul className="divide-y divide-border">
          {SAMPLE.map((s, i) => (
            <motion.li
              key={s.title}
              initial={reduce ? false : { opacity: 0, x: 12 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: reduce ? 0 : 0.3 + i * 0.12 }}
              className="space-y-1.5 px-4 py-3"
            >
              <span
                className={cn(
                  "inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold",
                  s.color,
                )}
              >
                {s.tag}
              </span>
              <p className="text-xs font-medium leading-snug">{s.title}</p>
              <span className="block h-1.5 w-4/5 rounded-full bg-muted" />
            </motion.li>
          ))}
        </ul>

        {/* Facts taken from this component itself, nothing invented. */}
        <div className="flex items-center justify-between border-t border-border bg-muted/30 px-4 py-2 text-[10px] text-muted-foreground">
          <span>Weekly newsletter</span>
          <span>{SAMPLE.length} short reads</span>
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/* Export 1: the section                                               */
/* ------------------------------------------------------------------ */

// variant="card"   -> full section card with benefits and a sample issue
// variant="inline" -> compact form (good for the footer)
// subscribers      -> pass a REAL count to show the trust line; omit to hide it
export function Newsletter({ variant = "card", subscribers, className }) {
  const reduce = useReducedMotion();

  if (variant === "inline") {
    return (
      <div className={cn("mx-auto w-full max-w-md", className)}>
        <SubscribeForm subscribers={subscribers} />
      </div>
    );
  }

  return (
    <motion.section
      aria-labelledby="newsletter-title"
      initial={reduce ? false : { opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: reduce ? 0 : 0.6, ease: [0.22, 1, 0.36, 1] }}
      className={cn("mx-auto w-full max-w-4xl", className)}
    >
      <Card className="relative gap-0 overflow-hidden rounded-3xl border-border bg-card p-6 py-6 text-card-foreground shadow-lg shadow-black/10 sm:p-10 sm:py-10">
        {/* Background: two soft, static glows. No animation, no gradients. */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
        >
          <div className="absolute -left-16 -top-16 size-64 rounded-full bg-primary/10 blur-3xl" />
          <div className="absolute -bottom-20 -right-10 size-72 rounded-full bg-primary/10 blur-3xl" />
        </div>

        <div className="relative grid items-center gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:gap-12">
          <div>
            {/* Eyebrow */}
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-background/70 px-3 py-1 font-mono text-xs font-medium uppercase tracking-widest text-primary">
              <span className="relative flex size-2">
                <span className="absolute inline-flex size-full rounded-full bg-primary/70 motion-safe:animate-ping" />
                <span className="relative inline-flex size-2 rounded-full bg-primary" />
              </span>
              Weekly newsletter
            </div>

            {/* Heading with a mail badge */}
            <div className="mt-4 flex items-start gap-4">
              <span
                aria-hidden="true"
                className="relative grid size-12 shrink-0 place-items-center rounded-2xl bg-primary text-primary-foreground shadow-md shadow-black/10"
              >
                <FiMail className="size-6" />
                <span className="absolute -right-1 -top-1 size-3 rounded-full bg-foreground/70 ring-2 ring-card" />
              </span>

              <div>
                <h2
                  id="newsletter-title"
                  className="text-balance font-sans text-[clamp(1.5rem,3vw,2rem)] font-semibold leading-tight tracking-tight"
                >
                  Learn something new every week
                </h2>
                <p className="mt-1.5 text-pretty text-sm leading-6 text-muted-foreground sm:text-base">
                  Short, practical tips on AI, web development and careers, sent
                  straight to your inbox.
                </p>
              </div>
            </div>

            {/* Benefits */}
            <ul className="mt-6 space-y-2.5">
              {BENEFITS.map(({ icon: Icon, text }, i) => (
                <motion.li
                  key={text}
                  initial={reduce ? false : { opacity: 0, x: -14 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: reduce ? 0 : 0.2 + i * 0.1 }}
                  className="group flex items-center gap-3 text-sm"
                >
                  <span className="grid size-7 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary transition-all duration-200 group-hover:scale-110 group-hover:bg-primary group-hover:text-primary-foreground motion-reduce:transition-none motion-reduce:group-hover:scale-100">
                    <Icon className="size-3.5" aria-hidden="true" />
                  </span>
                  {text}
                </motion.li>
              ))}
            </ul>

            {/* Form */}
            <div className="mt-7">
              <SubscribeForm subscribers={subscribers} />
            </div>
          </div>

          <SamplePreview />
        </div>
      </Card>
    </motion.section>
  );
}

/* ------------------------------------------------------------------ */
/* Export 2: the simple form that takes a server action                */
/* ------------------------------------------------------------------ */

// `action` is a server action: ({ email }) => { ok, error?, message? }
export function NewsletterForm({ action }) {
  const [pending, startTransition] = useTransition();
  const [status, setStatus] = useState({ type: "idle", message: "" });
  // Unique ids, so this form never clashes with <Newsletter> on the same page.
  const baseId = useId();
  const emailId = `${baseId}-email`;
  const statusId = `${baseId}-status`;

  function onSubmit(event) {
    event.preventDefault();

    // Read the form before awaiting; currentTarget is cleared afterwards.
    const form = event.currentTarget;
    const email = String(new FormData(form).get("email") ?? "").trim();
    if (!email) return;

    setStatus({ type: "idle", message: "" });

    startTransition(async () => {
      try {
        const res = await action({ email });

        if (res?.ok) {
          setStatus({
            type: "success",
            message: res.message ?? "You're subscribed. Check your inbox.",
          });
          form.reset();
        } else {
          setStatus({
            type: "error",
            message: res?.error ?? "Could not subscribe. Please try again.",
          });
        }
      } catch (error) {
        console.error(error);
        setStatus({
          type: "error",
          message: "Something went wrong. Please try again.",
        });
      }
    });
  }

  return (
    <div className="w-full max-w-sm">
      <form
        onSubmit={onSubmit}
        className="flex w-full flex-col gap-2.5 sm:flex-row"
        aria-busy={pending}
      >
        <label htmlFor={emailId} className="sr-only">
          Email address
        </label>
        <input
          id={emailId}
          name="email"
          type="email"
          autoComplete="email"
          required
          disabled={pending}
          placeholder="you@example.com"
          aria-invalid={status.type === "error"}
          aria-describedby={statusId}
          className="h-12 flex-1 rounded-lg border border-border bg-card px-4 text-sm text-card-foreground outline-none transition-colors placeholder:text-muted-foreground hover:border-primary/40 focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-ring/30 disabled:opacity-60 motion-reduce:transition-none"
        />
        <button
          type="submit"
          disabled={pending}
          className={`inline-flex h-12 shrink-0 cursor-pointer items-center justify-center gap-2 rounded-lg bg-primary px-6 text-sm font-semibold text-primary-foreground transition-all duration-200 hover:brightness-110 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70 motion-reduce:transition-none motion-reduce:active:scale-100 ${FOCUS}`}
        >
          {pending && (
            <Loader2
              className="size-4 animate-spin motion-reduce:animate-none"
              aria-hidden="true"
            />
          )}
          {pending ? "Subscribing…" : "Subscribe"}
        </button>
      </form>

      <div id={statusId} aria-live="polite" className="mt-3 min-h-5">
        {status.type === "success" && (
          <p className="flex items-center justify-center gap-1.5 text-sm font-medium text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="size-4" aria-hidden="true" />
            {status.message}
          </p>
        )}
        {status.type === "error" && (
          <p
            role="alert"
            className="text-center text-sm font-medium text-destructive"
          >
            {status.message}
          </p>
        )}
      </div>
    </div>
  );
}
