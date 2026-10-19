"use client";

// components/admin/admin-users/AdminHeaderBackdropInteractive.jsx
// Opt-in pointer-parallax wrapper around AdminHeaderBackdrop. Use this
// instead of the plain backdrop only on headers you're happy to make a
// Client Component. The base backdrop stays server-safe on its own.
//
//   <header className="relative isolate overflow-hidden ...">
//     <AdminHeaderBackdropInteractive density="rich" />
//     ...
//   </header>

import { useEffect, useRef } from "react";
import { AdminHeaderBackdrop } from "./AdminHeaderBackdrop";

const MAX_TILT = 3; // degrees in each direction

export function AdminHeaderBackdropInteractive(props) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    // Listen on the header itself. This element sits behind the header
    // content (-z-10), so it never receives pointer events over text or buttons.
    const host = el?.parentElement;
    if (!el || !host) return undefined;

    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    let frame = 0;
    let point = null;
    let attached = false;

    const reset = () => {
      el.style.setProperty("--ea-tilt-x", "0deg");
      el.style.setProperty("--ea-tilt-y", "0deg");
    };

    const paint = () => {
      frame = 0;
      if (!point) return;
      // Measure the host, not the tilted element, so the numbers don't feed back
      const rect = host.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      const px = Math.min(1, Math.max(0, (point.x - rect.left) / rect.width));
      const py = Math.min(1, Math.max(0, (point.y - rect.top) / rect.height));
      el.style.setProperty("--ea-px", `${(px * 100).toFixed(2)}%`);
      el.style.setProperty("--ea-py", `${(py * 100).toFixed(2)}%`);
      el.style.setProperty(
        "--ea-tilt-x",
        `${((py - 0.5) * -2 * MAX_TILT).toFixed(2)}deg`,
      );
      el.style.setProperty(
        "--ea-tilt-y",
        `${((px - 0.5) * 2 * MAX_TILT).toFixed(2)}deg`,
      );
    };

    const onMove = (e) => {
      if (e.pointerType === "touch") return; // no parallax while scrolling on phones
      point = { x: e.clientX, y: e.clientY };
      if (!frame) frame = requestAnimationFrame(paint);
    };

    const onLeave = () => {
      point = null;
      if (frame) cancelAnimationFrame(frame);
      frame = 0;
      reset();
    };

    const attach = () => {
      if (attached) return;
      host.addEventListener("pointermove", onMove);
      host.addEventListener("pointerleave", onLeave);
      attached = true;
    };

    const detach = () => {
      if (!attached) return;
      host.removeEventListener("pointermove", onMove);
      host.removeEventListener("pointerleave", onLeave);
      attached = false;
      onLeave();
    };

    // Follow the reduced-motion setting live, not just at mount
    const sync = () => (mq.matches ? detach() : attach());
    sync();
    mq.addEventListener("change", sync);

    return () => {
      mq.removeEventListener("change", sync);
      detach();
    };
  }, []);

  return (
    <div
      ref={ref}
      aria-hidden="true"
      // perspective() makes the tilt actually read as 3D; scale hides the
      // corner gaps a rotation would otherwise open (the header clips the overflow)
      className="pointer-events-none absolute inset-0 -z-10 will-change-transform [transform:perspective(900px)_rotateX(var(--ea-tilt-x,0deg))_rotateY(var(--ea-tilt-y,0deg))_scale(1.04)] [transition:transform_0.3s_ease-out] motion-reduce:transition-none"
    >
      <AdminHeaderBackdrop {...props} />
      {/* soft cursor-follow glow, layered above the base backdrop */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-70 print:hidden"
        style={{
          background:
            "radial-gradient(360px circle at var(--ea-px, 50%) var(--ea-py, 50%), rgb(var(--ea-a) / 0.10), transparent 70%)",
        }}
      />
    </div>
  );
}
