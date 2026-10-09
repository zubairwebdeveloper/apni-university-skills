// lib/auth/getAdmin.js

import "server-only";

import { isRole, ROLES } from "@/lib/constants/roles";

const PROJECT_ID = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;

export async function getAdminByEmail(email, idToken) {
  if (!PROJECT_ID || !email || !idToken) {
    return null;
  }

  const id = email.trim().toLowerCase();

  const url =
    `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}` +
    `/databases/(default)/documents/admins/${encodeURIComponent(id)}`;

  try {
    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${idToken}`,
      },
      cache: "no-store",
    });

    if (!res.ok) {
      if (res.status !== 404) {
        console.error("[admin lookup] Request failed:", res.status);
      }

      return null;
    }

    const { fields = {} } = await res.json();

    const role = fields.role?.stringValue?.trim().toLowerCase();

    // Missing or invalid roles must never grant admin access.
    if (!isRole(role)) {
      return null;
    }

    // Students must not access the admin panel.
    if (![ROLES.ADMIN, ROLES.EDITOR, ROLES.INSTRUCTOR].includes(role)) {
      return null;
    }

    return {
      email: id,
      name: fields.name?.stringValue ?? "",
      image: fields.image?.stringValue ?? "",
      role,
    };
  } catch (error) {
    console.error("[admin lookup] Failed:", error?.message ?? error);
    return null;
  }
}
