// components/auth/ResetPasswordForm.jsx
"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { confirmPasswordReset, verifyPasswordResetCode } from "firebase/auth";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, CircleAlert, CircleCheck, Loader2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button, buttonVariants } from "@/components/ui/button";
import { FieldGroup } from "@/components/ui/field";
import { TextField } from "@/components/shared/TextField";
import { PasswordInput } from "./PasswordInput";
import { auth } from "@/lib/firebase/client/auth";
import { authErrorMessage } from "@/lib/firebase/client/errors";
import { resetSchema } from "@/lib/validations/auth";

// Same codes verifyPasswordResetCode already treats as a dead link.
// The oobCode can still expire or get consumed between the initial
// check and the moment the person actually submits (slow typing, a
// second tab on the same link), so confirmPasswordReset can fail for
// the identical reason — route that case to the same "invalid" screen
// instead of a generic inline error the person can't act on.
const BAD_CODE = new Set([
  "auth/expired-action-code",
  "auth/invalid-action-code",
]);

// Soft fade/rise whenever the visible state changes.
function Reveal({ children, className }) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

function StatusIcon({ icon: Icon, tone }) {
  return (
    <div
      className={
        tone === "success"
          ? "mx-auto grid size-12 place-items-center rounded-full bg-emerald-500/10 text-emerald-700 ring-1 ring-emerald-600/20 dark:text-emerald-400"
          : "mx-auto grid size-12 place-items-center rounded-full bg-destructive/10 text-destructive ring-1 ring-destructive/20"
      }
    >
      <Icon className="size-6" aria-hidden="true" />
    </div>
  );
}

export function ResetPasswordForm({ oobCode }) {
  const [state, setState] = useState(oobCode ? "checking" : "invalid"); // checking | ready | invalid | done
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const form = useForm({
    resolver: zodResolver(resetSchema),
    defaultValues: { password: "", confirmPassword: "" },
  });
  const { setFocus } = form;
  const submitting = form.formState.isSubmitting;

  useEffect(() => {
    if (!oobCode) return;
    verifyPasswordResetCode(auth, oobCode)
      .then((e) => {
        setEmail(e);
        setState("ready");
      })
      .catch(() => setState("invalid"));
  }, [oobCode]);

  // Cursor goes straight to the new-password field once the link is verified.
  useEffect(() => {
    if (state !== "ready") return;
    const t = setTimeout(() => {
      try {
        setFocus("password");
      } catch {
        /* field not focusable: ignore */
      }
    }, 150);
    return () => clearTimeout(t);
  }, [state, setFocus]);

  async function onSubmit(v) {
    setError("");
    try {
      await confirmPasswordReset(auth, oobCode, v.password);
      setState("done");
    } catch (e) {
      if (BAD_CODE.has(e?.code)) {
        setState("invalid");
        return;
      }
      setError(authErrorMessage(e));
    }
  }

  if (state === "checking")
    return (
      <div
        role="status"
        aria-busy="true"
        className="flex flex-col items-center gap-3 py-6 text-center"
      >
        <Loader2
          aria-hidden="true"
          className="size-6 animate-spin text-primary motion-reduce:animate-none"
        />
        <p className="text-sm text-muted-foreground">Checking your link…</p>
      </div>
    );

  if (state === "invalid")
    return (
      <Reveal className="space-y-5">
        <StatusIcon icon={CircleAlert} tone="error" />
        <Alert variant="destructive" role="alert">
          <AlertDescription>
            This reset link is invalid or has expired.
          </AlertDescription>
        </Alert>
        <Link
          href="/forgot-password"
          className={buttonVariants({
            size: "lg",
            className:
              "w-full focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
          })}
        >
          Request a new link
        </Link>
      </Reveal>
    );

  if (state === "done")
    return (
      <Reveal className="space-y-5">
        <div role="status" className="space-y-5">
          <StatusIcon icon={CircleCheck} tone="success" />
          <Alert>
            <AlertDescription>Your password has been updated.</AlertDescription>
          </Alert>
        </div>
        <Link
          href="/login"
          className={buttonVariants({
            size: "lg",
            className:
              "group w-full gap-2 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
          })}
        >
          Log in
          <ArrowRight
            aria-hidden="true"
            className="size-4 transition-transform duration-200 group-hover:translate-x-1 motion-reduce:transition-none motion-reduce:group-hover:translate-x-0"
          />
        </Link>
      </Reveal>
    );

  return (
    <Reveal>
      <form onSubmit={form.handleSubmit(onSubmit)} noValidate>
        <FieldGroup>
          <p className="text-sm text-muted-foreground">
            Choose a new password for{" "}
            <strong className="break-all font-medium text-foreground">
              {email}
            </strong>
            .
          </p>
          {error && (
            <Alert variant="destructive" role="alert">
              <CircleAlert />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <TextField
            control={form.control}
            name="password"
            label="New password"
            component={PasswordInput}
            autoComplete="new-password"
            description="At least 8 characters, with a letter and a number."
          />
          <TextField
            control={form.control}
            name="confirmPassword"
            label="Confirm new password"
            component={PasswordInput}
            autoComplete="new-password"
          />
          <Button
            type="submit"
            size="lg"
            disabled={submitting}
            className="gap-2 shadow-sm shadow-primary/25 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            {submitting && (
              <Loader2 aria-hidden="true" className="size-4 animate-spin" />
            )}
            {submitting ? "Saving…" : "Update password"}
          </Button>
        </FieldGroup>
      </form>
    </Reveal>
  );
}
