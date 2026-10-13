"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Bell } from "lucide-react";

const CARDS = [
  { x: 0, y: 0, z: 0, rot: -8, delay: 0, w: 220 },
  { x: 70, y: 86, z: -80, rot: 6, delay: 0.8, w: 200 },
  { x: -40, y: 170, z: -160, rot: -4, delay: 1.6, w: 180 },
];

export function NotificationsBackdrop() {
  const reduce = useReducedMotion();

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
    >
      <div className="absolute -top-32 left-1/3 h-[420px] w-[760px] -translate-x-1/2 rounded-full bg-primary/10 blur-3xl dark:bg-primary/15" />
      <div className="absolute right-0 top-10 h-64 w-64 rounded-full bg-amber-400/10 blur-3xl" />

      {/* dotted grid, fades toward the bottom */}
      <div
        className="absolute inset-0 opacity-[0.4] dark:opacity-[0.25]"
        style={{
          backgroundImage:
            "radial-gradient(hsl(var(--border)) 1px, transparent 1px)",
          backgroundSize: "26px 26px",
          maskImage:
            "radial-gradient(ellipse 70% 55% at 50% 0%, #000 25%, transparent 75%)",
          WebkitMaskImage:
            "radial-gradient(ellipse 70% 55% at 50% 0%, #000 25%, transparent 75%)",
        }}
      />

      {/* 3D stack of floating notification cards (md and up only) */}
      <div
        className="absolute right-[2%] top-2 hidden h-[330px] w-[300px] md:block"
        style={{ perspective: 900 }}
      >
        <div
          className="relative h-full w-full"
          style={{
            transformStyle: "preserve-3d",
            transform: "rotateX(52deg) rotateZ(-24deg)",
          }}
        >
          {CARDS.map((c, i) => (
            <motion.div
              key={i}
              className="absolute flex items-center gap-3 rounded-xl border border-border bg-card/80 p-3 shadow-lg backdrop-blur"
              style={{
                width: c.w,
                left: c.x,
                top: c.y,
                translateZ: c.z,
                rotate: c.rot,
                opacity: 1 - i * 0.22,
              }}
              animate={reduce ? undefined : { y: [0, -14, 0] }}
              transition={{
                duration: 6,
                delay: c.delay,
                ease: "easeInOut",
                repeat: Infinity,
              }}
            >
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-primary/15 text-primary">
                <Bell className="h-4 w-4" />
              </span>
              <span className="flex-1 space-y-1.5">
                <span className="block h-2 w-3/4 rounded bg-foreground/20" />
                <span className="block h-2 w-1/2 rounded bg-muted-foreground/25" />
              </span>
              {i === 0 && (
                <span className="h-2.5 w-2.5 rounded-full bg-amber-400 shadow-[0_0_10px_#F5B82E]" />
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
