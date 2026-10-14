// components/auth/VerifyEmailBanner.jsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { sendEmailVerification } from "firebase/auth";
import {
  AlertTriangle,
  CheckCircle2,
  Loader2,
  MailCheck,
  RefreshCw,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/components/auth/AuthProvider";

const COOLDOWN_SEC = 60;

/**
 * Shows only for people who signed in with email + password and have not
 * verified their email yet. (Google sign-in is already verified, so nothing
 * shows for it.)
 *
 * 1. "Send verification email" sends the Firebase link to their inbox.
 * 2. They open the link in the email.
 * 3. "I've verified" refreshes their sign-in, so the server sees the verified
 *    email and the Admin Panel opens.
 */
export function VerifyEmailBanner() {
  const { user } = useAuth();
  const router = useRouter();

  const [sending, setSending] = useState(false);
  const [checking, setChecking] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [verified, setVerified] = useState(false);
  const [message, setMessage] = useState(null); // { type: "ok" | "error", text }

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  const usesPassword = Boolean(
    user?.providerData?.some((p) => p.providerId === "password"),
  );

  async function handleSend() {
    if (!user) return;
    setSending(true);
    setMessage(null);
    try {
      await sendEmailVerification(user);
      setCooldown(COOLDOWN_SEC);
      setMessage({
        type: "ok",
        text: `We sent a link to ${user.email}. Check your inbox and spam folder.`,
      });
    } catch (e) {
      setMessage({
        type: "error",
        text:
          e?.code === "auth/too-many-requests"
            ? "Too many requests. Wait a few minutes and try again."
            : "We couldn't send the email. Please try again.",
      });
    } finally {
      setSending(false);
    }
  }

  async function handleCheck() {
    if (!user) return;
    setChecking(true);
    setMessage(null);
    try {
      await user.reload();

      if (!user.emailVerified) {
        setMessage({
          type: "error",
          text: "Not verified yet. Open the link in the email first, then try again.",
        });
        return;
      }

      // Force a fresh token so the server sees email_verified = true.
      await user.getIdToken(true);
      // Give the session cookie a moment to update before refreshing pages.
      await new Promise((resolve) => setTimeout(resolve, 800));

      setVerified(true);
      router.refresh();
    } catch {
      setMessage({
        type: "error",
        text: "We couldn't check your email status. Please try again.",
      });
    } finally {
      setChecking(false);
    }
  }

  if (verified) {
    return (
      <div
        role="status"
        className="mb-6 flex items-center gap-3 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm text-emerald-700 dark:text-emerald-300"
      >
        <CheckCircle2 aria-hidden="true" className="size-5 shrink-0" />
        <p className="font-medium">
          Email verified. If you have admin access, the Admin Panel button is
          now ready in your account menu.
        </p>
      </div>
    );
  }

  if (!user || !usesPassword || user.emailVerified) return null;

  return (
    <section
      aria-label="Verify your email"
      className="mb-6 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 sm:p-5"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-start gap-3">
          <span
            aria-hidden="true"
            className="grid size-10 shrink-0 place-items-center rounded-xl bg-amber-500/15 text-amber-700 ring-1 ring-amber-500/30 dark:text-amber-300"
          >
            <AlertTriangle className="size-5" />
          </span>
          <div className="min-w-0 space-y-0.5">
            <h2 className="text-sm font-semibold">Verify your email</h2>
            <p className="text-sm leading-6 text-muted-foreground">
              Confirm{" "}
              <span className="break-all font-medium text-foreground">
                {user.email}
              </span>{" "}
              to protect your account. The admin panel needs a verified email.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 sm:shrink-0">
          <Button
            type="button"
            onClick={handleSend}
            disabled={sending || cooldown > 0}
            className="gap-2"
          >
            {sending ? (
              <Loader2 aria-hidden="true" className="size-4 animate-spin" />
            ) : (
              <MailCheck aria-hidden="true" className="size-4" />
            )}
            {cooldown > 0
              ? `Send again in ${cooldown}s`
              : "Send verification email"}
          </Button>

          <Button
            type="button"
            variant="outline"
            onClick={handleCheck}
            disabled={checking}
            className="gap-2 bg-background/60"
          >
            {checking ? (
              <Loader2 aria-hidden="true" className="size-4 animate-spin" />
            ) : (
              <RefreshCw aria-hidden="true" className="size-4" />
            )}
            I&apos;ve verified
          </Button>
        </div>
      </div>

      {message && (
        <p
          role={message.type === "error" ? "alert" : "status"}
          className={
            message.type === "error"
              ? "mt-3 text-sm text-destructive"
              : "mt-3 text-sm text-emerald-700 dark:text-emerald-300"
          }
        >
          {message.text}
        </p>
      )}
    </section>
  );
}
