// components/admin/certificates/CopyLinkButton.jsx
"use client";
import { useEffect, useRef, useState } from "react";
import { FiCheck, FiCopy } from "react-icons/fi";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

// `value` may be a full URL or a site-relative path (it is made absolute in the browser)
export function CopyLinkButton({ value, label = "Copy link" }) {
  const [copied, setCopied] = useState(false);
  const timeoutRef = useRef(null);

  useEffect(() => () => clearTimeout(timeoutRef.current), []);

  async function copy() {
    if (!value) return;
    // Only a single leading slash is a site path; "//host" is already absolute.
    const text =
      value.startsWith("/") && !value.startsWith("//")
        ? `${window.location.origin}${value}`
        : value;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast.success("Link copied.");
      clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Couldn't copy. Select the link and copy it manually.");
    }
  }

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={copy}
      disabled={!value}
      className="min-h-9 hover:border-primary/60"
    >
      {copied ? (
        <FiCheck aria-hidden="true" className="text-primary" />
      ) : (
        <FiCopy aria-hidden="true" />
      )}
      {copied ? "Copied" : label}
    </Button>
  );
}
