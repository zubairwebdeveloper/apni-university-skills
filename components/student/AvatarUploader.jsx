// components/student/AvatarUploader.jsx
"use client";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ImageUpload } from "@/components/shared/ImageUpload";
import { updateAvatar } from "@/app/actions/student";

export function AvatarUploader({ uid, photoURL, initial }) {
  const router = useRouter();

  async function handleUploaded(url) {
    try {
      const res = await updateAvatar(url);
      if (!res.ok) return toast.error(res.error);
      toast.success("Photo updated");
      router.refresh();
    } catch {
      toast.error("Couldn't save your photo. Please try again.");
    }
  }

  return (
    <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:items-center sm:gap-5 sm:text-left">
      <div className="shrink-0">
        <ImageUpload
          folder={`users/${uid}/avatar`}
          currentUrl={photoURL}
          fallbackText={initial}
          onUploaded={handleUploaded}
        />
      </div>

      <div className="min-w-0 max-w-sm">
        <h3 className="text-base font-semibold leading-tight tracking-tight">
          Profile photo
        </h3>
        <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
          Add a clear photo so others can recognize you. Your new photo is saved
          as soon as it finishes uploading.
        </p>
      </div>
    </div>
  );
}
