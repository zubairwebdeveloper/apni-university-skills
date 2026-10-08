// scripts/provision-admin.mjs
// Run once, deliberately:  node --env-file=.env.local scripts/provision-admin.mjs
import { cert, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { FieldValue, getFirestore } from "firebase-admin/firestore";

const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
if (!email) {
  console.error("Set ADMIN_EMAIL in .env.local first.");
  process.exit(1);
}

initializeApp({
  credential: cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
  }),
});
const auth = getAuth();
const db = getFirestore();

let user;
try {
  user = await auth.getUserByEmail(email);
} catch {
  console.error(
    `No account for ${email}. Register at /register with this email and verify it, then run this again.`,
  );
  process.exit(1);
}

// Refuse unless the mailbox is verified, so nobody can claim the admin email by registering first
if (!user.emailVerified) {
  console.error(
    "That account's email isn't verified yet. Verify it, then run this again.",
  );
  process.exit(1);
}

await auth.setCustomUserClaims(user.uid, {
  ...(user.customClaims ?? {}),
  role: "admin",
});
await auth.revokeRefreshTokens(user.uid); // forces a fresh login so the new claim takes effect
await db
  .collection("users")
  .doc(user.uid)
  .set(
    { role: "admin", updatedAt: FieldValue.serverTimestamp() },
    { merge: true },
  );
await db
  .collection("auditLogs")
  .add({
    action: "admin.provisioned",
    actorId: "provision-script",
    targetId: user.uid,
    createdAt: FieldValue.serverTimestamp(),
  });

console.log(`${email} is now an admin. Log out and back in to use /admin.`);
