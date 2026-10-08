// components/layout/SiteBackground.jsx
// Fixed, full-site animated background. Sits behind all content.
"use client";

import { useEffect } from "react";
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from "framer-motion";
import {
  Braces,
  Cloud,
  Code, 
  Cpu,
  Database,
  Lightbulb,
  Rocket,
  Sparkles,
  Terminal,
} from "lucide-react";

// Fixed positions (no Math.random) so server and client HTML always match.
const FLOATERS = [
  { Icon: Code, left: "5%", size: 26, dur: 34, delay: 0 },
  { Icon: Braces, left: "14%", size: 20, dur: 40, delay: 9 },
  { Icon: Terminal, left: "24%", size: 24, dur: 36, delay: 4 },
  { Icon: Cpu, left: "35%", size: 28, dur: 44, delay: 14 },
  { Icon: Database, left: "46%", size: 20, dur: 38, delay: 2 },
  { Icon: Cloud, left: "57%", size: 30, dur: 42, delay: 11 },
  { Icon: Rocket, left: "68%", size: 24, dur: 35, delay: 6 },
  { Icon: Lightbulb, left: "78%", size: 22, dur: 41, delay: 17 },
  { Icon: Sparkles, left: "88%", size: 20, dur: 33, delay: 8 },
  { Icon: Code, left: "95%", size: 18, dur: 39, delay: 21 },
];

export function SiteBackground() {
  const reduce = useReducedMotion();

  // Parallax: the glows drift slowly as the page scrolls
  const { scrollYProgress } = useScroll();
  const parallaxA = useTransform(scrollYProgress, [0, 1], ["0vh", "-35vh"]);
  const parallaxB = useTransform(scrollYProgress, [0, 1], ["0vh", "25vh"]);

  // Soft spotlight that follows the mouse (desktop only)
  const mx = useMotionValue(-1000);
  const my = useMotionValue(-1000);
  const sx = useSpring(mx, { stiffness: 60, damping: 20, mass: 0.6 });
  const sy = useSpring(my, { stiffness: 60, damping: 20, mass: 0.6 });

  useEffect(() => {
    if (reduce) return;
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)");
    if (!fine.matches) return;

    const onMove = (e) => {
      mx.set(e.clientX);
      my.set(e.clientY);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, [reduce, mx, my]);

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
    >
      {/* Dotted grid, fades out towards the edges */}
      <div className="absolute inset-0 text-foreground/[0.06] [background-image:radial-gradient(currentColor_1px,transparent_1px)] [background-size:26px_26px] [mask-image:radial-gradient(ellipse_at_center,black,transparent_75%)]" />

      {/* Top light */}
      <div className="absolute inset-x-0 top-0 h-72 bg-gradient-to-b from-primary/10 to-transparent" />

      {/* Aurora blobs: outer = scroll parallax, inner = slow drifting */}
      <motion.div style={{ y: parallaxA }} className="absolute -left-40 -top-24">
        <motion.div
          animate={
            reduce
              ? undefined
              : { x: [0, 120, 0], y: [0, 60, 0], scale: [1, 1.2, 1] }
          }
          transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
          className="size-[32rem] rounded-full bg-primary/15 blur-3xl will-change-transform"
        />
      </motion.div>

      <motion.div style={{ y: parallaxB }} className="absolute -right-40 top-1/3">
        <motion.div
          animate={
            reduce
              ? undefined
              : { x: [0, -110, 0], y: [0, -70, 0], scale: [1.1, 0.9, 1.1] }
          }
          transition={{ duration: 26, repeat: Infinity, ease: "easeInOut" }}
          className="size-[30rem] rounded-full bg-primary/10 blur-3xl will-change-transform"
        />
      </motion.div>

      <motion.div style={{ y: parallaxA }} className="absolute bottom-0 left-1/3">
        <motion.div
          animate={
            reduce
              ? undefined
              : { x: [0, 90, -60, 0], y: [0, -50, 40, 0] }
          }
          transition={{ duration: 30, repeat: Infinity, ease: "easeInOut" }}
          className="size-[26rem] rounded-full bg-primary/10 blur-3xl will-change-transform"
        />
      </motion.div>

      {/* Spotlight that follows the cursor */}
      {!reduce && (
        <motion.div
          style={{ x: sx, y: sy }}
          className="absolute left-0 top-0 -ml-48 -mt-48 size-96 rounded-full bg-primary/15 blur-3xl"
        />
      )}

      {/* Tech icons rising slowly through the whole screen */}
      {!reduce &&
        FLOATERS.map(({ Icon, left, size, dur, delay }, i) => (
          <motion.span
            key={`${left}-${i}`}
            className={`absolute -bottom-12 text-primary/25 ${
              i % 2 ? "hidden md:block" : ""
            }`}
            style={{ left }}
            initial={{ y: 0, opacity: 0 }}
            animate={{
              y: ["0vh", "-120vh"],
              x: [0, 18, -12, 10, 0],
              rotate: [0, 14, -10, 12, 0],
              opacity: [0, 0.9, 0.9, 0],
            }}
            transition={{
              duration: dur,
              delay,
              repeat: Infinity,
              ease: "linear",
              times: [0, 0.15, 0.85, 1],
            }}
          >
            <Icon style={{ width: size, height: size }} />
          </motion.span>
        ))}
    </div>
  );
}
