// components/student/AvatarUploader.jsx
"use client";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ImageUpload } from "@/components/shared/ImageUpload";
import { updateAvatar } from "@/app/actions/student";

export function AvatarUploader({ uid, photoURL, initial }) {
  const router = useRouter();
  return (
    <ImageUpload
      folder={`users/${uid}/avatar`}
      currentUrl={photoURL}
      fallbackText={initial}
      onUploaded={async (url) => {
        const res = await updateAvatar(url);
        if (!res.ok) return toast.error(res.error);
        toast.success("Photo updated");
        router.refresh();
      }}
    />
  );
}

