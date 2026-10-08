// components/shared/ImageUpload.jsx: uploads straight to Firebase Storage (rules enforce owner, type and size)
"use client";
import { useRef, useState } from "react";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { storage } from "@/lib/firebase/client/storage";

const TYPES = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp" };

export function ImageUpload({
  folder,
  currentUrl,
  fallbackText,
  onUploaded,
  maxMB = 2,
  label = "Change photo",
}) {
  const input = useRef(null);
  const [busy, setBusy] = useState(false);

  async function onFile(e) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (!TYPES[file.type]) return toast.error("Use a JPG, PNG, or WebP image.");
    if (file.size > maxMB * 1024 * 1024)
      return toast.error(`Image must be under ${maxMB} MB.`);
    setBusy(true);
    try {
      const r = ref(storage, `${folder}/${Date.now()}.${TYPES[file.type]}`);
      await uploadBytes(r, file, { contentType: file.type });
      await onUploaded(await getDownloadURL(r));
    } catch {
      toast.error("Upload failed. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex items-center gap-4">
      <Avatar className="size-20">
        <AvatarImage src={currentUrl ?? undefined} alt="" />
        <AvatarFallback className="font-serif text-xl">
          {fallbackText}
        </AvatarFallback>
      </Avatar>
      <div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => input.current?.click()}
          disabled={busy}
        >
          {busy ? "Uploading…" : label}
        </Button>
        <p className="mt-1.5 text-xs text-muted-foreground">
          JPG, PNG, or WebP, up to {maxMB} MB.
        </p>
        <input
          ref={input}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={onFile}
        />
      </div>
    </div>
  );
}

