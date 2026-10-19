// components/shared/CopyTextButton.jsx
"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
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
        "group inline-flex items-center gap-1.5 rounded-md text-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        copied ? "text-primary" : "text-muted-foreground hover:text-foreground",
        className,
      )}
    >
      <span className="relative inline-grid size-3.5 place-items-center">
        <AnimatePresence initial={false} mode="wait">
          {copied ? (
            <motion.span
              key="check"
              initial={{ opacity: 0, scale: 0.6 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.6 }}
              transition={{ duration: 0.15 }}
              className="absolute inset-0 grid place-items-center"
            >
              <Check aria-hidden="true" className="size-3.5" />
            </motion.span>
          ) : (
            <motion.span
              key="copy"
              initial={{ opacity: 0, scale: 0.6 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.6 }}
              transition={{ duration: 0.15 }}
              className="absolute inset-0 grid place-items-center"
            >
              <Copy
                aria-hidden="true"
                className="size-3.5 transition-transform duration-150 group-hover:scale-110"
              />
            </motion.span>
          )}
        </AnimatePresence>
      </span>
      {copied ? "Copied" : label}
    </button>
  );
}
