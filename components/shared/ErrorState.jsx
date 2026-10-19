// components/shared/ErrorState.jsx
"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { FiAlertTriangle, FiRefreshCw } from "react-icons/fi";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function ErrorState({
  title = "Something went wrong",
  description = "Please try again in a moment.",
  onRetry,
}) {
  const reduce = useReducedMotion();
  const [retrying, setRetrying] = useState(false);

  async function handleRetry() {
    setRetrying(true);
    try {
      await onRetry();
    } finally {
      setRetrying(false);
    }
  }

  return (
    <motion.div
      role="alert"
      initial={reduce ? false : { opacity: 0, y: 10 }}
      animate={reduce ? undefined : { opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="flex flex-col items-center rounded-2xl border border-destructive/25 bg-card px-6 py-12 text-center sm:py-14"
    >
      <span className="grid size-14 place-items-center rounded-full bg-destructive/10 text-destructive ring-8 ring-destructive/5">
        <FiAlertTriangle className="size-6" aria-hidden="true" />
      </span>
      <h3 className="mt-5 text-balance font-serif text-lg font-semibold text-foreground sm:text-xl">
        {title}
      </h3>
      <p className="mt-2 max-w-sm text-pretty text-sm text-muted-foreground sm:text-base">
        {description}
      </p>
      {onRetry && (
        <Button
          type="button"
          size="lg"
          className="mt-6 gap-2"
          onClick={handleRetry}
          disabled={retrying}
        >
          <FiRefreshCw
            aria-hidden="true"
            className={cn("size-4", retrying && "animate-spin")}
          />
          {retrying ? "Retrying…" : "Try again"}
        </Button>
      )}
    </motion.div>
  );
}
