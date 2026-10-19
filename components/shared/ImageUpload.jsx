// components/shared/ImageUpload.jsx: uploads straight to Firebase Storage (rules enforce owner, type and size)
"use client";
import { useRef, useState } from "react";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { toast } from "sonner";
import { Camera, Loader2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { storage } from "@/lib/firebase/client/storage";
import { cn } from "@/lib/utils";

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
      <button
        type="button"
        onClick={() => input.current?.click()}
        disabled={busy}
        aria-label={label}
        className="group relative rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-wait"
      >
        <Avatar className="size-20 ring-1 ring-border transition-opacity group-hover:opacity-90">
          <AvatarImage src={currentUrl ?? undefined} alt="" />
          <AvatarFallback className="font-serif text-xl">
            {fallbackText}
          </AvatarFallback>
        </Avatar>
        <span
          aria-hidden="true"
          className={cn(
            "absolute inset-0 grid place-items-center rounded-full bg-background/70 opacity-0 transition-opacity",
            busy ? "opacity-100" : "group-hover:opacity-100",
          )}
        >
          {busy ? (
            <Loader2 className="size-5 animate-spin text-foreground" />
          ) : (
            <Camera className="size-5 text-foreground" />
          )}
        </span>
      </button>
      <div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => input.current?.click()}
          disabled={busy}
          className="gap-1.5"
        >
          {busy && (
            <Loader2 aria-hidden="true" className="size-3.5 animate-spin" />
          )}
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
