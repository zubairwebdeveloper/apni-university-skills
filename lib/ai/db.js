// lib/ai/db.js
import "server-only";
// ⚠️ Is ek line ko apne project ke Firebase Admin Firestore export se match karein.
import { adminDb } from "@/lib/firebase/admin/firestore";

export const db = adminDb;
