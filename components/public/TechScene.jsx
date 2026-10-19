"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";

// WebGL code is browser-only and loaded lazily.
const Canvas3D = dynamic(() => import("./TechSceneCanvas"), {
  ssr: false,
  loading: () => null,
});

function hasWebGL() {
  try {
    const c = document.createElement("canvas");
    const gl = c.getContext("webgl2") || c.getContext("webgl");
    gl?.getExtension("WEBGL_lose_context")?.loseContext();
    return !!gl;
  } catch {
    return false;
  }
}

/** Static CSS orb shown when WebGL is unavailable. Animates gently unless reduceMotion is set. */
function Fallback({ reduceMotion = false }) {
  return (
    <div className="absolute inset-0 grid place-items-center">
      <div className="relative size-40 sm:size-56">
        <motion.div
          className="absolute inset-0 rounded-full border border-primary/30"
          animate={reduceMotion ? undefined : { rotate: 360 }}
          transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
        />
        <motion.div
          className="absolute inset-6 rounded-full border border-primary/20"
          animate={reduceMotion ? undefined : { rotate: -360 }}
          transition={{ duration: 46, repeat: Infinity, ease: "linear" }}
        />
        <motion.div
          className="absolute inset-[22%] rounded-full bg-primary/20 blur-xl"
          animate={
            reduceMotion
              ? undefined
              : { opacity: [0.5, 0.85, 0.5], scale: [1, 1.06, 1] }
          }
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        />
        <div className="absolute inset-[38%] rounded-full bg-primary shadow-[0_0_24px_var(--primary)]" />
      </div>
    </div>
  );
}

/**
 * Decorative 3D visual. Follows the app theme (class-based `dark`), and falls
 * back to a static CSS orb without WebGL.
 * - scrollLinked={false}: for scenes that sit far down a page.
 * - minWidth: only mount the canvas at or above this viewport width (px),
 *   so hidden-on-mobile scenes never create a WebGL context there.
 */
export function TechScene({
  nodeCount = 6,
  scrollLinked = true,
  minWidth = 0,
  className = "",
}) {
  const [env, setEnv] = useState({
    ready: false,
    webgl: false,
    lite: false,
    reduce: false,
    dark: false,
    wide: true,
  });

  useEffect(() => {
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const small = window.matchMedia("(max-width: 767px)");
    const wide = minWidth
      ? window.matchMedia(`(min-width: ${minWidth}px)`)
      : null;
    const root = document.documentElement;
    const update = () =>
      setEnv({
        ready: true,
        webgl: hasWebGL(),
        lite: small.matches,
        reduce: motionQuery.matches,
        dark: root.classList.contains("dark"),
        wide: wide ? wide.matches : true,
      });
    update();

    // Re-read the theme when the existing toggle flips the `dark` class.
    const observer = new MutationObserver(() =>
      setEnv((prev) => ({ ...prev, dark: root.classList.contains("dark") })),
    );
    observer.observe(root, { attributes: true, attributeFilter: ["class"] });

    motionQuery.addEventListener("change", update);
    small.addEventListener("change", update);
    wide?.addEventListener("change", update);
    return () => {
      observer.disconnect();
      motionQuery.removeEventListener("change", update);
      small.removeEventListener("change", update);
      wide?.removeEventListener("change", update);
    };
  }, [minWidth]);

  if (!env.wide) return null;
  const show3D = env.ready && env.webgl;

  return (
    <div aria-hidden="true" className={`pointer-events-none ${className}`}>
      {show3D ? (
        <Canvas3D
          nodeCount={Math.min(Math.max(nodeCount, 5), 9)}
          lite={env.lite}
          reduceMotion={env.reduce}
          dark={env.dark}
          scrollLinked={scrollLinked}
        />
      ) : (
        <Fallback reduceMotion={env.reduce} />
      )}
    </div>
  );
}
