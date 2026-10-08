// app/admin/notifications/create/page.jsx
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { NotificationForm } from "@/components/admin/notifications/NotificationForm";
import { requirePermission } from "@/lib/auth/authorize";
import { PERMISSIONS as P } from "@/lib/constants/permissions";
import { courseAdminRepository } from "@/repositories/admin/courseAdminRepository";
export default async function CreateNotificationPage() {
  await requirePermission(P.NOTIFICATIONS_CREATE);
  const courses = await courseAdminRepository.list({
    status: "published",
    limit: 100,
    sort: "name-asc",
  });
  return (
    <>
      <AdminPageHeader title="New notification" />
      <NotificationForm courses={courses.items} />
    </>
  );
}

