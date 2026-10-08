"use client";
// components/student/MarkReadButton.jsx
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { markNotificationsRead } from "@/app/actions/student";
export function MarkReadButton() {
  const router = useRouter();
  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={async () => {
        const r = await markNotificationsRead();
        r.ok ? router.refresh() : toast.error(r.error);
      }}
    >
      Mark all as read
    </Button>
  );
}
