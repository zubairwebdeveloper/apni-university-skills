import Link from "next/link";
import { FiEye, FiLock } from "react-icons/fi";
import { Card } from "@/components/ui/card";

export function PrivacyCard() {
  return (
    <Card className="p-5">
      <h3 className="mb-3 text-sm font-semibold">Privacy</h3>
      <ul className="space-y-3 text-sm">
        <li className="flex gap-3">
          <FiEye className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
          <span className="text-muted-foreground">
            Sirf aapka display name aur photo reviews par public hote hain.
          </span>
        </li>
        <li className="flex gap-3">
          <FiLock className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
          <span className="text-muted-foreground">
            Aapka email kabhi public nahi hota.
          </span>
        </li>
      </ul>
      <Link
        href="/privacy"
        className="mt-4 inline-block text-sm font-medium text-primary hover:underline"
      >
        Read privacy policy →
      </Link>
    </Card>
  );
}
