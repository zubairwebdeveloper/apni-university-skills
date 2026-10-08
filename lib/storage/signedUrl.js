// lib/storage/signedUrl.js
import "server-only";
import { adminStorage } from "@/lib/firebase/admin/storage";

export async function signAttachments(list = []) {
  const out = [];
  for (const a of list) {
    if (!a?.path?.startsWith("private/lessons/")) continue;
    try {
      const [url] = await adminStorage
        .bucket()
        .file(a.path)
        .getSignedUrl({
          version: "v4",
          action: "read",
          expires: Date.now() + 30 * 60 * 1000,
          responseDisposition: `attachment; filename="${String(a.name).replace(/["\r\n]/g, "")}"`,
        });
      out.push({ name: a.name, size: a.size, url });
    } catch (e) {
      console.error("[signAttachments]", e?.message ?? e);
    }
  }
  return out;
}

