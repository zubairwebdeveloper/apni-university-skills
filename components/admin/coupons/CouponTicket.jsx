"use client";

import { useState } from "react";
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
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [5, -5]), {
    stiffness: 180,
    damping: 24,
  });
  const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-7, 7]), {
    stiffness: 180,
    damping: 24,
  });

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
      setTimeout(() => setCopied(false), 1600);
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
      <Card className="flex-row items-stretch gap-0 overflow-hidden p-0">
        <div className="flex items-center gap-4 p-5 sm:p-6">
          <span
            className="flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary"
            style={{ transform: "translateZ(26px)" }}
            aria-hidden="true"
          >
            <Ticket className="size-6" />
          </span>
          <div className="min-w-0">
            <p className="text-xs text-muted-foreground">Coupon code</p>
            <p
              className="break-all font-mono text-xl font-semibold tracking-wider"
              style={{ transform: "translateZ(14px)" }}
            >
              {code}
            </p>
          </div>
        </div>

        {/* perforated divider, like a ticket stub */}
        <div
          className="my-3 w-px self-stretch border-l border-dashed border-border"
          aria-hidden="true"
        />

        <div className="flex flex-1 flex-wrap items-center justify-between gap-3 p-5 sm:p-6">
          <div className="flex flex-col gap-1 text-sm">
            {children}
            {updatedAt && (
              <span className="text-xs text-muted-foreground">
                Last updated {updatedAt}
              </span>
            )}
          </div>
          <Button type="button" variant="outline" size="sm" onClick={copy}>
            {copied ? (
              <Check className="text-emerald-600 dark:text-emerald-400" />
            ) : (
              <Copy />
            )}
            {copied ? "Copied" : "Copy code"}
          </Button>
        </div>
      </Card>
    </motion.div>
  );
}
