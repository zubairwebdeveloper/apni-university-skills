// components/public/courses/ShareButton.jsx
"use client";
import { FiShare2 } from "react-icons/fi";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export function ShareButton({ url, title, label = "Share this course" }) {
  async function share() {
    try {
      if (navigator.share) await navigator.share({ title, url });
      else {
        await navigator.clipboard.writeText(url);
        toast.success("Link copied to clipboard");
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
      className="w-full"
      onClick={share}
    >
      <FiShare2 aria-hidden="true" /> {label}
    </Button>
  );
}

