"use client";

import {
  MotionConfig,
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
} from "framer-motion";
import { FiAlertTriangle, FiArrowRight } from "react-icons/fi";
import { cn } from "@/lib/utils";

/* Respects the OS "reduce motion" setting for every motion child below */
export function MotionRoot({ children }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}

/* Ambient glow + faint grid + a tilted shield-orbit scene (md and up only) */
export function SettingsBackdrop() {
  const reduce = useReducedMotion();
  const rings = [
    { size: 420, dur: 44, tone: "border-primary/15" },
    { size: 300, dur: 30, tone: "border-primary/25" },
    { size: 180, dur: 20, tone: "border-primary/45" },
  ];

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
    >
      <div className="absolute -top-40 left-1/2 h-[380px] w-[760px] -translate-x-1/2 rounded-full bg-primary/10 blur-3xl dark:bg-primary/15" />
      <div
        className="absolute inset-0 opacity-[0.3] dark:opacity-[0.2]"
        style={{
          backgroundImage:
            "linear-gradient(to right, hsl(var(--border)) 1px, transparent 1px), linear-gradient(to bottom, hsl(var(--border)) 1px, transparent 1px)",
          backgroundSize: "56px 56px",
          maskImage:
            "radial-gradient(ellipse 70% 45% at 50% 0%, #000 25%, transparent 75%)",
          WebkitMaskImage:
            "radial-gradient(ellipse 70% 45% at 50% 0%, #000 25%, transparent 75%)",
        }}
      />

      <div
        className="absolute right-[-170px] top-[-90px] hidden h-[420px] w-[420px] opacity-70 md:block lg:right-[1%]"
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
                : { x: [150, 0, -150, 0, 150], y: [0, 56, 0, -56, 0] }
            }
            transition={{ duration: 12, ease: "linear", repeat: Infinity }}
          />
        </div>
      </div>
    </div>
  );
}

/* Gentle pointer tilt. Mouse only, off for reduced motion.
   Use for display cards only; never wrap forms or inputs. */
export function TiltCard({ children, className, max = 3 }) {
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

/* Shown only when the account email is not verified */
export function VerifyBanner({ email }) {
  const reduce = useReducedMotion();

  return (
    <motion.div
      role="status"
      initial={reduce ? false : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: reduce ? 0 : 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="flex flex-col gap-4 rounded-2xl border border-primary/30 bg-primary/5 p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:p-5"
    >
      <div className="flex min-w-0 items-start gap-3">
        <span
          aria-hidden="true"
          className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary"
        >
          <FiAlertTriangle className="size-5" />
        </span>
        <div className="min-w-0 space-y-0.5">
          <p className="text-sm font-semibold text-foreground sm:text-base">
            Verify your email to secure your account
          </p>
          <p className="break-words text-sm leading-relaxed text-muted-foreground">
            <span className="font-medium text-foreground">{email}</span> is not
            verified yet. Verified emails get receipts and account alerts
            reliably.
          </p>
        </div>
      </div>
      <a
        href="#email"
        className="group inline-flex min-h-10 shrink-0 items-center gap-1.5 self-start rounded-md text-sm font-medium text-primary underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background sm:self-center"
      >
        Verify now
        <FiArrowRight
          aria-hidden="true"
          className="size-4 transition-transform group-hover:translate-x-1 motion-reduce:transition-none motion-reduce:group-hover:translate-x-0"
        />
      </a>
    </motion.div>
  );
}
