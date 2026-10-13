"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import { createPortal } from "react-dom";
import { ArrowDown, ArrowUp } from "lucide-react";
import { cn } from "@/lib/utils";

const ACCENT = "#eb0aa0"; // ring / border / progress accent
const ICON_COLOR = "#ffffff"; // arrow color
const TEXT_COLOR = "#ffffff"; // label / tooltip text color
const GRAY = "#374151"; // circle background (gray-700)
const GRAY_HOVER = "#4b5563"; // circle background on hover (gray-600)

const noopSubscribe = () => () => {};

function useIsClient() {
  return useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false,
  );
}

function findScrollParent(node) {
  let el = node?.parentElement;

  while (el && el !== document.body && el !== document.documentElement) {
    const overflowY = getComputedStyle(el).overflowY;

    if (
      ["auto", "scroll", "overlay"].includes(overflowY) &&
      el.scrollHeight > el.clientHeight + 1
    ) {
      return el;
    }

    el = el.parentElement;
  }

  return null;
}

export function ScrollToTop({
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
  const loggedRef = useRef(false);

  const updateProgress = useCallback(() => {
    frameRef.current = 0;

    let el = scrollerRef.current;

    if (!el?.isConnected) {
      el = null;

      const root = document.scrollingElement || document.documentElement;

      if (root.scrollHeight - window.innerHeight <= 50) {
        el = findScrollParent(anchorRef.current);
      }

      scrollerRef.current = el;
    }

    const root = document.scrollingElement || document.documentElement;

    const scrollable = el
      ? Math.max(el.scrollHeight - el.clientHeight, 0)
      : Math.max(root.scrollHeight - window.innerHeight, 0);

    const scrollY = el
      ? Math.max(el.scrollTop, 0)
      : Math.max(window.scrollY || root.scrollTop || 0, 0);

    const ratio =
      scrollable > 0 ? Math.min(Math.max(scrollY / scrollable, 0), 1) : 0;

    const percentage = Math.round(ratio * 100);

    if (ringRef.current) {
      ringRef.current.style.strokeDashoffset = String(100 - ratio * 100);
    }

    if (barRef.current) {
      barRef.current.style.transform = `scaleX(${ratio})`;
    }

    if (lastProgressRef.current !== percentage) {
      lastProgressRef.current = percentage;
      setProgress(percentage);
    }

    setAtTop(scrollY <= 2);
    setAtEnd(scrollable > 0 && ratio >= 0.985);

    setVisible(scrollable > 100 && (!hideAtTop || scrollY > threshold));

    if (debug && !loggedRef.current) {
      loggedRef.current = true;
      console.info("[ScrollToTop] Tracking:", el || "window");
    }
  }, [debug, hideAtTop, threshold]);

  useEffect(() => {
    if (!mounted) return;

    frameRef.current = 0;

    const schedule = () => {
      if (!frameRef.current) {
        frameRef.current = window.requestAnimationFrame(updateProgress);
      }
    };

    const handleScroll = (event) => {
      const target = event.target;

      const isRoot =
        target === document ||
        target === document.documentElement ||
        target === document.body;

      if (isRoot) {
        scrollerRef.current =
          target === document.body &&
          window.scrollY === 0 &&
          document.body.scrollTop > 0
            ? document.body
            : null;
      } else if (
        target instanceof HTMLElement &&
        target.scrollHeight - target.clientHeight > 200 &&
        target.clientHeight >= window.innerHeight * 0.5
      ) {
        scrollerRef.current = target;
      } else {
        return;
      }

      schedule();
    };

    schedule();

    const interval = window.setInterval(schedule, 500);

    document.addEventListener("scroll", handleScroll, {
      capture: true,
      passive: true,
    });

    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule, { passive: true });
    window.addEventListener("pageshow", schedule);

    return () => {
      window.clearInterval(interval);

      document.removeEventListener("scroll", handleScroll, true);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      window.removeEventListener("pageshow", schedule);

      if (frameRef.current) {
        window.cancelAnimationFrame(frameRef.current);
        frameRef.current = 0;
      }

      if (timerRef.current) {
        window.clearTimeout(timerRef.current);
      }
    };
  }, [mounted, updateProgress]);

  // ONE button, ONE circle, dynamic direction.
  // Top/upper page = down. Lower page/footer = up.
  const direction = atEnd || (!atTop && progress >= 50) ? "up" : "down";

  const isUp = direction === "up";
  const Icon = isUp ? ArrowUp : ArrowDown;
  const accent = ACCENT;

  const go = useCallback(() => {
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    const root = document.scrollingElement || document.documentElement;

    const el = scrollerRef.current;

    const targetDirection = atEnd || (!atTop && progress >= 50) ? "up" : "down";

    const targetTop = targetDirection === "up" ? 0 : Infinity;
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
      }, 650);
    } else {
      setLaunch(false);
    }

    if (el?.isConnected) {
      el.scrollTo({
        top: targetTop === 0 ? 0 : el.scrollHeight - el.clientHeight,
        behavior,
      });
    }

    window.scrollTo({
      top: targetTop === 0 ? 0 : root.scrollHeight,
      behavior,
    });

    if (targetDirection === "up") {
      onScrollToTop?.();
    } else {
      onScrollToBottom?.();
    }
  }, [atEnd, atTop, progress, onScrollToTop, onScrollToBottom]);

  const handlePointerMove = useCallback((event) => {
    if (
      event.pointerType !== "mouse" ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return;
    }

    const el = buttonRef.current;
    if (!el) return;

    const rect = el.getBoundingClientRect();
    if (!rect.width || !rect.height) return;

    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;

    el.style.setProperty("--tilt-x", `${-y * 14}deg`);
    el.style.setProperty("--tilt-y", `${x * 14}deg`);
  }, []);

  const resetTilt = useCallback(() => {
    const el = buttonRef.current;
    if (!el) return;

    el.style.setProperty("--tilt-x", "0deg");
    el.style.setProperty("--tilt-y", "0deg");
  }, []);

  if (!mounted) {
    return (
      <span ref={anchorRef} aria-hidden="true" style={{ display: "none" }} />
    );
  }

  const anchor = (
    <span ref={anchorRef} aria-hidden="true" style={{ display: "none" }} />
  );

  const ui = (
    <>
      <style>{`
        @keyframes st-circle-in {
          from {
            transform: scale(.72) rotate(-24deg);
            opacity: 0;
          }
          to {
            transform: scale(1) rotate(0);
            opacity: 1;
          }
        }

        @keyframes st-icon-up {
          0% { transform: translateY(0); opacity: 1; }
          45% { transform: translateY(-12px); opacity: 0; }
          46% { transform: translateY(12px); opacity: 0; }
          100% { transform: translateY(0); opacity: 1; }
        }

        @keyframes st-icon-down {
          0% { transform: translateY(0); opacity: 1; }
          45% { transform: translateY(12px); opacity: 0; }
          46% { transform: translateY(-12px); opacity: 0; }
          100% { transform: translateY(0); opacity: 1; }
        }

        @keyframes st-ripple {
          0% { transform: scale(.6); opacity: .8; }
          100% { transform: scale(2.25); opacity: 0; }
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
          cursor: pointer;
          transform:
            perspective(600px)
            rotateX(var(--tilt-x))
            rotateY(var(--tilt-y));
          transform-style: preserve-3d;
          background: ${GRAY};
          box-shadow: 0 6px 18px rgba(0,0,0,.35);
          animation: st-circle-in .45s cubic-bezier(.2,.8,.2,1) both;
          transition:
            transform .22s ease,
            border-color .22s ease,
            box-shadow .25s ease,
            background .22s ease;
        }

        .st-circle:hover {
          border-color: ${ACCENT};
          background: ${GRAY_HOVER};
          box-shadow: 0 8px 22px rgba(0,0,0,.4);
        }

        .st-circle:active {
          transform: perspective(600px) scale(.94);
        }

        .st-circle-depth {
          transform: translateZ(12px);
        }

        .st-circle-icon-up {
          animation: st-icon-up .55s ease-in-out;
        }

        .st-circle-icon-down {
          animation: st-icon-down .55s ease-in-out;
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
          .st-circle:active {
            animation: none !important;
            transition: none !important;
            transform: none !important;
          }

          .st-circle-icon-up,
          .st-circle-icon-down,
          .st-circle-ripple,
          .st-circle-particle {
            animation: none !important;
          }
        }
      `}</style>

      {showTopBar && (
        <div
          aria-hidden="true"
          className="pointer-events-none fixed inset-x-0 top-0 z-[9998] h-1 bg-white/5"
        >
          <div
            ref={barRef}
            className="h-full origin-left"
            style={{ background: ACCENT, transform: "scaleX(0)" }}
          />
        </div>
      )}

      <div
        className="fixed z-[9999] flex flex-col items-center gap-2"
        style={{
          bottom: `calc(${bottom}px + env(safe-area-inset-bottom, 0px))`,
          [side === "left" ? "left" : "right"]: 20,
          opacity: visible ? 1 : 0,
          transform: visible ? "translateY(0)" : "translateY(12px)",
          pointerEvents: visible ? "auto" : "none",
          transition: "opacity .25s ease, transform .25s ease",
        }}
        onMouseEnter={() => setTooltipOpen(true)}
        onMouseLeave={() => setTooltipOpen(false)}
        onFocusCapture={() => setTooltipOpen(true)}
        onBlurCapture={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget)) {
            setTooltipOpen(false);
          }
        }}
      >
        {showLabel && visible && (
          <span
            className="rounded-full border px-3 py-1.5 text-xs font-extrabold tabular-nums tracking-wide shadow-xl"
            style={{
              borderColor: `${accent}80`,
              background: GRAY,
              color: TEXT_COLOR,
            }}
          >
            {progress}%
          </span>
        )}

        <div className="relative" style={{ width: size, height: size }}>
          {/* Soft outer ring */}
          <span
            aria-hidden="true"
            className="pointer-events-none absolute -inset-1 rounded-full border"
            style={{ borderColor: `${accent}55` }}
          />

          <button
            ref={buttonRef}
            type="button"
            onClick={go}
            onPointerMove={handlePointerMove}
            onPointerLeave={resetTilt}
            aria-label={
              isUp
                ? `Scroll to top, ${progress}% down the page`
                : `Scroll to bottom, ${progress}% down the page`
            }
            aria-hidden={!visible}
            tabIndex={visible ? 0 : -1}
            title={isUp ? "Back to top" : "Scroll to bottom"}
            className={cn(
              "st-circle group relative flex size-full cursor-pointer items-center justify-center rounded-full border-2 text-white outline-none",
              "focus-visible:ring-2 focus-visible:ring-offset-4 focus-visible:ring-offset-[#09090f]",
            )}
            style={{
              borderColor: `${accent}B3`,
              "--tw-ring-color": ACCENT,
            }}
          >
            {/* Circular scroll progress */}
            <svg
              aria-hidden="true"
              viewBox="0 0 64 64"
              className="pointer-events-none absolute inset-0 size-full -rotate-90 overflow-visible"
            >
              <circle
                cx="32"
                cy="32"
                r="28"
                fill="none"
                stroke="rgba(255,255,255,.07)"
                strokeWidth="2"
              />
              <circle
                ref={ringRef}
                cx="32"
                cy="32"
                r="28"
                fill="none"
                stroke={accent}
                strokeWidth="2.5"
                strokeLinecap="round"
                pathLength="100"
                strokeDasharray="100"
                strokeDashoffset="100"
              />
            </svg>

            {/* Click ripple */}
            {launch && (
              <span
                key={`ripple-${burstKey}`}
                aria-hidden="true"
                className="st-circle-ripple pointer-events-none absolute inset-2 rounded-full border-2"
                style={{ borderColor: accent }}
              />
            )}

            {/* Tiny particles */}
            {launch && (
              <span
                key={`particles-${burstKey}`}
                aria-hidden="true"
                className="pointer-events-none absolute left-1/2 top-1/2"
              >
                {Array.from({ length: 8 }, (_, i) => {
                  const angle = (i / 8) * Math.PI * 2;
                  const distance = 26;

                  return (
                    <span
                      key={i}
                      className="st-circle-particle absolute -ml-1 -mt-1 size-2 rounded-full"
                      style={{
                        background: accent,
                        "--px": `${Math.cos(angle) * distance}px`,
                        "--py": `${Math.sin(angle) * distance}px`,
                      }}
                    />
                  );
                })}
              </span>
            )}

            <span className="st-circle-depth relative flex flex-col items-center justify-center">
              <Icon
                key={direction}
                aria-hidden="true"
                strokeWidth={2.8}
                className={cn(
                  "size-6 transition-colors duration-200 group-hover:scale-110",
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
                "pointer-events-none absolute top-1/2 z-10 -translate-y-1/2 whitespace-nowrap rounded-xl border px-3.5 py-2 shadow-2xl",
                "transition-[opacity,transform] duration-200",
                "motion-reduce:transition-none",
                side === "left" ? "left-full ml-3" : "right-full mr-3",
                tooltipOpen && visible
                  ? "translate-y-[-50%] opacity-100"
                  : "translate-y-[-45%] opacity-0",
              )}
              style={{
                borderColor: `${accent}55`,
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
      {anchor}
      {createPortal(ui, document.body)}
    </>
  );
}

export default ScrollToTop;
