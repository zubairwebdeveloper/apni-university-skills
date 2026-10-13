"use client";

/* Snake scrollbar
   - The native scrollbar is hidden (see the CSS in the answer) and a small snake takes its place.
   - The snake's head shows where you are on the page, its body slithers, it speeds up while you scroll,
     and its tongue flicks. Click the track to jump, drag the head to scroll, or use the keyboard.
   - Drawn on a <canvas> with its own animation loop, so scrolling never re-renders React.
   - The loop stops after 2.5 s of inactivity, and reduced-motion users get a calm, static snake. */

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";

const PINK = [239, 7, 162];
const VIOLET = [124, 58, 237];

const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const smooth = (u) => {
  const x = clamp(u, 0, 1);
  return x * x * (3 - 2 * x);
};
const mix = (t, alpha = 1) => {
  const c = PINK.map((p, i) => Math.round(p + (VIOLET[i] - p) * t));
  return `rgba(${c[0]},${c[1]},${c[2]},${alpha})`;
};

/* ---------- What the snake scrolls: the page, or one element ---------- */

function pageScroller() {
  const root = document.documentElement;
  return {
    get: () => ({
      top: window.scrollY,
      max: root.scrollHeight - window.innerHeight,
      view: window.innerHeight,
    }),
    set: (top, smoothly) =>
      window.scrollTo({ top, behavior: smoothly ? "smooth" : "instant" }),
    subscribe: (cb) => {
      window.addEventListener("scroll", cb, { passive: true });
      window.addEventListener("resize", cb);
      const ro = new ResizeObserver(cb);
      ro.observe(document.body);
      return () => {
        window.removeEventListener("scroll", cb);
        window.removeEventListener("resize", cb);
        ro.disconnect();
      };
    },
  };
}

function elementScroller(el, axis = "y") {
  if (!el) return null;
  const x = axis === "x";
  return {
    get: () => ({
      top: x ? el.scrollLeft : el.scrollTop,
      max: x
        ? el.scrollWidth - el.clientWidth
        : el.scrollHeight - el.clientHeight,
      view: x ? el.clientWidth : el.clientHeight,
    }),
    set: (pos, smoothly) =>
      el.scrollTo({
        [x ? "left" : "top"]: pos,
        behavior: smoothly ? "smooth" : "instant",
      }),
    subscribe: (cb) => {
      el.addEventListener("scroll", cb, { passive: true });
      const ro = new ResizeObserver(cb);
      const watch = () => {
        ro.disconnect();
        ro.observe(el);
        Array.from(el.children).forEach((c) => ro.observe(c));
      };
      watch();
      const mo = new MutationObserver(() => {
        watch();
        cb();
      });
      mo.observe(el, { childList: true });
      return () => {
        el.removeEventListener("scroll", cb);
        ro.disconnect();
        mo.disconnect();
      };
    },
  };
}

/* ---------- The snake ---------- */

const SIZES = {
  page: {
    R: 5.4,
    amp: 9,
    pad: 16,
    minLen: 46,
    maxFrac: 0.42,
    waves: 2.1,
    n: 54,
  },
  mini: {
    R: 2.7,
    amp: 3.4,
    pad: 8,
    minLen: 22,
    maxFrac: 0.3,
    waves: 2.4,
    n: 26,
  },
};

function SnakeTrack({
  getScroller,
  mini = false,
  horizontal = false,
  label,
  className,
  onMeasure,
}) {
  const wrapRef = useRef(null);
  const canvasRef = useRef(null);
  const onMeasureRef = useRef(onMeasure);
  onMeasureRef.current = onMeasure;

  useEffect(() => {
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    const scroller = getScroller();
    if (!wrap || !canvas || !scroller) return;

    const ctx = canvas.getContext("2d");
    const reduceMq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const cfg = mini ? SIZES.mini : SIZES.page;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    const st = { p: 0, target: 0, max: 0, hover: false, drag: false };
    let W = 0;
    let H = 0;
    let raf = 0;
    let running = false;
    let last = 0;
    let lastActive = 0;
    let time = 0;
    let phase = 0;
    let speed = 0;
    let first = true;

    const resize = () => {
      /* offset sizes ignore the CSS rotation used by the horizontal snake */
      const w = wrap.offsetWidth;
      const h = wrap.offsetHeight;
      if (!w || !h || (w === W && h === H)) return;
      W = w;
      H = h;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const draw = () => {
      if (!W || !H) return;
      const { R, amp, pad, minLen, maxFrac, waves, n } = cfg;
      const cx = W / 2;
      ctx.clearRect(0, 0, W, H);

      /* Dotted track */
      const tg = ctx.createLinearGradient(0, pad, 0, H - pad);
      tg.addColorStop(0, mix(0, 0.28));
      tg.addColorStop(1, mix(1, 0.28));
      ctx.strokeStyle = tg;
      ctx.lineWidth = mini ? 1.2 : 1.6;
      ctx.lineCap = "round";
      ctx.setLineDash([1, mini ? 5 : 6]);
      ctx.beginPath();
      ctx.moveTo(cx, pad);
      ctx.lineTo(cx, H - pad);
      ctx.stroke();
      ctx.setLineDash([]);

      /* Body path: a sine wave that travels from the head back to the tail */
      const travel = Math.max(1, H - 2 * pad - minLen);
      const headY = pad + minLen + st.p * travel;
      const maxLen = H * maxFrac * (1 + speed * 0.18);
      const len = Math.min(maxLen, headY - pad);
      const a = amp * (0.6 + 0.4 * speed);

      const pts = [];
      for (let i = 0; i <= n; i++) {
        const t = i / n;
        const env = 0.2 + 0.8 * (1 - t * t);
        pts.push({
          t,
          x: cx + Math.sin(phase + t * waves * Math.PI * 2) * a * env,
          y: headY - len + t * len,
          r: R * (0.16 + 0.84 * smooth(t / 0.55)),
        });
      }

      /* Scales: overlapping circles, tail to head */
      for (let i = 0; i < n; i++) {
        const p = pts[i];
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = mix(p.t);
        ctx.fill();
        ctx.lineWidth = 0.6;
        ctx.strokeStyle = "rgba(0,0,0,0.12)";
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(p.x - p.r * 0.28, p.y - p.r * 0.1, p.r * 0.42, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(255,255,255,0.16)";
        ctx.fill();

        if (!mini && i > 0 && i % 5 === 0 && p.t > 0.18) {
          ctx.beginPath();
          ctx.moveTo(p.x, p.y - p.r * 0.55);
          ctx.lineTo(p.x + p.r * 0.5, p.y);
          ctx.lineTo(p.x, p.y + p.r * 0.55);
          ctx.lineTo(p.x - p.r * 0.5, p.y);
          ctx.closePath();
          ctx.fillStyle = "rgba(255,255,255,0.26)";
          ctx.fill();
        }
      }

      /* Head, eyes and tongue (drawn pointing along the body's direction) */
      const hp = pts[n];
      const pp = pts[n - 1];
      const ang = Math.atan2(hp.y - pp.y, hp.x - pp.x) - Math.PI / 2;
      const hw = R * 1.22;
      const hl = R * 1.55;

      ctx.save();
      ctx.translate(hp.x, hp.y);
      ctx.rotate(ang);

      let tl = 0;
      if (!reduceMq.matches) {
        const cyc = time % 2.6;
        if (cyc < 0.45) tl = Math.sin((cyc / 0.45) * Math.PI) * R * 2;
        if (speed > 0.25)
          tl = Math.max(tl, Math.abs(Math.sin(time * 16)) * R * 1.5);
      }
      if (tl > 0.5) {
        const y0 = hl * 1.15;
        const y1 = y0 + tl;
        ctx.strokeStyle = "#f43f5e";
        ctx.lineWidth = mini ? 0.9 : 1.3;
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.moveTo(0, y0);
        ctx.lineTo(0, y1);
        ctx.moveTo(0, y1);
        ctx.lineTo(-tl * 0.28, y1 + tl * 0.3);
        ctx.moveTo(0, y1);
        ctx.lineTo(tl * 0.28, y1 + tl * 0.3);
        ctx.stroke();
      }

      const hg = ctx.createLinearGradient(0, -hl, 0, hl);
      hg.addColorStop(0, mix(0.9));
      hg.addColorStop(1, mix(1));
      ctx.beginPath();
      ctx.ellipse(0, hl * 0.25, hw, hl, 0, 0, Math.PI * 2);
      ctx.fillStyle = hg;
      ctx.fill();
      ctx.lineWidth = 0.7;
      ctx.strokeStyle = "rgba(0,0,0,0.18)";
      ctx.stroke();

      for (const s of [-1, 1]) {
        ctx.beginPath();
        ctx.arc(s * hw * 0.56, hl * 0.38, R * 0.36, 0, Math.PI * 2);
        ctx.fillStyle = "#ffffff";
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(
          s * hw * 0.56,
          hl * 0.42,
          R * 0.1,
          R * 0.26,
          0,
          0,
          Math.PI * 2,
        );
        ctx.fillStyle = "#111111";
        ctx.fill();
      }
      ctx.restore();
    };

    const frame = (now) => {
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      time += dt;
      const reduce = reduceMq.matches;

      const prev = st.p;
      st.p = reduce
        ? st.target
        : st.p + (st.target - st.p) * (1 - Math.exp(-9 * dt));
      const vel = dt > 0 ? Math.abs(st.p - prev) / dt : 0;
      speed += (Math.min(vel * 5, 1) - speed) * (1 - Math.exp(-6 * dt));
      phase += reduce ? 0 : dt * (2.4 + speed * 16);

      draw();

      const idle =
        now - lastActive > 2500 &&
        Math.abs(st.target - st.p) < 0.0005 &&
        speed < 0.01 &&
        !st.hover &&
        !st.drag;
      wrap.dataset.active = idle ? "false" : "true";

      if (idle || document.hidden) {
        running = false;
        return;
      }
      raf = requestAnimationFrame(frame);
    };

    const wake = () => {
      lastActive = performance.now();
      if (running || document.hidden) return;
      running = true;
      last = performance.now();
      raf = requestAnimationFrame(frame);
    };

    const measure = () => {
      const m = scroller.get();
      st.max = Math.max(0, m.max);
      st.target = st.max > 0 ? clamp(m.top / st.max, 0, 1) : 0;
      if (first) {
        st.p = st.target;
        first = false;
      }
      const scrollable = st.max > 8;
      if (wrap.dataset.scrollable !== String(scrollable)) {
        wrap.dataset.scrollable = String(scrollable);
      }
      if (scrollable) {
        resize();
        wrap.setAttribute("aria-valuenow", String(Math.round(st.target * 100)));
        wake();
      }
      onMeasureRef.current?.();
    };

    /* Pointer: click the track to jump, drag to scroll */
    const pFromEvent = (e) => {
      const r = wrap.getBoundingClientRect();
      const v = horizontal ? e.clientX : e.clientY;
      const start = horizontal ? r.left : r.top;
      const length = horizontal ? r.width : r.height;
      const travel = Math.max(1, length - 2 * cfg.pad - cfg.minLen);
      return clamp((v - start - cfg.pad - cfg.minLen) / travel, 0, 1);
    };
    const onDown = (e) => {
      if (e.button !== 0) return;
      const p = pFromEvent(e);
      st.drag = true;
      try {
        wrap.setPointerCapture(e.pointerId);
      } catch {}
      scroller.set(p * st.max, Math.abs(p - st.p) >= 0.06);
      wake();
      e.preventDefault();
    };
    const onMove = (e) => {
      if (st.drag) scroller.set(pFromEvent(e) * st.max, false);
    };
    const onUp = (e) => {
      st.drag = false;
      try {
        wrap.releasePointerCapture(e.pointerId);
      } catch {}
      wake();
    };
    const onEnter = () => {
      st.hover = true;
      wake();
    };
    const onLeave = () => {
      st.hover = false;
      wake();
    };

    /* Keyboard */
    const onKey = (e) => {
      const m = scroller.get();
      let top = null;
      if (e.key === "ArrowDown" || e.key === "ArrowRight") top = m.top + 60;
      else if (e.key === "ArrowUp" || e.key === "ArrowLeft") top = m.top - 60;
      else if (e.key === "PageDown") top = m.top + m.view * 0.9;
      else if (e.key === "PageUp") top = m.top - m.view * 0.9;
      else if (e.key === "Home") top = 0;
      else if (e.key === "End") top = m.max;
      if (top !== null) {
        e.preventDefault();
        scroller.set(clamp(top, 0, Math.max(0, m.max)), false);
      }
    };

    const onVisible = () => {
      if (!document.hidden) wake();
    };

    wrap.addEventListener("pointerdown", onDown);
    wrap.addEventListener("pointermove", onMove);
    wrap.addEventListener("pointerup", onUp);
    wrap.addEventListener("pointercancel", onUp);
    wrap.addEventListener("pointerenter", onEnter);
    wrap.addEventListener("pointerleave", onLeave);
    wrap.addEventListener("keydown", onKey);
    document.addEventListener("visibilitychange", onVisible);

    const unsubscribe = scroller.subscribe(measure);
    const roWrap = new ResizeObserver(() => {
      resize();
      wake();
    });
    roWrap.observe(wrap);
    measure();

    return () => {
      cancelAnimationFrame(raf);
      running = false;
      unsubscribe();
      roWrap.disconnect();
      wrap.removeEventListener("pointerdown", onDown);
      wrap.removeEventListener("pointermove", onMove);
      wrap.removeEventListener("pointerup", onUp);
      wrap.removeEventListener("pointercancel", onUp);
      wrap.removeEventListener("pointerenter", onEnter);
      wrap.removeEventListener("pointerleave", onLeave);
      wrap.removeEventListener("keydown", onKey);
      document.removeEventListener("visibilitychange", onVisible);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      ref={wrapRef}
      role="scrollbar"
      aria-orientation={horizontal ? "horizontal" : "vertical"}
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      tabIndex={0}
      data-scrollable="false"
      data-active="false"
      className={cn(
        "cursor-grab touch-none select-none rounded-full opacity-40 outline-none transition-opacity duration-500 active:cursor-grabbing",
        "hover:opacity-100 focus-visible:opacity-100 focus-visible:ring-2 focus-visible:ring-[#7c3aed]/50",
        "data-[active=true]:opacity-100 data-[scrollable=false]:hidden",
        className,
      )}
    >
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        className="block size-full [filter:drop-shadow(0_0_6px_rgba(239,7,162,0.35))]"
      />
    </div>
  );
}

/* ---------- 1) The whole page (put it once in your shell) ---------- */

export function SnakeScrollbar({ className }) {
  return (
    <SnakeTrack
      label="Page scroll"
      getScroller={pageScroller}
      className={cn(
        "fixed right-0.5 top-1/2 z-50 hidden h-[min(64dvh,32rem)] w-[34px] -translate-y-1/2 lg:block",
        className,
      )}
    />
  );
}

/* ---------- 2) Any scroll area, e.g. the sidebar (a smaller snake) ---------- */

export function SnakeScrollArea({
  children,
  className,
  innerClassName,
  trackClassName,
  label = "Scroll",
}) {
  const scrollRef = useRef(null);
  const innerRef = useRef(null);

  return (
    <div className={cn("relative flex min-h-0 flex-1 flex-col", className)}>
      <div
        ref={scrollRef}
        className="no-scrollbar min-h-0 flex-1 overflow-y-auto overscroll-contain"
      >
        <div ref={innerRef} className={innerClassName}>
          {children}
        </div>
      </div>
      <SnakeTrack
        mini
        label={label}
        getScroller={() => elementScroller(scrollRef.current)}
        className={cn("absolute inset-y-2 right-0.5 w-[14px]", trackClassName)}
      />
    </div>
  );
}

/* ---------- 3) Automatic: mount ONCE and every scrolling area gets a snake ---------- */

/* Finds every element that really scrolls (computed overflow auto/scroll AND content bigger than the box),
   vertical and horizontal, no matter how it was styled: Tailwind, CSS modules, inline styles.
   Each one gets a snake; its native scrollbar is hidden.
   Opt out:  data-no-snake on the element or any parent.
   Hide its snakes for a while:  data-snake-off on a parent (the sidebar does this while collapsed).
   Radix/shadcn <ScrollArea> viewports are skipped because they draw their own bar. */

const POPUP_SELECTOR =
  '[role="dialog"],[role="menu"],[role="listbox"],[data-radix-popper-content-wrapper],[data-radix-portal]';
const SKIP_SELECTOR =
  "[data-no-snake],[data-snake-overlay],[data-radix-scroll-area-viewport]";
const SKIP_TAGS = new Set([
  "TEXTAREA",
  "INPUT",
  "SELECT",
  "CANVAS",
  "IFRAME",
  "HTML",
  "BODY",
]);

let autoId = 0;

function AutoSnake({ el, axis, both }) {
  const boxRef = useRef(null);
  const scheduleRef = useRef(null);
  const horizontal = axis === "x";

  useEffect(() => {
    const box = boxRef.current;
    if (!box) return;

    const attr = horizontal ? "data-snake-x" : "data-snake-y";
    let raf = 0;
    let on = false;
    box.style.zIndex = el.closest(POPUP_SELECTOR) ? "60" : "45";
    if (horizontal) box.style.transform = "rotate(-90deg)";

    const setOn = (v) => {
      if (v === on) return;
      on = v;
      if (v) el.setAttribute(attr, "");
      else el.removeAttribute(attr);
    };

    const place = () => {
      raf = 0;
      if (!el.isConnected) {
        box.style.display = "none";
        setOn(false);
        return;
      }
      const r = el.getBoundingClientRect();
      const off = el.closest("[data-snake-off],[data-no-snake]");
      const overflow = horizontal
        ? el.scrollWidth - el.clientWidth
        : el.scrollHeight - el.clientHeight;
      const roomOk = horizontal
        ? r.width >= 120 && r.height >= 40
        : r.height >= 80 && r.width >= 60;
      const eligible = !off && overflow > 8 && roomOk;
      const inView =
        r.bottom > 0 &&
        r.top < window.innerHeight &&
        r.right > 0 &&
        r.left < window.innerWidth;

      setOn(eligible);
      if (!(eligible && inView)) {
        box.style.display = "none";
        return;
      }

      /* When both snakes exist they stop short of the shared corner */
      const length = (horizontal ? r.width : r.height) - (both ? 32 : 16);
      box.style.display = "block";
      box.style.width = "14px";
      box.style.height = `${length}px`;
      if (horizontal) {
        const cx = r.left + 8 + length / 2;
        const cy = r.bottom - 9;
        box.style.left = `${cx - 7}px`;
        box.style.top = `${cy - length / 2}px`;
      } else {
        box.style.left = `${r.right - 16}px`;
        box.style.top = `${r.top + 8}px`;
      }
    };

    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(place);
    };
    scheduleRef.current = schedule;

    /* Follow the element while it animates in (dropdowns, drawers, width transitions) */
    const burstUntil = performance.now() + 700;
    const tick = () => {
      place();
      if (performance.now() < burstUntil) requestAnimationFrame(tick);
    };
    tick();

    /* The snake sits beside the area, so forward wheel scrolling to it */
    const onWheel = (e) => {
      e.preventDefault();
      if (horizontal) el.scrollBy({ left: e.deltaX || e.deltaY });
      else el.scrollBy({ top: e.deltaY });
    };
    box.addEventListener("wheel", onWheel, { passive: false });

    window.addEventListener("scroll", schedule, {
      capture: true,
      passive: true,
    });
    window.addEventListener("resize", schedule);
    window.addEventListener("transitionend", schedule, true);
    window.addEventListener("animationend", schedule, true);
    const ro = new ResizeObserver(schedule);
    ro.observe(el);

    return () => {
      cancelAnimationFrame(raf);
      setOn(false);
      box.removeEventListener("wheel", onWheel);
      window.removeEventListener("scroll", schedule, true);
      window.removeEventListener("resize", schedule);
      window.removeEventListener("transitionend", schedule, true);
      window.removeEventListener("animationend", schedule, true);
      ro.disconnect();
    };
  }, [el, horizontal, both]);

  return (
    <div
      ref={boxRef}
      data-snake-overlay=""
      className="pointer-events-none fixed"
      style={{ display: "none" }}
    >
      <SnakeTrack
        mini
        horizontal={horizontal}
        label={horizontal ? "Horizontal scroll" : "Scrollable area"}
        getScroller={() => elementScroller(el, axis)}
        onMeasure={() => scheduleRef.current?.()}
        className="pointer-events-auto absolute inset-0"
      />
    </div>
  );
}

export function SnakeScrollAuto({ page = true, max = 30 }) {
  const [mounted, setMounted] = useState(false);
  const [items, setItems] = useState([]);
  const ids = useRef(new WeakMap());

  useEffect(() => {
    setMounted(true);
    let timer = 0;

    const scan = () => {
      timer = 0;
      if (document.hidden) return;
      const found = [];
      const all = document.body.getElementsByTagName("*");

      for (let i = 0; i < all.length && found.length < max; i++) {
        const el = all[i];
        if (!(el instanceof HTMLElement) || SKIP_TAGS.has(el.tagName)) continue;
        if (!el.clientWidth && !el.clientHeight) continue;

        /* Cheap test first: only boxes whose content is bigger than the box */
        const oy = el.scrollHeight - el.clientHeight > 8;
        const ox = el.scrollWidth - el.clientWidth > 8;
        if (!oy && !ox) continue;
        if (el.closest(SKIP_SELECTOR)) continue;

        const cs = getComputedStyle(el);
        const scrollY =
          oy && (cs.overflowY === "auto" || cs.overflowY === "scroll");
        const scrollX =
          ox && (cs.overflowX === "auto" || cs.overflowX === "scroll");
        if (!scrollY && !scrollX) continue;

        let id = ids.current.get(el);
        if (!id) {
          id = ++autoId;
          ids.current.set(el, id);
        }
        const both = scrollY && scrollX;
        if (scrollY) found.push({ key: `${id}y`, el, axis: "y", both });
        if (scrollX) found.push({ key: `${id}x`, el, axis: "x", both });
      }

      setItems((prev) =>
        prev.length === found.length &&
        prev.every((p, i) => p.key === found[i].key && p.both === found[i].both)
          ? prev
          : found,
      );
    };
    const queue = () => {
      if (!timer) timer = window.setTimeout(scan, 120);
    };

    scan();
    const mo = new MutationObserver(queue);
    mo.observe(document.body, { childList: true, subtree: true });
    window.addEventListener("resize", queue);
    const interval = window.setInterval(queue, 2000);

    return () => {
      mo.disconnect();
      window.removeEventListener("resize", queue);
      window.clearInterval(interval);
      window.clearTimeout(timer);
    };
  }, [max]);

  return (
    <>
      {page && <SnakeScrollbar />}
      {mounted &&
        items.length > 0 &&
        createPortal(
          items.map((it) => (
            <AutoSnake key={it.key} el={it.el} axis={it.axis} both={it.both} />
          )),
          document.body,
        )}
    </>
  );
}
