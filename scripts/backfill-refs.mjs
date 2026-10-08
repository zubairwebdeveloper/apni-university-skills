// scripts/backfill-refs.mjs
//
// Run:
// node --env-file=.env.local scripts/backfill-refs.mjs

import { cert, initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { randomBytes } from "node:crypto";

initializeApp({
  credential: cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
  }),
});

const db = getFirestore();

const ALPHABET = "abcdefghjkmnpqrstvwxyz23456789";

const ref = (prefix) =>
  `${prefix}-${[...randomBytes(6)]
    .map((byte) => ALPHABET[byte % ALPHABET.length])
    .join("")}`;

const tokenize = (value = "") =>
  String(value)
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .split(/[^a-z0-9+#.]+/)
    .filter((token) => token.length >= 2);

const keywords = (...parts) => {
  const set = new Set();

  for (const token of parts.flatMap(tokenize)) {
    set.add(token);

    for (let i = 2; i <= Math.min(token.length, 10); i++) {
      set.add(token.slice(0, i));
    }
  }

  return [...set].slice(0, 200);
};

/* -------------------------------------------------------------------------- */
/* Users / Enrollments / Payments / Reviews                                   */
/* -------------------------------------------------------------------------- */

for (const [collection, prefix] of [
  ["users", "usr"],
  ["enrollments", "enr"],
  ["payments", "pay"],
  ["reviews", "rev"],
]) {
  const snap = await db.collection(collection).get();

  let updated = 0;

  for (const doc of snap.docs) {
    const patch = {};

    if (!doc.get("slug")) {
      patch.slug = ref(prefix);
    }

    if (collection === "payments" && doc.get("status") === "succeeded") {
      patch.status = "paid";
    }

    if (collection === "payments" && doc.get("status") === "expired") {
      patch.status = "cancelled";
    }

    if (Object.keys(patch).length) {
      await doc.ref.update(patch);
      updated++;
    }
  }

  console.log(`${collection}: ${updated} updated`);
}

/* -------------------------------------------------------------------------- */
/* User search keywords                                                       */
/* -------------------------------------------------------------------------- */

const users = await db.collection("users").get();

let usersUpdated = 0;

for (const doc of users.docs) {
  if (!doc.get("searchKeywords")) {
    await doc.ref.update({
      searchKeywords: keywords(doc.get("displayName"), doc.get("email")),
    });

    usersUpdated++;
  }
}

console.log(`User search keywords: ${usersUpdated} updated`);

/* -------------------------------------------------------------------------- */
/* Careers / Categories                                                       */
/* -------------------------------------------------------------------------- */

for (const [collection, fields] of [
  ["careers", ["title", "summary", "skills"]],
  ["categories", ["name", "description"]],
]) {
  const snap = await db.collection(collection).get();

  let updated = 0;

  for (const doc of snap.docs) {
    const patch = {};

    if (!doc.get("searchKeywords")) {
      patch.searchKeywords = keywords(
        ...fields.map((field) => doc.get(field) ?? ""),
      );
    }

    if (collection === "categories" && doc.get("coursesCount") === undefined) {
      patch.coursesCount = 0;
    }

    if (Object.keys(patch).length) {
      await doc.ref.update(patch);
      updated++;
    }
  }

  console.log(`${collection}: ${updated} updated`);
}

/* -------------------------------------------------------------------------- */
/* Certificates                                                               */
/* -------------------------------------------------------------------------- */

const certificates = await db.collection("certificates").get();

let certificatesUpdated = 0;

for (const doc of certificates.docs) {
  const patch = {};

  if (!doc.get("slug")) {
    patch.slug = doc.get("certificateNumber") || ref("cert");
  }

  if (!doc.get("verificationCode")) {
    patch.verificationCode = randomBytes(8).toString("hex");
  }

  if (!doc.get("status")) {
    patch.status = "valid";
  }

  if (Object.keys(patch).length) {
    await doc.ref.update(patch);
    certificatesUpdated++;
  }
}

console.log(`Certificates: ${certificatesUpdated} updated`);

/* -------------------------------------------------------------------------- */
/* Contacts                                                                   */
/* -------------------------------------------------------------------------- */

const contacts = await db.collection("contacts").get();

let contactsUpdated = 0;

for (const doc of contacts.docs) {
  const patch = {};

  if (!doc.get("slug")) {
    patch.slug = ref("msg");
  }

  if (!doc.get("searchKeywords")) {
    patch.searchKeywords = keywords(
      doc.get("name"),
      doc.get("email"),
      doc.get("subject"),
    );
  }

  if (!doc.get("status")) {
    patch.status = "new";
  }

  if (Object.keys(patch).length) {
    await doc.ref.update(patch);
    contactsUpdated++;
  }
}

console.log(`Contacts: ${contactsUpdated} updated`);

console.log("Backfill complete.");
