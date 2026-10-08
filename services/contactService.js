// services/contactService.js

import "server-only";

import { FieldValue } from "firebase-admin/firestore";

import { db } from "@/lib/firebase/admin/firestore";
import { newRef } from "@/lib/utils/ref";
import { buildSearchKeywords } from "@/lib/utils/search";

export const contactService = {
  async create({ name, email, subject, message }) {
    const now = FieldValue.serverTimestamp();

    await db.collection("contactMessages").add({
      slug: newRef("msg"),
      name,
      email,
      subject,
      message,
      status: "new",
      searchKeywords: buildSearchKeywords(name, email, subject),
      createdAt: now,
      updatedAt: now,
    });
  },
};

