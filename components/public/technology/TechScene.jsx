"use client";

import { useReducedMotion, motion } from "framer-motion";
import { Cpu, ShieldCheck, Sparkles, Workflow } from "lucide-react";

const ACCENT = "#ef07a2";
const ACCENT_SOFT = "rgba(239,7,162,0.12)";
const ACCENT_LINE = "rgba(239,7,162,0.28)";
const SURFACE = "#15121a";
const SURFACE_RAISED = "#17141c";
const BORDER = "rgba(255,255,255,0.12)";
const TEXT_MUTED = "#94A3B8";

// Node centers are percentages of the square stage (0-100).
const NODES = [
  { Icon: Cpu, label: "Technology", x: 20, y: 22 },
  { Icon: Workflow, label: "Innovation", x: 80, y: 20 },
  { Icon: ShieldCheck, label: "Security", x: 80, y: 78 },
  { Icon: Sparkles, label: "Future ready", x: 20, y: 78 },
];

export function TechScene({ className = "" }) {
  const reduceMotion = useReducedMotion();
  const animated = !reduceMotion;

  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none relative isolate min-h-[260px] overflow-hidden ${className}`}
      style={{ containerType: "size" }}
    >
      {/* Ambient lighting (solid color, no gradients) */}
      <div
        className="absolute left-1/2 top-1/2 h-56 w-56 -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl"
        style={{ backgroundColor: ACCENT_SOFT }}
      />

      {/* Blueprint grid, faded toward the edges */}
      <div
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.055) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.055) 1px, transparent 1px)",
          backgroundSize: "32px 32px",
          maskImage:
            "radial-gradient(ellipse at center, black 10%, transparent 75%)",
          WebkitMaskImage:
            "radial-gradient(ellipse at center, black 10%, transparent 75%)",
        }}
      />

      {/* Square stage that always fits the container, keeping layout proportional */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div
          className="relative"
          style={{
            width: "min(100cqw, 100cqh)",
            height: "min(100cqw, 100cqh)",
            perspective: "900px",
          }}
        >
          {/* Connector lines from the core to each node */}
          <svg
            viewBox="0 0 100 100"
            className="absolute inset-0 h-full w-full"
            fill="none"
          >
            {NODES.map(({ label, x, y }, index) => (
              <motion.line
                key={label}
                x1={50}
                y1={50}
                x2={x}
                y2={y}
                stroke={ACCENT_LINE}
                strokeWidth={1}
                strokeDasharray="2 4"
                vectorEffect="non-scaling-stroke"
                initial={animated ? { opacity: 0 } : false}
                animate={
                  animated
                    ? { opacity: 1, strokeDashoffset: [0, -24] }
                    : { opacity: 1 }
                }
                transition={{
                  opacity: { duration: 0.8, delay: 0.3 + index * 0.1 },
                  strokeDashoffset: {
                    duration: 4,
                    repeat: Infinity,
                    ease: "linear",
                  },
                }}
              />
            ))}
          </svg>

          {/* Tilted orbit ring with a single traveling marker */}
          <div
            className="absolute left-1/2 top-1/2 h-[66%] w-[66%] -translate-x-1/2 -translate-y-1/2"
            style={{
              transform: "translate(-50%, -50%) rotateX(62deg)",
              transformStyle: "preserve-3d",
            }}
          >
            <motion.div
              animate={animated ? { rotateZ: 360 } : undefined}
              transition={{ duration: 28, repeat: Infinity, ease: "linear" }}
              className="relative h-full w-full rounded-full border"
              style={{ borderColor: ACCENT_LINE }}
            >
              <span
                className="absolute left-1/2 top-0 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full"
                style={{ backgroundColor: ACCENT }}
              />
            </motion.div>
          </div>

          {/* Secondary orbit, counter-rotating and subtler */}
          <div
            className="absolute left-1/2 top-1/2 h-[50%] w-[78%] -translate-x-1/2 -translate-y-1/2"
            style={{ transformStyle: "preserve-3d" }}
          >
            <motion.div
              animate={
                animated
                  ? { rotateY: [0, 180, 360], rotateZ: [0, -14, 0] }
                  : undefined
              }
              transition={{ duration: 22, repeat: Infinity, ease: "linear" }}
              className="h-full w-full rounded-full border"
              style={{
                borderColor: "rgba(255,255,255,0.14)",
                transformStyle: "preserve-3d",
              }}
            />
          </div>

          {/* Central technology core */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
            {/* Soft pulse behind the core */}
            {animated && (
              <motion.span
                className="absolute inset-0 rounded-[28px] border"
                style={{ borderColor: ACCENT_LINE }}
                animate={{ scale: [1, 1.5], opacity: [0.45, 0] }}
                transition={{
                  duration: 3.2,
                  repeat: Infinity,
                  ease: "easeOut",
                }}
              />
            )}
            <motion.div
              initial={animated ? { opacity: 0, scale: 0.85 } : false}
              animate={
                animated
                  ? { opacity: 1, scale: 1, y: [0, -7, 0] }
                  : { opacity: 1 }
              }
              transition={{
                opacity: { duration: 0.6 },
                scale: { duration: 0.6, ease: "easeOut" },
                y: { duration: 4, repeat: Infinity, ease: "easeInOut" },
              }}
              className="relative flex h-24 w-24 items-center justify-center rounded-[28px] border shadow-2xl"
              style={{
                backgroundColor: SURFACE,
                borderColor: "rgba(239,7,162,0.45)",
                boxShadow: "0 20px 70px rgba(239,7,162,0.14)",
              }}
            >
              <div
                className="flex h-14 w-14 items-center justify-center rounded-2xl border"
                style={{
                  backgroundColor: "rgba(239,7,162,0.1)",
                  borderColor: "rgba(239,7,162,0.3)",
                  color: ACCENT,
                }}
              >
                <Cpu size={30} strokeWidth={1.5} />
              </div>
            </motion.div>
          </div>

          {/* Floating nodes with captions */}
          {NODES.map(({ Icon, label, x, y }, index) => (
            <div
              key={label}
              className="absolute"
              style={{
                left: `${x}%`,
                top: `${y}%`,
                transform: "translate(-50%, -50%)",
              }}
            >
              <motion.div
                initial={animated ? { opacity: 0, scale: 0.8 } : false}
                animate={
                  animated
                    ? {
                        opacity: 1,
                        scale: 1,
                        y: [0, index % 2 === 0 ? -9 : 9, 0],
                      }
                    : { opacity: 1 }
                }
                transition={{
                  opacity: { duration: 0.5, delay: 0.2 + index * 0.12 },
                  scale: {
                    duration: 0.5,
                    delay: 0.2 + index * 0.12,
                    ease: "easeOut",
                  },
                  y: {
                    duration: 3 + index * 0.6,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: index * 0.2,
                  },
                }}
                className="flex flex-col items-center gap-2"
              >
                <div
                  className="flex h-12 w-12 items-center justify-center rounded-2xl border shadow-xl"
                  style={{
                    color: ACCENT,
                    backgroundColor: SURFACE_RAISED,
                    borderColor: BORDER,
                  }}
                >
                  <Icon size={21} strokeWidth={1.6} />
                </div>
                <span
                  className="whitespace-nowrap text-[10px] font-medium uppercase tracking-[0.14em]"
                  style={{ color: TEXT_MUTED }}
                >
                  {label}
                </span>
              </motion.div>
            </div>
          ))}

          {/* Orbit markers */}
          <span
            className="absolute left-1/2 top-[14%] h-2 w-2 rounded-full"
            style={{ backgroundColor: ACCENT }}
          />
          <span className="absolute bottom-[15%] left-[48%] h-1.5 w-1.5 rounded-full bg-white/60" />
        </div>
      </div>
    </div>
  );
}

export default TechScene;
