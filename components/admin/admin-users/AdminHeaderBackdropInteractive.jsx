// components/admin/admin-users/AdminHeaderBackdropInteractive.jsx
// Opt-in pointer-parallax wrapper around AdminHeaderBackdrop. Use this
// instead of the plain backdrop only on headers you're happy to make a
// Client Component — the base backdrop stays server-safe on its own.
//
//   <header className="relative isolate overflow-hidden ...">
//     <AdminHeaderBackdropInteractive density="rich" />
//     ...
//   </header>

"use client";

import { useEffect, useRef } from "react";
import { AdminHeaderBackdrop } from "./AdminHeaderBackdrop";

export function AdminHeaderBackdropInteractive(props) {
  const ref = useRef(null);
  const frame = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (prefersReduced) return;

    function handlePointerMove(e) {
      const rect = el.getBoundingClientRect();
      const px = (e.clientX - rect.left) / rect.width;
      const py = (e.clientY - rect.top) / rect.height;

      if (frame.current) cancelAnimationFrame(frame.current);
      frame.current = requestAnimationFrame(() => {
        el.style.setProperty("--ea-px", `${(px * 100).toFixed(2)}%`);
        el.style.setProperty("--ea-py", `${(py * 100).toFixed(2)}%`);
        el.style.setProperty("--ea-tilt-x", `${(py - 0.5) * -6}deg`);
        el.style.setProperty("--ea-tilt-y", `${(px - 0.5) * 6}deg`);
      });
    }

    function handlePointerLeave() {
      el.style.setProperty("--ea-tilt-x", "0deg");
      el.style.setProperty("--ea-tilt-y", "0deg");
    }

    el.addEventListener("pointermove", handlePointerMove);
    el.addEventListener("pointerleave", handlePointerLeave);
    return () => {
      el.removeEventListener("pointermove", handlePointerMove);
      el.removeEventListener("pointerleave", handlePointerLeave);
      if (frame.current) cancelAnimationFrame(frame.current);
    };
  }, []);

  return (
    <div
      ref={ref}
      className="absolute inset-0 -z-10 [transition:transform_0.3s_ease-out] [transform:rotateX(var(--ea-tilt-x,0deg))_rotateY(var(--ea-tilt-y,0deg))]"
      style={{ transformStyle: "preserve-3d" }}
    >
      <AdminHeaderBackdrop {...props} />
      {/* soft cursor-follow glow, layered above the base backdrop */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-70"
        style={{
          background:
            "radial-gradient(360px circle at var(--ea-px, 50%) var(--ea-py, 50%), rgb(var(--ea-a) / 0.10), transparent 70%)",
        }}
      />
    </div>
  );
}
