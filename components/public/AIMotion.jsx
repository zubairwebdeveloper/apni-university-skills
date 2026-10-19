"use client";

import { useEffect, useId, useRef, useState } from "react";
import {
  animate,
  motion,
  useAnimationFrame,
  useInView,
  useMotionValue,
  useReducedMotion,
} from "framer-motion";
import {
  SiHuggingface,
  SiJupyter,
  SiNumpy,
  SiPandas,
  SiPython,
  SiPytorch,
  SiTensorflow,
} from "react-icons/si";
import { FiCpu } from "react-icons/fi";

const EASE = [0.22, 1, 0.36, 1];

/* -------------------------------- Reveal ------------------------------- */

// Fades and slides its children in when they scroll into view.
export function Reveal({
  children,
  delay = 0,
  y = 24,
  className,
  once = true,
}) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once, margin: "-40px" }}
      transition={{ duration: 0.55, delay, ease: EASE }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* -------------------------------- AIGlows ------------------------------ */

// Drifting glows + dotted grid behind the top of the page.
export function AIGlows() {
  const reduce = useReducedMotion();
  const patternId = `dots-${useId().replace(/:/g, "")}`;

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[36rem] overflow-hidden"
    >
      <motion.div
        animate={reduce ? undefined : { x: [0, 40, 0], y: [0, 30, 0] }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -left-24 -top-24 size-80 rounded-full bg-primary/15 blur-3xl will-change-transform"
      />
      <motion.div
        animate={reduce ? undefined : { x: [0, -40, 0], y: [0, 30, 0] }}
        transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -right-24 top-10 size-80 rounded-full bg-highlight/25 blur-3xl will-change-transform"
      />

      {/* Dot grid drawn as SVG so it follows the theme's border color
          whatever format the CSS variable uses. */}
      <svg
        className="absolute inset-0 h-full w-full text-border opacity-70 [-webkit-mask-image:linear-gradient(to_bottom,black,transparent_85%)] [mask-image:linear-gradient(to_bottom,black,transparent_85%)]"
        fill="none"
      >
        <defs>
          <pattern
            id={patternId}
            width="22"
            height="22"
            patternUnits="userSpaceOnUse"
          >
            <circle cx="1" cy="1" r="1" fill="currentColor" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill={`url(#${patternId})`} />
      </svg>
    </div>
  );
}

/* -------------------------------- CountUp ------------------------------ */

// Counts up once when it scrolls into view.
export function CountUp({ to, suffix = "", duration = 1.6 }) {
  const reduce = useReducedMotion();
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  const [n, setN] = useState(0);

  useEffect(() => {
    if (!inView || reduce) return;
    const controls = animate(0, to, {
      duration,
      ease: "easeOut",
      onUpdate: (v) => setN(Math.round(v)),
    });
    return () => controls.stop();
  }, [inView, reduce, to, duration]);

  // With reduced motion the final value is shown immediately, even if the
  // preference only becomes known after the first render.
  const value = reduce ? to : n;

  return (
    <span ref={ref} className="tabular-nums">
      {value.toLocaleString("en-US")}
      {suffix}
    </span>
  );
}

/* ----------------------------- ToolsMarquee ---------------------------- */

const TOOLS = [
  { name: "Python", icon: SiPython },
  { name: "TensorFlow", icon: SiTensorflow },
  { name: "PyTorch", icon: SiPytorch },
  { name: "LLM APIs", icon: FiCpu },
  { name: "Hugging Face", icon: SiHuggingface },
  { name: "Jupyter", icon: SiJupyter },
  { name: "NumPy", icon: SiNumpy },
  { name: "Pandas", icon: SiPandas },
];

function ToolChip({ name, Icon }) {
  return (
    <li className="flex shrink-0 items-center gap-2.5 rounded-full border bg-card px-4 py-2 text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground">
      <Icon className="size-5 text-primary" aria-hidden="true" />
      <span className="whitespace-nowrap text-sm font-medium">{name}</span>
    </li>
  );
}

export function ToolsMarquee() {
  const reduce = useReducedMotion();
  const x = useMotionValue(0);
  const firstListRef = useRef(null);
  const paused = useRef(false);

  // Scrolls one list-width, then wraps seamlessly. Driving the position
  // manually lets the marquee pause on hover and keyboard focus.
  useAnimationFrame((_, delta) => {
    if (reduce || paused.current) return;
    const width = firstListRef.current?.offsetWidth;
    if (!width) return;
    const speed = width / 30; // px per second, one loop every 30s
    let next = x.get() - speed * (delta / 1000);
    if (next <= -width) next += width;
    x.set(next);
  });

  const pause = () => {
    paused.current = true;
  };
  const resume = () => {
    paused.current = false;
  };

  // Reduced motion: a static, wrapped list with no duplicates.
  if (reduce) {
    return (
      <ul className="flex flex-wrap justify-center gap-3">
        {TOOLS.map(({ name, icon: Icon }) => (
          <ToolChip key={name} name={name} Icon={Icon} />
        ))}
      </ul>
    );
  }

  return (
    <div
      onPointerEnter={pause}
      onPointerLeave={resume}
      onFocus={pause}
      onBlur={resume}
      className="overflow-hidden py-1 [-webkit-mask-image:linear-gradient(to_right,transparent,black_12%,black_88%,transparent)] [mask-image:linear-gradient(to_right,transparent,black_12%,black_88%,transparent)]"
    >
      <motion.div className="flex w-max" style={{ x }}>
        <ul ref={firstListRef} className="flex shrink-0 gap-3 pr-3">
          {TOOLS.map(({ name, icon: Icon }) => (
            <ToolChip key={name} name={name} Icon={Icon} />
          ))}
        </ul>
        {/* Duplicate list for the seamless loop, hidden from assistive tech */}
        <ul aria-hidden="true" className="flex shrink-0 gap-3 pr-3">
          {TOOLS.map(({ name, icon: Icon }) => (
            <ToolChip key={`${name}-copy`} name={name} Icon={Icon} />
          ))}
        </ul>
      </motion.div>
    </div>
  );
}
