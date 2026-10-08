"use client";

import { useEffect, useRef, useState } from "react";
import { animate, motion, useInView, useReducedMotion } from "framer-motion";
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

// Fades and slides its children in when they scroll into view.
export function Reveal({ children, delay = 0, y = 24, className }) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.55, delay, ease: EASE }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// Drifting glows + dotted grid behind the top of the page.
export function AIGlows() {
  const reduce = useReducedMotion();
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[36rem] overflow-hidden"
    >
      <motion.div
        animate={reduce ? undefined : { x: [0, 40, 0], y: [0, 30, 0] }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -left-24 -top-24 size-80 rounded-full bg-primary/15 blur-3xl"
      />
      <motion.div
        animate={reduce ? undefined : { x: [0, -40, 0], y: [0, 30, 0] }}
        transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -right-24 top-10 size-80 rounded-full bg-highlight/25 blur-3xl"
      />
      <div className="absolute inset-0 opacity-60 [background-image:radial-gradient(var(--border)_1px,transparent_1px)] [background-size:22px_22px] [mask-image:linear-gradient(to_bottom,black,transparent_85%)]" />
    </div>
  );
}

// Counts up once when it scrolls into view.
export function CountUp({ to, suffix = "" }) {
  const reduce = useReducedMotion();
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  const [n, setN] = useState(reduce ? to : 0);

  useEffect(() => {
    if (!inView || reduce) return;
    const controls = animate(0, to, {
      duration: 1.6,
      ease: "easeOut",
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

export function ToolsMarquee() {
  const reduce = useReducedMotion();
  const items = reduce ? TOOLS : [...TOOLS, ...TOOLS];
  return (
    <div className="overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_12%,black_88%,transparent)]">
      <motion.ul
        className={
          reduce
            ? "flex flex-wrap justify-center gap-x-8 gap-y-3"
            : "flex w-max"
        }
        animate={reduce ? undefined : { x: ["0%", "-50%"] }}
        transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
      >
        {items.map(({ name, icon: Icon }, i) => (
          <li
            key={`${name}-${i}`}
            aria-hidden={i >= TOOLS.length ? true : undefined}
            className={`flex items-center gap-2 text-muted-foreground ${
              reduce ? "" : "pr-10"
            }`}
          >
            <Icon className="size-5" aria-hidden="true" />
            <span className="text-sm font-medium">{name}</span>
          </li>
        ))}
      </motion.ul>
    </div>
  );
}
