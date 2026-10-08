"use client";
import { useState } from "react";
import Link from "next/link";
import { FiX } from "react-icons/fi";
import { Button } from "@/components/ui/button";
import { siteConfig } from "@/config/site";

export function AnnouncementBar() {
  const [open, setOpen] = useState(true);
  if (!open) return null;
  const { text, cta, href } = siteConfig.announcement;
  return (
    <div className="bg-foreground text-background">
      <div className="mx-auto flex max-w-7xl items-center justify-center gap-3 px-4 py-2 text-sm">
        <p className="text-center">
          {text}{" "}
          <Link
            href={href}
            className="font-medium underline underline-offset-4 hover:no-underline"
          >
            {cta}
          </Link>
        </p>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="size-7 shrink-0 text-background hover:bg-background/10 hover:text-background"
          onClick={() => setOpen(false)}
          aria-label="Dismiss announcement"
        >
          <FiX aria-hidden="true" />
        </Button>
      </div>
    </div>
  );
}

