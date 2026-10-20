// AIQuickActions.jsx
"use client";

import {
  BookOpen,
  Bug,
  Compass,
  Lightbulb,
  ListChecks,
  Map,
} from "lucide-react";
import { cn } from "@/lib/utils";

const ACTIONS = [
  {
    icon: BookOpen,
    label: "Find a course",
    prompt:
      "I want to learn web development from scratch. Which courses should I look at first?",
  },
  {
    icon: Lightbulb,
    label: "Explain a concept",
    prompt: "Explain how closures work in JavaScript with a simple example.",
  },
  {
    icon: ListChecks,
    label: "Practice questions",
    prompt:
      "Give me 5 practice questions on JavaScript arrays, with answers I can check after trying.",
  },
  {
    icon: Map,
    label: "Learning roadmap",
    prompt:
      "Create a 3-month learning roadmap to become a full-stack developer with React and Node.js.",
  },
  {
    icon: Bug,
    label: "Explain an error",
    prompt:
      "I'm getting an error in my code. What do you need from me to help debug it?",
  },
  {
    icon: Compass,
    label: "Help with enrollment",
    prompt: "How do enrollment and course access work on Apni University?",
  },
];

export function AIQuickActions({ onSelect, compact = false, disabled }) {
  return (
    <ul
      className={cn("grid gap-2", compact ? "grid-cols-1" : "sm:grid-cols-2")}
    >
      {ACTIONS.map(({ icon: Icon, label, prompt }) => (
        <li key={label}>
          <button
            type="button"
            disabled={disabled}
            onClick={() => onSelect(prompt)}
            className={cn(
              "flex w-full items-center gap-3 rounded-xl border bg-card text-left transition-colors hover:bg-muted/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-60",
              compact ? "px-3 py-2" : "px-4 py-3",
            )}
          >
            <span
              aria-hidden="true"
              className="grid size-8 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary"
            >
              <Icon className="size-4" />
            </span>
            <span className="min-w-0 text-sm font-medium">{label}</span>
          </button>
        </li>
      ))}
    </ul>
  );
}
