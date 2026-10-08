// components/sections/CTASection.jsx  (put it where your current CTASection lives)
"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import {
  animate,
  motion,
  useInView,
  useMotionTemplate,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from "framer-motion";
import {
  FiArrowRight,
  FiAward,
  FiBookOpen,
  FiCheck,
  FiCloud,
  FiCode,
  FiCpu,
  FiDatabase,
  FiTerminal,
  FiTool,
  FiTrendingUp,
  FiUser,
  FiUserPlus,
  FiZap,
} from "react-icons/fi";

import { buttonVariants } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { Reveal } from "@/components/motion/Reveal";
import { cn } from "@/lib/utils";

/* ------------------------------------------------------------------ */
/* Content (edit to match your platform)                               */
/* ------------------------------------------------------------------ */

const highlights = [
  { icon: FiCheck, text: "No credit card required" },
  { icon: FiZap, text: "Start learning in minutes" },
  { icon: FiTrendingUp, text: "Learn at your own pace" },
];

const steps = [
  {
    icon: FiUserPlus,
    title: "Create your account",
    text: "It takes less than a minute, and it's free.",
  },
  {
    icon: FiBookOpen,
    title: "Pick a course",
    text: "Start with a free one and move at your own speed.",
  },
  {
    icon: FiTool,
    title: "Build real projects",
    text: "Finish with work you can show to employers.",
  },
];

const floaters = [
  {
    Icon: FiCode,
    className: "left-[6%] top-[14%]",
    size: 26,
    dur: 7,
    delay: 0,
  },
  {
    Icon: FiCpu,
    className: "right-[7%] top-[12%]",
    size: 30,
    dur: 9,
    delay: 1,
  },
  {
    Icon: FiCloud,
    className: "left-[10%] bottom-[16%]",
    size: 30,
    dur: 8,
    delay: 2,
  },
  {
    Icon: FiTerminal,
    className: "right-[9%] bottom-[18%]",
    size: 26,
    dur: 7.5,
    delay: 0.5,
  },
  {
    Icon: FiDatabase,
    className: "left-[46%] top-[5%]",
    size: 22,
    dur: 10,
    delay: 3,
  },
  {
    Icon: FiAward,
    className: "right-[30%] bottom-[6%]",
    size: 24,
    dur: 9,
    delay: 1.5,
  },
];

const avatarColors = [
  "from-sky-400 to-indigo-500",
  "from-pink-400 to-rose-500",
  "from-amber-300 to-orange-500",
  "from-emerald-400 to-teal-500",
  "from-violet-400 to-fuchsia-500",
];

/* ------------------------------------------------------------------ */
/* Small pieces                                                        */
/* ------------------------------------------------------------------ */

// Number that counts up once it scrolls into view
function CountUp({ to, suffix = "", decimals = 0 }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  const reduce = useReducedMotion();

  useEffect(() => {
    if (!inView || !ref.current) return;
    const fmt = (v) =>
      v.toLocaleString("en-US", {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      }) + suffix;

    if (reduce) {
      ref.current.textContent = fmt(to);
      return;
    }
    const controls = animate(0, to, {
      duration: 1.8,
      ease: "easeOut",
      onUpdate: (v) => {
        if (ref.current) ref.current.textContent = fmt(v);
      },
    });
    return () => controls.stop();
  }, [inView, reduce, to, suffix, decimals]);

  return <span ref={ref}>{`0${suffix}`}</span>;
}

// Five stars that pop in one by one; the last one is filled partly (e.g. 4.8)
function Stars({ value = 5 }) {
  const reduce = useReducedMotion();

  return (
    <span
      className="flex items-center gap-0.5 text-highlight"
      aria-hidden="true"
    >
      {Array.from({ length: 5 }).map((_, i) => {
        const fill = Math.max(0, Math.min(1, value - i)) * 100;
        return (
          <motion.span
            key={i}
            className="relative inline-flex"
            initial={reduce ? false : { scale: 0, rotate: -40 }}
            whileInView={{ scale: 1, rotate: 0 }}
            viewport={{ once: true }}
            transition={{
              type: "spring",
              stiffness: 420,
              damping: 14,
              delay: 0.3 + i * 0.1,
            }}
          >
            <svg
              viewBox="0 0 24 24"
              className="size-3.5 opacity-30"
              fill="currentColor"
            >
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
            <svg
              viewBox="0 0 24 24"
              className="absolute inset-0 size-3.5"
              fill="currentColor"
              style={{ clipPath: `inset(0 ${100 - fill}% 0 0)` }}
            >
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
          </motion.span>
        );
      })}
    </span>
  );
}

// Wraps a button so it leans slightly towards the cursor
function Magnetic({ children, className }) {
  const reduce = useReducedMotion();
  const ref = useRef(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 220, damping: 16, mass: 0.4 });
  const sy = useSpring(y, { stiffness: 220, damping: 16, mass: 0.4 });

  return (
    <motion.div
      ref={ref}
      style={{ x: sx, y: sy }}
      className={className}
      onMouseMove={(e) => {
        if (reduce || !ref.current) return;
        const r = ref.current.getBoundingClientRect();
        x.set((e.clientX - (r.left + r.width / 2)) * 0.22);
        y.set((e.clientY - (r.top + r.height / 2)) * 0.3);
      }}
      onMouseLeave={() => {
        x.set(0);
        y.set(0);
      }}
    >
      {children}
    </motion.div>
  );
}

// Headline whose words blur in one after another
function AnimatedTitle({ id, text }) {
  const reduce = useReducedMotion();
  const words = String(text).split(" ");

  return (
    <h2 id={id} className="relative mx-auto max-w-2xl text-3xl sm:text-4xl">
      {words.map((w, i) => (
        <motion.span
          key={`${w}-${i}`}
          className="mr-[0.25em] inline-block"
          initial={reduce ? false : { opacity: 0, y: 18, filter: "blur(6px)" }}
          whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{
            duration: 0.5,
            delay: 0.1 + i * 0.07,
            ease: [0.22, 1, 0.36, 1],
          }}
        >
          {w}
        </motion.span>
      ))}
    </h2>
  );
}

/* ------------------------------------------------------------------ */
/* Section                                                             */
/* ------------------------------------------------------------------ */

export function CTASection({
  title = "Start building your future today",
  text = "Create a free account, explore free courses, and take your first step toward a career in technology.",
  rating = "4.8/5 from 2,000+ reviews",
  ratingValue = 4.8, // drives the stars
  learners = 50000, // placeholder: use your real number
  primaryHref = "/register",
  secondaryHref = "/courses",
}) {
  const reduce = useReducedMotion();
  const cardRef = useRef(null);

  // Parallax for the glows while the card scrolls past
  const { scrollYProgress } = useScroll({
    target: cardRef,
    offset: ["start end", "end start"],
  });
  const orbA = useTransform(scrollYProgress, [0, 1], [-50, 50]);
  const orbB = useTransform(scrollYProgress, [0, 1], [40, -40]);

  // Spotlight that follows the cursor inside the card
  const mx = useMotionValue(-400);
  const my = useMotionValue(-400);
  const spotlight = useMotionTemplate`radial-gradient(380px circle at ${mx}px ${my}px, rgb(255 255 255 / 0.14), transparent 70%)`;

  return (
    <section className="pb-16 sm:pb-20 lg:pb-24" aria-labelledby="final-cta">
      <Container>
        <Reveal>
          {/* Border with a light that runs around the card */}
          <div className="relative rounded-3xl bg-primary-foreground/10 p-[1.5px]">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 overflow-hidden rounded-3xl"
            >
              <motion.div
                className="absolute -inset-[60%] bg-[conic-gradient(from_0deg,transparent_0deg,transparent_250deg,currentColor_335deg,transparent_360deg)] text-highlight"
                animate={reduce ? undefined : { rotate: 360 }}
                transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
              />
            </div>

            <div
              ref={cardRef}
              onPointerMove={(e) => {
                const r = e.currentTarget.getBoundingClientRect();
                mx.set(e.clientX - r.left);
                my.set(e.clientY - r.top);
              }}
              onPointerLeave={() => {
                mx.set(-400);
                my.set(-400);
              }}
              className="relative overflow-hidden rounded-[calc(1.5rem-1.5px)] bg-primary px-6 py-14 text-center text-primary-foreground sm:px-12 sm:py-16"
            >
              {/* ---------- Background ---------- */}
              <div
                className="pointer-events-none absolute inset-0"
                aria-hidden="true"
              >
                {/* Grid that drifts slowly */}
                <motion.div
                  className="absolute inset-0 opacity-[0.06]"
                  animate={
                    reduce
                      ? undefined
                      : { backgroundPosition: ["0px 0px", "36px 36px"] }
                  }
                  transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                  style={{
                    backgroundImage:
                      "linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)",
                    backgroundSize: "36px 36px",
                    maskImage:
                      "radial-gradient(ellipse at center, black 20%, transparent 70%)",
                    WebkitMaskImage:
                      "radial-gradient(ellipse at center, black 20%, transparent 70%)",
                  }}
                />

                {/* Glows with scroll parallax */}
                <motion.div
                  style={{ y: orbA }}
                  className="absolute -left-20 -top-20"
                >
                  <div className="size-72 rounded-full bg-highlight/20 blur-3xl motion-safe:animate-pulse" />
                </motion.div>
                <motion.div
                  style={{ y: orbB }}
                  className="absolute -bottom-24 -right-16"
                >
                  <div className="size-80 rounded-full bg-highlight/10 blur-3xl motion-safe:animate-pulse" />
                </motion.div>

                {/* Cursor spotlight */}
                {!reduce && (
                  <motion.div
                    className="absolute inset-0"
                    style={{ background: spotlight }}
                  />
                )}

                {/* Floating tech icons (hidden on small screens) */}
                {!reduce &&
                  floaters.map(({ Icon, className, size, dur, delay }) => (
                    <motion.span
                      key={className}
                      className={cn(
                        "absolute hidden text-primary-foreground/15 md:block",
                        className,
                      )}
                      animate={{ y: [0, -14, 0], rotate: [0, 8, -6, 0] }}
                      transition={{
                        duration: dur,
                        delay,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                    >
                      <Icon style={{ width: size, height: size }} />
                    </motion.span>
                  ))}
              </div>

              {/* ---------- Content ---------- */}

              {/* Rating badge */}
              <div className="relative mx-auto mb-5 inline-flex items-center gap-2 rounded-full bg-primary-foreground/10 px-4 py-1.5 text-xs font-medium backdrop-blur-sm">
                <Stars value={ratingValue} />
                <span className="text-primary-foreground/80">{rating}</span>
              </div>

              <AnimatedTitle id="final-cta" text={title} />

              <p className="relative mx-auto mt-4 max-w-xl text-primary-foreground/80">
                {text}
              </p>

              {/* Trust highlights */}
              <ul className="relative mx-auto mt-7 flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
                {highlights.map(({ icon: Icon, text: h }, i) => (
                  <motion.li
                    key={h}
                    initial={reduce ? false : { opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.4 + i * 0.1 }}
                    className="flex items-center gap-1.5 text-sm text-primary-foreground/85"
                  >
                    <Icon
                      className="size-4 text-highlight"
                      aria-hidden="true"
                    />
                    {h}
                  </motion.li>
                ))}
              </ul>

              {/* How it works */}
              <div className="relative mx-auto mt-10 max-w-3xl">
                {/* Line that connects the steps and draws itself */}
                <div
                  aria-hidden="true"
                  className="absolute left-[16%] right-[16%] top-1/2 hidden h-px md:block"
                >
                  <div className="h-px w-full border-t border-dashed border-primary-foreground/25" />
                  <motion.div
                    className="absolute inset-y-0 left-0 w-full origin-left bg-highlight/70"
                    initial={reduce ? false : { scaleX: 0 }}
                    whileInView={{ scaleX: 1 }}
                    viewport={{ once: true }}
                    transition={{
                      duration: 1.4,
                      delay: 0.6,
                      ease: "easeInOut",
                    }}
                  />
                </div>

                <ol className="relative grid gap-4 md:grid-cols-3">
                  {steps.map(({ icon: Icon, title: t, text: d }, i) => (
                    <motion.li
                      key={t}
                      initial={reduce ? false : { opacity: 0, y: 24 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, margin: "-40px" }}
                      transition={{ duration: 0.5, delay: 0.2 + i * 0.12 }}
                      whileHover={reduce ? undefined : { y: -4 }}
                      className="group relative rounded-2xl border border-primary-foreground/15 bg-primary/80 p-5 text-left backdrop-blur-sm transition-colors duration-300 hover:border-highlight/50 motion-reduce:transition-none"
                    >
                      <span className="absolute right-4 top-3 font-sans text-xs font-semibold tabular-nums text-primary-foreground/30">
                        0{i + 1}
                      </span>
                      <span className="grid size-10 place-items-center rounded-xl bg-highlight/20 text-highlight transition-all duration-300 group-hover:-rotate-6 group-hover:scale-110 group-hover:bg-highlight group-hover:text-highlight-foreground motion-reduce:transition-none motion-reduce:group-hover:rotate-0 motion-reduce:group-hover:scale-100">
                        <Icon className="size-5" aria-hidden="true" />
                      </span>
                      <h3 className="mt-3 text-sm font-semibold">{t}</h3>
                      <p className="mt-1 text-sm text-primary-foreground/70">
                        {d}
                      </p>
                    </motion.li>
                  ))}
                </ol>
              </div>

              {/* Buttons */}
              <div className="relative mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <Magnetic className="relative w-full sm:w-auto">
                  {/* Soft pulse behind the main button */}
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0 -z-10 rounded-lg bg-highlight/40 motion-safe:animate-ping [animation-duration:2.6s]"
                  />
                  <Link
                    href={primaryHref}
                    className={buttonVariants({
                      size: "lg",
                      className:
                        "group relative w-full cursor-pointer overflow-hidden bg-highlight text-highlight-foreground transition-all hover:bg-highlight/90 hover:shadow-lg hover:shadow-highlight/30 active:scale-95 motion-reduce:active:scale-100 sm:w-auto",
                    })}
                  >
                    {/* Shine sweep */}
                    <span
                      aria-hidden="true"
                      className="pointer-events-none absolute inset-y-0 -left-full w-1/2 skew-x-[-20deg] bg-gradient-to-r from-transparent via-white/40 to-transparent transition-transform duration-700 group-hover:translate-x-[320%] motion-reduce:hidden"
                    />
                    <span className="relative">Create free account</span>
                    {/* Arrow keeps nudging forward */}
                    <motion.span
                      className="relative ml-1.5 inline-flex"
                      animate={reduce ? undefined : { x: [0, 5, 0] }}
                      transition={{
                        duration: 0.9,
                        repeat: Infinity,
                        repeatDelay: 1.1,
                        ease: "easeInOut",
                      }}
                    >
                      <FiArrowRight
                        className="size-4 transition-transform group-hover:translate-x-1 motion-reduce:transition-none motion-reduce:group-hover:translate-x-0"
                        aria-hidden="true"
                      />
                    </motion.span>
                  </Link>
                </Magnetic>

                <Magnetic className="w-full sm:w-auto">
                  <Link
                    href={secondaryHref}
                    className={buttonVariants({
                      size: "lg",
                      variant: "outline",
                      className:
                        "w-full cursor-pointer border-primary-foreground/30 bg-transparent text-primary-foreground transition-all hover:-translate-y-0.5 hover:bg-primary-foreground/10 hover:text-primary-foreground active:scale-95 motion-reduce:hover:translate-y-0 motion-reduce:active:scale-100 sm:w-auto",
                    })}
                  >
                    Browse courses
                  </Link>
                </Magnetic>
              </div>

              {/* Social proof: avatars + live counter */}
              <div className="relative mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <ul className="flex items-center" aria-hidden="true">
                  {avatarColors.map((c, i) => (
                    <motion.li
                      key={c}
                      initial={
                        reduce ? false : { opacity: 0, scale: 0, x: -10 }
                      }
                      whileInView={{ opacity: 1, scale: 1, x: 0 }}
                      viewport={{ once: true }}
                      whileHover={reduce ? undefined : { y: -4, zIndex: 10 }}
                      transition={{
                        type: "spring",
                        stiffness: 400,
                        damping: 18,
                        delay: 0.5 + i * 0.08,
                      }}
                      className={cn(
                        "grid size-9 place-items-center rounded-full bg-gradient-to-br text-white ring-2 ring-primary",
                        c,
                        i > 0 && "-ml-2.5",
                      )}
                    >
                      <FiUser className="size-4" />
                    </motion.li>
                  ))}
                  <li className="-ml-2.5 grid size-9 place-items-center rounded-full bg-primary-foreground text-[10px] font-bold text-primary ring-2 ring-primary">
                    +
                  </li>
                </ul>
                <p className="text-sm text-primary-foreground/80">
                  <span className="font-semibold text-primary-foreground">
                    <CountUp to={learners} suffix="+" />
                  </span>{" "}
                  learners are already learning with us
                </p>
              </div>

              <p className="relative mt-6 text-xs text-primary-foreground/60">
                Free forever plan available &middot; Cancel anytime &middot; No
                hidden fees
              </p>
            </div>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
