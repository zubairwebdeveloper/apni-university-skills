// app/api/admin/upload-image/route.js
import crypto from "node:crypto";
import { NextResponse } from "next/server";

import { requirePermission } from "@/lib/auth/authorize";
import { PERMISSIONS as P } from "@/lib/constants/permissions";

export const runtime = "nodejs";

const MAX_BYTES = 2 * 1024 * 1024; // the browser already shrinks to ~50 KB

/** Detect the real image type from the first bytes, never trust the client. */
function sniffType(buf) {
  if (
    buf.length > 12 &&
    buf.subarray(0, 4).toString("ascii") === "RIFF" &&
    buf.subarray(8, 12).toString("ascii") === "WEBP"
  ) {
    return "image/webp";
  }
  if (buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff)
    return "image/jpeg";
  const png = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  if (buf.length > 8 && buf.subarray(0, 8).equals(png)) return "image/png";
  return null;
}

/**
 * Storage adapter. Swap this one function for S3 / Firebase Storage /
 * UploadThing if you don't use Cloudinary. It must return a public https URL.
 *
 * Needs: CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET
 */
async function storeImage(buffer, mime) {
  const cloud = process.env.CLOUDINARY_CLOUD_NAME;
  const key = process.env.CLOUDINARY_API_KEY;
  const secret = process.env.CLOUDINARY_API_SECRET;
  if (!cloud || !key || !secret) {
    const err = new Error("Image storage is not configured on the server.");
    err.status = 500;
    throw err;
  }

  const timestamp = Math.floor(Date.now() / 1000);
  const folder = "admin-avatars";
  const signature = crypto
    .createHash("sha1")
    .update(`folder=${folder}&timestamp=${timestamp}${secret}`)
    .digest("hex");

  const body = new FormData();
  body.append("file", new Blob([buffer], { type: mime }), "avatar");
  body.append("api_key", key);
  body.append("timestamp", String(timestamp));
  body.append("folder", folder);
  body.append("signature", signature);

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${cloud}/image/upload`,
    {
      method: "POST",
      body,
    },
  );
  const data = await res.json().catch(() => ({}));
  if (!res.ok || !data.secure_url) {
    const err = new Error(
      data?.error?.message || "Image storage rejected the file.",
    );
    err.status = 502;
    throw err;
  }
  return data.secure_url;
}

export async function POST(request) {
  // Same permission as the create/edit admin pages
  try {
    await requirePermission(P.USERS_ROLES);
  } catch {
    return NextResponse.json(
      { error: "You are not allowed to upload photos." },
      { status: 403 },
    );
  }

  try {
    const form = await request.formData();
    const file = form.get("file");

    if (
      !file ||
      typeof file === "string" ||
      typeof file.arrayBuffer !== "function"
    ) {
      return NextResponse.json(
        { error: "No image was sent." },
        { status: 400 },
      );
    }
    if (file.size === 0 || file.size > MAX_BYTES) {
      return NextResponse.json(
        { error: "Image must be smaller than 2 MB." },
        { status: 413 },
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const mime = sniffType(buffer);
    if (!mime) {
      return NextResponse.json(
        { error: "Only PNG, JPG or WebP images are allowed." },
        { status: 415 },
      );
    }

    const url = await storeImage(buffer, mime);
    return NextResponse.json({ url });
  } catch (e) {
    return NextResponse.json(
      { error: e?.message || "Upload failed. Please try again." },
      { status: e?.status || 500 },
    );
  }
}
