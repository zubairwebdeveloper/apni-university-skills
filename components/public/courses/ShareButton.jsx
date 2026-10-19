// components/public/courses/ShareButton.jsx
"use client";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Check, Share2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function ShareButton({ url, title, label = "Share this course" }) {
  const reduce = useReducedMotion();
  const [copied, setCopied] = useState(false);
  const timer = useRef(null);

  useEffect(() => () => clearTimeout(timer.current), []);

  async function share() {
    try {
      if (navigator.share) await navigator.share({ title, url });
      else {
        await navigator.clipboard.writeText(url);
        toast.success("Link copied to clipboard");

        // Show the confirmation on the button itself for a moment.
        setCopied(true);
        clearTimeout(timer.current);
        timer.current = setTimeout(() => setCopied(false), 2000);
      }
    } catch (e) {
      if (e?.name !== "AbortError") toast.error("Couldn't share this link");
    }
  }

  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      className={cn(
        "w-full transition-colors",
        copied
          ? "text-emerald-600 hover:text-emerald-600 dark:text-emerald-400 dark:hover:text-emerald-400"
          : "text-muted-foreground hover:text-foreground",
      )}
      onClick={share}
    >
      <span className="grid size-4 place-items-center">
        <AnimatePresence mode="wait" initial={false}>
          <motion.span
            key={copied ? "copied" : "share"}
            initial={reduce ? false : { scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={reduce ? undefined : { scale: 0.5, opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="grid place-items-center"
          >
            {copied ? (
              <Check className="size-4" aria-hidden="true" />
            ) : (
              <Share2 className="size-4" aria-hidden="true" />
            )}
          </motion.span>
        </AnimatePresence>
      </span>
      {copied ? "Link copied" : label}
      <span className="sr-only" role="status" aria-live="polite">
        {copied ? "Link copied to clipboard" : ""}
      </span>
    </Button>
  );
}
