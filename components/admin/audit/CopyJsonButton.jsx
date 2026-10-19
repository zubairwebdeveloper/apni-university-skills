// components/admin/audit/CopyJsonButton.jsx
"use client";

import { useEffect, useRef, useState } from "react";
import { FiAlertCircle, FiCheck, FiCopy } from "react-icons/fi";
import { cn } from "@/lib/utils";

export function CopyJsonButton({ data }) {
  // "idle" | "copied" | "failed"
  const [status, setStatus] = useState("idle");
  const timeoutRef = useRef(null);

  useEffect(() => () => clearTimeout(timeoutRef.current), []);

  function flash(next) {
    setStatus(next);
    clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => setStatus("idle"), 1800);
  }

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(JSON.stringify(data, null, 2));
      flash("copied");
    } catch {
      // Clipboard API unavailable (older browser, insecure context, etc.).
      // The JSON is still readable in the <pre> below, so we only say so briefly.
      flash("failed");
    }
  }

  const copied = status === "copied";
  const failed = status === "failed";

  return (
    <>
      <button
        type="button"
        onClick={handleCopy}
        className={cn(
          "inline-flex min-h-8 items-center gap-1.5 rounded-md border border-transparent px-2 text-xs font-medium outline-none transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background motion-reduce:transition-none",
          copied && "text-emerald-700 dark:text-emerald-400",
          failed && "text-destructive",
          status === "idle" &&
            "text-muted-foreground hover:border-border hover:bg-muted hover:text-foreground",
        )}
      >
        {copied ? (
          <FiCheck aria-hidden="true" className="size-3.5" />
        ) : failed ? (
          <FiAlertCircle aria-hidden="true" className="size-3.5" />
        ) : (
          <FiCopy aria-hidden="true" className="size-3.5" />
        )}
        {copied ? "Copied" : failed ? "Couldn't copy" : "Copy JSON"}
      </button>

      {/* Announces the result to screen readers; invisible otherwise. */}
      <span className="sr-only" role="status" aria-live="polite">
        {copied ? "JSON copied to clipboard" : failed ? "Copy failed" : ""}
      </span>
    </>
  );
}
