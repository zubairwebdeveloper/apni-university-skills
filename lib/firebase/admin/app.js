import "server-only";

import { cert, getApps, initializeApp } from "firebase-admin/app";

const projectId = process.env.FIREBASE_PROJECT_ID?.trim();
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL?.trim();

const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(
  /\\n/g,
  "\n",
).trim();

const envStatus = {
  projectIdPresent: Boolean(projectId),
  clientEmailPresent: Boolean(clientEmail),
  privateKeyPresent: Boolean(privateKey),
  projectIdMatches: projectId === "apniuniversity-7b904",
  clientEmailLooksValid:
    typeof clientEmail === "string" &&
    clientEmail.includes("@") &&
    clientEmail.endsWith(".iam.gserviceaccount.com"),
  privateKeyHasHeader:
    privateKey?.includes("-----BEGIN PRIVATE KEY-----") ?? false,
  privateKeyHasFooter:
    privateKey?.includes("-----END PRIVATE KEY-----") ?? false,
};

console.info("[Firebase Admin env check]", envStatus);

if (!projectId || !clientEmail || !privateKey) {
  throw new Error(
    "Missing Firebase Admin environment variables. Check FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, and FIREBASE_PRIVATE_KEY.",
  );
}

export const adminApp =
  getApps()[0] ??
  initializeApp({
    credential: cert({
      projectId,
      clientEmail,
      privateKey,
    }),
  });

export function getAdminApp() {
  return adminApp;
}
