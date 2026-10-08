import "server-only";

import { FieldValue } from "firebase-admin/firestore";

import { db } from "@/lib/firebase/admin/firestore";

import { buildSearchKeywords } from "@/lib/utils/search";

import { serializeDoc } from "./baseRepository";

const ref = (uid) => db.collection("users").doc(uid);

export const userRepository = {
  async getById(uid) {
    const snap = await ref(uid).get();

    return snap.exists ? serializeDoc(snap) : null;
  },

  // Creates the profile on first login.
  // The claim, never a client value, decides the role.
  async upsertFromAuth(d) {
    const now = FieldValue.serverTimestamp();

    return db.runTransaction(async (tx) => {
      const userRef = ref(d.uid);
      const snap = await tx.get(userRef);

      if (!snap.exists) {
        const displayName = d.name ?? d.email?.split("@")[0] ?? "Student";

        tx.create(userRef, {
          uid: d.uid,
          email: d.email ?? "",
          displayName,
          searchKeywords: buildSearchKeywords(displayName, d.email),
          photoURL: d.picture ?? null,
          role: d.role ?? "student",
          phone: "",
          bio: "",
          country: "",
          city: "",
          isActive: true,
          emailVerified: !!d.email_verified,
          createdAt: now,
          updatedAt: now,
          lastLoginAt: now,
        });

        return {
          isActive: true,
          created: true,
        };
      }

      tx.update(userRef, {
        emailVerified: !!d.email_verified,
        role: d.role ?? "student",
        lastLoginAt: now,
        updatedAt: now,
      });

      return {
        isActive: snap.get("isActive") !== false,
        created: false,
      };
    });
  },

  update: (uid, patch) =>
    ref(uid).update({
      ...patch,
      updatedAt: FieldValue.serverTimestamp(),
    }),
};

