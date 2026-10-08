// lib/utils/ref.js
import { randomBytes } from "node:crypto";
const ALPHABET = "ABCDEFGHJKMNPQRSTVWXYZ23456789"; // no look-alikes (0/O, 1/I/L)
export function newRef(prefix) {
  const b = randomBytes(6);
  return `${prefix}-${[...b].map((x) => ALPHABET[x % ALPHABET.length]).join("")}`.toLowerCase();
}

