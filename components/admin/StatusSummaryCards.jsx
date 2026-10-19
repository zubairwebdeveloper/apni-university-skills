"use client";

import Link from "next/link";
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from "framer-motion";
import { Check } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

// Optional semantic accents. A card only picks one of these up if the
// caller passes a matching `tone` — otherwise it stays neutral and
// inherits the app's existing primary/border tokens.
const TONE_STYLES = {
  neutral: {
    chip: "bg-muted text-muted-foreground",
    ring: "border-primary bg-primary/5",
    dot: "bg-primary",
  },
  success: {
    chip: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    ring: "border-emerald-500/60 bg-emerald-500/5",
    dot: "bg-emerald-500",
  },
  warning: {
    chip: "bg-amber-400/15 text-amber-600 dark:text-amber-400",
    ring: "border-amber-400/60 bg-amber-400/5",
    dot: "bg-amber-400",
  },
  danger: {
    chip: "bg-red-500/10 text-red-600 dark:text-red-400",
    ring: "border-red-500/60 bg-red-500/5",
    dot: "bg-red-500",
  },
  info: {
    chip: "bg-violet-500/10 text-violet-600 dark:text-violet-400",
    ring: "border-violet-500/60 bg-violet-500/5",
    dot: "bg-violet-500",
  },
};

function TiltLink({
  href,
  active,
  label,
  count,
  index,
  icon: Icon,
  tone = "neutral",
}) {
  const reduce = useReducedMotion();
  const tones = TONE_STYLES[tone] ?? TONE_STYLES.neutral;

  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [5, -5]), {
    stiffness: 240,
    damping: 24,
  });
  const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-5, 5]), {
    stiffness: 240,
    damping: 24,
  });

  function move(e) {
    if (reduce || e.pointerType === "touch") return;
    const r = e.currentTarget.getBoundingClientRect();
    x.set((e.clientX - r.left) / r.width - 0.5);
    y.set((e.clientY - r.top) / r.height - 0.5);
  }

  function reset() {
    x.set(0);
    y.set(0);
  }

  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: reduce ? 0 : index * 0.05 }}
      style={{
        rotateX: reduce ? 0 : rotateX,
        rotateY: reduce ? 0 : rotateY,
        transformPerspective: 900,
        transformStyle: "preserve-3d",
      }}
      onPointerMove={move}
      onPointerLeave={reset}
    >
      <Link
        href={href}
        aria-current={active ? "true" : undefined}
        className="group block rounded-xl outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
      >
        <Card
          className={cn(
            "relative gap-2.5 overflow-hidden p-4 transition-all duration-200",
            "hover:border-primary/40 hover:shadow-md",
            active && tones.ring,
          )}
        >
          <div
            className="flex items-center justify-between"
            style={{ transform: "translateZ(16px)" }}
          >
            {Icon ? (
              <span
                className={cn(
                  "flex size-7 items-center justify-center rounded-md",
                  tones.chip,
                )}
              >
                <Icon className="size-4" strokeWidth={2} />
              </span>
            ) : (
              <span className={cn("size-1.5 rounded-full", tones.dot)} />
            )}

            {active && (
              <span className="flex size-5 items-center justify-center rounded-full bg-primary text-primary-foreground">
                <Check className="size-3" strokeWidth={3} />
              </span>
            )}
          </div>

          <div style={{ transform: "translateZ(12px)" }}>
            <span className="block text-[1.75rem] font-semibold leading-none tabular-nums tracking-tight">
              {Number(count ?? 0).toLocaleString()}
            </span>
            <span className="mt-1.5 block text-sm text-muted-foreground">
              {label}
            </span>
          </div>
        </Card>
      </Link>
    </motion.div>
  );
}

/**
 * items: [{ key, label, count, href, active, icon?, tone? }]
 * - icon: optional Lucide icon component rendered in a tinted chip.
 * - tone: optional "neutral" | "success" | "warning" | "danger" | "info",
 *   used only for the icon chip and the active-state border/dot.
 * Each card links to the list filtered by that status.
 */
export function StatusSummaryCards({ items, ariaLabel = "Summary" }) {
  return (
    <nav
      aria-label={ariaLabel}
      className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-6"
    >
      {items.map(({ key, ...rest }, i) => (
        <TiltLink key={key} index={i} {...rest} />
      ))}
    </nav>
  );
}
