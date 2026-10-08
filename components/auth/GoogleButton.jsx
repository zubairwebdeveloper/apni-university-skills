// components/auth/GoogleButton.jsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";
import { FcGoogle } from "react-icons/fc";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { auth, startServerSession } from "@/lib/firebase/client/auth";
import { authErrorMessage } from "@/lib/firebase/client/errors";
import { cn } from "@/lib/utils";

// Errors that just mean "the person closed the popup": not worth showing.
const SILENT = new Set([
  "auth/popup-closed-by-user",
  "auth/cancelled-popup-request",
]);

export function GoogleButton({
  next = "/",
  label = "Continue with Google",
  onError,
  onBusyChange,
  disabled = false,
  className,
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  const setBusyState = (v) => {
    setBusy(v);
    onBusyChange?.(v);
  };

  async function signInWithGoogle() {
    onError?.("");
    setBusyState(true);
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: "select_account" });

      const cred = await signInWithPopup(auth, provider);
      await startServerSession(cred.user);
      router.replace(next);
      router.refresh();
    } catch (e) {
      if (!SILENT.has(e?.code)) onError?.(authErrorMessage(e));
      await signOut(auth).catch(() => {}); // keep client and server state consistent
      setBusyState(false);
    }
  }

  return (
    <Button
      type="button"
      variant="outline"
      size="lg"
      onClick={signInWithGoogle}
      disabled={disabled || busy}
      aria-busy={busy}
      className={cn(
        "group relative w-full cursor-pointer gap-2.5 overflow-hidden bg-background shadow-sm transition-all duration-200",
        "hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md active:translate-y-0 active:scale-[0.98]",
        "disabled:cursor-not-allowed",
        "motion-reduce:transition-none motion-reduce:hover:translate-y-0 motion-reduce:active:scale-100",
        className,
      )}
    >
      {/* Shine sweep */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 -left-full w-1/2 skew-x-[-20deg] bg-gradient-to-r from-transparent via-primary/10 to-transparent transition-transform duration-700 group-hover:translate-x-[320%] group-disabled:hidden motion-reduce:hidden"
      />

      {busy ? (
        <Loader2 aria-hidden="true" className="relative size-5 animate-spin" />
      ) : (
        <FcGoogle
          aria-hidden="true"
          className="relative size-5 transition-transform duration-200 group-hover:scale-110 motion-reduce:transition-none motion-reduce:group-hover:scale-100"
        />
      )}
      <span className="relative">{busy ? "Opening Google…" : label}</span>
    </Button>
  );
}

// "or continue with email" line
export function OrDivider({ text = "or continue with" }) {
  return (
    <div className="flex items-center gap-3" role="separator" aria-label={text}>
      <span className="h-px flex-1 bg-gradient-to-r from-transparent to-border" />
      <span className="text-xs text-foreground/60">{text}</span>
      <span className="h-px flex-1 bg-gradient-to-l from-transparent to-border" />
    </div>
  );
}

// Drop this at the bottom of ANY auth form (login, register...).
// It brings its own divider, so nothing else is needed.
export function SocialAuth({
  next = "/",
  label = "Continue with Google",
  onError,
  onBusyChange,
  disabled,
}) {
  return (
    <div className="space-y-4">
      <OrDivider />
      <GoogleButton
        next={next}
        label={label}
        onError={onError}
        onBusyChange={onBusyChange}
        disabled={disabled}
      />
    </div>
  );
}
