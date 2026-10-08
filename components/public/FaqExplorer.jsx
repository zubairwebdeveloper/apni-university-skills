// components/public/FaqExplorer.jsx
"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  FiArrowRight,
  FiAward,
  FiBookOpen,
  FiCheck,
  FiCreditCard,
  FiHelpCircle,
  FiLink,
  FiMessageSquare,
  FiSearch,
  FiStar,
  FiThumbsDown,
  FiThumbsUp,
  FiUser,
  FiX,
} from "react-icons/fi";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { buttonVariants } from "@/components/ui/button";
import { getFaqCategory } from "@/components/public/faqUtils";

const CATEGORY_ICONS = {
  Courses: FiBookOpen,
  Payments: FiCreditCard,
  Certificates: FiAward,
  Account: FiUser,
  Reviews: FiStar,
  General: FiHelpCircle,
};

// Short description shown when a topic is selected.
const CATEGORY_HINTS = {
  Courses: "Enrollment, access and how learning works.",
  Payments: "Pricing, refunds and payment methods.",
  Certificates: "How certificates are earned, issued and verified.",
  Account: "Login, profile and account settings.",
  Reviews: "Rating courses and sharing feedback.",
  General: "Everything else about the platform.",
};

// Suggested searches. Only the ones that actually match a question are shown.
const SUGGESTED_SEARCHES = [
  "refund",
  "certificate",
  "payment",
  "login",
  "free",
  "access",
];

const escapeRegExp = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

function Highlight({ text, query }) {
  const terms = query
    .trim()
    .split(/\s+/)
    .filter((t) => t.length > 1)
    .map(escapeRegExp);
  if (!terms.length) return <>{text}</>;
  const parts = String(text).split(new RegExp(`(${terms.join("|")})`, "gi"));
  return (
    <>
      {parts.map((p, i) =>
        i % 2 === 1 ? (
          <mark
            key={i}
            className="rounded bg-primary/20 px-0.5 text-foreground"
          >
            {p}
          </mark>
        ) : (
          <span key={i}>{p}</span>
        ),
      )}
    </>
  );
}

export function FaqExplorer({ faqs = [] }) {
  const reduce = useReducedMotion();
  const inputRef = useRef(null);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [open, setOpen] = useState([]);
  const [votes, setVotes] = useState({}); // { [id]: "up" | "down" }
  const [copiedId, setCopiedId] = useState(null);

  // Stable id per question, based on its original position.
  const items = useMemo(
    () =>
      faqs.map((f, i) => ({
        ...f,
        id: `faq-${i}`,
        category: getFaqCategory(f),
      })),
    [faqs],
  );

  const categories = useMemo(() => {
    const counts = new Map();
    items.forEach((f) =>
      counts.set(f.category, (counts.get(f.category) || 0) + 1),
    );
    return [
      { name: "All", count: items.length },
      ...[...counts.entries()]
        .sort((a, b) => b[1] - a[1])
        .map(([name, count]) => ({ name, count })),
    ];
  }, [items]);

  const terms = useMemo(
    () => query.trim().toLowerCase().split(/\s+/).filter(Boolean),
    [query],
  );

  // Every search word must appear in the question or the answer.
  const results = useMemo(() => {
    return items.filter((f) => {
      if (category !== "All" && f.category !== category) return false;
      if (!terms.length) return true;
      const hay = `${f.q} ${f.a}`.toLowerCase();
      return terms.every((t) => hay.includes(t));
    });
  }, [items, terms, category]);

  const suggestions = useMemo(
    () =>
      SUGGESTED_SEARCHES.filter((s) =>
        items.some((f) => `${f.q} ${f.a}`.toLowerCase().includes(s)),
      ).slice(0, 5),
    [items],
  );

  const hasFilters = terms.length > 0 || category !== "All";
  const allOpen =
    results.length > 0 && results.every((f) => open.includes(f.id));

  const clearFilters = useCallback(() => {
    setQuery("");
    setCategory("All");
  }, []);

  function toggleAll() {
    setOpen(allOpen ? [] : results.map((f) => f.id));
  }

  // "/" focuses search, "Esc" clears it.
  useEffect(() => {
    function onKey(e) {
      const tag = document.activeElement?.tagName;
      const typing = tag === "INPUT" || tag === "TEXTAREA";
      if (e.key === "/" && !typing && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        inputRef.current?.focus();
      }
      if (e.key === "Escape" && document.activeElement === inputRef.current) {
        setQuery("");
        inputRef.current?.blur();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Deep link: /faq#faq-3 opens and scrolls to that question.
  useEffect(() => {
    const id = window.location.hash.replace("#", "");
    if (id && items.some((f) => f.id === id)) {
      setTimeout(
        () => {
          setOpen([id]);
          document
            .getElementById(id)
            ?.scrollIntoView({ behavior: "smooth", block: "center" });
        },
        300,
      );
    }
  }, [items]);

  async function copyLink(id) {
    const url = `${window.location.origin}${window.location.pathname}#${id}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopiedId(id);
      setTimeout(() => setCopiedId((c) => (c === id ? null : c)), 1800);
    } catch {
      window.history.pushState(null, "", `#${id}`);
    }
  }

  function openRelated(id) {
    setQuery("");
    setOpen((prev) => (prev.includes(id) ? prev : [...prev, id]));
    setTimeout(
      () =>
        document
          .getElementById(id)
          ?.scrollIntoView({ behavior: "smooth", block: "center" }),
      250,
    );
  }

  const spring = reduce
    ? { duration: 0 }
    : { type: "spring", stiffness: 420, damping: 34 };

  return (
    <div>
      {/* ---------- Toolbar ---------- */}
      <div className="rounded-2xl border bg-card p-3.5 shadow-sm sm:p-5">
        <div className="group relative">
          <FiSearch
            aria-hidden="true"
            className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-primary"
          />
          <input
            ref={inputRef}
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search: refund, certificate, payment..."
            aria-label="Search frequently asked questions"
            className="h-12 w-full rounded-xl border bg-background pl-10 pr-12 text-base outline-none transition-all placeholder:text-muted-foreground focus-visible:border-primary/50 focus-visible:ring-4 focus-visible:ring-primary/15 sm:text-sm [&::-webkit-search-cancel-button]:appearance-none"
          />
          {query ? (
            <button
              type="button"
              onClick={() => {
                setQuery("");
                inputRef.current?.focus();
              }}
              aria-label="Clear search"
              className="absolute right-2.5 top-1/2 grid size-8 -translate-y-1/2 place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <FiX aria-hidden="true" className="size-4" />
            </button>
          ) : (
            <kbd
              aria-hidden="true"
              className="pointer-events-none absolute right-3 top-1/2 hidden h-6 -translate-y-1/2 items-center rounded-md border bg-muted px-2 font-sans text-xs text-muted-foreground sm:inline-flex"
            >
              /
            </kbd>
          )}
        </div>

        {/* Suggested searches */}
        {!query && suggestions.length > 0 && (
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span className="text-xs text-muted-foreground">Try:</span>
            {suggestions.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setQuery(s)}
                className="rounded-full border bg-background px-3 py-1 text-xs font-medium text-muted-foreground transition-colors hover:border-primary/40 hover:bg-primary/5 hover:text-primary"
              >
                {s}
              </button>
            ))}
          </div>
        )}

        {/* Topic chips: full-bleed horizontal scroll on mobile */}
        {categories.length > 2 && (
          <div
            className="-mx-3.5 mt-4 flex snap-x gap-2 overflow-x-auto px-3.5 pb-1 sm:-mx-5 sm:px-5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            role="group"
            aria-label="Filter by topic"
          >
            {categories.map((c) => {
              const active = category === c.name;
              const Icon = CATEGORY_ICONS[c.name];
              return (
                <button
                  key={c.name}
                  type="button"
                  onClick={() => setCategory(c.name)}
                  aria-pressed={active}
                  className={`relative inline-flex shrink-0 snap-start items-center gap-2 rounded-full border px-3.5 py-2 text-sm font-medium transition-colors duration-200 ${
                    active
                      ? "border-primary text-primary-foreground"
                      : "bg-background text-muted-foreground hover:border-primary/40 hover:text-foreground"
                  }`}
                >
                  {active && (
                    <motion.span
                      layoutId="faq-chip-bg"
                      transition={spring}
                      className="absolute inset-0 rounded-full bg-primary shadow-sm"
                    />
                  )}
                  <span className="relative z-10 inline-flex items-center gap-2">
                    {Icon && <Icon aria-hidden="true" className="size-3.5" />}
                    {c.name}
                    <span
                      className={`rounded-full px-1.5 text-xs ${
                        active ? "bg-primary-foreground/20" : "bg-muted"
                      }`}
                    >
                      {c.count}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
        )}

        {/* Topic hint */}
        <AnimatePresence initial={false} mode="wait">
          {category !== "All" && CATEGORY_HINTS[category] && (
            <motion.p
              key={category}
              initial={reduce ? false : { opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden pt-3 text-sm text-muted-foreground"
            >
              {CATEGORY_HINTS[category]}
            </motion.p>
          )}
        </AnimatePresence>
      </div>

      {/* ---------- Result meta ---------- */}
      <div
        className="mt-5 flex flex-col gap-2 sm:mt-6 sm:flex-row sm:items-center sm:justify-between"
        aria-live="polite"
      >
        <p className="text-sm text-muted-foreground">
          Showing{" "}
          <motion.span
            key={results.length}
            initial={reduce ? false : { opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-block font-semibold text-foreground"
          >
            {results.length}
          </motion.span>{" "}
          of {items.length} questions
        </p>
        <div className="flex items-center gap-4">
          {results.length > 1 && (
            <button
              type="button"
              onClick={toggleAll}
              className="text-sm font-medium text-primary underline-offset-4 hover:underline"
            >
              {allOpen ? "Collapse all" : "Expand all"}
            </button>
          )}
          {hasFilters && (
            <button
              type="button"
              onClick={clearFilters}
              className="inline-flex items-center gap-1.5 text-sm font-medium text-primary underline-offset-4 hover:underline"
            >
              <FiX aria-hidden="true" className="size-3.5" />
              Clear filters
            </button>
          )}
        </div>
      </div>

      {/* ---------- Results ---------- */}
      {results.length ? (
        <Accordion
          type="multiple"
          value={open}
          onValueChange={setOpen}
          className="mt-4 space-y-3"
        >
          <AnimatePresence initial={false} mode="popLayout">
            {results.map((f, i) => {
              const Icon = CATEGORY_ICONS[f.category] ?? FiHelpCircle;
              const vote = votes[f.id];
              const answerOnly =
                terms.length > 0 &&
                !terms.every((t) => f.q.toLowerCase().includes(t));
              const related = items
                .filter((r) => r.category === f.category && r.id !== f.id)
                .slice(0, 2);

              return (
                <motion.div
                  key={f.id}
                  id={f.id}
                  layout={!reduce}
                  initial={reduce ? false : { opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.98 }}
                  transition={{
                    duration: 0.25,
                    delay: Math.min(i * 0.03, 0.2),
                  }}
                  className="scroll-mt-24"
                >
                  <AccordionItem
                    value={f.id}
                    className="rounded-xl border bg-card px-3.5 transition-all duration-200 hover:border-primary/30 data-[state=open]:border-primary/40 data-[state=open]:shadow-md sm:px-5"
                  >
                    <AccordionTrigger className="gap-3 py-4 text-left text-[15px] leading-snug hover:no-underline sm:text-base">
                      <span className="flex items-start gap-3">
                        <span className="mt-0.5 grid size-8 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
                          <Icon aria-hidden="true" className="size-4" />
                        </span>
                        <span>
                          <Highlight text={f.q} query={query} />
                        </span>
                      </span>
                    </AccordionTrigger>

                    <AccordionContent className="text-muted-foreground sm:pl-11">
                      {answerOnly && (
                        <span className="mb-2 inline-block rounded-md bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                          Match found in answer
                        </span>
                      )}
                      <p className="leading-relaxed">
                        <Highlight text={f.a} query={query} />
                      </p>

                      {/* Meta + actions */}
                      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t pt-3">
                        <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-foreground/70">
                          {f.category}
                        </span>

                        <button
                          type="button"
                          onClick={() => copyLink(f.id)}
                          className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                        >
                          {copiedId === f.id ? (
                            <>
                              <FiCheck
                                aria-hidden="true"
                                className="size-3.5 text-primary"
                              />
                              Link copied
                            </>
                          ) : (
                            <>
                              <FiLink aria-hidden="true" className="size-3.5" />
                              Copy link
                            </>
                          )}
                        </button>
                      </div>

                      {/* Helpful? */}
                      <div className="mt-3 flex flex-wrap items-center gap-2 text-sm">
                        <AnimatePresence mode="wait" initial={false}>
                          {!vote ? (
                            <motion.div
                              key="ask"
                              exit={{ opacity: 0 }}
                              className="flex flex-wrap items-center gap-2"
                            >
                              <span className="text-foreground/80">
                                Was this helpful?
                              </span>
                              <button
                                type="button"
                                aria-label="Yes, this was helpful"
                                onClick={() =>
                                  setVotes((v) => ({ ...v, [f.id]: "up" }))
                                }
                                className="inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors hover:border-primary/40 hover:bg-primary/5 hover:text-primary"
                              >
                                <FiThumbsUp
                                  aria-hidden="true"
                                  className="size-3.5"
                                />
                                Yes
                              </button>
                              <button
                                type="button"
                                aria-label="No, this was not helpful"
                                onClick={() =>
                                  setVotes((v) => ({ ...v, [f.id]: "down" }))
                                }
                                className="inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors hover:bg-muted"
                              >
                                <FiThumbsDown
                                  aria-hidden="true"
                                  className="size-3.5"
                                />
                                No
                              </button>
                            </motion.div>
                          ) : (
                            <motion.p
                              key="thanks"
                              initial={reduce ? false : { opacity: 0, y: 6 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="inline-flex flex-wrap items-center gap-1.5 text-foreground/80"
                            >
                              <FiCheck
                                aria-hidden="true"
                                className="size-4 text-primary"
                              />
                              {vote === "up" ? (
                                "Thanks for your feedback!"
                              ) : (
                                <>
                                  Sorry about that.{" "}
                                  <Link
                                    href="/contact"
                                    className="font-medium text-primary underline-offset-4 hover:underline"
                                  >
                                    Ask us directly
                                  </Link>
                                </>
                              )}
                            </motion.p>
                          )}
                        </AnimatePresence>
                      </div>

                      {/* Related questions */}
                      {related.length > 0 && (
                        <div className="mt-4 rounded-lg bg-muted/50 p-3">
                          <p className="mb-1.5 text-xs font-medium text-foreground/70">
                            Related questions
                          </p>
                          <ul className="space-y-1">
                            {related.map((r) => (
                              <li key={r.id}>
                                <button
                                  type="button"
                                  onClick={() => openRelated(r.id)}
                                  className="group/rel flex w-full items-start gap-2 text-left text-sm text-muted-foreground transition-colors hover:text-primary"
                                >
                                  <FiArrowRight
                                    aria-hidden="true"
                                    className="mt-1 size-3.5 shrink-0 transition-transform group-hover/rel:translate-x-0.5"
                                  />
                                  <span>{r.q}</span>
                                </button>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </AccordionContent>
                  </AccordionItem>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </Accordion>
      ) : (
        <motion.div
          initial={reduce ? false : { opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mt-5 rounded-2xl border border-dashed bg-card/50 p-6 text-center sm:p-10"
        >
          <span className="mx-auto grid size-12 place-items-center rounded-xl bg-primary/10 text-primary">
            <FiSearch aria-hidden="true" className="size-5" />
          </span>
          <h3 className="mt-4 font-sans text-lg font-semibold">
            No questions match your search
          </h3>
          <p className="mx-auto mt-1 max-w-md text-sm text-muted-foreground">
            Try different words or a shorter search, or send us your question
            and we will help.
          </p>

          {suggestions.length > 0 && (
            <div className="mt-4 flex flex-wrap justify-center gap-2">
              {suggestions.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => {
                    setCategory("All");
                    setQuery(s);
                  }}
                  className="rounded-full border bg-background px-3 py-1 text-xs font-medium text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary"
                >
                  {s}
                </button>
              ))}
            </div>
          )}

          <div className="mt-5 flex flex-col justify-center gap-3 sm:flex-row">
            <button
              type="button"
              onClick={clearFilters}
              className="inline-flex items-center justify-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium transition-colors hover:bg-muted"
            >
              Reset filters
            </button>
            <Link
              href="/contact"
              className={buttonVariants({ variant: "default" })}
            >
              <FiMessageSquare aria-hidden="true" />
              Ask us
            </Link>
          </div>
        </motion.div>
      )}

      {/* ---------- Still need help ---------- */}
      <motion.div
        initial={reduce ? false : { opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.4 }}
        className="mt-10 flex flex-col items-start gap-4 rounded-2xl border bg-primary/5 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6"
      >
        <div className="flex items-start gap-4">
          <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-primary text-primary-foreground">
            <FiMessageSquare aria-hidden="true" className="size-5" />
          </span>
          <div>
            <h3 className="font-sans text-base font-semibold sm:text-lg">
              Still have a question?
            </h3>
            <p className="mt-0.5 text-sm text-muted-foreground">
              Cannot find your answer here? Send us a message and we will get
              back to you.
            </p>
          </div>
        </div>
        <Link
          href="/contact"
          className={`${buttonVariants({ variant: "default" })} w-full sm:w-auto`}
        >
          Contact us
          <FiArrowRight aria-hidden="true" />
        </Link>
      </motion.div>
    </div>
  );
}
