// hooks/useUrlParams.js
"use client";
import { useCallback, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

export function useUrlParams() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [pending, start] = useTransition();
  const set = useCallback(
    (changes) => {
      const next = new URLSearchParams(params.toString());
      for (const [k, v] of Object.entries(changes))
        v == null || v === "" || v === "all"
          ? next.delete(k)
          : next.set(k, String(v));
      next.delete("after"); // any filter change returns to page one
      const qs = next.toString();
      start(() =>
        router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false }),
      );
    },
    [params, pathname, router],
  );
  const clear = useCallback(
    () => start(() => router.replace(pathname, { scroll: false })),
    [pathname, router],
  );
  return { params, set, clear, pending };
}

