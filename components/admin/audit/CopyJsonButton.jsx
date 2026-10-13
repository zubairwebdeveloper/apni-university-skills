// components/admin/audit/CopyJsonButton.jsx
"use client";

import { useState } from "react";
import { FiCheck, FiCopy } from "react-icons/fi";
import { cn } from "@/lib/utils";

export function CopyJsonButton({ data }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(JSON.stringify(data, null, 2));
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard API unavailable (older browser, insecure context, etc.) —
      // the JSON is still readable in the <pre> below, so fail quietly.
    }
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      className={cn(
        "inline-flex items-center gap-1 text-xs transition-colors",
        copied
          ? "text-emerald-600 dark:text-emerald-400"
          : "text-muted-foreground hover:text-foreground",
      )}
    >
      {copied ? (
        <>
          <FiCheck aria-hidden="true" className="size-3" />
          Copied
        </>
      ) : (
        <>
          <FiCopy aria-hidden="true" className="size-3" />
          Copy
        </>
      )}
    </button>
  );
}
