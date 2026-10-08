// components/auth/VerifyEmailPanel.jsx
"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { applyActionCode, sendEmailVerification } from "firebase/auth";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button, buttonVariants } from "@/components/ui/button";
import { AuthGuard } from "./AuthGuard";
import { useAuth } from "./AuthProvider";
import { LogoutButton } from "./LogoutButton";
import { auth, startServerSession } from "@/lib/firebase/client/auth";
import { authErrorMessage } from "@/lib/firebase/client/errors";

// The link in the email lands here (set the action URL in Firebase Console > Authentication > Templates)
function ApplyCode({ oobCode }) {
  const [status, setStatus] = useState("working");
  const started = useRef(false); // an action code is single-use; never apply twice (React Strict Mode)
  useEffect(() => {
    if (started.current) return;
    started.current = true;
    (async () => {
      try {
        await applyActionCode(auth, oobCode);
        if (auth.currentUser) {
          await auth.currentUser.reload();
          await startServerSession(auth.currentUser).catch(() => {});
        }
        setStatus("done");
      } catch {
        setStatus("error");
      }
    })();
  }, [oobCode]);

  if (status === "working")
    return (
      <p role="status" className="text-sm text-muted-foreground">
        Verifying your email…
      </p>
    );
  if (status === "error")
    return (
      <div className="space-y-5">
        <Alert variant="destructive" role="alert">
          <AlertDescription>
            This verification link is invalid or has expired.
          </AlertDescription>
        </Alert>
        <Link
          href="/verify-email"
          className={buttonVariants({ className: "w-full" })}
        >
          Request a new email
        </Link>
      </div>
    );
  return (
    <div className="space-y-5" role="status">
      <Alert>
        <AlertDescription>Your email is verified.</AlertDescription>
      </Alert>
      <Link href="/student" className={buttonVariants({ className: "w-full" })}>
        Continue to dashboard
      </Link>
    </div>
  );
}

function ResendPanel() {
  const router = useRouter();
  const { user } = useAuth();
  const [cooldown, setCooldown] = useState(0);
  const [checking, setChecking] = useState(false);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  async function resend() {
    try {
      await sendEmailVerification(user);
      toast.success("Verification email sent.");
      setCooldown(60);
    } catch (e) {
      toast.error(authErrorMessage(e));
    }
  }

  async function check() {
    setChecking(true);
    try {
      await auth.currentUser.reload();
      if (!auth.currentUser.emailVerified)
        return toast.info(
          "Not verified yet. Open the link in your email, then try again.",
        );
      await startServerSession(auth.currentUser); // re-mint the cookie so it carries email_verified
      router.replace("/student");
      router.refresh();
    } catch (e) {
      toast.error(authErrorMessage(e));
    } finally {
      setChecking(false);
    }
  }

  return (
    <div className="space-y-5">
      <p className="text-sm text-muted-foreground">
        We sent a verification link to{" "}
        <strong className="text-foreground">{user?.email}</strong>. Open it,
        then come back and continue.
      </p>
      <Button
        type="button"
        size="lg"
        className="w-full"
        onClick={check}
        disabled={checking}
      >
        {checking ? "Checking…" : "I've verified my email"}
      </Button>
      <Button
        type="button"
        variant="outline"
        className="w-full"
        onClick={resend}
        disabled={cooldown > 0}
      >
        {cooldown > 0 ? `Resend in ${cooldown}s` : "Resend email"}
      </Button>
      <LogoutButton variant="ghost" className="w-full" />
    </div>
  );
}

export function VerifyEmailPanel({ mode, oobCode }) {
  if (mode === "verifyEmail" && oobCode) return <ApplyCode oobCode={oobCode} />;
  return (
    <AuthGuard>
      <ResendPanel />
    </AuthGuard>
  );
}

