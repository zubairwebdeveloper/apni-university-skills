// components/student/SidebarScroll.jsx
"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

// Scroll hone wala area: upar/neeche jahan aur content ho wahan halka fade dikhata hai.
export function SidebarScroll({ children, className }) {
  const scrollRef = useRef(null);
  const innerRef = useRef(null);
  const [top, setTop] = useState(false);
  const [bottom, setBottom] = useState(false);

  const update = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setTop(el.scrollTop > 4);
    setBottom(el.scrollTop + el.clientHeight < el.scrollHeight - 4);
  }, []);

  useEffect(() => {
    update();
    if (typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(update);
    if (scrollRef.current) ro.observe(scrollRef.current);
    if (innerRef.current) ro.observe(innerRef.current);
    return () => ro.disconnect();
  }, [update]);

  const fade =
    "pointer-events-none absolute inset-x-0 h-8 from-background to-transparent transition-opacity duration-200";

  return (
    <div className="relative min-h-0 flex-1">
      <div
        ref={scrollRef}
        onScroll={update}
        className={cn(
          "h-full overflow-y-auto [scrollbar-width:thin]",
          className,
        )}
      >
        <div ref={innerRef}>{children}</div>
      </div>
      <div
        aria-hidden="true"
        className={cn(
          fade,
          "top-0 bg-gradient-to-b",
          top ? "opacity-100" : "opacity-0",
        )}
      />
      <div
        aria-hidden="true"
        className={cn(
          fade,
          "bottom-0 bg-gradient-to-t",
          bottom ? "opacity-100" : "opacity-0",
        )}
      />
    </div>
  );
}
