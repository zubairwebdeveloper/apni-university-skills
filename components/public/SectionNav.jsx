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
        className="mx-auto w-full max-w-7xl overflow-x-auto px-4 [scrollbar-width:none] sm:px-6 lg:px-8"
      >
        <ul className="flex min-w-max gap-1 py-2">
          {items.map((it) => {
            const on = active === it.id;
            return (
              <li key={it.id}>
                <a
                  href={`#${it.id}`}
                  data-nav={it.id}
                  aria-current={on ? "true" : undefined}
                  className={`block rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                    on
                      ? "bg-primary text-primary-foreground"
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
      <motion.div
        aria-hidden="true"
        className="absolute inset-x-0 bottom-0 h-0.5 origin-left bg-primary"
        style={{ scaleX: reduce ? 0 : scrollYProgress }}
      />
    </div>
  );
}
