// hooks/useAIChat.js
"use client";

import { useCallback, useEffect, useRef, useState } from "react";

let seq = 0;
const tempId = () => `local-${Date.now()}-${seq++}`;

async function* readEvents(response) {
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    let index;
    while ((index = buffer.indexOf("\n")) >= 0) {
      const line = buffer.slice(0, index).trim();
      buffer = buffer.slice(index + 1);
      if (!line) continue;
      try {
        yield JSON.parse(line);
      } catch {
        // ignore a malformed line
      }
    }
  }
}

const withoutEmptyPending = (messages, id) =>
  messages
    .filter((m) => !(m.id === id && !m.content))
    .map((m) => (m.id === id ? { ...m, pending: false } : m));

export function useAIChat({ onConversationSaved } = {}) {
  const [messages, setMessages] = useState([]);
  const [conversationId, setConversationId] = useState(null);
  const [status, setStatus] = useState("idle"); // idle | loading | streaming | error
  const [error, setError] = useState(null);

  const abortRef = useRef(null);
  const runRef = useRef(0);
  const convRef = useRef(null);
  const lastRef = useRef(null);
  const savedRef = useRef(onConversationSaved);

  useEffect(() => {
    savedRef.current = onConversationSaved;
  }, [onConversationSaved]);

  useEffect(() => () => abortRef.current?.abort(), []);

  const run = useCallback(async ({ message, regenerate }) => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    const runId = ++runRef.current;
    const live = () => runRef.current === runId;
    const assistantId = tempId();

    lastRef.current = regenerate
      ? { message: lastRef.current?.message, delivered: true }
      : { message, delivered: false };

    setStatus("streaming");
    setError(null);
    setMessages((prev) => [
      ...prev,
      {
        id: assistantId,
        role: "assistant",
        content: "",
        createdAt: new Date().toISOString(),
        pending: true,
      },
    ]);

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
        body: JSON.stringify({
          conversationId: convRef.current ?? undefined,
          message,
          regenerate: regenerate || undefined,
        }),
      });

      if (!res.ok || !res.body) {
        const data = await res.json().catch(() => null);
        throw {
          code: data?.error?.code,
          message: data?.error?.message || "Something went wrong.",
        };
      }

      for await (const event of readEvents(res)) {
        if (!live()) return;
        if (event.type === "meta") {
          convRef.current = event.conversationId;
          setConversationId(event.conversationId);
          lastRef.current.delivered = true;
        } else if (event.type === "text") {
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantId
                ? { ...m, content: m.content + event.text }
                : m,
            ),
          );
        } else if (event.type === "error") {
          throw { code: event.code, message: event.message };
        } else if (event.type === "done") {
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantId
                ? { ...m, id: event.messageId || m.id, pending: false }
                : m,
            ),
          );
        }
      }

      if (!live()) return;
      setStatus("idle");
      savedRef.current?.(convRef.current);
    } catch (err) {
      if (!live()) return;
      setMessages((prev) => withoutEmptyPending(prev, assistantId));
      if (controller.signal.aborted || err?.name === "AbortError") {
        setStatus("idle"); // user pressed Stop
        savedRef.current?.(convRef.current);
        return;
      }
      setError({
        kind: "send",
        code: err?.code,
        message: err?.message || "Something went wrong.",
      });
      setStatus("error");
      if (convRef.current) savedRef.current?.(convRef.current);
    } finally {
      if (abortRef.current === controller) abortRef.current = null;
    }
  }, []);

  const send = useCallback(
    (text) => {
      const message = text.trim();
      if (!message || abortRef.current) return; // blocks duplicate submits
      setMessages((prev) => [
        ...prev,
        {
          id: tempId(),
          role: "user",
          content: message,
          createdAt: new Date().toISOString(),
        },
      ]);
      run({ message });
    },
    [run],
  );

  const regenerate = useCallback(() => {
    if (abortRef.current || !convRef.current) return;
    setMessages((prev) =>
      prev[prev.length - 1]?.role === "assistant" ? prev.slice(0, -1) : prev,
    );
    run({ regenerate: true });
  }, [run]);

  const loadConversation = useCallback(async (id) => {
    abortRef.current?.abort();
    const runId = ++runRef.current;
    convRef.current = id;
    setConversationId(id);
    setMessages([]);
    setError(null);
    setStatus("loading");
    try {
      const res = await fetch(`/api/ai/conversations/${id}`, {
        cache: "no-store",
      });
      const data = await res.json().catch(() => null);
      if (runRef.current !== runId) return;
      if (!res.ok) {
        throw new Error(
          data?.error?.message || "Couldn't load this conversation.",
        );
      }
      setMessages(data.messages);
      setStatus("idle");
    } catch (err) {
      if (runRef.current !== runId) return;
      setError({ kind: "load", message: err.message });
      setStatus("error");
    }
  }, []);

  const retry = useCallback(() => {
    if (abortRef.current) return;
    if (error?.kind === "load" && convRef.current) {
      loadConversation(convRef.current);
      return;
    }
    const last = lastRef.current;
    if (!last) return;
    if (last.delivered && convRef.current) run({ regenerate: true });
    else run({ message: last.message });
  }, [error, loadConversation, run]);

  const stop = useCallback(() => abortRef.current?.abort(), []);

  const reset = useCallback(() => {
    abortRef.current?.abort();
    runRef.current += 1;
    convRef.current = null;
    lastRef.current = null;
    setConversationId(null);
    setMessages([]);
    setError(null);
    setStatus("idle");
  }, []);

  const dismissError = useCallback(() => {
    setError(null);
    setStatus((s) => (s === "error" ? "idle" : s));
  }, []);

  return {
    messages,
    conversationId,
    status,
    error,
    send,
    stop,
    regenerate,
    retry,
    reset,
    loadConversation,
    dismissError,
  };
}
