// AIAssistantPage.jsx
"use client";

import { useState } from "react";
import { MessageSquare, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAIChat } from "@/hooks/useAIChat";
import { useAIConversations } from "@/hooks/useAIConversations";
import { AIChatPanel } from "./AIChatPanel";
import { AIConversationSidebar } from "./AIConversationSidebar";
import { AIDeleteDialog, AIRenameDialog } from "./AIConversationDialogs";

export function AIAssistantPage() {
  const list = useAIConversations();
  const chat = useAIChat({ onConversationSaved: list.refresh });
  const [listOpen, setListOpen] = useState(false); // mobile only
  const [renameTarget, setRenameTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const active = list.items.find((c) => c.id === chat.conversationId);

  const select = (id) => {
    chat.loadConversation(id);
    setListOpen(false);
  };
  const startNew = () => {
    chat.reset();
    setListOpen(false);
  };
  const confirmDelete = async (id) => {
    const result = await list.remove(id);
    if (result.ok && chat.conversationId === id) chat.reset();
    return result;
  };

  return (
    <>
      <div className="relative flex h-[calc(100dvh-12rem)] min-h-[30rem] overflow-hidden rounded-xl border bg-card">
        <aside
          className={cn(
            "absolute inset-0 z-20 bg-card lg:static lg:z-auto lg:w-72 lg:shrink-0 lg:border-r",
            listOpen ? "block" : "hidden lg:block",
          )}
        >
          <AIConversationSidebar
            items={list.items}
            loading={list.loading}
            error={list.error}
            activeId={chat.conversationId}
            onSelect={select}
            onNew={startNew}
            onRename={setRenameTarget}
            onDelete={setDeleteTarget}
            onRetry={list.refresh}
          />
        </aside>

        <section className="flex min-w-0 flex-1 flex-col bg-background">
          <header className="flex items-center gap-2 border-b px-3 py-2.5 sm:px-4">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="size-8 lg:hidden"
              onClick={() => setListOpen((v) => !v)}
              aria-expanded={listOpen}
              aria-label="Show conversations"
            >
              <MessageSquare className="size-4" aria-hidden="true" />
            </Button>
            <h2 className="min-w-0 flex-1 truncate text-sm font-semibold">
              {active?.title ?? "New chat"}
            </h2>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="gap-1.5 lg:hidden"
              onClick={startNew}
            >
              <Plus className="size-4" aria-hidden="true" />
              New
            </Button>
          </header>
          <AIChatPanel chat={chat} autoFocus />
        </section>
      </div>

      <AIRenameDialog
        target={renameTarget}
        onSubmit={list.rename}
        onClose={() => setRenameTarget(null)}
      />
      <AIDeleteDialog
        target={deleteTarget}
        onConfirm={confirmDelete}
        onClose={() => setDeleteTarget(null)}
      />
    </>
  );
}
