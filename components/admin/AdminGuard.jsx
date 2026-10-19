// components/admin/AdminGuard.jsx: client-side UX only. The server layout is the real gate.
"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
import { Loader2, Lock } from "lucide-react";

import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/components/auth/AuthProvider";

const focusRing =
  "outline-none focus-visible:ring-2 focus-visible:ring-yellow-400/70 focus-visible:ring-offset-2 focus-visible:ring-offset-background";

function GuardSkeleton() {
  return (
    <div className="space-y-6" aria-hidden="true">
      {/* Page header */}
      <div className="space-y-2">
        <Skeleton className="h-7 w-48" />
        <Skeleton className="h-4 w-72 max-w-full" />
      </div>

      {/* Summary tiles */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="flex items-center gap-3 rounded-xl border border-border bg-card p-4"
          >
            <Skeleton className="size-10 shrink-0 rounded-lg" />
            <div className="min-w-0 flex-1 space-y-2">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-5 w-14" />
            </div>
          </div>
        ))}
      </div>

      {/* Table / content panel */}
      <div className="overflow-hidden rounded-xl border border-border bg-card">
        <div className="border-b border-border bg-muted/40 px-4 py-3">
          <Skeleton className="h-3 w-40" />
        </div>
        <div className="divide-y divide-border">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 px-4 py-3.5">
              <Skeleton className="size-9 shrink-0 rounded-full" />
              <div className="min-w-0 flex-1 space-y-2">
                <Skeleton className="h-4 w-40 max-w-full" />
                <Skeleton className="h-3 w-56 max-w-full" />
              </div>
              <Skeleton className="hidden h-6 w-16 rounded-full sm:block" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Use inside client-heavy admin screens to avoid flashing UI if the Firebase
// client session was cleared in another tab.
export function AdminGuard({ children, fallback = null }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const reduceMotion = useReducedMotion();

  const signedOut = !loading && !user;

  useEffect(() => {
    if (!signedOut) return;

    // Keep the query string (filters, page, etc.) so the same view reopens after login.
    const target = `${pathname}${window.location.search}`;
    router.replace(`/login?next=${encodeURIComponent(target)}`);
  }, [signedOut, pathname, router]);

  if (loading) {
    return (
      <div role="status" aria-live="polite" aria-busy="true">
        <span className="sr-only">Checking your session…</span>
        {fallback ?? <GuardSkeleton />}
      </div>
    );
  }

  if (!user) {
    return (
      <motion.div
        role="status"
        aria-live="polite"
        initial={reduceMotion ? false : { opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="flex min-h-[40vh] items-center justify-center px-4"
      >
        <div className="flex w-full max-w-sm flex-col items-center gap-4 rounded-xl border border-border bg-card p-6 text-center shadow-sm sm:p-8">
          <span
            aria-hidden="true"
            className="flex size-12 items-center justify-center rounded-xl border border-yellow-400/30 bg-yellow-400/10 text-yellow-700 dark:text-yellow-300"
          >
            <Lock className="size-5" />
          </span>

          <div className="space-y-1.5">
            <p className="text-base font-semibold leading-6 tracking-tight text-foreground">
              Your session has expired
            </p>
            <p className="text-sm leading-6 text-muted-foreground">
              Sign in again to pick up where you left off. Your current page and
              filters will be restored.
            </p>
          </div>

          <p className="flex items-center gap-2 text-xs text-muted-foreground">
            <Loader2
              aria-hidden="true"
              className="size-3.5 animate-spin motion-reduce:animate-none"
            />
            Redirecting you to the login page…
          </p>

          <Link
            href={`/login?next=${encodeURIComponent(pathname)}`}
            className={`rounded-md text-xs font-medium text-violet-600 underline-offset-4 hover:underline dark:text-violet-300 ${focusRing}`}
          >
            Go to login now
          </Link>
        </div>
      </motion.div>
    );
  }

  return children;
}
