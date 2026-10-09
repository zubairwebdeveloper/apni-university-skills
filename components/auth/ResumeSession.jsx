// components/auth/ResumeSession.jsx
"use client";

import { useEffect } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import {
  auth,
  startServerSession,
  endServerSession,
} from "@/lib/firebase/client/auth";

export function ResumeSession({ next }) {
  useEffect(() => {
    return onAuthStateChanged(auth, async (user) => {
      if (!user) return;
      try {
        await startServerSession(user);
        window.location.assign(next || "/student");
      } catch {
        await signOut(auth).catch(() => {});
        await endServerSession();
      }
    });
  }, [next]);

  return null;
}
