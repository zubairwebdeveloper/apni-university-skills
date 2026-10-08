// lib/firebase/client/auth.js (replaces Batch 2's)
import { getAuth, signOut } from "firebase/auth";
import { clientApp } from "./config";

export const auth = getAuth(clientApp);

// Exchanges a fresh ID token for the httpOnly session cookie
export async function startServerSession(user) {
  const idToken = await user.getIdToken(true);
  const res = await fetch("/api/auth/session", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ idToken }),
  });
  if (!res.ok)
    throw new Error(
      (await res.json().catch(() => ({}))).error ??
        "Could not start your session.",
    );
}

export async function endServerSession() {
  await fetch("/api/auth/session", { method: "DELETE" }).catch(() => {});
  await signOut(auth).catch(() => {});
}

