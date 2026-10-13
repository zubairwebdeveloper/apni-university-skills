"use client";

import {
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from "framer-motion";
import { Award, ShieldCheck, ShieldOff } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

function TiltCard({ children, index }) {
  const reduce = useReducedMotion();
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [7, -7]), {
    stiffness: 220,
    damping: 22,
  });
  const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-7, 7]), {
    stiffness: 220,
    damping: 22,
  });

  function onPointerMove(e) {
    if (reduce || e.pointerType === "touch") return;
    const rect = e.currentTarget.getBoundingClientRect();
    x.set((e.clientX - rect.left) / rect.width - 0.5);
    y.set((e.clientY - rect.top) / rect.height - 0.5);
  }

  function reset() {
    x.set(0);
    y.set(0);
  }

  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: reduce ? 0 : index * 0.08 }}
      style={{
        rotateX: reduce ? 0 : rotateX,
        rotateY: reduce ? 0 : rotateY,
        transformPerspective: 900,
        transformStyle: "preserve-3d",
      }}
      onPointerMove={onPointerMove}
      onPointerLeave={reset}
    >
      {children}
    </motion.div>
  );
}

const TONES = {
  primary: "bg-primary/10 text-primary",
  success: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
  destructive: "bg-destructive/10 text-destructive",
};

export function CertificatesStats({ total, valid, revoked }) {
  const items = [
    { label: "Total issued", value: total, icon: Award, tone: "primary" },
    { label: "Valid", value: valid, icon: ShieldCheck, tone: "success" },
    { label: "Revoked", value: revoked, icon: ShieldOff, tone: "destructive" },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-3" aria-label="Certificate summary">
      {items.map(({ label, value, icon: Icon, tone }, i) => (
        <TiltCard key={label} index={i}>
          <Card className="transition-shadow hover:shadow-lg">
            <CardContent className="flex items-center gap-4 p-5">
              <span
                className={`flex size-11 items-center justify-center rounded-xl ${TONES[tone]}`}
                style={{ transform: "translateZ(24px)" }}
              >
                <Icon className="size-5" aria-hidden="true" />
              </span>
              <div>
                <p className="text-sm text-muted-foreground">{label}</p>
                <p className="text-2xl font-semibold tabular-nums">
                  {Number(value ?? 0).toLocaleString()}
                </p>
              </div>
            </CardContent>
          </Card>
        </TiltCard>
      ))}
    </div>
  );
}
