"use client";

import { useState } from "react";
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from "framer-motion";
import { Check, Clock, Copy, Hash, Mail } from "lucide-react";
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

function CopyButton({ value, label }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  }

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      className="size-8 shrink-0"
      onClick={copy}
      aria-label={copied ? `${label} copied` : `Copy ${label}`}
    >
      {copied ? (
        <Check className="size-4 text-emerald-600 dark:text-emerald-400" />
      ) : (
        <Copy className="size-4" />
      )}
    </Button>
  );
}

function Tilt({ children, max = 5, className }) {
  const reduce = useReducedMotion();
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [max, -max]), {
    stiffness: 180,
    damping: 24,
  });
  const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-max, max]), {
    stiffness: 180,
    damping: 24,
  });

  function move(e) {
    if (reduce || e.pointerType === "touch") return;
    const r = e.currentTarget.getBoundingClientRect();
    x.set((e.clientX - r.left) / r.width - 0.5);
    y.set((e.clientY - r.top) / r.height - 0.5);
  }

  return (
    <motion.div
      className={className}
      initial={reduce ? false : { opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      style={{
        rotateX: reduce ? 0 : rotateX,
        rotateY: reduce ? 0 : rotateY,
        transformPerspective: 1100,
        transformStyle: "preserve-3d",
      }}
      onPointerMove={move}
      onPointerLeave={() => {
        x.set(0);
        y.set(0);
      }}
    >
      {children}
    </motion.div>
  );
}

export function ContactMessageView({ name, email, message, slug, receivedAt }) {
  const reduce = useReducedMotion();

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
      <Tilt>
        <Card className="gap-5 p-6 sm:p-8">
          <div className="flex items-center gap-3">
            <span
              className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-base font-semibold text-primary"
              style={{ transform: "translateZ(28px)" }}
              aria-hidden="true"
            >
              {initials(name)}
            </span>
            <div className="min-w-0">
              <p className="truncate font-medium">{name}</p>
              <p className="truncate text-sm text-muted-foreground">{email}</p>
            </div>
          </div>
          <p
            className="whitespace-pre-line text-[0.95rem] leading-relaxed"
            style={{ transform: "translateZ(10px)" }}
          >
            {message}
          </p>
        </Card>
      </Tilt>

      <motion.aside
        aria-label="Message details"
        initial={reduce ? false : { opacity: 0, x: 18 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: reduce ? 0 : 0.12 }}
      >
        <Card className="gap-4 p-5">
          <h2 className="text-sm font-semibold">Details</h2>
          <dl className="space-y-4 text-sm">
            <div className="flex items-start gap-3">
              <Mail className="mt-0.5 size-4 text-muted-foreground" />
              <div className="min-w-0 flex-1">
                <dt className="text-xs text-muted-foreground">Email</dt>
                <dd className="break-all">{email}</dd>
              </div>
              <CopyButton value={email} label="email" />
            </div>
            <div className="flex items-start gap-3">
              <Hash className="mt-0.5 size-4 text-muted-foreground" />
              <div className="min-w-0 flex-1">
                <dt className="text-xs text-muted-foreground">Reference</dt>
                <dd className="break-all font-mono">{slug}</dd>
              </div>
              <CopyButton value={slug} label="reference" />
            </div>
            <div className="flex items-start gap-3">
              <Clock className="mt-0.5 size-4 text-muted-foreground" />
              <div>
                <dt className="text-xs text-muted-foreground">Received</dt>
                <dd>{receivedAt}</dd>
              </div>
            </div>
          </dl>
          <p className="border-t pt-4 text-xs leading-relaxed text-muted-foreground">
            After replying from your mail app, mark it as replied from the
            actions menu.
          </p>
        </Card>
      </motion.aside>
    </div>
  );
}
