// components/auth/AuthSidePanel.jsx
// Technology side panel + animated content shell for the (auth) route group.
"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
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
  Check,
  Code,
  LifeBuoy,
  Lock,
  Pause,
  Play,
  Rocket,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { AnimatedLogo } from "../layout/AnimatedLogo";

const EASE = [0.22, 1, 0.36, 1];

// Brand yellow: a small accent only (icons, dots). Light / dark variants.
const YELLOW = "text-[#E5A817] dark:text-[#FFC857]";

/* ------------------------------------------------------------------ */
/* Which auth page are we on? Drives copy, terminal script, steps.     */
/* ------------------------------------------------------------------ */

const ROUTES = ["/login", "/register", "/forgot-password", "/reset-password"];

function useAuthRoute() {
  const pathname = usePathname() || "";
  return (
    ROUTES.find((p) => pathname === p || pathname.startsWith(`${p}/`)) ?? null
  );
}

const DEFAULT_COPY =
  "Practical technology courses, real projects, and career guidance in one place.";

const PAGE_COPY = {
  "/login": "Welcome back. Pick up your learning right where you left off.",
  "/register":
    "Create your account and start building practical technology skills.",
  "/forgot-password": "Locked out? We'll help you get back in securely.",
  "/reset-password": "Choose a new password and you're back in business.",
};

/* ------------------------------------------------------------------ */
/* Canvas: connected network nodes + faint falling code characters     */
/* Draws in the theme's primary colour, so it works in light and dark. */
/* `still` = reduced motion OR the person pressed "Pause animation".   */
/* ------------------------------------------------------------------ */

const CHARS = "01{}<>/;=()[]";

function TechNetwork({ still, className }) {
  const canvasRef = useRef(null);
  const probeRef = useRef(null);

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
      const count = Math.max(16, Math.round((w * h) / 16000));
      nodes = Array.from({ length: count }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        r: 1 + Math.random() * 1.5,
      }));
      drops = Array.from({ length: Math.floor(w / COL) }, () => ({
        y: Math.random() * h,
        speed: 0.4 + Math.random() * 0.9,
        ch: CHARS[Math.floor(Math.random() * CHARS.length)],
      }));
    };

    function draw(animateFrame) {
      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = color;
      ctx.strokeStyle = color;

      // Falling code characters (very faint)
      ctx.font = "12px monospace";
      ctx.globalAlpha = 0.1;
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

      // Connection lines (the pointer acts as an extra node)
      const pts = pointer.x > -9000 ? [...nodes, pointer] : nodes;
      ctx.lineWidth = 1;
      for (let i = 0; i < pts.length; i++) {
        for (let j = i + 1; j < pts.length; j++) {
          const dx = pts[i].x - pts[j].x;
          const dy = pts[i].y - pts[j].y;
          const dist = Math.hypot(dx, dy);
          if (dist < LINK) {
            ctx.globalAlpha = (1 - dist / LINK) * 0.3;
            ctx.beginPath();
            ctx.moveTo(pts[i].x, pts[i].y);
            ctx.lineTo(pts[j].x, pts[j].y);
            ctx.stroke();
          }
        }
      }

      // Nodes
      ctx.globalAlpha = 0.6;
      for (const n of nodes) {
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    }

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
      if (still) draw(false);
    };

    const loop = () => {
      // Skip work when the tab is hidden or the canvas is not on screen
      if (!document.hidden && visible) {
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

    // Repaint right away when the theme class changes (also covers still mode)
    const mo = new MutationObserver(() => {
      readColor();
      if (still) draw(false);
    });
    mo.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class", "data-theme", "style"],
    });

    if (still) {
      draw(false); // one still frame
    } else {
      window.addEventListener("pointermove", onMove, { passive: true });
      raf = requestAnimationFrame(loop);
    }

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      mo.disconnect();
      window.removeEventListener("pointermove", onMove);
    };
  }, [still]);

  return (
    <>
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        className={cn("absolute inset-0 size-full", className)}
      />
      {/* Invisible element used to read the theme's primary colour */}
      <span
        ref={probeRef}
        aria-hidden="true"
        className="absolute size-0 text-primary opacity-0"
      />
    </>
  );
}

function GridBackdrop() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 text-foreground opacity-[0.05] [background-image:linear-gradient(to_right,currentColor_1px,transparent_1px),linear-gradient(to_bottom,currentColor_1px,transparent_1px)] [background-size:48px_48px] [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_80%)]"
    />
  );
}

/* ------------------------------------------------------------------ */
/* Terminal card: a decorative code window (dark in both themes).      */
/* The script changes with the page being shown.                       */
/* ------------------------------------------------------------------ */

const cmd = (text) => ({ text, tone: "text-slate-100" });
const info = (text) => ({ text, tone: "text-slate-400" });
const ok = (text) => ({ text, tone: "text-emerald-400" });

const SCRIPTS = {
  "/login": [
    cmd("$ apni login --secure"),
    info("Verifying your account…"),
    ok("✔ Session started"),
    cmd("$ apni open courses"),
    ok("✔ Your skills path is ready"),
  ],
  "/register": [
    cmd("$ apni signup"),
    info("Creating your learner profile…"),
    ok("✔ Account created"),
    cmd("$ apni start --path"),
    ok("✔ Ready to build real skills"),
  ],
  "/forgot-password": [
    cmd("$ apni reset-password"),
    info("Sending a secure link…"),
    ok("✔ Check your inbox"),
    cmd("$ apni login"),
    ok("✔ Back in, ready to learn"),
  ],
  "/reset-password": [
    cmd("$ apni reset-password --confirm"),
    info("Verifying your link…"),
    ok("✔ Link verified"),
    cmd("$ apni password --update"),
    ok("✔ You're all set"),
  ],
};

function Terminal({ script, still }) {
  const [count, setCount] = useState(0);
  const shown = still ? script.length : count;

  useEffect(() => {
    if (still) return;
    const timer = setTimeout(
      () => setCount((c) => (c >= script.length ? 0 : c + 1)),
      count >= script.length ? 3200 : 900,
    );
    return () => clearTimeout(timer);
  }, [count, still, script.length]);

  return (
    <div
      aria-hidden="true"
      className="w-full max-w-md overflow-hidden rounded-xl border border-border bg-[#0D121C] shadow-xl shadow-foreground/10"
    >
      <div className="flex items-center gap-1.5 border-b border-white/10 px-4 py-2.5">
        <span className="size-2.5 rounded-full bg-red-400/80" />
        <span className="size-2.5 rounded-full bg-amber-400/80" />
        <span className="size-2.5 rounded-full bg-emerald-400/80" />
        <span className="ml-2 font-mono text-[11px] text-slate-400">
          apni-university.sh
        </span>
      </div>

      <div className="min-h-[9.5rem] space-y-1.5 p-4 font-mono text-xs leading-relaxed">
        {script.slice(0, shown).map((l) => (
          <motion.p
            key={l.text}
            initial={still ? false : { opacity: 0, x: -6 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.25 }}
            className={l.tone}
          >
            {l.text}
          </motion.p>
        ))}
        <span className="inline-block h-3.5 w-1.5 translate-y-0.5 bg-slate-100 motion-safe:animate-pulse" />
      </div>

      {/* Progress bar that follows the lines */}
      <div className="h-0.5 w-full bg-white/10">
        <motion.div
          animate={{ width: `${(shown / script.length) * 100}%` }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="h-full bg-gradient-to-r from-primary to-emerald-400"
        />
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Recovery steps: shown on the forgot / reset password pages          */
/* ------------------------------------------------------------------ */

const RECOVERY_STEPS = [
  "Request a reset link",
  "Check your email",
  "Set a new password",
];

// /forgot-password covers steps 1-2, /reset-password is step 3
const RECOVERY_CURRENT = { "/forgot-password": 0, "/reset-password": 2 };

function RecoverySteps({ route }) {
  const current = RECOVERY_CURRENT[route];
  if (current === undefined) return null;

  return (
    <ol
      aria-label="Password recovery steps"
      className="mt-6 max-w-md space-y-2.5"
    >
      {RECOVERY_STEPS.map((label, i) => {
        const done = i < current;
        const active = i === current;
        return (
          <li
            key={label}
            aria-current={active ? "step" : undefined}
            className="flex items-center gap-3 text-sm"
          >
            <span
              className={cn(
                "grid size-7 shrink-0 place-items-center rounded-full border text-xs font-semibold",
                done && "border-primary bg-primary text-primary-foreground",
                active && "border-primary bg-primary/10 text-primary",
                !done &&
                  !active &&
                  "border-border bg-card text-muted-foreground",
              )}
            >
              {done ? <Check aria-hidden="true" className="size-3.5" /> : i + 1}
            </span>
            <span
              className={cn(
                active
                  ? "font-medium text-foreground"
                  : "text-muted-foreground",
              )}
            >
              {label}
            </span>
          </li>
        );
      })}
    </ol>
  );
}

/* ------------------------------------------------------------------ */
/* Optional real content: stats + testimonials (passed in as props)    */
/* ------------------------------------------------------------------ */

function CountUp({ to, suffix = "", reduce }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  const [n, setN] = useState(reduce ? to : 0);

  useEffect(() => {
    if (reduce || !inView) return;
    const controls = animate(0, to, {
      duration: 1.6,
      delay: 0.4,
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

function Stats({ stats, reduce, className }) {
  return (
    <motion.dl
      initial={reduce ? false : { opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.5, ease: EASE }}
      className={cn(
        "grid divide-x divide-border rounded-xl border border-border bg-card",
        className,
      )}
      style={{ gridTemplateColumns: `repeat(${stats.length}, minmax(0, 1fr))` }}
    >
      {stats.map((s) => (
        <div key={s.label} className="px-4 py-3 text-center">
          <dt className="sr-only">{s.label}</dt>
          <dd className="font-serif text-2xl leading-none text-card-foreground">
            <CountUp to={s.value} suffix={s.suffix} reduce={reduce} />
          </dd>
          <p aria-hidden="true" className="mt-1 text-xs text-muted-foreground">
            {s.label}
          </p>
        </div>
      ))}
    </motion.dl>
  );
}

function Testimonials({ items, still }) {
  const [i, setI] = useState(0);

  useEffect(() => {
    if (still || items.length < 2) return;
    const id = setInterval(() => setI((c) => (c + 1) % items.length), 6000);
    return () => clearInterval(id);
  }, [still, items.length]);

  const t = items[i];

  return (
    <figure className="max-w-md rounded-xl border border-border bg-card p-4 text-card-foreground">
      <div className="min-h-[5.5rem]">
        <AnimatePresence mode="wait">
          <motion.div
            key={i}
            initial={still ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={still ? undefined : { opacity: 0, y: -8 }}
            transition={{ duration: 0.3 }}
          >
            <blockquote className="text-sm leading-relaxed">
              “{t.quote}”
            </blockquote>
            <figcaption className="mt-3 flex items-center gap-2.5">
              <span className="grid size-7 place-items-center rounded-full bg-primary text-[11px] font-semibold text-primary-foreground">
                {t.name?.[0]}
              </span>
              <span className="text-xs text-muted-foreground">
                <span className="font-medium text-foreground">{t.name}</span>
                {t.role ? ` · ${t.role}` : ""}
              </span>
            </figcaption>
          </motion.div>
        </AnimatePresence>
      </div>

      {items.length > 1 && (
        <div
          className="mt-3 flex gap-1.5"
          role="tablist"
          aria-label="Choose testimonial"
        >
          {items.map((item, idx) => (
            <button
              key={`${item.name}-${idx}`}
              type="button"
              role="tab"
              aria-selected={idx === i}
              aria-label={`Show testimonial from ${item.name}`}
              onClick={() => setI(idx)}
              className="grid h-4 place-items-center rounded-full px-0.5 outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <span
                className={cn(
                  "h-1 rounded-full bg-primary transition-all duration-300 motion-reduce:transition-none",
                  idx === i ? "w-5 opacity-100" : "w-1.5 opacity-30",
                )}
              />
            </button>
          ))}
        </div>
      )}
    </figure>
  );
}

/* ------------------------------------------------------------------ */
/* Shared: animated heading (words rise in, last word in brand blue)   */
/* ------------------------------------------------------------------ */

function AnimatedHeading({
  tagline,
  reduce,
  className,
  step = 0.08,
  start = 0.1,
}) {
  const lines = tagline.split(/(?<=\.)\s+/);
  let wordIndex = 0;

  return (
    <h2 className={className}>
      {lines.map((line, li) => {
        const words = line.split(" ");
        return (
          <span key={line} className="block">
            {words.map((word, wi) => {
              const idx = wordIndex++;
              const accent = li === lines.length - 1 && wi === words.length - 1;
              return (
                <motion.span
                  key={`${word}-${wi}`}
                  initial={reduce ? false : { opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.5,
                    delay: start + idx * step,
                    ease: EASE,
                  }}
                  className={cn(
                    "mr-[0.25em] inline-block",
                    accent && "text-primary",
                  )}
                >
                  {word}
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

const DEFAULT_TOPICS = [
  "AI",
  "Software Engineering",
  "Automation",
  "Cloud",
  "Emerging Tech",
];

const POINTS = [
  { icon: Rocket, text: "Pick up exactly where you left off" },
  { icon: Award, text: "Track your progress across every course" },
  { icon: ShieldCheck, text: "Your account is protected and private" },
];

export function AuthSidePanel({
  siteName,
  tagline,
  year,
  topics = DEFAULT_TOPICS,
  stats, // optional: [{ value: 120, suffix: "+", label: "Courses" }] real numbers only
  testimonials, // optional: [{ quote, name, role }] real testimonials only
}) {
  const reduce = useReducedMotion();
  const route = useAuthRoute();
  const copy = (route && PAGE_COPY[route]) || DEFAULT_COPY;
  const script = SCRIPTS[route] ?? SCRIPTS["/login"];

  // "Pause animation": WCAG 2.2.2, moving content that lasts > 5s can be stopped
  const [paused, setPaused] = useState(false);
  const still = Boolean(reduce) || paused;

  const hasStats = Array.isArray(stats) && stats.length > 0;
  const hasTestimonials =
    Array.isArray(testimonials) && testimonials.length > 0;

  // Spotlight that follows the pointer (rendered through a mask)
  const mx = useMotionValue(-400);
  const my = useMotionValue(-400);
  const sx = useSpring(mx, { stiffness: 140, damping: 20 });
  const sy = useSpring(my, { stiffness: 140, damping: 20 });
  const mask = useMotionTemplate`radial-gradient(320px circle at ${sx}px ${sy}px, black, transparent 70%)`;

  const onMove = (e) => {
    if (still) return;
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
      aria-label={`About ${siteName}`}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
      className="relative hidden flex-col justify-between gap-8 overflow-hidden border-r border-border bg-muted/50 p-10 text-foreground lg:flex xl:p-14"
    >
      <GridBackdrop />
      <TechNetwork still={still} />

      {/* Pointer spotlight */}
      <motion.div
        aria-hidden="true"
        style={{ maskImage: mask, WebkitMaskImage: mask }}
        className="pointer-events-none absolute inset-0 bg-primary/10"
      />

      {/* Soft static glows */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-24 -top-24 size-80 rounded-full bg-primary/15 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-28 -right-20 size-96 rounded-full bg-primary/10 blur-3xl"
      />

      {/* Top: logo */}
      <motion.div
        initial={reduce ? false : { opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: EASE }}
        className="relative"
      >
        <AnimatedLogo size="lg" tagline="Learn Skills. Build Your Future." />
      </motion.div>

      {/* Middle: message, steps / stats, terminal, topics */}
      <div className="relative">
        <motion.span
          initial={reduce ? false : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: EASE }}
          className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-card-foreground"
        >
          <Code aria-hidden="true" className="size-3.5 text-primary" />
          Technology education
          <Sparkles aria-hidden="true" className={cn("size-3", YELLOW)} />
        </motion.span>

        <AnimatedHeading
          tagline={tagline}
          reduce={reduce}
          className="mt-5 font-serif text-[clamp(2rem,3.2vw,3rem)] leading-[1.1] tracking-tight"
        />

        <motion.p
          key={copy}
          initial={reduce ? false : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4, ease: EASE }}
          className="mt-4 max-w-sm text-muted-foreground"
        >
          {copy}
        </motion.p>

        <RecoverySteps route={route} />

        {hasStats && (
          <Stats stats={stats} reduce={reduce} className="mt-6 max-w-md" />
        )}

        {/* Terminal (hidden on short screens) */}
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6, ease: EASE }}
          className="mt-6 [@media(max-height:820px)]:hidden"
        >
          <Terminal key={route ?? "default"} script={script} still={still} />
        </motion.div>

        {/* Topic chips */}
        <ul className="mt-6 flex max-w-md flex-wrap gap-2" aria-label="Topics">
          {topics.map((s, i) => (
            <motion.li
              key={s}
              initial={reduce ? false : { opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: 0.8 + i * 0.06 }}
              className="rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-card-foreground transition-colors duration-200 hover:border-primary/50 hover:text-primary motion-reduce:transition-none"
            >
              {s}
            </motion.li>
          ))}
        </ul>
      </div>

      {/* Bottom: testimonials (if provided), points, copyright + pause */}
      <div className="relative">
        {hasTestimonials && (
          <div className="mb-6 [@media(max-height:940px)]:hidden">
            <Testimonials items={testimonials} still={still} />
          </div>
        )}

        <ul className="space-y-3">
          {POINTS.map(({ icon: Icon, text }, i) => (
            <motion.li
              key={text}
              initial={reduce ? false : { opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.45, delay: 0.3 + i * 0.1 }}
              className="group flex items-center gap-3 text-sm text-foreground"
            >
              <span className="grid size-8 shrink-0 place-items-center rounded-lg border border-border bg-card text-primary transition-colors duration-200 group-hover:border-primary/40 group-hover:bg-primary/10 motion-reduce:transition-none">
                <Icon aria-hidden="true" className="size-4" />
              </span>
              {text}
            </motion.li>
          ))}
        </ul>

        <div className="mt-8 flex items-center justify-between gap-3">
          <p className="text-xs text-muted-foreground">
            © {year} {siteName}
          </p>

          {/* Not needed when the system already asks for reduced motion */}
          {!reduce && (
            <button
              type="button"
              onClick={() => setPaused((p) => !p)}
              aria-pressed={paused}
              className="inline-flex min-h-8 items-center gap-1.5 rounded-md border border-border bg-card px-2.5 text-xs font-medium text-card-foreground outline-none transition-colors duration-200 hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none"
            >
              {paused ? (
                <Play aria-hidden="true" className="size-3.5" />
              ) : (
                <Pause aria-hidden="true" className="size-3.5" />
              )}
              {paused ? "Play animation" : "Pause animation"}
            </button>
          )}
        </div>
      </div>
    </aside>
  );
}

/* ------------------------------------------------------------------ */
/* Mobile hero (only below lg, the side panel is hidden there)         */
/* Compact on purpose, so the form stays near the top of the screen.   */
/* ------------------------------------------------------------------ */

function MobileHero({ tagline, topics, reduce }) {
  const route = useAuthRoute();
  const copy = (route && PAGE_COPY[route]) || DEFAULT_COPY;

  return (
    <motion.section
      initial={reduce ? false : { opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: EASE }}
      className="relative mb-6 overflow-hidden rounded-2xl border border-border bg-muted/50 p-5 sm:p-6 lg:hidden"
    >
      <GridBackdrop />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-12 -top-12 size-44 rounded-full bg-primary/15 blur-3xl"
      />

      <div className="relative">
        <AnimatedLogo size="sm" />

        <AnimatedHeading
          tagline={tagline}
          reduce={reduce}
          className="mt-4 font-serif text-3xl leading-tight tracking-tight"
          step={0.07}
          start={0.1}
        />

        <p className="mt-3 text-sm text-muted-foreground">{copy}</p>

        <ul className="mt-4 flex flex-wrap gap-2" aria-label="Topics">
          {topics.map((s) => (
            <li
              key={s}
              className="rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-card-foreground"
            >
              {s}
            </li>
          ))}
        </ul>
      </div>
    </motion.section>
  );
}

/* ------------------------------------------------------------------ */
/* Right side: top bar + animated form area                            */
/* ------------------------------------------------------------------ */

const TRUST = [
  { icon: Lock, text: "Encrypted connection" },
  { icon: ShieldCheck, text: "Secure login" },
];

const topLink =
  "group inline-flex min-h-9 items-center gap-1.5 rounded-md px-2 py-1.5 text-sm text-muted-foreground outline-none transition-colors duration-200 hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none";

export function AuthContentShell({
  children,
  tagline = "Learn Skills. Build Your Future.",
  topics = DEFAULT_TOPICS,
}) {
  const reduce = useReducedMotion();

  return (
    <div className="relative flex flex-1 flex-col">
      {/* Top bar: back link, help, and the theme toggle */}
      <motion.div
        initial={reduce ? false : { opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="flex items-center justify-between gap-2"
      >
        <Link href="/" className={topLink}>
          <ArrowLeft
            aria-hidden="true"
            className="size-4 transition-transform duration-200 group-hover:-translate-x-1 motion-reduce:transition-none motion-reduce:group-hover:translate-x-0"
          />
          Back to home
        </Link>

        <div className="flex items-center gap-1">
          <Link href="/contact" className={topLink}>
            <LifeBuoy aria-hidden="true" className="size-4" />
            Need help?
          </Link>
        </div>
      </motion.div>

      <div className="m-auto w-full max-w-md py-6 lg:py-8">
        {/* Mobile / tablet only: replaces the side panel */}
        <MobileHero tagline={tagline} topics={topics} reduce={reduce} />

        <motion.div
          initial={reduce ? false : { opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: reduce ? 0 : 0.15, ease: EASE }}
          className="relative"
        >
          {/* Soft glow behind the form */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -inset-6 -z-10 rounded-3xl bg-primary/10 blur-3xl"
          />
          {children}
        </motion.div>

        {/* Trust row */}
        <motion.ul
          initial={reduce ? false : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.4 }}
          className="mt-8 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs text-muted-foreground"
          aria-label="Security"
        >
          {TRUST.map(({ icon: Icon, text }) => (
            <li key={text} className="inline-flex items-center gap-1.5">
              <Icon aria-hidden="true" className="size-3.5 text-primary" />
              {text}
            </li>
          ))}
        </motion.ul>
      </div>
    </div>
  );
}
