"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { applyActionCode, sendEmailVerification } from "firebase/auth";
import { toast } from "sonner";
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  Clock3,
  ExternalLink,
  LoaderCircle,
  Mail,
  RefreshCw,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button, buttonVariants } from "@/components/ui/button";
import { AuthGuard } from "./AuthGuard";
import { useAuth } from "./AuthProvider";
import { LogoutButton } from "./LogoutButton";
import { auth, startServerSession } from "@/lib/firebase/client/auth";
import { authErrorMessage } from "@/lib/firebase/client/errors";

const EASE = [0.22, 1, 0.36, 1];

function AnimatedSection({ children, className = "" }) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      initial={reduceMotion ? false : { opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: reduceMotion ? 0 : 0.45,
        ease: EASE,
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

function BrandMark({ success = false }) {
  return (
    <div
      className={`relative flex size-16 items-center justify-center rounded-2xl border ${
        success
          ? "border-emerald-500/25 bg-emerald-500/10 text-emerald-500"
          : "border-yellow-400/25 bg-yellow-400/10 text-yellow-500"
      }`}
    >
      {success ? (
        <CheckCircle2 className="size-8" strokeWidth={1.7} />
      ) : (
        <>
          <Mail className="size-8" strokeWidth={1.7} />
          <span className="absolute -right-2 -top-2 flex size-7 items-center justify-center rounded-full border-4 border-background bg-violet-500 text-white">
            <ShieldCheck className="size-3.5" />
          </span>
        </>
      )}
    </div>
  );
}

function VerificationShell({ children }) {
  return (
    <div className="relative isolate flex min-h-[min(820px,100dvh)] items-center justify-center overflow-hidden bg-background px-4 py-10 text-foreground sm:px-6 lg:py-16">
      {/* Decorative surfaces stay behind the content. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
      >
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(139,92,246,0.07),transparent_55%)]" />
        <div className="absolute left-1/2 top-0 h-px w-64 -translate-x-1/2 bg-gradient-to-r from-transparent via-yellow-400/50 to-transparent" />
      </div>

      <div className="w-full max-w-[480px]">
        <AnimatedSection>
          <div className="mb-8 flex items-center justify-center gap-2.5">
            <div className="flex size-9 items-center justify-center rounded-xl bg-yellow-400 text-neutral-950 shadow-sm">
              <Sparkles className="size-5" />
            </div>
            <span className="text-lg font-bold tracking-tight">
              Apni <span className="text-violet-500">University</span>
            </span>
          </div>

          <div className="overflow-hidden rounded-3xl border border-border/80 bg-card shadow-[0_24px_80px_-32px_rgba(0,0,0,0.24)]">
            <div className="h-1 w-full bg-gradient-to-r from-yellow-400 via-violet-500 to-yellow-400" />
            <div className="p-6 sm:p-9">{children}</div>
          </div>

          <p className="mt-6 text-center text-xs leading-5 text-muted-foreground">
            Secure account verification
            <span className="mx-2 text-border">•</span>
            Your account, protected
          </p>
        </AnimatedSection>
      </div>
    </div>
  );
}

// Firebase action links use single-use verification codes.
// The ref prevents duplicate application in React Strict Mode.
function ApplyCode({ oobCode }) {
  const [status, setStatus] = useState("working");
  const started = useRef(false);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    if (started.current) return;
    started.current = true;

    let cancelled = false;

    async function verify() {
      try {
        await applyActionCode(auth, oobCode);

        if (auth.currentUser) {
          await auth.currentUser.reload();
          await startServerSession(auth.currentUser).catch(() => {});
        }

        if (!cancelled) setStatus("done");
      } catch {
        if (!cancelled) setStatus("error");
      }
    }

    verify();

    return () => {
      cancelled = true;
    };
  }, [oobCode]);

  if (status === "working") {
    return (
      <VerificationShell>
        <div className="flex flex-col items-center py-5 text-center">
          <div className="mb-6 flex size-20 items-center justify-center rounded-3xl border border-violet-500/20 bg-violet-500/10 text-violet-500">
            <LoaderCircle className="size-9 animate-spin motion-reduce:animate-none" />
          </div>

          <span className="mb-3 inline-flex items-center gap-2 rounded-full border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground">
            <span className="size-1.5 rounded-full bg-violet-500" />
            Verification in progress
          </span>

          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Verifying your email
          </h1>

          <p className="mt-3 max-w-sm text-sm leading-6 text-muted-foreground">
            Please wait while we securely confirm your email address and finish
            setting up your account.
          </p>

          <div className="mt-8 h-1 w-full max-w-[200px] overflow-hidden rounded-full bg-muted">
            <motion.div
              className="h-full rounded-full bg-violet-500"
              initial={{ width: "10%" }}
              animate={{ width: ["10%", "75%", "45%", "90%"] }}
              transition={
                reduceMotion
                  ? { duration: 0 }
                  : {
                      duration: 2.5,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }
              }
            />
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            This should only take a moment.
          </p>
        </div>
      </VerificationShell>
    );
  }

  if (status === "error") {
    return (
      <VerificationShell>
        <div className="flex flex-col items-center text-center">
          <div className="mb-5 flex size-16 items-center justify-center rounded-2xl border border-destructive/20 bg-destructive/10 text-destructive">
            <AlertCircle className="size-8" />
          </div>

          <span className="mb-3 rounded-full border border-destructive/20 bg-destructive/5 px-3 py-1 text-xs font-medium text-destructive">
            Verification unsuccessful
          </span>

          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            This link didn&apos;t work
          </h1>

          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            Your verification link may have expired, already been used, or
            become invalid. You can return to verification to request a fresh
            email.
          </p>

          <Alert variant="destructive" className="mt-6 text-left">
            <AlertCircle className="size-4" />
            <AlertDescription>
              For your security, verification links can only be used once.
            </AlertDescription>
          </Alert>

          <Link
            href="/verify-email"
            className={`${buttonVariants({ size: "lg" })} mt-6 w-full gap-2`}
          >
            <RefreshCw className="size-4" />
            Request a new email
            <ArrowRight className="ml-auto size-4" />
          </Link>

          <Link
            href="/login"
            className="mt-5 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="size-4" />
            Back to login
          </Link>
        </div>
      </VerificationShell>
    );
  }

  return (
    <VerificationShell>
      <div className="flex flex-col items-center text-center">
        <div className="mb-5 flex size-16 items-center justify-center rounded-2xl border border-emerald-500/20 bg-emerald-500/10 text-emerald-500">
          <CheckCircle2 className="size-8" />
        </div>

        <span className="mb-3 inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/5 px-3 py-1 text-xs font-medium text-emerald-600 dark:text-emerald-400">
          <Check className="size-3.5" />
          Email verified successfully
        </span>

        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
          You&apos;re all set!
        </h1>

        <p className="mt-3 max-w-sm text-sm leading-6 text-muted-foreground">
          Your email address has been confirmed. You&apos;re ready to continue your
          learning journey at Apni University.
        </p>

        <div className="mt-7 flex w-full items-center gap-3 rounded-2xl border border-border bg-muted/40 p-4 text-left">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-500">
            <ShieldCheck className="size-5" />
          </div>
          <div>
            <p className="text-sm font-semibold">
              Account verification complete
            </p>
            <p className="mt-1 text-xs leading-5 text-muted-foreground">
              Your email verification has been confirmed.
            </p>
          </div>
        </div>

        <Link
          href="/student"
          className={`${buttonVariants({ size: "lg" })} mt-6 w-full gap-2 bg-yellow-400 font-semibold text-neutral-950 hover:bg-yellow-300`}
        >
          Continue to dashboard
          <ArrowRight className="ml-auto size-4" />
        </Link>

        <p className="mt-4 text-xs text-muted-foreground">
          Your next step starts in your student dashboard.
        </p>
      </div>
    </VerificationShell>
  );
}

function ResendPanel() {
  const router = useRouter();
  const { user } = useAuth();

  const [cooldown, setCooldown] = useState(0);
  const [checking, setChecking] = useState(false);
  const [resending, setResending] = useState(false);

  useEffect(() => {
    if (cooldown <= 0) return;

    const timer = setTimeout(() => {
      setCooldown((current) => current - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [cooldown]);

  async function resend() {
    if (!user || resending || cooldown > 0) return;

    setResending(true);

    try {
      await sendEmailVerification(user);
      toast.success("Verification email sent.", {
        description: "Check your inbox and spam folder.",
      });
      setCooldown(60);
    } catch (error) {
      toast.error(authErrorMessage(error));
    } finally {
      setResending(false);
    }
  }

  async function check() {
    if (checking) return;

    setChecking(true);

    try {
      const currentUser = auth.currentUser;

      if (!currentUser) {
        toast.error("Your session has expired. Please sign in again.");
        router.replace("/login");
        return;
      }

      await currentUser.reload();

      if (!auth.currentUser?.emailVerified) {
        toast.info("Email not verified yet.", {
          description:
            "Open the verification link in your inbox, then try again.",
        });
        return;
      }

      await startServerSession(auth.currentUser);
      router.replace("/student");
      router.refresh();
    } catch (error) {
      toast.error(authErrorMessage(error));
    } finally {
      setChecking(false);
    }
  }

  return (
    <VerificationShell>
      <div className="flex flex-col items-center text-center">
        <BrandMark />

        <span className="mt-6 inline-flex items-center gap-2 rounded-full border border-yellow-500/20 bg-yellow-500/5 px-3 py-1.5 text-xs font-medium text-yellow-600 dark:text-yellow-400">
          <Clock3 className="size-3.5" />
          One quick step remaining
        </span>

        <h1 className="mt-4 text-3xl font-bold tracking-tight sm:text-[2.15rem]">
          Verify your email
        </h1>

        <p className="mt-3 max-w-sm text-sm leading-6 text-muted-foreground">
          Confirm your email address to finish securing your account and
          continue learning with Apni University.
        </p>

        <div className="mt-7 w-full rounded-2xl border border-border bg-muted/40 p-4 text-left sm:p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
            Verification email sent to
          </p>

          <div className="mt-3 flex min-w-0 items-center gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-border bg-background text-violet-500">
              <Mail className="size-5" />
            </div>

            <p className="min-w-0 break-all text-sm font-semibold">
              {user?.email || "Your registered email"}
            </p>
          </div>

          <div className="mt-4 border-t border-border pt-4">
            <p className="text-sm leading-6 text-muted-foreground">
              Open the message in your inbox and select its verification link.
              Once complete, return here to access your dashboard.
            </p>
          </div>
        </div>

        <div className="mt-6 w-full space-y-3">
          <Button
            type="button"
            size="lg"
            className="group h-12 w-full gap-2 bg-yellow-400 font-semibold text-neutral-950 transition-all hover:bg-yellow-300 active:scale-[0.99]"
            onClick={check}
            disabled={checking || !user}
          >
            {checking ? (
              <>
                <LoaderCircle className="size-4 animate-spin motion-reduce:animate-none" />
                Checking verification…
              </>
            ) : (
              <>
                <CheckCircle2 className="size-4" />
                I&apos;ve verified my email
                <ArrowRight className="ml-auto size-4 transition-transform group-hover:translate-x-0.5" />
              </>
            )}
          </Button>

          <Button
            type="button"
            variant="outline"
            size="lg"
            className="h-12 w-full gap-2 transition-colors hover:border-violet-500/40 hover:bg-violet-500/5"
            onClick={resend}
            disabled={cooldown > 0 || resending || !user}
          >
            {resending ? (
              <LoaderCircle className="size-4 animate-spin motion-reduce:animate-none" />
            ) : (
              <RefreshCw className="size-4" />
            )}

            {resending
              ? "Sending verification email…"
              : cooldown > 0
                ? `Resend available in ${cooldown}s`
                : "Resend verification email"}
          </Button>
        </div>

        <div className="mt-6 flex w-full items-start gap-3 rounded-xl border border-border/70 p-3.5 text-left">
          <AlertCircle className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
          <p className="text-xs leading-5 text-muted-foreground">
            <span className="font-semibold text-foreground">
              Can&apos;t find the email?
            </span>{" "}
            Check your spam or junk folder. Make sure you&apos;re checking the inbox
            for the address shown above.
          </p>
        </div>

        <div className="mt-6 flex w-full items-center justify-between gap-3 border-t border-border pt-5">
          <Link
            href="/login"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="size-4" />
            Back to login
          </Link>

          <LogoutButton variant="ghost" className="h-9 px-3 text-sm" />
        </div>
      </div>
    </VerificationShell>
  );
}

export function VerifyEmailPanel({ mode, oobCode }) {
  if (mode === "verifyEmail" && oobCode) {
    return <ApplyCode oobCode={oobCode} />;
  }

  return (
    <AuthGuard>
      <ResendPanel />
    </AuthGuard>
  );
}
