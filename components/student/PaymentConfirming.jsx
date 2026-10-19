// components/student/PaymentConfirming.jsx: the webhook grants access; this just waits for it
"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FiClock, FiLoader, FiRefreshCw } from "react-icons/fi";
import { Button, buttonVariants } from "@/components/ui/button";

const MAX_TRIES = 10;

export function PaymentConfirming() {
  const router = useRouter();
  const [tries, setTries] = useState(0);
  useEffect(() => {
    if (tries >= MAX_TRIES) return;
    const t = setTimeout(() => {
      router.refresh();
      setTries((n) => n + 1);
    }, 3000);
    return () => clearTimeout(t);
  }, [tries, router]);

  const waiting = tries < MAX_TRIES;

  return (
    <div className="mx-auto max-w-md rounded-2xl border bg-card p-6 text-center shadow-sm sm:p-8">
      <span
        aria-hidden="true"
        className={`mx-auto grid size-14 place-items-center rounded-full ring-1 ring-inset ${
          waiting
            ? "bg-primary/10 text-primary ring-primary/20"
            : "bg-amber-400/15 text-amber-700 ring-amber-500/25 dark:text-amber-300"
        }`}
      >
        {waiting ? (
          <FiLoader className="size-6 motion-safe:animate-spin" />
        ) : (
          <FiClock className="size-6" />
        )}
      </span>

      <div role="status" aria-live="polite" className="mt-5">
        <h1 className="text-balance text-2xl font-semibold tracking-tight">
          {waiting ? "Confirming your payment…" : "Still confirming"}
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          {waiting
            ? "This usually takes a few seconds. Please keep this page open."
            : "This is taking longer than usual. If you were charged, your course will appear shortly. Check your payments or contact us."}
        </p>
      </div>

      {!waiting && (
        <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:justify-center">
          <Button
            type="button"
            variant="ghost"
            onClick={() => setTries(0)}
            className="gap-2"
          >
            <FiRefreshCw aria-hidden="true" className="size-4" />
            Check again
          </Button>
          <Link
            href="/student/payments"
            className={buttonVariants({ variant: "outline" })}
          >
            View payments
          </Link>
          <Link href="/contact" className={buttonVariants()}>
            Contact support
          </Link>
        </div>
      )}
    </div>
  );
}
