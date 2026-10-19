import { cookies } from "next/headers";
import { requireUser } from "@/lib/auth/session";
import { userService } from "@/services/userService";
import { StudentSidebar } from "@/components/student/StudentSidebar";
import { StudentHeader } from "@/components/student/StudentHeader";
import { SidebarProvider } from "@/components/student/SidebarContext";
import { StudentShell } from "@/components/student/StudentShell";

export const metadata = {
  title: { default: "Dashboard", template: "%s | Apni University" },
  robots: { index: false, follow: false },
};

export default async function StudentLayout({ children }) {
  const user = await requireUser();

  const profile = await userService.ensureProfile(
    user.uid,
    user.email,
    user.name,
    user.photoURL,
  );

  const cookieStore = await cookies();
  const defaultOpen = cookieStore.get("student-sidebar")?.value !== "0";

  const person = {
    name: profile?.displayName || user.email,
    email: user.email,
    photoURL: profile?.photoURL ?? null,
  };

  return (
    <SidebarProvider defaultOpen={defaultOpen}>
      <a
        href="#student-content"
        className="sr-only z-[100] rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-lg focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      >
        Skip to main content
      </a>

      <StudentShell
        sidebar={<StudentSidebar person={person} />}
        header={<StudentHeader person={person} />}
      >
        <div
          id="student-content"
          tabIndex={-1}
          className="mx-auto w-full min-w-0 max-w-7xl px-4 py-6 outline-none sm:px-6 lg:px-8 lg:py-8"
        >
          {children}
        </div>
      </StudentShell>
    </SidebarProvider>
  );
}
