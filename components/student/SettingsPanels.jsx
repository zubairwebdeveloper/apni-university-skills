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

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} noValidate>
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
        <Button
          type="submit"
          className="sm:w-fit"
          disabled={form.formState.isSubmitting}
        >
          {form.formState.isSubmitting ? "Updating…" : "Update password"}
        </Button>
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
    <Button type="button" variant="outline" onClick={run} disabled={busy}>
      {busy ? "Signing out…" : "Sign out of all devices"}
    </Button>
  );
}

export function ResendVerification() {
  async function resend() {
    try {
      await sendEmailVerification(auth.currentUser);
      toast.success("Verification email sent.");
    } catch (e) {
      toast.error(authErrorMessage(e));
    }
  }
  return (
    <Button type="button" variant="outline" size="sm" onClick={resend}>
      Resend verification email
    </Button>
  );
}

