import Link from "next/link";
import { FiAlertOctagon } from "react-icons/fi";
import { Card } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";

export function DangerZone() {
  return (
    <Card id="danger" className="scroll-mt-24 gap-3 border-red-500/30 p-6">
      <h2 className="flex items-center gap-2 text-lg text-red-600">
        <FiAlertOctagon /> Delete account
      </h2>
      <p className="text-sm text-muted-foreground">
        Account delete karne se aapki enrollments, progress aur reviews hat jati
        hain, aur yeh wapas nahi ho sakta. Purchase records tax aur refund
        purposes ke liye kuch muddat tak mehfooz rehte hain.
      </p>
      <div>
        <Link
          href="/contact?subject=Delete%20my%20account"
          className={buttonVariants({ variant: "outline", size: "sm" })}
        >
          Request account deletion
        </Link>
      </div>
    </Card>
  );
}
