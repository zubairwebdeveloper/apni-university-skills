// components/admin/AdminSearch.jsx
"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
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
import { cn } from "@/lib/utils";

const RECENT_KEY = "admin-search-recent";
const MAX_RECENT = 5;

const enter =
  "animate-in fade-in slide-in-from-bottom-1 fill-mode-both duration-300 motion-reduce:animate-none";
const delay = (i) => ({ animationDelay: `${Math.min(i, 8) * 35}ms` });

// Icon group label se chuna jata hai (label server se aata hai).
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
    // Storage block ho sakta hai; recent searches optional hain.
  }
}

const escapeRegExp = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

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
      <span className="grid size-11 place-items-center rounded-xl bg-muted text-muted-foreground shadow-[0_3px_0_0_var(--border)] ring-1 ring-inset ring-border/60">
        <Icon
          aria-hidden="true"
          className={cn(
            "size-5",
            spin && "animate-spin motion-reduce:animate-none",
          )}
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
  const reduce = useReducedMotion();
  const [open, setOpen] = useState(false);
  const openRef = useRef(false);
  const [q, setQ] = useState("");
  const [recent, setRecent] = useState([]);
  const [filter, setFilter] = useState("all");
  const [result, setResult] = useState({ term: "", state: "idle", groups: [] });
  const term = useDebouncedValue(q.trim(), 300);
  const seq = useRef(0);

  // Ctrl + M (ya Ctrl/⌘ + K) se search khulta/band hota hai
  useEffect(() => {
    const onKey = (e) => {
      const key = e.key?.toLowerCase();
      const isCtrlM = e.ctrlKey && !e.metaKey && !e.altKey && key === "m";
      const isK = (e.metaKey || e.ctrlKey) && key === "k";
      if (!isCtrlM && !isK) return;
      e.preventDefault();
      const next = !openRef.current;
      openRef.current = next;
      if (next) setRecent(readRecent());
      setOpen(next);
      if (!next) setQ("");
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    const mine = ++seq.current;
    if (term.length < 2) return;
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
  const allGroups = result.term === term ? result.groups : [];
  const activeFilter = allGroups.some((g) => g.label === filter)
    ? filter
    : "all";
  const groups =
    activeFilter === "all"
      ? allGroups
      : allGroups.filter((g) => g.label === activeFilter);
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

  const removeRecent = (value) => {
    const next = readRecent().filter((s) => s !== value);
    writeRecent(next);
    setRecent(next);
  };

  const clearRecent = () => {
    writeRecent([]);
    setRecent([]);
  };

  const go = (href) => {
    saveRecent(term);
    openRef.current = false;
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

  // Spotlight: mouse ke saath chalta hai
  function onPointerMove(e) {
    if (reduce) return;
    const r = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty("--mx", `${e.clientX - r.left}px`);
    e.currentTarget.style.setProperty("--my", `${e.clientY - r.top}px`);
  }

  return (
    <>
      <Button
        type="button"
        variant="outline"
        size="sm"
        className={cn(
          "gap-2 rounded-full text-muted-foreground hover:text-foreground sm:min-w-44 sm:justify-start",
          "shadow-[0_2px_0_0_var(--border)] transition-[transform,box-shadow,color] duration-100",
          "active:translate-y-[2px] active:shadow-none motion-reduce:transition-none motion-reduce:active:translate-y-0",
        )}
        onClick={() => handleOpenChange(true)}
        aria-label="Search the admin (Ctrl + M)"
        aria-keyshortcuts="Control+M Control+K Meta+K"
      >
        <FiSearch aria-hidden="true" className="size-4" />
        <span className="hidden sm:inline">Search…</span>
        <kbd className="ml-auto hidden rounded border bg-muted px-1.5 py-0.5 text-[10px] font-medium sm:inline">
          Ctrl M
        </kbd>
      </Button>

      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="gap-0 overflow-hidden p-0 sm:max-w-xl">
          <DialogTitle className="sr-only">Search the admin</DialogTitle>
          <DialogDescription className="sr-only">
            Find courses, people, content and payments. Use the arrow keys and
            Enter to open a result.
          </DialogDescription>

          {/* 3D entrance: halka jhuk kar seedha hota hai */}
          <div className="[perspective:900px]">
            <motion.div
              initial={reduce ? false : { rotateX: 10, y: -8, opacity: 0.6 }}
              animate={{ rotateX: 0, y: 0, opacity: 1 }}
              transition={{ type: "spring", stiffness: 260, damping: 24 }}
              style={{ transformOrigin: "top center" }}
              className="relative"
              onPointerMove={onPointerMove}
            >
              <span
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 motion-reduce:hidden"
                style={{
                  background:
                    "radial-gradient(180px circle at var(--mx, 50%) var(--my, 0%), color-mix(in oklab, var(--primary) 10%, transparent), transparent 70%)",
                }}
              />

              <Command shouldFilter={false} className="relative">
                <CommandInput
                  value={q}
                  onValueChange={setQ}
                  placeholder="Search courses, students, payments (pay-…), emails…"
                />

                {/* Group filter chips */}
                {state === "done" && allGroups.length > 1 && (
                  <div
                    className="flex flex-wrap gap-1.5 border-b px-3 py-2"
                    role="group"
                    aria-label="Filter results"
                  >
                    {[
                      { label: "all", name: "All" },
                      ...allGroups.map((g) => ({
                        label: g.label,
                        name: g.label,
                      })),
                    ].map((c) => (
                      <button
                        key={c.label}
                        type="button"
                        onClick={() => setFilter(c.label)}
                        aria-pressed={activeFilter === c.label}
                        className={cn(
                          "rounded-full border px-2.5 py-0.5 text-xs outline-none transition-all duration-150 focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none",
                          activeFilter === c.label
                            ? "border-primary/30 bg-primary/10 font-medium text-foreground shadow-[0_2px_0_0_color-mix(in_oklab,var(--primary)_25%,transparent)]"
                            : "text-muted-foreground hover:-translate-y-0.5 hover:text-foreground motion-reduce:hover:translate-y-0",
                        )}
                      >
                        {c.name}
                      </button>
                    ))}
                  </div>
                )}

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
                              Clear all
                            </button>
                          </span>
                        }
                      >
                        {recent.map((s, i) => (
                          <CommandItem
                            key={s}
                            value={`recent-${s}`}
                            onSelect={() => setQ(s)}
                            className={cn("group gap-2", enter)}
                            style={delay(i)}
                          >
                            <Clock
                              aria-hidden="true"
                              className="size-4 text-muted-foreground"
                            />
                            <span className="flex-1 truncate">{s}</span>
                            <button
                              type="button"
                              aria-label={`Remove ${s} from recent searches`}
                              onClick={(e) => {
                                e.stopPropagation();
                                removeRecent(s);
                              }}
                              className="rounded-sm p-1 text-muted-foreground opacity-0 outline-none transition-opacity hover:text-foreground focus-visible:opacity-100 focus-visible:ring-2 focus-visible:ring-ring group-hover:opacity-100 group-data-[selected=true]:opacity-100"
                            >
                              <X aria-hidden="true" className="size-3.5" />
                            </button>
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
                        {g.items.map((it, i) => (
                          <CommandItem
                            key={`${g.label}-${it.id}`}
                            value={`${g.label}-${it.id}`}
                            onSelect={() => go(it.href)}
                            className={cn("group gap-3 py-2", enter)}
                            style={delay(i)}
                          >
                            <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-muted text-muted-foreground shadow-sm ring-1 ring-inset ring-border/60 transition-all duration-200 group-data-[selected=true]:-translate-y-0.5 group-data-[selected=true]:bg-primary/10 group-data-[selected=true]:text-primary motion-reduce:transition-none motion-reduce:group-data-[selected=true]:translate-y-0">
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
              <div className="relative flex items-center justify-between gap-3 border-t bg-muted/30 px-4 py-2 text-xs text-muted-foreground">
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
                    <kbd className="rounded border bg-background px-1">
                      Ctrl M
                    </kbd>
                    toggle
                  </span>
                </span>
              </div>
            </motion.div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
