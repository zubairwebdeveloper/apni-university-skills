"use client";

import { useEffect, useRef, useState } from "react";
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from "framer-motion";
import { Check, Copy, Ticket } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export function CouponTicket({ code, updatedAt, children }) {
  const reduce = useReducedMotion();
  const [copied, setCopied] = useState(false);
  const timer = useRef(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [4, -4]), {
    stiffness: 180,
    damping: 24,
  });
  const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-6, 6]), {
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
      await navigator.clipboard.writeText(code);
      setCopied(true);
      clearTimeout(timer.current);
      timer.current = setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  }

  return (
    <motion.div
      className="mb-6 max-w-3xl"
      initial={reduce ? false : { opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
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
      <Card className="flex-col items-stretch gap-0 overflow-hidden p-0 shadow-sm sm:flex-row">
        <div className="flex min-w-0 items-center gap-4 bg-primary/5 p-5 sm:p-6">
          <span
            className="grid size-12 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary ring-1 ring-primary/20"
            style={{ transform: "translateZ(26px)" }}
            aria-hidden="true"
          >
            <Ticket className="size-6" />
          </span>
          <div className="min-w-0">
            <p className="flex items-center gap-2 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
              <span
                aria-hidden="true"
                className="h-3.5 w-1 rounded-full bg-[#FACC15]"
              />
              Coupon code
            </p>
            <p
              className="mt-1 break-all font-mono text-xl font-semibold tracking-wider sm:text-2xl"
              style={{ transform: "translateZ(14px)" }}
            >
              {code}
            </p>
          </div>
        </div>

        {/* perforated divider, like a ticket stub (horizontal on mobile, vertical on sm+) */}
        <div
          className="mx-4 border-t border-dashed border-border sm:mx-0 sm:my-3 sm:w-px sm:self-stretch sm:border-l sm:border-t-0"
          aria-hidden="true"
        />

        <div className="flex min-w-0 flex-1 flex-wrap items-center justify-between gap-3 p-5 sm:p-6">
          <div className="flex min-w-0 flex-col gap-1 text-sm">
            {children}
            {updatedAt && (
              <span className="text-xs text-muted-foreground">
                Last updated {updatedAt}
              </span>
            )}
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={copy}
            aria-label={`Copy code ${code}`}
          >
            {copied ? (
              <Check
                className="text-emerald-600 dark:text-emerald-400"
                aria-hidden="true"
              />
            ) : (
              <Copy aria-hidden="true" />
            )}
            {copied ? "Copied" : "Copy code"}
          </Button>
          <span role="status" className="sr-only">
            {copied ? `${code} copied` : ""}
          </span>
        </div>
      </Card>
    </motion.div>
  );
}
