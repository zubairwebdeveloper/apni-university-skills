// components/shared/CopyTextButton.jsx
"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Copies `text` to the clipboard. Pass `prefixOrigin` to prepend the
 * viewer's actual browser origin at click time (safe — this only ever runs
 * client-side, inside the click handler, never during server rendering).
 */
export function CopyTextButton({
  text,
  prefixOrigin = false,
  label = "Copy link",
  className,
}) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    const value =
      prefixOrigin && typeof window !== "undefined"
        ? `${window.location.origin}${text}`
        : text;
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard API unavailable — fail quietly, nothing else to fall back to.
    }
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      className={cn(
        "inline-flex items-center gap-1.5 text-xs transition-colors",
        copied
          ? "text-emerald-600 dark:text-emerald-400"
          : "text-muted-foreground hover:text-foreground",
        className,
      )}
    >
      {copied ? (
        <Check aria-hidden="true" className="size-3.5" />
      ) : (
        <Copy aria-hidden="true" className="size-3.5" />
      )}
      {copied ? "Copied" : label}
    </button>
  );
}
