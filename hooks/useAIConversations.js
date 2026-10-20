// hooks/useAIConversations.js
"use client";

import { useCallback, useEffect, useRef, useState } from "react";

async function parse(res, fallback) {
  const data = await res.json().catch(() => null);
  if (!res.ok) return { ok: false, message: data?.error?.message || fallback };
  return { ok: true, data };
}

export function useAIConversations() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch("/api/ai/conversations", { cache: "no-store" });
      const result = await parse(res, "Couldn't load your conversations.");
      if (!mounted.current) return;
      if (result.ok) {
        setItems(result.data.conversations);
        setError("");
      } else {
        setError(result.message);
      }
    } catch {
      if (mounted.current) setError("Couldn't load your conversations.");
    } finally {
      if (mounted.current) setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const rename = useCallback(async (id, title) => {
    try {
      const res = await fetch(`/api/ai/conversations/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title }),
      });
      const result = await parse(res, "Couldn't rename this conversation.");
      if (result.ok && mounted.current) {
        setItems((prev) =>
          prev.map((c) =>
            c.id === id ? { ...c, title: result.data.title } : c,
          ),
        );
      }
      return result.ok ? { ok: true } : result;
    } catch {
      return { ok: false, message: "Couldn't rename this conversation." };
    }
  }, []);

  const remove = useCallback(async (id) => {
    try {
      const res = await fetch(`/api/ai/conversations/${id}`, {
        method: "DELETE",
      });
      const result = await parse(res, "Couldn't delete this conversation.");
      if (result.ok && mounted.current) {
        setItems((prev) => prev.filter((c) => c.id !== id));
      }
      return result.ok ? { ok: true } : result;
    } catch {
      return { ok: false, message: "Couldn't delete this conversation." };
    }
  }, []);

  return { items, loading, error, refresh, rename, remove };
}
