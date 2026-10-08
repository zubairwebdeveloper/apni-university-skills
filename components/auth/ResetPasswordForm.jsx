// components/auth/ResetPasswordForm.jsx
"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { confirmPasswordReset, verifyPasswordResetCode } from "firebase/auth";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button, buttonVariants } from "@/components/ui/button";
import { FieldGroup } from "@/components/ui/field";
import { TextField } from "@/components/shared/TextField";
import { PasswordInput } from "./PasswordInput";
import { auth } from "@/lib/firebase/client/auth";
import { authErrorMessage } from "@/lib/firebase/client/errors";
import { resetSchema } from "@/lib/validations/auth";

export function ResetPasswordForm({ oobCode }) {
  const [state, setState] = useState(oobCode ? "checking" : "invalid"); // checking | ready | invalid | done
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const form = useForm({
    resolver: zodResolver(resetSchema),
    defaultValues: { password: "", confirmPassword: "" },
  });

  useEffect(() => {
    if (!oobCode) return;
    verifyPasswordResetCode(auth, oobCode)
      .then((e) => {
        setEmail(e);
        setState("ready");
      })
      .catch(() => setState("invalid"));
  }, [oobCode]);

  async function onSubmit(v) {
    setError("");
    try {
      await confirmPasswordReset(auth, oobCode, v.password);
      setState("done");
    } catch (e) {
      setError(authErrorMessage(e));
    }
  }

  if (state === "checking")
    return (
      <p role="status" className="text-sm text-muted-foreground">
        Checking your link…
      </p>
    );
  if (state === "invalid")
    return (
      <div className="space-y-5">
        <Alert variant="destructive" role="alert">
          <AlertDescription>
            This reset link is invalid or has expired.
          </AlertDescription>
        </Alert>
        <Link
          href="/forgot-password"
          className={buttonVariants({ className: "w-full" })}
        >
          Request a new link
        </Link>
      </div>
    );
  if (state === "done")
    return (
      <div className="space-y-5" role="status">
        <Alert>
          <AlertDescription>Your password has been updated.</AlertDescription>
        </Alert>
        <Link href="/login" className={buttonVariants({ className: "w-full" })}>
          Log in
        </Link>
      </div>
    );

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} noValidate>
      <FieldGroup>
        <p className="text-sm text-muted-foreground">
          Choose a new password for{" "}
          <strong className="text-foreground">{email}</strong>.
        </p>
        {error && (
          <Alert variant="destructive" role="alert">
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
        <Button type="submit" size="lg" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? "Saving…" : "Update password"}
        </Button>
      </FieldGroup>
    </form>
  );
}

