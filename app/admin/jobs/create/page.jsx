// app/admin/jobs/create/page.jsx
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { JobForm } from "@/components/admin/jobs/JobForm";
import { requirePermission } from "@/lib/auth/authorize";
import { PERMISSIONS as P } from "@/lib/constants/permissions";
export const metadata = { title: "Post a job" };
export default async function CreateJobPage() {
  await requirePermission(P.JOBS_CREATE);
  return (<><AdminPageHeader title="Post a job" description="Saved as a draft until you publish it." /><JobForm /></>);
}

