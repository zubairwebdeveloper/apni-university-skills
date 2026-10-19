"use client";

import {
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from "framer-motion";
import { CalendarDays, Layers, Users, Wallet } from "lucide-react";
import { Card } from "@/components/ui/card";

function num(v) {
  if (v === "" || v == null) return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

function Rule({ icon: Icon, label, children }) {
  return (
    <li className="flex min-w-0 items-start gap-3">
      <span
        aria-hidden="true"
        className="grid size-8 shrink-0 place-items-center rounded-lg bg-muted text-muted-foreground"
      >
        <Icon className="size-4" />
      </span>
      <div className="min-w-0 pt-0.5">
        <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
          {label}
        </p>
        <p className="mt-0.5 text-sm leading-snug [overflow-wrap:anywhere]">
          {children}
        </p>
      </div>
    </li>
  );
}

/** Live summary of the coupon being edited. Pure display, reads form values. */
export function CouponPreview({ values }) {
  const reduce = useReducedMotion();
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

  function move(e) {
    if (reduce || e.pointerType === "touch") return;
    const r = e.currentTarget.getBoundingClientRect();
    x.set((e.clientX - r.left) / r.width - 0.5);
    y.set((e.clientY - r.top) / r.height - 0.5);
  }

  const value = num(values.value);
  const fixed = values.type === "fixed";
  const headline =
    value == null
      ? "—"
      : fixed
        ? `${value} ${values.currency} off`
        : `${value}% off`;

  const minPurchase = num(values.minPurchase);
  const maxDiscount = num(values.maxDiscount);
  const usageLimit = num(values.usageLimit);
  const perUser = num(values.perUserLimit);
  const courseCount = values.courseIds?.length ?? 0;
  const categoryCount = values.categoryIds?.length ?? 0;

  const scope =
    courseCount + categoryCount === 0
      ? "Every paid course"
      : [
          courseCount
            ? `${courseCount} course${courseCount > 1 ? "s" : ""}`
            : null,
          categoryCount
            ? `${categoryCount} categor${categoryCount > 1 ? "ies" : "y"}`
            : null,
        ]
          .filter(Boolean)
          .join(" + ");

  return (
    <motion.div
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
      <Card className="flex-col gap-0 overflow-hidden p-0 shadow-sm sm:flex-row">
        <div className="flex flex-col justify-center gap-2 bg-primary/5 p-6 sm:w-64 sm:shrink-0">
          <p className="flex items-center gap-2 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
            <span
              aria-hidden="true"
              className="h-3.5 w-1 rounded-full bg-[#FACC15]"
            />
            Live preview
          </p>
          <p
            className="text-3xl font-semibold leading-tight tracking-tight tabular-nums [overflow-wrap:anywhere]"
            style={{ transform: "translateZ(24px)" }}
            aria-live="polite"
            aria-atomic="true"
          >
            {headline}
          </p>
          <p className="w-fit max-w-full break-all rounded-md border border-dashed border-border bg-background/60 px-2.5 py-1 font-mono text-sm tracking-wider text-muted-foreground">
            {values.code || "—"}
          </p>
        </div>
        <div
          className="border-t border-dashed border-border sm:border-l sm:border-t-0"
          aria-hidden="true"
        />
        <ul className="grid min-w-0 flex-1 gap-5 p-6 sm:grid-cols-2">
          <Rule icon={Layers} label="Applies to">
            {scope}
          </Rule>
          <Rule icon={Wallet} label="Conditions">
            {minPurchase
              ? `Course price at least ${minPurchase}`
              : "No minimum purchase"}
            {!fixed && maxDiscount ? `, discount capped at ${maxDiscount}` : ""}
          </Rule>
          <Rule icon={Users} label="Usage">
            {usageLimit
              ? `${usageLimit} total ${usageLimit === 1 ? "use" : "uses"}`
              : "Unlimited total uses"}
            {perUser ? `, ${perUser} per student` : ""}
          </Rule>
          <Rule icon={CalendarDays} label="Validity">
            {values.startsAt ? `From ${values.startsAt}` : "Starts immediately"}
            {values.expiresAt ? `, until ${values.expiresAt}` : ", no expiry"}
          </Rule>
        </ul>
      </Card>
    </motion.div>
  );
}
