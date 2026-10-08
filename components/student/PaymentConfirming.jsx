// components/student/PaymentConfirming.jsx: the webhook grants access; this just waits for it
"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { buttonVariants } from "@/components/ui/button";

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

  return (
    <div
      role="status"
      className="mx-auto max-w-md rounded-xl border bg-card p-8 text-center"
    >
      <h1 className="text-2xl">
        {tries < MAX_TRIES ? "Confirming your payment…" : "Still confirming"}
      </h1>
      <p className="mt-3 text-sm text-muted-foreground">
        {tries < MAX_TRIES
          ? "This usually takes a few seconds. Please keep this page open."
          : "This is taking longer than usual. If you were charged, your course will appear shortly. Check your payments or contact us."}
      </p>
      {tries >= MAX_TRIES && (
        <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center">
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

