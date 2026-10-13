// components/admin/forms/ImageField.jsx: uploads straight to Storage. Rules require an admin/editor claim,
// images only, under 5 MB. The URL is re-validated on the server.
"use client";
import { useRef, useState } from "react";
import Image from "next/image";
import { Controller } from "react-hook-form";
import { getDownloadURL, ref, uploadBytesResumable } from "firebase/storage";
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
const MAX_BYTES = 5 * 1024 * 1024;

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
  const taskRef = useRef(null);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [brokenUrl, setBrokenUrl] = useState("");
  const id = `f-${name}`;

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => {
        async function upload(file) {
          if (!file) return;
          if (!TYPES[file.type])
            return toast.error("Use a JPG, PNG, or WebP image.");
          if (file.size > MAX_BYTES)
            return toast.error("Image must be under 5 MB.");
          setBusy(true);
          setProgress(0);
          try {
            await auth.currentUser?.getIdToken(true); // pick up a recently changed role claim
            const r = ref(
              storage,
              `public/${kind}/${crypto.randomUUID()}.${TYPES[file.type]}`,
            );
            const task = uploadBytesResumable(r, file, {
              contentType: file.type,
            });
            taskRef.current = task;
            await new Promise((resolve, reject) =>
              task.on(
                "state_changed",
                (snap) =>
                  setProgress(
                    Math.round((snap.bytesTransferred / snap.totalBytes) * 100),
                  ),
                reject,
                resolve,
              ),
            );
            field.onChange(await getDownloadURL(r));
          } catch (err) {
            if (err?.code === "storage/canceled") {
              toast("Upload cancelled.");
            } else {
              toast.error(
                err?.code === "storage/unauthorized"
                  ? "You don't have permission to upload. If your role changed recently, log out and back in."
                  : "Upload failed. Please try again.",
              );
            }
          } finally {
            taskRef.current = null;
            setBusy(false);
            setProgress(0);
          }
        }

        function onFile(e) {
          const file = e.target.files?.[0];
          e.target.value = "";
          upload(file);
        }

        function onDrop(e) {
          e.preventDefault();
          setDragging(false);
          if (busy) return;
          upload(e.dataTransfer.files?.[0]);
        }

        const broken = !!field.value && brokenUrl === field.value;

        return (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel htmlFor={id}>{label}</FieldLabel>
            <div
              onDragOver={(e) => {
                e.preventDefault();
                if (!busy) setDragging(true);
              }}
              onDragLeave={() => setDragging(false)}
              onDrop={onDrop}
              className={`relative overflow-hidden rounded-lg border bg-muted ${aspect} ${previewClassName} ${
                field.value ? "" : "border-dashed"
              } ${dragging ? "border-primary ring-2 ring-primary/40" : ""}`}
            >
              {field.value && !broken ? (
                <Image
                  src={field.value}
                  alt=""
                  fill
                  sizes="384px"
                  className="object-cover"
                  onError={() => setBrokenUrl(field.value)}
                />
              ) : (
                <div className="grid h-full place-items-center p-3 text-center text-muted-foreground">
                  <div>
                    <FiImage className="mx-auto size-7" aria-hidden="true" />
                    <span className="sr-only">
                      {broken
                        ? "Image preview failed to load"
                        : "No image selected"}
                    </span>
                    <span aria-hidden="true" className="mt-1 block text-xs">
                      {broken
                        ? "Preview couldn't load. Try replacing the image."
                        : "Drop an image here"}
                    </span>
                  </div>
                </div>
              )}

              {busy && (
                <div className="absolute inset-0 grid place-items-center bg-background/80 p-4">
                  <div className="w-full max-w-[12rem] text-center">
                    <p className="text-sm font-medium text-foreground">
                      Uploading… {progress}%
                    </p>
                    <div
                      role="progressbar"
                      aria-label="Upload progress"
                      aria-valuemin={0}
                      aria-valuemax={100}
                      aria-valuenow={progress}
                      className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted"
                    >
                      <div
                        className="h-full bg-primary transition-[width] duration-150 motion-reduce:transition-none"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
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
              {busy && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => taskRef.current?.cancel()}
                >
                  Cancel
                </Button>
              )}
              {field.value && !busy && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => field.onChange("")}
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
