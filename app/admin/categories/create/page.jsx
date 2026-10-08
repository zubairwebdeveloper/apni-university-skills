// app/admin/categories/create/page.jsx
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { CategoryForm } from "@/components/admin/categories/CategoryForm";
import { requirePermission } from "@/lib/auth/authorize";
import { PERMISSIONS as P } from "@/lib/constants/permissions";
export const metadata = { title: "New category" };
export default async function CreateCategoryPage() {
  await requirePermission(P.CATEGORIES_CREATE);
  return (
    <>
      <AdminPageHeader
        title="New category"
        description="It stays a draft until you publish it."
      />
      <CategoryForm />
    </>
  );
}

