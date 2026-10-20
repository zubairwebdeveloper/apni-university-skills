// AIChatInput.jsx
"use client";

import { useEffect, useRef, useState } from "react";
import { SendHorizontal, Square } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AI_LIMITS } from "@/lib/ai/constants";

export function AIChatInput({
  onSend,
  onStop,
  streaming,
  disabled,
  autoFocus,
}) {
  const [value, setValue] = useState("");
  const ref = useRef(null);

  useEffect(() => {
    if (autoFocus) ref.current?.focus();
  }, [autoFocus]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 160)}px`;
  }, [value]);

  const submit = () => {
    const text = value.trim();
    if (!text || streaming || disabled) return;
    onSend(text);
    setValue("");
  };

  const nearLimit = value.length >= AI_LIMITS.messageMaxChars - 500;

  return (
    <div className="border-t bg-background p-3 sm:p-4">
      <div className="flex items-end gap-2">
        <textarea
          ref={ref}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (
              e.key === "Enter" &&
              !e.shiftKey &&
              !e.nativeEvent.isComposing
            ) {
              e.preventDefault();
              submit();
            }
          }}
          rows={1}
          maxLength={AI_LIMITS.messageMaxChars}
          disabled={disabled}
          placeholder="Ask about a course, a concept or an error…"
          aria-label="Message"
          className="max-h-40 min-h-10 flex-1 resize-none rounded-xl border bg-background px-3.5 py-2.5 text-sm leading-5 outline-none transition-shadow placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-60"
        />
        {streaming ? (
          <Button
            type="button"
            size="icon"
            variant="outline"
            onClick={onStop}
            aria-label="Stop generating"
            className="size-10 shrink-0"
          >
            <Square className="size-4" aria-hidden="true" />
          </Button>
        ) : (
          <Button
            type="button"
            size="icon"
            onClick={submit}
            disabled={disabled || !value.trim()}
            aria-label="Send message"
            className="size-10 shrink-0"
          >
            <SendHorizontal className="size-4" aria-hidden="true" />
          </Button>
        )}
      </div>
      <p className="mt-2 flex items-center justify-between gap-3 text-[11px] text-muted-foreground">
        <span>
          Enter to send, Shift+Enter for a new line. AI can make mistakes, so
          check important details.
        </span>
        {nearLimit && (
          <span className="shrink-0 tabular-nums">
            {value.length}/{AI_LIMITS.messageMaxChars}
          </span>
        )}
      </p>
    </div>
  );
}
