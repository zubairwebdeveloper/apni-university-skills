"use client";
import { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase/client/auth";

const AuthContext = createContext({ user: null, loading: true });

// UI convenience only. Real protection happens in server layouts (requireUser / requireRole).
export function AuthProvider({ children }) {
  const [state, setState] = useState({ user: null, loading: true });
  useEffect(
    () =>
      onAuthStateChanged(auth, (user) => setState({ user, loading: false })),
    [],
  );
  return <AuthContext.Provider value={state}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);

