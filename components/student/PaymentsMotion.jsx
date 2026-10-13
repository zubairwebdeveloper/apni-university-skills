"use client";

import Link from "next/link";
import {
  MotionConfig,
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from "framer-motion";
import {
  FiArrowRight,
  FiCreditCard,
  FiDownload,
  FiLock,
  FiShield,
} from "react-icons/fi";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/* Respects the OS "reduce motion" setting for every motion child below */
export function MotionRoot({ children }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}

export function Reveal({ children, delay = 0, className }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.45, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function PaymentsBackdrop() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
    >
      <div className="absolute -top-40 left-1/2 h-[420px] w-[820px] -translate-x-1/2 rounded-full bg-primary/10 blur-3xl dark:bg-primary/15" />
      <div className="absolute -right-20 top-1/4 h-64 w-64 rounded-full bg-amber-400/10 blur-3xl" />
      <div
        className="absolute inset-0 opacity-[0.35] dark:opacity-[0.22]"
        style={{
          backgroundImage:
            "linear-gradient(to right, hsl(var(--border)) 1px, transparent 1px), linear-gradient(to bottom, hsl(var(--border)) 1px, transparent 1px)",
          backgroundSize: "56px 56px",
          maskImage:
            "radial-gradient(ellipse 70% 50% at 50% 0%, #000 25%, transparent 75%)",
          WebkitMaskImage:
            "radial-gradient(ellipse 70% 50% at 50% 0%, #000 25%, transparent 75%)",
        }}
      />
    </div>
  );
}

/* Decorative 3D card: tilts with the pointer, floats gently, glare follows tilt */
function SecureCard3D() {
  const reduce = useReducedMotion();
  const rx = useMotionValue(0);
  const ry = useMotionValue(0);
  const sx = useSpring(rx, { stiffness: 120, damping: 16 });
  const sy = useSpring(ry, { stiffness: 120, damping: 16 });
  const glareX = useTransform(sy, [-16, 16], ["15%", "85%"]);
  const glareY = useTransform(sx, [-16, 16], ["85%", "15%"]);
  const glare = useTransform(
    [glareX, glareY],
    ([x, y]) =>
      `radial-gradient(220px circle at ${x} ${y}, rgba(255,255,255,0.28), transparent 60%)`,
  );

  const onMove = (e) => {
    if (reduce) return;
    const r = e.currentTarget.getBoundingClientRect();
    ry.set(((e.clientX - r.left) / r.width - 0.5) * 32);
    rx.set(-((e.clientY - r.top) / r.height - 0.5) * 32);
  };
  const onLeave = () => {
    rx.set(0);
    ry.set(0);
  };

  return (
    <div
      onPointerMove={onMove}
      onPointerLeave={onLeave}
      aria-hidden="true"
      className="relative mx-auto h-48 w-72 sm:h-56 sm:w-[21rem]"
      style={{ perspective: 900 }}
    >
      <motion.div
        className="relative h-full w-full"
        style={{ rotateX: sx, rotateY: sy, transformStyle: "preserve-3d" }}
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      >
        {/* soft shadow plate behind the card */}
        <div
          className="absolute inset-3 rounded-2xl bg-primary/30 blur-xl"
          style={{ transform: "translateZ(-40px)" }}
        />

        {/* card face (intentionally a coloured illustration in both themes) */}
        <div
          className="absolute inset-0 overflow-hidden rounded-2xl border border-white/20 bg-gradient-to-br from-blue-600 via-blue-500 to-sky-400 p-5 text-white shadow-xl"
          style={{ transform: "translateZ(0px)" }}
        >
          <motion.div
            className="pointer-events-none absolute inset-0"
            style={{ background: glare }}
          />
          <div className="relative flex items-start justify-between">
            <span className="text-xs font-semibold tracking-wide opacity-90">
              Apni University
            </span>
            <FiCreditCard className="size-5 opacity-90" />
          </div>
          <div className="relative mt-6 h-8 w-11 rounded-md bg-gradient-to-br from-amber-300 to-amber-500 shadow-inner" />
          <div className="relative mt-6 space-y-2">
            <span className="block h-2 w-3/4 rounded bg-white/35" />
            <span className="block h-2 w-1/2 rounded bg-white/25" />
          </div>
          <span className="absolute bottom-4 right-5 text-[10px] font-medium uppercase tracking-widest opacity-80">
            Secured by Stripe
          </span>
        </div>

        {/* floating lock badge on its own depth layer */}
        <div
          className="absolute -right-3 -top-3 grid size-11 place-items-center rounded-full border border-border bg-card text-primary shadow-lg"
          style={{ transform: "translateZ(60px)" }}
        >
          <FiLock className="size-5" />
        </div>
      </motion.div>
    </div>
  );
}

const TRUST = [
  { icon: FiLock, text: "Card details are handled by Stripe" },
  { icon: FiShield, text: "Never stored by us" },
  { icon: FiDownload, text: "Downloadable receipts for paid courses" },
];

export function PaymentsHero({ count = 0 }) {
  const hasPayments = count > 0;

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
            <FiShield className="size-3.5 text-primary" aria-hidden="true" />
            Secure billing
          </span>
          <h2 className="mt-3 font-serif text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            {hasPayments
              ? `${count} purchase${count > 1 ? "s" : ""} on record`
              : "Your billing, in one place"}
          </h2>

          <ul className="mt-4 space-y-2">
            {TRUST.map((t) => (
              <li
                key={t.text}
                className="flex items-center gap-2.5 text-sm text-muted-foreground"
              >
                <span className="grid size-7 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
                  <t.icon className="size-3.5" aria-hidden="true" />
                </span>
                {t.text}
              </li>
            ))}
          </ul>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/courses?price=paid"
              className={cn(buttonVariants(), "group")}
            >
              Browse paid courses
              <FiArrowRight className="ml-1.5 size-4 transition-transform group-hover:translate-x-1 motion-reduce:transition-none" />
            </Link>
            {hasPayments && (
              <a
                href="#payment-history"
                className={buttonVariants({ variant: "outline" })}
              >
                View history
              </a>
            )}
            <a
              href="#payment-faq"
              className={buttonVariants({ variant: "ghost" })}
            >
              Billing help
            </a>
          </div>
        </div>

        <SecureCard3D />
      </div>
    </motion.section>
  );
}
