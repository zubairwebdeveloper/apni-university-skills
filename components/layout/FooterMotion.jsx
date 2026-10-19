"use client";

import { useEffect, useRef, useState } from "react";
import {
  animate,
  motion,
  useInView,
  useMotionTemplate,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from "framer-motion";

const EASE = [0.22, 1, 0.36, 1];

const SPRING = {
  stiffness: 170,
  damping: 22,
  mass: 0.5,
};

const VIEWPORT = {
  once: true,
  margin: "-40px",
};

// ------------------------------------------------------------
// Reveal — scroll-triggered entrance with subtle 3D movement
// ------------------------------------------------------------

export function Reveal({
  children,
  delay = 0,
  y = 24,
  x = 0,
  rotateX = 8,
  className,
  duration = 0.7,
  once = true,
  ...props
}) {
  const reduce = useReducedMotion();

  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y, x, rotateX, scale: 0.985 }}
      whileInView={{
        opacity: 1,
        y: 0,
        x: 0,
        rotateX: 0,
        scale: 1,
      }}
      viewport={{ ...VIEWPORT, once }}
      transition={{
        duration: reduce ? 0 : duration,
        delay: reduce ? 0 : delay,
        ease: EASE,
      }}
      style={
        reduce
          ? undefined
          : {
              transformPerspective: 1000,
              transformOrigin: "50% 100%",
            }
      }
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
}

// ------------------------------------------------------------
// Stagger — reveal a group of items in sequence
// ------------------------------------------------------------

export function Stagger({
  as = "div",
  children,
  className,
  stagger = 0.07,
  delay = 0,
  once = true,
  ...props
}) {
  const reduce = useReducedMotion();
  const Tag = motion[as] ?? motion.div;

  return (
    <Tag
      initial={reduce ? "show" : "hidden"}
      whileInView="show"
      viewport={{ ...VIEWPORT, once }}
      variants={{
        hidden: {},
        show: {
          transition: {
            staggerChildren: reduce ? 0 : stagger,
            delayChildren: reduce ? 0 : delay,
          },
        },
      }}
      className={className}
      {...props}
    >
      {children}
    </Tag>
  );
}

export function StaggerItem({ as = "div", children, className, ...props }) {
  const reduce = useReducedMotion();
  const Tag = motion[as] ?? motion.div;

  return (
    <Tag
      variants={{
        hidden: reduce
          ? {}
          : {
              opacity: 0,
              y: 16,
              scale: 0.98,
            },
        show: {
          opacity: 1,
          y: 0,
          scale: 1,
          transition: {
            duration: reduce ? 0 : 0.45,
            ease: EASE,
          },
        },
      }}
      className={className}
      {...props}
    >
      {children}
    </Tag>
  );
}

// ------------------------------------------------------------
// Tilt3D — responsive pointer tilt with subtle yellow/purple glare
// ------------------------------------------------------------

export function Tilt3D({
  children,
  className = "",
  max = 7,
  glare = true,
  ...props
}) {
  const reduce = useReducedMotion();
  const ref = useRef(null);

  const px = useMotionValue(0.5);
  const py = useMotionValue(0.5);
  const hover = useMotionValue(0);

  const sx = useSpring(px, SPRING);
  const sy = useSpring(py, SPRING);
  const glareOpacity = useSpring(hover, {
    stiffness: 200,
    damping: 25,
  });

  const rotateY = useTransform(sx, [0, 1], [-max, max]);
  const rotateX = useTransform(sy, [0, 1], [max, -max]);
  const gx = useTransform(sx, [0, 1], [0, 100]);
  const gy = useTransform(sy, [0, 1], [0, 100]);

  const glareBackground = useMotionTemplate`
    radial-gradient(
      420px circle at ${gx}% ${gy}%,
      rgb(250 204 21 / 0.16),
      rgb(139 92 246 / 0.10) 35%,
      transparent 68%
    )
  `;

  function handlePointerMove(event) {
    if (reduce || event.pointerType !== "mouse" || !ref.current) {
      return;
    }

    const rect = ref.current.getBoundingClientRect();

    if (!rect.width || !rect.height) return;

    px.set(Math.max(0, Math.min(1, (event.clientX - rect.left) / rect.width)));

    py.set(Math.max(0, Math.min(1, (event.clientY - rect.top) / rect.height)));

    hover.set(1);
  }

  function handlePointerLeave() {
    px.set(0.5);
    py.set(0.5);
    hover.set(0);
  }

  return (
    <motion.div
      ref={ref}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      style={
        reduce
          ? undefined
          : {
              rotateX,
              rotateY,
              transformPerspective: 1100,
              transformStyle: "preserve-3d",
            }
      }
      className={className}
      {...props}
    >
      {children}

      {glare && !reduce && (
        <motion.span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 rounded-[inherit]"
          style={{
            background: glareBackground,
            opacity: glareOpacity,
          }}
        />
      )}
    </motion.div>
  );
}

// ------------------------------------------------------------
// Magnetic — subtle cursor attraction for buttons and links
// ------------------------------------------------------------

export function Magnetic({
  children,
  className = "",
  strength = 0.25,
  ...props
}) {
  const reduce = useReducedMotion();
  const ref = useRef(null);

  const mx = useMotionValue(0);
  const my = useMotionValue(0);

  const x = useSpring(mx, {
    stiffness: 220,
    damping: 18,
    mass: 0.45,
  });

  const y = useSpring(my, {
    stiffness: 220,
    damping: 18,
    mass: 0.45,
  });

  function handlePointerMove(event) {
    if (reduce || event.pointerType !== "mouse" || !ref.current) {
      return;
    }

    const rect = ref.current.getBoundingClientRect();

    mx.set((event.clientX - (rect.left + rect.width / 2)) * strength);

    my.set((event.clientY - (rect.top + rect.height / 2)) * strength);
  }

  function handlePointerLeave() {
    mx.set(0);
    my.set(0);
  }

  return (
    <motion.div
      ref={ref}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      style={reduce ? undefined : { x, y }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
}

// ------------------------------------------------------------
// CountUp — animate numeric text when it enters the viewport
// Supports: 10K+, 1,250+, 99.5%, $250, 24/7
// ------------------------------------------------------------

const NUMBER_PATTERN = /^(\D*)(\d[\d,]*\.?\d*)(.*)$/;

export function CountUp({ value, duration = 1.6, className, ...props }) {
  const reduce = useReducedMotion();
  const ref = useRef(null);
  const inView = useInView(ref, {
    once: true,
    margin: "-40px",
  });

  const text = String(value ?? "");
  const match = text.match(NUMBER_PATTERN);

  const numberText = match?.[2] ?? "";
  const target = match ? Number(numberText.replace(/,/g, "")) : 0;

  const decimals = numberText.includes(".")
    ? numberText.split(".")[1].length
    : 0;

  const withCommas = numberText.includes(",");

  const [number, setNumber] = useState(reduce ? target : 0);

  useEffect(() => {
    if (!match) return;

    if (reduce) {
      setNumber(target);
      return;
    }

    if (!inView) return;

    const controls = animate(0, target, {
      duration,
      ease: EASE,
      onUpdate: setNumber,
    });

    return () => controls.stop();
  }, [inView, reduce, target, duration, match]);

  if (!match) {
    return (
      <span ref={ref} className={className} {...props}>
        {text}
      </span>
    );
  }

  const formatted = withCommas
    ? number.toLocaleString("en-US", {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      })
    : number.toFixed(decimals);

  return (
    <span ref={ref} className={className} {...props} aria-label={text}>
      <span aria-hidden="true">{match[1]}</span>
      <span aria-hidden="true">{formatted}</span>
      <span aria-hidden="true">{match[3]}</span>
    </span>
  );
}

// ------------------------------------------------------------
// CursorGlow — soft light that follows the pointer in its parent
// ------------------------------------------------------------

export function CursorGlow({ size = 560, className = "-z-10" }) {
  const reduce = useReducedMotion();
  const ref = useRef(null);

  const mx = useMotionValue(-9999);
  const my = useMotionValue(-9999);

  const x = useSpring(mx, {
    stiffness: 55,
    damping: 20,
    mass: 0.6,
  });

  const y = useSpring(my, {
    stiffness: 55,
    damping: 20,
    mass: 0.6,
  });

  useEffect(() => {
    const parent = ref.current?.parentElement;

    if (!parent || reduce) return undefined;

    function handlePointerMove(event) {
      if (event.pointerType && event.pointerType !== "mouse") {
        return;
      }

      const rect = parent.getBoundingClientRect();

      mx.set(event.clientX - rect.left);
      my.set(event.clientY - rect.top);
    }

    function handlePointerLeave() {
      mx.set(-9999);
      my.set(-9999);
    }

    parent.addEventListener("pointermove", handlePointerMove);
    parent.addEventListener("pointerleave", handlePointerLeave);

    return () => {
      parent.removeEventListener("pointermove", handlePointerMove);
      parent.removeEventListener("pointerleave", handlePointerLeave);
    };
  }, [reduce, mx, my]);

  if (reduce) return null;

  return (
    <motion.div
      ref={ref}
      aria-hidden="true"
      className={`pointer-events-none absolute left-0 top-0 rounded-full ${className}`}
      style={{
        x,
        y,
        width: size,
        height: size,
        marginLeft: -size / 2,
        marginTop: -size / 2,
        background:
          "radial-gradient(closest-side, rgb(250 204 21 / 0.13), rgb(139 92 246 / 0.10) 45%, transparent 75%)",
      }}
    />
  );
}

// ------------------------------------------------------------
// FloatingGlows — ambient brand lighting
// ------------------------------------------------------------

export function FloatingGlows() {
  const reduce = useReducedMotion();

  const firstAnimation = reduce
    ? undefined
    : {
        x: [0, 35, 0],
        y: [0, 24, 0],
      };

  const secondAnimation = reduce
    ? undefined
    : {
        x: [0, -35, 0],
        y: [0, -24, 0],
      };

  const thirdAnimation = reduce
    ? undefined
    : {
        x: [0, 24, -12, 0],
        y: [0, -24, 12, 0],
      };

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 overflow-hidden"
    >
      <motion.div
        animate={firstAnimation}
        transition={{
          duration: 18,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute -left-24 -top-24 size-72 rounded-full bg-[rgb(250_204_21/0.12)] blur-3xl"
      />

      <motion.div
        animate={secondAnimation}
        transition={{
          duration: 22,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute -bottom-32 right-0 size-80 rounded-full bg-[rgb(139_92_246/0.16)] blur-3xl"
      />

      <motion.div
        animate={thirdAnimation}
        transition={{
          duration: 26,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute left-1/3 top-1/3 size-64 rounded-full bg-[rgb(167_139_250/0.10)] blur-3xl"
      />

      <div className="absolute inset-0 bg-[radial-gradient(circle,hsl(var(--foreground)/0.045)_1px,transparent_1px)] [background-size:22px_22px] [mask-image:linear-gradient(to_bottom,black,transparent_85%)]" />
    </div>
  );
}

// ------------------------------------------------------------
// ShimmerLine — subtle animated top border
// ------------------------------------------------------------

export function ShimmerLine() {
  const reduce = useReducedMotion();

  return (
    <div
      aria-hidden="true"
      className="absolute inset-x-0 top-0 z-10 h-px overflow-hidden"
      style={{
        background:
          "linear-gradient(90deg, transparent, rgb(250 204 21 / 0.7), rgb(139 92 246 / 0.7), transparent)",
      }}
    >
      {!reduce && (
        <motion.div
          initial={{ x: "-100%" }}
          animate={{ x: "400%" }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "linear",
            repeatDelay: 1.5,
          }}
          className="h-full w-1/4"
          style={{
            background:
              "linear-gradient(90deg, transparent, rgb(255 255 255 / 0.95), transparent)",
            boxShadow: "0 0 12px 2px rgb(250 204 21 / 0.65)",
          }}
        />
      )}
    </div>
  );
}
