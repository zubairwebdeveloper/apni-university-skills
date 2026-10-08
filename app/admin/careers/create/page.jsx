// app/admin/careers/create/page.jsx
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { CareerForm } from "@/components/admin/careers/CareerForm";
import { requirePermission } from "@/lib/auth/authorize";
import { PERMISSIONS as P } from "@/lib/constants/permissions";
import { categoryAdminRepository } from "@/repositories/admin/categoryAdminRepository";

export const metadata = { title: "New career guide" };

export default async function CreateCareerPage() {
  await requirePermission(P.CAREERS_CREATE);
  return (<><AdminPageHeader title="New career guide" description="Saved as a draft." /><CareerForm categories={await categoryAdminRepository.options()} /></>);
}

