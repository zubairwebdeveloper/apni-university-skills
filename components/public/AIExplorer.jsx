"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { FiCheck, FiCpu, FiUser, FiX } from "react-icons/fi";

import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

const EASE = [0.22, 1, 0.36, 1];

/* ---------------------------- live chat demo --------------------------- */

const PROMPTS = [
  {
    q: "Explain machine learning like I'm 12.",
    a: "It is teaching a computer with examples instead of rules. Show it 1,000 cat photos and it learns what a cat looks like.",
  },
  {
    q: "Write a Python function to reverse a string.",
    a: "def reverse(s): return s[::-1]. It slices the string from the end to the start with a step of -1.",
  },
  {
    q: "Give me a 3 step plan to learn AI.",
    a: "1) Learn Python basics. 2) Build a small ML project. 3) Make an app with an LLM API and publish it.",
  },
];

export function ChatDemo() {
  const reduce = useReducedMotion();
  const [i, setI] = useState(0);
  const [stage, setStage] = useState(reduce ? "answer" : "typing");
  const [len, setLen] = useState(reduce ? PROMPTS[0].q.length : 0);
  const p = PROMPTS[i];

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

  return (
    <div className="mx-auto w-full max-w-2xl overflow-hidden rounded-2xl border bg-card shadow-xl">
      <div
        aria-hidden="true"
        className="flex h-9 items-center gap-1.5 border-b bg-muted/60 px-4"
      >
        <span className="size-2.5 rounded-full bg-destructive/60" />
        <span className="size-2.5 rounded-full bg-highlight/80" />
        <span className="size-2.5 rounded-full bg-primary/60" />
        <span className="ml-3 text-xs text-muted-foreground">ai-assistant</span>
      </div>

      <div className="min-h-64 space-y-4 p-4 sm:p-5" aria-hidden="true">
        <div className="flex items-start gap-3">
          <span className="grid size-8 shrink-0 place-items-center rounded-full bg-muted">
            <FiUser className="size-4" />
          </span>
          <p className="min-w-0 rounded-2xl rounded-tl-sm bg-muted px-3 py-2 text-sm">
            {p.q.slice(0, len)}
            {stage === "typing" && (
              <span className="ml-0.5 inline-block h-3.5 w-1.5 translate-y-0.5 animate-pulse bg-primary" />
            )}
          </p>
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
              <span className="flex gap-1 rounded-2xl rounded-tl-sm border px-3 py-3">
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
              <p className="min-w-0 rounded-2xl rounded-tl-sm border bg-primary/5 px-3 py-2 text-sm">
                {p.a}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <p className="sr-only">
        Example: you ask "{PROMPTS[0].q}" and the assistant explains it in
        simple words.
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

export function CanCantToggle() {
  const reduce = useReducedMotion();
  const [tab, setTab] = useState("can");
  const items = tab === "can" ? CAN : CANT;

  return (
    <div>
      <div
        role="tablist"
        aria-label="What AI can and cannot do"
        className="mx-auto flex w-fit max-w-full gap-2 overflow-x-auto rounded-full border bg-card p-1"
      >
        {[
          { id: "can", label: "AI is great at" },
          { id: "cant", label: "AI still struggles with" },
        ].map((t) => (
          <button
            key={t.id}
            type="button"
            role="tab"
            id={`tab-${t.id}`}
            aria-selected={tab === t.id}
            aria-controls="cancant-panel"
            onClick={() => setTab(t.id)}
            className={cn(
              buttonVariants({
                size: "sm",
                variant: tab === t.id ? "default" : "ghost",
              }),
              "shrink-0 rounded-full",
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div id="cancant-panel" role="tabpanel" aria-labelledby={`tab-${tab}`}>
        <AnimatePresence mode="wait" initial={false}>
          <motion.ul
            key={tab}
            initial={reduce ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduce ? undefined : { opacity: 0, y: -10 }}
            transition={{ duration: 0.25 }}
            className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3"
          >
            {items.map((text) => (
              <li
                key={text}
                className="flex min-w-0 items-start gap-3 rounded-xl border bg-card p-4 text-sm"
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
                {text}
              </li>
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
  const [id, setId] = useState(LEVELS[0].id);
  const level = LEVELS.find((l) => l.id === id);

  return (
    <div className="mx-auto max-w-3xl">
      <div
        role="tablist"
        aria-label="Learning level"
        className="flex gap-2 overflow-x-auto [scrollbar-width:none] sm:justify-center [&::-webkit-scrollbar]:hidden"
      >
        {LEVELS.map((l) => (
          <button
            key={l.id}
            type="button"
            role="tab"
            aria-selected={id === l.id}
            aria-controls="level-panel"
            onClick={() => setId(l.id)}
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
        id="level-panel"
        role="tabpanel"
        className="mt-5 rounded-2xl border bg-card/70 p-5 backdrop-blur sm:p-6"
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={level.id}
            initial={reduce ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduce ? undefined : { opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
          >
            <p className="text-sm text-muted-foreground">
              Estimated time:{" "}
              <span className="font-medium text-foreground">{level.time}</span>
            </p>

            <ol className="relative mt-5 space-y-5 border-l border-primary/30 pl-6">
              {level.steps.map((s, i) => (
                <motion.li
                  key={s}
                  initial={reduce ? false : { opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.35, delay: i * 0.08 }}
                  className="relative text-sm sm:text-base"
                >
                  <span
                    aria-hidden="true"
                    className="absolute -left-[2.15rem] top-0 grid size-6 place-items-center rounded-full bg-primary text-xs font-semibold text-primary-foreground"
                  >
                    {i + 1}
                  </span>
                  {s}
                </motion.li>
              ))}
            </ol>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
