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
import { Cloud, Code, Cpu, Database, Terminal } from "lucide-react";

// Fixed data (no Math.random) so server and client HTML always match.
// Coordinates are for a 1440 x 900 viewBox.
const NODES = [
  [120, 140],
  [330, 260],
  [210, 470],
  [420, 640],
  [640, 120],
  [900, 230],
  [1120, 110],
  [1300, 300],
  [1180, 520],
  [980, 680],
  [760, 560],
  [560, 420],
  [150, 800],
  [1350, 780],
  [820, 840],
];

// [from, to, animated flow?]
const EDGES = [
  [0, 1, true],
  [1, 2, false],
  [2, 3, true],
  [1, 4, false],
  [4, 5, true],
  [5, 6, false],
  [6, 7, true],
  [7, 8, false],
  [8, 9, true],
  [9, 10, false],
  [10, 11, true],
  [11, 1, false],
  [11, 3, false],
  [5, 10, false],
  [3, 12, true],
  [9, 13, false],
  [10, 14, false],
];

// Nodes that softly pulse (kept few on purpose).
const PULSING = new Set([1, 5, 8, 10, 3]);

// Small signals that travel along real edges of the network.
const SIGNALS = [
  { d: "M120 140 L330 260 L640 120 L900 230 L1120 110", dur: 16, begin: 0 },
  { d: "M1300 300 L1180 520 L980 680 L760 560 L560 420", dur: 19, begin: 4 },
  { d: "M150 800 L420 640 L560 420 L330 260", dur: 17, begin: 9 },
];

// A few faint tech icons (md and up only).
const ICONS = [
  { Icon: Code, className: "left-[6%] top-[22%]", size: 26, delay: 0 },
  { Icon: Cpu, className: "right-[8%] top-[14%]", size: 30, delay: 2 },
  { Icon: Cloud, className: "left-[12%] bottom-[18%]", size: 30, delay: 4 },
  { Icon: Terminal, className: "right-[12%] bottom-[24%]", size: 26, delay: 1 },
  { Icon: Database, className: "left-[48%] top-[8%]", size: 22, delay: 3 },
];

// CSS animations only run when the user has not asked for reduced motion.
const KEYFRAMES = `
@keyframes sb-drift-a { 0%,100% { transform: translate3d(0,0,0) scale(1); } 50% { transform: translate3d(8vw,6vh,0) scale(1.12); } }
@keyframes sb-drift-b { 0%,100% { transform: translate3d(0,0,0) scale(1); } 50% { transform: translate3d(-7vw,-5vh,0) scale(1.08); } }
@keyframes sb-drift-c { 0%,100% { transform: translate3d(0,0,0); } 50% { transform: translate3d(6vw,-4vh,0); } }
@keyframes sb-pulse { 0%,100% { opacity: .3; } 50% { opacity: 1; } }
@keyframes sb-flow { to { stroke-dashoffset: -48; } }
@keyframes sb-float { 0%,100% { transform: translate3d(0,0,0); } 50% { transform: translate3d(0,-12px,0); } }
@media (prefers-reduced-motion: no-preference) {
  .sb-a { animation: sb-drift-a 30s ease-in-out infinite; will-change: transform; }
  .sb-b { animation: sb-drift-b 36s ease-in-out infinite; will-change: transform; }
  .sb-c { animation: sb-drift-c 42s ease-in-out infinite; will-change: transform; }
  .sb-pulse { animation: sb-pulse 4.5s ease-in-out infinite; }
  .sb-flow { animation: sb-flow 7s linear infinite; }
  .sb-float { animation: sb-float 12s ease-in-out infinite; will-change: transform; }
}
`;

export function SiteBackground() {
  const reduce = useReducedMotion();

  // Parallax: layers drift at different speeds as the page scrolls
  const { scrollYProgress } = useScroll();
  const auroraY = useTransform(scrollYProgress, [0, 1], ["0vh", "-25vh"]);
  const networkY = useTransform(scrollYProgress, [0, 1], ["0vh", "-8vh"]);

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
      // Blue / sky / gold accents per theme. Intensities are lower in light mode.
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden [--bg-a:0.13] [--bg-blue:37_99_235] [--bg-gold:245_184_46] [--bg-icon:0.2] [--bg-line:0.16] [--bg-sky:14_165_233] dark:[--bg-a:0.2] dark:[--bg-blue:79_140_255] dark:[--bg-gold:255_200_87] dark:[--bg-icon:0.28] dark:[--bg-line:0.26] dark:[--bg-sky:141_203_255]"
    >
      <style>{KEYFRAMES}</style>

      {/* Top light */}
      <div
        className="absolute inset-x-0 top-0 h-80"
        style={{
          background:
            "linear-gradient(to bottom, rgb(var(--bg-blue) / calc(var(--bg-a) * 0.7)), transparent)",
        }}
      />

      {/* Aurora glows (gradients, not blur filters: cheap to animate) */}
      <motion.div
        style={reduce ? undefined : { y: auroraY }}
        className="absolute inset-0"
      >
        <div
          className="sb-a absolute -left-[25vmax] -top-[30vmax] size-[75vmax]"
          style={{
            background:
              "radial-gradient(closest-side, rgb(var(--bg-blue) / calc(var(--bg-a) * 1.3)), transparent)",
          }}
        />
        <div
          className="sb-b absolute -right-[28vmax] top-[22%] size-[70vmax]"
          style={{
            background:
              "radial-gradient(closest-side, rgb(var(--bg-sky) / calc(var(--bg-a) * 1.1)), transparent)",
          }}
        />
        <div
          className="sb-c absolute -bottom-[30vmax] left-[18%] size-[50vmax]"
          style={{
            background:
              "radial-gradient(closest-side, rgb(var(--bg-gold) / calc(var(--bg-a) * 0.55)), transparent)",
          }}
        />
      </motion.div>

      {/* Fine dot grid, fades out in the middle so text stays readable */}
      <div
        className="absolute inset-0 text-foreground opacity-[0.07]"
        style={{
          backgroundImage: "radial-gradient(currentColor 1px, transparent 1px)",
          backgroundSize: "28px 28px",
          maskImage:
            "radial-gradient(ellipse at center, transparent 20%, black 85%)",
          WebkitMaskImage:
            "radial-gradient(ellipse at center, transparent 20%, black 85%)",
        }}
      />

      {/* Knowledge-node network with scroll parallax */}
      <motion.div
        style={reduce ? undefined : { y: networkY }}
        className="absolute inset-x-0 -bottom-[10vh] -top-[10vh]"
      >
        <svg
          viewBox="0 0 1440 900"
          preserveAspectRatio="xMidYMid slice"
          className="size-full [mask-image:radial-gradient(ellipse_at_center,rgba(0,0,0,0.3),black_85%)] [-webkit-mask-image:radial-gradient(ellipse_at_center,rgba(0,0,0,0.3),black_85%)]"
          style={{ color: "rgb(var(--bg-blue))" }}
          fill="none"
        >
          {EDGES.map(([a, b, flow]) => (
            <line
              key={`${a}-${b}`}
              x1={NODES[a][0]}
              y1={NODES[a][1]}
              x2={NODES[b][0]}
              y2={NODES[b][1]}
              stroke="currentColor"
              strokeWidth="1.25"
              strokeDasharray={flow ? "4 8" : undefined}
              className={flow ? "sb-flow" : undefined}
              style={{ strokeOpacity: "var(--bg-line)" }}
            />
          ))}

          {NODES.map(([cx, cy], i) => (
            <circle
              key={i}
              cx={cx}
              cy={cy}
              r={4}
              fill="currentColor"
              className={PULSING.has(i) ? "sb-pulse" : undefined}
              style={{
                opacity: 0.5,
                animationDelay: PULSING.has(i) ? `${i * 0.5}s` : undefined,
              }}
            />
          ))}

          {/* Signals travelling along the lines (skipped for reduced motion) */}
          {!reduce &&
            SIGNALS.map((s) => (
              <g key={s.d} style={{ color: "rgb(var(--bg-gold))" }}>
                <circle r="9" fill="currentColor" opacity="0.18">
                  <animateMotion
                    dur={`${s.dur}s`}
                    begin={`${s.begin}s`}
                    repeatCount="indefinite"
                    path={s.d}
                  />
                </circle>
                <circle r="3.5" fill="currentColor" opacity="0.9">
                  <animateMotion
                    dur={`${s.dur}s`}
                    begin={`${s.begin}s`}
                    repeatCount="indefinite"
                    path={s.d}
                  />
                </circle>
              </g>
            ))}
        </svg>
      </motion.div>

      {/* A few faint tech icons (md and up) */}
      {ICONS.map(({ Icon, className, size, delay }) => (
        <span
          key={className}
          className={`sb-float absolute hidden md:block ${className}`}
          style={{
            color: "rgb(var(--bg-blue) / var(--bg-icon))",
            animationDelay: `${delay}s`,
          }}
        >
          <Icon style={{ width: size, height: size }} />
        </span>
      ))}

      {/* Spotlight that follows the cursor */}
      {!reduce && (
        <motion.div
          style={{
            x: sx,
            y: sy,
            background:
              "radial-gradient(closest-side, rgb(var(--bg-blue) / calc(var(--bg-a) * 1.1)), transparent)",
          }}
          className="absolute left-0 top-0 -ml-64 -mt-64 size-[32rem] rounded-full"
        />
      )}
    </div>
  );
}
