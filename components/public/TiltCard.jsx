"use client";

// components/public/TiltCard.jsx
// Pointer-responsive CSS 3D scene. Children can sit on different depth layers
// with utilities like [transform:translateZ(30px)]. No re-renders while moving:
// it only updates two CSS variables. It switches itself off for reduced motion
// and for touch / coarse pointers, and the content stays fully usable either way.
import { useEffect, useRef } from "react";

export function TiltCard({
  children,
  className = "",
  max = 10,
  glare = false,
}) {
  const outerRef = useRef(null);
  const innerRef = useRef(null);
  const glareRef = useRef(null);

  useEffect(() => {
    const outer = outerRef.current;
    const inner = innerRef.current;
    if (!outer || !inner) return undefined;

    const query = window.matchMedia(
      "(prefers-reduced-motion: reduce), (pointer: coarse)",
    );
    if (query.matches) return undefined;

    let frame = 0;

    const onMove = (event) => {
      const rect = outer.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - 0.5;
      const y = (event.clientY - rect.top) / rect.height - 0.5;
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        inner.style.setProperty("--ry", `${(x * max).toFixed(2)}deg`);
        inner.style.setProperty("--rx", `${(-y * max).toFixed(2)}deg`);
        if (glareRef.current) {
          glareRef.current.style.setProperty(
            "--gx",
            `${((x + 0.5) * 100).toFixed(1)}%`,
          );
          glareRef.current.style.setProperty(
            "--gy",
            `${((y + 0.5) * 100).toFixed(1)}%`,
          );
          glareRef.current.style.setProperty("--go", "1");
        }
      });
    };

    const reset = () => {
      cancelAnimationFrame(frame);
      inner.style.setProperty("--ry", "0deg");
      inner.style.setProperty("--rx", "0deg");
      glareRef.current?.style.setProperty("--go", "0");
    };

    outer.addEventListener("pointermove", onMove);
    outer.addEventListener("pointerleave", reset);
    return () => {
      cancelAnimationFrame(frame);
      outer.removeEventListener("pointermove", onMove);
      outer.removeEventListener("pointerleave", reset);
    };
  }, [max]);

  return (
    <div ref={outerRef} className={className} style={{ perspective: "900px" }}>
      <div
        ref={innerRef}
        className="relative size-full transition-transform duration-200 ease-out will-change-transform motion-reduce:transition-none"
        style={{
          transformStyle: "preserve-3d",
          transform: "rotateX(var(--rx, 0deg)) rotateY(var(--ry, 0deg))",
        }}
      >
        {children}
        {glare && (
          <div
            ref={glareRef}
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 rounded-[inherit] transition-opacity duration-200"
            style={{
              opacity: "var(--go, 0)",
              background:
                "radial-gradient(circle at var(--gx, 50%) var(--gy, 50%), hsl(var(--foreground) / 0.12), transparent 55%)",
            }}
          />
        )}
      </div>
    </div>
  );
}
