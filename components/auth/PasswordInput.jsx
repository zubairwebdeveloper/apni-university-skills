"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Input } from "@/components/ui/input";

export function PasswordInput({ className, type, ...props }) {
  const [show, setShow] = useState(false);

  return (
    <div className="relative w-full min-w-0">
      <Input
        {...props}
        type={show ? "text" : "password"}
        className={`w-full pr-12 ${className ?? ""}`}
      />

      <button
        type="button"
        onClick={() => setShow((current) => !current)}
        aria-label={show ? "Hide password" : "Show password"}
        aria-pressed={show}
        className="absolute right-0 top-1/2 z-10 flex size-10 -translate-y-1/2 cursor-pointer items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        {show ? (
          <EyeOff aria-hidden="true" className="size-[18px]" />
        ) : (
          <Eye aria-hidden="true" className="size-[18px]" />
        )}
      </button>
    </div>
  );
}
