// services/userService.js
import "server-only";
import { cache } from "react";
import { getToken } from "@/lib/auth/session";

const PROJECT_ID = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
const USERS_URL = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents/users`;

const docUrl = (uid) => `${USERS_URL}/${encodeURIComponent(uid)}`;

function mapProfile(fields = {}) {
  return {
    displayName: fields.displayName?.stringValue ?? "",
    email: fields.email?.stringValue ?? "",
    photoURL: fields.photoURL?.stringValue ?? null,
    role: fields.role?.stringValue ?? "student",
  };
}

/** Reads users/{uid}. Returns null if it does not exist or can't be read. */
async function getProfile(uid) {
  const token = await getToken();
  if (!token) return null;

  try {
    const res = await fetch(docUrl(uid), {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    if (!res.ok) return null;

    const { fields = {} } = await res.json();
    return mapProfile(fields);
  } catch {
    return null;
  }
}

/**
 * Creates users/{uid} only if it does not exist yet
 * (currentDocument.exists=false), so it can never overwrite a real profile.
 * The role is always "student": a user can never pick their own role here.
 * Admin / editor / instructor access lives in the `admins` collection.
 */
async function createProfile(uid, { email, displayName, photoURL }) {
  const token = await getToken();
  if (!token) return false;

  const fields = {
    displayName: { stringValue: displayName },
    email: { stringValue: email },
    role: { stringValue: "student" },
    createdAt: { timestampValue: new Date().toISOString() },
  };
  if (photoURL) fields.photoURL = { stringValue: photoURL };

  try {
    const res = await fetch(`${docUrl(uid)}?currentDocument.exists=false`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ fields }),
      cache: "no-store",
    });

    if (!res.ok) {
      const body = await res.json().catch(() => null);
      console.error(
        "[user profile] create failed:",
        res.status,
        body?.error?.status ?? "",
        body?.error?.message ?? "",
      );
    }
    return res.ok;
  } catch (error) {
    console.error("[user profile] create failed:", error?.message ?? error);
    return false;
  }
}

/**
 * Always returns a profile object, never null.
 * - Profile exists: returns it.
 * - Missing (for example an admin added from the admin panel who never
 *   registered as a student): creates it, then returns it.
 * - Creation blocked (rules, network): still returns a profile built from the
 *   sign-in data, so the student pages open instead of showing a 404.
 *
 * Wrapped in React cache(), so the layout and the page share ONE call per
 * request. Pass only plain strings so the cache can match the arguments.
 */
const ensureProfile = cache(
  async (uid, email = "", name = "", photoURL = "") => {
    const existing = await getProfile(uid);
    if (existing) return existing;

    const displayName = name || (email ? email.split("@")[0] : "");

    await createProfile(uid, { email, displayName, photoURL });

    return {
      displayName,
      email,
      photoURL: photoURL || null,
      role: "student",
    };
  },
);

export const userService = {
  getProfile,
  ensureProfile,
};
