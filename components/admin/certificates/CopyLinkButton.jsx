// components/admin/certificates/CopyLinkButton.jsx
"use client";
import { useState } from "react";
import { FiCheck, FiCopy } from "react-icons/fi";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

// `value` may be a full URL or a site-relative path (it is made absolute in the browser)
export function CopyLinkButton({ value, label = "Copy link" }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    const text = value.startsWith("/")
      ? `${window.location.origin}${value}`
      : value;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast.success("Link copied.");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Couldn't copy. Select the link and copy it manually.");
    }
  }

  return (
    <Button type="button" variant="outline" size="sm" onClick={copy}>
      {copied ? <FiCheck aria-hidden="true" /> : <FiCopy aria-hidden="true" />}
      {copied ? "Copied" : label}
    </Button>
  );
}
