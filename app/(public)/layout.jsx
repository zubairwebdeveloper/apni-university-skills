import { AnnouncementBar } from "@/components/layout/AnnouncementBar";
import Link from "next/link";
export default function PublicLayout({ children }) {
  return (
    <>
      <Link
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground"
      >
        Skip to content
      </Link>
      <AnnouncementBar />

      <main id="main">{children}</main>
    </>
  );
}

