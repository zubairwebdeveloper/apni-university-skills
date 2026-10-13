"use client";

import Link from "next/link";
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from "framer-motion";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

function TiltLink({ href, active, label, count, index }) {
  const reduce = useReducedMotion();
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [6, -6]), {
    stiffness: 220,
    damping: 22,
  });
  const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-6, 6]), {
    stiffness: 220,
    damping: 22,
  });

  function move(e) {
    if (reduce || e.pointerType === "touch") return;
    const r = e.currentTarget.getBoundingClientRect();
    x.set((e.clientX - r.left) / r.width - 0.5);
    y.set((e.clientY - r.top) / r.height - 0.5);
  }

  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: reduce ? 0 : index * 0.06 }}
      style={{
        rotateX: reduce ? 0 : rotateX,
        rotateY: reduce ? 0 : rotateY,
        transformPerspective: 900,
        transformStyle: "preserve-3d",
      }}
      onPointerMove={move}
      onPointerLeave={() => {
        x.set(0);
        y.set(0);
      }}
    >
      <Link
        href={href}
        aria-current={active ? "true" : undefined}
        className="block rounded-xl outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
      >
        <Card
          className={cn(
            "gap-1 p-4 transition-shadow hover:shadow-lg",
            active && "border-primary bg-primary/5",
          )}
        >
          <span
            className="text-2xl font-semibold tabular-nums"
            style={{ transform: "translateZ(20px)" }}
          >
            {Number(count ?? 0).toLocaleString()}
          </span>
          <span className="text-sm text-muted-foreground">{label}</span>
        </Card>
      </Link>
    </motion.div>
  );
}

/**
 * items: [{ key, label, count, href, active }]
 * Each card links to the list filtered by that status.
 */
export function StatusSummaryCards({ items, ariaLabel = "Summary" }) {
  return (
    <nav
      aria-label={ariaLabel}
      className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4"
    >
      {items.map(({ key, ...rest }, i) => (
        <TiltLink key={key} index={i} {...rest} />
      ))}
    </nav>
  );
}
