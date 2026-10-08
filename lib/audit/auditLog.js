import "server-only";

import { FieldValue } from "firebase-admin/firestore";

import { db } from "@/lib/firebase/admin/firestore";

const SENSITIVE =
  /pass(word)?|secret|token|api.?key|authorization|private|card|cvc/i;

/**
 * Remove sensitive values and keep audit metadata
 * small + safely serializable.
 */
function clean(value, depth = 0) {
  if (
    value == null ||
    typeof value === "number" ||
    typeof value === "boolean"
  ) {
    return value;
  }

  if (typeof value === "string") {
    return value.slice(0, 300);
  }

  if (depth >= 3) {
    return undefined;
  }

  if (Array.isArray(value)) {
    return value.slice(0, 20).map((item) => clean(item, depth + 1));
  }

  if (typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value)
        .filter(([key]) => !SENSITIVE.test(key))
        .map(([key, value]) => [key, clean(value, depth + 1)]),
    );
  }

  return undefined;
}

/**
 * Names of fields that differ.
 *
 * Store field names only — never full before/after
 * document bodies.
 */
export const changedFields = (before = {}, after = {}) =>
  Object.keys(after).filter(
    (key) => JSON.stringify(before[key]) !== JSON.stringify(after[key]),
  );

/**
 * Build a normalized audit document.
 *
 * Shared by both normal writes and Firestore
 * transactions so the audit shape stays consistent.
 */
function build(
  actor,
  { action, resource, resourceId = null, resourceSlug = null, metadata = {} },
) {
  let meta = clean(metadata) ?? {};

  if (JSON.stringify(meta).length > 3000) {
    meta = {
      truncated: true,
    };
  }

  return {
    actorId: actor.uid,
    actorEmail: actor.email ?? null,
    actorRole: actor.role ?? null,

    action,
    resource,

    resourceId,
    resourceSlug,

    metadata: meta,

    createdAt: FieldValue.serverTimestamp(),
  };
}

/**
 * Write an audit entry outside a transaction.
 */
export async function writeAudit(actor, entry) {
  await db.collection("auditLogs").add(build(actor, entry));
}

/**
 * Write an audit entry inside an existing Firestore
 * transaction.
 *
 * The audit document is created atomically with the
 * transaction's other changes.
 */
export function writeAuditTx(tx, actor, entry) {
  const ref = db.collection("auditLogs").doc();

  tx.create(ref, build(actor, entry));
}
export const SYSTEM_ACTOR = { uid: "system", email: null, role: "system" };

