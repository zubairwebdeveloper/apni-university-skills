"use client";

import { useEffect, useState } from "react";
import { animate, motion, useReducedMotion } from "framer-motion";

const EASE = [0.22, 1, 0.36, 1];

/* ------------------------- payment flow timeline ------------------------ */

export function FlowSteps({ steps }) {
  const reduce = useReducedMotion();

  return (
    <ol className="relative grid grid-cols-1 gap-4 sm:grid-cols-4">
      {/* Line that draws itself (desktop only) */}
      <div
        aria-hidden="true"
        className="absolute left-[12.5%] right-[12.5%] top-9 hidden h-px bg-border sm:block"
      >
        <motion.div
          initial={reduce ? false : { scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 1.2, delay: 0.2, ease: "easeInOut" }}
          className="h-full origin-left bg-primary"
        />
      </div>

      {steps.map(({ icon: Icon, title, text }, i) => (
        <motion.li
          key={title}
          initial={reduce ? false : { opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.5, delay: i * 0.12, ease: EASE }}
          className="group relative min-w-0 rounded-2xl border bg-card p-5 text-left transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-lg motion-reduce:transition-none motion-reduce:hover:translate-y-0 sm:text-center"
        >
          <span className="relative grid size-11 place-items-center rounded-xl bg-primary/10 text-primary transition-all duration-300 group-hover:rotate-6 group-hover:bg-primary group-hover:text-primary-foreground motion-reduce:transition-none motion-reduce:group-hover:rotate-0 sm:mx-auto">
            <Icon aria-hidden="true" className="size-5" />
            <span
              aria-hidden="true"
              className="absolute -right-2 -top-2 grid size-5 place-items-center rounded-full bg-highlight text-[10px] font-bold text-highlight-foreground"
            >
              {i + 1}
            </span>
          </span>
          <h3 className="mt-4 font-sans text-base font-semibold">
            <span className="sr-only">Step {i + 1}: </span>
            {title}
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">{text}</p>
        </motion.li>
      ))}
    </ol>
  );
}

/* ----------------------------- budget planner --------------------------- */

function AnimatedNumber({ value }) {
  const reduce = useReducedMotion();
  const [shown, setShown] = useState(value);

  useEffect(() => {
    if (reduce) return;

    const controls = animate(shown, value, {
      duration: 0.5,
      ease: "easeOut",
      onUpdate: (v) => setShown(Math.round(v)),
    });

    return () => controls.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, reduce]);

  const displayValue = reduce ? value : shown;

  return <span>{displayValue.toLocaleString()}</span>;
}

export function BudgetPlanner() {
  const [count, setCount] = useState(3);
  const [price, setPrice] = useState(50);
  const [free, setFree] = useState(2);

  const paidCount = Math.max(count - free, 0);
  const total = paidCount * (Number(price) || 0);

  return (
    <div className="mx-auto grid max-w-4xl gap-5 lg:grid-cols-5">
      <div className="min-w-0 space-y-6 rounded-2xl border bg-card p-5 sm:p-6 lg:col-span-3">
        <div>
          <div className="flex items-center justify-between text-sm">
            <label htmlFor="plan-count" className="font-medium">
              Courses you want to take
            </label>
            <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-sm font-semibold text-primary">
              {count}
            </span>
          </div>
          <input
            id="plan-count"
            type="range"
            min={1}
            max={12}
            value={count}
            onChange={(e) => {
              const v = Number(e.target.value);
              setCount(v);
              setFree((f) => Math.min(f, v));
            }}
            className="mt-3 h-2 w-full cursor-pointer accent-primary"
          />
        </div>

        <div>
          <div className="flex items-center justify-between text-sm">
            <label htmlFor="plan-free" className="font-medium">
              How many of them are free
            </label>
            <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-sm font-semibold text-primary">
              {free}
            </span>
          </div>
          <input
            id="plan-free"
            type="range"
            min={0}
            max={count}
            value={free}
            onChange={(e) => setFree(Number(e.target.value))}
            className="mt-3 h-2 w-full cursor-pointer accent-primary"
          />
        </div>

        <div>
          <label htmlFor="plan-price" className="text-sm font-medium">
            Average price of a paid course
          </label>
          <input
            id="plan-price"
            type="number"
            inputMode="numeric"
            min={0}
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="mt-2 h-10 w-full rounded-md border bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
          <p className="mt-1.5 text-xs text-muted-foreground">
            Enter any number. Real prices are shown on each course page.
          </p>
        </div>
      </div>

      <div className="relative min-w-0 overflow-hidden rounded-2xl border bg-gradient-to-br from-primary/10 via-card to-highlight/20 p-5 sm:p-6 lg:col-span-2">
        <p className="text-sm text-muted-foreground">Your estimated total</p>
        <p className="mt-2 break-words font-serif text-4xl font-semibold text-primary sm:text-5xl">
          <AnimatedNumber value={total} />
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          one time, for {paidCount} paid{" "}
          {paidCount === 1 ? "course" : "courses"}
        </p>

        <dl className="mt-5 space-y-2 border-t pt-4 text-sm">
          <div className="flex justify-between gap-3">
            <dt className="text-muted-foreground">Free courses</dt>
            <dd className="font-medium">{free}</dd>
          </div>
          <div className="flex justify-between gap-3">
            <dt className="text-muted-foreground">Monthly fees</dt>
            <dd className="font-medium">None</dd>
          </div>
          <div className="flex justify-between gap-3">
            <dt className="text-muted-foreground">Cancel anytime needed</dt>
            <dd className="font-medium">No subscription</dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
