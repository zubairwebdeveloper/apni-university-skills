// lib/cache.js: Next 15 ignores the second argument, Next 16 requires it
import { revalidateTag } from "next/cache";
export const bustTag = (tag) => revalidateTag(tag, "max");

