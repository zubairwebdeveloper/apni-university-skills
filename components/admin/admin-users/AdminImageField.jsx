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

const focusRing =
  "outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background";

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

// Only react to drags that carry files, not selected text or links.
function hasFiles(e) {
  return Array.from(e.dataTransfer?.types ?? []).includes("Files");
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
  const runRef = useRef(0); // invalidates a photo that is still being prepared
  const tabRefs = useRef({});

  // Always call the latest callbacks, even from long-lived listeners.
  const onChangeRef = useRef(onChange);
  const handleFileRef = useRef(null);
  useEffect(() => {
    onChangeRef.current = onChange;
  });

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

  useEffect(() => {
    setBroken(false);
  }, [shown]);

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
      runRef.current += 1;
      abortRef.current?.abort();
      if (localRef.current.startsWith("blob:")) {
        URL.revokeObjectURL(localRef.current);
      }
    };
  }, []);

  // Paste an image from the clipboard (screenshots, copied images)
  useEffect(() => {
    if (mode !== "upload") return undefined;
    function onPaste(e) {
      const file = Array.from(e.clipboardData?.files ?? []).find((f) =>
        f.type.startsWith("image/"),
      );
      if (!file) return;
      e.preventDefault();
      handleFileRef.current?.(file);
    }
    window.addEventListener("paste", onPaste);
    return () => window.removeEventListener("paste", onPaste);
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
      onChangeRef.current?.(url);
      setStatus("done");
    } catch (e) {
      if (e?.name === "AbortError") return;
      fail(e?.message || "Upload failed. Please try again.");
    }
  }

  async function handleFile(file) {
    if (!file) return;
    abortRef.current?.abort();
    const run = ++runRef.current;
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
      if (run !== runRef.current) return;
      return fail("We couldn't read that image. Try a different file.");
    }

    // A newer file, a cancel or a remove happened while this one was prepared
    if (run !== runRef.current) return;

    setLocal(URL.createObjectURL(blob));
    setMeta({ name: file.name, before: file.size, after: blob.size });
    await startUpload(blob);
  }

  useEffect(() => {
    handleFileRef.current = handleFile;
  });

  function pickFile() {
    inputRef.current?.click();
  }

  function cancelUpload() {
    runRef.current += 1;
    abortRef.current?.abort();
    setLocal("");
    setMeta(null);
    setStatus("idle");
    setProgress(0);
    setError("");
  }

  function removeImage() {
    runRef.current += 1;
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
    dragDepth.current = 0;
    setDragging(false);
    setMode(next);
  }

  function onTabKeyDown(e) {
    const index = TABS.findIndex((t) => t.id === mode);
    let next = null;
    if (e.key === "ArrowRight") next = TABS[(index + 1) % TABS.length];
    else if (e.key === "ArrowLeft")
      next = TABS[(index - 1 + TABS.length) % TABS.length];
    else if (e.key === "Home") next = TABS[0];
    else if (e.key === "End") next = TABS[TABS.length - 1];
    if (!next) return;
    e.preventDefault();
    switchMode(next.id);
    tabRefs.current[next.id]?.focus();
  }

  /* ---- drag & drop on the whole box ---- */
  function onDragEnter(e) {
    if (mode !== "upload" || !hasFiles(e)) return;
    e.preventDefault();
    dragDepth.current += 1;
    setDragging(true);
  }
  function onDragOver(e) {
    if (mode !== "upload" || !hasFiles(e)) return;
    e.preventDefault();
  }
  function onDragLeave(e) {
    if (mode !== "upload" || !hasFiles(e)) return;
    e.preventDefault();
    dragDepth.current = Math.max(0, dragDepth.current - 1);
    if (dragDepth.current === 0) setDragging(false);
  }
  function onDrop(e) {
    if (mode !== "upload" || !hasFiles(e)) return;
    e.preventDefault();
    dragDepth.current = 0;
    setDragging(false);
    handleFile(e.dataTransfer?.files?.[0]);
  }

  /* ---- small pieces ---- */
  const thumb = (
    <span className="relative grid size-20 shrink-0 place-items-center overflow-hidden rounded-full border-2 border-background bg-muted text-muted-foreground shadow-md ring-1 ring-border">
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
        <ImagePlus aria-hidden="true" className="size-7" />
      )}
      {busy && (
        <span className="absolute inset-0 grid place-items-center bg-background/60 backdrop-blur-[1px]">
          <Loader2
            aria-hidden="true"
            className="size-5 animate-spin motion-reduce:animate-none"
          />
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
        "relative space-y-4 rounded-2xl border bg-card p-4 shadow-sm transition-colors motion-reduce:transition-none sm:p-5",
        invalid && "border-destructive/50",
        dragging && "border-primary bg-primary/5 ring-4 ring-primary/10",
      )}
    >
      {/* Source switch */}
      <div
        role="tablist"
        aria-label="Photo source"
        onKeyDown={onTabKeyDown}
        className="grid w-full grid-cols-2 gap-1 rounded-xl border bg-muted/40 p-1 text-sm sm:inline-grid sm:w-auto"
      >
        {TABS.map(({ id: tab, label, Icon }) => {
          const selected = mode === tab;
          return (
            <button
              key={tab}
              ref={(node) => {
                tabRefs.current[tab] = node;
              }}
              id={`${id}-tab-${tab}`}
              type="button"
              role="tab"
              aria-selected={selected}
              aria-controls={selected ? `${id}-panel-${tab}` : undefined}
              tabIndex={selected ? 0 : -1}
              onClick={() => switchMode(tab)}
              className={cn(
                "inline-flex min-h-9 items-center justify-center gap-2 rounded-lg px-4 py-1.5 font-medium transition-all motion-reduce:transition-none",
                focusRing,
                selected
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <Icon
                aria-hidden="true"
                className={cn("size-4", selected && "text-primary")}
              />
              {label}
            </button>
          );
        })}
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
      {mode === "upload" && (
        <div
          role="tabpanel"
          id={`${id}-panel-upload`}
          aria-labelledby={`${id}-tab-upload`}
          className="space-y-3"
        >
          {!shown && (
            <button
              id={id}
              type="button"
              onClick={pickFile}
              onBlur={onBlur}
              disabled={status === "processing"}
              className={cn(
                "group flex w-full flex-col items-center gap-3 rounded-2xl border-2 border-dashed px-4 py-9 text-center transition-colors motion-reduce:transition-none disabled:cursor-wait sm:py-10",
                focusRing,
                dragging
                  ? "border-primary bg-primary/5"
                  : "hover:border-primary/50 hover:bg-muted/40",
              )}
            >
              <span className="grid size-12 place-items-center rounded-full bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground motion-reduce:transition-none">
                {status === "processing" ? (
                  <Loader2
                    aria-hidden="true"
                    className="size-5 animate-spin motion-reduce:animate-none"
                  />
                ) : (
                  <ImagePlus aria-hidden="true" className="size-5" />
                )}
              </span>
              <span className="text-balance text-sm font-semibold sm:text-base">
                {dragging
                  ? "Drop the photo here"
                  : "Drag a photo here, click to browse, or paste"}
              </span>
              <span className="max-w-xs text-xs leading-5 text-muted-foreground sm:text-sm">
                PNG, JPG or WebP, up to {MAX_INPUT_MB} MB. It is cropped to a
                square.
              </span>
            </button>
          )}

          {shown && (
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              {thumb}

              <div className="min-w-0 flex-1 space-y-2" aria-live="polite">
                {status === "processing" && (
                  <p className="text-sm text-muted-foreground">
                    Getting your photo ready…
                  </p>
                )}

                {status === "uploading" && (
                  <>
                    <p className="text-sm font-medium tabular-nums">
                      {progress >= 100 ? "Saving…" : `Uploading… ${progress}%`}
                    </p>
                    <div
                      role="progressbar"
                      aria-label="Upload progress"
                      aria-valuemin={0}
                      aria-valuemax={100}
                      aria-valuenow={progress}
                      className="h-2 w-full overflow-hidden rounded-full bg-muted"
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
                    <p className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-1 text-sm font-medium text-emerald-700 dark:text-emerald-400">
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
                  <p className="text-sm font-medium text-muted-foreground">
                    Current photo
                  </p>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-2 sm:shrink-0 sm:justify-end">
                {status === "uploading" ? (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={cancelUpload}
                    className="min-h-9"
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
                        className="min-h-9"
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
                      className="min-h-9"
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
                      className="size-9 text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 aria-hidden="true" className="size-4" />
                    </Button>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Upload errors before any image exists (wrong type, too large) */}
          {!shown && error && (
            <p
              role="alert"
              className="flex items-start gap-1.5 rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive"
            >
              <AlertCircle
                aria-hidden="true"
                className="mt-0.5 size-4 shrink-0"
              />
              {error}
            </p>
          )}
        </div>
      )}

      {/* ---------------- Link mode ---------------- */}
      {mode === "link" && (
        <div
          role="tabpanel"
          id={`${id}-panel-link`}
          aria-labelledby={`${id}-tab-link`}
          className="flex flex-col gap-4 sm:flex-row sm:items-center"
        >
          {thumb}
          <div className="min-w-0 flex-1 space-y-2">
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
                className={cn("min-h-11", value && "pr-11")}
              />
              {value && (
                <button
                  type="button"
                  onClick={removeImage}
                  aria-label="Clear link"
                  className={cn(
                    "absolute right-1.5 top-1/2 grid size-8 -translate-y-1/2 place-items-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground",
                    focusRing,
                  )}
                >
                  <X aria-hidden="true" className="size-4" />
                </button>
              )}
            </div>

            {urlInvalid && (
              <p className="flex items-start gap-1.5 text-xs text-destructive sm:text-sm">
                <AlertCircle
                  aria-hidden="true"
                  className="mt-0.5 size-3.5 shrink-0"
                />
                Enter a full link that starts with https://
              </p>
            )}
            {!urlInvalid && broken && (
              <p className="flex items-start gap-1.5 text-xs text-destructive sm:text-sm">
                <AlertCircle
                  aria-hidden="true"
                  className="mt-0.5 size-3.5 shrink-0"
                />
                This link didn&apos;t load as an image. Use a direct image link.
              </p>
            )}
            {!urlInvalid && !broken && urlInsecure && (
              <p className="flex items-start gap-1.5 text-xs text-amber-700 dark:text-amber-400 sm:text-sm">
                <AlertCircle
                  aria-hidden="true"
                  className="mt-0.5 size-3.5 shrink-0"
                />
                This link is not secure (http). Some images won&apos;t load with
                it. Prefer https.
              </p>
            )}
          </div>
        </div>
      )}

      {/* Drop-to-replace hint when a photo is already showing */}
      {dragging && mode === "upload" && shown && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 grid place-items-center rounded-2xl bg-primary/10 text-sm font-semibold text-primary backdrop-blur-[1px]"
        >
          Drop to replace the photo
        </div>
      )}
    </div>
  );
}
