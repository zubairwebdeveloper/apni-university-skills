"use client";

import Link from "next/link";
import {
  MotionConfig,
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
} from "framer-motion";
import { Compass, Heart, Sparkles } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/* Respects the OS "reduce motion" setting for every motion child below */
export function MotionRoot({ children }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}

/* Ambient glow + dotted grid, no heavy animation */
export function WishlistBackdrop() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
    >
      <div className="absolute -top-40 left-1/2 h-[420px] w-[820px] -translate-x-1/2 rounded-full bg-primary/10 blur-3xl dark:bg-primary/15" />
      <div className="absolute -right-24 top-1/4 h-64 w-64 rounded-full bg-amber-400/15 blur-3xl" />
      <div
        className="absolute inset-0 opacity-[0.4] dark:opacity-[0.25]"
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
    </div>
  );
}

/* 3D heart plate: tilts with the pointer, rings orbit behind it */
function HeartScene({ filled }) {
  const reduce = useReducedMotion();
  const rx = useMotionValue(0);
  const ry = useMotionValue(0);
  const sx = useSpring(rx, { stiffness: 120, damping: 16 });
  const sy = useSpring(ry, { stiffness: 120, damping: 16 });

  const onMove = (e) => {
    if (reduce || e.pointerType !== "mouse") return;
    const r = e.currentTarget.getBoundingClientRect();
    ry.set(((e.clientX - r.left) / r.width - 0.5) * 30);
    rx.set(-((e.clientY - r.top) / r.height - 0.5) * 30);
  };
  const reset = () => {
    rx.set(0);
    ry.set(0);
  };

  const sparks = [
    { r: 84, dur: 13, delay: 0 },
    { r: 84, dur: 13, delay: -6.5 },
    { r: 60, dur: 9, delay: -3 },
  ];

  return (
    <div
      aria-hidden="true"
      onPointerMove={onMove}
      onPointerLeave={reset}
      className="relative mx-auto size-48 sm:size-56"
      style={{ perspective: 800 }}
    >
      <motion.div
        className="absolute inset-0"
        style={{ rotateX: sx, rotateY: sy, transformStyle: "preserve-3d" }}
      >
        <div
          className="absolute inset-4 rounded-full bg-primary/25 blur-2xl"
          style={{ transform: "translateZ(-50px)" }}
        />
        <div
          className="absolute inset-3 rounded-full border border-border bg-card shadow-lg"
          style={{ transform: "translateZ(0)" }}
        />

        {[0.92, 0.66].map((s, i) => (
          <motion.div
            key={s}
            className="absolute left-1/2 top-1/2 aspect-square -translate-x-1/2 -translate-y-1/2 rounded-full border border-primary/30"
            style={{
              width: `${s * 100}%`,
              rotateX: 66,
              translateZ: 10 + i * 10,
            }}
            animate={{ rotate: i % 2 ? -360 : 360 }}
            transition={{
              duration: 24 - i * 8,
              repeat: Infinity,
              ease: "linear",
            }}
          />
        ))}

        {/* heart on its own depth layer, with a soft beat */}
        <motion.div
          className="absolute inset-0 grid place-items-center"
          style={{ transform: "translateZ(46px)" }}
          animate={{ scale: [1, 1.08, 1] }}
          transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
        >
          <Heart
            className={cn(
              "size-16 sm:size-20",
              filled
                ? "fill-primary text-primary drop-shadow-[0_0_18px_hsl(var(--primary)/0.5)]"
                : "text-primary",
            )}
          />
        </motion.div>

        {sparks.map((o, i) => (
          <motion.div
            key={i}
            className="absolute left-1/2 top-1/2 size-0"
            style={{ transform: "translateZ(30px)" }}
            animate={{ rotate: 360 }}
            transition={{
              duration: o.dur,
              repeat: Infinity,
              ease: "linear",
              delay: o.delay,
            }}
          >
            <Sparkles
              className="absolute size-3.5 -translate-x-1/2 -translate-y-1/2 text-amber-500"
              style={{ left: o.r }}
            />
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}

/* Real data only: the hero knows just how many courses are saved */
export function WishlistHero({ count = 0 }) {
  const has = count > 0;

  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      className="relative overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-primary/10 via-card to-card p-5 sm:p-8"
    >
      <div className="grid items-center gap-8 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
        <div className="min-w-0">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background/70 px-3 py-1 text-xs font-medium text-muted-foreground">
            <Heart className="size-3.5 text-primary" aria-hidden="true" />
            Saved for later
          </span>

          <h2 className="mt-3 font-serif text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            {has
              ? `${count} course${count === 1 ? "" : "s"} on your wishlist`
              : "Start saving courses you love"}
          </h2>
          <p className="mt-2 max-w-xl text-sm text-muted-foreground sm:text-base">
            {has
              ? "Revisit them any time and start learning when you're ready."
              : "Tap the heart on any course and it will wait for you here."}
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/courses" className={cn(buttonVariants(), "group")}>
              <Compass className="mr-1.5 size-4" aria-hidden="true" />
              Browse more courses
            </Link>
            {has && (
              <a
                href="#saved-courses"
                className={buttonVariants({ variant: "outline" })}
              >
                View saved courses
              </a>
            )}
          </div>
        </div>

        <div className="hidden sm:block">
          <HeartScene filled={has} />
        </div>
      </div>
    </motion.section>
  );
}
