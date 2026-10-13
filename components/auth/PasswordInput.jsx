"use client";

import { useState } from "react";
import { FiEye, FiEyeOff } from "react-icons/fi";
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
          <FiEyeOff aria-hidden="true" className="size-[18px]" />
        ) : (
          <FiEye aria-hidden="true" className="size-[18px]" />
        )}
      </button>
    </div>
  );
}
