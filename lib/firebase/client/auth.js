// lib/firebase/client/auth.js
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { clientApp } from "./config";

export const auth = getAuth(clientApp);
export const db = getFirestore(clientApp);

// Exchanges a fresh ID token for the httpOnly session cookie
export async function startServerSession(user) {
  const token = await user.getIdToken(true);
  const res = await fetch("/api/auth/session", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token }),
    credentials: "same-origin",
    cache: "no-store",
  });
  if (!res.ok) throw new Error("SESSION_FAILED");
}

export async function endServerSession() {
  await fetch("/api/auth/session", {
    method: "DELETE",
    credentials: "same-origin",
  }).catch(() => {});
}
