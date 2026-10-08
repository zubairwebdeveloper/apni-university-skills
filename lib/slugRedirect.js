// lib/slugRedirect.js
import "server-only";
import { permanentRedirect } from "next/navigation";
import { db } from "@/lib/firebase/admin/firestore";

// Follows slug history (a -> b -> c). Call just before notFound().
export async function redirectIfRenamed(collection, slug, basePath) {
  let current = slug;
  for (let i = 0; i < 5; i++) {
    const s = await db
      .collection("slugRegistry")
      .doc(`${collection}__${current}`)
      .get();
    if (!s.exists || s.get("current") !== false || !s.get("redirectTo")) break;
    current = s.get("redirectTo");
  }
  if (current !== slug) permanentRedirect(`${basePath}/${current}`);
}

