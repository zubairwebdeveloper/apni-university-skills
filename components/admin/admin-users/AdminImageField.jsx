// components/admin/admin-users/AdminImageField.jsx
"use client";

import { useEffect, useRef, useState } from "react";
import {
  AlertCircle,
  Check,
  ImagePlus,
  Link2,
  Loader2,
  RefreshCw,
  Trash2,
  Upload,
  X,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { uploadAdminImage } from "@/services/admin/uploadAdminImage";
import { cn } from "@/lib/utils";

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

const ACCEPT = ["image/png", "image/jpeg", "image/webp"];
const MAX_INPUT_MB = 5;
const OUTPUT_SIZE = 512;

const TABS = [
  { id: "upload", label: "Upload", Icon: Upload },
  { id: "link", label: "Link", Icon: Link2 },
];

function formatBytes(n) {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${Math.round(n / 1024)} KB`;
  return `${(n / 1024 / 1024).toFixed(1)} MB`;
}

function isHttpUrl(v) {
  try {
    const u = new URL(String(v ?? "").trim());
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}

/**
 * Centre-crops to a square, shrinks to 512px and re-encodes as WebP.
 * A 5 MB phone photo usually ends up around 30-60 KB, so uploads are fast.
 */
async function prepareImage(file) {
  const bmp = await createImageBitmap(file);
  const side = Math.min(bmp.width, bmp.height);
  const sx = (bmp.width - side) / 2;
  const sy = (bmp.height - side) / 2;
  const out = Math.min(OUTPUT_SIZE, side);

  const canvas = document.createElement("canvas");
  canvas.width = out;
  canvas.height = out;
  const ctx = canvas.getContext("2d");
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(bmp, sx, sy, side, side, 0, 0, out, out);
  bmp.close?.();

  const blob = await new Promise((resolve) =>
    canvas.toBlob(resolve, "image/webp", 0.85),
  );
  if (!blob) throw new Error("encode failed");
  return blob;
}

/* ------------------------------------------------------------------ */
/* Component                                                           */
/* ------------------------------------------------------------------ */

/**
 * Controlled field. `value` is the final image URL (or "").
 * - Upload: file is optimised in the browser, sent to /api/admin/upload-image,
 *   and the returned URL is passed to onChange.
 * - Link: whatever the user types is passed to onChange (zod validates it).
 * Everything is optional: an empty value is valid.
 */
export function AdminImageField({
  id = "admin-image",
  value = "",
  invalid = false,
  onChange,
  onBlur,
  onPreviewChange,
  onBusyChange,
}) {
  const [mode, setMode] = useState(value ? "link" : "upload");
  const [status, setStatus] = useState("idle"); // idle | processing | uploading | done | error
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");
  const [meta, setMeta] = useState(null);
  const [localPreview, setLocalPreview] = useState("");
  const [dragging, setDragging] = useState(false);
  const [broken, setBroken] = useState(false);

  const inputRef = useRef(null);
  const abortRef = useRef(null);
  const localRef = useRef("");
  const uploadedUrlRef = useRef("");
  const lastBlobRef = useRef(null);
  const dragDepth = useRef(0);

  const busy = status === "uploading" || status === "processing";
  const shown = localPreview || (isHttpUrl(value) ? value.trim() : "");

  function setLocal(url) {
    if (localRef.current.startsWith("blob:")) {
      URL.revokeObjectURL(localRef.current);
    }
    localRef.current = url;
    setLocalPreview(url);
  }

  // Let the parent know about preview + busy state
  useEffect(() => {
    onPreviewChange?.(localPreview);
  }, [localPreview, onPreviewChange]);

  useEffect(() => {
    onBusyChange?.(busy);
  }, [busy, onBusyChange]);

  useEffect(() => setBroken(false), [shown]);

  // If the value is changed from outside (draft restore, form reset),
  // forget the local preview so we don't show a stale image.
  useEffect(() => {
    if (value !== uploadedUrlRef.current && localRef.current) {
      setLocal("");
      setStatus("idle");
      setMeta(null);
      setError("");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      abortRef.current?.abort();
      if (localRef.current.startsWith("blob:")) {
        URL.revokeObjectURL(localRef.current);
      }
    };
  }, []);

  // Paste an image from the clipboard (screenshots, copied images)
  useEffect(() => {
    if (mode !== "upload") return;
    function onPaste(e) {
      const file = Array.from(e.clipboardData?.files ?? []).find((f) =>
        f.type.startsWith("image/"),
      );
      if (!file) return;
      e.preventDefault();
      handleFile(file);
    }
    window.addEventListener("paste", onPaste);
    return () => window.removeEventListener("paste", onPaste);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode]);

  function fail(message) {
    setStatus("error");
    setError(message);
  }

  async function startUpload(blob) {
    abortRef.current?.abort();
    const ctrl = new AbortController();
    abortRef.current = ctrl;
    lastBlobRef.current = blob;

    setStatus("uploading");
    setProgress(0);
    setError("");

    try {
      const url = await uploadAdminImage(blob, {
        signal: ctrl.signal,
        onProgress: setProgress,
      });
      uploadedUrlRef.current = url;
      onChange?.(url);
      setStatus("done");
    } catch (e) {
      if (e?.name === "AbortError") return;
      fail(e?.message || "Upload failed. Please try again.");
    }
  }

  async function handleFile(file) {
    if (!file) return;
    abortRef.current?.abort();
    setError("");

    if (!ACCEPT.includes(file.type)) {
      return fail("Only PNG, JPG or WebP images are allowed.");
    }
    if (file.size > MAX_INPUT_MB * 1024 * 1024) {
      return fail(`That image is too large. The limit is ${MAX_INPUT_MB} MB.`);
    }

    setStatus("processing");
    let blob;
    try {
      blob = await prepareImage(file);
    } catch {
      return fail("We couldn't read that image. Try a different file.");
    }

    setLocal(URL.createObjectURL(blob));
    setMeta({ name: file.name, before: file.size, after: blob.size });
    await startUpload(blob);
  }

  function pickFile() {
    inputRef.current?.click();
  }

  function cancelUpload() {
    abortRef.current?.abort();
    setLocal("");
    setMeta(null);
    setStatus("idle");
    setProgress(0);
    setError("");
  }

  function removeImage() {
    abortRef.current?.abort();
    setLocal("");
    setMeta(null);
    setStatus("idle");
    setProgress(0);
    setError("");
    uploadedUrlRef.current = "";
    if (inputRef.current) inputRef.current.value = "";
    onChange?.("");
  }

  function switchMode(next) {
    if (next === mode) return;
    if (busy) cancelUpload();
    setError("");
    setMode(next);
  }

  /* ---- drag & drop on the whole box ---- */
  function onDragEnter(e) {
    if (mode !== "upload") return;
    e.preventDefault();
    dragDepth.current += 1;
    setDragging(true);
  }
  function onDragOver(e) {
    if (mode !== "upload") return;
    e.preventDefault();
  }
  function onDragLeave(e) {
    if (mode !== "upload") return;
    e.preventDefault();
    dragDepth.current = Math.max(0, dragDepth.current - 1);
    if (dragDepth.current === 0) setDragging(false);
  }
  function onDrop(e) {
    if (mode !== "upload") return;
    e.preventDefault();
    dragDepth.current = 0;
    setDragging(false);
    handleFile(e.dataTransfer?.files?.[0]);
  }

  /* ---- small pieces ---- */
  const thumb = (
    <span className="relative grid size-16 shrink-0 place-items-center overflow-hidden rounded-full border bg-muted text-muted-foreground">
      {shown && !broken ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          key={shown}
          src={shown}
          alt=""
          className="size-full object-cover"
          onError={() => setBroken(true)}
        />
      ) : (
        <ImagePlus aria-hidden="true" className="size-6" />
      )}
      {busy && (
        <span className="absolute inset-0 grid place-items-center bg-background/60 backdrop-blur-[1px]">
          <Loader2 aria-hidden="true" className="size-5 animate-spin" />
        </span>
      )}
    </span>
  );

  const urlTyped = mode === "link" && value.trim().length > 0;
  const urlInvalid = urlTyped && !isHttpUrl(value);
  const urlInsecure = urlTyped && /^http:\/\//i.test(value.trim());

  return (
    <div
      onDragEnter={onDragEnter}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      className={cn(
        "space-y-3 rounded-xl border bg-card p-4 transition-colors",
        invalid && "border-destructive/50",
        dragging && "border-primary bg-primary/5",
      )}
    >
      {/* Source switch */}
      <div
        role="tablist"
        aria-label="Photo source"
        className="inline-flex rounded-lg border bg-muted/40 p-0.5 text-xs"
      >
        {TABS.map(({ id: tab, label, Icon }) => (
          <button
            key={tab}
            type="button"
            role="tab"
            aria-selected={mode === tab}
            onClick={() => switchMode(tab)}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 font-medium outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring",
              mode === tab
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            <Icon aria-hidden="true" className="size-3.5" />
            {label}
          </button>
        ))}
      </div>

      {/* Hidden native input, shared by "browse" and "replace" */}
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT.join(",")}
        className="sr-only"
        tabIndex={-1}
        aria-hidden="true"
        onChange={(e) => {
          handleFile(e.target.files?.[0]);
          e.target.value = ""; // allow picking the same file again
        }}
      />

      {/* ---------------- Upload mode ---------------- */}
      {mode === "upload" && !shown && (
        <button
          id={id}
          type="button"
          onClick={pickFile}
          onBlur={onBlur}
          disabled={status === "processing"}
          className={cn(
            "flex w-full flex-col items-center gap-2 rounded-xl border-2 border-dashed px-4 py-8 text-center outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring",
            dragging
              ? "border-primary bg-primary/5"
              : "hover:border-primary/50 hover:bg-muted/40",
          )}
        >
          <span className="grid size-11 place-items-center rounded-full bg-primary/10 text-primary">
            {status === "processing" ? (
              <Loader2 aria-hidden="true" className="size-5 animate-spin" />
            ) : (
              <ImagePlus aria-hidden="true" className="size-5" />
            )}
          </span>
          <span className="text-sm font-medium">
            {dragging
              ? "Drop the photo here"
              : "Drag a photo here, click to browse, or paste"}
          </span>
          <span className="text-xs text-muted-foreground">
            PNG, JPG or WebP, up to {MAX_INPUT_MB} MB. It is cropped to a
            square.
          </span>
        </button>
      )}

      {mode === "upload" && shown && (
        <div className="flex items-center gap-4">
          {thumb}

          <div className="min-w-0 flex-1 space-y-1.5" aria-live="polite">
            {status === "processing" && (
              <p className="text-sm text-muted-foreground">
                Getting your photo ready…
              </p>
            )}

            {status === "uploading" && (
              <>
                <p className="text-sm font-medium">
                  {progress >= 100 ? "Saving…" : `Uploading… ${progress}%`}
                </p>
                <div
                  role="progressbar"
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-valuenow={progress}
                  className="h-1.5 w-full overflow-hidden rounded-full bg-muted"
                >
                  <div
                    className="h-full rounded-full bg-primary transition-[width] duration-200 motion-reduce:transition-none"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </>
            )}

            {status === "done" && (
              <>
                <p className="flex items-center gap-1.5 text-sm font-medium text-emerald-600 dark:text-emerald-400">
                  <Check aria-hidden="true" className="size-4" />
                  Photo uploaded
                </p>
                {meta && (
                  <p className="truncate text-xs text-muted-foreground">
                    {meta.name}: {formatBytes(meta.before)} to{" "}
                    {formatBytes(meta.after)}
                  </p>
                )}
              </>
            )}

            {status === "error" && (
              <p
                role="alert"
                className="flex items-start gap-1.5 text-sm text-destructive"
              >
                <AlertCircle
                  aria-hidden="true"
                  className="mt-0.5 size-4 shrink-0"
                />
                {error}
              </p>
            )}

            {status === "idle" && (
              <p className="text-sm text-muted-foreground">Current photo</p>
            )}
          </div>

          <div className="flex shrink-0 items-center gap-1">
            {status === "uploading" ? (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={cancelUpload}
              >
                <X aria-hidden="true" className="size-4" />
                Cancel
              </Button>
            ) : (
              <>
                {status === "error" && lastBlobRef.current && (
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() => startUpload(lastBlobRef.current)}
                  >
                    <RefreshCw aria-hidden="true" className="size-4" />
                    Retry
                  </Button>
                )}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={pickFile}
                  disabled={busy}
                >
                  Replace
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={removeImage}
                  disabled={busy}
                  aria-label="Remove photo"
                  className="text-muted-foreground hover:text-destructive"
                >
                  <Trash2 aria-hidden="true" className="size-4" />
                </Button>
              </>
            )}
          </div>
        </div>
      )}

      {/* Upload errors before any image exists (wrong type, too large) */}
      {mode === "upload" && !shown && error && (
        <p
          role="alert"
          className="flex items-start gap-1.5 text-sm text-destructive"
        >
          <AlertCircle aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
          {error}
        </p>
      )}

      {/* ---------------- Link mode ---------------- */}
      {mode === "link" && (
        <div className="flex items-center gap-4">
          {thumb}
          <div className="min-w-0 flex-1 space-y-1.5">
            <div className="relative">
              <Input
                id={id}
                inputMode="url"
                autoComplete="off"
                placeholder="https://example.com/photo.jpg"
                value={value}
                onChange={(e) => onChange?.(e.target.value)}
                onBlur={(e) => {
                  const trimmed = e.target.value.trim();
                  if (trimmed !== e.target.value) onChange?.(trimmed);
                  onBlur?.();
                }}
                aria-invalid={invalid || urlInvalid}
                className={value ? "pr-9" : undefined}
              />
              {value && (
                <button
                  type="button"
                  onClick={removeImage}
                  aria-label="Clear link"
                  className="absolute right-1.5 top-1/2 grid size-7 -translate-y-1/2 place-items-center rounded-md text-muted-foreground outline-none hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <X aria-hidden="true" className="size-4" />
                </button>
              )}
            </div>

            {urlInvalid && (
              <p className="text-xs text-destructive">
                Enter a full link that starts with https://
              </p>
            )}
            {!urlInvalid && broken && (
              <p className="text-xs text-destructive">
                This link didn&apos;t load as an image. Use a direct image link.
              </p>
            )}
            {!urlInvalid && !broken && urlInsecure && (
              <p className="text-xs text-amber-600 dark:text-amber-400">
                This link is not secure (http). Some images won&apos;t load with
                it. Prefer https.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
