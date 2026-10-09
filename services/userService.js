// services/userService.js
import "server-only";
import { getToken } from "@/lib/auth/session";

const PROJECT_ID = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;

async function getProfile(uid) {
  const token = await getToken();
  if (!token) return null;

  try {
    const res = await fetch(
      `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents/users/${encodeURIComponent(uid)}`,
      { headers: { Authorization: `Bearer ${token}` }, cache: "no-store" },
    );
    if (!res.ok) return null; // layout profile null ke saath bhi chal jata hai

    const { fields = {} } = await res.json();
    return {
      displayName: fields.displayName?.stringValue ?? "",
      photoURL: fields.photoURL?.stringValue ?? null,
      role: fields.role?.stringValue ?? "student",
    };
  } catch {
    return null;
  }
}

export const userService = {
  getProfile,
};
