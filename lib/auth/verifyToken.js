// lib/auth/verifyToken.js

import "server-only";

import { createRemoteJWKSet, jwtVerify } from "jose";

const PROJECT_ID = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;

const JWKS = createRemoteJWKSet(
  new URL(
    "https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com",
  ),
);

export async function verifyIdToken(token) {
  if (!PROJECT_ID) {
    throw new Error("Missing NEXT_PUBLIC_FIREBASE_PROJECT_ID.");
  }

  if (!token) {
    throw new Error("Firebase ID token is required.");
  }

  const { payload } = await jwtVerify(token, JWKS, {
    issuer: `https://securetoken.google.com/${PROJECT_ID}`,
    audience: PROJECT_ID,
  });

  if (!payload.sub || payload.sub.length > 128) {
    throw new Error("Invalid Firebase user ID.");
  }

  return payload;
}
