// AIMessage.jsx
"use client";

import { memo, useEffect, useRef, useState } from "react";
import { Check, Copy, RefreshCw, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { AIMarkdown } from "../ai-assistant/AIMarkdown";

function TypingIndicator() {
  return (
    <span
      className="inline-flex items-center gap-1 py-2"
      role="status"
      aria-label="Assistant is thinking"
    >
      {[0, 150, 300].map((delay) => (
        <span
          key={delay}
          className="size-1.5 animate-pulse rounded-full bg-muted-foreground/60 motion-reduce:animate-none"
          style={{ animationDelay: `${delay}ms` }}
        />
      ))}
    </span>
  );
}

const formatTime = (iso) => {
  if (!iso) return "";
  const date = new Date(iso);
  return Number.isNaN(date.getTime())
    ? ""
    : date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
};

export const AIMessage = memo(function AIMessage({
  message,
  canRegenerate,
  onRegenerate,
}) {
  const [copied, setCopied] = useState(false);
  const timer = useRef(null);
  useEffect(() => () => clearTimeout(timer.current), []);

  const isUser = message.role === "user";

  async function copy() {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
      clearTimeout(timer.current);
      timer.current = setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  }

  if (isUser) {
    return (
      <div className="flex flex-col items-end gap-1">
        <p className="max-w-[85%] whitespace-pre-wrap rounded-2xl rounded-br-md bg-primary px-3.5 py-2 text-sm leading-6 text-primary-foreground [overflow-wrap:anywhere]">
          {message.content}
        </p>
        <span className="px-1 text-[11px] text-muted-foreground">
          {formatTime(message.createdAt)}
        </span>
      </div>
    );
  }

  const actionClass =
    "inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

  return (
    <div className="flex gap-3">
      <span
        aria-hidden="true"
        className="mt-0.5 grid size-7 shrink-0 place-items-center rounded-lg bg-[#FACC15] text-[#111318]"
      >
        <Sparkles className="size-4" />
      </span>
      <div className="min-w-0 flex-1">
        {message.content ? (
          <AIMarkdown>{message.content}</AIMarkdown>
        ) : (
          <TypingIndicator />
        )}

        {message.content && !message.pending && (
          <div className="mt-1 flex flex-wrap items-center gap-1">
            <button type="button" onClick={copy} className={actionClass}>
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
            {canRegenerate && (
              <button
                type="button"
                onClick={onRegenerate}
                className={actionClass}
              >
                <RefreshCw className="size-3.5" aria-hidden="true" />
                Regenerate
              </button>
            )}
            <span className="ml-1 text-[11px] text-muted-foreground">
              {formatTime(message.createdAt)}
            </span>
            <span role="status" className="sr-only">
              {copied ? "Reply copied" : ""}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}, areEqual);

function areEqual(a, b) {
  return (
    a.message === b.message &&
    a.canRegenerate === b.canRegenerate &&
    a.onRegenerate === b.onRegenerate
  );
}
