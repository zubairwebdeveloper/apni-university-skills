"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowUp } from "lucide-react";

// Ring radius: with strokeWidth 4 the outer edge stays inside the 44 viewBox
const RADIUS = 17;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

/* Shared hook: scrollY + progress (0..1), throttled with rAF */
function useScrollState() {
  const [state, setState] = useState({ y: 0, progress: 0 });

  useEffect(() => {
    let ticking = false;

    const update = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const y = window.scrollY;
      setState({ y, progress: max > 0 ? Math.min(1, y / max) : 0 });
      ticking = false;
    };

    const onScroll = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(update);
      }
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return state;
}

export function ScrollToTop({ bottom = 24, threshold = 300 }) {
  const { y, progress } = useScrollState();
  const [launch, setLaunch] = useState(null); // "up" | "down" | null
  const [rippleKey, setRippleKey] = useState(0);
  const timerRef = useRef(null);

  const visible = y > threshold;
  const percent = Math.round(progress * 100);
  const atEnd = progress >= 0.99;

  // < 50%  -> up arrow (go to top)
  // 50-99% -> down arrow (go to bottom)
  // 100%   -> up arrow (go to top)
  const direction = !atEnd && progress >= 0.5 ? "down" : "up";

  // Chat widget reads this to stack above the button (see globals.css)
  useEffect(() => {
    document.documentElement.dataset.scrolltop = visible ? "visible" : "hidden";
    return () => {
      delete document.documentElement.dataset.scrolltop;
    };
  }, [visible]);

  useEffect(() => () => clearTimeout(timerRef.current), []);

  const handleClick = () => {
    const reduce = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const top = direction === "up" ? 0 : document.documentElement.scrollHeight;

    window.scrollTo({ top, behavior: reduce ? "auto" : "smooth" });

    if (!reduce) {
      setLaunch(direction);
      setRippleKey((k) => k + 1);
      clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => setLaunch(null), 650);
    }
  };

  const label = direction === "up" ? "Back to top" : "Go to bottom";

  return (
    <>
      <style>{`
        @keyframes stt-nudge {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(3px); }
        }
        @keyframes stt-ripple {
          from { transform: scale(1); opacity: 0.5; }
          to { transform: scale(2.2); opacity: 0; }
        }
        @media (prefers-reduced-motion: reduce) {
          .stt-nudge, .stt-ripple { animation: none !important; }
        }
      `}</style>

      <button
        type="button"
        onClick={handleClick}
        aria-label={`${label} (${percent}% scrolled)`}
        aria-hidden={!visible}
        tabIndex={visible ? 0 : -1}
        style={{
          bottom: `calc(${bottom}px + env(safe-area-inset-bottom, 0px))`,
        }}
        className={`group fixed right-6 z-[9997] flex size-13  cursor-pointer items-center justify-center rounded-full border-[3px] border-white/30 bg-[#7B00F5] text-white shadow-lg shadow-[#7B00F5]/40 outline-none transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] hover:-translate-y-1 hover:bg-[#6A00D6] hover:shadow-xl hover:shadow-[#7B00F5]/60 focus-visible:ring-2 focus-visible:ring-[#A855F7] focus-visible:ring-offset-2 focus-visible:ring-offset-background active:scale-90 motion-reduce:transition-none sm:right-10 dark:bg-[#8B2CF5] dark:shadow-[#8B2CF5]/40 dark:hover:bg-[#A855F7] ${
          visible
            ? "translate-y-0 scale-100 opacity-100"
            : "pointer-events-none translate-y-4 scale-50 opacity-0"
        }`}
      >
        {/* Pulse ring when the page is fully scrolled */}
        {atEnd && visible && (
          <span
            aria-hidden="true"
            className="absolute inset-0 -z-10 animate-ping rounded-full bg-[#7B00F5]/50 motion-reduce:animate-none"
          />
        )}

        {/* Click ripple */}
        {rippleKey > 0 && (
          <span
            key={rippleKey}
            aria-hidden="true"
            className="stt-ripple pointer-events-none absolute inset-0 -z-10 rounded-full bg-[#7B00F5]"
            style={{ animation: "stt-ripple 0.6s ease-out forwards" }}
          />
        )}

        {/* Tooltip label (desktop only) */}
        <span className="pointer-events-none absolute right-full top-1/2 mr-3 hidden -translate-y-1/2 translate-x-2 whitespace-nowrap rounded-lg bg-foreground px-3 py-1.5 text-sm font-semibold text-background opacity-0 shadow-md transition-all duration-200 group-hover:translate-x-0 group-hover:opacity-100 sm:block">
          {label}
        </span>

        {/* Progress ring */}
        <svg
          className="absolute inset-0 -rotate-90"
          viewBox="0 0 44 44"
          aria-hidden="true"
        >
          <circle
            cx="22"
            cy="22"
            r={RADIUS}
            fill="none"
            strokeWidth="4"
            className="stroke-white/25"
          />
          <circle
            cx="22"
            cy="22"
            r={RADIUS}
            fill="none"
            strokeWidth="4"
            strokeLinecap="round"
            className="stroke-white transition-[stroke-dashoffset] duration-150"
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={CIRCUMFERENCE * (1 - progress)}
          />
        </svg>

        {/* Center: arrow <-> percentage */}
        <span className="relative flex size-full items-center justify-center">
          <span
            className={`flex transition-all duration-300 group-hover:scale-50 group-hover:opacity-0 group-focus-visible:scale-50 group-focus-visible:opacity-0 ${
              launch === "up"
                ? "-translate-y-6 opacity-0"
                : launch === "down"
                  ? "translate-y-6 opacity-0"
                  : "translate-y-0"
            }`}
          >
            <span
              className={`flex transition-transform duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] motion-reduce:transition-none ${
                direction === "down" ? "rotate-180" : "rotate-0"
              }`}
            >
              <ArrowUp
                className={`size-[22px] ${
                  direction === "down" ? "stt-nudge" : ""
                }`}
                style={
                  direction === "down"
                    ? { animation: "stt-nudge 1.6s ease-in-out infinite" }
                    : undefined
                }
                strokeWidth={3.5}
              />
            </span>
          </span>

          <span className="absolute scale-50 text-[13px] font-extrabold tabular-nums opacity-0 transition-all duration-300 group-hover:scale-100 group-hover:opacity-100 group-focus-visible:scale-100 group-focus-visible:opacity-100">
            {percent}%
          </span>
        </span>
      </button>
    </>
  );
}

export function ScrollProgress() {
  const barRef = useRef(null);
  const trackRef = useRef(null);

  useEffect(() => {
    let ticking = false;

    const update = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const p = max > 0 ? Math.min(1, window.scrollY / max) : 0;
      if (barRef.current) barRef.current.style.transform = `scaleX(${p})`;
      if (trackRef.current)
        trackRef.current.style.opacity = p > 0.005 ? "1" : "0";
      ticking = false;
    };

    const onScroll = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(update);
      }
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return (
    <div
      ref={trackRef}
      aria-hidden="true"
      className="pointer-events-none fixed inset-x-0 top-0 z-[9999] h-1.5 bg-[#7B00F5]/15 opacity-0 transition-opacity duration-300"
    >
      <div
        ref={barRef}
        className="h-full origin-left rounded-r-full bg-[#7B00F5] will-change-transform dark:bg-[#A855F7]"
        style={{ transform: "scaleX(0)" }}
      />
    </div>
  );
}
