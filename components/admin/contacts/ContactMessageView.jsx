"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import {
  Check,
  Clock,
  Copy,
  Hash,
  Mail,
  Reply,
  TriangleAlert,
  User,
} from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

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

function countWords(text) {
  return String(text ?? "")
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;
}

/* Clipboard hook: "idle" | "copied" | "failed" (resets itself) */
function useCopy() {
  const [state, setState] = useState("idle");
  const timer = useRef(null);

  // Clear the pending reset so we never set state after unmount
  useEffect(() => () => clearTimeout(timer.current), []);

  const copy = useCallback(async (value) => {
    clearTimeout(timer.current);
    try {
      await navigator.clipboard.writeText(value);
      setState("copied");
    } catch {
      setState("failed");
    }
    timer.current = setTimeout(() => setState("idle"), 1800);
  }, []);

  return [state, copy];
}

function IconCopyButton({ value, label }) {
  const [state, copy] = useCopy();

  return (
    <>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="size-8 shrink-0 text-muted-foreground hover:text-foreground"
        onClick={() => copy(value)}
        aria-label={`Copy ${label}`}
      >
        {state === "copied" ? (
          <Check
            className="size-4 text-emerald-600 dark:text-emerald-400"
            aria-hidden="true"
          />
        ) : state === "failed" ? (
          <TriangleAlert
            className="size-4 text-amber-600 dark:text-amber-400"
            aria-hidden="true"
          />
        ) : (
          <Copy className="size-4" aria-hidden="true" />
        )}
      </Button>
      <span role="status" className="sr-only">
        {state === "copied"
          ? `${label} copied`
          : state === "failed"
            ? `Couldn't copy ${label}`
            : ""}
      </span>
    </>
  );
}

function MessageCopyButton({ value }) {
  const [state, copy] = useCopy();

  return (
    <>
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="gap-2"
        onClick={() => copy(value)}
      >
        {state === "copied" ? (
          <Check
            className="size-4 text-emerald-600 dark:text-emerald-400"
            aria-hidden="true"
          />
        ) : state === "failed" ? (
          <TriangleAlert
            className="size-4 text-amber-600 dark:text-amber-400"
            aria-hidden="true"
          />
        ) : (
          <Copy className="size-4" aria-hidden="true" />
        )}
        {state === "copied"
          ? "Copied"
          : state === "failed"
            ? "Couldn't copy"
            : "Copy message"}
      </Button>
      <span role="status" className="sr-only">
        {state === "copied"
          ? "Message copied"
          : state === "failed"
            ? "Couldn't copy the message"
            : ""}
      </span>
    </>
  );
}

function DetailRow({ icon: Icon, label, action, children }) {
  return (
    <div className="flex items-start gap-3">
      <span
        aria-hidden="true"
        className="grid size-8 shrink-0 place-items-center rounded-lg bg-muted text-muted-foreground"
      >
        <Icon className="size-4" />
      </span>
      <div className="min-w-0 flex-1 pt-0.5">
        <dt className="text-xs font-medium text-muted-foreground">{label}</dt>
        <dd className="mt-0.5 text-sm text-foreground">{children}</dd>
      </div>
      {action}
    </div>
  );
}

export function ContactMessageView({ name, email, message, slug, receivedAt }) {
  const reduce = useReducedMotion();
  const mailto = `mailto:${email}?subject=${encodeURIComponent(
    `Re: Your message (${slug})`,
  )}`;
  const text = String(message ?? "");
  const words = countWords(text);

  // One calm entrance for the two columns; none when reduced motion is on
  const reveal = (delay) =>
    reduce
      ? {}
      : {
          initial: { opacity: 0, y: 12 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.4, delay, ease: [0.22, 1, 0.36, 1] },
        };

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
      <motion.div className="min-w-0" {...reveal(0)}>
        <Card className="gap-0 overflow-hidden p-0 shadow-sm">
          {/* Sender */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-3 border-b p-5 sm:px-8 sm:py-6">
            <span
              className="grid size-12 shrink-0 place-items-center rounded-full bg-primary/10 text-base font-semibold text-primary ring-1 ring-primary/20"
              aria-hidden="true"
            >
              {initials(name)}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-base font-semibold leading-snug tracking-tight">
                {name}
              </p>
              <p className="truncate text-sm text-muted-foreground">{email}</p>
            </div>
          </div>

          {/* Message */}
          <div className="space-y-4 p-5 sm:p-8">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span
                  aria-hidden="true"
                  className="h-4 w-1 rounded-full bg-[#FACC15]"
                />
                <h2 className="text-sm font-semibold tracking-tight">
                  Message
                </h2>
              </div>
              {words > 0 && (
                <p className="text-xs tabular-nums text-muted-foreground">
                  {words} {words === 1 ? "word" : "words"}
                </p>
              )}
            </div>

            <div className="rounded-xl border bg-muted/30 p-4 sm:p-6">
              {text.trim() ? (
                <p className="max-w-[68ch] whitespace-pre-line text-[15px] leading-7 text-foreground [overflow-wrap:anywhere]">
                  {text}
                </p>
              ) : (
                <p className="text-sm italic text-muted-foreground">
                  This message has no content.
                </p>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap items-center gap-2 border-t bg-muted/30 px-5 py-4 sm:px-8">
            <a
              href={mailto}
              className={cn(buttonVariants({ size: "sm" }), "gap-2")}
            >
              <Reply className="size-4" aria-hidden="true" />
              Reply by email
            </a>
            {text.trim() && <MessageCopyButton value={text} />}
            <p className="w-full text-xs text-muted-foreground sm:ml-auto sm:w-auto">
              Received {receivedAt}
            </p>
          </div>
        </Card>
      </motion.div>

      <motion.aside
        aria-label="Message details"
        className="min-w-0 lg:sticky lg:top-6 lg:self-start"
        {...reveal(0.08)}
      >
        <Card className="gap-5 p-5 shadow-sm">
          <h2 className="text-sm font-semibold tracking-tight">Details</h2>
          <dl className="space-y-4">
            <DetailRow
              icon={User}
              label="Name"
              action={
                <IconCopyButton value={String(name ?? "")} label="name" />
              }
            >
              <span className="break-words">{name}</span>
            </DetailRow>
            <DetailRow
              icon={Mail}
              label="Email"
              action={<IconCopyButton value={email} label="email" />}
            >
              <span className="break-all">{email}</span>
            </DetailRow>
            <DetailRow
              icon={Hash}
              label="Reference"
              action={<IconCopyButton value={slug} label="reference" />}
            >
              <span className="break-all font-mono text-[13px]">{slug}</span>
            </DetailRow>
            <DetailRow icon={Clock} label="Received">
              {receivedAt}
            </DetailRow>
          </dl>
          <p className="rounded-lg border bg-muted/40 p-3 text-xs leading-relaxed text-muted-foreground">
            After replying from your mail app, mark the message as replied from
            the actions menu.
          </p>
        </Card>
      </motion.aside>
    </div>
  );
}
