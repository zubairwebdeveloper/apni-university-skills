// components/admin/AdminSearch.jsx
"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import { FiSearch } from "react-icons/fi";
import {
  Award,
  BookOpen,
  Clock,
  CornerDownLeft,
  CreditCard,
  FileText,
  GraduationCap,
  Loader2,
  SearchX,
  TriangleAlert,
  Users,
  X,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { useDebouncedValue } from "@/hooks/useDebounce";
import { adminSearch } from "@/app/actions/admin/search";

const RECENT_KEY = "admin-search-recent";
const MAX_RECENT = 5;

const getModKey = () =>
  /Mac|iPhone|iPad/i.test(navigator.platform || "") ? "⌘" : "Ctrl";
const subscribeToModKey = () => () => {};

// Picks an icon from the group label returned by the server.
function iconFor(label = "") {
  const l = label.toLowerCase();
  if (l.includes("course")) return BookOpen;
  if (l.includes("student")) return GraduationCap;
  if (l.includes("teacher") || l.includes("user") || l.includes("people"))
    return Users;
  if (l.includes("payment")) return CreditCard;
  if (l.includes("certificate")) return Award;
  return FileText;
}

function readRecent() {
  try {
    const raw = window.localStorage.getItem(RECENT_KEY);
    const list = raw ? JSON.parse(raw) : [];
    return Array.isArray(list) ? list.filter((s) => typeof s === "string") : [];
  } catch {
    return [];
  }
}

function writeRecent(list) {
  try {
    window.localStorage.setItem(RECENT_KEY, JSON.stringify(list));
  } catch {
    // Storage can be blocked (private mode); recent searches are optional.
  }
}

const escapeRegExp = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// Wraps the matching part of the text in <mark>.
function Highlight({ text, term }) {
  if (!text || !term) return text ?? null;
  const parts = String(text).split(new RegExp(`(${escapeRegExp(term)})`, "gi"));
  return parts.map((part, i) =>
    i % 2 === 1 ? (
      <mark key={i} className="rounded-sm bg-primary/15 px-0.5 text-foreground">
        {part}
      </mark>
    ) : (
      <span key={i}>{part}</span>
    ),
  );
}

function StateMessage({ icon: Icon, title, hint, spin = false, ...rest }) {
  return (
    <div
      className="flex flex-col items-center gap-2 px-6 py-10 text-center"
      {...rest}
    >
      <span className="grid size-11 place-items-center rounded-full bg-muted text-muted-foreground">
        <Icon
          aria-hidden="true"
          className={`size-5 ${spin ? "animate-spin motion-reduce:animate-none" : ""}`}
        />
      </span>
      <p className="text-sm font-medium">{title}</p>
      {hint ? (
        <p className="max-w-xs text-xs text-muted-foreground">{hint}</p>
      ) : null}
    </div>
  );
}

export function AdminSearch() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const openRef = useRef(false);
  const [q, setQ] = useState("");
  const [recent, setRecent] = useState([]);
  const modKey = useSyncExternalStore(
    subscribeToModKey,
    getModKey,
    () => "Ctrl",
  );
  const [result, setResult] = useState({ term: "", state: "idle", groups: [] });
  const term = useDebouncedValue(q.trim(), 300);
  const seq = useRef(0);

  useEffect(() => {
    const onKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        const next = !openRef.current;
        openRef.current = next;
        if (next) setRecent(readRecent());
        setOpen(next);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    const mine = ++seq.current;
    if (term.length < 2) {
      return;
    }
    adminSearch({ q: term })
      .then((res) => {
        if (mine !== seq.current) return;
        if (!res.ok) {
          setResult({ term, state: "error", groups: [] });
          return;
        }
        setResult({ term, state: "done", groups: res.data });
      })
      .catch(() => {
        if (mine !== seq.current) return;
        setResult({ term, state: "error", groups: [] });
      });
  }, [term]);

  const state =
    term.length < 2 ? "idle" : result.term === term ? result.state : "loading";
  const groups = result.term === term ? result.groups : [];
  const totalResults = groups.reduce((n, g) => n + g.items.length, 0);

  const saveRecent = (value) => {
    if (value.length < 2) return;
    const next = [
      value,
      ...readRecent().filter((s) => s.toLowerCase() !== value.toLowerCase()),
    ].slice(0, MAX_RECENT);
    writeRecent(next);
    setRecent(next);
  };

  const clearRecent = () => {
    writeRecent([]);
    setRecent([]);
  };

  const go = (href) => {
    saveRecent(term);
    setOpen(false);
    setQ("");
    router.push(href);
  };

  const handleOpenChange = (next) => {
    openRef.current = next;
    if (next) setRecent(readRecent());
    setOpen(next);
    if (!next) setQ("");
  };

  return (
    <>
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="gap-2 rounded-full text-muted-foreground transition-colors hover:text-foreground sm:min-w-44 sm:justify-start"
        onClick={() => handleOpenChange(true)}
        aria-label={`Search the admin (${modKey} + K)`}
      >
        <FiSearch aria-hidden="true" className="size-4" />
        <span className="hidden sm:inline">Search…</span>
        <kbd className="ml-auto hidden rounded border bg-muted px-1.5 py-0.5 text-[10px] font-medium sm:inline">
          {modKey} K
        </kbd>
      </Button>

      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="gap-0 overflow-hidden p-0 sm:max-w-xl">
          <DialogTitle className="sr-only">Search the admin</DialogTitle>
          <DialogDescription className="sr-only">
            Find courses, people, content and payments. Use the arrow keys and
            Enter to open a result.
          </DialogDescription>

          <Command shouldFilter={false}>
            <CommandInput
              value={q}
              onValueChange={setQ}
              placeholder="Search courses, students, payments (pay-…), emails…"
            />

            <CommandList className="max-h-[60vh]">
              {state === "idle" &&
                (recent.length > 0 ? (
                  <CommandGroup
                    heading={
                      <span className="flex items-center justify-between">
                        <span>Recent searches</span>
                        <button
                          type="button"
                          onClick={clearRecent}
                          className="rounded-sm text-[11px] font-normal normal-case text-muted-foreground outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
                        >
                          Clear
                        </button>
                      </span>
                    }
                  >
                    {recent.map((s) => (
                      <CommandItem
                        key={s}
                        value={`recent-${s}`}
                        onSelect={() => setQ(s)}
                      >
                        <Clock
                          aria-hidden="true"
                          className="size-4 text-muted-foreground"
                        />
                        <span className="truncate">{s}</span>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                ) : (
                  <StateMessage
                    icon={FiSearch}
                    title="Search the whole admin"
                    hint="Type at least 2 characters. Payments, enrollments and certificates match an exact reference or student email."
                  />
                ))}

              {state === "loading" && (
                <StateMessage
                  role="status"
                  icon={Loader2}
                  spin
                  title="Searching…"
                />
              )}

              {state === "error" && (
                <StateMessage
                  role="alert"
                  icon={TriangleAlert}
                  title="Search failed"
                  hint="Something went wrong. Please try again."
                />
              )}

              {state === "done" && !groups.length && (
                <CommandEmpty>
                  <StateMessage
                    icon={SearchX}
                    title="No results"
                    hint={`Nothing matched "${term}". Check the spelling or try an email or reference.`}
                  />
                </CommandEmpty>
              )}

              {groups.map((g) => {
                const Icon = iconFor(g.label);

                return (
                  <CommandGroup key={g.label} heading={g.label}>
                    {g.items.map((it) => (
                      <CommandItem
                        key={`${g.label}-${it.id}`}
                        value={`${g.label}-${it.id}`}
                        onSelect={() => go(it.href)}
                        className="gap-3 py-2"
                      >
                        <span className="grid size-8 shrink-0 place-items-center rounded-md bg-muted text-muted-foreground">
                          <Icon aria-hidden="true" className="size-4" />
                        </span>

                        <div className="min-w-0 flex-1">
                          <p className="truncate">
                            <Highlight text={it.title} term={term} />
                          </p>
                          {it.sub && (
                            <p className="truncate text-xs text-muted-foreground">
                              <Highlight text={it.sub} term={term} />
                            </p>
                          )}
                        </div>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                );
              })}
            </CommandList>
          </Command>

          {/* Footer: result count + keyboard hints */}
          <div className="flex items-center justify-between gap-3 border-t bg-muted/30 px-4 py-2 text-xs text-muted-foreground">
            <span aria-live="polite">
              {state === "done"
                ? `${totalResults} ${totalResults === 1 ? "result" : "results"}`
                : "Admin search"}
            </span>

            <span
              className="hidden items-center gap-3 sm:flex"
              aria-hidden="true"
            >
              <span className="flex items-center gap-1">
                <kbd className="rounded border bg-background px-1">↑</kbd>
                <kbd className="rounded border bg-background px-1">↓</kbd>
                navigate
              </span>
              <span className="flex items-center gap-1">
                <kbd className="rounded border bg-background px-1">
                  <CornerDownLeft className="size-3" />
                </kbd>
                open
              </span>
              <span className="flex items-center gap-1">
                <kbd className="rounded border bg-background px-1">esc</kbd>
                close
              </span>
            </span>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
