import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { assertPermission } from "@/lib/auth/authorize";
import { rateLimit } from "@/lib/security/rateLimit";
import { adminStorage } from "@/lib/firebase/admin/storage";
import { courseAdminRepository } from "@/repositories/admin/courseAdminRepository";
import { adminSlug } from "@/lib/validations/common";
import { AppError } from "@/lib/errors";
import { PERMISSIONS as P } from "@/lib/constants/permissions";

export const runtime = "nodejs";
const MAX = 4 * 1024 * 1024; // stays under typical serverless request limits
const OFFICE = "application/vnd.openxmlformats-officedocument.";
const TYPES = {
  pdf: { mime: "application/pdf", magic: [0x25, 0x50, 0x44, 0x46] },
  zip: { mime: "application/zip", magic: [0x50, 0x4b] },
  docx: { mime: `${OFFICE}wordprocessingml.document`, magic: [0x50, 0x4b] },
  pptx: { mime: `${OFFICE}presentationml.presentation`, magic: [0x50, 0x4b] },
  xlsx: { mime: `${OFFICE}spreadsheetml.sheet`, magic: [0x50, 0x4b] },
  png: { mime: "image/png", magic: [0x89, 0x50, 0x4e, 0x47] },
  jpg: { mime: "image/jpeg", magic: [0xff, 0xd8, 0xff] },
  txt: { mime: "text/plain", magic: null },
};
const fail = (error, status) => NextResponse.json({ error }, { status });

export async function POST(req) {
  try {
    const origin = req.headers.get("origin");
    if (origin && origin !== new URL(process.env.NEXT_PUBLIC_SITE_URL).origin)
      throw new AppError("Invalid request.", 403);
    const actor = await assertPermission(P.LESSONS_UPDATE);
    if (
      !(
        await rateLimit("lesson-upload", {
          key: actor.uid,
          limit: 30,
          windowSec: 600,
        })
      ).ok
    )
      throw new AppError("Too many uploads. Please wait a few minutes.", 429);

    const form = await req.formData();
    const file = form.get("file");
    const slug = adminSlug.safeParse(form.get("course"));
    if (!(file instanceof File) || !slug.success)
      throw new AppError("Invalid request.", 400);
    if (file.size === 0 || file.size > MAX)
      throw new AppError("Files must be under 4 MB.", 400);

    const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
    const type = Object.hasOwn(TYPES, ext) ? TYPES[ext] : null;
    if (!type)
      throw new AppError(
        "Allowed types: PDF, ZIP, DOCX, PPTX, XLSX, PNG, JPG, TXT.",
        400,
      );

    const buf = Buffer.from(await file.arrayBuffer());
    const okMagic = type.magic
      ? type.magic.every((b, i) => buf[i] === b)
      : !buf.includes(0); // the file must really be what its extension says
    if (!okMagic)
      throw new AppError("That file doesn't match its extension.", 400);

    const course = await courseAdminRepository.findBySlug(slug.data);
    if (!course || course.status === "deleted")
      throw new AppError("Course not found.", 404);

    const safe = file.name.replace(/[^A-Za-z0-9._-]+/g, "-").slice(-80);
    const path = `private/lessons/${course.id}/${randomUUID()}-${safe}`;
    await adminStorage
      .bucket()
      .file(path)
      .save(buf, {
        contentType: type.mime,
        resumable: false,
        metadata: { cacheControl: "private, max-age=0" },
      });
    return NextResponse.json({
      ok: true,
      attachment: { name: safe, path, size: file.size, contentType: type.mime },
    });
  } catch (e) {
    if (e instanceof AppError) return fail(e.message, e.status);
    console.error("[lesson-attachments]", e);
    return fail("Upload failed. Please try again.", 500);
  }
}

