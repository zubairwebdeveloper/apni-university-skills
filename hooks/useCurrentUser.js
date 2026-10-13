"use client";

import { useEffect, useState } from "react";

// Returns { user, loading }.
// loading = true: abhi check ho raha hai | user = null: logged out | user = object: logged in
export function useCurrentUser() {
  const [state, setState] = useState({ user: null, loading: true });

  useEffect(() => {
    let cancelled = false;
    const controller = new AbortController();
    // 4 second mein jawab na aaye to logged-out maan lo
    const timeoutId = setTimeout(() => controller.abort(), 4000);

    fetch("/api/auth/me", {
      credentials: "same-origin",
      cache: "no-store",
      signal: controller.signal,
    })
      .then(async (res) => {
        if (!res.ok) return null;
        const data = await res.json();
        return (
          data?.user ?? (data?.uid || data?.id || data?.email ? data : null)
        );
      })
      .catch(() => null)
      .then((user) => {
        clearTimeout(timeoutId);
        if (!cancelled) setState({ user, loading: false });
      });

    return () => {
      cancelled = true;
      clearTimeout(timeoutId);
      controller.abort();
    };
  }, []);

  return state;
}
