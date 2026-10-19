"use client";

import { useEffect, useState } from "react";
import { motion, useReducedMotion, useScroll } from "framer-motion";

/** Sticky in-page navigation with scroll-spy and a page progress bar. */
export function SectionNav({ items }) {
  const [active, setActive] = useState(items[0]?.id);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll();

  useEffect(() => {
    let raf = 0;
    const update = () => {
      raf = 0;
      let current = items[0]?.id;
      for (const it of items) {
        const el = document.getElementById(it.id);
        if (el && el.getBoundingClientRect().top <= 170) current = it.id;
      }
      setActive(current);
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [items]);

  useEffect(() => {
    document
      .querySelector(`[data-nav="${active}"]`)
      ?.scrollIntoView({ inline: "center", block: "nearest" });
  }, [active]);

  return (
    <div className="sticky top-16 z-30 border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/70">
      <nav
        aria-label="On this page"
        className="relative mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8"
      >
        {/* Edge fades hint that the row scrolls, without clipping focus rings */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 left-4 w-8 bg-gradient-to-r from-background to-transparent sm:left-6 lg:left-8"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 right-4 w-8 bg-gradient-to-l from-background to-transparent sm:right-6 lg:right-8"
        />

        <ul className="flex min-w-max gap-1 overflow-x-auto py-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {items.map((it) => {
            const on = active === it.id;
            return (
              <li key={it.id} className="relative">
                {on && (
                  <motion.span
                    aria-hidden="true"
                    layoutId={reduce ? undefined : "section-nav-pill"}
                    className="absolute inset-0 rounded-full bg-primary"
                    transition={{ type: "spring", stiffness: 420, damping: 32 }}
                  />
                )}
                <a
                  href={`#${it.id}`}
                  data-nav={it.id}
                  aria-current={on ? "true" : undefined}
                  className={`relative block rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background ${
                    on
                      ? "text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {it.label}
                </a>
              </li>
            );
          })}
        </ul>
      </nav>
      <div className="relative h-0.5 bg-border/60">
        <motion.div
          aria-hidden="true"
          className="absolute inset-y-0 left-0 w-full origin-left bg-primary"
          style={{ scaleX: reduce ? 0 : scrollYProgress }}
        />
      </div>
    </div>
  );
}
