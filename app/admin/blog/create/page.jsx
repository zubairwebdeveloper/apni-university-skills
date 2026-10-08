// app/admin/blog/create/page.jsx
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { BlogForm } from "@/components/admin/blog/BlogForm";
import { requirePermission } from "@/lib/auth/authorize";
import { PERMISSIONS as P } from "@/lib/constants/permissions";
import { userService } from "@/services/userService";

export const metadata = { title: "New post" };

export default async function CreatePostPage() {
  const user = await requirePermission(P.BLOG_CREATE);
  const profile = await userService.getProfile(user.uid);
  return (<><AdminPageHeader title="New post" description="Saved as a draft. Publish or schedule it from the post page." /><BlogForm defaultAuthor={profile?.displayName ?? ""} /></>);
}


