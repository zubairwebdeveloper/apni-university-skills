// components/student/StudentSidebar.jsx
import Link from "next/link";
import { FiBookOpen } from "react-icons/fi";
import { LogoutButton } from "@/components/auth/LogoutButton";
import { StudentNavList } from "./StudentNavList";
import { UserChip } from "./UserChip";
import { SidebarScroll } from "./SidebarScroll";
import { StudyStreak } from "./StudyStreak";
import { SidebarProgress, SidebarPromo, SidebarTip } from "./SidebarExtras";

// `stats` optional hai: { total, active, completed }
// Dene par progress card dikhta hai, warna "Free courses" promo card.
export function StudentSidebar({ person, stats }) {
  const year = new Date().getFullYear();

  return (
    <aside
      aria-label="Student sidebar"
      className="sticky top-0 hidden h-100  flex-col overflow-hidden border-r bg-background lg:flex"
    >
      {/* Halka rangeen glow (sirf decoration) */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-48 bg-gradient-to-b from-[#ef07a2]/[0.07] via-[#7c3aed]/[0.03] to-transparent"
      />

      {/* Header */}
      <div className="group relative flex h-16 shrink-0 items-center gap-3 border-b px-5">
        <span
          aria-hidden="true"
          className="grid size-9 shrink-0 place-items-center rounded-xl text-white shadow-sm transition-transform duration-300 group-hover:-rotate-6 group-hover:scale-105"
          style={{ background: "linear-gradient(135deg, #ef07a2, #7c3aed)" }}
        >
          <FiBookOpen className="size-[18px]" />
        </span>
        <div className="min-w-0 leading-tight">
          <h2 className="truncate text-base font-bold">Student Dashboard</h2>
          <p className="truncate text-xs text-muted-foreground">
            Apni University
          </p>
        </div>
        <span
          aria-hidden="true"
          className="absolute inset-x-0 -bottom-px h-px bg-gradient-to-r from-[#ef07a2] via-[#7c3aed] to-transparent"
        />
      </div>

      {/* Scroll area: nav + widgets */}
      <SidebarScroll>
        <div className="space-y-5 p-3 ">
          <StudentNavList />
          <StudyStreak />
          {stats ? <SidebarProgress {...stats} /> : <SidebarPromo />}
          <SidebarTip />
        </div>
      </SidebarScroll>

      {/* Footer */}
      <div className="space-y-2 border-t bg-background/80 p-3 backdrop-blur">
        <UserChip person={person} />
        <LogoutButton className="w-full" />
        <div className="flex items-center justify-between px-1 pt-1 text-xs text-muted-foreground">
          <Link href="/faq" className="transition-colors hover:text-foreground">
            Help
          </Link>
          <Link
            href="/contact"
            className="transition-colors hover:text-foreground"
          >
            Contact
          </Link>
          <span>&copy; {year}</span>
        </div>
      </div>
    </aside>
  );
}
