// AICodeBlock.jsx
"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Copy } from "lucide-react";

export function AICodeBlock({ children }) {
  const [copied, setCopied] = useState(false);
  const timer = useRef(null);
  useEffect(() => () => clearTimeout(timer.current), []);

  const codeProps = children?.props ?? {};
  const code = String(codeProps.children ?? "").replace(/\n$/, "");
  const language = /language-([\w-]+)/.exec(codeProps.className ?? "")?.[1];

  async function copy() {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      clearTimeout(timer.current);
      timer.current = setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className="my-3 overflow-hidden rounded-lg border bg-muted/40">
      <div className="flex items-center justify-between border-b bg-muted/60 px-3 py-1.5">
        <span className="text-xs font-medium text-muted-foreground">
          {language ?? "code"}
        </span>
        <button
          type="button"
          onClick={copy}
          className="inline-flex items-center gap-1.5 rounded-md px-1.5 py-1 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          {copied ? (
            <Check
              className="size-3.5 text-emerald-600 dark:text-emerald-400"
              aria-hidden="true"
            />
          ) : (
            <Copy className="size-3.5" aria-hidden="true" />
          )}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <pre className="overflow-x-auto p-3 text-[13px] leading-6">
        <code className="bg-transparent p-0 font-mono">{code}</code>
      </pre>
      <span role="status" className="sr-only">
        {copied ? "Code copied" : ""}
      </span>
    </div>
  );
}
