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
  const profile = await userService.getProfile(user.uid);
  const cookieStore = await cookies();
  const defaultOpen = cookieStore.get("student-sidebar")?.value !== "0";

  const person = {
    name: profile?.displayName || user.email,
    email: user.email,
    photoURL: profile?.photoURL ?? null,
  };

  return (
    <SidebarProvider defaultOpen={defaultOpen}>
      <StudentShell
        sidebar={<StudentSidebar person={person} />}
        header={<StudentHeader person={person} />}
      >
        {children}
      </StudentShell>
    </SidebarProvider>
  );
}
