"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ImagePlus, Link2, Upload, X } from "lucide-react";

const MAX_MB = 2;
const ACCEPT = "image/png,image/jpeg,image/webp";

export function AvatarField({ defaultUrl = "" }) {
  const reduce = useReducedMotion();
  const [mode, setMode] = useState("link"); // "link" | "upload"
  const [url, setUrl] = useState(defaultUrl);
  const [preview, setPreview] = useState(defaultUrl || "");
  const [error, setError] = useState("");
  const [broken, setBroken] = useState(false);
  const fileRef = useRef(null);

  // free blob URLs
  useEffect(() => {
    return () => {
      if (preview?.startsWith("blob:")) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  function switchMode(next) {
    if (next === mode) return;
    setMode(next);
    clear();
  }

  function clear() {
    setUrl("");
    setPreview("");
    setError("");
    setBroken(false);
    if (fileRef.current) fileRef.current.value = "";
  }

  function onUrlChange(e) {
    const v = e.target.value.trim();
    setUrl(v);
    setBroken(false);
    if (!v) return (setError(""), setPreview(""));
    try {
      const u = new URL(v);
      if (!["http:", "https:"].includes(u.protocol)) throw new Error();
      setError("");
      setPreview(v);
    } catch {
      setError("Enter a valid http(s) link.");
      setPreview("");
    }
  }

  function onFileChange(e) {
    const file = e.target.files?.[0];
    if (!file) return clear();
    if (!ACCEPT.split(",").includes(file.type)) {
      e.target.value = "";
      return setError("Only PNG, JPG or WebP images are allowed.");
    }
    if (file.size > MAX_MB * 1024 * 1024) {
      e.target.value = "";
      return setError(`Image must be under ${MAX_MB} MB.`);
    }
    setError("");
    setBroken(false);
    setPreview(URL.createObjectURL(file));
  }

  const showError = error || (!error && broken);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <label className="text-sm font-medium tracking-tight">
          Profile image{" "}
          <span className="font-normal text-muted-foreground">(optional)</span>
        </label>

        <div
          className="inline-flex shrink-0 rounded-lg border bg-muted/40 p-0.5 text-xs"
          role="group"
          aria-label="Image source"
        >
          {[
            { id: "link", label: "Link", Icon: Link2 },
            { id: "upload", label: "Upload", Icon: Upload },
          ].map(({ id, label, Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => switchMode(id)}
              aria-pressed={mode === id}
              className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 font-medium transition-colors motion-reduce:transition-none ${
                mode === id
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon aria-hidden="true" className="size-3.5" />
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-4">
        <span className="relative grid size-16 shrink-0 place-items-center overflow-hidden rounded-full border bg-muted text-muted-foreground ring-2 ring-background">
          <AnimatePresence initial={false} mode="wait">
            {preview && !broken ? (
              <motion.img
                key={preview}
                src={preview}
                alt="Profile preview"
                className="size-full object-cover"
                onError={() => setBroken(true)}
                initial={reduce ? false : { opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.2 }}
              />
            ) : (
              <motion.span
                key="placeholder"
                initial={reduce ? false : { opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.2 }}
                className="grid place-items-center"
              >
                <ImagePlus aria-hidden="true" className="size-6" />
              </motion.span>
            )}
          </AnimatePresence>
        </span>

        <div className="min-w-0 flex-1">
          {mode === "link" ? (
            <input
              type="url"
              name="imageUrl"
              value={url}
              onChange={onUrlChange}
              placeholder="https://example.com/photo.jpg"
              aria-invalid={!!error}
              className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none transition-colors placeholder:text-muted-foreground/70 focus-visible:ring-2 focus-visible:ring-ring"
            />
          ) : (
            <input
              ref={fileRef}
              type="file"
              name="imageFile"
              accept={ACCEPT}
              onChange={onFileChange}
              aria-invalid={!!error}
              className="block w-full text-sm text-muted-foreground file:mr-3 file:rounded-md file:border file:border-input file:bg-background file:px-3 file:py-2 file:text-sm file:font-medium file:transition-colors hover:file:bg-muted"
            />
          )}
          <AnimatePresence initial={false}>
            {showError && (
              <motion.p
                role="alert"
                initial={reduce ? false : { opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.15 }}
                className="mt-1.5 overflow-hidden text-xs leading-5 text-destructive"
              >
                {error || "Could not load this image."}
              </motion.p>
            )}
          </AnimatePresence>
          {mode === "upload" && !showError && (
            <p className="mt-1.5 text-xs text-muted-foreground">
              PNG, JPG or WebP, up to {MAX_MB} MB.
            </p>
          )}
        </div>

        {preview && (
          <button
            type="button"
            onClick={clear}
            aria-label="Remove image"
            className="grid size-8 shrink-0 place-items-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <X aria-hidden="true" className="size-4" />
          </button>
        )}
      </div>
    </div>
  );
}
