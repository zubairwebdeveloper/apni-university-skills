"use client";

import { motion, useReducedMotion } from "framer-motion";

const RINGS = [
  { size: 520, rx: 68, dur: 38, o: 0.35 },
  { size: 380, rx: 72, dur: 28, o: 0.5 },
  { size: 240, rx: 64, dur: 20, o: 0.7 },
];

export function LearningBackdrop() {
  const reduce = useReducedMotion();

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
    >
      {/* soft ambient light */}
      <div className="absolute -top-40 left-1/2 h-[480px] w-[900px] -translate-x-1/2 rounded-full bg-primary/10 blur-3xl dark:bg-primary/15" />
      <div className="absolute -right-24 top-1/3 h-72 w-72 rounded-full bg-amber-400/10 blur-3xl" />

      {/* fine grid fading out toward the bottom */}
      <div
        className="absolute inset-0 opacity-[0.35] dark:opacity-[0.25]"
        style={{
          backgroundImage:
            "linear-gradient(to right, hsl(var(--border)) 1px, transparent 1px), linear-gradient(to bottom, hsl(var(--border)) 1px, transparent 1px)",
          backgroundSize: "56px 56px",
          maskImage:
            "radial-gradient(ellipse 70% 60% at 50% 0%, #000 30%, transparent 75%)",
          WebkitMaskImage:
            "radial-gradient(ellipse 70% 60% at 50% 0%, #000 30%, transparent 75%)",
        }}
      />

      {/* orbital rings: hidden on small screens for performance */}
      <div
        className="absolute right-[-120px] top-[-60px] hidden h-[520px] w-[520px] md:block lg:right-[4%]"
        style={{ perspective: 1100 }}
      >
        <div className="relative h-full w-full [transform-style:preserve-3d]">
          {RINGS.map((r, i) => (
            <motion.div
              key={r.size}
              className="absolute left-1/2 top-1/2 rounded-full border border-primary/40"
              style={{
                width: r.size,
                height: r.size,
                marginLeft: -r.size / 2,
                marginTop: -r.size / 2,
                opacity: r.o,
                rotateX: r.rx,
                boxShadow: "0 0 24px hsl(var(--primary) / 0.15)",
              }}
              animate={reduce ? undefined : { rotateZ: i % 2 ? -360 : 360 }}
              transition={{ duration: r.dur, ease: "linear", repeat: Infinity }}
            />
          ))}
          {/* core */}
          <motion.div
            className="absolute left-1/2 top-1/2 h-16 w-16 -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-gradient-to-br from-primary to-sky-400 shadow-[0_0_60px_hsl(var(--primary)/0.45)]"
            animate={
              reduce ? undefined : { rotateY: 360, rotateX: [20, 40, 20] }
            }
            transition={{ duration: 18, ease: "linear", repeat: Infinity }}
          />
          {/* yellow node on the orbit */}
          <motion.div
            className="absolute left-1/2 top-1/2 h-3 w-3 rounded-full bg-amber-400 shadow-[0_0_14px_#F5B82E]"
            style={{ marginLeft: -6, marginTop: -6 }}
            animate={
              reduce
                ? undefined
                : { x: [190, 0, -190, 0, 190], y: [0, 70, 0, -70, 0] }
            }
            transition={{ duration: 14, ease: "linear", repeat: Infinity }}
          />
        </div>
      </div>
    </div>
  );
}
