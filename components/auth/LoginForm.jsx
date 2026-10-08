// components/auth/LoginForm.jsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signInWithEmailAndPassword, signOut } from "firebase/auth";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowRight, Check, Info, Loader2, Sparkles } from "lucide-react";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { FieldGroup } from "@/components/ui/field";
import { TextField } from "@/components/shared/TextField";
import { PasswordInput } from "./PasswordInput";
import { SocialAuth } from "./GoogleButton";
import { auth, startServerSession } from "@/lib/firebase/client/auth";
import { authErrorMessage } from "@/lib/firebase/client/errors";
import { loginSchema } from "@/lib/validations/auth";
import { cn } from "@/lib/utils";

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

// Only the email is remembered (never the password), and only if the person opts in.
const EMAIL_KEY = "apni:last-email";

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

const list = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07, delayChildren: 0.1 } },
};

const item = {
  hidden: { opacity: 0, y: 14 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] },
  },
};

// Small hint that expands in and out smoothly
function Hint({ show, children, tone = "info" }) {
  const reduce = useReducedMotion();
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
              tone === "warn"
                ? "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300"
                : "border-primary/20 bg-primary/5 text-foreground/80",
            )}
          >
            <Info aria-hidden="true" className="mt-0.5 size-3.5 shrink-0" />
            <span>{children}</span>
          </p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ------------------------------------------------------------------ */
/* Form                                                                */
/* ------------------------------------------------------------------ */

export function LoginForm({ next }) {
  const router = useRouter();
  const reduce = useReducedMotion();

  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const [googleBusy, setGoogleBusy] = useState(false);
  const [remember, setRemember] = useState(false);
  const [fails, setFails] = useState(0);
  const [shake, setShake] = useState(0);
  const [caps, setCaps] = useState(false);
  const [inPassword, setInPassword] = useState(false);

  const form = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });
  const { setValue, setFocus } = form;

  const submitting = form.formState.isSubmitting;
  const emailValue = form.watch("email");
  const emailFix = suggestEmail(emailValue);

  // Prefill the remembered email and put the cursor in the right field
  useEffect(() => {
    let saved = "";
    try {
      saved = localStorage.getItem(EMAIL_KEY) || "";
    } catch {
      /* storage can be blocked: ignore */
    }
    if (saved) {
      setValue("email", saved);
      setRemember(true);
    }
    const t = setTimeout(() => {
      try {
        setFocus(saved ? "password" : "email");
      } catch {
        /* field not focusable: ignore */
      }
    }, 350);
    return () => clearTimeout(t);
  }, [setValue, setFocus]);

  async function onSubmit(v) {
    setError("");
    setDone(false);
    try {
      const cred = await signInWithEmailAndPassword(auth, v.email, v.password);
      await startServerSession(cred.user);

      try {
        if (remember) localStorage.setItem(EMAIL_KEY, v.email.trim());
        else localStorage.removeItem(EMAIL_KEY);
      } catch {
        /* ignore */
      }

      setDone(true);
      router.replace(next);
      router.refresh();
    } catch (e) {
      setDone(false);
      setFails((n) => n + 1);
      setShake((n) => n + 1);
      setError(authErrorMessage(e));
      await signOut(auth).catch(() => {}); // keep client and server state consistent
    }
  }

  return (
    <motion.form
      onSubmit={form.handleSubmit(onSubmit, () => setShake((n) => n + 1))}
      noValidate
      variants={list}
      initial={reduce ? false : "hidden"}
      animate="show"
      className="relative"
      // Caps Lock detection while typing in the password field
      onKeyUp={(e) => {
        if (e.getModifierState) setCaps(e.getModifierState("CapsLock"));
      }}
      onFocus={(e) => setInPassword(e.target.name === "password")}
      onBlur={(e) => {
        if (e.target.name === "password") setInPassword(false);
      }}
    >
      <FieldGroup>
        {/* Error: slides in and shakes once */}
        <AnimatePresence initial={false}>
          {error && (
            <motion.div
              key={`${error}-${fails}`}
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

        {/* After repeated failures, point to the password reset */}
        <Hint show={fails >= 2 && !done}>
          Still can&apos;t get in?{" "}
          <Link
            href="/forgot-password"
            className="cursor-pointer font-medium text-primary underline-offset-4 hover:underline"
          >
            Reset your password
          </Link>
          .
        </Hint>

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
                  setValue("email", emailFix, {
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

        {/* Password */}
        <motion.div variants={item} className="space-y-2">
          <TextField
            control={form.control}
            name="password"
            label="Password"
            component={PasswordInput}
            autoComplete="current-password"
          />
          <Hint show={caps && inPassword} tone="warn">
            Caps Lock is on. Your password is case-sensitive.
          </Hint>
        </motion.div>

        {/* Remember me + forgot password */}
        <motion.div
          variants={item}
          className="-mt-1 flex items-center justify-between gap-3 text-sm"
        >
          <label className="group inline-flex cursor-pointer select-none items-center gap-2 text-foreground/80">
            <input
              type="checkbox"
              checked={remember}
              onChange={(e) => setRemember(e.target.checked)}
              className="peer sr-only"
            />
            <span className="grid size-[18px] place-items-center rounded-md border bg-background transition-all duration-200 group-hover:border-primary/60 peer-checked:border-primary peer-checked:bg-primary peer-focus-visible:ring-2 peer-focus-visible:ring-ring peer-checked:[&>svg]:scale-100 motion-reduce:transition-none">
              <Check
                aria-hidden="true"
                className="size-3 scale-0 text-primary-foreground transition-transform duration-200 motion-reduce:transition-none"
              />
            </span>
            Remember my email
          </label>

          <Link
            href="/forgot-password"
            className="group inline-flex cursor-pointer items-center gap-1 text-primary underline-offset-4 outline-none hover:underline focus-visible:underline"
          >
            Forgot password?
            <ArrowRight
              aria-hidden="true"
              className="size-3.5 -translate-x-1 opacity-0 transition-all duration-200 group-hover:translate-x-0 group-hover:opacity-100 group-focus-visible:translate-x-0 group-focus-visible:opacity-100 motion-reduce:transition-none"
            />
          </Link>
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
                  <span className="relative">Success! Redirecting…</span>
                </>
              ) : submitting ? (
                <>
                  <Loader2
                    aria-hidden="true"
                    className="relative size-4 animate-spin"
                  />
                  <span className="relative">Logging in…</span>
                </>
              ) : (
                <>
                  <span className="relative">Log in</span>
                  <ArrowRight
                    aria-hidden="true"
                    className="relative size-4 transition-transform duration-200 group-hover:translate-x-1 motion-reduce:transition-none motion-reduce:group-hover:translate-x-0"
                  />
                </>
              )}
            </Button>
          </motion.div>
        </motion.div>

        {/* Google sign-in, below the main button */}
        <motion.div variants={item}>
          <SocialAuth
            next={next}
            onError={setError}
            onBusyChange={setGoogleBusy}
            disabled={submitting}
          />
        </motion.div>
      </FieldGroup>

      {/* Success overlay: a check mark draws itself */}
      <AnimatePresence>
        {done && (
          <motion.div
            initial={reduce ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0 z-10 grid place-content-center justify-items-center gap-3 rounded-xl bg-card/90 text-center backdrop-blur-sm"
          >
            <svg
              viewBox="0 0 64 64"
              className="size-20 text-emerald-500"
              fill="none"
              stroke="currentColor"
              strokeWidth="4"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <motion.circle
                cx="32"
                cy="32"
                r="26"
                initial={reduce ? false : { pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
              />
              <motion.path
                d="M20 33 L29 42 L45 24"
                initial={reduce ? false : { pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.4, delay: 0.4, ease: "easeOut" }}
              />
            </svg>
            <div role="status">
              <p className="font-sans text-lg font-semibold text-foreground">
                Welcome back!
              </p>
              <p className="mt-0.5 text-sm text-foreground/70">
                Taking you to your account…
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.form>
  );
}
