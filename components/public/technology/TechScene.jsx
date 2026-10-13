"use client";

import { useReducedMotion, motion } from "framer-motion";
import { Cpu, ShieldCheck, Sparkles, Workflow } from "lucide-react";

const ACCENT = "#ef07a2";

export function TechScene({ className = "" }) {
  const reduceMotion = useReducedMotion();

  const items = [
    { Icon: Cpu, label: "Technology", x: "12%", y: "18%" },
    { Icon: Workflow, label: "Innovation", x: "73%", y: "15%" },
    { Icon: ShieldCheck, label: "Security", x: "76%", y: "72%" },
    { Icon: Sparkles, label: "Future ready", x: "13%", y: "73%" },
  ];

  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none relative isolate overflow-hidden ${className}`}
    >
      {/* Solid-color ambient lighting */}
      <div
        className="absolute left-1/2 top-1/2 h-48 w-48 -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl"
        style={{ backgroundColor: "rgba(239,7,162,0.12)" }}
      />

      {/* Perspective grid */}
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

      {/* Animated 3D orbit */}
      <motion.div
        animate={
          !reduceMotion
            ? { rotateX: [58, 62, 58], rotateZ: [0, 12, 0] }
            : undefined
        }
        transition={{
          duration: 12,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute left-1/2 top-1/2 h-56 w-56 -translate-x-1/2 -translate-y-1/2 rounded-full border"
        style={{
          borderColor: "rgba(239,7,162,0.28)",
          transformStyle: "preserve-3d",
        }}
      />

      <motion.div
        animate={
          !reduceMotion
            ? { rotateY: [0, 180, 360], rotateZ: [0, -18, 0] }
            : undefined
        }
        transition={{
          duration: 18,
          repeat: Infinity,
          ease: "linear",
        }}
        className="absolute left-1/2 top-1/2 h-40 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full border"
        style={{
          borderColor: "rgba(255,255,255,0.14)",
          transformStyle: "preserve-3d",
        }}
      />

      {/* Central technology core */}
      <motion.div
        animate={
          !reduceMotion
            ? { y: [0, -7, 0], rotateY: [0, 8, 0] }
            : undefined
        }
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute left-1/2 top-1/2 flex h-24 w-24 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-[28px] border shadow-2xl"
        style={{
          backgroundColor: "#15121a",
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

      {/* Floating technology nodes */}
      {items.map(({ Icon, label, x, y }, index) => (
        <motion.div
          key={label}
          animate={
            !reduceMotion
              ? { y: [0, index % 2 === 0 ? -9 : 9, 0] }
              : undefined
          }
          transition={{
            duration: 3 + index * 0.6,
            repeat: Infinity,
            ease: "easeInOut",
            delay: index * 0.2,
          }}
          className="absolute flex h-12 w-12 items-center justify-center rounded-2xl border shadow-xl"
          style={{
            left: x,
            top: y,
            color: ACCENT,
            backgroundColor: "#17141c",
            borderColor: "rgba(255,255,255,0.12)",
          }}
          title={label}
        >
          <Icon size={21} strokeWidth={1.6} />
        </motion.div>
      ))}

      {/* Orbit markers */}
      <span
        className="absolute left-1/2 top-[14%] h-2 w-2 rounded-full"
        style={{ backgroundColor: ACCENT }}
      />
      <span className="absolute bottom-[15%] left-[48%] h-1.5 w-1.5 rounded-full bg-white/60" />
    </div>
  );
}

export default TechScene;
