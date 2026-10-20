// AIChatWidget.jsx
"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, MotionConfig, motion } from "framer-motion";
import { Bot, ExternalLink, Plus, Sparkles, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AI_ASSISTANT_PATH } from "@/lib/ai/constants";
import { useAIChat } from "@/hooks/useAIChat";
import { AIChatPanel } from "./AIChatPanel";

export function AIChatWidget() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const chat = useAIChat();
  const launcherRef = useRef(null);

  // Closing only hides the panel, so reopening restores the same conversation
  const close = useCallback(() => {
    setOpen(false);
    launcherRef.current?.focus();
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event) => event.key === "Escape" && close();
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, close]);

  // The full page already is the assistant; avoid showing two
  if (pathname?.startsWith(AI_ASSISTANT_PATH)) return null;

  return (
    <MotionConfig reducedMotion="user">
      <div className="fixed bottom-24 right-8 sm:right-12 z-50 flex flex-col-reverse items-end gap-3 ">
        <Button
          ref={launcherRef}
          type="button"
          size="icon"
          onClick={() => setOpen((value) => !value)}
          aria-expanded={open}
          aria-label={open ? "Close AI assistant" : "Open AI assistant"}
          className="size-13.5 rounded-full shadow-lg"
        >
          {open ? (
            <X className="size-5" aria-hidden="true" />
          ) : (
            <Bot className="size-5" aria-hidden="true" />
          )}
        </Button>

        <AnimatePresence>
          {open && (
            <motion.section
              role="dialog"
              aria-label="Apni University AI assistant"
              initial={{ opacity: 0, y: 12, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 12, scale: 0.98 }}
              transition={{ duration: 0.18, ease: "easeOut" }}
              className="flex h-[min(36rem,calc(100dvh-7rem))] w-[min(26rem,calc(100vw-2rem))] flex-col overflow-hidden rounded-2xl border bg-background shadow-xl"
            >
              <header className="flex items-center gap-2 border-b px-4 py-3">
                <span
                  aria-hidden="true"
                  className="grid size-8 place-items-center rounded-lg bg-[#FACC15] text-[#111318]"
                >
                  <Sparkles className="size-4" />
                </span>
                <h2 className="min-w-0 flex-1 truncate text-sm font-semibold">
                  AI assistant
                </h2>
                {chat.messages.length > 0 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="size-8"
                    onClick={chat.reset}
                    aria-label="New chat"
                  >
                    <Plus className="size-4" aria-hidden="true" />
                  </Button>
                )}
                <Link
                  href={AI_ASSISTANT_PATH}
                  aria-label="Open full-page assistant"
                  className="grid size-8 place-items-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <ExternalLink className="size-4" aria-hidden="true" />
                </Link>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="size-8"
                  onClick={close}
                  aria-label="Close AI assistant"
                >
                  <X className="size-4" aria-hidden="true" />
                </Button>
              </header>
              <AIChatPanel chat={chat} compact autoFocus />
            </motion.section>
          )}
        </AnimatePresence>
      </div>
    </MotionConfig>
  );
}
