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
import { Code, Cpu, Database, Globe, Layers3, Terminal } from "lucide-react";

/* -------------------------------------------------------------------------- */
/*                                  CONSTANTS                                 */
/* -------------------------------------------------------------------------- */

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
  [1040, 420],
  [370, 100],
  [60, 350],
];

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
  [5, 15, true],
  [15, 8, false],
  [16, 4, true],
  [16, 1, false],
  [17, 0, true],
  [17, 2, false],
];

const PULSING = new Set([1, 3, 5, 8, 10, 15]);

const SIGNALS = [
  {
    d: "M120 140 L330 260 L640 120 L900 230 L1120 110",
    dur: 18,
    begin: 0,
  },
  {
    d: "M1300 300 L1180 520 L980 680 L760 560 L560 420",
    dur: 22,
    begin: 3,
  },
  {
    d: "M150 800 L420 640 L560 420 L330 260",
    dur: 20,
    begin: 7,
  },
  {
    d: "M60 350 L120 140 L370 100 L640 120",
    dur: 17,
    begin: 4,
  },
];

const ICONS = [
  {
    Icon: Code,
    className: "left-[6%] top-[22%]",
    size: 27,
    delay: 0,
  },
  {
    Icon: Cpu,
    className: "right-[8%] top-[14%]",
    size: 30,
    delay: 2,
  },
  {
    Icon: Database,
    className: "left-[12%] bottom-[18%]",
    size: 27,
    delay: 4,
  },
  {
    Icon: Terminal,
    className: "right-[12%] bottom-[24%]",
    size: 26,
    delay: 1,
  },
  {
    Icon: Layers3,
    className: "left-[48%] top-[8%]",
    size: 24,
    delay: 3,
  },
  {
    Icon: Globe,
    className: "right-[28%] bottom-[12%]",
    size: 25,
    delay: 5,
  },
];

/* -------------------------------------------------------------------------- */
/*                                CSS ANIMATIONS                              */
/* -------------------------------------------------------------------------- */

const KEYFRAMES = `
@keyframes sb-drift-a {
  0%, 100% { transform: translate3d(0, 0, 0) scale(1); }
  50% { transform: translate3d(5vw, 4vh, 0) scale(1.08); }
}

@keyframes sb-drift-b {
  0%, 100% { transform: translate3d(0, 0, 0) scale(1); }
  50% { transform: translate3d(-5vw, -3vh, 0) scale(1.06); }
}

@keyframes sb-drift-c {
  0%, 100% { transform: translate3d(0, 0, 0); }
  50% { transform: translate3d(4vw, -3vh, 0); }
}

@keyframes sb-pulse {
  0%, 100% { opacity: 0.25; }
  50% { opacity: 0.9; }
}

@keyframes sb-flow {
  to { stroke-dashoffset: -48; }
}

@keyframes sb-float {
  0%, 100% { transform: translate3d(0, 0, 0); }
  50% { transform: translate3d(0, -10px, 0); }
}

@media (prefers-reduced-motion: no-preference) {
  .sb-a {
    animation: sb-drift-a 32s ease-in-out infinite;
  }

  .sb-b {
    animation: sb-drift-b 38s ease-in-out infinite;
  }

  .sb-c {
    animation: sb-drift-c 44s ease-in-out infinite;
  }

  .sb-pulse {
    animation: sb-pulse 5s ease-in-out infinite;
  }

  .sb-flow {
    animation: sb-flow 8s linear infinite;
  }

  .sb-float {
    animation: sb-float 12s ease-in-out infinite;
  }
}

@media (max-width: 767px) {
  .sb-network {
    opacity: 0.65;
  }

  .sb-grid {
    background-size: 24px 24px !important;
  }
}
`;

/* -------------------------------------------------------------------------- */
/*                              SITE BACKGROUND                               */
/* -------------------------------------------------------------------------- */

export function SiteBackground() {
  const reduce = useReducedMotion();

  /* Scroll-based parallax */
  const { scrollYProgress } = useScroll();

  const auroraY = useTransform(scrollYProgress, [0, 1], ["0vh", "-16vh"]);

  const networkY = useTransform(scrollYProgress, [0, 1], ["0vh", "-7vh"]);

  /* Mouse-following spotlight */
  const mx = useMotionValue(-1000);
  const my = useMotionValue(-1000);

  const sx = useSpring(mx, {
    stiffness: 55,
    damping: 24,
    mass: 0.7,
  });

  const sy = useSpring(my, {
    stiffness: 55,
    damping: 24,
    mass: 0.7,
  });

  useEffect(() => {
    if (reduce) return;

    const mediaQuery = window.matchMedia("(hover: hover) and (pointer: fine)");

    if (!mediaQuery.matches) return;

    const handlePointerMove = (event) => {
      mx.set(event.clientX);
      my.set(event.clientY);
    };

    window.addEventListener("pointermove", handlePointerMove, {
      passive: true,
    });

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
    };
  }, [reduce, mx, my]);

  return (
    <div
      aria-hidden="true"
      className={[
        "pointer-events-none fixed inset-0 -z-10",
        "overflow-hidden isolate",
        "[--bg-a:0.10]",
        "[--bg-purple:124_58_237]",
        "[--bg-yellow:234_179_8]",
        "[--bg-blue:59_130_246]",
        "[--bg-icon:0.15]",
        "[--bg-line:0.13]",
        "dark:[--bg-a:0.17]",
        "dark:[--bg-purple:167_139_250]",
        "dark:[--bg-yellow:250_204_21]",
        "dark:[--bg-blue:96_165_250]",
        "dark:[--bg-icon:0.23]",
        "dark:[--bg-line:0.22]",
      ].join(" ")}
    >
      <style>{KEYFRAMES}</style>

      {/* Base background lighting */}
      <div
        className="absolute inset-x-0 top-0 h-80"
        style={{
          background:
            "linear-gradient(to bottom, rgb(var(--bg-purple) / calc(var(--bg-a) * 0.55)), transparent)",
        }}
      />

      {/* Animated ambient lighting */}
      <motion.div
        style={reduce ? undefined : { y: auroraY }}
        className="absolute inset-0"
      >
        <div
          className={[
            "absolute -left-[24vmax] -top-[28vmax]",
            "size-[70vmax] rounded-full",
            reduce ? "" : "sb-a",
          ].join(" ")}
          style={{
            background:
              "radial-gradient(closest-side, rgb(var(--bg-purple) / calc(var(--bg-a) * 1.4)), transparent)",
          }}
        />

        <div
          className={[
            "absolute -right-[24vmax] top-[18%]",
            "size-[65vmax] rounded-full",
            reduce ? "" : "sb-b",
          ].join(" ")}
          style={{
            background:
              "radial-gradient(closest-side, rgb(var(--bg-blue) / calc(var(--bg-a) * 1.15)), transparent)",
          }}
        />

        <div
          className={[
            "absolute -bottom-[26vmax] left-[18%]",
            "size-[52vmax] rounded-full",
            reduce ? "" : "sb-c",
          ].join(" ")}
          style={{
            background:
              "radial-gradient(closest-side, rgb(var(--bg-yellow) / calc(var(--bg-a) * 0.55)), transparent)",
          }}
        />
      </motion.div>

      {/* Fine dot grid */}
      <div
        className="sb-grid absolute inset-0 text-foreground opacity-[0.055]"
        style={{
          backgroundImage:
            "radial-gradient(currentColor 0.8px, transparent 0.8px)",
          backgroundSize: "28px 28px",
          maskImage:
            "radial-gradient(ellipse at center, transparent 15%, black 88%)",
          WebkitMaskImage:
            "radial-gradient(ellipse at center, transparent 15%, black 88%)",
        }}
      />

      {/* Connected technology network */}
      <motion.div
        style={reduce ? undefined : { y: networkY }}
        className="sb-network absolute inset-x-0 -bottom-[8vh] -top-[8vh]"
      >
        <svg
          viewBox="0 0 1440 900"
          preserveAspectRatio="xMidYMid slice"
          className={[
            "size-full",
            "[mask-image:radial-gradient(ellipse_at_center,black_20%,transparent_90%)]",
            "[-webkit-mask-image:radial-gradient(ellipse_at_center,black_20%,transparent_90%)]",
          ].join(" ")}
          fill="none"
          style={{
            color: "rgb(var(--bg-purple))",
          }}
        >
          {/* Connection lines */}
          {EDGES.map(([from, to, flow]) => (
            <line
              key={`${from}-${to}`}
              x1={NODES[from][0]}
              y1={NODES[from][1]}
              x2={NODES[to][0]}
              y2={NODES[to][1]}
              stroke="currentColor"
              strokeWidth="1.1"
              strokeDasharray={flow ? "4 8" : undefined}
              className={flow && !reduce ? "sb-flow" : undefined}
              style={{
                strokeOpacity: "var(--bg-line)",
              }}
            />
          ))}

          {/* Network nodes */}
          {NODES.map(([cx, cy], index) => (
            <g key={`${cx}-${cy}`}>
              {PULSING.has(index) && (
                <circle
                  cx={cx}
                  cy={cy}
                  r="10"
                  fill="rgb(var(--bg-yellow))"
                  opacity="0.08"
                />
              )}

              <circle
                cx={cx}
                cy={cy}
                r={PULSING.has(index) ? 3.5 : 2.5}
                fill="currentColor"
                className={
                  PULSING.has(index) && !reduce ? "sb-pulse" : undefined
                }
                style={{
                  opacity: 0.65,
                  animationDelay: `${index * 0.45}s`,
                }}
              />
            </g>
          ))}

          {/* Moving signals */}
          {!reduce &&
            SIGNALS.map((signal) => (
              <g
                key={signal.d}
                style={{
                  color: "rgb(var(--bg-yellow))",
                }}
              >
                <circle r="8" fill="currentColor" opacity="0.13">
                  <animateMotion
                    dur={`${signal.dur}s`}
                    begin={`${signal.begin}s`}
                    repeatCount="indefinite"
                    path={signal.d}
                  />
                </circle>

                <circle r="2.8" fill="currentColor" opacity="0.85">
                  <animateMotion
                    dur={`${signal.dur}s`}
                    begin={`${signal.begin}s`}
                    repeatCount="indefinite"
                    path={signal.d}
                  />
                </circle>
              </g>
            ))}
        </svg>
      </motion.div>

      {/* Floating developer icons */}
      {ICONS.map(({ Icon, className, size, delay }) => (
        <span
          key={className}
          className={[
            "absolute hidden md:block",
            reduce ? "" : "sb-float",
            className,
          ].join(" ")}
          style={{
            color: "rgb(var(--bg-purple) / var(--bg-icon))",
            animationDelay: `${delay}s`,
          }}
        >
          <Icon
            strokeWidth={1.4}
            style={{
              width: size,
              height: size,
            }}
          />
        </span>
      ))}

      {/* Cursor spotlight — desktop only */}
      {!reduce && (
        <motion.div
          style={{
            x: sx,
            y: sy,
            background:
              "radial-gradient(closest-side, rgb(var(--bg-purple) / calc(var(--bg-a) * 0.9)), transparent)",
          }}
          className={[
            "absolute left-0 top-0",
            "-ml-64 -mt-64 size-[32rem]",
            "rounded-full",
          ].join(" ")}
        />
      )}

      {/* Subtle bottom accent */}
      <div
        className="absolute inset-x-0 bottom-0 h-40"
        style={{
          background:
            "linear-gradient(to top, rgb(var(--bg-purple) / calc(var(--bg-a) * 0.45)), transparent)",
        }}
      />
    </div>
  );
}

export default SiteBackground;
