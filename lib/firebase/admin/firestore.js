import "server-only";

import { getAdminApp } from "./app";
import { getFirestore } from "firebase-admin/firestore";

export const db = getFirestore(getAdminApp());

// Optional alias for code that prefers the explicit Admin name.
export const adminDb = db;

