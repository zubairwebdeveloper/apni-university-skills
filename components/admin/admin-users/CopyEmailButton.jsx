"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Copy } from "lucide-react";
import { toast } from "sonner";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// Small client button: copies the admin's email to the clipboard.
export function CopyEmailButton({ email, className }) {
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
        "cursor-pointer bg-background/60 backdrop-blur-sm active:scale-95 motion-reduce:active:scale-100",
        className,
      )}
    >
      {copied ? (
        <Check aria-hidden="true" className="size-4 text-[rgb(var(--ea-a))]" />
      ) : (
        <Copy aria-hidden="true" className="size-4" />
      )}
      {copied ? "Copied" : "Copy email"}
      <span role="status" className="sr-only">
        {copied ? "Email copied" : ""}
      </span>
    </button>
  );
}
