// components/auth/AuthProvider.jsx
"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { onIdTokenChanged } from "firebase/auth";
import { auth } from "@/lib/firebase/client/auth";

const AuthContext = createContext({ user: null, loading: true });

export function AuthProvider({ children }) {
  const [state, setState] = useState({ user: null, loading: true });

  useEffect(() => {
    let cancelled = false;

    const unsubscribe = onIdTokenChanged(auth, async (user) => {
      if (cancelled) return;
      setState({ user, loading: false });

      try {
        if (user) {
          const token = await user.getIdToken();
          await fetch("/api/auth/session", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ token }),
            credentials: "same-origin",
            cache: "no-store",
          });
        } else {
          await fetch("/api/auth/session", {
            method: "DELETE",
            credentials: "same-origin",
          });
        }
      } catch {
        /* agli baar dobara try hoga */
      }
    });

    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, []);

  return <AuthContext.Provider value={state}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
