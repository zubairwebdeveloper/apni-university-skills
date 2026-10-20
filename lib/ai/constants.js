// lib/ai/constants.js  (client + server safe)
export const AI_ASSISTANT_PATH = "/student/ai-assistant";

export const AI_LIMITS = {
  messageMaxChars: 4000,
  maxBodyBytes: 16000,
  historyMessages: 20,
  conversationMaxMessages: 200,
  titleMaxChars: 80,
  listLimit: 50,
  rateWindowMs: 60_000,
  rateMaxRequests: 12,
  streamTimeoutMs: 55_000,
};

// Firestore auto-IDs are 20 alphanumeric characters
export const CONVERSATION_ID_PATTERN = /^[A-Za-z0-9]{10,40}$/;
