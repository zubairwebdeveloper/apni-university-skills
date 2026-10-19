"use client";

import { useEffect, useRef, useState } from "react";
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from "framer-motion";
import { Check, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

function initials(name) {
  const parts = String(name ?? "")
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (!parts.length) return "?";
  return (
    parts[0][0] + (parts.length > 1 ? parts[parts.length - 1][0] : "")
  ).toUpperCase();
}

/**
 * Compact identity card for an edit page: initials avatar, name, slug with
 * copy button, last-updated text and any badge passed as children.
 */
export function RecordIdentityCard({ name, slug, updatedAt, children }) {
  const reduce = useReducedMotion();
  const [copied, setCopied] = useState(false);
  const timer = useRef(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [3, -3]), {
    stiffness: 180,
    damping: 24,
  });
  const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-5, 5]), {
    stiffness: 180,
    damping: 24,
  });

  // Clear the pending reset so state is never set after unmount
  useEffect(() => () => clearTimeout(timer.current), []);

  function move(e) {
    if (reduce || e.pointerType === "touch") return;
    const r = e.currentTarget.getBoundingClientRect();
    x.set((e.clientX - r.left) / r.width - 0.5);
    y.set((e.clientY - r.top) / r.height - 0.5);
  }

  async function copy() {
    try {
      await navigator.clipboard.writeText(slug);
      setCopied(true);
      clearTimeout(timer.current);
      timer.current = setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  }

  return (
    <motion.div
      className="mb-6 max-w-3xl"
      initial={reduce ? false : { opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      style={{
        rotateX: reduce ? 0 : rotateX,
        rotateY: reduce ? 0 : rotateY,
        transformPerspective: 1000,
        transformStyle: "preserve-3d",
      }}
      onPointerMove={move}
      onPointerLeave={() => {
        x.set(0);
        y.set(0);
      }}
    >
      <Card className="flex-row flex-wrap items-center gap-4 p-5 shadow-sm sm:p-6">
        <span
          className="grid size-14 shrink-0 place-items-center rounded-full bg-primary/10 text-lg font-semibold text-primary ring-1 ring-primary/20"
          style={{ transform: "translateZ(26px)" }}
          aria-hidden="true"
        >
          {initials(name)}
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-lg font-semibold leading-snug tracking-tight">
            {name}
          </p>
          <div className="mt-0.5 flex min-w-0 items-center gap-1">
            <span className="min-w-0 truncate rounded-md border border-dashed bg-muted/40 px-2 py-0.5 font-mono text-xs text-muted-foreground">
              {slug}
            </span>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="size-7 shrink-0 text-muted-foreground hover:text-foreground"
              onClick={copy}
              aria-label="Copy slug"
            >
              {copied ? (
                <Check
                  className="size-3.5 text-emerald-600 dark:text-emerald-400"
                  aria-hidden="true"
                />
              ) : (
                <Copy className="size-3.5" aria-hidden="true" />
              )}
            </Button>
            <span role="status" className="sr-only">
              {copied ? "Slug copied" : ""}
            </span>
          </div>
          {updatedAt && (
            <p className="mt-1.5 flex items-center gap-2 text-xs text-muted-foreground">
              <span
                aria-hidden="true"
                className="h-3 w-1 shrink-0 rounded-full bg-[#FACC15]"
              />
              Last updated {updatedAt}
            </p>
          )}
        </div>
        {children}
      </Card>
    </motion.div>
  );
}
