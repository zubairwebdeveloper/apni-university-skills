// AIChatPanel.jsx
"use client";

import { RefreshCw, TriangleAlert, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AIChatInput } from "./AIChatInput";
import { AIMessageList } from "./AIMessageList";
import { AIWelcomeScreen } from "./AIWelcomeScreen";

function LoadingState() {
  return (
    <div className="flex-1 space-y-4 px-4 py-5 sm:px-6" aria-busy="true">
      {[70, 45, 85].map((width, i) => (
        <div
          key={i}
          className="h-4 animate-pulse rounded bg-muted motion-reduce:animate-none"
          style={{ width: `${width}%` }}
        />
      ))}
      <span role="status" className="sr-only">
        Loading conversation
      </span>
    </div>
  );
}

function ErrorState({ error, onRetry, onDismiss }) {
  return (
    <div
      role="alert"
      className="mx-4 mb-3 flex items-start gap-3 rounded-lg border border-destructive/30 bg-destructive/5 p-3 sm:mx-6"
    >
      <TriangleAlert
        className="mt-0.5 size-4 shrink-0 text-destructive"
        aria-hidden="true"
      />
      <p className="min-w-0 flex-1 text-sm text-foreground">{error.message}</p>
      <div className="flex shrink-0 items-center gap-1">
        <Button
          type="button"
          size="sm"
          variant="outline"
          className="gap-1.5"
          onClick={onRetry}
        >
          <RefreshCw className="size-3.5" aria-hidden="true" />
          Try again
        </Button>
        <Button
          type="button"
          size="icon"
          variant="ghost"
          className="size-8"
          onClick={onDismiss}
          aria-label="Dismiss error"
        >
          <X className="size-4" aria-hidden="true" />
        </Button>
      </div>
    </div>
  );
}

export function AIChatPanel({ chat, compact = false, autoFocus = false }) {
  const { messages, status, error } = chat;
  const loading = status === "loading";
  const streaming = status === "streaming";

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      {loading ? (
        <LoadingState />
      ) : messages.length === 0 ? (
        <AIWelcomeScreen onSelect={chat.send} compact={compact} />
      ) : (
        <AIMessageList
          messages={messages}
          status={status}
          onRegenerate={chat.regenerate}
        />
      )}

      {error && (
        <ErrorState
          error={error}
          onRetry={chat.retry}
          onDismiss={chat.dismissError}
        />
      )}

      <AIChatInput
        onSend={chat.send}
        onStop={chat.stop}
        streaming={streaming}
        disabled={loading}
        autoFocus={autoFocus}
      />
    </div>
  );
}
