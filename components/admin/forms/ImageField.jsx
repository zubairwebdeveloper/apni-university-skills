// components/admin/forms/ImageField.jsx: uploads straight to Storage. Rules require an admin/editor claim,
// images only, under 5 MB. The URL is re-validated on the server.
"use client";
import { useRef, useState } from "react";
import Image from "next/image";
import { Controller } from "react-hook-form";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { FiImage } from "react-icons/fi";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";
import { auth } from "@/lib/firebase/client/auth";
import { storage } from "@/lib/firebase/client/storage";

const TYPES = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp" };

export function ImageField({
  control,
  name,
  label,
  kind,
  description,
  aspect = "aspect-video",
  previewClassName = "w-full max-w-sm",
}) {
  const input = useRef(null);
  const [busy, setBusy] = useState(false);
  const id = `f-${name}`;

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => {
        async function onFile(e) {
          const file = e.target.files?.[0];
          e.target.value = "";
          if (!file) return;
          if (!TYPES[file.type])
            return toast.error("Use a JPG, PNG, or WebP image.");
          if (file.size > 5 * 1024 * 1024)
            return toast.error("Image must be under 5 MB.");
          setBusy(true);
          try {
            await auth.currentUser?.getIdToken(true); // pick up a recently changed role claim
            const r = ref(
              storage,
              `public/${kind}/${crypto.randomUUID()}.${TYPES[file.type]}`,
            );
            await uploadBytes(r, file, { contentType: file.type });
            field.onChange(await getDownloadURL(r));
          } catch (err) {
            toast.error(
              err?.code === "storage/unauthorized"
                ? "You don't have permission to upload. If your role changed recently, log out and back in."
                : "Upload failed. Please try again.",
            );
          } finally {
            setBusy(false);
          }
        }
        return (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel htmlFor={id}>{label}</FieldLabel>
            <div
              className={`relative overflow-hidden rounded-lg border bg-muted ${aspect} ${previewClassName}`}
            >
              {field.value ? (
                <Image
                  src={field.value}
                  alt=""
                  fill
                  sizes="384px"
                  className="object-cover"
                />
              ) : (
                <div className="grid h-full place-items-center text-muted-foreground">
                  <FiImage className="size-7" aria-hidden="true" />
                  <span className="sr-only">No image selected</span>
                </div>
              )}
            </div>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => input.current?.click()}
                disabled={busy}
              >
                {busy
                  ? "Uploading…"
                  : field.value
                    ? "Replace image"
                    : "Upload image"}
              </Button>
              {field.value && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => field.onChange("")}
                  disabled={busy}
                >
                  Remove
                </Button>
              )}
            </div>
            <input
              id={id}
              ref={input}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={onFile}
            />
            {fieldState.invalid ? (
              <FieldError errors={[fieldState.error]} />
            ) : (
              <FieldDescription>
                {description ?? "JPG, PNG or WebP, up to 5 MB."}
              </FieldDescription>
            )}
          </Field>
        );
      }}
    />
  );
}

