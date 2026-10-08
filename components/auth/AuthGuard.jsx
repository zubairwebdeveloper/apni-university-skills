// components/auth/AuthGuard.jsx: UX only. It never replaces the server checks.
"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "./AuthProvider";

export function AuthGuard({
  children,
  fallback = <Skeleton className="h-40 w-full" />,
}) {
  const { user, loading } = useAuth();
  const router = useRouter();
  useEffect(() => {
    if (!loading && !user) router.replace("/login");
  }, [loading, user, router]);
  return loading || !user ? fallback : children;
}

