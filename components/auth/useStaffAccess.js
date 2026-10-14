// components/auth/useStaffAccess.js  (put it next to AuthNav.jsx)
"use client";

import { useEffect, useState } from "react";

const RETRY_DELAY_MS = 2000;

async function checkOnce(signal) {
  try {
    const res = await fetch("/api/admin/me", { cache: "no-store", signal });
    if (!res.ok) return { isStaff: false, role: "" };
    const data = await res.json();
    return {
      isStaff: Boolean(data?.isAdmin),
      role: typeof data?.role === "string" ? data.role : "",
    };
  } catch {
    return { isStaff: false, role: "" };
  }
}

/**
 * Asks the server whether this user has an entry in the `admins` collection.
 * Returns { isStaff, role }. Navigation visibility only: the admin pages still
 * enforce access themselves.
 *
 * Retries once after 2 seconds, because right after sign-in the __session
 * cookie can arrive a moment after the user object does.
 */
export function useStaffAccess(user) {
  const uid = user?.uid ?? null;
  const [state, setState] = useState({ uid: null, isStaff: false, role: "" });

  useEffect(() => {
    if (!uid) return;

    const controller = new AbortController();
    const { signal } = controller;

    (async () => {
      let result = await checkOnce(signal);

      if (!result.isStaff && !signal.aborted) {
        await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS));
        if (!signal.aborted) result = await checkOnce(signal);
      }

      if (!signal.aborted) setState({ uid, ...result });
    })();

    return () => controller.abort();
  }, [uid]);

  return state.uid === uid
    ? { isStaff: state.isStaff, role: state.role }
    : { isStaff: false, role: "" };
}
