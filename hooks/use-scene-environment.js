"use client";

import { useEffect, useState, useSyncExternalStore } from "react";

function detectWebGL() {
  try {
    const canvas = document.createElement("canvas");
    return !!(
      window.WebGLRenderingContext &&
      (canvas.getContext("webgl") || canvas.getContext("experimental-webgl"))
    );
  } catch (e) {
    return false;
  }
}

function subscribeToTheme(callback) {
  const root = document.documentElement;
  const observer = new MutationObserver(callback);
  observer.observe(root, { attributes: true, attributeFilter: ["class"] });
  return () => observer.disconnect();
}

function getThemeSnapshot() {
  return document.documentElement.classList.contains("dark");
}

/**
 * Combines WebGL capability detection with the current theme (read from the
 * `dark` class on <html>, matching the project's existing class-based theme
 * strategy — no dependency on a specific theme library). Use this to decide
 * whether to mount a Three.js scene and which palette to hand it.
 */
export function useSceneEnvironment() {
  const [supported] = useState(() =>
    typeof window === "undefined" ? null : detectWebGL(),
  );
  const isDark = useSyncExternalStore(
    subscribeToTheme,
    getThemeSnapshot,
    () => false,
  );

  return { supported, isDark };
}
