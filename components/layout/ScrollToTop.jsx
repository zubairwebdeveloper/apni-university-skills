"use client";

import {
  memo,
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import { createPortal } from "react-dom";
import { ArrowDown, ArrowUp } from "lucide-react";
import { cn } from "@/lib/utils";

/* -------------------------------------------------------
   Theme
------------------------------------------------------- */

const ACCENT = "#eb0aa0";
const ICON_COLOR = "#ffffff";
const TEXT_COLOR = "#ffffff";
const GRAY = "#374151";
const GRAY_HOVER = "#4b5563";

const noopSubscribe = () => () => {};
const getClientSnapshot = () => true;
const getServerSnapshot = () => false;

function useIsClient() {
  return useSyncExternalStore(
    noopSubscribe,
    getClientSnapshot,
    getServerSnapshot,
  );
}

/* -------------------------------------------------------
   Helpers
------------------------------------------------------- */

function findScrollParent(node) {
  let element = node?.parentElement;

  while (
    element &&
    element !== document.body &&
    element !== document.documentElement
  ) {
    const overflowY = window.getComputedStyle(element).overflowY;

    if (
      ["auto", "scroll", "overlay"].includes(overflowY) &&
      element.scrollHeight > element.clientHeight + 1
    ) {
      return element;
    }

    element = element.parentElement;
  }

  return null;
}

function getScrollMetrics(element) {
  const root = document.scrollingElement || document.documentElement;

  const scroller = element?.isConnected ? element : null;

  const scrollable = scroller
    ? Math.max(scroller.scrollHeight - scroller.clientHeight, 0)
    : Math.max(root.scrollHeight - window.innerHeight, 0);

  const scrollY = scroller
    ? Math.max(scroller.scrollTop, 0)
    : Math.max(window.scrollY || root.scrollTop || 0, 0);

  const ratio =
    scrollable > 0 ? Math.min(Math.max(scrollY / scrollable, 0), 1) : 0;

  return {
    scrollable,
    scrollY,
    ratio,
    percentage: Math.round(ratio * 100),
    atTop: scrollY <= 2,
    atEnd: scrollable > 0 && ratio >= 0.985,
  };
}

function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/* -------------------------------------------------------
   Scroll to top / bottom
------------------------------------------------------- */

export const ScrollToTop = memo(function ScrollToTop({
  side = "right",
  bottom = 24,
  showPercent = true,
  showTopBar = false,
  showLabel = false,
  hideAtTop = false,
  threshold = 160,
  size = 58,
  debug = false,
  onScrollToTop,
  onScrollToBottom,
}) {
  const mounted = useIsClient();

  const [visible, setVisible] = useState(false);
  const [progress, setProgress] = useState(0);
  const [atTop, setAtTop] = useState(true);
  const [atEnd, setAtEnd] = useState(false);
  const [launch, setLaunch] = useState(false);
  const [burstKey, setBurstKey] = useState(0);
  const [tooltipOpen, setTooltipOpen] = useState(false);

  const anchorRef = useRef(null);
  const buttonRef = useRef(null);
  const ringRef = useRef(null);
  const barRef = useRef(null);

  const scrollerRef = useRef(null);
  const frameRef = useRef(0);
  const timerRef = useRef(null);
  const lastProgressRef = useRef(-1);
  const lastVisibleRef = useRef(null);
  const lastAtTopRef = useRef(null);
  const lastAtEndRef = useRef(null);
  const loggedRef = useRef(false);

  /* -----------------------------------------------------
     Track scroll position
  ----------------------------------------------------- */

  const updateProgress = useCallback(() => {
    frameRef.current = 0;

    if (!anchorRef.current?.isConnected) return;

    let scroller = scrollerRef.current;

    if (scroller && !scroller.isConnected) {
      scrollerRef.current = null;
      scroller = null;
    }

    // Fall back to an ancestor scroll container for short
    // document layouts with an independently scrolling page.
    if (!scroller) {
      const root = document.scrollingElement || document.documentElement;
      const documentScrollable = root.scrollHeight - window.innerHeight;

      if (documentScrollable <= 50) {
        scroller = findScrollParent(anchorRef.current);
        scrollerRef.current = scroller;
      }
    }

    const metrics = getScrollMetrics(scroller);
    const shouldShow =
      metrics.scrollable > 100 && (!hideAtTop || metrics.scrollY > threshold);

    if (ringRef.current) {
      ringRef.current.style.strokeDashoffset = String(
        100 - metrics.ratio * 100,
      );
    }

    if (barRef.current) {
      barRef.current.style.transform = `scaleX(${metrics.ratio})`;
    }

    if (lastProgressRef.current !== metrics.percentage) {
      lastProgressRef.current = metrics.percentage;
      setProgress(metrics.percentage);
    }

    if (lastAtTopRef.current !== metrics.atTop) {
      lastAtTopRef.current = metrics.atTop;
      setAtTop(metrics.atTop);
    }

    if (lastAtEndRef.current !== metrics.atEnd) {
      lastAtEndRef.current = metrics.atEnd;
      setAtEnd(metrics.atEnd);
    }

    if (lastVisibleRef.current !== shouldShow) {
      lastVisibleRef.current = shouldShow;
      setVisible(shouldShow);

      if (!shouldShow) {
        setTooltipOpen(false);
      }
    }

    if (debug && !loggedRef.current) {
      loggedRef.current = true;
      console.info("[ScrollToTop] Tracking:", scroller || "document");
    }
  }, [debug, hideAtTop, threshold]);

  const scheduleUpdate = useCallback(() => {
    if (frameRef.current) return;

    frameRef.current = window.requestAnimationFrame(updateProgress);
  }, [updateProgress]);

  /* -----------------------------------------------------
     Event listeners — no polling interval
  ----------------------------------------------------- */

  useEffect(() => {
    if (!mounted) return;

    const handleScroll = (event) => {
      const target = event.target;

      if (
        target === document ||
        target === document.documentElement ||
        target === document.body
      ) {
        // Keep an existing non-window scroller if the document
        // also dispatches scroll events.
        if (!scrollerRef.current?.isConnected) {
          scrollerRef.current = null;
        }
      } else if (
        target instanceof HTMLElement &&
        target.scrollHeight - target.clientHeight > 100 &&
        target.clientHeight >= window.innerHeight * 0.5
      ) {
        scrollerRef.current = target;
      }

      scheduleUpdate();
    };

    const handleResize = () => {
      const current = scrollerRef.current;

      if (current && !current.isConnected) {
        scrollerRef.current = null;
      }

      scheduleUpdate();
    };

    document.addEventListener("scroll", handleScroll, {
      capture: true,
      passive: true,
    });

    window.addEventListener("scroll", scheduleUpdate, {
      passive: true,
    });

    window.addEventListener("resize", handleResize, {
      passive: true,
    });

    window.addEventListener("pageshow", scheduleUpdate);

    scheduleUpdate();

    return () => {
      document.removeEventListener("scroll", handleScroll, true);
      window.removeEventListener("scroll", scheduleUpdate);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("pageshow", scheduleUpdate);

      if (frameRef.current) {
        window.cancelAnimationFrame(frameRef.current);
        frameRef.current = 0;
      }

      if (timerRef.current) {
        window.clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [mounted, scheduleUpdate]);

  /* -----------------------------------------------------
     Dynamic direction
  ----------------------------------------------------- */

  const direction = atEnd || (!atTop && progress >= 50) ? "up" : "down";

  const isUp = direction === "up";
  const Icon = isUp ? ArrowUp : ArrowDown;

  /* -----------------------------------------------------
     Scroll action
  ----------------------------------------------------- */

  const go = useCallback(() => {
    const scroller = scrollerRef.current;
    const reduceMotion = prefersReducedMotion();

    const targetDirection = atEnd || (!atTop && progress >= 50) ? "up" : "down";

    const scrollToTop = targetDirection === "up";
    const behavior = reduceMotion ? "auto" : "smooth";

    setTooltipOpen(false);

    if (!reduceMotion) {
      setLaunch(true);
      setBurstKey((key) => key + 1);

      if (timerRef.current) {
        window.clearTimeout(timerRef.current);
      }

      timerRef.current = window.setTimeout(() => {
        setLaunch(false);
        timerRef.current = null;
      }, 650);
    } else {
      setLaunch(false);
    }

    // Scroll exactly one target: the detected container OR
    // the document, never both for the same click.
    if (scroller?.isConnected) {
      scroller.scrollTo({
        top: scrollToTop ? 0 : scroller.scrollHeight - scroller.clientHeight,
        behavior,
      });
    } else {
      const root = document.scrollingElement || document.documentElement;

      window.scrollTo({
        top: scrollToTop ? 0 : root.scrollHeight,
        behavior,
      });
    }

    if (scrollToTop) {
      onScrollToTop?.();
    } else {
      onScrollToBottom?.();
    }
  }, [atEnd, atTop, progress, onScrollToTop, onScrollToBottom]);

  /* -----------------------------------------------------
     Pointer tilt
  ----------------------------------------------------- */

  const handlePointerMove = useCallback((event) => {
    if (event.pointerType !== "mouse" || prefersReducedMotion()) {
      return;
    }

    const button = buttonRef.current;
    if (!button) return;

    const rect = button.getBoundingClientRect();

    if (!rect.width || !rect.height) return;

    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;

    button.style.setProperty("--tilt-x", `${-y * 10}deg`);
    button.style.setProperty("--tilt-y", `${x * 10}deg`);
  }, []);

  const resetTilt = useCallback(() => {
    const button = buttonRef.current;
    if (!button) return;

    button.style.setProperty("--tilt-x", "0deg");
    button.style.setProperty("--tilt-y", "0deg");
  }, []);

  /* -----------------------------------------------------
     Tooltip accessibility
  ----------------------------------------------------- */

  const handleFocus = useCallback(() => {
    setTooltipOpen(true);
  }, []);

  const handleBlur = useCallback(() => {
    setTooltipOpen(false);
    resetTilt();
  }, [resetTilt]);

  /* -----------------------------------------------------
     SSR-safe render
  ----------------------------------------------------- */

  if (!mounted) {
    return <span ref={anchorRef} aria-hidden="true" className="hidden" />;
  }

  const ui = (
    <>
      <style>{`
        @keyframes st-circle-in {
          from {
            transform: scale(.78);
            opacity: 0;
          }
          to {
            transform: scale(1);
            opacity: 1;
          }
        }

        @keyframes st-icon-up {
          0% { transform: translateY(0); opacity: 1; }
          45% { transform: translateY(-10px); opacity: 0; }
          46% { transform: translateY(10px); opacity: 0; }
          100% { transform: translateY(0); opacity: 1; }
        }

        @keyframes st-icon-down {
          0% { transform: translateY(0); opacity: 1; }
          45% { transform: translateY(10px); opacity: 0; }
          46% { transform: translateY(-10px); opacity: 0; }
          100% { transform: translateY(0); opacity: 1; }
        }

        @keyframes st-ripple {
          0% { transform: scale(.65); opacity: .8; }
          100% { transform: scale(2.1); opacity: 0; }
        }

        @keyframes st-particle {
          from {
            transform: translate(0, 0) scale(1);
            opacity: 1;
          }
          to {
            transform: translate(var(--px), var(--py)) scale(.15);
            opacity: 0;
          }
        }

        .st-circle {
          --tilt-x: 0deg;
          --tilt-y: 0deg;
          background: ${GRAY};
          box-shadow: 0 6px 18px rgba(0,0,0,.24);
          transform:
            perspective(600px)
            rotateX(var(--tilt-x))
            rotateY(var(--tilt-y));
          transform-style: preserve-3d;
          animation: st-circle-in .35s ease-out both;
          transition:
            transform .2s ease,
            border-color .2s ease,
            box-shadow .2s ease,
            background .2s ease;
        }

        .st-circle:hover {
          border-color: ${ACCENT};
          background: ${GRAY_HOVER};
          box-shadow: 0 8px 22px rgba(0,0,0,.32);
        }

        .st-circle:active {
          transform: perspective(600px) scale(.95);
        }

        .st-circle-depth {
          transform: translateZ(8px);
        }

        .st-circle-icon-up {
          animation: st-icon-up .45s ease-in-out;
        }

        .st-circle-icon-down {
          animation: st-icon-down .45s ease-in-out;
        }

        .st-circle-ripple {
          animation: st-ripple .65s ease-out forwards;
        }

        .st-circle-particle {
          animation: st-particle .65s ease-out forwards;
        }

        @media (prefers-reduced-motion: reduce) {
          .st-circle,
          .st-circle:hover,
          .st-circle:active,
          .st-circle-icon-up,
          .st-circle-icon-down,
          .st-circle-ripple,
          .st-circle-particle {
            animation: none !important;
            transition: none !important;
            transform: none !important;
          }
        }
      `}</style>

      {/* Top progress bar */}
      {showTopBar && (
        <div
          aria-hidden="true"
          className="pointer-events-none fixed inset-x-0 top-0 z-[9998] h-1 bg-black/5 dark:bg-white/5"
        >
          <div
            ref={barRef}
            className="h-full origin-left"
            style={{
              background: ACCENT,
              transform: "scaleX(0)",
            }}
          />
        </div>
      )}

      {/* Floating action */}
      <div
        className="fixed z-[9999] flex flex-col items-center gap-2"
        style={{
          bottom: `calc(${bottom}px + env(safe-area-inset-bottom, 0px))`,
          [side === "left" ? "left" : "right"]: 20,
          opacity: visible ? 1 : 0,
          transform: visible ? "translateY(0)" : "translateY(12px)",
          pointerEvents: visible ? "auto" : "none",
          transition: "opacity .22s ease, transform .22s ease",
        }}
        onMouseEnter={() => setTooltipOpen(true)}
        onMouseLeave={() => setTooltipOpen(false)}
        onFocusCapture={handleFocus}
        onBlurCapture={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget)) {
            handleBlur();
          }
        }}
      >
        {showLabel && (
          <span
            aria-hidden="true"
            className="rounded-full border px-3 py-1.5 text-xs font-extrabold tabular-nums tracking-wide shadow-xl"
            style={{
              borderColor: `${ACCENT}80`,
              background: GRAY,
              color: TEXT_COLOR,
            }}
          >
            {progress}%
          </span>
        )}

        <div className="relative" style={{ width: size, height: size }}>
          {/* Outer accent ring */}
          <span
            aria-hidden="true"
            className="pointer-events-none absolute -inset-1 rounded-full border"
            style={{ borderColor: `${ACCENT}55` }}
          />

          <button
            ref={buttonRef}
            type="button"
            onClick={go}
            onPointerMove={handlePointerMove}
            onPointerLeave={resetTilt}
            aria-label={
              isUp
                ? `Scroll to top. ${progress}% page progress`
                : `Scroll to bottom. ${progress}% page progress`
            }
            aria-hidden={!visible}
            tabIndex={visible ? 0 : -1}
            className={cn(
              "st-circle group relative flex size-full",
              "items-center justify-center rounded-full border-2",
              "text-white outline-none",
              "focus-visible:ring-2 focus-visible:ring-offset-4",
              "focus-visible:ring-offset-background",
            )}
            style={{
              borderColor: `${ACCENT}B3`,
              "--tw-ring-color": ACCENT,
            }}
          >
            {/* Progress ring */}
            <svg
              aria-hidden="true"
              viewBox="0 0 64 64"
              className="pointer-events-none absolute inset-0 size-full -rotate-90"
            >
              <circle
                cx="32"
                cy="32"
                r="28"
                fill="none"
                stroke="rgba(255,255,255,.12)"
                strokeWidth="2"
              />

              <circle
                ref={ringRef}
                cx="32"
                cy="32"
                r="28"
                fill="none"
                stroke={ACCENT}
                strokeWidth="2.5"
                strokeLinecap="round"
                pathLength="100"
                strokeDasharray="100"
                strokeDashoffset="100"
              />
            </svg>

            {/* Ripple */}
            {launch && (
              <span
                key={`ripple-${burstKey}`}
                aria-hidden="true"
                className="st-circle-ripple pointer-events-none absolute inset-2 rounded-full border-2"
                style={{ borderColor: ACCENT }}
              />
            )}

            {/* Particles */}
            {launch && (
              <span
                key={`particles-${burstKey}`}
                aria-hidden="true"
                className="pointer-events-none absolute left-1/2 top-1/2"
              >
                {Array.from({ length: 8 }, (_, index) => {
                  const angle = (index / 8) * Math.PI * 2;
                  const distance = 25;

                  return (
                    <span
                      key={index}
                      className="st-circle-particle absolute -ml-1 -mt-1 size-2 rounded-full"
                      style={{
                        background: ACCENT,
                        "--px": `${Math.cos(angle) * distance}px`,
                        "--py": `${Math.sin(angle) * distance}px`,
                      }}
                    />
                  );
                })}
              </span>
            )}

            <span className="st-circle-depth relative flex items-center justify-center">
              <Icon
                key={direction}
                aria-hidden="true"
                strokeWidth={2.8}
                className={cn(
                  "size-6 transition-transform duration-200",
                  "group-hover:scale-110",
                  launch &&
                    (isUp ? "st-circle-icon-up" : "st-circle-icon-down"),
                )}
                style={{ color: ICON_COLOR }}
              />
            </span>
          </button>

          {/* Tooltip */}
          {showPercent && (
            <div
              role="tooltip"
              aria-hidden={!tooltipOpen || !visible}
              className={cn(
                "pointer-events-none absolute top-1/2 z-10",
                "-translate-y-1/2 whitespace-nowrap rounded-xl border",
                "px-3.5 py-2 shadow-2xl",
                "transition-[opacity,transform] duration-200",
                "motion-reduce:transition-none",
                side === "left" ? "left-full ml-3" : "right-full mr-3",
                tooltipOpen && visible ? "opacity-100" : "opacity-0",
              )}
              style={{
                borderColor: `${ACCENT}55`,
                background: GRAY,
              }}
            >
              <div
                className="text-xs font-extrabold tracking-wide"
                style={{ color: TEXT_COLOR }}
              >
                {isUp ? "BACK TO TOP" : "GO TO BOTTOM"}
              </div>

              <div
                className="mt-1 text-[11px] font-bold"
                style={{ color: TEXT_COLOR }}
              >
                {progress}% completed
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );

  return (
    <>
      <span ref={anchorRef} aria-hidden="true" className="hidden" />

      {createPortal(ui, document.body)}
    </>
  );
});

ScrollToTop.displayName = "ScrollToTop";

export default ScrollToTop;
