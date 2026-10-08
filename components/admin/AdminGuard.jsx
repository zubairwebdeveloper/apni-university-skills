// components/admin/AdminGuard.jsx: client-side UX only. The server layout is the real gate.
"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/components/auth/AuthProvider";

function GuardSkeleton() {
  return (
    <div className="space-y-6" aria-hidden="true">
      <div className="space-y-2">
        <Skeleton className="h-7 w-48" />
        <Skeleton className="h-4 w-72 max-w-full" />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-24 rounded-xl" />
        ))}
      </div>

      <Skeleton className="h-64 w-full rounded-xl" />
    </div>
  );
}

// Use inside client-heavy admin screens to avoid flashing UI if the Firebase
// client session was cleared in another tab.
export function AdminGuard({ children, fallback = null }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

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
      <div
        role="status"
        aria-live="polite"
        className="flex min-h-[40vh] flex-col items-center justify-center gap-3 text-center"
      >
        <Loader2
          aria-hidden="true"
          className="size-6 animate-spin text-muted-foreground motion-reduce:animate-none"
        />
        <div className="space-y-1">
          <p className="text-sm font-medium">Your session has expired</p>
          <p className="text-xs text-muted-foreground">
            Redirecting you to the login page…
          </p>
        </div>
      </div>
    );
  }

  return children;
}
