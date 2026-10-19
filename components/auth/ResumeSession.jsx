// components/auth/ResumeSession.jsx
"use client";

import { useEffect } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import {
  auth,
  startServerSession,
  endServerSession,
} from "@/lib/firebase/client/auth";

// `next` usually comes from a `?next=` query param on the login/register
// page this sits on, so it must be checked before it's handed to the
// browser — otherwise `/login?next=https://evil.com` would redirect an
// already-signed-in person straight to an attacker's site. Mirrors the
// same guard used by LoginForm, RegisterForm, and GoogleButton.
function safeNext(value, fallback) {
  return typeof value === "string" &&
    value.startsWith("/") &&
    !value.startsWith("//")
    ? value
    : fallback;
}

export function ResumeSession({ next }) {
  useEffect(() => {
    return onAuthStateChanged(auth, async (user) => {
      if (!user) return;
      try {
        await startServerSession(user);
        window.location.assign(safeNext(next, "/student"));
      } catch {
        await signOut(auth).catch(() => {});
        await endServerSession();
      }
    });
  }, [next]);

  return null;
}
