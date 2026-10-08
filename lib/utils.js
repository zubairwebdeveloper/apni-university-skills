export { cn } from "cn";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { randomBytes } from "node:crypto";

export default function cn(...inputs) {
  return twMerge(clsx(inputs));
}

const REF_ALPHABET = "abcdefghjkmnpqrstvwxyz23456789";

export function newRef(prefix = "ref") {
  const value = [...randomBytes(6)]
    .map((byte) => REF_ALPHABET[byte % REF_ALPHABET.length])
    .join("");

  return `${prefix}-${value}`;
}
