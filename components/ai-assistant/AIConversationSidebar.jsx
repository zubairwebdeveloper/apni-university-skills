// AIConversationSidebar.jsx
"use client";

import { useMemo, useState } from "react";
import { Pencil, Plus, Search, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const formatDate = (iso) =>
  iso
    ? new Intl.DateTimeFormat(undefined, {
        month: "short",
        day: "numeric",
      }).format(new Date(iso))
    : "";

export function AIConversationSidebar({
  items,
  loading,
  error,
  activeId,
  onSelect,
  onNew,
  onRename,
  onDelete,
  onRetry,
}) {
  const [query, setQuery] = useState("");

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q ? items.filter((c) => c.title.toLowerCase().includes(q)) : items;
  }, [items, query]);

  const iconButton =
    "grid size-7 place-items-center rounded-md text-muted-foreground transition-colors hover:bg-background hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

  return (
    <nav aria-label="Conversations" className="flex h-full flex-col">
      <div className="space-y-2 border-b p-3">
        <Button
          type="button"
          className="w-full justify-start gap-2"
          onClick={onNew}
        >
          <Plus className="size-4" aria-hidden="true" />
          New chat
        </Button>
        <div className="relative">
          <Search
            className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by title"
            aria-label="Search conversations by title"
            className="h-9 w-full rounded-lg border bg-background pl-8 pr-3 text-sm outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto p-2">
        {loading ? (
          <div className="space-y-2 p-1" aria-busy="true">
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-11 animate-pulse rounded-lg bg-muted motion-reduce:animate-none"
              />
            ))}
          </div>
        ) : error ? (
          <div role="alert" className="space-y-2 p-2 text-sm">
            <p className="text-destructive">{error}</p>
            <Button type="button" size="sm" variant="outline" onClick={onRetry}>
              Try again
            </Button>
          </div>
        ) : visible.length === 0 ? (
          <p className="p-3 text-sm text-muted-foreground">
            {query
              ? "No conversations match that title."
              : "Your conversations will appear here."}
          </p>
        ) : (
          <ul className="space-y-0.5">
            {visible.map((c) => {
              const active = c.id === activeId;
              return (
                <li key={c.id} className="group/item relative">
                  <button
                    type="button"
                    onClick={() => onSelect(c.id)}
                    aria-current={active ? "true" : undefined}
                    className={cn(
                      "w-full rounded-lg px-3 py-2 pr-16 text-left transition-colors hover:bg-muted/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                      active && "bg-muted",
                    )}
                  >
                    <span className="block truncate text-sm font-medium">
                      {c.title}
                    </span>
                    <span className="block truncate text-xs text-muted-foreground">
                      {formatDate(c.updatedAt)}
                    </span>
                  </button>
                  <div className="absolute right-1.5 top-1/2 flex -translate-y-1/2 items-center gap-0.5 opacity-0 transition-opacity focus-within:opacity-100 group-hover/item:opacity-100 [@media(hover:none)]:opacity-100">
                    <button
                      type="button"
                      className={iconButton}
                      onClick={() => onRename(c)}
                      aria-label={`Rename ${c.title}`}
                    >
                      <Pencil className="size-3.5" aria-hidden="true" />
                    </button>
                    <button
                      type="button"
                      className={iconButton}
                      onClick={() => onDelete(c)}
                      aria-label={`Delete ${c.title}`}
                    >
                      <Trash2 className="size-3.5" aria-hidden="true" />
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </nav>
  );
}
