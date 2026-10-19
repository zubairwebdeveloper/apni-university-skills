"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Check, Copy } from "lucide-react";
import { toast } from "sonner";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// Small client button: copies the admin's email to the clipboard.
export function CopyEmailButton({ email, className }) {
  const reduce = useReducedMotion();
  const [copied, setCopied] = useState(false);
  const timer = useRef(null);

  useEffect(() => () => clearTimeout(timer.current), []);

  async function copy() {
    try {
      await navigator.clipboard.writeText(email);
      setCopied(true);
      toast.success("Email copied");
      clearTimeout(timer.current);
      timer.current = setTimeout(() => setCopied(false), 1800);
    } catch {
      toast.error("Couldn't copy the email");
    }
  }

  return (
    <button
      type="button"
      onClick={copy}
      className={cn(
        buttonVariants({ variant: "outline", size: "sm" }),
        "cursor-pointer gap-1.5 bg-background/60 backdrop-blur-sm transition-colors active:scale-95 motion-reduce:active:scale-100",
        copied && "border-[rgb(var(--ea-a))]/30 text-[rgb(var(--ea-a))]",
        className,
      )}
    >
      <AnimatePresence initial={false} mode="wait">
        {copied ? (
          <motion.span
            key="copied"
            initial={reduce ? false : { opacity: 0, scale: 0.7 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.7 }}
            transition={{ duration: 0.15 }}
            className="grid place-items-center"
          >
            <Check aria-hidden="true" className="size-4" />
          </motion.span>
        ) : (
          <motion.span
            key="copy"
            initial={reduce ? false : { opacity: 0, scale: 0.7 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.7 }}
            transition={{ duration: 0.15 }}
            className="grid place-items-center"
          >
            <Copy aria-hidden="true" className="size-4" />
          </motion.span>
        )}
      </AnimatePresence>
      {copied ? "Copied" : "Copy email"}
      <span role="status" className="sr-only">
        {copied ? "Email copied" : ""}
      </span>
    </button>
  );
}
