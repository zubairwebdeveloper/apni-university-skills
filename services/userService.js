// services/userService.js
import "server-only";
import { adminAuth } from "@/lib/firebase/admin/auth";
import { userRepository } from "@/repositories/userRepository";
import { AppError } from "@/lib/errors";

export const userService = {
  getProfile: (uid) => userRepository.getById(uid),
  syncProfile: (decoded) => userRepository.upsertFromAuth(decoded),

  async updateProfile(uid, data) {
    const profile = await userRepository.getById(uid);
    await userRepository.update(uid, {
      ...data,
      searchKeywords: buildSearchKeywords(
        data.displayName,
        profile?.email ?? "",
      ),
    });
    await adminAuth.updateUser(uid, { displayName: data.displayName });
  },

  // Only accept URLs inside THIS user's avatar folder in OUR bucket
  async updateAvatar(uid, url) {
    let u;
    try {
      u = new URL(url);
    } catch {
      throw new AppError("Invalid image URL.");
    }
    const prefix = `/v0/b/${process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET}/o/users%2F${uid}%2Favatar%2F`;
    if (
      u.protocol !== "https:" ||
      u.hostname !== "firebasestorage.googleapis.com" ||
      !u.pathname.startsWith(prefix)
    )
      throw new AppError("Invalid image URL.");
    await userRepository.update(uid, { photoURL: url });
    await adminAuth.updateUser(uid, { photoURL: url });
  },
};

