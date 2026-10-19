"use client";

import { useEffect, useState } from "react";
import {
  MotionConfig,
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
} from "framer-motion";
import { cn } from "@/lib/utils";

/* Respects the OS "reduce motion" setting for every motion child below */
export function MotionRoot({ children }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}

/* Ambient background + a tilted orbit scene (md and up only, for performance) */
export function ProfileBackdrop() {
  const reduce = useReducedMotion();
  const rings = [
    { size: 460, dur: 40, tone: "border-primary/20" },
    { size: 330, dur: 28, tone: "border-primary/30" },
    { size: 200, dur: 18, tone: "border-primary/50" },
  ];

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
    >
      <div className="absolute -top-40 left-1/3 h-[380px] w-[720px] -translate-x-1/2 rounded-full bg-primary/10 blur-3xl dark:bg-primary/15" />

      <div
        className="absolute inset-0 opacity-[0.35] dark:opacity-[0.22]"
        style={{
          backgroundImage:
            "radial-gradient(hsl(var(--border)) 1px, transparent 1px)",
          backgroundSize: "26px 26px",
          maskImage:
            "radial-gradient(ellipse 70% 50% at 50% 0%, #000 25%, transparent 75%)",
          WebkitMaskImage:
            "radial-gradient(ellipse 70% 50% at 50% 0%, #000 25%, transparent 75%)",
        }}
      />

      <div
        className="absolute right-[-140px] top-[-80px] hidden h-[460px] w-[460px] md:block lg:right-[3%]"
        style={{ perspective: 1000 }}
      >
        <div className="relative h-full w-full [transform-style:preserve-3d]">
          {rings.map((r, i) => (
            <motion.div
              key={r.size}
              className={cn(
                "absolute left-1/2 top-1/2 rounded-full border",
                r.tone,
              )}
              style={{
                width: r.size,
                height: r.size,
                marginLeft: -r.size / 2,
                marginTop: -r.size / 2,
                rotateX: 66,
              }}
              animate={reduce ? undefined : { rotate: i % 2 ? -360 : 360 }}
              transition={{ duration: r.dur, ease: "linear", repeat: Infinity }}
            />
          ))}
          <motion.span
            className="absolute left-1/2 top-1/2 -ml-1.5 -mt-1.5 size-3 rounded-full bg-amber-400 shadow-[0_0_14px_#F5B82E]"
            animate={
              reduce
                ? undefined
                : {
                    x: [165, 0, -165, 0, 165],
                    y: [0, 62, 0, -62, 0],
                  }
            }
            transition={{ duration: 12, ease: "linear", repeat: Infinity }}
          />
        </div>
      </div>
    </div>
  );
}

/* Gentle pointer tilt for display cards. Mouse only; off for reduced motion.
   Do not wrap forms or inputs with it. */
export function TiltCard({ children, className, max = 4 }) {
  const reduce = useReducedMotion();
  const rx = useMotionValue(0);
  const ry = useMotionValue(0);
  const sx = useSpring(rx, { stiffness: 140, damping: 18 });
  const sy = useSpring(ry, { stiffness: 140, damping: 18 });

  const onMove = (e) => {
    if (reduce || e.pointerType !== "mouse") return;
    const r = e.currentTarget.getBoundingClientRect();
    ry.set(((e.clientX - r.left) / r.width - 0.5) * max * 2);
    rx.set(-((e.clientY - r.top) / r.height - 0.5) * max * 2);
  };
  const reset = () => {
    rx.set(0);
    ry.set(0);
  };

  return (
    <div style={{ perspective: 900 }} className={className}>
      <motion.div
        onPointerMove={onMove}
        onPointerLeave={reset}
        style={{ rotateX: sx, rotateY: sy, transformStyle: "preserve-3d" }}
      >
        {children}
      </motion.div>
    </div>
  );
}

/* Jump links that highlight the section currently in view */
const SECTIONS = [
  { id: "profile-photo", label: "Photo" },
  { id: "profile-info", label: "Personal info" },
  { id: "profile-completion", label: "Completion" },
  { id: "profile-account", label: "Account" },
  { id: "profile-privacy", label: "Privacy" },
];

export function ProfileQuickNav() {
  const [active, setActive] = useState(SECTIONS[0].id);

  useEffect(() => {
    const els = SECTIONS.map((s) => document.getElementById(s.id)).filter(
      Boolean,
    );
    if (!els.length || !("IntersectionObserver" in window)) return;

    const io = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible) setActive(visible.target.id);
      },
      { rootMargin: "-20% 0px -55% 0px", threshold: [0, 0.25, 0.5, 1] },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  return (
    <nav
      aria-label="Profile sections"
      className="-mx-1 overflow-x-auto px-1 py-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
    >
      <ul className="flex w-max gap-2">
        {SECTIONS.map((s) => {
          const on = active === s.id;
          return (
            <li key={s.id}>
              <a
                href={`#${s.id}`}
                onClick={() => setActive(s.id)}
                aria-current={on ? "true" : undefined}
                className={cn(
                  "relative inline-flex min-h-9 items-center rounded-full border px-4 py-1.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background motion-reduce:transition-none",
                  on
                    ? "border-primary text-primary-foreground"
                    : "border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-primary",
                )}
              >
                {on && (
                  <motion.span
                    layoutId="profile-nav-pill"
                    className="absolute inset-0 rounded-full bg-primary"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
                <span className="relative z-10">{s.label}</span>
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
