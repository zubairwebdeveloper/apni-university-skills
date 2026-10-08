// components/auth/AuthSidePanel.jsx
// Technology side panel + animated content shell for the (auth) route group.
"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  AnimatePresence,
  animate,
  motion,
  useInView,
  useMotionTemplate,
  useMotionValue,
  useReducedMotion,
  useSpring,
} from "framer-motion";
import {
  ArrowLeft,
  Award,
  BadgeCheck,
  Code,
  LifeBuoy,
  Lock,
  Rocket,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { AnimatedLogo } from "../layout/AnimatedLogo";

const EASE = [0.22, 1, 0.36, 1];

/* ------------------------------------------------------------------ */
/* Canvas: connected network nodes + falling binary / code characters  */
/* ------------------------------------------------------------------ */

const CHARS = "01{}<>/;=()[]";

function TechNetwork({ className }) {
  const canvasRef = useRef(null);
  const probeRef = useRef(null);
  const reduce = useReducedMotion();

  useEffect(() => {
    const canvas = canvasRef.current;
    const probe = probeRef.current;
    if (!canvas || !probe) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const LINK = 130; // max distance for a connection line
    const COL = 18; // width of one code column

    let w = 0;
    let h = 0;
    let raf = 0;
    let frame = 0;
    let visible = true;
    let color = "currentColor";
    let nodes = [];
    let drops = [];
    const pointer = { x: -9999, y: -9999 };

    const readColor = () => {
      color = getComputedStyle(probe).color || color;
    };

    const init = () => {
      const count = Math.max(18, Math.round((w * h) / 15000));
      nodes = Array.from({ length: count }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.35,
        vy: (Math.random() - 0.5) * 0.35,
        r: 1 + Math.random() * 1.6,
      }));
      drops = Array.from({ length: Math.floor(w / COL) }, () => ({
        y: Math.random() * h,
        speed: 0.5 + Math.random() * 1.1,
        ch: CHARS[Math.floor(Math.random() * CHARS.length)],
      }));
    };

    const resize = () => {
      const r = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = r.width;
      h = r.height;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      readColor();
      init();
    };

    const draw = (animateFrame) => {
      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = color;
      ctx.strokeStyle = color;

      // Falling code characters (very faint)
      ctx.font = "12px monospace";
      ctx.globalAlpha = 0.14;
      for (let i = 0; i < drops.length; i++) {
        const d = drops[i];
        ctx.fillText(d.ch, i * COL + 2, d.y);
        if (animateFrame) {
          d.y += d.speed;
          if (d.y > h + 20) {
            d.y = -20;
            d.ch = CHARS[Math.floor(Math.random() * CHARS.length)];
          } else if (Math.random() < 0.02) {
            d.ch = CHARS[Math.floor(Math.random() * CHARS.length)];
          }
        }
      }

      // Move nodes
      if (animateFrame) {
        for (const n of nodes) {
          n.x += n.vx;
          n.y += n.vy;
          if (n.x < 0 || n.x > w) n.vx *= -1;
          if (n.y < 0 || n.y > h) n.vy *= -1;
        }
      }

      // Connection lines (the mouse acts as an extra node)
      const pts = pointer.x > -9000 ? [...nodes, pointer] : nodes;
      ctx.lineWidth = 1;
      for (let i = 0; i < pts.length; i++) {
        for (let j = i + 1; j < pts.length; j++) {
          const dx = pts[i].x - pts[j].x;
          const dy = pts[i].y - pts[j].y;
          const dist = Math.hypot(dx, dy);
          if (dist < LINK) {
            ctx.globalAlpha = (1 - dist / LINK) * 0.35;
            ctx.beginPath();
            ctx.moveTo(pts[i].x, pts[i].y);
            ctx.lineTo(pts[j].x, pts[j].y);
            ctx.stroke();
          }
        }
      }

      // Nodes
      ctx.globalAlpha = 0.75;
      for (const n of nodes) {
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    };

    const loop = () => {
      // Skip work when the tab is hidden or the canvas is not on screen
      // (e.g. the desktop panel on mobile, or the mobile hero on desktop)
      if (!document.hidden && visible) {
        // Re-read the colour now and then so dark / light switches are picked up
        if (++frame % 90 === 0) readColor();
        draw(true);
      }
      raf = requestAnimationFrame(loop);
    };

    const onMove = (e) => {
      if (!visible) return;
      const r = canvas.getBoundingClientRect();
      const x = e.clientX - r.left;
      const y = e.clientY - r.top;
      const inside = x >= 0 && y >= 0 && x <= r.width && y <= r.height;
      pointer.x = inside ? x : -9999;
      pointer.y = inside ? y : -9999;
    };

    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
    });
    io.observe(canvas);

    if (reduce) {
      draw(false); // one still frame
    } else {
      window.addEventListener("pointermove", onMove, { passive: true });
      raf = requestAnimationFrame(loop);
    }

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      window.removeEventListener("pointermove", onMove);
    };
  }, [reduce]);

  return (
    <>
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        className={cn("absolute inset-0 size-full", className)}
      />
      {/* Invisible element used to read the theme's colour */}
      <span
        ref={probeRef}
        aria-hidden="true"
        className="absolute size-0 text-background opacity-0"
      />
    </>
  );
}

/* ------------------------------------------------------------------ */
/* Background extras: grid, scan line                                  */
/* ------------------------------------------------------------------ */

function GridBackdrop() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 text-background opacity-[0.06] [background-image:linear-gradient(to_right,currentColor_1px,transparent_1px),linear-gradient(to_bottom,currentColor_1px,transparent_1px)] [background-size:48px_48px] [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_80%)]"
    />
  );
}

function ScanLine({ reduce }) {
  if (reduce) return null;
  return (
    <motion.div
      aria-hidden="true"
      initial={{ top: "-2%" }}
      animate={{ top: "102%" }}
      transition={{
        duration: 7,
        repeat: Infinity,
        ease: "linear",
        repeatDelay: 2,
      }}
      className="pointer-events-none absolute inset-x-0 h-px bg-gradient-to-r from-transparent via-background/50 to-transparent shadow-[0_0_24px_4px] shadow-background/20"
    />
  );
}

/* ------------------------------------------------------------------ */
/* Terminal card that types itself out in a loop                       */
/* ------------------------------------------------------------------ */

const OK = "text-emerald-400 dark:text-emerald-600";

const LINES = [
  { text: "$ apni login --secure", tone: "text-background" },
  { text: "Verifying your account…", tone: "text-background/60" },
  { text: "✔ Session started", tone: OK },
  { text: "$ apni open courses", tone: "text-background" },
  { text: "✔ Your skills path is ready", tone: OK },
];

function Terminal() {
  const reduce = useReducedMotion();
  const [count, setCount] = useState(reduce ? LINES.length : 0);

  useEffect(() => {
    if (reduce) return;
    const timer = setTimeout(
      () => setCount((c) => (c >= LINES.length ? 0 : c + 1)),
      count >= LINES.length ? 3200 : 900,
    );
    return () => clearTimeout(timer);
  }, [count, reduce]);

  return (
    <div className="w-full max-w-md overflow-hidden rounded-xl border border-background/15 bg-background/10 shadow-2xl shadow-black/20 backdrop-blur-md">
      <div className="flex items-center gap-1.5 border-b border-background/15 px-4 py-2.5">
        <span className="size-2.5 rounded-full bg-red-400/80" />
        <span className="size-2.5 rounded-full bg-amber-400/80" />
        <span className="size-2.5 rounded-full bg-emerald-400/80" />
        <span className="ml-2 font-mono text-[11px] text-background/50">
          apni-university.sh
        </span>
      </div>

      <div
        className="min-h-[9.5rem] space-y-1.5 p-4 font-mono text-xs leading-relaxed"
        aria-hidden="true"
      >
        {LINES.slice(0, count).map((l) => (
          <motion.p
            key={l.text}
            initial={reduce ? false : { opacity: 0, x: -6 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.25 }}
            className={l.tone}
          >
            {l.text}
          </motion.p>
        ))}
        <span className="inline-block h-3.5 w-1.5 translate-y-0.5 bg-background motion-safe:animate-pulse" />
      </div>

      {/* Progress bar that follows the lines */}
      <div className="h-0.5 w-full bg-background/10" aria-hidden="true">
        <motion.div
          animate={{ width: `${(count / LINES.length) * 100}%` }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="h-full bg-gradient-to-r from-primary to-emerald-400"
        />
      </div>
    </div>
  );
}

/* Small notification that pops up above the terminal now and then */
function FloatingBadge({ reduce }) {
  if (reduce) return null;
  return (
    <motion.div
      aria-hidden="true"
      initial={{ opacity: 0, y: 10, scale: 0.9 }}
      animate={{
        opacity: [0, 1, 1, 0],
        y: [10, 0, 0, -8],
        scale: [0.9, 1, 1, 0.95],
      }}
      transition={{
        duration: 4.5,
        times: [0, 0.12, 0.85, 1],
        repeat: Infinity,
        repeatDelay: 4,
        delay: 2.5,
      }}
      className="absolute -right-2 -top-4 flex items-center gap-2 rounded-xl border border-background/20 bg-background/15 px-3 py-2 text-xs font-medium text-background shadow-xl shadow-black/20 backdrop-blur-md sm:-right-6"
    >
      <span className="grid size-6 place-items-center rounded-full bg-emerald-400/90 text-black">
        <BadgeCheck className="size-3.5" />
      </span>
      New badge unlocked
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/* Count-up stats                                                      */
/* ------------------------------------------------------------------ */

const STATS = [
  { value: 10, suffix: "K+", label: "Learners" },
  { value: 50, suffix: "+", label: "Courses" },
  { value: 95, suffix: "%", label: "Satisfaction" },
];

function CountUp({ to, suffix, reduce }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  const [n, setN] = useState(reduce ? to : 0);

  useEffect(() => {
    if (reduce || !inView) return;
    const controls = animate(0, to, {
      duration: 1.8,
      delay: 0.5,
      ease: EASE,
      onUpdate: (v) => setN(Math.round(v)),
    });
    return () => controls.stop();
  }, [inView, reduce, to]);

  return (
    <span ref={ref}>
      {n}
      {suffix}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/* Rotating testimonials (replace with real ones)                      */
/* ------------------------------------------------------------------ */

const TESTIMONIALS = [
  {
    quote:
      "The projects felt like real work, and that helped me land my first tech job.",
    name: "Ayesha K.",
    role: "Frontend Developer",
  },
  {
    quote: "Clear lessons, great mentors, and a path I could actually follow.",
    name: "Hamza R.",
    role: "Data Analyst",
  },
  {
    quote: "I went from beginner to building full apps in a few months.",
    name: "Sana M.",
    role: "Full-Stack Developer",
  },
];

function Testimonials({ reduce }) {
  const [i, setI] = useState(0);

  useEffect(() => {
    if (reduce) return;
    const id = setInterval(
      () => setI((c) => (c + 1) % TESTIMONIALS.length),
      5000,
    );
    return () => clearInterval(id);
  }, [reduce]);

  const t = TESTIMONIALS[i];

  return (
    <figure className="relative max-w-md rounded-xl border border-background/15 bg-background/10 p-4 backdrop-blur-md">
      <div className="min-h-[5.5rem]">
        <AnimatePresence mode="wait">
          <motion.div
            key={i}
            initial={reduce ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduce ? undefined : { opacity: 0, y: -10 }}
            transition={{ duration: 0.35 }}
          >
            <blockquote className="text-sm leading-relaxed text-background/85">
              “{t.quote}”
            </blockquote>
            <figcaption className="mt-3 flex items-center gap-2.5">
              <span className="grid size-7 place-items-center rounded-full bg-primary text-[11px] font-semibold text-primary-foreground">
                {t.name[0]}
              </span>
              <span className="text-xs text-background/70">
                <span className="font-medium text-background">{t.name}</span> ·{" "}
                {t.role}
              </span>
            </figcaption>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Dots */}
      <div className="mt-3 flex gap-1.5" aria-hidden="true">
        {TESTIMONIALS.map((_, idx) => (
          <span
            key={idx}
            className={cn(
              "h-1 rounded-full bg-background transition-all duration-300 motion-reduce:transition-none",
              idx === i ? "w-5 opacity-90" : "w-1.5 opacity-30",
            )}
          />
        ))}
      </div>
    </figure>
  );
}

/* ------------------------------------------------------------------ */
/* Shared: animated heading (words reveal, last word shimmers)         */
/* ------------------------------------------------------------------ */

function AnimatedHeading({ tagline, reduce, className, offset = {} }) {
  const lines = tagline.split(/(?<=\.)\s+/);
  const { y = 22, blur = 8, step = 0.09, start = 0.1, duration = 0.6 } = offset;
  let wordIndex = 0;

  return (
    <h2 className={className}>
      {lines.map((line, li) => {
        const words = line.split(" ");
        return (
          <span key={line} className="block">
            {words.map((word, wi) => {
              const idx = wordIndex++;
              const shimmer =
                li === lines.length - 1 && wi === words.length - 1;
              return (
                <motion.span
                  key={`${word}-${wi}`}
                  initial={
                    reduce
                      ? false
                      : { opacity: 0, y, filter: `blur(${blur}px)` }
                  }
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  transition={{
                    duration,
                    delay: start + idx * step,
                    ease: EASE,
                  }}
                  className="mr-[0.25em] inline-block"
                >
                  {shimmer ? (
                    <motion.span
                      animate={
                        reduce
                          ? undefined
                          : { backgroundPosition: ["0% 50%", "200% 50%"] }
                      }
                      transition={{
                        duration: 4,
                        repeat: Infinity,
                        ease: "linear",
                      }}
                      className="bg-gradient-to-r from-background via-primary to-background bg-[length:200%_100%] bg-clip-text text-transparent"
                    >
                      {word}
                    </motion.span>
                  ) : (
                    word
                  )}
                </motion.span>
              );
            })}
          </span>
        );
      })}
    </h2>
  );
}

/* ------------------------------------------------------------------ */
/* Side panel (desktop, lg and up)                                     */
/* ------------------------------------------------------------------ */

const SKILLS = ["AI", "Web", "Cloud", "Data", "Security", "Mobile"];

const POINTS = [
  { icon: Rocket, text: "Pick up exactly where you left off" },
  { icon: Award, text: "Track your progress across every course" },
  { icon: ShieldCheck, text: "Your account is protected and private" },
];

export function AuthSidePanel({ siteName, tagline, year }) {
  const reduce = useReducedMotion();

  // Spotlight that follows the mouse (shown through a mask, so it works with any theme colour)
  const mx = useMotionValue(-400);
  const my = useMotionValue(-400);
  const sx = useSpring(mx, { stiffness: 140, damping: 20 });
  const sy = useSpring(my, { stiffness: 140, damping: 20 });
  const mask = useMotionTemplate`radial-gradient(340px circle at ${sx}px ${sy}px, black, transparent 70%)`;

  const onMove = (e) => {
    if (reduce) return;
    const r = e.currentTarget.getBoundingClientRect();
    mx.set(e.clientX - r.left);
    my.set(e.clientY - r.top);
  };
  const onLeave = () => {
    mx.set(-400);
    my.set(-400);
  };

  return (
    <aside
      onPointerMove={onMove}
      onPointerLeave={onLeave}
      className="relative hidden flex-col justify-between gap-8 overflow-hidden bg-foreground p-10 text-background lg:flex xl:p-14"
    >
      <GridBackdrop />
      <TechNetwork />
      <ScanLine reduce={reduce} />

      {/* Mouse spotlight */}
      <motion.div
        aria-hidden="true"
        style={{ maskImage: mask, WebkitMaskImage: mask }}
        className="pointer-events-none absolute inset-0 bg-background/10"
      />

      {/* Slow glows */}
      <motion.div
        aria-hidden="true"
        animate={reduce ? undefined : { x: [0, 40, 0], y: [0, -30, 0] }}
        transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
        className="pointer-events-none absolute -left-20 -top-20 size-80 rounded-full bg-primary/30 blur-3xl"
      />
      <motion.div
        aria-hidden="true"
        animate={reduce ? undefined : { x: [0, -40, 0], y: [0, 30, 0] }}
        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
        className="pointer-events-none absolute -bottom-24 -right-16 size-96 rounded-full bg-primary/20 blur-3xl"
      />

      {/* Top: logo */}
      <motion.div
        initial={reduce ? false : { opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: EASE }}
        className="relative"
      >
        <AnimatedLogo size="lg" tagline="Learn Skills. Build Your Future." />
      </motion.div>

      {/* Middle: message, stats, terminal, chips */}
      <div className="relative">
        <div>
          <motion.span
            initial={reduce ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: EASE }}
            className="inline-flex items-center gap-1.5 rounded-full border border-background/20 bg-background/10 px-3 py-1 text-xs font-medium text-background/90 backdrop-blur"
          >
            <Code aria-hidden="true" className="size-3.5" />
            Technology education
            <Sparkles
              aria-hidden="true"
              className="size-3 text-primary motion-safe:animate-pulse"
            />
          </motion.span>

          <AnimatedHeading
            tagline={tagline}
            reduce={reduce}
            className="mt-5 font-serif text-4xl leading-tight xl:text-5xl"
          />

          <motion.p
            initial={reduce ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5, ease: EASE }}
            className="mt-4 max-w-sm text-background/70"
          >
            Practical technology courses, real projects, and career guidance in
            one place.
          </motion.p>
        </div>

        {/* Stats */}
        <motion.dl
          initial={reduce ? false : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6, ease: EASE }}
          className="mt-6 grid max-w-md grid-cols-3 divide-x divide-background/15 rounded-xl border border-background/15 bg-background/10 backdrop-blur-md"
        >
          {STATS.map((s) => (
            <div key={s.label} className="px-4 py-3 text-center">
              <dt className="sr-only">{s.label}</dt>
              <dd className="font-serif text-2xl leading-none">
                <CountUp to={s.value} suffix={s.suffix} reduce={reduce} />
              </dd>
              <p
                aria-hidden="true"
                className="mt-1 text-[11px] text-background/60"
              >
                {s.label}
              </p>
            </div>
          ))}
        </motion.dl>

        {/* Terminal + floating badge (hidden on short screens) */}
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.75, ease: EASE }}
          className="relative mt-6 [@media(max-height:820px)]:hidden"
        >
          <motion.div
            animate={reduce ? undefined : { y: [0, -8, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            className="relative max-w-md"
          >
            <Terminal />
            <FloatingBadge reduce={reduce} />
          </motion.div>
        </motion.div>

        {/* Skill chips that float gently */}
        <ul className="mt-6 flex max-w-md flex-wrap gap-2" aria-label="Topics">
          {SKILLS.map((s, i) => (
            <motion.li
              key={s}
              initial={reduce ? false : { opacity: 0, scale: 0.8 }}
              animate={
                reduce
                  ? { opacity: 1, scale: 1 }
                  : { opacity: 1, scale: 1, y: [0, -5, 0] }
              }
              whileHover={reduce ? undefined : { scale: 1.12, rotate: -3 }}
              transition={{
                opacity: { delay: 0.9 + i * 0.08 },
                scale: {
                  delay: 0.9 + i * 0.08,
                  type: "spring",
                  stiffness: 300,
                },
                y: {
                  duration: 3 + i * 0.4,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: i * 0.3,
                },
              }}
              className="cursor-default rounded-full border border-background/20 bg-background/10 px-3 py-1 text-xs font-medium text-background/80 backdrop-blur transition-colors duration-200 hover:bg-background hover:text-foreground motion-reduce:transition-none"
            >
              {s}
            </motion.li>
          ))}
        </ul>
      </div>

      {/* Bottom: testimonial, points, copyright */}
      <div className="relative">
        <div className="mb-6 [@media(max-height:940px)]:hidden">
          <Testimonials reduce={reduce} />
        </div>

        <ul className="space-y-3">
          {POINTS.map(({ icon: Icon, text }, i) => (
            <motion.li
              key={text}
              initial={reduce ? false : { opacity: 0, x: -14 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.3 + i * 0.1 }}
              className="group flex items-center gap-3 text-sm text-background/80"
            >
              <span className="grid size-8 shrink-0 place-items-center rounded-lg border border-background/20 bg-background/10 transition-all duration-200 group-hover:scale-110 group-hover:bg-background group-hover:text-foreground motion-reduce:transition-none motion-reduce:group-hover:scale-100">
                <Icon aria-hidden="true" className="size-4" />
              </span>
              {text}
            </motion.li>
          ))}
        </ul>

        <p className="mt-8 text-xs text-background/60">
          © {year} {siteName}
        </p>
      </div>
    </aside>
  );
}

/* ------------------------------------------------------------------ */
/* Mobile hero (only below lg, the side panel is hidden there)         */
/* ------------------------------------------------------------------ */

function MobileHero({ tagline, reduce }) {
  const loop = [...SKILLS, ...SKILLS];

  return (
    <motion.section
      initial={reduce ? false : { opacity: 0, y: 20, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.6, ease: EASE }}
      className="relative mb-8 overflow-hidden rounded-3xl bg-foreground p-5 text-background shadow-xl shadow-primary/10 sm:p-6 lg:hidden"
    >
      <GridBackdrop />
      <TechNetwork />

      {/* Glows */}
      <motion.div
        aria-hidden="true"
        animate={reduce ? undefined : { x: [0, 30, 0], y: [0, -20, 0] }}
        transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
        className="pointer-events-none absolute -left-16 -top-16 size-52 rounded-full bg-primary/30 blur-3xl"
      />
      <motion.div
        aria-hidden="true"
        animate={reduce ? undefined : { x: [0, -30, 0], y: [0, 20, 0] }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
        className="pointer-events-none absolute -bottom-20 -right-12 size-60 rounded-full bg-primary/20 blur-3xl"
      />
      <ScanLine reduce={reduce} />

      <div className="relative">
        <AnimatedLogo tagline={tagline} />

        <span className="mt-5 inline-flex items-center gap-1.5 rounded-full border border-background/20 bg-background/10 px-3 py-1 text-xs font-medium text-background/90 backdrop-blur">
          <Code aria-hidden="true" className="size-3.5" />
          Technology education
          <Sparkles
            aria-hidden="true"
            className="size-3 text-primary motion-safe:animate-pulse"
          />
        </span>

        <AnimatedHeading
          tagline={tagline}
          reduce={reduce}
          className="mt-4 font-serif text-3xl leading-tight"
          offset={{ y: 18, blur: 6, step: 0.08, start: 0.15, duration: 0.55 }}
        />

        <p className="mt-3 text-sm text-background/70">
          Practical technology courses, real projects, and career guidance in
          one place.
        </p>

        {/* Stats */}
        <motion.dl
          initial={reduce ? false : { opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5, ease: EASE }}
          className="mt-5 grid grid-cols-3 divide-x divide-background/15 rounded-xl border border-background/15 bg-background/10 backdrop-blur-md"
        >
          {STATS.map((s) => (
            <div key={s.label} className="px-2 py-3 text-center">
              <dt className="sr-only">{s.label}</dt>
              <dd className="font-serif text-xl leading-none">
                <CountUp to={s.value} suffix={s.suffix} reduce={reduce} />
              </dd>
              <p
                aria-hidden="true"
                className="mt-1 text-[11px] text-background/60"
              >
                {s.label}
              </p>
            </div>
          ))}
        </motion.dl>

        {/* Skill chips: slow infinite marquee (wraps normally with reduced motion) */}
        <div
          className={cn(
            "mt-5",
            !reduce &&
              "overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_12%,black_88%,transparent)]",
          )}
        >
          <motion.ul
            aria-label="Topics"
            animate={reduce ? undefined : { x: ["0%", "-50%"] }}
            transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
            className={cn("flex", reduce ? "flex-wrap gap-2" : "w-max")}
          >
            {(reduce ? SKILLS : loop).map((s, i) => (
              <li
                key={`${s}-${i}`}
                aria-hidden={!reduce && i >= SKILLS.length}
                className={cn(
                  "rounded-full border border-background/20 bg-background/10 px-3 py-1 text-xs font-medium text-background/80 backdrop-blur",
                  !reduce && "mr-2",
                )}
              >
                {s}
              </li>
            ))}
          </motion.ul>
        </div>
      </div>
    </motion.section>
  );
}

/* ------------------------------------------------------------------ */
/* Right side: top bar + animated form area                            */
/* ------------------------------------------------------------------ */

const TRUST = [
  { icon: Lock, text: "Encrypted" },
  { icon: ShieldCheck, text: "Secure login" },
  { icon: BadgeCheck, text: "Trusted by learners" },
];

export function AuthContentShell({
  children,
  tagline = "Learn Skills. Build Your Future.",
}) {
  const reduce = useReducedMotion();

  return (
    <div className="relative flex flex-1 flex-col">
      {/* Top bar */}
      <motion.div
        initial={reduce ? false : { opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex items-center justify-between"
      >
        <Link
          href="/"
          className="group inline-flex cursor-pointer items-center gap-1.5 rounded-md px-2 py-1.5 text-sm text-foreground/70 outline-none transition-colors duration-200 hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none"
        >
          <ArrowLeft
            aria-hidden="true"
            className="size-4 transition-transform duration-200 group-hover:-translate-x-1 motion-reduce:transition-none motion-reduce:group-hover:translate-x-0"
          />
          Back to home
        </Link>

        <Link
          href="/contact"
          className="group inline-flex cursor-pointer items-center gap-1.5 rounded-md px-2 py-1.5 text-sm text-foreground/70 outline-none transition-colors duration-200 hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none"
        >
          <LifeBuoy
            aria-hidden="true"
            className="size-4 transition-transform duration-300 group-hover:rotate-45 motion-reduce:transition-none motion-reduce:group-hover:rotate-0"
          />
          Need help?
        </Link>
      </motion.div>

      <div className="m-auto w-full max-w-md py-6 lg:py-8">
        {/* Mobile / tablet only: replaces the side panel */}
        <MobileHero tagline={tagline} reduce={reduce} />

        <motion.div
          initial={reduce ? false : { opacity: 0, y: 24, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.55, delay: reduce ? 0 : 0.2, ease: EASE }}
          className="relative"
        >
          {/* Glow behind the form (slowly breathes) */}
          <motion.div
            aria-hidden="true"
            animate={
              reduce
                ? undefined
                : { opacity: [0.6, 1, 0.6], scale: [1, 1.04, 1] }
            }
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            className="pointer-events-none absolute -inset-6 -z-10 rounded-3xl bg-primary/10 blur-3xl"
          />
          {children}
        </motion.div>

        {/* Trust row */}
        <motion.ul
          initial={reduce ? false : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="mt-8 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs text-foreground/60"
          aria-label="Security"
        >
          {TRUST.map(({ icon: Icon, text }) => (
            <li key={text} className="group inline-flex items-center gap-1.5">
              <Icon
                aria-hidden="true"
                className="size-3.5 text-primary transition-transform duration-200 group-hover:scale-125 motion-reduce:transition-none motion-reduce:group-hover:scale-100"
              />
              {text}
            </li>
          ))}
        </motion.ul>
      </div>
    </div>
  );
}
