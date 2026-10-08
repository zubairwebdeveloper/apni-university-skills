// components/auth/RegisterForm.jsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
  updateProfile,
} from "firebase/auth";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowRight, Check, Info, Loader2, Sparkles } from "lucide-react";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { TextField } from "@/components/shared/TextField";
import { PasswordInput } from "./PasswordInput";
import { SocialAuth } from "./GoogleButton";
import { auth, startServerSession } from "@/lib/firebase/client/auth";
import { authErrorMessage } from "@/lib/firebase/client/errors";
import { registerSchema } from "@/lib/validations/auth";
import { cn } from "@/lib/utils";

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

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

// Rules shown to the person (they match the hint in the schema)
function passwordRules(pw) {
  return [
    { id: "len", label: "At least 8 characters", ok: pw.length >= 8 },
    { id: "letter", label: "A letter", ok: /[A-Za-z]/.test(pw) },
    { id: "num", label: "A number", ok: /\d/.test(pw) },
  ];
}

// 0 (empty) to 4 (strong)
function passwordStrength(pw) {
  if (!pw) return 0;
  let s = 0;
  if (pw.length >= 8) s++;
  if (/[A-Za-z]/.test(pw) && /\d/.test(pw)) s++;
  if (pw.length >= 12 || (/[a-z]/.test(pw) && /[A-Z]/.test(pw))) s++;
  if (/[^A-Za-z0-9]/.test(pw)) s++;
  return Math.max(1, s);
}

const STRENGTH = [
  null,
  { label: "Weak", bar: "bg-red-500", text: "text-red-600 dark:text-red-400" },
  {
    label: "Fair",
    bar: "bg-orange-500",
    text: "text-orange-600 dark:text-orange-400",
  },
  {
    label: "Good",
    bar: "bg-amber-400",
    text: "text-amber-600 dark:text-amber-300",
  },
  {
    label: "Strong",
    bar: "bg-emerald-500",
    text: "text-emerald-600 dark:text-emerald-400",
  },
];

const list = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06, delayChildren: 0.1 } },
};

const item = {
  hidden: { opacity: 0, y: 14 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] },
  },
};

/* ------------------------------------------------------------------ */
/* Small pieces                                                        */
/* ------------------------------------------------------------------ */

// Hint that expands in and out smoothly
function Hint({ show, children, tone = "info", icon: Icon = Info }) {
  const reduce = useReducedMotion();
  const tones = {
    info: "border-primary/20 bg-primary/5 text-foreground/80",
    warn: "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300",
    success:
      "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  };

  return (
    <AnimatePresence initial={false}>
      {show && (
        <motion.div
          initial={reduce ? false : { opacity: 0, height: 0, y: -4 }}
          animate={{ opacity: 1, height: "auto", y: 0 }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.25 }}
          className="overflow-hidden"
        >
          <p
            role="status"
            className={cn(
              "flex items-start gap-2 rounded-lg border px-3 py-2 text-xs leading-relaxed",
              tones[tone],
            )}
          >
            <Icon aria-hidden="true" className="mt-0.5 size-3.5 shrink-0" />
            <span>{children}</span>
          </p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Strength bar + checklist whose ticks pop in as each rule is met
function PasswordMeter({ password }) {
  const reduce = useReducedMotion();
  const level = passwordStrength(password);
  const info = STRENGTH[level];
  const rules = passwordRules(password);

  return (
    <AnimatePresence initial={false}>
      {password && (
        <motion.div
          initial={reduce ? false : { opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.25 }}
          className="overflow-hidden"
        >
          <div className="space-y-2.5 pt-1">
            {/* Four segments */}
            <div className="flex items-center gap-3">
              <div
                className="grid flex-1 grid-cols-4 gap-1.5"
                role="meter"
                aria-label="Password strength"
                aria-valuemin={0}
                aria-valuemax={4}
                aria-valuenow={level}
              >
                {[0, 1, 2, 3].map((i) => (
                  <span
                    key={i}
                    className="h-1.5 overflow-hidden rounded-full bg-muted"
                  >
                    <motion.span
                      className={cn("block h-full rounded-full", info?.bar)}
                      initial={false}
                      animate={{ width: i < level ? "100%" : "0%" }}
                      transition={{
                        duration: reduce ? 0 : 0.3,
                        delay: reduce ? 0 : i * 0.04,
                      }}
                    />
                  </span>
                ))}
              </div>
              <span
                className={cn(
                  "w-14 text-right text-xs font-semibold transition-colors duration-200",
                  info?.text,
                )}
              >
                {info?.label}
              </span>
            </div>

            {/* Rules */}
            <ul className="grid gap-1.5 sm:grid-cols-3">
              {rules.map((r) => (
                <li
                  key={r.id}
                  className={cn(
                    "flex items-center gap-1.5 text-xs transition-colors duration-200",
                    r.ok
                      ? "text-emerald-600 dark:text-emerald-400"
                      : "text-foreground/60",
                  )}
                >
                  <span
                    className={cn(
                      "grid size-4 place-items-center rounded-full border transition-colors duration-200",
                      r.ok
                        ? "border-emerald-500 bg-emerald-500"
                        : "border-border",
                    )}
                  >
                    <AnimatePresence initial={false}>
                      {r.ok && (
                        <motion.span
                          initial={reduce ? false : { scale: 0 }}
                          animate={{ scale: 1 }}
                          exit={{ scale: 0 }}
                          transition={{
                            type: "spring",
                            stiffness: 500,
                            damping: 18,
                          }}
                          className="grid place-items-center"
                        >
                          <Check
                            aria-hidden="true"
                            className="size-2.5 text-white"
                            strokeWidth={4}
                          />
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </span>
                  {r.label}
                </li>
              ))}
            </ul>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Thin bar that fills as the form gets completed
function Progress({ done, total }) {
  const reduce = useReducedMotion();
  return (
    <div className="space-y-1.5" aria-hidden="true">
      <div className="flex items-center justify-between text-xs text-foreground/60">
        <span>Your progress</span>
        <span className="tabular-nums">
          {done} of {total}
        </span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-muted">
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-primary/60 to-primary"
          initial={false}
          animate={{ width: `${(done / total) * 100}%` }}
          transition={
            reduce
              ? { duration: 0 }
              : { type: "spring", stiffness: 140, damping: 22 }
          }
        />
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Form                                                                */
/* ------------------------------------------------------------------ */

// `next` is where Google sign-up sends the person. Pass it from the page if needed.
export function RegisterForm({ next = "/student" }) {
  const router = useRouter();
  const reduce = useReducedMotion();

  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const [googleBusy, setGoogleBusy] = useState(false);
  const [shake, setShake] = useState(0);
  const [caps, setCaps] = useState(false);
  const [inPassword, setInPassword] = useState(false);

  const form = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      displayName: "",
      email: "",
      password: "",
      confirmPassword: "",
      acceptTerms: false,
    },
  });

  const submitting = form.formState.isSubmitting;

  // Live values for the helpers
  const name = form.watch("displayName") ?? "";
  const email = form.watch("email") ?? "";
  const password = form.watch("password") ?? "";
  const confirm = form.watch("confirmPassword") ?? "";
  const terms = form.watch("acceptTerms");

  const firstName = name.trim().split(/\s+/)[0];
  const emailFix = suggestEmail(email);
  const rulesOk = passwordRules(password).every((r) => r.ok);
  const matches = confirm.length > 0 && confirm === password;
  const mismatch =
    confirm.length > 0 && password.length > 0 && confirm !== password;

  const steps = [
    name.trim().length >= 2,
    /\S+@\S+\.\S+/.test(email),
    rulesOk,
    matches,
    Boolean(terms),
  ];
  const doneSteps = steps.filter(Boolean).length;

  async function onSubmit(v) {
    setError("");
    setDone(false);
    try {
      const { user } = await createUserWithEmailAndPassword(
        auth,
        v.email,
        v.password,
      );
      await updateProfile(user, { displayName: v.displayName });
      await sendEmailVerification(user).catch(() => {}); // the verify page offers a resend
      await startServerSession(user); // the server creates users/{uid} with role "student"

      setDone(true);
      router.refresh();
    } catch (e) {
      setDone(false);
      setShake((n) => n + 1);
      setError(authErrorMessage(e));
    }
  }

  return (
    <motion.form
      onSubmit={form.handleSubmit(onSubmit, () => setShake((n) => n + 1))}
      noValidate
      variants={list}
      initial={reduce ? false : "hidden"}
      animate="show"
      // Caps Lock detection while typing in a password field
      onKeyUp={(e) => {
        if (e.getModifierState) setCaps(e.getModifierState("CapsLock"));
      }}
      onFocus={(e) =>
        setInPassword(
          e.target.name === "password" || e.target.name === "confirmPassword",
        )
      }
      onBlur={(e) => {
        if (e.target.name === "password" || e.target.name === "confirmPassword")
          setInPassword(false);
      }}
    >
      <FieldGroup>
        {/* Error: slides in and shakes once */}
        <AnimatePresence initial={false}>
          {error && (
            <motion.div
              key={error}
              initial={reduce ? false : { opacity: 0, y: -8 }}
              animate={
                reduce
                  ? { opacity: 1, y: 0 }
                  : { opacity: 1, y: 0, x: [0, -8, 8, -6, 6, 0] }
              }
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.45 }}
            >
              <Alert variant="destructive" role="alert">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div variants={item}>
          <Progress done={doneSteps} total={steps.length} />
        </motion.div>

        {/* Full name */}
        <motion.div variants={item} className="space-y-2">
          <TextField
            control={form.control}
            name="displayName"
            label="Full name"
            autoComplete="name"
          />
          <Hint show={name.trim().length >= 2} tone="success" icon={Sparkles}>
            Nice to meet you, {firstName}!
          </Hint>
        </motion.div>

        {/* Email */}
        <motion.div variants={item} className="space-y-2">
          <TextField
            control={form.control}
            name="email"
            label="Email"
            type="email"
            autoComplete="email"
          />

          {/* "Did you mean gmail.com?" */}
          <AnimatePresence initial={false}>
            {emailFix && (
              <motion.button
                type="button"
                key={emailFix}
                initial={reduce ? false : { opacity: 0, y: -6, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.2 }}
                onClick={() =>
                  form.setValue("email", emailFix, {
                    shouldValidate: true,
                    shouldDirty: true,
                  })
                }
                className="group inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-primary/30 bg-primary/5 px-3 py-1 text-xs text-foreground/80 outline-none transition-colors duration-200 hover:bg-primary/10 focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none"
              >
                <Sparkles aria-hidden="true" className="size-3 text-primary" />
                Did you mean{" "}
                <span className="font-semibold text-primary">{emailFix}</span>?
              </motion.button>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Password + strength */}
        <motion.div variants={item} className="space-y-2">
          <TextField
            control={form.control}
            name="password"
            label="Password"
            component={PasswordInput}
            autoComplete="new-password"
          />
          <PasswordMeter password={password} />
          <Hint show={caps && inPassword} tone="warn">
            Caps Lock is on. Passwords are case-sensitive.
          </Hint>
        </motion.div>

        {/* Confirm password + live match */}
        <motion.div variants={item} className="space-y-2">
          <TextField
            control={form.control}
            name="confirmPassword"
            label="Confirm password"
            component={PasswordInput}
            autoComplete="new-password"
          />
          <Hint show={matches} tone="success" icon={Check}>
            Passwords match.
          </Hint>
          <Hint show={mismatch} tone="warn">
            Passwords don&apos;t match yet.
          </Hint>
        </motion.div>

        {/* Terms */}
        <motion.div variants={item}>
          <Controller
            name="acceptTerms"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field orientation="horizontal" data-invalid={fieldState.invalid}>
                <Checkbox
                  id="f-terms"
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  aria-invalid={fieldState.invalid}
                  className="cursor-pointer"
                />
                <FieldLabel
                  htmlFor="f-terms"
                  className="cursor-pointer font-normal"
                >
                  I agree to the{" "}
                  <Link
                    href="/terms"
                    className="text-primary underline-offset-4 hover:underline"
                  >
                    Terms
                  </Link>{" "}
                  and{" "}
                  <Link
                    href="/privacy"
                    className="text-primary underline-offset-4 hover:underline"
                  >
                    Privacy Policy
                  </Link>
                </FieldLabel>
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
        </motion.div>

        {/* Submit (shakes when the form is invalid) */}
        <motion.div variants={item}>
          <motion.div
            key={shake}
            animate={
              shake > 0 && !reduce ? { x: [0, -8, 8, -5, 5, 0] } : undefined
            }
            transition={{ duration: 0.4 }}
          >
            <Button
              type="submit"
              size="lg"
              disabled={submitting || googleBusy}
              aria-live="polite"
              className={cn(
                "group relative w-full cursor-pointer gap-2 overflow-hidden shadow-md shadow-primary/20 transition-all duration-200",
                "hover:-translate-y-0.5 hover:shadow-lg hover:shadow-primary/30 active:translate-y-0 active:scale-[0.98]",
                "disabled:cursor-not-allowed disabled:opacity-90",
                "motion-reduce:transition-none motion-reduce:hover:translate-y-0 motion-reduce:active:scale-100",
                done && "bg-emerald-600 hover:bg-emerald-600",
              )}
            >
              {/* Shine sweep */}
              <span
                aria-hidden="true"
                className="pointer-events-none absolute inset-y-0 -left-full w-1/2 skew-x-[-20deg] bg-gradient-to-r from-transparent via-white/30 to-transparent transition-transform duration-700 group-hover:translate-x-[320%] group-disabled:hidden motion-reduce:hidden"
              />

              {done ? (
                <>
                  <Check aria-hidden="true" className="relative size-4" />
                  <span className="relative">Account created!</span>
                </>
              ) : submitting ? (
                <>
                  <Loader2
                    aria-hidden="true"
                    className="relative size-4 animate-spin"
                  />
                  <span className="relative">Creating account…</span>
                </>
              ) : (
                <>
                  <span className="relative">Create account</span>
                  <ArrowRight
                    aria-hidden="true"
                    className="relative size-4 transition-transform duration-200 group-hover:translate-x-1 motion-reduce:transition-none motion-reduce:group-hover:translate-x-0"
                  />
                </>
              )}
            </Button>
          </motion.div>
        </motion.div>

        {/* Google sign-up, below the main button */}
        <motion.div variants={item}>
          <SocialAuth
            next={next}
            label="Sign up with Google"
            onError={setError}
            onBusyChange={setGoogleBusy}
            disabled={submitting}
          />
        </motion.div>
      </FieldGroup>
    </motion.form>
  );
}
