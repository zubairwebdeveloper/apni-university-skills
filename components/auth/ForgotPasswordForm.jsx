// components/auth/ForgotPasswordForm.jsx
// Hamesha same success message dikhata hai, taake emails probe na ho saken.
"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { sendPasswordResetEmail } from "firebase/auth";
import {
  ArrowLeft,
  CircleAlert,
  KeyRound,
  Loader2,
  MailCheck,
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { FieldGroup } from "@/components/ui/field";
import { TextField } from "@/components/shared/TextField";
import { auth } from "@/lib/firebase/client/auth";
import { authErrorMessage } from "@/lib/firebase/client/errors";
import { forgotSchema } from "@/lib/validations/auth";

const RESEND_SECONDS = 60;

// "user-not-found" ko silently ignore karte hain: response hamesha same rehta hai.
async function requestReset(email) {
  try {
    await sendPasswordResetEmail(auth, email, {
      url: `${window.location.origin}/login`,
      handleCodeInApp: false,
    });
  } catch (e) {
    if (e?.code === "auth/user-not-found") return;
    throw e;
  }
}

function ErrorAlert({ message }) {
  if (!message) return null;
  return (
    <Alert variant="destructive" role="alert">
      <CircleAlert />
      <AlertDescription>{message}</AlertDescription>
    </Alert>
  );
}

function BackToLogin() {
  return (
    <Link
      href="/login"
      className={buttonVariants({
        variant: "ghost",
        className: "w-full text-muted-foreground",
      })}
    >
      <ArrowLeft />
      Back to log in
    </Link>
  );
}

function AuthCard({ icon: Icon, title, description, children, footer }) {
  return (
    <Card className="w-full max-w-md shadow-sm">
      <CardHeader className="items-center text-center">
        <div className="mb-2 flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
          <Icon className="size-6" aria-hidden="true" />
        </div>
        <CardTitle className="text-xl">{title}</CardTitle>
        <CardDescription className="text-balance">
          {description}
        </CardDescription>
      </CardHeader>
      <CardContent>{children}</CardContent>
      {footer && <CardFooter className="flex-col gap-2">{footer}</CardFooter>}
    </Card>
  );
}

export function ForgotPasswordForm() {
  const [sentTo, setSentTo] = useState("");
  const [error, setError] = useState("");
  const [cooldown, setCooldown] = useState(0);
  const [resending, setResending] = useState(false);

  const form = useForm({
    resolver: zodResolver(forgotSchema),
    defaultValues: { email: "" },
  });
  const { isSubmitting } = form.formState;

  // Form dikhte hi email field par focus.
  useEffect(() => {
    if (!sentTo) form.setFocus("email");
  }, [sentTo, form]);

  // Resend countdown.
  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  async function onSubmit(v) {
    setError("");
    try {
      await requestReset(v.email);
      setSentTo(v.email);
      setCooldown(RESEND_SECONDS);
    } catch (e) {
      setError(authErrorMessage(e));
    }
  }

  async function onResend() {
    setError("");
    setResending(true);
    try {
      await requestReset(sentTo);
      setCooldown(RESEND_SECONDS);
    } catch (e) {
      setError(authErrorMessage(e));
    } finally {
      setResending(false);
    }
  }

  function useAnotherEmail() {
    setSentTo("");
    setError("");
    setCooldown(0);
  }

  if (sentTo)
    return (
      <AuthCard
        icon={MailCheck}
        title="Check your email"
        description={
          <>
            If an account exists for{" "}
            <span className="font-medium text-foreground">{sentTo}</span>, a
            reset link is on its way.
          </>
        }
        footer={<BackToLogin />}
      >
        <div className="space-y-4" role="status" aria-live="polite">
          <ErrorAlert message={error} />

          <ul className="space-y-1.5 rounded-lg bg-muted/60 p-4 text-sm text-muted-foreground">
            <li>Check your spam or promotions folder.</li>
            <li>The link expires in 1 hour.</li>
            <li>Only the most recent link will work.</li>
          </ul>

          <div className="flex flex-col gap-2">
            <Button
              type="button"
              variant="outline"
              size="lg"
              onClick={onResend}
              disabled={cooldown > 0 || resending}
            >
              {resending && <Loader2 className="animate-spin" />}
              {resending
                ? "Sending…"
                : cooldown > 0
                  ? `Resend email in ${cooldown}s`
                  : "Resend email"}
            </Button>
            <Button type="button" variant="link" onClick={useAnotherEmail}>
              Use a different email
            </Button>
          </div>
        </div>
      </AuthCard>
    );

  return (
    <AuthCard
      icon={KeyRound}
      title="Forgot your password?"
      description="Enter the email you signed up with and we'll send you a link to reset it."
      footer={<BackToLogin />}
    >
      <form onSubmit={form.handleSubmit(onSubmit)} noValidate>
        <FieldGroup>
          <ErrorAlert message={error} />
          <TextField
            control={form.control}
            name="email"
            label="Email"
            type="email"
            autoComplete="email"
          />
          <Button type="submit" size="lg" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="animate-spin" />}
            {isSubmitting ? "Sending…" : "Send reset link"}
          </Button>
        </FieldGroup>
      </form>
    </AuthCard>
  );
}
