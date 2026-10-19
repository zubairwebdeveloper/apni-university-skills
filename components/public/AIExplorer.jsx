"use client";

import { useEffect, useId, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  FiArrowRight,
  FiCheck,
  FiClock,
  FiCpu,
  FiRotateCcw,
  FiSend,
  FiUser,
  FiX,
} from "react-icons/fi";

import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

const EASE = [0.22, 1, 0.36, 1];

const FOCUS_RING =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background";

/* Arrow-key / Home / End navigation shared by every tablist below. */
function onTabKeyDown(e, ids, current, select, uid) {
  const idx = ids.indexOf(current);
  let next;
  if (e.key === "ArrowRight" || e.key === "ArrowDown") {
    next = (idx + 1) % ids.length;
  } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
    next = (idx - 1 + ids.length) % ids.length;
  } else if (e.key === "Home") {
    next = 0;
  } else if (e.key === "End") {
    next = ids.length - 1;
  } else {
    return;
  }
  e.preventDefault();
  select(ids[next]);
  document.getElementById(`${uid}-tab-${ids[next]}`)?.focus();
}

/* ---------------------------- live chat demo --------------------------- */

const PROMPTS = [
  {
    tag: "Explain",
    q: "Explain machine learning like I'm 12.",
    a: "It is teaching a computer with examples instead of rules. Show it 1,000 cat photos and it learns what a cat looks like.",
  },
  {
    tag: "Code",
    q: "Write a Python function to reverse a string.",
    a: "def reverse(s): return s[::-1]. It slices the string from the end to the start with a step of -1.",
  },
  {
    tag: "Plan",
    q: "Give me a 3 step plan to learn AI.",
    a: "1) Learn Python basics. 2) Build a small ML project. 3) Make an app with an LLM API and publish it.",
  },
];

export function ChatDemo() {
  const reduce = useReducedMotion();
  const [i, setI] = useState(0);
  const [stage, setStage] = useState("typing");
  const [len, setLen] = useState(0);
  const p = PROMPTS[i];

  // Reduced motion: skip typing and thinking, show the finished exchange.
  useEffect(() => {
    if (reduce) {
      setStage("answer");
      setLen(PROMPTS[i].q.length);
    }
  }, [reduce, i]);

  useEffect(() => {
    if (reduce) return;
    let t;
    if (stage === "typing") {
      t =
        len < p.q.length
          ? setTimeout(() => setLen(len + 1), 35)
          : setTimeout(() => setStage("thinking"), 400);
    } else if (stage === "thinking") {
      t = setTimeout(() => setStage("answer"), 1100);
    } else {
      t = setTimeout(() => {
        setI((c) => (c + 1) % PROMPTS.length);
        setLen(0);
        setStage("typing");
      }, 4500);
    }
    return () => clearTimeout(t);
  }, [stage, len, p, reduce]);

  const selectPrompt = (n) => {
    setI(n);
    setLen(0);
    setStage("typing");
  };

  return (
    <div className="mx-auto w-full max-w-2xl overflow-hidden rounded-2xl border bg-card shadow-xl">
      {/* Window header */}
      <div
        aria-hidden="true"
        className="flex h-10 items-center gap-1.5 border-b bg-muted/60 px-4"
      >
        <span className="size-2.5 rounded-full bg-destructive/60" />
        <span className="size-2.5 rounded-full bg-highlight/80" />
        <span className="size-2.5 rounded-full bg-primary/60" />
        <span className="ml-3 text-xs font-medium text-muted-foreground">
          ai-assistant
        </span>
        <span className="ml-auto inline-flex items-center gap-1.5 rounded-full border bg-background px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
          <span className="size-1.5 rounded-full bg-primary motion-safe:animate-pulse" />
          Live demo
        </span>
      </div>

      {/* Conversation */}
      <div className="min-h-72 space-y-5 p-4 sm:p-6" aria-hidden="true">
        <div className="flex items-start gap-3">
          <span className="grid size-8 shrink-0 place-items-center rounded-full border bg-muted">
            <FiUser className="size-4" />
          </span>
          <div className="min-w-0">
            <p className="mb-1 text-xs font-medium text-muted-foreground">
              You
            </p>
            <p className="rounded-2xl rounded-tl-sm bg-muted px-3.5 py-2.5 text-sm leading-relaxed">
              {p.q.slice(0, len)}
              {stage === "typing" && (
                <span className="ml-0.5 inline-block h-3.5 w-1.5 translate-y-0.5 bg-primary motion-safe:animate-pulse" />
              )}
            </p>
          </div>
        </div>

        <AnimatePresence mode="wait" initial={false}>
          {stage === "thinking" && (
            <motion.div
              key="think"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-start gap-3"
            >
              <span className="grid size-8 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground">
                <FiCpu className="size-4" />
              </span>
              <div className="min-w-0">
                <p className="mb-1 text-xs font-medium text-muted-foreground">
                  Assistant
                </p>
                <span className="flex w-fit gap-1 rounded-2xl rounded-tl-sm border px-3.5 py-3">
                  {[0, 1, 2].map((d) => (
                    <motion.span
                      key={d}
                      animate={{ y: [0, -4, 0] }}
                      transition={{
                        duration: 0.7,
                        repeat: Infinity,
                        delay: d * 0.15,
                      }}
                      className="size-1.5 rounded-full bg-primary"
                    />
                  ))}
                </span>
              </div>
            </motion.div>
          )}

          {stage === "answer" && (
            <motion.div
              key={`a-${i}`}
              initial={reduce ? false : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease: EASE }}
              className="flex items-start gap-3"
            >
              <span className="grid size-8 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground">
                <FiCpu className="size-4" />
              </span>
              <div className="min-w-0">
                <p className="mb-1 text-xs font-medium text-muted-foreground">
                  Assistant
                </p>
                <p className="rounded-2xl rounded-tl-sm border border-primary/20 bg-primary/5 px-3.5 py-2.5 text-sm leading-relaxed">
                  {p.a}
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Example selector (real buttons, outside the aria-hidden area) */}
      <div className="border-t bg-muted/30 px-4 py-3 sm:px-6">
        <div
          role="group"
          aria-label="Example prompts"
          className="flex flex-wrap items-center gap-2"
        >
          <span className="text-xs text-muted-foreground">Try:</span>
          {PROMPTS.map((item, n) => (
            <button
              key={item.tag}
              type="button"
              aria-pressed={i === n}
              onClick={() => selectPrompt(n)}
              className={cn(
                "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                FOCUS_RING,
                i === n
                  ? "border-primary bg-primary text-primary-foreground"
                  : "bg-background text-muted-foreground hover:border-primary/40 hover:text-foreground",
              )}
            >
              {item.tag}
            </button>
          ))}
        </div>

        <div
          aria-hidden="true"
          className="mt-3 flex items-center gap-2 rounded-xl border bg-background px-3 py-2"
        >
          <span className="flex-1 truncate text-sm text-muted-foreground">
            Ask anything...
          </span>
          <span className="grid size-7 place-items-center rounded-lg bg-primary text-primary-foreground">
            <FiSend className="size-3.5" />
          </span>
        </div>
      </div>

      <p className="sr-only">
        Example: you ask &quot;{PROMPTS[0].q}&quot; and the assistant explains
        it in simple words.
      </p>
    </div>
  );
}

/* ------------------------- what AI can / can't do ---------------------- */

const CAN = [
  "Summarize long documents in seconds",
  "Write and explain code",
  "Translate and rewrite text",
  "Find patterns in large data",
  "Brainstorm ideas and outlines",
  "Automate repetitive tasks",
];

const CANT = [
  "Guarantee every answer is correct",
  "Understand feelings the way people do",
  "Take responsibility for decisions",
  "Know events after its training data",
  "Replace judgement and ethics",
  "Work well with vague instructions",
];

const CAN_TABS = [
  {
    id: "can",
    label: "AI is great at",
    hint: "Fast, repeatable work where pattern recognition shines.",
  },
  {
    id: "cant",
    label: "AI still struggles with",
    hint: "Areas where human review and judgement are still essential.",
  },
];

export function CanCantToggle() {
  const reduce = useReducedMotion();
  const uid = useId();
  const [tab, setTab] = useState("can");
  const items = tab === "can" ? CAN : CANT;
  const active = CAN_TABS.find((t) => t.id === tab);
  const ids = CAN_TABS.map((t) => t.id);

  return (
    <div>
      <div
        role="tablist"
        aria-label="What AI can and cannot do"
        className="mx-auto flex w-fit max-w-full gap-1 overflow-x-auto rounded-full border bg-card p-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {CAN_TABS.map((t) => {
          const selected = tab === t.id;
          return (
            <button
              key={t.id}
              type="button"
              role="tab"
              id={`${uid}-tab-${t.id}`}
              aria-selected={selected}
              aria-controls={`${uid}-panel`}
              tabIndex={selected ? 0 : -1}
              onClick={() => setTab(t.id)}
              onKeyDown={(e) => onTabKeyDown(e, ids, tab, setTab, uid)}
              className={cn(
                "relative shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-colors",
                FOCUS_RING,
                selected
                  ? "text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {selected && (
                <motion.span
                  layoutId={`${uid}-pill`}
                  aria-hidden="true"
                  className="absolute inset-0 rounded-full bg-primary"
                  transition={
                    reduce
                      ? { duration: 0 }
                      : { type: "spring", stiffness: 420, damping: 34 }
                  }
                />
              )}
              <span className="relative z-10 flex items-center gap-2">
                {t.label}
                <span
                  className={cn(
                    "rounded-full px-1.5 text-[11px] tabular-nums",
                    selected
                      ? "bg-primary-foreground/20"
                      : "bg-muted text-muted-foreground",
                  )}
                >
                  {t.id === "can" ? CAN.length : CANT.length}
                </span>
              </span>
            </button>
          );
        })}
      </div>

      <p className="mx-auto mt-4 max-w-md text-center text-sm text-muted-foreground">
        {active.hint}
      </p>

      <div
        id={`${uid}-panel`}
        role="tabpanel"
        aria-labelledby={`${uid}-tab-${tab}`}
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.ul
            key={tab}
            initial={reduce ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduce ? undefined : { opacity: 0, y: -10 }}
            transition={{ duration: 0.25 }}
            className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3"
          >
            {items.map((text, n) => (
              <motion.li
                key={text}
                initial={reduce ? false : { opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: n * 0.05, ease: EASE }}
                className={cn(
                  "flex min-w-0 items-start gap-3 rounded-xl border bg-card p-4 text-sm leading-relaxed transition-colors",
                  tab === "can"
                    ? "hover:border-primary/40"
                    : "hover:border-destructive/40",
                )}
              >
                <span
                  className={cn(
                    "mt-0.5 grid size-6 shrink-0 place-items-center rounded-full",
                    tab === "can"
                      ? "bg-primary/10 text-primary"
                      : "bg-destructive/10 text-destructive",
                  )}
                >
                  {tab === "can" ? (
                    <FiCheck aria-hidden="true" className="size-3.5" />
                  ) : (
                    <FiX aria-hidden="true" className="size-3.5" />
                  )}
                </span>
                <span className="min-w-0">{text}</span>
              </motion.li>
            ))}
          </motion.ul>
        </AnimatePresence>
      </div>
    </div>
  );
}

/* ----------------------------- level roadmap --------------------------- */

const LEVELS = [
  {
    id: "beginner",
    label: "Beginner",
    time: "1 to 2 months",
    steps: [
      "Learn Python basics: variables, loops, functions",
      "Understand what AI, ML and LLMs mean",
      "Practice writing clear prompts",
      "Use AI tools for daily tasks",
    ],
  },
  {
    id: "intermediate",
    label: "Intermediate",
    time: "3 to 4 months",
    steps: [
      "Work with data using NumPy and Pandas",
      "Train your first ML model",
      "Call an LLM API from your own app",
      "Build a chatbot with your own data",
    ],
  },
  {
    id: "advanced",
    label: "Advanced",
    time: "4 to 6 months",
    steps: [
      "Build AI agents that use tools",
      "Deploy models and monitor them",
      "Evaluate quality, cost and safety",
      "Ship a portfolio project end to end",
    ],
  },
];

export function LevelRoadmap() {
  const reduce = useReducedMotion();
  const uid = useId();
  const [id, setId] = useState(LEVELS[0].id);
  const levelIndex = LEVELS.findIndex((l) => l.id === id);
  const level = LEVELS[levelIndex];
  const isLast = levelIndex === LEVELS.length - 1;
  const ids = LEVELS.map((l) => l.id);

  return (
    <div className="mx-auto max-w-3xl">
      <div
        role="tablist"
        aria-label="Learning level"
        className="flex gap-2 overflow-x-auto px-1 py-1 [scrollbar-width:none] sm:justify-center [&::-webkit-scrollbar]:hidden"
      >
        {LEVELS.map((l) => (
          <button
            key={l.id}
            type="button"
            role="tab"
            id={`${uid}-tab-${l.id}`}
            aria-selected={id === l.id}
            aria-controls={`${uid}-panel`}
            tabIndex={id === l.id ? 0 : -1}
            onClick={() => setId(l.id)}
            onKeyDown={(e) => onTabKeyDown(e, ids, id, setId, uid)}
            className={cn(
              buttonVariants({
                size: "sm",
                variant: id === l.id ? "default" : "outline",
              }),
              "shrink-0 rounded-full",
            )}
          >
            {l.label}
          </button>
        ))}
      </div>

      <div
        id={`${uid}-panel`}
        role="tabpanel"
        aria-labelledby={`${uid}-tab-${id}`}
        className="mt-5 overflow-hidden rounded-2xl border bg-card shadow-sm"
      >
        {/* Panel header: level, time, progress */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b bg-muted/40 px-5 py-4 sm:px-6">
          <div className="min-w-0">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Level {levelIndex + 1} of {LEVELS.length}
            </p>
            <h3 className="text-lg font-semibold leading-tight tracking-tight">
              {level.label}
            </h3>
          </div>

          <div className="flex items-center gap-3">
            <div aria-hidden="true" className="flex items-center gap-1">
              {LEVELS.map((l, n) => (
                <span
                  key={l.id}
                  className={cn(
                    "h-1.5 w-6 rounded-full transition-colors",
                    n <= levelIndex ? "bg-primary" : "bg-border",
                  )}
                />
              ))}
            </div>
            <p className="inline-flex items-center gap-1.5 rounded-full border bg-background px-3 py-1 text-sm text-muted-foreground">
              <FiClock aria-hidden="true" className="size-3.5" />
              Estimated time:{" "}
              <span className="font-medium text-foreground">{level.time}</span>
            </p>
          </div>
        </div>

        <div className="p-5 sm:p-6">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={level.id}
              initial={reduce ? false : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduce ? undefined : { opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
            >
              <ol className="relative space-y-3 pl-11">
                {/* vertical connector */}
                <span
                  aria-hidden="true"
                  className="absolute bottom-4 left-[0.8rem] top-4 w-px bg-primary/30"
                />
                {level.steps.map((s, n) => (
                  <motion.li
                    key={s}
                    initial={reduce ? false : { opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.35, delay: n * 0.08, ease: EASE }}
                    className="relative rounded-xl border bg-background px-4 py-3 text-sm leading-relaxed transition-colors hover:border-primary/40 sm:text-base"
                  >
                    <span
                      aria-hidden="true"
                      className="absolute -left-11 top-1/2 grid size-7 -translate-y-1/2 place-items-center rounded-full bg-primary text-xs font-semibold text-primary-foreground ring-4 ring-card"
                    >
                      {n + 1}
                    </span>
                    {s}
                  </motion.li>
                ))}
              </ol>
            </motion.div>
          </AnimatePresence>

          <div className="mt-6 flex justify-end">
            <button
              type="button"
              onClick={() =>
                setId(isLast ? LEVELS[0].id : LEVELS[levelIndex + 1].id)
              }
              className={cn(
                buttonVariants({ size: "sm", variant: "outline" }),
                "group rounded-full",
              )}
            >
              {isLast ? (
                <>
                  <FiRotateCcw aria-hidden="true" className="mr-2 size-4" />
                  Back to {LEVELS[0].label}
                </>
              ) : (
                <>
                  Continue to {LEVELS[levelIndex + 1].label}
                  <FiArrowRight
                    aria-hidden="true"
                    className="ml-2 size-4 transition-transform motion-safe:group-hover:translate-x-0.5"
                  />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
