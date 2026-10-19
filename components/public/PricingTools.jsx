"use client";

import { useEffect, useId, useRef, useState } from "react";
import { animate, motion, useReducedMotion } from "framer-motion";
import { FiRotateCcw } from "react-icons/fi";

import { cn } from "@/lib/utils";

const EASE = [0.22, 1, 0.36, 1];

const FOCUS_RING =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background";

/* ------------------------- payment flow timeline ------------------------ */

export function FlowSteps({ steps = [] }) {
  const reduce = useReducedMotion();

  if (!steps.length) return null;

  // The connecting line assumes four columns, so it only draws for four steps.
  const hasLine = steps.length === 4;

  return (
    <ol className="relative grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-4">
      {/* Line that draws itself between the icons (large screens only) */}
      {hasLine && (
        <div
          aria-hidden="true"
          className="absolute left-[12.5%] right-[12.5%] top-[2.75rem] hidden h-px bg-border lg:block"
        >
          <motion.div
            initial={reduce ? false : { scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 1.2, delay: 0.2, ease: "easeInOut" }}
            className="h-full origin-left bg-primary"
          />
        </div>
      )}

      {steps.map(({ icon: Icon, title, text }, i) => (
        // The motion element only handles the entrance. The hover lift lives
        // on the inner card, because Framer writes its own inline transform
        // and can override CSS translate classes on the same element.
        <motion.li
          key={title}
          initial={reduce ? false : { opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{
            duration: 0.5,
            delay: reduce ? 0 : i * 0.12,
            ease: EASE,
          }}
          className="relative min-w-0"
        >
          <div className="group flex h-full gap-4 rounded-2xl border bg-card p-5 text-left shadow-sm transition-[transform,border-color,box-shadow] duration-300 hover:border-primary/40 hover:shadow-lg motion-safe:hover:-translate-y-1 sm:flex-col sm:items-center sm:text-center">
            <span className="relative grid size-12 shrink-0 place-items-center rounded-xl border border-primary/20 bg-primary/10 text-primary transition-colors duration-300 group-hover:bg-primary group-hover:text-primary-foreground">
              {Icon && <Icon aria-hidden="true" className="size-5" />}
              <span
                aria-hidden="true"
                className="absolute -right-2 -top-2 grid size-5 place-items-center rounded-full bg-highlight text-[10px] font-bold tabular-nums text-highlight-foreground ring-2 ring-card"
              >
                {i + 1}
              </span>
            </span>

            <div className="min-w-0">
              <h3 className="font-sans text-base font-semibold leading-snug tracking-tight">
                <span className="sr-only">Step {i + 1}: </span>
                {title}
              </h3>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                {text}
              </p>
            </div>
          </div>

          {/* Vertical connector to the next card (phones only) */}
          {i < steps.length - 1 && (
            <span
              aria-hidden="true"
              className="absolute left-[2.75rem] top-full h-4 w-px bg-primary/30 sm:hidden"
            />
          )}
        </motion.li>
      ))}
    </ol>
  );
}

/* ----------------------------- budget planner --------------------------- */

const DEFAULTS = { count: 3, price: 50, free: 2 };

const formatNumber = (n) =>
  Number(n).toLocaleString("en-US", { maximumFractionDigits: 2 });

// Counts from the value currently on screen to the new one, so quick
// changes never restart from a stale number.
function AnimatedNumber({ value }) {
  const reduce = useReducedMotion();
  const fromRef = useRef(value);
  const [shown, setShown] = useState(value);

  useEffect(() => {
    if (reduce) {
      fromRef.current = value;
      return;
    }
    const controls = animate(fromRef.current, value, {
      duration: 0.5,
      ease: "easeOut",
      onUpdate: (v) => {
        fromRef.current = v;
        setShown(Math.round(v * 100) / 100);
      },
    });
    return () => controls.stop();
  }, [value, reduce]);

  return (
    <span className="tabular-nums">{formatNumber(reduce ? value : shown)}</span>
  );
}

function SliderField({ id, label, value, min, max, onChange }) {
  return (
    <div>
      <div className="flex items-center justify-between gap-3 text-sm">
        <label htmlFor={id} className="font-medium">
          {label}
        </label>
        <output
          htmlFor={id}
          className="min-w-8 rounded-full border border-primary/20 bg-primary/10 px-2.5 py-0.5 text-center text-sm font-semibold tabular-nums text-primary"
        >
          {value}
        </output>
      </div>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={onChange}
        className={cn(
          "mt-3 h-2 w-full cursor-pointer rounded-full accent-primary",
          FOCUS_RING,
        )}
      />
      <div
        aria-hidden="true"
        className="mt-1.5 flex justify-between text-xs tabular-nums text-muted-foreground"
      >
        <span>{min}</span>
        <span>{max}</span>
      </div>
    </div>
  );
}

export function BudgetPlanner() {
  const uid = useId();
  const [count, setCount] = useState(DEFAULTS.count);
  const [price, setPrice] = useState(DEFAULTS.price);
  const [free, setFree] = useState(DEFAULTS.free);

  const unitPrice = Math.max(Number(price) || 0, 0);
  const paidCount = Math.max(count - free, 0);
  const total = paidCount * unitPrice;

  const changed =
    count !== DEFAULTS.count ||
    free !== DEFAULTS.free ||
    String(price) !== String(DEFAULTS.price);

  function reset() {
    setCount(DEFAULTS.count);
    setFree(DEFAULTS.free);
    setPrice(DEFAULTS.price);
  }

  return (
    <div className="mx-auto grid max-w-4xl gap-5 lg:grid-cols-5">
      {/* Inputs */}
      <div className="min-w-0 space-y-7 rounded-2xl border bg-card p-5 shadow-sm sm:p-6 lg:col-span-3">
        <SliderField
          id={`${uid}-count`}
          label="Courses you want to take"
          value={count}
          min={1}
          max={12}
          onChange={(e) => {
            const v = Number(e.target.value);
            setCount(v);
            setFree((f) => Math.min(f, v));
          }}
        />

        <SliderField
          id={`${uid}-free`}
          label="How many of them are free"
          value={free}
          min={0}
          max={count}
          onChange={(e) => setFree(Number(e.target.value))}
        />

        <div>
          <label htmlFor={`${uid}-price`} className="text-sm font-medium">
            Average price of a paid course
          </label>
          <input
            id={`${uid}-price`}
            type="number"
            inputMode="numeric"
            min={0}
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            onBlur={() => {
              // Tidy up empty or negative entries once the user leaves the field.
              if (price === "" || Number(price) < 0) setPrice(0);
            }}
            className={cn(
              "mt-2 h-11 w-full rounded-xl border bg-background px-3.5 text-sm tabular-nums transition-colors hover:border-primary/30 focus-visible:border-primary/50",
              FOCUS_RING,
            )}
          />
          <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
            Enter any number. Real prices are shown on each course page.
          </p>
        </div>

        {changed && (
          <div className="flex justify-end border-t pt-4">
            <button
              type="button"
              onClick={reset}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-md text-sm font-medium text-primary underline-offset-4 hover:underline",
                FOCUS_RING,
              )}
            >
              <FiRotateCcw aria-hidden="true" className="size-3.5" />
              Reset
            </button>
          </div>
        )}
      </div>

      {/* Result */}
      <div className="relative min-w-0 overflow-hidden rounded-2xl border border-primary/20 bg-primary/5 p-5 shadow-sm sm:p-6 lg:sticky lg:top-24 lg:col-span-2 lg:self-start">
        <p className="text-sm text-muted-foreground">Your estimated total</p>
        <p
          aria-hidden="true"
          className="mt-2 break-words font-serif text-4xl font-semibold tracking-tight text-primary sm:text-5xl"
        >
          <AnimatedNumber value={total} />
        </p>
        {/* Screen readers get one clear sentence instead of an animating number */}
        <p role="status" aria-live="polite" className="sr-only">
          Estimated total {formatNumber(total)}, one time, for {paidCount} paid{" "}
          {paidCount === 1 ? "course" : "courses"}.
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          one time, for {paidCount} paid{" "}
          {paidCount === 1 ? "course" : "courses"}
        </p>

        <dl className="mt-5 space-y-2.5 border-t border-primary/15 pt-4 text-sm">
          <div className="flex justify-between gap-3">
            <dt className="text-muted-foreground">Paid courses</dt>
            <dd className="font-medium tabular-nums">
              {paidCount} &times; {formatNumber(unitPrice)}
            </dd>
          </div>
          <div className="flex justify-between gap-3">
            <dt className="text-muted-foreground">Free courses</dt>
            <dd className="font-medium tabular-nums">{free}</dd>
          </div>
          <div className="flex justify-between gap-3">
            <dt className="text-muted-foreground">Monthly fees</dt>
            <dd className="font-medium">None</dd>
          </div>
          <div className="flex justify-between gap-3">
            <dt className="text-muted-foreground">Subscription needed</dt>
            <dd className="font-medium">No</dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
