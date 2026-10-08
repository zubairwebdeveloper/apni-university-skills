// app/admin/instructors/create/page.jsx
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { InstructorForm } from "@/components/admin/instructors/InstructorForm";
import { requirePermission } from "@/lib/auth/authorize";
import { PERMISSIONS as P } from "@/lib/constants/permissions";
export const metadata = { title: "Add instructor" };
export default async function CreateInstructorPage() {
  await requirePermission(P.INSTRUCTORS_CREATE);
  return (
    <>
      <AdminPageHeader
        title="Add instructor"
        description="Saved as a draft until you publish."
      />
      <InstructorForm />
    </>
  );
}

