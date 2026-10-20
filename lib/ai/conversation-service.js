// lib/ai/conversation-service.js
import "server-only";
import { FieldValue } from "firebase-admin/firestore";
import { db } from "./db";
import { AI_LIMITS } from "./constants";
import { AppError } from "./errors";

const conversations = (uid) =>
  db.collection("users").doc(uid).collection("aiConversations");

const iso = (ts) => ts?.toDate?.().toISOString() ?? null;
const clip = (s, n) => (s.length > n ? `${s.slice(0, n - 1)}…` : s);
const makeTitle = (text) =>
  clip(text.replace(/\s+/g, " ").trim(), 60) || "New chat";

function toConversation(doc) {
  const d = doc.data();
  return {
    id: doc.id,
    title: d.title ?? "New chat",
    messageCount: d.messageCount ?? 0,
    lastMessagePreview: d.lastMessagePreview ?? "",
    createdAt: iso(d.createdAt),
    updatedAt: iso(d.updatedAt),
  };
}

function toMessage(doc) {
  const d = doc.data();
  return {
    id: doc.id,
    role: d.role,
    content: d.content,
    createdAt: iso(d.createdAt),
  };
}

export async function listConversations(uid) {
  const snap = await conversations(uid)
    .orderBy("updatedAt", "desc")
    .limit(AI_LIMITS.listLimit)
    .get();
  return snap.docs.map(toConversation);
}

// Missing or someone else's conversation both look like 404
export async function getConversation(uid, id) {
  const snap = await conversations(uid).doc(id).get();
  if (!snap.exists) {
    throw new AppError("not_found", 404, "Conversation not found.");
  }
  return toConversation(snap);
}

export async function createConversation(uid, firstMessage) {
  const ref = conversations(uid).doc();
  await ref.set({
    title: makeTitle(firstMessage),
    messageCount: 0,
    lastMessagePreview: "",
    status: "active",
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  });
  return ref.id;
}

export async function addMessage(uid, id, { role, content, usage, stopped }) {
  const convRef = conversations(uid).doc(id);
  const msgRef = convRef.collection("messages").doc();
  const batch = db.batch();
  batch.set(msgRef, {
    role,
    content,
    createdAt: FieldValue.serverTimestamp(),
    ...(usage ? { usage } : {}),
    ...(stopped ? { stopped: true } : {}),
  });
  batch.update(convRef, {
    updatedAt: FieldValue.serverTimestamp(),
    messageCount: FieldValue.increment(1),
    lastMessagePreview: clip(content.replace(/\s+/g, " ").trim(), 120),
  });
  await batch.commit();
  return msgRef.id;
}

export async function listRecentMessages(uid, id, limit) {
  const snap = await conversations(uid)
    .doc(id)
    .collection("messages")
    .orderBy("createdAt", "desc")
    .limit(limit)
    .get();
  return snap.docs.map(toMessage).reverse();
}

export async function listAllMessages(uid, id) {
  const snap = await conversations(uid)
    .doc(id)
    .collection("messages")
    .orderBy("createdAt", "asc")
    .limit(AI_LIMITS.conversationMaxMessages + 5)
    .get();
  return snap.docs.map(toMessage);
}

export async function deleteMessage(uid, id, messageId) {
  const convRef = conversations(uid).doc(id);
  const batch = db.batch();
  batch.delete(convRef.collection("messages").doc(messageId));
  batch.update(convRef, { messageCount: FieldValue.increment(-1) });
  await batch.commit();
}

export async function renameConversation(uid, id, title) {
  await getConversation(uid, id);
  await conversations(uid).doc(id).update({
    title,
    updatedAt: FieldValue.serverTimestamp(),
  });
}

export async function deleteConversation(uid, id) {
  await getConversation(uid, id);
  await db.recursiveDelete(conversations(uid).doc(id));
}
