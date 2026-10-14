"use client";

import { useEffect, useRef, useState } from "react";
import { ImagePlus, Link2, Upload, X } from "lucide-react";

const MAX_MB = 2;
const ACCEPT = "image/png,image/jpeg,image/webp";

export function AvatarField({ defaultUrl = "" }) {
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

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium">
          Profile image{" "}
          <span className="font-normal text-muted-foreground">(optional)</span>
        </label>

        <div className="inline-flex rounded-lg border border-border p-0.5 text-xs">
          {[
            { id: "link", label: "Link", Icon: Link2 },
            { id: "upload", label: "Upload", Icon: Upload },
          ].map(({ id, label, Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => switchMode(id)}
              aria-pressed={mode === id}
              className={`inline-flex items-center gap-1 rounded-md px-2.5 py-1 transition-colors ${
                mode === id
                  ? "bg-primary text-primary-foreground"
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
        <span className="relative grid size-16 shrink-0 place-items-center overflow-hidden rounded-full border border-border bg-muted text-muted-foreground">
          {preview && !broken ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={preview}
              alt="Profile preview"
              className="size-full object-cover"
              onError={() => setBroken(true)}
            />
          ) : (
            <ImagePlus aria-hidden="true" className="size-6" />
          )}
        </span>

        <div className="min-w-0 flex-1">
          {mode === "link" ? (
            <input
              type="url"
              name="imageUrl"
              value={url}
              onChange={onUrlChange}
              placeholder="https://example.com/photo.jpg"
              className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          ) : (
            <input
              ref={fileRef}
              type="file"
              name="imageFile"
              accept={ACCEPT}
              onChange={onFileChange}
              className="block w-full text-sm text-muted-foreground file:mr-3 file:rounded-md file:border file:border-border file:bg-background file:px-3 file:py-2 file:text-sm file:font-medium hover:file:bg-muted"
            />
          )}
          {error && (
            <p role="alert" className="mt-1.5 text-xs text-destructive">
              {error}
            </p>
          )}
          {!error && broken && (
            <p className="mt-1.5 text-xs text-destructive">
              Could not load this image.
            </p>
          )}
        </div>

        {preview && (
          <button
            type="button"
            onClick={clear}
            aria-label="Remove image"
            className="grid size-8 shrink-0 place-items-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <X aria-hidden="true" className="size-4" />
          </button>
        )}
      </div>
    </div>
  );
}
