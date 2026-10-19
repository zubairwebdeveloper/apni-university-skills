// components/admin/forms/ImageField.jsx: uploads straight to Storage. Rules require an admin/editor claim,
// images only, under 5 MB. The URL is re-validated on the server.
"use client";
import { useRef, useState } from "react";
import Image from "next/image";
import { Controller } from "react-hook-form";
import { getDownloadURL, ref, uploadBytesResumable } from "firebase/storage";
import {
  FiImage,
  FiLoader,
  FiRefreshCw,
  FiTrash2,
  FiUploadCloud,
  FiX,
} from "react-icons/fi";
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
import { cn } from "@/lib/utils";

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

        // Ignore dragleave events that only move between child elements (stops flicker)
        function onDragLeave(e) {
          if (e.currentTarget.contains(e.relatedTarget)) return;
          setDragging(false);
        }

        const broken = !!field.value && brokenUrl === field.value;
        const hasImage = !!field.value && !broken;
        const openPicker = () => input.current?.click();

        return (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel htmlFor={id}>{label}</FieldLabel>
            <div
              onDragOver={(e) => {
                e.preventDefault();
                if (!busy) setDragging(true);
              }}
              onDragLeave={onDragLeave}
              onDrop={onDrop}
              className={cn(
                "relative overflow-hidden rounded-xl border bg-muted/40 motion-safe:transition-[border-color,box-shadow] motion-safe:duration-150",
                aspect,
                previewClassName,
                !hasImage && "border-dashed",
                dragging && "border-primary ring-2 ring-primary/40",
                fieldState.invalid && "border-destructive/60",
              )}
            >
              {hasImage ? (
                <Image
                  src={field.value}
                  alt="Selected image preview"
                  fill
                  sizes="384px"
                  className="object-cover"
                  onError={() => setBrokenUrl(field.value)}
                />
              ) : (
                <button
                  type="button"
                  onClick={openPicker}
                  disabled={busy}
                  className="grid size-full place-items-center p-4 text-center outline-none motion-safe:transition-colors motion-safe:duration-150 hover:bg-muted/60 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring/60 disabled:cursor-not-allowed"
                >
                  <span className="flex flex-col items-center gap-2">
                    <span
                      aria-hidden="true"
                      className="grid size-10 place-items-center rounded-full bg-background text-muted-foreground ring-1 ring-border"
                    >
                      {broken ? (
                        <FiImage className="size-5" />
                      ) : (
                        <FiUploadCloud className="size-5" />
                      )}
                    </span>
                    <span className="block text-sm font-medium text-foreground">
                      {broken
                        ? "Preview couldn't load"
                        : "Drop an image here, or browse"}
                    </span>
                    <span className="block text-xs text-muted-foreground">
                      {broken
                        ? "Click to replace the image."
                        : "Click to choose a file."}
                    </span>
                  </span>
                </button>
              )}

              {dragging && !busy && (
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 grid place-items-center bg-background/80 text-sm font-medium text-primary"
                >
                  Drop to upload
                </div>
              )}

              {busy && (
                <div className="absolute inset-0 grid place-items-center bg-background/85 p-4">
                  <div className="w-full max-w-[12rem] text-center">
                    <p className="text-sm font-medium tabular-nums text-foreground">
                      Uploading… {progress}%
                    </p>
                    <div
                      role="progressbar"
                      aria-label="Upload progress"
                      aria-valuemin={0}
                      aria-valuemax={100}
                      aria-valuenow={progress}
                      aria-valuetext={`${progress}% uploaded`}
                      className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted"
                    >
                      <div
                        className="h-full rounded-full bg-primary transition-[width] duration-150 motion-reduce:transition-none"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Announces start and end of an upload without spamming every percent */}
            <span role="status" className="sr-only">
              {busy ? "Uploading image" : ""}
            </span>

            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={openPicker}
                disabled={busy}
              >
                {busy ? (
                  <FiLoader
                    className="motion-safe:animate-spin"
                    aria-hidden="true"
                  />
                ) : field.value ? (
                  <FiRefreshCw aria-hidden="true" />
                ) : (
                  <FiUploadCloud aria-hidden="true" />
                )}
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
                  <FiX aria-hidden="true" />
                  Cancel
                </Button>
              )}
              {field.value && !busy && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="text-destructive hover:text-destructive"
                  onClick={() => field.onChange("")}
                >
                  <FiTrash2 aria-hidden="true" />
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
