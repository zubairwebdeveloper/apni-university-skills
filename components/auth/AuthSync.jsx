// components/auth/AuthSync.jsx
"use client";

import { useEffect } from "react";
import { onIdTokenChanged } from "firebase/auth";
import { auth } from "@/lib/firebase/client/auth";

export function AuthSync() {
  useEffect(() => {
    return onIdTokenChanged(auth, async (user) => {
      try {
        if (user) {
          const token = await user.getIdToken();
          await fetch("/api/auth/session", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ token }),
          });
        } else {
          await fetch("/api/auth/session", { method: "DELETE" });
        }
      } catch {
        /* network error: agli baar dobara try hoga */
      }
    });
  }, []);

  return null;
}
