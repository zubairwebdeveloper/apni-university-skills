// AIMessageList.jsx
"use client";

import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";
import { ArrowDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AIMessage } from "./AIMessage";

const NEAR_BOTTOM_PX = 96;

export function AIMessageList({ messages, status, onRegenerate }) {
  const reduceMotion = useReducedMotion();
  const scrollRef = useRef(null);
  const stuckRef = useRef(true);
  const [stuck, setStuck] = useState(true);

  const last = messages[messages.length - 1];
  const canRegenerate =
    status === "idle" && last?.role === "assistant" && !last.pending;

  const scrollToBottom = (smooth) => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTo({
      top: el.scrollHeight,
      behavior: smooth && !reduceMotion ? "smooth" : "auto",
    });
  };

  const onScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    const next =
      el.scrollHeight - el.scrollTop - el.clientHeight < NEAR_BOTTOM_PX;
    if (next !== stuckRef.current) {
      stuckRef.current = next;
      setStuck(next);
    }
  };

  // Follow the stream only while the reader hasn't scrolled away; always follow their own sends
  useEffect(() => {
    if (last?.role === "user") stuckRef.current = true;
    if (stuckRef.current) scrollToBottom(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages]);

  return (
    <div className="relative min-h-0 flex-1">
      <div
        ref={scrollRef}
        onScroll={onScroll}
        role="log"
        aria-label="Conversation"
        className="h-full space-y-5 overflow-y-auto px-4 py-5 sm:px-6"
      >
        {messages.map((message) => (
          <AIMessage
            key={message.id}
            message={message}
            canRegenerate={canRegenerate && message === last}
            onRegenerate={onRegenerate}
          />
        ))}
      </div>

      {!stuck && (
        <Button
          type="button"
          size="sm"
          variant="outline"
          className="absolute bottom-3 left-1/2 -translate-x-1/2 gap-1.5 bg-background shadow-md"
          onClick={() => {
            stuckRef.current = true;
            setStuck(true);
            scrollToBottom(true);
          }}
        >
          <ArrowDown className="size-4" aria-hidden="true" />
          Jump to latest
        </Button>
      )}

      {/* Announce only start/finish; announcing every streamed chunk would flood screen readers */}
      <p role="status" className="sr-only">
        {status === "streaming"
          ? "Assistant is responding"
          : last?.role === "assistant" && status === "idle"
            ? "Response complete"
            : ""}
      </p>
    </div>
  );
}
