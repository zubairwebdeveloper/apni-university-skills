// components/student/SettingsPanels.jsx
"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  EmailAuthProvider,
  reauthenticateWithCredential,
  sendEmailVerification,
  updatePassword,
} from "firebase/auth";
import { toast } from "sonner";
import { KeyRound, Loader2, LogOut, MailCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FieldGroup } from "@/components/ui/field";
import { TextField } from "@/components/shared/TextField";
import { PasswordInput } from "@/components/auth/PasswordInput";
import {
  auth,
  endServerSession,
  startServerSession,
} from "@/lib/firebase/client/auth";
import { authErrorMessage } from "@/lib/firebase/client/errors";
import { changePasswordSchema } from "@/lib/validations/auth";
import { signOutEverywhere } from "@/app/actions/student";

function Spinner() {
  return (
    <Loader2
      aria-hidden="true"
      className="size-4 animate-spin motion-reduce:animate-none"
    />
  );
}

export function ChangePasswordForm() {
  const form = useForm({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: { currentPassword: "", password: "", confirmPassword: "" },
  });

  async function onSubmit(v) {
    const user = auth.currentUser;
    if (!user?.email) return toast.error("Please log in again.");
    try {
      await reauthenticateWithCredential(
        user,
        EmailAuthProvider.credential(user.email, v.currentPassword),
      );
      await updatePassword(user, v.password);
      await startServerSession(user); // changing a password revokes old tokens, so mint a fresh session cookie
      toast.success("Password updated");
      form.reset();
    } catch (e) {
      toast.error(authErrorMessage(e));
    }
  }

  const { isSubmitting } = form.formState;

  return (
    <form
      onSubmit={form.handleSubmit(onSubmit)}
      noValidate
      aria-busy={isSubmitting}
      className="max-w-xl"
    >
      <FieldGroup>
        <TextField
          control={form.control}
          name="currentPassword"
          label="Current password"
          component={PasswordInput}
          autoComplete="current-password"
        />
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
        <div className="flex flex-col gap-3 border-t border-border pt-5 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-muted-foreground">
            You will stay signed in on this device after updating.
          </p>
          <Button
            type="submit"
            size="lg"
            className="sm:w-fit"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Spinner />
                Updating…
              </>
            ) : (
              <>
                <KeyRound aria-hidden="true" className="size-4" />
                Update password
              </>
            )}
          </Button>
        </div>
      </FieldGroup>
    </form>
  );
}

export function SignOutEverywhere() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  async function run() {
    setBusy(true);
    const res = await signOutEverywhere();
    if (!res.ok) {
      setBusy(false);
      return toast.error(res.error);
    }
    await endServerSession();
    router.replace("/login");
    router.refresh();
  }
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <p className="max-w-md text-sm leading-relaxed text-muted-foreground">
        End your session on every device, including this one. You will need to
        log in again.
      </p>
      <Button
        type="button"
        variant="outline"
        onClick={run}
        disabled={busy}
        aria-busy={busy}
        className="shrink-0"
      >
        {busy ? (
          <>
            <Spinner />
            Signing out…
          </>
        ) : (
          <>
            <LogOut aria-hidden="true" className="size-4" />
            Sign out of all devices
          </>
        )}
      </Button>
    </div>
  );
}

export function ResendVerification() {
  const [sending, setSending] = useState(false);

  async function resend() {
    setSending(true);
    try {
      await sendEmailVerification(auth.currentUser);
      toast.success("Verification email sent.");
    } catch (e) {
      toast.error(authErrorMessage(e));
    } finally {
      setSending(false);
    }
  }
  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={resend}
      disabled={sending}
      aria-busy={sending}
    >
      {sending ? (
        <>
          <Spinner />
          Sending…
        </>
      ) : (
        <>
          <MailCheck aria-hidden="true" className="size-4" />
          Resend verification email
        </>
      )}
    </Button>
  );
}
