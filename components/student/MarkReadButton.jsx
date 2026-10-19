"use client";
// components/student/MarkReadButton.jsx
import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { FiCheckCircle } from "react-icons/fi";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { markNotificationsRead } from "@/app/actions/student";

export function MarkReadButton() {
  const router = useRouter();
  const [pending, start] = useTransition();

  function handleClick() {
    start(async () => {
      try {
        const r = await markNotificationsRead();
        if (!r.ok) {
          toast.error(r.error);
          return;
        }
        toast.success("All notifications marked as read");
        router.refresh();
      } catch {
        toast.error("Couldn't update your notifications. Please try again.");
      }
    });
  }

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={handleClick}
      disabled={pending}
      aria-busy={pending}
      className="gap-2"
    >
      <FiCheckCircle className="size-4" aria-hidden="true" />
      {pending ? "Marking…" : "Mark all as read"}
    </Button>
  );
}
